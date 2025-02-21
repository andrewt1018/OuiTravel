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
import NavigationLayout from './components/helpers/NavigationLayout.js';
import IndexSearchBar from './components/helpers/IndexSearchBar';
import CreateJournal from './components/journals/CreateJournal';
import JournalList from './components/journals/JournalList';
import JournalView from './components/journals/JournalView';
import EntryEditor from './components/journals/EntryEditor';

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
        
        {/* Journal routes */}
        <Route path="/journals" element={
          <NavigationLayout showHeader={true}>
            <JournalList />
          </NavigationLayout>
        } />
        <Route path="/journals/create" element={
          <NavigationLayout showHeader={true}>
            <CreateJournal />
          </NavigationLayout>
        } />
        <Route path="/journals/:id" element={
          <NavigationLayout showHeader={true}>
            <JournalView />
          </NavigationLayout>
        } />
        <Route path="/journals/:id/new-entry" element={
          <NavigationLayout showHeader={true}>
            <EntryEditor />
          </NavigationLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
