import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  Pagination,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  styled,
  Slider,
  Grid,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { keyframes } from '@emotion/react';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import RepeatIcon from '@mui/icons-material/Repeat';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Heatmap from 'react-heatmap-grid';


const apiUrlStem = import.meta.env.VITE_API_URL;
console.log("META ENV: ",import.meta.env);
console.log("API URL STEM",apiUrlStem);
// Animation keyframes
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const AnimatedCard = styled(Card, { shouldForwardProp: (prop) => prop !== 'index' })<{ index?: number }>(({ theme, index = 0 }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  animation: `${fadeInUp} 0.5s ease-out ${index * 0.2}s forwards`,
  opacity: 0,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const StaticSearchForm = styled(Card)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    background: '#fff',
    animation: `${slideIn} 0.4s ease-out`,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
  color: '#fff',
  textAlign: 'center',
  padding: '16px 24px',
  borderTopLeftRadius: '16px',
  borderTopRightRadius: '16px',
  fontWeight: 600,
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  margin: '0 auto',
  padding: '2rem 1rem',
  background: 'linear-gradient(135deg, #f0f4ff 0%, #e6f0fa 100%)',
  borderRadius: '16px',
  [theme.breakpoints.down('sm')]: { padding: '1rem' },
}));

const SearchRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '1rem',
  width: '100%',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '2rem auto',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
}));

const Filters = styled(Box)(({ theme }) => ({
  width: '25%',
  backgroundColor: '#fff',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
}));

interface Airport {
  code: string;
  name: string;
}

interface Flight {
  flightNumber: string;
  airline: { name: string; logoUrl?: string };
  origin: { iataCode: string };
  destination: { iataCode: string };
  departure: string;
  arrival: string;
  duration: number;
  price: number;
}

interface Itinerary {
  flights?: Flight[];
  outbound?: { flights: Flight[] };
  returnTrip?: { flights: Flight[] };
  totalPrice: number;
  totalDuration: number;
}

interface PredictiveData {
  priceTrend: { date: string; price: number }[];
  delayRisk: { probability: number; factors: string[] };
  recommendations: string[];
  optimalDates: { date: string; price: number; risk: number }[];
  quickStats: { avgPrice: number; delayRate: number; demandLevel: string };
}

const airports: Airport[] = [
  { code: 'CID', name: 'The Eastern Iowa Airport' },
  { code: 'DSM', name: 'Des Moines International' },
  { code: 'JFK', name: 'John F. Kennedy International' },
  { code: 'LHR', name: 'London Heathrow' },
  { code: 'YYZ', name: 'Toronto Pearson International' },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport' },
  { code: 'HND', name: 'Tokyo Haneda Airport' },
];

const getHeaders = () => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', '*/*');
  const token = localStorage.getItem('token');
  if (token) headers.append('Authorization', `Bearer ${token}`);
  return headers;
};

const getAirportCode = (airport: { iataCode: string }): string => airport?.iataCode || 'Unknown';
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [departure, setDeparture] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tripType, setTripType] = useState<'round' | 'oneway'>('round');
  const [searchCriterion, setSearchCriterion] = useState<'cheapest' | 'fastest'>('cheapest');
  const [priceRange, setPriceRange] = useState<number[]>([0, 2500]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>(['any']);
  const [error, setError] = useState<string | null>(null);
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [searchResults, setSearchResults] = useState<Itinerary[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFlight, setSelectedFlight] = useState<Itinerary | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [predictiveData, setPredictiveData] = useState<PredictiveData | null>(null);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingPredictive, setLoadingPredictive] = useState(false);
  const flightsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllFlights = async () => {
      setLoadingFlights(true);
      try {
        const response = await fetch(`${apiUrlStem}/api/flights`, { method: 'GET', headers: getHeaders() });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const flights: Flight[] = await response.json();
        setAllFlights(Array.isArray(flights) ? flights : []);
      } catch (error) {
        console.error('Error fetching all flights:', error);
        setError('Failed to load flights.');
      } finally {
        setLoadingFlights(false);
      }
    };
    fetchAllFlights();
  }, []);

  const fetchPredictiveData = useCallback(async () => {
    if (!departure || !destination || !startDate) return;
    setLoadingPredictive(true);
    try {
      const request = {
        departureAirport: departure,
        destinationAirport: destination,
        startDate: startDate.toISOString().split('T')[0],
        endDate: tripType === 'round' && endDate ? endDate.toISOString().split('T')[0] : null,
        userId: user?.id || null,
      };

      const [priceResponse, delayResponse, recommendResponse] = await Promise.all([
        fetch(`${apiUrlStem}/api/flights/predict-price`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(request) }),
        fetch(`${apiUrlStem}/api/flights/predict-delay`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(request) }),
        fetch(`${apiUrlStem}/api/flights/recommend`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(request) }),
      ]);

      if (!priceResponse.ok || !delayResponse.ok || !recommendResponse.ok) throw new Error('Failed to fetch predictive data');
      const priceData = await priceResponse.json();
      const delayData = await delayResponse.json();
      const recommendData = await recommendResponse.json();

      const optimalDates = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: priceData.trend[i]?.price || 0,
        risk: delayData.probability || 0,
      }));

      const quickStats = {
        avgPrice: priceData.trend.reduce((sum: number, d: any) => sum + d.price, 0) / priceData.trend.length,
        delayRate: delayData.probability,
        demandLevel: priceData.trend.some((d: any) => d.price > 1000) ? 'High' : 'Moderate',
      };

      setPredictiveData({
        priceTrend: priceData.trend || [],
        delayRisk: delayData,
        recommendations: recommendData.recommendations || [],
        optimalDates,
        quickStats,
      });
    } catch (error) {
      console.error('Error fetching predictive data:', error);
      setError('Failed to load predictive analytics.');
    } finally {
      setLoadingPredictive(false);
    }
  }, [departure, destination, startDate, endDate, tripType, user]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPredictiveData(), 500);
    return () => clearTimeout(timer);
  }, [fetchPredictiveData]);

  const handleSearch = async () => {
    const request: any = {};
    if (departure) request.startAirport = departure;
    if (destination) request.destinationAirport = destination;
    if (startDate) request.startDate = startDate.toISOString().split('T')[0];
    if (endDate && tripType === 'round') request.endDate = endDate.toISOString().split('T')[0];
    if (searchCriterion) request.filter = searchCriterion;

    try {
      const response = await fetch(`${apiUrlStem}/api/flights/search/route`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const flights = await response.json();
      const flightList = flights.oneWayItineraries || flights.roundTripItineraries || [];
      setSearchResults(flightList);
      setCurrentPage(1);
      setError(null);
    } catch (error) {
      console.error('Error fetching flights:', error);
      setError('Failed to fetch flights.');
    }
  };

  const handleViewDetails = (flight: Itinerary) => {
    setSelectedFlight(flight);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFlight(null);
  };

  const handleSelectFlight = () => {
    if (selectedFlight) navigate('/booking', { state: { flight: selectedFlight } });
    handleCloseModal();
  };

  const filterFlights = useMemo(() => (flights: Itinerary[]) => {
    return flights.filter((flight) => {
      const totalPrice = flight.totalPrice || flight.flights?.reduce((sum: number, f: Flight) => sum + (f.price || 0), 0) || 0;
      const stops = (flight.flights?.length || 1) - 1;
      const airlineMatch = selectedAirlines.length === 0 || selectedAirlines.includes(flight.flights?.[0]?.airline?.name || '');
      const stopsMatch = selectedStops.includes('any') || selectedStops.includes(`${stops}+`) || (stops === 0 && selectedStops.includes('0'));
      const priceMatch = totalPrice >= priceRange[0] && totalPrice <= priceRange[1];
      return airlineMatch && stopsMatch && priceMatch;
    });
  }, [selectedAirlines, selectedStops, priceRange]);

  const getBestFlight = useMemo(() => (flights: Itinerary[]) => {
    if (!flights.length) return null;
    if (searchCriterion === 'cheapest') {
      return flights.reduce((best, current) => (current.totalPrice < best.totalPrice ? current : best), flights[0]);
    }
    return flights.reduce((best, current) => (current.totalDuration < best.totalDuration ? current : best), flights[0]);
  }, [searchCriterion]);

  const filteredFlights = useMemo(() => {
    const baseFlights = searchResults.length > 0 ? searchResults : allFlights.map(flight => ({
      flights: [flight],
      totalPrice: flight.price,
      totalDuration: flight.duration,
    }));
    return filterFlights(baseFlights);
  }, [searchResults, allFlights, filterFlights]);

  const bestFlight = useMemo(() => getBestFlight(filteredFlights), [filteredFlights, getBestFlight]);
  const otherFlights = useMemo(() => bestFlight ? filteredFlights.filter(f => f !== bestFlight) : filteredFlights, [filteredFlights, bestFlight]);
  const totalFlights = otherFlights.length + (bestFlight ? 1 : 0);
  const totalPages = Math.ceil(totalFlights / flightsPerPage);
  const currentFlights = useMemo(() => {
    const startIndex = (currentPage - 1) * flightsPerPage;
    const endIndex = startIndex + flightsPerPage;
    return [...(bestFlight ? [bestFlight] : []), ...otherFlights].slice(startIndex, endIndex);
  }, [bestFlight, otherFlights, currentPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => setCurrentPage(page);
  const handlePriceChange = (event: Event, newValue: number | number[]) => setPriceRange(newValue as number[]);

  return (
    <Box sx={{ width: '100%' }}>
      <SearchContainer>
        <Typography variant="h4" gutterBottom sx={{ color: '#1e3c72', textAlign: 'center' }}>Search Flights</Typography>
        {error && <Typography sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>{error}</Typography>}
        <StaticSearchForm>
          <SearchRow>
            <Autocomplete
              options={airports}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              value={airports.find((airport) => airport.code === departure) || null}
              onChange={(event, newValue) => setDeparture(newValue?.code || null)}
              renderInput={(params) => <TextField {...params} label="From" sx={{ minWidth: '200px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />}
              freeSolo={false}
              clearOnBlur
            />
            <Autocomplete
              options={airports}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              value={airports.find((airport) => airport.code === destination) || null}
              onChange={(event, newValue) => setDestination(newValue?.code || null)}
              renderInput={(params) => <TextField {...params} label="To" sx={{ minWidth: '200px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />}
              freeSolo={false}
              clearOnBlur
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Depart"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                disablePast
                slotProps={{ textField: { sx: { minWidth: '150px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } } } }}
              />
              <DatePicker
                label="Return"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                disablePast
                disabled={tripType === 'oneway'}
                slotProps={{ textField: { sx: { minWidth: '150px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } } } }}
              />
            </LocalizationProvider>
            <FormControl sx={{ minWidth: '150px' }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={searchCriterion}
                onChange={(e) => setSearchCriterion(e.target.value as 'cheapest' | 'fastest')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              >
                <MenuItem value="cheapest">Cheapest</MenuItem>
                <MenuItem value="fastest">Fastest</MenuItem>
              </Select>
            </FormControl>
            <FormControl component="fieldset" sx={{ minWidth: '150px' }}>
              <RadioGroup row value={tripType} onChange={(e) => setTripType(e.target.value as 'round' | 'oneway')}>
                <FormControlLabel value="round" control={<Radio icon={<RepeatIcon />} checkedIcon={<RepeatIcon color="primary" />} />} label="Round Trip" />
                <FormControlLabel value="oneway" control={<Radio icon={<FlightTakeoffIcon />} checkedIcon={<FlightTakeoffIcon color="primary" />} />} label="One Way" />
              </RadioGroup>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ borderRadius: '12px', backgroundColor: '#1e3c72', color: '#fff', fontWeight: 600, padding: '10px 24px', '&:hover': { backgroundColor: '#2a5298', transform: 'scale(1.05)' } }}
            >
              Search
            </Button>
          </SearchRow>
        </StaticSearchForm>
      </SearchContainer>

      {departure && destination && startDate && (
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
          <Typography variant="h5" sx={{ color: '#1e3c72', mb: 2, textAlign: 'center' }}>Predictive Analytics Dashboard</Typography>
          {loadingPredictive ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
          ) : predictiveData ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <AnimatedCard index={0}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#1e3c72', mb: 1 }}>Price Trend (Next 30 Days)</Typography>
                    <LineChart width={500} height={200} data={predictiveData.priceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="price" stroke="#2a5298" />
                    </LineChart>
                    <Typography variant="body2" sx={{ color: '#333', mt: 1 }}>
                      {predictiveData.priceTrend[0].price > predictiveData.priceTrend[5]?.price ? 'Prices may drop in 5 days.' : 'Prices may rise soon. Book now!'}
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <AnimatedCard index={1}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#1e3c72', mb: 1 }}>Delay Risk</Typography>
                    <Typography variant="body1" sx={{ color: predictiveData.delayRisk.probability > 50 ? 'red' : '#333' }}>
                      {predictiveData.delayRisk.probability}% chance of delay
                    </Typography>
                    {predictiveData.delayRisk.factors.length > 0 && (
                      <Typography variant="body2" sx={{ color: '#333', mt: 1 }}>Factors: {predictiveData.delayRisk.factors.join(', ')}</Typography>
                    )}
                  </CardContent>
                </AnimatedCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <AnimatedCard index={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#1e3c72', mb: 1 }}>Recommendations</Typography>
                    {predictiveData.recommendations.length > 0 ? predictiveData.recommendations.map((rec, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: '#333', mb: 0.5 }}>- {rec}</Typography>
                    )) : (
                      <Typography variant="body2" sx={{ color: '#333' }}>No recommendations available.</Typography>
                    )}
                  </CardContent>
                </AnimatedCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <AnimatedCard index={3}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#1e3c72', mb: 1 }}>Optimal Travel Dates</Typography>
                    <Heatmap
                      xLabels={predictiveData.optimalDates.map(d => d.date.split('-')[2])}
                      yLabels={['Price', 'Risk']}
                      data={[predictiveData.optimalDates.map(d => d.price / 100), predictiveData.optimalDates.map(d => d.risk)]}
                      cellStyle={(background: string, value: number, min: number, max: number) => ({
                        background: `rgb(42, 82, 152, ${1 - (value - min) / (max - min)})`,
                        color: '#fff',
                        fontSize: '12px',
                      })}
                      cellRender={(value: number) => value && `${Math.round(value * 100)}`}
                    />
                  </CardContent>
                </AnimatedCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <AnimatedCard index={4}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#1e3c72', mb: 1 }}>Quick Stats</Typography>
                    <Typography variant="body2" sx={{ color: '#333' }}>Avg Price: ${predictiveData.quickStats.avgPrice.toFixed(2)}</Typography>
                    <Typography variant="body2" sx={{ color: '#333' }}>Delay Rate: {predictiveData.quickStats.delayRate}%</Typography>
                    <Typography variant="body2" sx={{ color: '#333' }}>Demand: {predictiveData.quickStats.demandLevel}</Typography>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            </Grid>
          ) : (
            <Typography sx={{ textAlign: 'center', color: '#333' }}>No predictive data available.</Typography>
          )}
        </Box>
      )}

      <Box sx={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem', padding: '0 1rem' }}>
        <Filters>
          <Typography variant="h6" sx={{ color: '#1e3c72', mb: 1 }}>Filters</Typography>
          <Typography>Showing {totalFlights} results</Typography>
          <Typography variant="h6" sx={{ color: '#1e3c72', mt: 2, mb: 1 }}>Stops</Typography>
          <FormControlLabel control={<Checkbox checked={selectedStops.includes('any')} onChange={(e) => setSelectedStops(e.target.checked ? ['any'] : [])} />} label="Any" />
          <FormControlLabel control={<Checkbox checked={selectedStops.includes('1+')} onChange={(e) => setSelectedStops(prev => e.target.checked ? [...prev, '1+'] : prev.filter(s => s !== '1+'))} />} label="1+ stops" />
          <Typography variant="h6" sx={{ color: '#1e3c72', mt: 2, mb: 1 }}>Airlines</Typography>
          {['United Airlines', 'American Airlines', 'Air Canada'].map(airline => (
            <FormControlLabel
              key={airline}
              control={<Checkbox checked={selectedAirlines.includes(airline)} onChange={(e) => setSelectedAirlines(prev => e.target.checked ? [...prev, airline] : prev.filter(a => a !== airline))} />}
              label={airline}
            />
          ))}
          <Typography variant="h6" sx={{ color: '#1e3c72', mt: 2, mb: 1 }}>Price Range</Typography>
          <Slider value={priceRange} onChange={handlePriceChange} valueLabelDisplay="auto" min={0} max={2500} sx={{ width: '100%', color: '#1e3c72' }} />
          <Typography variant="body2" sx={{ color: '#1e3c72' }}>${priceRange[0]} - ${priceRange[1]}</Typography>
        </Filters>

        <Box sx={{ width: '75%' }}>
          <SummaryCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: '#1e3c72' }}>Best ○ Cheapest Fastest</Typography>
                <Typography variant="body2" color="textSecondary">Prices may include additional fees</Typography>
              </Box>
            </CardContent>
          </SummaryCard>

          <Typography variant="h5" sx={{ color: '#1e3c72', mt: 2, mb: 1 }}>{searchResults.length > 0 ? 'Search Results' : 'All Flights'}</Typography>
          {loadingFlights ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
          ) : currentFlights.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {currentFlights.map((item, index) => {
                const isRoundTrip = 'outbound' in item;
                const itinerary = isRoundTrip ? item.outbound : item;
                const returnItinerary = isRoundTrip ? item.returnTrip : null;
                const flights = itinerary?.flights || [];

                return (
                  <AnimatedCard key={index}>
                    <CardContent sx={{ padding: '20px' }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ color: '#1e3c72', fontWeight: 600 }}>
                          {flights.length > 1 ? `${flights.length - 1} Stop(s)` : 'Direct'}
                        </Typography>
                      </Box>
                      {flights.map((flight: Flight, flightIndex: number) => (
                        <Box key={flightIndex} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <img
                              alt="Airline logo"
                              src={flight.airline?.logoUrl || 'https://storage.googleapis.com/a1aa/image/4VcAEzxoQM-230CXDEwk09cwNoDAKVw4fxNt-lggcVw.jpg'}
                              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                              onError={(e) => (e.currentTarget.src = 'https://storage.googleapis.com/a1aa/image/4VcAEzxoQM-230CXDEwk09cwNoDAKVw4fxNt-lggcVw.jpg')}
                            />
                            <Box>
                              <Typography variant="h6" sx={{ color: '#1e3c72' }}>{new Date(flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                              <Typography variant="body2" color="textSecondary">{getAirportCode(flight.origin)} · {new Date(flight.departure).toLocaleDateString()}</Typography>
                            </Box>
                            <FlightTakeoffIcon sx={{ color: '#2a5298' }} />
                            <Box>
                              <Typography variant="h6" sx={{ color: '#1e3c72' }}>{new Date(flight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                              <Typography variant="body2" color="textSecondary">{getAirportCode(flight.destination)} · {new Date(flight.arrival).toLocaleDateString()}</Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="textSecondary">{flight.airline?.name || 'Unknown'} ({flight.flightNumber})</Typography>
                        </Box>
                      ))}
                      {returnItinerary && (
                        <>
                          <Typography variant="h6" sx={{ mt: 2, color: '#1e3c72', fontWeight: 600 }}>Return Trip</Typography>
                          {returnItinerary.flights.map((flight: Flight, flightIndex: number) => (
                            <Box key={flightIndex} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <img
                                  alt="Airline logo"
                                  src={flight.airline?.logoUrl || 'https://via.placeholder.com/40'}
                                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40')}
                                />
                                <Box>
                                  <Typography variant="h6" sx={{ color: '#1e3c72' }}>{new Date(flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                  <Typography variant="body2" color="textSecondary">{getAirportCode(flight.origin)} · {new Date(flight.departure).toLocaleDateString()}</Typography>
                                </Box>
                                <FlightTakeoffIcon sx={{ color: '#2a5298' }} />
                                <Box>
                                  <Typography variant="h6" sx={{ color: '#1e3c72' }}>{new Date(flight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                  <Typography variant="body2" color="textSecondary">{getAirportCode(flight.destination)} · {new Date(flight.arrival).toLocaleDateString()}</Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="textSecondary">{flight.airline?.name || 'Unknown'} ({flight.flightNumber})</Typography>
                            </Box>
                          ))}
                        </>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">Outbound Flights:</Typography>
                          {flights.map((flight: Flight, idx: number) => (
                            <Typography key={idx} variant="body2" color="textSecondary">{flight.airline?.name || 'Unknown'} ({flight.flightNumber})</Typography>
                          ))}
                          {returnItinerary && (
                            <>
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Return Flights:</Typography>
                              {returnItinerary.flights.map((flight: Flight, idx: number) => (
                                <Typography key={idx} variant="body2" color="textSecondary">{flight.airline?.name || 'Unknown'} ({flight.flightNumber})</Typography>
                              ))}
                            </>
                          )}
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h5" sx={{ color: '#2a5298', fontWeight: 500 }}>${item.totalPrice}</Typography>
                          <Button
                            variant="contained"
                            onClick={() => handleViewDetails(item)}
                            sx={{ mt: 1, borderRadius: '8px', backgroundColor: '#ffeb3b', color: '#1e3c72', fontWeight: 600, padding: '6px 16px', '&:hover': { backgroundColor: '#ffd700', transform: 'scale(1.05)' } }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </AnimatedCard>
                );
              })}
              <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }} />
            </Box>
          ) : (
            <Typography>No flights available.</Typography>
          )}
        </Box>
      </Box>

      <StyledDialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <StyledDialogTitle>Flight Details</StyledDialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {selectedFlight && (
            <Box>
              {selectedFlight.flights?.map((flight: Flight, index: number) => (
                <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="h6" sx={{ color: '#1e3c72', fontWeight: 600 }}>Leg {index + 1}: {getAirportCode(flight.origin)} to {getAirportCode(flight.destination)}</Typography>
                  <Typography variant="body1" sx={{ color: '#333' }}>Airline: {flight.airline?.name || 'Unknown'} ({flight.flightNumber})</Typography>
                  <Typography variant="body2" color="textSecondary">Depart: {new Date(flight.departure).toLocaleString()}</Typography>
                  <Typography variant="body2" color="textSecondary">Arrive: {new Date(flight.arrival).toLocaleString()}</Typography>
                  <Typography variant="body2" color="textSecondary">Duration: {formatDuration(flight.duration)}</Typography>
                  <Typography variant="body2" sx={{ color: '#2a5298', fontWeight: 500 }}>Price: ${flight.price}</Typography>
                </Box>
              ))}
              {selectedFlight.outbound && (
                <>
                  <Typography variant="h5" sx={{ mt: 2, color: '#1e3c72', fontWeight: 600 }}>Outbound</Typography>
                  {selectedFlight.outbound.flights.map((flight: Flight, index: number) => (
                    <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                      <Typography variant="h6" sx={{ color: '#1e3c72', fontWeight: 600 }}>Leg {index + 1}: {getAirportCode(flight.origin)} to {getAirportCode(flight.destination)}</Typography>
                      <Typography variant="body1" sx={{ color: '#333' }}>Airline: {flight.airline?.name || 'Unknown'} ({flight.flightNumber})</Typography>
                      <Typography variant="body2" color="textSecondary">Depart: {new Date(flight.departure).toLocaleString()}</Typography>
                      <Typography variant="body2" color="textSecondary">Arrive: {new Date(flight.arrival).toLocaleString()}</Typography>
                      <Typography variant="body2" color="textSecondary">Duration: {formatDuration(flight.duration)}</Typography>
                      <Typography variant="body2" sx={{ color: '#2a5298', fontWeight: 500 }}>Price: ${flight.price}</Typography>
                    </Box>
                  ))}
                </>
              )}
              {selectedFlight.returnTrip && (
                <>
                  <Typography variant="h5" sx={{ mt: 2, color: '#1e3c72', fontWeight: 600 }}>Return</Typography>
                  {selectedFlight.returnTrip.flights.map((flight: Flight, index: number) => (
                    <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                      <Typography variant="h6" sx={{ color: '#1e3c72', fontWeight: 600 }}>Leg {index + 1}: {getAirportCode(flight.origin)} to {getAirportCode(flight.destination)}</Typography>
                      <Typography variant="body1" sx={{ color: '#333' }}>Airline: {flight.airline?.name || 'Unknown'} ({flight.flightNumber})</Typography>
                      <Typography variant="body2" color="textSecondary">Depart: {new Date(flight.departure).toLocaleString()}</Typography>
                      <Typography variant="body2" color="textSecondary">Arrive: {new Date(flight.arrival).toLocaleString()}</Typography>
                      <Typography variant="body2" color="textSecondary">Duration: {formatDuration(flight.duration)}</Typography>
                      <Typography variant="body2" sx={{ color: '#2a5298', fontWeight: 500 }}>Price: ${flight.price}</Typography>
                    </Box>
                  ))}
                </>
              )}
              <Typography variant="body1" sx={{ color: '#1e3c72', fontWeight: 600 }}>Total Price: <span style={{ color: '#2a5298' }}>${selectedFlight.totalPrice}</span></Typography>
              <Typography variant="body1" sx={{ color: '#1e3c72', fontWeight: 600 }}>Total Duration: {formatDuration(selectedFlight.totalDuration)}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} color="secondary" sx={{ borderRadius: '8px', padding: '6px 16px' }}>Close</Button>
          <Button
            onClick={handleSelectFlight}
            variant="contained"
            sx={{ borderRadius: '8px', backgroundColor: '#ffeb3b', color: '#1e3c72', fontWeight: 600, padding: '6px 16px', '&:hover': { backgroundColor: '#ffd700', transform: 'scale(1.05)' } }}
          >
            Book Now
          </Button>
        </DialogActions>
      </StyledDialog>
    </Box>
  );
};

export default LandingPage;