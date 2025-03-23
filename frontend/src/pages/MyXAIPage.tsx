import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  styled,
  keyframes,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const apiUrlStem = import.meta.env.VITE_API_URL;
const AnimatedCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)',
  transition: 'transform 0.3s ease',
  animation: `${fadeIn} 0.5s ease-out forwards`,
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '2rem',
  background: 'linear-gradient(135deg, #eef2f7 0%, #ffffff 100%)',
  borderRadius: '16px',
  [theme.breakpoints.down('sm')]: {
    padding: '1rem',
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  padding: '1rem',
  borderRadius: '8px',
  textAlign: 'center',
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

interface DashboardData {
  priceTrends: { labels: string[]; data: number[] };
  delayStats: { labels: string[]; data: number[] };
  quickMetrics: { avgPrice: number; delayRate: number; savings: number };
  optimalDates: { date: string; value: number }[];
}

// Mock API call to simulate fetching price trends
const fetchPriceTrends = async (startAirport: string, destinationAirport: string, tripType: string): Promise<{ data: number }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate a single new price point
  const basePrice = Math.random() * 300 + 400;
  const priceMultiplier = startAirport === 'JFK' && destinationAirport === 'LHR' ? 1.2 : 1.0;
  const newPrice = basePrice * priceMultiplier + (Math.random() - 0.5) * 50;

  return { data: newPrice };
};

// Utility to format timestamp as HH:mm:ss
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

// Initial data for other charts (delay stats, quick metrics, optimal dates)
const initialStaticData = (startAirport: string, destinationAirport: string, tripType: string) => {
  const delayBase = tripType === 'round-trip' ? 25 : 15;
  const delayData = [delayBase + Math.random() * 10, delayBase + Math.random() * 15, delayBase + Math.random() * 20, delayBase + Math.random() * 5];
  const optimalDates = Array.from({ length: 2 }, (_, i) => ({
    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: 50 + Math.random() * 50 * (tripType === 'round-trip' ? 1.5 : 1),
  }));

  return {
    delayStats: { labels: ['Weather', 'Congestion', 'Demand', 'Other'], data: delayData },
    quickMetrics: {
      avgPrice: 0, // Will be updated based on price trends
      delayRate: delayData.reduce((a, b) => a + b, 0) / delayData.length,
      savings: Math.floor(Math.random() * 150) + 50 * (tripType === 'one-way' ? 1.2 : 1),
    },
    optimalDates,
  };
};

const MyXAIPage: React.FC = () => {
  const [startAirport, setStartAirport] = useState('JFK');
  const [destinationAirport, setDestinationAirport] = useState('LHR');
  const [tripType, setTripType] = useState('one-way');
  const [priceTrends, setPriceTrends] = useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  });
  const [delayStatsData, setDelayStatsData] = useState<number[]>(initialStaticData('JFK', 'LHR', 'one-way').delayStats.data);
  const [quickMetrics, setQuickMetrics] = useState(initialStaticData('JFK', 'LHR', 'one-way').quickMetrics);
  const [optimalDates, setOptimalDates] = useState(initialStaticData('JFK', 'LHR', 'one-way').optimalDates);
  const priceChartRef = useRef<ChartJS<'line'> | null>(null);
  const delayChartRef = useRef<ChartJS<'bar'> | null>(null);

  // Configuration for the time window (30 seconds, 3 data points at 10-second intervals)
  const TIME_WINDOW_SECONDS = 30;
  const UPDATE_INTERVAL_SECONDS = 10;
  const DATA_POINTS = TIME_WINDOW_SECONDS / UPDATE_INTERVAL_SECONDS; // 3 data points

  // Initialize price trends with empty data
  useEffect(() => {
    const initialTimestamps = Array.from({ length: DATA_POINTS }, (_, i) => {
      const timestamp = Date.now() - (DATA_POINTS - 1 - i) * UPDATE_INTERVAL_SECONDS * 1000;
      return formatTime(timestamp);
    });
    const initialDataPoints = Array(DATA_POINTS).fill(0); // Initial placeholder data
    setPriceTrends({ labels: initialTimestamps, data: initialDataPoints });
  }, []);

  // Fetch new price data every 10 seconds
  useEffect(() => {
    const fetchAndUpdatePrice = async () => {
      try {
        // Simulate fetching new price data from API
        const newPriceData = await fetchPriceTrends(startAirport, destinationAirport, tripType);

        // Update price trends with new data
        setPriceTrends(prev => {
          const currentTime = Date.now();
          const newLabels = [...prev.labels.slice(1), formatTime(currentTime)]; // Shift labels by 10 seconds
          const newData = [...prev.data.slice(1), newPriceData.data]; // Shift data and append new price

          // Update quick metrics with new average price
          setQuickMetrics(metrics => ({
            ...metrics,
            avgPrice: newData.reduce((a, b) => a + b, 0) / newData.length,
          }));

          return { labels: newLabels, data: newData };
        });

        // Update chart
        if (priceChartRef.current) {
          priceChartRef.current.data.labels = priceTrends.labels;
          priceChartRef.current.data.datasets[0].data = priceTrends.data;
          priceChartRef.current.update();
        }
      } catch (error) {
        console.error('Error fetching price trends:', error);
      }
    };

    // Initial fetch
    fetchAndUpdatePrice();

    // Set up interval for updates every 10 seconds
    const interval = setInterval(fetchAndUpdatePrice, UPDATE_INTERVAL_SECONDS * 1000);

    return () => clearInterval(interval);
  }, [startAirport, destinationAirport, tripType]);

  // Update other charts when trip type changes
  const handleUpdateStaticData = () => {
    const newStaticData = initialStaticData(startAirport, destinationAirport, tripType);
    const newDelayData = newStaticData.delayStats.data;
    const newQuickMetrics = {
      ...newStaticData.quickMetrics,
      avgPrice: priceTrends.data.reduce((a, b) => a + b, 0) / priceTrends.data.length || 0,
    };
    const newOptimalDates = newStaticData.optimalDates;

    setDelayStatsData(newDelayData);
    setQuickMetrics(newQuickMetrics);
    setOptimalDates(newOptimalDates);

    if (delayChartRef.current) {
      delayChartRef.current.data.datasets[0].data = newDelayData;
      delayChartRef.current.update();
    }
  };

  useEffect(() => {
    handleUpdateStaticData();
  }, [startAirport, destinationAirport, tripType]);

  const priceChartData = {
    labels: priceTrends.labels,
    datasets: [
      {
        label: 'Price ($)',
        data: priceTrends.data,
        borderColor: '#2c5282',
        backgroundColor: 'rgba(44, 82, 130, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const delayChartData = {
    labels: ['Weather', 'Congestion', 'Demand', 'Other'],
    datasets: [
      {
        label: 'Delay Factors (%)',
        data: delayStatsData,
        backgroundColor: ['#4caf50', '#f44336', '#9c27b0', '#ffca28'],
        borderColor: ['#4caf50', '#f44336', '#9c27b0', '#ffca28'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f0f4ff' }}>
      <Typography
        variant="h3"
        gutterBottom
        sx={{ color: '#2c3e50', textAlign: 'center', padding: '2rem', fontWeight: 'bold' }}
      >
        My XAI Dashboard
      </Typography>
      <DashboardContainer>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Start Airport</InputLabel>
            <Select value={startAirport} onChange={(e) => setStartAirport(e.target.value as string)} label="Start Airport">
              <MenuItem value="JFK">JFK (New York)</MenuItem>
              <MenuItem value="LAX">LAX (Los Angeles)</MenuItem>
              <MenuItem value="SFO">SFO (San Francisco)</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Destination Airport</InputLabel>
            <Select value={destinationAirport} onChange={(e) => setDestinationAirport(e.target.value as string)} label="Destination Airport">
              <MenuItem value="LHR">LHR (London)</MenuItem>
              <MenuItem value="CDG">CDG (Paris)</MenuItem>
              <MenuItem value="HND">HND (Tokyo)</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Trip Type</InputLabel>
            <Select value={tripType} onChange={(e) => setTripType(e.target.value as string)} label="Trip Type">
              <MenuItem value="one-way">One-Way</MenuItem>
              <MenuItem value="round-trip">Round-Trip</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleUpdateStaticData} sx={{ mt: 1 }}>
            Update Dashboard
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Price Trends Card */}
          <Grid item xs={12} md={6}>
            <AnimatedCard>
              <CardContent sx={{ padding: '1.5rem' }}>
                <Typography variant="h5" sx={{ color: '#2c3e50', mb: 2, fontWeight: 700 }}>
                  Price Trends ({startAirport} to {destinationAirport})
                </Typography>
                <Box sx={{ height: 250, mb: 2 }}>
                  <Line
                    ref={priceChartRef}
                    data={priceChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Real-Time Price Trends (Last 30 Seconds)' },
                      },
                      scales: {
                        x: {
                          title: { display: true, text: 'Time (HH:mm:ss)' },
                        },
                        y: {
                          title: { display: true, text: 'Price ($)' },
                          beginAtZero: false,
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#2e7d32', fontWeight: 600, mb: 1 }}>
                    Insight
                  </Typography>
                  <Typography sx={{ color: '#388e3c' }}>
                    Prices may dip by 10% next week for {tripType}. Book now!
                  </Typography>
                </Box>
              </CardContent>
            </AnimatedCard>
          </Grid>

          {/* Delay Statistics Card */}
          <Grid item xs={12} md={6}>
            <AnimatedCard>
              <CardContent sx={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h5" sx={{ color: '#2c3e50', mb: 2, fontWeight: 700 }}>
                  Delay Statistics
                </Typography>
                <Box sx={{ height: 250, mb: 2 }}>
                  <Bar
                    ref={delayChartRef}
                    data={delayChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Delay Factors' },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#c62828', fontWeight: 600, mb: 1 }}>
                    Alert
                  </Typography>
                  <Typography sx={{ color: '#d32f2f' }}>
                    {quickMetrics.delayRate.toFixed(1)}% delay risk for {tripType}.
                  </Typography>
                </Box>
              </CardContent>
            </AnimatedCard>
          </Grid>

          {/* Bottom Card with Quick Metrics and Optimal Travel Dates */}
          <Grid item xs={12}>
            <AnimatedCard>
              <CardContent sx={{ padding: '1.5rem' }}>
                <Typography variant="h5" sx={{ color: '#2c3e50', mb: 3, fontWeight: 700 }}>
                  Travel Insights
                </Typography>
                <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  {/* Quick Metrics */}
                  <Grid item xs={12} sm={4} md={2.4}>
                    <InfoBox sx={{ backgroundColor: '#e1bee7', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#6a1b9a', fontWeight: 600, mb: 1 }}>
                        Avg Price
                      </Typography>
                      <Typography sx={{ color: '#ab47bc', fontSize: '1.3rem', fontWeight: 700 }}>
                        ${quickMetrics.avgPrice.toFixed(2)}
                      </Typography>
                    </InfoBox>
                  </Grid>
                  <Grid item xs={12} sm={4} md={2.4}>
                    <InfoBox sx={{ backgroundColor: '#b2dfdb', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#00695c', fontWeight: 600, mb: 1 }}>
                        Delay Rate
                      </Typography>
                      <Typography sx={{ color: '#009688', fontSize: '1.3rem', fontWeight: 700 }}>
                        {quickMetrics.delayRate.toFixed(1)}%
                      </Typography>
                    </InfoBox>
                  </Grid>
                  <Grid item xs={12} sm={4} md={2.4}>
                    <InfoBox sx={{ backgroundColor: '#ffccbc', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#bf360c', fontWeight: 600, mb: 1 }}>
                        Savings
                      </Typography>
                      <Typography sx={{ color: '#ef6c00', fontSize: '1.3rem', fontWeight: 700 }}>
                        ${quickMetrics.savings}
                      </Typography>
                    </InfoBox>
                  </Grid>
                  {/* Optimal Travel Dates */}
                  {optimalDates.map((date, index) => (
                    <Grid item xs={12} sm={4} md={2.4} key={index}>
                      <InfoBox sx={{ backgroundColor: index % 2 ? '#f8bbd0' : '#ce93d8', height: '100%' }}>
                        <Typography sx={{ color: '#880e4f', fontWeight: 500 }}>{date.date}</Typography>
                        <Typography sx={{ color: '#ad1457', fontSize: '1.2rem', fontWeight: 600 }}>
                          Value: {date.value.toFixed(1)}
                        </Typography>
                      </InfoBox>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </AnimatedCard>
          </Grid>
        </Grid>
      </DashboardContainer>
    </Box>
  );
};

export default MyXAIPage;