// frontend/src/index.jsx
// ⚡ Set React Router future flags before importing React
window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.enableFutureFlags?.({
  v7_startTransition: false,
  v7_relativeSplatPath: false
});

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';  // <-- Tailwind CSS
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
