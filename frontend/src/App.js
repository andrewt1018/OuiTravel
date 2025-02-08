import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
//hello
//test commit

import Landing from "./components/Landing.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
