import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  styled,
} from '@mui/material';
import jsPDF from 'jspdf';
import { keyframes } from '@emotion/react';
import { useAuth } from '../context/AuthContext';
import LoginSignupModal from '../components/LoginSignupModal';
import Header from '../components/Header';
import Footer from '../components/Footer';
const apiUrlStem = import.meta.env.VITE_API_URL;
// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled components
const AnimatedBox = styled(Box)(({ theme }) => ({
  animation: `${fadeIn} 0.5s ease-out forwards`,
  padding: '20px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepIcon-root': {
    color: '#1e3c72',
    '&.Mui-active': { color: '#2a5298' },
    '&.Mui-completed': { color: '#ffeb3b' },
  },
  '& .MuiStepLabel-label': {
    color: '#1e3c72',
    fontWeight: 500,
  },
}));

const SpinningLoader = styled(CircularProgress)(({ theme }) => ({
  animation: `${spin} 1s linear infinite`,
  color: '#ffeb3b',
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

const createBooking = async (bookingData: any) => {
  console.log("TRYING TO SEND BOOKING DATA: ", bookingData);
  const response = await fetch(`${apiUrlStem}/api/booking`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(bookingData),
  });
  if (!response.ok) {
    throw new Error(`Failed to save booking: ${response.status}`);
  }
  return response.json();
};

const steps = ['Choose Fare Type', 'Enter Details', 'Seat Selection', 'Review Details', 'Checkout'];

const BookingProcess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight } = location.state || {};
  const { user, login } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [fareType, setFareType] = useState('');
  const [userDetails, setUserDetails] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    passportNumber: '',
  });
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = () => {
    if (activeStep === 0 && !fareType) {
      setError('Please select a fare type.');
      return;
    }
    if (activeStep === 1 && !validateUserDetails()) {
      setError('Please fill all required fields.');
      return;
    }
    if (activeStep === 2 && !selectedSeat) {
      setError('Please select a seat.');
      return;
    }
    if (activeStep === 4 && !user) {
      setModalOpen(true);
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleConfirm = async () => {
    if (!user) {
      setModalOpen(true);
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay

    const isRoundTrip = 'outbound' in flight;
    const itinerary = isRoundTrip ? flight.outbound : flight;
    const returnItinerary = isRoundTrip ? flight.returnTrip : null;

    const bookingData = {
      userId: user.id,
      itinerary: {
        flights: itinerary.flights.map((f: any) => ({ id: f.id })),
        ...(returnItinerary && { returnFlights: returnItinerary.flights.map((f: any) => ({ id: f.id })) }),
      },
      totalPrice: flight.totalPrice,
      fareType,
      userDetails,
      selectedSeat,
      status: 'CONFIRMED',
      bookingDate: new Date().toISOString(),
    };

    try {
      const result = await createBooking(bookingData);
      setBookingId(result.id || 'mock-booking-id');
      generateReceipt(bookingData, result.id || 'mock-booking-id');
      setActiveStep(steps.length - 1); // Ensure Checkout step is marked as active/completed
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const validateUserDetails = () => {
    return userDetails.firstName && userDetails.lastName && userDetails.email && userDetails.phone && userDetails.address && userDetails.passportNumber;
  };

// Utility function to generate a random PRN
const generatePRN = (): string => {
  const prefix = "XAI-"; // Prefix for the PRN
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Alphanumeric characters
  const length = 8; // Length of the random part of the PRN
  let randomPart = "";

  // Generate a random 8-character string
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomPart += characters[randomIndex];
  }

  return `${prefix}${randomPart}`; // e.g., "XAI-ABCD1234"
};

const generateReceipt = (bookingData: any, bookingId: string) => {
  const doc = new jsPDF();
  const companyInfo = {
    name: "xAI Travel",
    address: "123 Galaxy Lane, Universe City, Earth",
    phone: "1-800-XAI-FLY",
    email: "support@xaitravel.com",
  };

  // Generate a unique PRN for this ticket
  const prn = generatePRN();

  // Header Section
  doc.setFillColor(30, 60, 114);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 60, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.address, 60, 28);
  doc.text(`Phone: ${companyInfo.phone} | Email: ${companyInfo.email}`, 60, 34);
  doc.setTextColor(0, 0, 0);

  doc.setDrawColor(255, 204, 0);
  doc.setLineWidth(1);
  doc.line(20, 42, 190, 42);

  // Ticket Owner Section (with PRN)
  let yPos = 50;
  doc.setFillColor(240, 248, 255);
  doc.rect(20, yPos, 170, 40, 'F'); // Increased height to accommodate PRN
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102);
  doc.setFont('helvetica', 'bold');
  doc.text("Ticket Owner", 25, yPos + 8);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${bookingData.userDetails.firstName} ${bookingData.userDetails.lastName}`, 25, yPos + 15);
  doc.text(`Email: ${bookingData.userDetails.email}`, 25, yPos + 20);
  doc.text(`Phone: ${bookingData.userDetails.phone}`, 25, yPos + 25);
  doc.text(`Address: ${bookingData.userDetails.address}`, 25, yPos + 30);
  doc.text(`Passport: ${bookingData.userDetails.passportNumber}`, 125, yPos + 15);
  doc.setTextColor(0, 102, 204); // Blue color for PRN to make it stand out
  doc.text(`PRN: ${prn}`, 125, yPos + 20); // Add PRN
  doc.setTextColor(0, 0, 0);

  // Flight Itinerary Section
  yPos += 45; // Adjusted for the increased height of the Ticket Owner section
  doc.setFillColor(245, 245, 220);
  doc.rect(20, yPos, 170, 10, 'F');
  doc.setFontSize(10);
  doc.setTextColor(0, 102, 0);
  doc.setFont('helvetica', 'normal');
  doc.text("Flight Itinerary", 25, yPos + 7);
  yPos += 15;

  const isRoundTrip = 'outbound' in flight;
  const itinerary = isRoundTrip ? flight.outbound : flight;
  const returnItinerary = isRoundTrip ? flight.returnTrip : null;

  itinerary.flights.forEach((f: any, index: number) => {
    doc.setFillColor(255, 245, 230);
    doc.rect(20, yPos, 170, 30, 'F');
    doc.setDrawColor(204, 204, 204);
    doc.rect(20, yPos, 170, 30);
    doc.setTextColor(0, 0, 0);
    doc.text(`Leg ${index + 1}: ${getAirportCode(f.origin)} to ${getAirportCode(f.destination)}`, 25, yPos + 5);
    doc.text(`Flight: ${f.flightNumber} (${f.airline?.name || 'Unknown'})`, 35, yPos + 10);
    doc.text(`Depart: ${new Date(f.departure).toLocaleString()}`, 35, yPos + 15);
    doc.text(`Arrive: ${new Date(f.arrival).toLocaleString()}`, 35, yPos + 20);
    doc.text(`Duration: ${formatDuration(f.duration)}`, 125, yPos + 10);
    doc.setTextColor(0, 153, 0);
    doc.text(`Price: $${f.price}`, 125, yPos + 15);
    doc.setTextColor(0, 0, 0);
    yPos += 35;
  });

  if (returnItinerary) {
    doc.setFillColor(245, 245, 220);
    doc.rect(20, yPos, 170, 10, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 0);
    doc.text("Return Trip", 25, yPos + 7);
    yPos += 15;

    returnItinerary.flights.forEach((f: any, index: number) => {
      doc.setFillColor(255, 245, 230);
      doc.rect(20, yPos, 170, 30, 'F');
      doc.setDrawColor(204, 204, 204);
      doc.rect(20, yPos, 170, 30);
      doc.setTextColor(0, 0, 0);
      doc.text(`Leg ${index + 1}: ${getAirportCode(f.origin)} to ${getAirportCode(f.destination)}`, 25, yPos + 5);
      doc.text(`Flight: ${f.flightNumber} (${f.airline?.name || 'Unknown'})`, 35, yPos + 10);
      doc.text(`Depart: ${new Date(f.departure).toLocaleString()}`, 35, yPos + 15);
      doc.text(`Arrive: ${new Date(f.arrival).toLocaleString()}`, 35, yPos + 20);
      doc.text(`Duration: ${formatDuration(f.duration)}`, 125, yPos + 10);
      doc.setTextColor(0, 153, 0);
      doc.text(`Price: $${f.price}`, 125, yPos + 15);
      doc.setTextColor(0, 0, 0);
      yPos += 35;
    });
  }

  // Extras Section
  doc.setFillColor(240, 248, 255);
  doc.rect(20, yPos, 170, 25, 'F');
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text("Extras", 25, yPos + 7);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fare Type: ${fareType}`, 25, yPos + 15);
  doc.text(`Seat: ${selectedSeat}`, 25, yPos + 20);
  yPos += 30;

  // Total Amount Paid Section
  doc.setFillColor(255, 228, 225);
  doc.rect(20, yPos, 170, 20, 'F');
  doc.setFontSize(14);
  doc.setTextColor(204, 0, 0);
  doc.text("Total Amount Paid", 25, yPos + 7);
  doc.setFontSize(12);
  doc.setTextColor(0, 153, 0);
  doc.text(`$${flight.totalPrice}`, 25, yPos + 15);
  doc.setTextColor(0, 0, 0);
  yPos += 25;

  // Footer Section
  doc.setFillColor(30, 60, 114);
  doc.rect(0, 270, 210, 20, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Thank you for choosing xAI Travel! Safe travels!", 20, 280);
  doc.text(`Booking ID: ${bookingId}`, 150, 280, { align: 'right' });

  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  setDownloadLink(url);
};

  const handleLoginSuccess = (loggedInUser: any) => {
    login(loggedInUser);
    setModalOpen(false);
    setUserDetails({
      firstName: loggedInUser.name?.split(' ')[0] || '',
      lastName: loggedInUser.name?.split(' ')[1] || '',
      email: loggedInUser.email || '',
      phone: userDetails.phone,
      address: userDetails.address,
      passportNumber: userDetails.passportNumber,
    });
    handleNext();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <AnimatedBox>
            <Typography variant="h6" sx={{ color: '#1e3c72', mb: 2 }}>Choose Fare Type</Typography>
            <FormControl fullWidth margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel sx={{ color: '#1e3c72' }}>Fare Type</InputLabel>
              <Select
                value={fareType}
                onChange={(e) => setFareType(e.target.value)}
                sx={{
                  backgroundColor: '#fff',
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffeb3b' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2a5298' },
                }}
              >
                <MenuItem value="economy_basic">Economy Basic</MenuItem>
                <MenuItem value="economy_full_refundable">Economy Full Refundable</MenuItem>
                <MenuItem value="economy_plus">Economy Plus</MenuItem>
                <MenuItem value="business">Business</MenuItem>
              </Select>
            </FormControl>
          </AnimatedBox>
        );
      case 1:
        return (
          <AnimatedBox>
            <Typography variant="h6" sx={{ color: '#1e3c72', mb: 2 }}>Enter Details</Typography>
            {['firstName', 'lastName', 'email', 'phone', 'address', 'passportNumber'].map((field, index) => (
              <TextField
                key={field}
                label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                value={userDetails[field as keyof typeof userDetails]}
                onChange={(e) => setUserDetails({ ...userDetails, [field]: e.target.value })}
                fullWidth
                margin="normal"
                required
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                  animation: `${fadeIn} 0.5s ease-out ${index * 0.1}s forwards`,
                  opacity: 0,
                }}
              />
            ))}
          </AnimatedBox>
        );
      case 2:
        return (
          <AnimatedBox>
            <Typography variant="h6" sx={{ color: '#1e3c72', mb: 2 }}>Seat Selection</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 40px)', gap: 1, mt: 2 }}>
              {Array.from({ length: 16 }, (_, row) =>
                Array.from({ length: 6 }, (_, col) => {
                  const seat = `${String.fromCharCode(65 + row)}${col + 1}`;
                  const isSelected = selectedSeat === seat;
                  return (
                    <Box
                      key={seat}
                      sx={{
                        width: 40,
                        height: 40,
                        border: '1px solid #1e3c72',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? '#2a5298' : '#fff',
                        color: isSelected ? '#fff' : '#1e3c72',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease',
                        '&:hover': { backgroundColor: '#ffeb3b', color: '#1e3c72' },
                        animation: `${fadeIn} 0.5s ease-out forwards`,
                      }}
                      onClick={() => setSelectedSeat(seat)}
                    >
                      {seat}
                    </Box>
                  );
                })
              )}
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: '#1e3c72' }}>
              Selected Seat: {selectedSeat || 'None'}
            </Typography>
          </AnimatedBox>
        );
      case 3:
        const isRoundTrip = 'outbound' in flight;
        const itinerary = isRoundTrip ? flight.outbound : flight;
        const returnItinerary = isRoundTrip ? flight.returnTrip : null;

        return (
          <AnimatedBox>
            <Typography variant="h6" sx={{ color: '#1e3c72', mb: 2 }}>Review Details</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h5" sx={{ color: '#2a5298' }}>Flight Itinerary</Typography>
              {itinerary.flights.map((f: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    animation: `${fadeIn} 0.5s ease-out ${index * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#1e3c72' }}>
                    Leg {index + 1}: {getAirportCode(f.origin)} to {getAirportCode(f.destination)}
                  </Typography>
                  <Typography>Flight: {f.flightNumber} ({f.airline?.name || 'Unknown'})</Typography>
                  <Typography>Depart: {new Date(f.departure).toLocaleString()}</Typography>
                  <Typography>Arrive: {new Date(f.arrival).toLocaleString()}</Typography>
                  <Typography>Duration: {formatDuration(f.duration)}</Typography>
                  <Typography sx={{ color: '#2a5298' }}>Price: ${f.price}</Typography>
                </Box>
              ))}
              {returnItinerary && (
                <>
                  <Typography variant="h5" sx={{ mt: 2, color: '#2a5298' }}>Return Trip</Typography>
                  {returnItinerary.flights.map((f: any, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        mt: 2,
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        animation: `${fadeIn} 0.5s ease-out ${index * 0.1}s forwards`,
                        opacity: 0,
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#1e3c72' }}>
                        Leg {index + 1}: {getAirportCode(f.origin)} to {getAirportCode(f.destination)}
                      </Typography>
                      <Typography>Flight: {f.flightNumber} ({f.airline?.name || 'Unknown'})</Typography>
                      <Typography>Depart: {new Date(f.departure).toLocaleString()}</Typography>
                      <Typography>Arrive: {new Date(f.arrival).toLocaleString()}</Typography>
                      <Typography>Duration: {formatDuration(f.duration)}</Typography>
                      <Typography sx={{ color: '#2a5298' }}>Price: ${f.price}</Typography>
                    </Box>
                  ))}
                </>
              )}
              <Typography variant="h6" sx={{ mt: 2, color: '#2a5298' }}>
                Total Price: ${flight.totalPrice}
              </Typography>
              <Typography variant="body1" sx={{ color: '#1e3c72' }}>
                Total Duration: {formatDuration(flight.totalDuration)}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h5" sx={{ color: '#2a5298' }}>Passenger Details</Typography>
              {Object.entries(userDetails).map(([key, value], index) => (
                <Typography
                  key={key}
                  sx={{ animation: `${fadeIn} 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                >
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                </Typography>
              ))}
              <Typography sx={{ animation: `${fadeIn} 0.5s ease-out 0.6s forwards`, opacity: 0 }}>
                Fare Type: {fareType}
              </Typography>
              <Typography sx={{ animation: `${fadeIn} 0.5s ease-out 0.7s forwards`, opacity: 0 }}>
                Seat: {selectedSeat}
              </Typography>
            </Box>
          </AnimatedBox>
        );
      case 4:
        return (
          <AnimatedBox>
            <Typography variant="h6" sx={{ color: '#1e3c72', mb: 2 }}>Checkout</Typography>
            <TextField
              label="Card Number"
              fullWidth
              margin="normal"
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Expiry (MM/YYYY)"
              fullWidth
              margin="normal"
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="CVV"
              fullWidth
              margin="normal"
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            {isProcessing && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <SpinningLoader />
                <Typography sx={{ mt: 1, color: '#1e3c72' }}>Processing Payment...</Typography>
              </Box>
            )}
            {bookingId && !isProcessing && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#2a5298', animation: `${fadeIn} 0.5s ease-out` }}>
                  Booking Confirmed! Booking ID: {bookingId}
                </Typography>
                {downloadLink && (
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      borderRadius: '8px',
                      backgroundColor: '#ffeb3b',
                      color: '#1e3c72',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': { backgroundColor: '#ffd700', transform: 'scale(1.05)' },
                    }}
                    href={downloadLink}
                    download={`ticket_${bookingId}.pdf`}
                  >
                    Download Ticket
                  </Button>
                )}
              </Box>
            )}
          </AnimatedBox>
        );
      default:
        return null;
    }
  };

  if (!flight) {
    return (
      <Box sx={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
       
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: '#1e3c72' }}>
          No flight selected. Please go back and select a flight.
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
        Booking Process
      </Typography>
      <StyledStepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label} completed={bookingId ? true : index < activeStep}>
            <StepLabel
              sx={{
                '& .MuiStepLabel-label': {
                  animation: `${fadeIn} 0.5s ease-out ${index * 0.1}s forwards`,
                  opacity: 0,
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </StyledStepper>
      {error && (
        <Alert severity="error" sx={{ mb: 2, animation: `${fadeIn} 0.5s ease-out` }}>
          {error}
        </Alert>
      )}
      {renderStepContent(activeStep)}
      <Box sx={{ display: 'flex', justifyContent: bookingId ? 'center' : 'space-between', mt: 4 }}>
        {!bookingId && (
          <Button
            disabled={activeStep === 0 || isProcessing}
            onClick={handleBack}
            sx={{
              borderRadius: '8px',
              color: '#1e3c72',
              border: '1px solid #1e3c72',
              '&:hover': { backgroundColor: '#f5f7fa' },
            }}
          >
            Back
          </Button>
        )}
        <Button
          variant="contained"
          onClick={bookingId ? handleHome : (activeStep === steps.length - 1 ? handleConfirm : handleNext)}
          disabled={isProcessing}
          sx={{
            borderRadius: '8px',
            backgroundColor: '#ffeb3b',
            color: '#1e3c72',
            fontWeight: 600,
            padding: '8px 24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#ffd700',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
            },
          }}
        >
          {bookingId ? 'Home' : (activeStep === steps.length - 1 ? 'Confirm and Pay' : 'Next')}
        </Button>
      </Box>
      <LoginSignupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
     
    </Box>
  );
};

export default BookingProcess;