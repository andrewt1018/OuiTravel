import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import ResetPasswordPrompt from "./components/ResetPasswordPrompt.js";
import ResetPassword from "./components/ResetPassword.js";
import Index from "./components/Index.js";
import Login from "./components/Login.js";
import UploadImage from "./components/UploadImageDemo.js";
import MyMap from './components/MyMap.js';
import CreateAccount from './components/CreateAccount.js';
import Profile from './components/Profile.js';
import MessagePage from './components/MessagePage.js';
import EditProfile from './components/EditProfile.js';
import LocationPage from './components/LocationPage.js';
import NavigationLayout from './components/helpers/NavigationLayout.js';
import LocationOverlay from './components/helpers/LocationOverlay.js';
import IndexSearchBar from './components/helpers/IndexSearchBar';
import SettingPage from './components/SettingPage.js';
import UserProfile from "./components/UserProfile.js"; // Adjust the path to where UserProfile.js is located

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes without navigation bar */}
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/reset-password" element={<ResetPasswordPrompt />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/upload" element={<UploadImage />} />
        <Route path="/location-overlay" element={<LocationOverlay />} />
        {/* Routes with navigation */}
        <Route path="/" element={
          <NavigationLayout showHeader={true} headerSearchBar={<IndexSearchBar />}>
            <Index />
          </NavigationLayout>
        } />
        <Route path="/my-map" element={
          <NavigationLayout showHeader={true}>
            <MyMap />
          </NavigationLayout>
        } />
        <Route path="/profile" element={
          <NavigationLayout showHeader={false}>
            <Profile />
          </NavigationLayout>
        } />
        <Route path="/location-page/:placeId" element={
          <NavigationLayout showHeader={false}>
            <LocationPage />
          </NavigationLayout>
        } />
         <Route path="/messages" element={
          <NavigationLayout showHeader={false}>
            <MessagePage />
          </NavigationLayout>
        } />
        <Route path="/edit-profile" element={
          <NavigationLayout showHeader={false}>
            <EditProfile />
          </NavigationLayout>
        } />
        <Route
          path="/settings"
          element={
            <NavigationLayout showHeader={false}>
              <SettingPage />
            </NavigationLayout>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <NavigationLayout showHeader={false}>
              <UserProfile />
            </NavigationLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
