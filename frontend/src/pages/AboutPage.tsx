import React from 'react';
import { Box, Typography, Card, CardContent, styled, keyframes } from '@mui/material';

// Import local images
import mercelImage from '../assets/mercel.png';
import williamsImage from '../assets/williams.png';
import sahidImage from '../assets/sahid.png';
import kanchanImage from '../assets/kanchan.png';

// Animation keyframes
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const zoomIn = keyframes`
  from { transform: scale(1); }
  to { transform: scale(1.05); }
`;

// Styled card with animation
const AnimatedCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'index',
})<{ index: number }>(({ theme, index }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  animation: `${fadeInUp} 0.5s ease-out ${index * 0.2}s forwards`, // Staggered fade-in
  opacity: 0, // Start invisible for animation
  '&[data-animated="true"]': {
    opacity: 1, // Ensure opacity is 1 after animation
  },
  '&:hover': {
    animation: `${zoomIn} 0.3s ease forwards`, // Zoom-in animation on hover
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)', // Keep shadow on hover
  },
}));

// Container for the cards grid
const CardsContainer = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem 1rem',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr', // Stack vertically on mobile
  },
}));

// Developer data
const developers = [
  {
    name: 'Mercel',
    role: 'Frontend & AI Engineer',
    description: 'Crafts intuitive interfaces and AI-driven experiences.',
    image: mercelImage,
  },
  {
    name: 'Williams',
    role: 'Backend Engineer',
    description: 'Builds scalable and efficient server-side systems.',
    image: williamsImage,
  },
  {
    name: 'Sahid',
    role: 'Solutions Architect',
    description: 'Designs scalable and secure architectures.',
    image: sahidImage,
  },
  {
    name: 'Kanchan',
    role: 'DevOps Engineer',
    description: 'Ensures seamless deployments and reliable infrastructure.',
    image: kanchanImage,
  },
];

const AboutPage: React.FC = () => {
  return (
    <Box sx={{ width: '100%', background: 'linear-gradient(135deg, #eef2f7 0%, #ffffff 100%)' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: '#1e3c72',
          textAlign: 'center',
          padding: '2rem 0',
          fontWeight: 'bold',
          fontSize: '2rem',
        }}
      >
        Meet Our Team
      </Typography>
      <CardsContainer>
        {developers.map((developer, index) => (
          <AnimatedCard
            key={index}
            index={index}
            data-animated="true" // Ensure opacity is set after animation
          >
            <CardContent
              sx={{
                padding: '24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src={developer.image}
                alt={`${developer.name} profile`}
                sx={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  marginBottom: '1rem',
                  objectFit: 'cover',
                  border: '4px solid #1e3c72',
                }}
              />
              <Typography
                variant="h6"
                sx={{ color: '#1e3c72', fontWeight: 700, fontSize: '1.25rem', mb: 0.5 }}
              >
                {developer.name}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: '#2a5298', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 500 }}
              >
                {developer.role}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#333', fontSize: '0.9rem', lineHeight: 1.5 }}
              >
                {developer.description}
              </Typography>
            </CardContent>
          </AnimatedCard>
        ))}
      </CardsContainer>
    </Box>
  );
};

export default AboutPage;