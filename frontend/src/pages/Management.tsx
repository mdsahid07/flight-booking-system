import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,

} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility'; // For View Details
import CancelIcon from '@mui/icons-material/Cancel'; // For Cancel Booking
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';

// Styled components
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  color: '#fff',
  backgroundColor: '#2a5298',
  '&.Mui-selected': {
    backgroundColor: '#1e3c72',
    color: '#fff',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
}));

// Interfaces based on backend entities
interface UserDetails {
  email: string;
}

interface Booking {
  id: string;
  userId: string;
  userDetails: UserDetails;
  flightLegs: { flight: { id: string } }[];
  status: string;
  createdAt: string;
}

interface Airline {
  id: string;
  name: string;
}

interface Airport {
  id: string;
  iataCode: string;
}

interface Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  origin: Airport;
  destination: Airport;
  departure: string;
  arrival: string;
  duration: number;
  price: number;
  seatsAvailable: number;
}

interface Complaint {
  id: string;
  userId: string;
  bookingId: string;
  description: string;
  status: string;
  createdAt: string;
}

const Management: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openFlightDialog, setOpenFlightDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false); // New dialog for viewing details
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null); // For viewing details
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  // Form states
  const [newBooking, setNewBooking] = useState({ userId: '', flightId: '' });
  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    airlineId: '',
    originId: '',
    destinationId: '',
    departure: '',
    arrival: '',
    duration: 0,
    price: 0,
    seatsAvailable: 0,
  });

  const apiUrlStem = import.meta.env.VITE_API_URL;

  const getHeaders = () => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', '*/*');
    const token = localStorage.getItem('token');
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
  };

  // Fetch data on mount
  useEffect(() => {
    fetchBookings();
    fetchFlights();
    fetchComplaints();
    fetchAirlines();
    fetchAirports();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrlStem}/api/booking/all`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data: Booking[] = await response.json();
      setBookings(data);
    } catch (err) {
      setError('Error fetching bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrlStem}/api/flights`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data: Flight[] = await response.json();
      setFlights(data);
    } catch (err) {
      setError('Error fetching flights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrlStem}/api/complaints`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data: Complaint[] = await response.json();
      setComplaints(data);
    } catch (err) {
      setError('Error fetching complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAirlines = async () => {
    try {
      const response = await fetch(`${apiUrlStem}/api/airlines`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data: Airline[] = await response.json();
      setAirlines(data);
    } catch (err) {
      setError('Error fetching airlines');
      console.error(err);
    }
  };

  const fetchAirports = async () => {
    try {
      const response = await fetch(`${apiUrlStem}/api/airports`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data: Airport[] = await response.json();
      setAirports(data);
    } catch (err) {
      setError('Error fetching airports');
      console.error(err);
    }
  };

  // CRUD Operations for Bookings
  const handleCreateBooking = async () => {
    if (!newBooking.userId || !newBooking.flightId) {
      setError('User ID and Flight ID are required');
      return;
    }
    try {
      const response = await fetch(`${apiUrlStem}/api/booking`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId: newBooking.userId, flightId: newBooking.flightId }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const createdBooking: Booking = await response.json();
      setBookings([...bookings, createdBooking]);
      setOpenBookingDialog(false);
      setNewBooking({ userId: '', flightId: '' });
      setError(null);
    } catch (err) {
      setError('Error creating booking');
      console.error(err);
    }
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;
    try {
      const response = await fetch(`${apiUrlStem}/api/booking/${editingBooking.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editingBooking),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const updatedBooking: Booking = await response.json();
      setBookings(bookings.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)));
      setOpenBookingDialog(false);
      setEditingBooking(null);
      setError(null);
    } catch (err) {
      setError('Error updating booking');
      console.error(err);
    }
  };

  // New function to cancel a booking
  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const response = await fetch(`${apiUrlStem}/api/booking/${id}/cancel`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const updatedBooking: Booking = await response.json();
      setBookings(bookings.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)));
      setError(null);
    } catch (err) {
      setError('Error cancelling booking');
      console.error(err);
    }
  };

  // CRUD Operations for Flights
  const handleCreateFlight = async () => {
    if (
      !newFlight.flightNumber ||
      !newFlight.airlineId ||
      !newFlight.originId ||
      !newFlight.destinationId ||
      !newFlight.departure ||
      !newFlight.arrival ||
      newFlight.duration <= 0 ||
      newFlight.price <= 0 ||
      newFlight.seatsAvailable < 0
    ) {
      setError('All fields are required, and duration, price, and seats must be valid');
      return;
    }
    try {
      const flightPayload = {
        flightNumber: newFlight.flightNumber,
        airline: { id: newFlight.airlineId },
        origin: { id: newFlight.originId },
        destination: { id: newFlight.destinationId },
        departure: newFlight.departure,
        arrival: newFlight.arrival,
        duration: newFlight.duration,
        price: newFlight.price,
        seatsAvailable: newFlight.seatsAvailable,
      };
      const response = await fetch(`${apiUrlStem}/api/flights`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(flightPayload),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const createdFlight: Flight = await response.json();
      setFlights([...flights, createdFlight]);
      setOpenFlightDialog(false);
      setNewFlight({
        flightNumber: '',
        airlineId: '',
        originId: '',
        destinationId: '',
        departure: '',
        arrival: '',
        duration: 0,
        price: 0,
        seatsAvailable: 0,
      });
      setError(null);
    } catch (err) {
      setError('Error creating flight');
      console.error(err);
    }
  };

  const handleUpdateFlight = async () => {
    if (!editingFlight) return;
    try {
      const flightPayload = {
        ...editingFlight,
        airline: { id: editingFlight.airline.id },
        origin: { id: editingFlight.origin.id },
        destination: { id: editingFlight.destination.id },
      };
      const response = await fetch(`${apiUrlStem}/api/flights/${editingFlight.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(flightPayload),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const updatedFlight: Flight = await response.json();
      setFlights(flights.map((f) => (f.id === updatedFlight.id ? updatedFlight : f)));
      setOpenFlightDialog(false);
      setEditingFlight(null);
      setError(null);
    } catch (err) {
      setError('Error updating flight');
      console.error(err);
    }
  };

  const handleDeleteFlight = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) return;
    try {
      const response = await fetch(`${apiUrlStem}/api/flights/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      setFlights(flights.filter((f) => f.id !== id));
      setError(null);
    } catch (err) {
      setError('Error deleting flight');
      console.error(err);
    }
  };

  // Complaint Operations
  const handleResolveComplaint = async (id: string) => {
    try {
      const response = await fetch(`${apiUrlStem}/api/complaints/${id}/resolve`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const updatedComplaint: Complaint = await response.json();
      setComplaints(complaints.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c)));
      setError(null);
    } catch (err) {
      setError('Error resolving complaint');
      console.error(err);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e3c72' }}>
        Flight Management Dashboard
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          backgroundColor: '#2a5298',
          borderRadius: '8px',
          '.MuiTabs-indicator': { backgroundColor: '#ffeb3b' },
        }}
      >
        <StyledTab label="Bookings" />
        <StyledTab label="Flights" />
        <StyledTab label="Complaints" />
      </Tabs>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Bookings Tab */}
      {tabValue === 0 && !loading && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingBooking(null);
                setOpenBookingDialog(true);
              }}
              sx={{ backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
            >
              Add Booking
            </Button>
          </Box>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>Flight ID</TableCell>
                  <TableCell>Booking Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>{booking.userDetails?.email || 'N/A'}</TableCell>
                    <TableCell>{booking.flightLegs?.[0]?.flight?.id || 'N/A'}</TableCell>
                    <TableCell>{new Date(booking.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={booking.status} color={booking.status === 'CONFIRMED' ? 'success' : 'warning'} />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setEditingBooking(booking);
                          setOpenBookingDialog(true);
                        }}
                      >
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setSelectedBooking(booking);
                          setOpenDetailsDialog(true);
                        }}
                      >
                        <VisibilityIcon color="info" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={booking.status === 'CANCELLED'}
                      >
                        <CancelIcon color={booking.status === 'CANCELLED' ? 'disabled' : 'error'} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Box>
      )}

      {/* Flights Tab */}
      {tabValue === 1 && !loading && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingFlight(null);
                setOpenFlightDialog(true);
              }}
              sx={{ backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
            >
              Add Flight
            </Button>
          </Box>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Flight Number</TableCell>
                  <TableCell>Airline</TableCell>
                  <TableCell>Origin</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Arrival</TableCell>
                  <TableCell>Duration (min)</TableCell>
                  <TableCell>Price ($)</TableCell>
                  <TableCell>Seats Available</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell>{flight.id}</TableCell>
                    <TableCell>{flight.flightNumber}</TableCell>
                    <TableCell>{flight.airline?.name || 'N/A'}</TableCell>
                    <TableCell>{flight.origin?.iataCode || 'N/A'}</TableCell>
                    <TableCell>{flight.destination?.iataCode || 'N/A'}</TableCell>
                    <TableCell>{new Date(flight.departure).toLocaleString()}</TableCell>
                    <TableCell>{new Date(flight.arrival).toLocaleString()}</TableCell>
                    <TableCell>{flight.duration}</TableCell>
                    <TableCell>${flight.price.toFixed(2)}</TableCell>
                    <TableCell>{flight.seatsAvailable}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setEditingFlight(flight);
                          setOpenFlightDialog(true);
                        }}
                      >
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteFlight(flight.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Box>
      )}

      {/* Complaints Tab */}
      {tabValue === 2 && !loading && (
        <Box>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>{complaint.id}</TableCell>
                    <TableCell>{complaint.userId}</TableCell>
                    <TableCell>{complaint.bookingId}</TableCell>
                    <TableCell>{complaint.description}</TableCell>
                    <TableCell>
                      <Chip label={complaint.status} color={complaint.status === 'RESOLVED' ? 'success' : 'error'} />
                    </TableCell>
                    <TableCell>{new Date(complaint.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {complaint.status !== 'RESOLVED' && (
                        <IconButton onClick={() => handleResolveComplaint(complaint.id)}>
                          <DoneIcon color="success" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Box>
      )}

      {/* Booking Dialog (for Create/Edit) */}
      <Dialog open={openBookingDialog} onClose={() => setOpenBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBooking ? 'Edit Booking' : 'Create Booking'}</DialogTitle>
        <DialogContent>
          <TextField
            label="User ID"
            value={editingBooking ? editingBooking.userId : newBooking.userId}
            onChange={(e) =>
              editingBooking
                ? setEditingBooking({ ...editingBooking, userId: e.target.value })
                : setNewBooking({ ...newBooking, userId: e.target.value })
            }
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Flight ID"
            value={editingBooking ? editingBooking.flightLegs?.[0]?.flight?.id || '' : newBooking.flightId}
            onChange={(e) =>
              editingBooking
                ? setEditingBooking({
                    ...editingBooking,
                    flightLegs: [{ flight: { id: e.target.value } }],
                  })
                : setNewBooking({ ...newBooking, flightId: e.target.value })
            }
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookingDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={editingBooking ? handleUpdateBooking : handleCreateBooking}
            variant="contained"
            sx={{ backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
          >
            {editingBooking ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Details Dialog (for Viewing) */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>ID:</strong> {selectedBooking.id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>User Email:</strong> {selectedBooking.userDetails?.email || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Flight ID:</strong> {selectedBooking.flightLegs?.[0]?.flight?.id || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Booking Date:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {selectedBooking.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Flight Dialog */}
      <Dialog open={openFlightDialog} onClose={() => setOpenFlightDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFlight ? 'Edit Flight' : 'Create Flight'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Flight Number"
            value={editingFlight ? editingFlight.flightNumber : newFlight.flightNumber}
            onChange={(e) =>
              editingFlight
                ? setEditingFlight({ ...editingFlight, flightNumber: e.target.value })
                : setNewFlight({ ...newFlight, flightNumber: e.target.value })
            }
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Airline</InputLabel>
            <Select
              value={editingFlight ? editingFlight.airline.id : newFlight.airlineId}
              onChange={(e) =>
                editingFlight
                  ? setEditingFlight({ ...editingFlight, airline: { ...editingFlight.airline, id: e.target.value as string } })
                  : setNewFlight({ ...newFlight, airlineId: e.target.value as string })
              }
            >
              {airlines.map((airline) => (
                <MenuItem key={airline.id} value={airline.id}>
                  {airline.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Origin Airport</InputLabel>
            <Select
              value={editingFlight ? editingFlight.origin.id : newFlight.originId}
              onChange={(e) =>
                editingFlight
                  ? setEditingFlight({ ...editingFlight, origin: { ...editingFlight.origin, id: e.target.value as string } })
                  : setNewFlight({ ...newFlight, originId: e.target.value as string })
              }
            >
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.iataCode}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Destination Airport</InputLabel>
            <Select
              value={editingFlight ? editingFlight.destination.id : newFlight.destinationId}
              onChange={(e) =>
                editingFlight
                  ? setEditingFlight({ ...editingFlight, destination: { ...editingFlight.destination, id: e.target.value as string } })
                  : setNewFlight({ ...newFlight, destinationId: e.target.value as string })
              }
            >
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.iataCode}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Departure Time"
            type="datetime-local"
            value={editingFlight ? editingFlight.departure : newFlight.departure}
            onChange={(e) =>
              editingFlight
                ? setEditingFlight({ ...editingFlight, departure: e.target.value })
                : setNewFlight({ ...newFlight, departure: e.target.value })
            }
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Arrival Time"
            type="datetime-local"
            value={editingFlight ? editingFlight.arrival : newFlight.arrival}
            onChange={(e) =>
              editingFlight
                ? setEditingFlight({ ...editingFlight, arrival: e.target.value })
                : setNewFlight({ ...newFlight, arrival: e.target.value })
            }
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Duration (minutes)"
            type="number"
            value={editingFlight ? editingFlight.duration : newFlight.duration}
            onChange={(e) =>
              editingFlight
                ? setEditingFlight({ ...editingFlight, duration: Number(e.target.value) })
                : setNewFlight({ ...newFlight, duration: Number(e.target.value) })
            }
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Price ($)"
            type="number"
            value={editingFlight ? editingFlight.price : newFlight.price}
            onChange={(e) =>
              editingFlight
                ? setEditingFlight({ ...editingFlight, price: Number(e.target.value) })
                : setNewFlight({ ...newFlight, price: Number(e.target.value) })
            }
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Seats Available"
            type="number"
            value={editingFlight ? editingFlight.seatsAvailable : newFlight.seatsAvailable}
            onChange={(e) =>
              editingFlight
                ? setEditingFlight({ ...editingFlight, seatsAvailable: Number(e.target.value) })
                : setNewFlight({ ...newFlight, seatsAvailable: Number(e.target.value) })
            }
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFlightDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={editingFlight ? handleUpdateFlight : handleCreateFlight}
            variant="contained"
            sx={{ backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
          >
            {editingFlight ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Management;