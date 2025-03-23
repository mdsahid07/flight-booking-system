import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Collapse,
  styled,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const apiUrlStem = import.meta.env.VITE_API_URL;
// Styled components
const AnimatedCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  animation: `${fadeIn} 0.5s ease-out forwards`,
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  },
}));

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

const getAirportCode = (airport: any): string => {
  return airport?.iataCode || 'Unknown';
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const response = await fetch(`${apiUrlStem}/api/booking/user/${user.id}`, {
          method: 'GET',
          headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load bookings. Please try again.');
      }
    };

    fetchBookings();
  }, [user]);

  const handleExpand = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  if (!user) {
    return (
      <Box sx={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
        
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: '#1e3c72' }}>
          Please log in to view your bookings.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            display: 'block',
            mx: 'auto',
            mt: 2,
            backgroundColor: '#ffeb3b',
            color: '#1e3c72',
            '&:hover': { backgroundColor: '#ffd700' },
          }}
        >
          Back to Home
        </Button>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#1e3c72', textAlign: 'center', animation: `${fadeIn} 0.5s ease-out` }}
      >
        My Bookings
      </Typography>
      {error && (
        <Typography sx={{ color: 'error.main', textAlign: 'center', mb: 2, animation: `${fadeIn} 0.5s ease-out` }}>
          {error}
        </Typography>
      )}
      {bookings.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((booking, index) => {
            const isRoundTrip = booking.returnFlightLegs && booking.returnFlightLegs.length > 0;
            const outboundFlights = booking.flightLegs || [];
            const returnFlights = booking.returnFlightLegs || [];

            return (
              <AnimatedCard key={booking.id}>
                <CardContent sx={{ padding: '20px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#1e3c72' }}>
                      Booking ID: {booking.id}
                    </Typography>
                    <Button
                      onClick={() => handleExpand(index)}
                      sx={{
                        color: '#2a5298',
                        fontWeight: 600,
                        '&:hover': { color: '#ffeb3b' },
                      }}
                    >
                      {expanded === index ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#1e3c72', mt: 1 }}>
                    Status: {booking.status} | Date: {new Date(booking.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#2a5298', mt: 1 }}>
                    Total Price: ${booking.totalPrice}
                  </Typography>
                  <Collapse in={expanded === index}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ color: '#1e3c72' }}>Outbound</Typography>
                      {outboundFlights.map((leg: any, i: number) => (
                        <Box key={i} sx={{ mt: 1, pl: 2 }}>
                          <Typography>
                            Leg {leg.legNumber}: {getAirportCode(leg.flight.origin)} to {getAirportCode(leg.flight.destination)}
                          </Typography>
                          <Typography>Depart: {new Date(leg.flight.departure).toLocaleString()}</Typography>
                          <Typography>Arrive: {new Date(leg.flight.arrival).toLocaleString()}</Typography>
                          <Typography>Duration: {formatDuration(leg.flight.duration)}</Typography>
                        </Box>
                      ))}
                      {isRoundTrip && (
                        <>
                          <Typography variant="h6" sx={{ color: '#1e3c72', mt: 2 }}>Return</Typography>
                          {returnFlights.map((leg: any, i: number) => (
                            <Box key={i} sx={{ mt: 1, pl: 2 }}>
                              <Typography>
                                Leg {leg.legNumber}: {getAirportCode(leg.flight.origin)} to {getAirportCode(leg.flight.destination)}
                              </Typography>
                              <Typography>Depart: {new Date(leg.flight.departure).toLocaleString()}</Typography>
                              <Typography>Arrive: {new Date(leg.flight.arrival).toLocaleString()}</Typography>
                              <Typography>Duration: {formatDuration(leg.flight.duration)}</Typography>
                            </Box>
                          ))}
                        </>
                      )}
                      <Typography variant="body1" sx={{ mt: 2, color: '#1e3c72' }}>
                        Fare Type: {booking.fareType} | Seat: {booking.selectedSeat}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1, color: '#1e3c72' }}>
                        Passenger: {booking.userDetails.firstName} {booking.userDetails.lastName}
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
              </AnimatedCard>
            );
          })}
        </Box>
      ) : (
        <Typography sx={{ textAlign: 'center', color: '#1e3c72', mt: 4 }}>
          No bookings found.
        </Typography>
      )}
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{
          display: 'block',
          mx: 'auto',
          mt: 4,
          borderRadius: '8px',
          backgroundColor: '#ffeb3b',
          color: '#1e3c72',
          fontWeight: 600,
          '&:hover': { backgroundColor: '#ffd700', transform: 'scale(1.05)' },
        }}
      >
        Back to Home
      </Button>
     
    </Box>
  );
};

export default MyBookingsPage;