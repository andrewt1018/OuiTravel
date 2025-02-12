import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Landing from './components/Landing.js';
import ResetPasswordPrompt from './components/ResetPasswordPrompt.js';
import ResetPassword from './components/ResetPassword.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/reset-password" element={<ResetPasswordPrompt/>} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
      </Routes>
    </Router>
  );
}

export default App;
