import React from 'react';
import { Box, Typography, Link as MuiLink, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import logob from '../assets/logo.png';

// Define props to support both RouterLink and HTML anchor
interface FooterLinkProps {
  component?: 'a' | typeof RouterLink;
  to?: string; // For RouterLink
  href?: string; // For <a>
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
}

const FooterLink = styled(MuiLink, {
  shouldForwardProp: (prop) => prop !== 'component' && prop !== 'to' && prop !== 'href' && prop !== 'target' && prop !== 'rel',
})<FooterLinkProps>(({ theme }) => ({
  color: '#fff',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#ffeb3b',
    textDecoration: 'underline',
    transform: 'translateX(4px)',
  },
}));

const SocialIconButton = styled('span')(({ theme }) => ({
  marginRight: 8,
  color: '#fff',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#ffeb3b',
    transform: 'scale(1.2)',
  },
}));

const Footer: React.FC = () => {
  return (
    <Box 
      sx={{ 
        mt: 4, 
        py: 4, 
        background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
        color: '#fff',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Box 
        sx={{ 
          maxWidth: '1200px', 
          margin: 'auto', 
          px: { xs: 2, sm: 4 }, 
          display: 'flex', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 4 
        }}
      >
        <Box sx={{ flex: '1 1 200px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <img src={logob} alt="FlyHigh Airlines Logo" style={{ width: 40, height: 40, marginRight: 12 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              xAI Travel
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Your trusted partner for global travel. Book your next adventure with us!
          </Typography>
        </Box>

        <Box sx={{ flex: '1 1 200px' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#ffeb3b' }}>
            Quick Links
          </Typography>
          <FooterLink component={RouterLink} to="/flights">Flights</FooterLink><br />
          <FooterLink component={RouterLink} to="/about">About Us</FooterLink><br />
          <FooterLink component={RouterLink} to="/contact">Contact</FooterLink>
        </Box>

        <Box sx={{ flex: '1 1 200px' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#ffeb3b' }}>
            Support
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Email: <FooterLink component="a" href="mailto:support@flyhigh.com">support@flyhigh.com</FooterLink>
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Phone: +1-800-555-1234</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Address: 123 Skyway Lane, Travel City</Typography>
        </Box>

        <Box sx={{ flex: '1 1 200px' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#ffeb3b' }}>
            Follow Us
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <SocialIconButton>
              <FooterLink component="a" href="https://facebook.com" target="_blank" rel="noopener">
                <FacebookIcon />
              </FooterLink>
            </SocialIconButton>
            <SocialIconButton>
              <FooterLink component="a" href="https://twitter.com" target="_blank" rel="noopener">
                <TwitterIcon />
              </FooterLink>
            </SocialIconButton>
            <SocialIconButton>
              <FooterLink component="a" href="https://instagram.com" target="_blank" rel="noopener">
                <InstagramIcon />
              </FooterLink>
            </SocialIconButton>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.3)', maxWidth: '80%', mx: 'auto' }} />
      <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontStyle: 'italic' }}>
        © {new Date().getFullYear()} xAI Travel. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;