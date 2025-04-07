import React, { useState } from "react";
import useData from "../hooks/useData";
import BoxPlot from "./BoxPlot";
import CorrelationMatrix from "./CorrelationMatrix";
import BarChart from "./BarChart";
import ScatterPlot from "./ScatterPlot";
import * as d3 from "d3";
import "../styles/Dashboard.css";

// Icons for navigation (SVG paths)
const icons = {
  overview: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1"></rect>
      <rect x="14" y="3" width="7" height="7" rx="1"></rect>
      <rect x="14" y="14" width="7" height="7" rx="1"></rect>
      <rect x="3" y="14" width="7" height="7" rx="1"></rect>
    </svg>
  ),
  boxplot: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M8 3v18M16 3v18"></path>
      <rect x="5" y="8" width="6" height="8" rx="1"></rect>
      <rect x="13" y="8" width="6" height="8" rx="1"></rect>
    </svg>
  ),
  correlation: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
      <path d="M7 7l10 10M17 7L7 17"></path>
    </svg>
  ),
  barchart: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M20 20v-4M16 20V10M12 20v-8M8 20v-6M4 20v-2"></path>
      <path d="M4 4v16h16"></path>
    </svg>
  ),
  scatterplot: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
      <circle cx="8" cy="8" r="2"></circle>
      <circle cx="16" cy="16" r="2"></circle>
      <circle cx="8" cy="16" r="2"></circle>
      <circle cx="16" cy="8" r="2"></circle>
      <circle cx="12" cy="12" r="2"></circle>
      <path d="M3 3h18v18H3z"></path>
    </svg>
  ),
};

const Dashboard = () => {
  const data = useData();
  const [activeViz, setActiveViz] = useState("overview");

  if (!data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  // Helper to render the active visualization
  const renderVisualization = () => {
    switch (activeViz) {
      case "boxplot":
        return (
          <div className="viz-container">
            <h2>Stream Distribution by Explicit Content</h2>
            <p>Compare distribution of Spotify streams between explicit and non-explicit tracks</p>
            <BoxPlot data={data} />
          </div>
        );
      case "correlation":
        return (
          <div className="viz-container">
            <h2>Correlation Matrix</h2>
            <p>Explore relationships between different metrics across platforms</p>
            <CorrelationMatrix data={data} />
          </div>
        );
      case "barchart":
        return (
          <div className="viz-container">
            <h2>Popularity by Release Year</h2>
            <p>Average Spotify popularity score by year of release</p>
            <BarChart data={data} />
          </div>
        );
      case "scatterplot":
        return (
          <div className="viz-container">
            <h2>Age vs. Stream Count</h2>
            <p>Relationship between song age and number of Spotify streams</p>
            <ScatterPlot data={data} />
          </div>
        );
      case "overview":
      default:
        return (
          <div className="overview-container">
            <h2>Spotify Top Streamed Songs 2024</h2>
            <p>Explore the dataset through different visualizations</p>
            <div className="stats-container">
              <div className="stat-card">
                <h3>Total Tracks</h3>
                <p className="stat-value">{data.length}</p>
              </div>
              <div className="stat-card">
                <h3>Avg. Spotify Streams</h3>
                <p className="stat-value">
                  {Math.round(
                    d3.mean(data, (d) => d.spotifyStreams)
                  ).toLocaleString()}
                </p>
              </div>
              <div className="stat-card">
                <h3>Explicit Tracks</h3>
                <p className="stat-value">
                  {data.filter((d) => d.explicitTrack).length} 
                  <span className="stat-percentage">
                    ({Math.round((data.filter((d) => d.explicitTrack).length / data.length) * 100)}%)
                  </span>
                </p>
              </div>
              <div className="stat-card">
                <h3>Most Recent</h3>
                <p className="stat-value">
                  {new Date(
                    Math.max(...data.map((d) => d.releaseDate))
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="viz-grid">
              <div className="viz-preview" onClick={() => setActiveViz("boxplot")}>
                <h3>Stream Distribution</h3>
                <div className="preview-img boxplot-preview"></div>
              </div>
              <div className="viz-preview" onClick={() => setActiveViz("correlation")}>
                <h3>Correlation Matrix</h3>
                <div className="preview-img corr-preview"></div>
              </div>
              <div className="viz-preview" onClick={() => setActiveViz("barchart")}>
                <h3>Popularity by Year</h3>
                <div className="preview-img bar-preview"></div>
              </div>
              <div className="viz-preview" onClick={() => setActiveViz("scatterplot")}>
                <h3>Age vs. Streams</h3>
                <div className="preview-img scatter-preview"></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="spotify-logo">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"></path>
            </svg>
            Spotify Data
          </h1>
        </div>
        <nav className="viz-nav">
          <button 
            className={activeViz === "overview" ? "active" : ""} 
            onClick={() => setActiveViz("overview")}
          >
            <span className="nav-icon">{icons.overview}</span>
            Overview
          </button>
          <button 
            className={activeViz === "boxplot" ? "active" : ""} 
            onClick={() => setActiveViz("boxplot")}
          >
            <span className="nav-icon">{icons.boxplot}</span>
            Box Plot
          </button>
          <button 
            className={activeViz === "correlation" ? "active" : ""} 
            onClick={() => setActiveViz("correlation")}
          >
            <span className="nav-icon">{icons.correlation}</span>
            Correlation Matrix
          </button>
          <button 
            className={activeViz === "barchart" ? "active" : ""} 
            onClick={() => setActiveViz("barchart")}
          >
            <span className="nav-icon">{icons.barchart}</span>
            Bar Chart
          </button>
          <button 
            className={activeViz === "scatterplot" ? "active" : ""} 
            onClick={() => setActiveViz("scatterplot")}
          >
            <span className="nav-icon">{icons.scatterplot}</span>
            Scatter Plot
          </button>
        </nav>
      </aside>
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Spotify Data Visualization</h1>
        </header>
        <main className="dashboard-content">
          {renderVisualization()}
        </main>
        <footer className="dashboard-footer">
          <p>INF8808 Project - Spotify Data Visualization - 2024</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
