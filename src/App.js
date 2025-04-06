import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/inf8808-projet-eq24" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
