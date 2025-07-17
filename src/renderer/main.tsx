import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import TestApp from './components/TestApp';
import './styles/globals.css';

// Ensure we have the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Create React root and render the app
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
