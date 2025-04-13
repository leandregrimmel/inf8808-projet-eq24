import React, { useRef, useState } from "react";
import CrossPlatformPerformanceChart from "./DifusionAspect/CrossPlatformPerformanceChart";
import ExpliciteContentAnalysis from "./MusicalGenreSection/ExpliciteContentAnalysis";
import Overview from "./Overview";
import CorrelationMatrix from "./CorrelationMatrix";
import SunburstChart from "./SunburstChart";
import { useDataHierarchy } from "../hooks/useDataHierarchy";
import { useSidebar } from "../context/SidebarContext";
import AgeVsStreams from "./TemporalSection/AgeVsStreams";
import SeasonalTrends from "./TemporalSection/SeasonalTrends";
import Sidebar from "./Sidebar/Sidebar";
import useFilteredData from "../hooks/useFilteredData";

const sectionStyle = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  boxSizing: "border-box",
};

const sectionHeaderStyle = {
  position: "sticky",
  top: 0,
  backgroundColor: "#fff",
  padding: "15px 0px",
  zIndex: 2,
};

const visualizationContainerStyle = {
  marginBottom: "20px",
  backgroundColor: "#fff",
};

const temporalSectionStyle = {
  ...sectionStyle,
  padding: "0",
};

const subsectionStyle = {
  minHeight: "100vh",
  width: "100%",
  padding: "0 40px",
  boxSizing: "border-box",
};

const temporalHeaderStyle = {
  ...sectionHeaderStyle,
  height: "80px",
};

const subsectionHeaderStyle = {
  position: "sticky",
  top: "80px",
  backgroundColor: "#fff",
  padding: "0 0 15px 0",
  zIndex: 1,
};

const ScrollytellingDashboard = () => {
  const filteredData = useFilteredData();
  const { isOpen } = useSidebar();
  const [activeSection, setActiveSection] = useState("overview");

  const overviewRef = useRef(null);
  const temporalRef = useRef(null);
  const multiplatformRef = useRef(null);
  const genreRef = useRef(null);
  const diffusionRef = useRef(null);
  const engagementRef = useRef(null);
  
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const containerStyle = {
    marginLeft: isOpen ? "16rem" : "5rem",
    height: "100vh",
    width: `calc(100vw - ${isOpen ? "16rem" : "5rem"})`,
    overflowY: "auto",
    transition: "margin-left 0.3s ease, width 0.3s ease",
  };

  return (
    <div className="flex bg-background">
      <Sidebar
        scrollToSection={scrollToSection}
        sectionRefs={{
          overviewRef,
          temporalRef,
          multiplatformRef,
          genreRef,
          diffusionRef,
          engagementRef,
        }}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div style={containerStyle}>
        {/* Overview Section */}
        <section ref={overviewRef} id="overview" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Overview</h1>
          </div>
          <Overview />
        </section>

        {/* Aspect Temporel Section */}
        <section ref={temporalRef} id="temporal" style={temporalSectionStyle}>
          <div style={temporalHeaderStyle}>
            <h1>Aspect Temporel</h1>
          </div>

          {/* Scatter Plot Subsection */}
          <div style={subsectionStyle}>
            <div style={subsectionHeaderStyle}>
              <h2>Age vs. Spotify Streams</h2>
            </div>
            <AgeVsStreams data={filteredData} />
          </div>

          {/* Seasonal Trends Subsection */}
          <div style={subsectionStyle}>
            <div style={subsectionHeaderStyle}>
              <h2>Graphique des Tendances Saisonnières</h2>
            </div>
            <SeasonalTrends data={filteredData} />
          </div>
        </section>

        {/* Aspect Multi-plateformes Section */}
        <section ref={multiplatformRef} id="multiplatform" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Aspect Multi-plateformes</h1>
          </div>
          <div className="p-6 space-y-8">
            <h2 className="text-2xl font-bold mb-4">Matrice de Corrélation</h2>
            <p className="mb-4 text-muted-foreground">
              Explorez les relations entre différents indicateurs issus de
              plateformes variées.
            </p>
            <div style={visualizationContainerStyle}>
              <CorrelationMatrix data={filteredData} />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Sunburst Chart : Répartition des Consommations par Artiste et
              Plateforme
            </h2>
            <p className="mb-4 text-muted-foreground">
              Ce graphique vous permet de visualiser comment les différents
              canaux se répartissent pour les artistes les plus populaires. Le
              niveau 1 présente le top des artistes (ex. top 10 basé sur la
              somme des streams) et les niveaux suivants détaillent la
              contribution de chaque plateforme.
            </p>
            <div style={visualizationContainerStyle}>
              <SunburstChart data={useDataHierarchy(filteredData)} />
            </div>
          </div>
        </section>

        {/* Aspect Genre Musical Section */}
        <section ref={genreRef} id="genre" style={temporalSectionStyle}>
          <div style={temporalHeaderStyle}>
            <h1>Aspect Genre Musical et Contenu Explicite</h1>
          </div>

          {/* Box Plot Subsection */}
          <div style={subsectionStyle}>
            <div style={subsectionHeaderStyle}>
              <h2>Analyse des Contenus Explicites</h2>
            </div>
            <ExpliciteContentAnalysis
              data={filteredData}
              initialMetric="spotifyStreams"
              availableMetrics={[
                { value: "spotifyStreams", label: "Streams Spotify" },
                { value: "spotifyPopularity", label: "Popularité Spotify" },
                { value: "playlistReach", label: "Portée des playlists" },
                { value: "youtubeLikes", label: "Likes YouTube" },
              ]}
            />
          </div>
        </section>
        <section ref={diffusionRef} id="diffusion" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Aspect Diffusion & Rayonnement</h1>
          </div>
          <div style={visualizationContainerStyle}>
            <CrossPlatformPerformanceChart data={filteredData} />
          </div>
        </section>

        {/* Aspect Engagement Section */}
        <section ref={engagementRef} id="engagement" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Aspect Engagement des Utilisateurs</h1>
          </div>
          <div style={visualizationContainerStyle}>
            {/* <ScatterPlot data={filteredData} /> */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScrollytellingDashboard;
