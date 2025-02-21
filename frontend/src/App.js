import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import ResetPasswordPrompt from './components/ResetPasswordPrompt.js';
import ResetPassword from './components/ResetPassword.js';
import Index from './components/Index.js'
import Login from './components/Login.js'
import UploadImage from "./components/UploadImageDemo.js";
import MyMap from './components/MyMap.js';
import CreateAccount from './components/CreateAccount.js'
import Profile from './components/Profile.js'
import NavigationLayout from './components/NavigationLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes without navigation bar */}
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/reset-password" element={<ResetPasswordPrompt/>} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path="/upload" element={<UploadImage />} />

        {/* Routes with navigation bar */}
        <Route path="/" element={<NavigationLayout><Index /></NavigationLayout>} />
        <Route path="/my-map" element={<NavigationLayout><MyMap /></NavigationLayout>} />
        <Route path="/profile" element={<NavigationLayout><Profile /></NavigationLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
