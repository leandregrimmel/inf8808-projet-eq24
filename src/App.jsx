import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Scrollytelling from "./components/Scrollytelling";
import "./App.css";
import { SidebarProvider } from "./context/SidebarContext";
import { FilterProvider } from "./context/FilterContext";

function App() {
  return (
    <FilterProvider>
      <SidebarProvider>
        <Router>
          <Routes>
            <Route path="/inf8808-projet-eq24" element={<Scrollytelling />} />
            <Route
              path="/"
              element={<Navigate to="/inf8808-projet-eq24" replace />}
            />
          </Routes>
        </Router>
      </SidebarProvider>
    </FilterProvider>
  );
}

export default App;
