import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Base styles first
import './App.css';   // App-specific styles second
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);