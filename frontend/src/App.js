import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Index from './components/Index.js'
import Login from './components/Login.js'
import CreateAccount from './components/CreateAccount.js'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
      </Routes>
    </Router>
  );
}

export default App;
