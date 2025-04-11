import React, { useRef } from "react";
import useData from "../hooks/useData";
import ScatterPlot from "./ScatterPlot";
import RadialLineChart from "./RadialLineChart";
import Overview from "./Overview";
import MultiPlatformOverview from "./MultiPlatformOverview";
import Dashboard from "./Dashboard";
import ScrollytellingSidebar from "./ScrollytellingSidebar";

// Use your existing styling where applicable. Adjustments include using "minHeight" to ensure
// sections fill the viewport and a sticky header style that “clips” the title at the top.
const containerStyle = {
  marginLeft: "220px",
  height: "100vh",
  overflowY: "auto", // use auto so that snapping works correctly
  scrollSnapType: "y mandatory",
};

const sectionStyle = {
  minHeight: "100vh", // allows sections to fill the viewport
  scrollSnapAlign: "start",
  padding: "40px",
  boxSizing: "border-box",
};

// Style for the section title that becomes sticky
const stickyTitleStyle = {
  position: "sticky",
  top: 0,
  backgroundColor: "#fff", // using white background to “clip” the title
  padding: "10px 0",
  marginBottom: "20px",
  zIndex: 1,
};

const ScrollytellingDashboard = () => {
  const data = useData();
  const [activeSection, setActiveSection] = React.useState("dashboard");
  // Create refs for each section (adding Dashboard and Overview here)
  const dashboardRef = useRef(null);
  const overviewRef = useRef(null);
  const temporalRef = useRef(null);
  const multiplatformRef = useRef(null);
  const genreRef = useRef(null);
  const diffusionRef = useRef(null);
  const engagementRef = useRef(null);

  // Smooth scroll to the referenced section.
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
      <div className="flex bg-background">
        <div style={{ display: "flex" }}>
          <ScrollytellingSidebar
            scrollToSection={scrollToSection}
            sectionRefs={{
              dashboardRef,
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

          {/* Main Scrollable Container with Scroll Snapping */}
          <div style={containerStyle}>
            {/* Dashboard Section */}
            <section ref={dashboardRef} id="dashboard" style={sectionStyle}>
              <div style={stickyTitleStyle}>
                <h1 className="text-3xl font-bold">Dashboard</h1>
              </div>
              <Dashboard />
            </section>

            {/* Overview Section */}
            <section ref={overviewRef} id="overview" style={sectionStyle}>
              <div style={stickyTitleStyle}>
                <h1 className="text-3xl font-bold">Overview</h1>
              </div>
              <Overview />
            </section>

            {/* Section 1: Aspect Temporel */}
            <section ref={temporalRef} id="temporal" style={sectionStyle}>
              <div style={stickyTitleStyle}>
                <h1 className="text-3xl font-bold">Aspect Temporel</h1>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  Scatter Plot : Age vs. Spotify Streams
                </h2>
                <ScatterPlot data={data} />
                <p className="text-xs text-muted-foreground mt-2">
                  Ce nuage de points interactif montre la relation entre
                  l&apos;âge des chansons et divers indicateurs de succès, avec
                  une ligne de régression calculée en temps réel pour visualiser
                  la tendance globale.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Graphique des Tendances Saisonnières
                </h2>
                <RadialLineChart data={data} />
                <p className="text-xs text-muted-foreground mt-2">
                  Ce graphique radial permet d&apos;identifier les tendances
                  saisonnières en fonction du mois ou de la saison, en cliquant
                  sur une section pour zoomer sur les détails.
                </p>
              </div>
            </section>

            {/* Section 2: Aspect Multi-plateformes */}
            <section
              ref={multiplatformRef}
              id="multiplatform"
              style={sectionStyle}
            >
              <div style={stickyTitleStyle}>
                <h1 className="text-3xl font-bold">Aspect Multi-plateformes</h1>
              </div>
              <MultiPlatformOverview data={data} />
            </section>

            {/* Section 3: Aspect Genre Musical */}
            <section ref={genreRef} id="genre" style={sectionStyle}>
              <div style={stickyTitleStyle}>
                <h1 className="text-3xl font-bold">Aspect Genre Musical</h1>
              </div>
              <p>Contenu à venir (Boxplot, Parallel Coordinates, etc.)</p>
            </section>

            {/* Section 4: Aspect Diffusion et Rayonnement */}
            <section ref={diffusionRef} id="diffusion" style={sectionStyle}>
              <div style={stickyTitleStyle}>
                <h1 className="text-3xl font-bold">
                  Aspect Diffusion & Rayonnement
                </h1>
              </div>
              <p>Contenu à venir (Parallel Coordinates, etc.)</p>
            </section>

            {/* Section 5: Aspect Engagement Utilisateur */}
            <section ref={engagementRef} id="engagement" style={sectionStyle}>
              <div style={stickyTitleStyle}>
                <h1 className="text-3xl font-bold">
                  Aspect Engagement des Utilisateurs
                </h1>
              </div>
              {/* Uncomment and add content when ready */}
              {/* <EngagementSection data={data} /> */}
            </section>
          </div>
        </div>
      </div>
  );
};

export default ScrollytellingDashboard;
