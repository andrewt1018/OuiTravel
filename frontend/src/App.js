import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import ResetPasswordPrompt from './components/ResetPasswordPrompt.js';
import ResetPassword from './components/ResetPassword.js';
import Index from './components/Index.js'
import Login from './components/Login.js'
import UploadImage from "./components/UploadImageDemo.js";
import CreateAccount from './components/CreateAccount.js';
import MyMap from './components/TestMap.js';
import MyComponent from './components/helpers/search-bar.js'
import CreateAccount from './components/CreateAccount.js'
import Profile from './components/Profile.js'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/reset-password" element={<ResetPasswordPrompt/>} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path="/upload" element={<UploadImage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/my-map" element={<MyMap />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
