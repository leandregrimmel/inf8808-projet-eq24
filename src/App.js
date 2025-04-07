import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/inf8808-projet-eq24" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/inf8808-projet-eq24" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
