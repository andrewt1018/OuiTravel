import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Landing from "./components/Landing.js";
import UploadImage from "./components/UploadImageDemo.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/upload" element={<UploadImage />} />
      </Routes>
    </Router>
  );
}

export default App;
