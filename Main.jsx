
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'FoodVerse could not start: root element not found.'
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
