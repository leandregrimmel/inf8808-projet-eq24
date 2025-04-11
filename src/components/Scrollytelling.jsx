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
  border: "1px solid #ddd",
  marginBottom: "20px",
  borderRadius: "4px",
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

  const parallelConfigs = [
    {
      label:
        "Comment les indicateurs de popularité varient-ils selon l’artiste ?",
      dimensions: ["popularity", "streams"],
    },
    {
      label:
        "Comment la portée des playlists (Playlist Reach) influence-t-elle le nombre total de streams ?",
      dimensions: ["playlistReach", "streams"],
    },
    {
      label:
        "Quelle est la relation entre le nombre de playlists contenant une chanson et sa popularité globale ?",
      // Assuming you have a field "playlistCount" available in your data.
      dimensions: ["playlistCount", "popularity"],
    },
    {
      label:
        "Comment les diffusions radio (AirPlay Spins, SiriusXM Spins) se comparent-elles aux mesures de popularité en ligne ?",
      dimensions: ["airPlaySpins", "siriusXMSpins", "popularity"],
    },
  ];

  // We'll use a single state variable (pcIndex) to determine which parallel coordinates config is active.
  const [pcIndex, setPcIndex] = useState(0);
  // Handle parallel coordinates configuration navigation
  const nextPC = () => {
    setPcIndex((prev) => (prev + 1) % parallelConfigs.length);
  };
  const prevPC = () => {
    setPcIndex(
      (prev) => (prev - 1 + parallelConfigs.length) % parallelConfigs.length
    );
  };

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

        {/* Dedicated Parallel Coordinates Section (for both Genre Musical and Diffusion) */}
        <section id="parallel" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1 className="text-3xl font-bold">Analyse Parallèle</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {parallelConfigs[pcIndex].label}
            </p>
          </div>
          <div
            style={{
              ...visualizationContainerStyle,
              flex: 1,
              position: "relative",
            }}
          >
            <ParallelCoordinates
              data={data}
              config={parallelConfigs[pcIndex]}
            />
          </div>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <button className="mr-4 p-2 bg-gray-200 rounded" onClick={prevPC}>
              Précédent
            </button>
            <button className="p-2 bg-gray-200 rounded" onClick={nextPC}>
              Suivant
            </button>
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
