import React, { useRef, useState } from "react";
import ParallelCoordinates from "./ParallelCoordinates";
import useData from "../hooks/useData";
import BoxPlot from "./BoxPlot";
import ScatterPlot from "./ScatterPlot";
import RadialLineChart from "./RadialLineChart";
import Overview from "./Overview";
import Sidebar from "./Sidebar";
import CorrelationMatrix from "./CorrelationMatrix";
import SunburstChart from "./SunburstChart";
import { useDataHierarchy } from "../hooks/useDataHierarchy";
import { useSidebar } from "../context/SidebarContext";

const sectionStyle = {
  minHeight: "100vh",
  width: "100%",
  scrollSnapAlign: "start",
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  boxSizing: "border-box",
};

// Standardized section header style.
const sectionHeaderStyle = {
  position: "sticky",
  top: 0,
  backgroundColor: "#fff",
  padding: "15px 0px",
  zIndex: 1,
};

// Standardized container for visualizations.
const visualizationContainerStyle = {
  marginBottom: "20px",
  backgroundColor: "#fff",
};

const ScrollytellingDashboard = () => {
  const data = useData();
  const { isOpen } = useSidebar();
  const [activeSection, setActiveSection] = useState("overview");
  const overviewRef = useRef(null);
  const temporalRef = useRef(null);
  const multiplatformRef = useRef(null);
  const genreRef = useRef(null);
  const diffusionRef = useRef(null);
  const engagementRef = useRef(null);
  const hierarchicalData = useDataHierarchy(data);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const containerStyle = {
    marginLeft: isOpen ? "16rem" : "5rem",
    height: "100vh",
    width: `calc(100vw - ${isOpen ? "16rem" : "5rem"})`,
    overflowY: "auto",
    scrollSnapType: "y mandatory",
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
        <section ref={temporalRef} id="temporal" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Aspect Temporel</h1>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              Scatter Plot : Age vs. Spotify Streams
            </h2>
            <ScatterPlot data={data} />
            <p className="text-xs text-muted-foreground mt-2">
              Ce nuage de points interactif montre la relation entre l’âge des
              chansons et divers indicateurs de succès, avec une ligne de
              régression calculée en temps réel pour visualiser la tendance
              globale.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Graphique des Tendances Saisonnières
            </h2>
            <div style={visualizationContainerStyle}>
              <RadialLineChart data={data} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ce graphique radial permet d'identifier les tendances saisonnières
              en fonction du mois ou de la saison, en cliquant sur une section
              pour zoomer sur les détails.
            </p>
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
              <CorrelationMatrix data={data} />
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
              <SunburstChart data={hierarchicalData} />
            </div>
          </div>
        </section>
        {/* Aspect Genre Musical Section */}
        <section ref={genreRef} id="genre" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Aspect Genre Musical</h1>
          </div>
          <div style={visualizationContainerStyle}>
            <BoxPlot data={data} />
          </div>
          <div style={visualizationContainerStyle}>
            <ParallelCoordinates data={data} />
          </div>
        </section>
        {/* Aspect Diffusion & Rayonnement Section */}
        <section ref={diffusionRef} id="diffusion" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Aspect Diffusion & Rayonnement</h1>
          </div>
          <div style={visualizationContainerStyle}>
            <ParallelCoordinates data={data} />
          </div>
        </section>

        {/* Aspect Engagement Section */}
        <section ref={engagementRef} id="engagement" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1 className="text-3xl font-bold">
              Aspect Engagement des Utilisateurs
            </h1>
          </div>
          <div style={visualizationContainerStyle}>
            <ScatterPlot data={data} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScrollytellingDashboard;
