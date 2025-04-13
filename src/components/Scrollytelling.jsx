// ScrollytellingDashboard.jsx
import React, { useRef, useState } from "react";
import CrossPlatformPerformanceChart from "./DifusionSection/CrossPlatformPerformanceChart";
import ExpliciteContentAnalysis from "./MusicalStyleSection/ExpliciteContentAnalysis";
import Overview from "./Overview";
import CorrelationMatrix from "./MultiPlatformSection/CorrelationMatrix";
import SunburstChart from "./MultiPlatformSection/SunburstChart";
import { useDataHierarchy } from "../hooks/useDataHierarchy";
import { useSidebar } from "../context/SidebarContext";
import AgeVsStreams from "./TemporalSection/AgeVsPopularityMetric";
import AnnualTrends from "./TemporalSection/AnnualTrends";
import Sidebar from "./Sidebar/Sidebar";
import useFilteredData from "../hooks/useFilteredData";
import RatioChart from "./UserEngagementSection/RatioChart";
import TikTokImpact from "./UserEngagementSection/TikTokImpact";
import QuestionCards from "./QuestionCards";

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

  // Create refs for key sections
  const overviewRef = useRef(null);
  const temporalRef = useRef(null);
  const multiplatformRef = useRef(null);
  const styleRef = useRef(null);
  const diffusionRef = useRef(null);
  const engagementRef = useRef(null);

  const temporalAgeRef = useRef(null); // For questions 1 and 2 (Age vs. Popularity)
  const temporalSeasonRef = useRef(null); // For question 3 (Annual Trends)
  const multiCorrelationRef = useRef(null); // For questions 4 and 5 (Correlation Matrix)
  const multiSunburstRef = useRef(null); // For question 6 (Sunburst Chart)
  const styleExplicitRef = useRef(null); // For question 7 (Explicite Content Analysis)
  const diffusionChartRef = useRef(null); // For questions 8, 9, 10, 11, 14 (CrossPlatformPerformanceChart)
  const engagementRatioRef = useRef(null); // For question 12 (Ratio Chart)
  const engagementTikTokRef = useRef(null); // For question 13 (TikTok Impact)
  // (If needed, add additional ref for ShazamCorrelation, for example)

  // Mapping of keys to refs for QuestionCards
  const scrollRefs = {
    temporalAge: temporalAgeRef,
    temporalSeason: temporalSeasonRef,
    multiCorrelation: multiCorrelationRef,
    multiSunburst: multiSunburstRef,
    styleExplicit: styleExplicitRef,
    diffusionChart: diffusionChartRef,
    engagementRatio: engagementRatioRef,
    engagementTikTok: engagementTikTokRef,
  };

  // State for the currently selected question
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    // (Additional logic to update chart metrics can be added here.)
  };

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
          styleRef,
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
          <Overview temporalSectionRef={sectionStyle} />
        </section>

        {/* Questions Cards Section */}
        <section id="questions-cards" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Questions</h1>
          </div>
          <QuestionCards
            scrollRefs={scrollRefs}
            onQuestionSelect={handleQuestionSelect}
          />
        </section>

        {/* Aspect Temporel Section */}
        <section id="temporal" style={{ sectionStyle }}>
          <div style={{ ...sectionHeaderStyle, height: "80px" }}>
            <h1>Aspect Temporel</h1>
          </div>
          {/* Age vs. Popularity Metric */}
          <div
            ref={temporalAgeRef}
            style={{
              minHeight: "100vh",
              width: "100%",
              padding: "0 40px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: "80px",
                backgroundColor: "#fff",
                padding: "0 0 15px 0",
                zIndex: 1,
              }}
            >
              <h2>Age vs. Popularity Metric</h2>
            </div>
            <AgeVsStreams
              data={filteredData}
              initialMetric={
                selectedQuestion?.targetSection === "temporalAge" &&
                selectedQuestion?.defaultConfig.metric
                  ? selectedQuestion.defaultConfig.metric
                  : "spotifyStreams"
              }
            />
          </div>

          {/* Seasonal Trends */}
          <div
            ref={temporalSeasonRef}
            style={{
              minHeight: "100vh",
              width: "100%",
              padding: "0 40px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: "80px",
                backgroundColor: "#fff",
                padding: "0 0 15px 0",
                zIndex: 1,
              }}
            >
              <h2>Graphique des Tendances Saisonnières</h2>
            </div>
            <AnnualTrends
              data={filteredData}
              initialYear={
                selectedQuestion?.targetSection === "temporalSeason" &&
                selectedQuestion?.defaultConfig.year
                  ? selectedQuestion.defaultConfig.year
                  : 2024
              }
            />
          </div>
        </section>

        {/* Aspect Multi-plateformes Section */}
        <section id="multiplatform" style={sectionStyle}>
          <div style={{ ...sectionHeaderStyle, height: "80px" }}>
            <h1>Aspect Multi-plateformes</h1>
          </div>
          {/* Correlation Matrix */}
          <div
            ref={multiCorrelationRef}
            style={{
              minHeight: "100vh",
              width: "100%",
              padding: "0 40px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: "80px",
                backgroundColor: "#fff",
                padding: "0 0 15px 0",
                zIndex: 1,
              }}
            >
              <h2>Matrice de Corrélation</h2>
            </div>
            <CorrelationMatrix
              data={filteredData}
              defaultMetrics={
                selectedQuestion?.targetSection === "multiCorrelation" &&
                selectedQuestion?.defaultConfig.metrics
                  ? selectedQuestion.defaultConfig.metrics
                  : [
                      "spotifyStreams",
                      "youtubeViews",
                      "tiktokViews",
                      "shazamCounts",
                    ]
              }
            />
          </div>
          {/* Sunburst Chart */}
          <div
            ref={multiSunburstRef}
            style={{
              minHeight: "100vh",
              width: "100%",
              padding: "0 40px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: "80px",
                backgroundColor: "#fff",
                padding: "0 0 15px 0",
                zIndex: 1,
              }}
            >
              <h2>
                Sunburst Chart : Répartition des Consommations par Artiste et
                Plateforme
              </h2>
            </div>
            <SunburstChart data={useDataHierarchy(filteredData)} />
          </div>
        </section>

        {/* Aspect Style Musical Section */}
        <section id="style" style={{ sectionStyle }}>
          <div style={{ ...sectionHeaderStyle, height: "80px" }}>
            <h1>Aspect Style Musical et Contenu Explicite</h1>
          </div>
          <div
            ref={styleExplicitRef}
            style={{
              minHeight: "100vh",
              width: "100%",
              padding: "0 40px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: "80px",
                backgroundColor: "#fff",
                padding: "0 0 15px 0",
                zIndex: 1,
              }}
            >
              <h2>Analyse des Contenus Explicites</h2>
            </div>
            <ExpliciteContentAnalysis
              data={filteredData}
              initialMetric={
                selectedQuestion?.targetSection === "styleExplicit" &&
                selectedQuestion?.defaultConfig.metric
                  ? selectedQuestion.defaultConfig.metric
                  : "spotifyStreams"
              }
              availableMetrics={[
                { value: "spotifyStreams", label: "Streams Spotify" },
                { value: "spotifyPopularity", label: "Popularité Spotify" },
                { value: "playlistReach", label: "Portée des playlists" },
                { value: "youtubeLikes", label: "Likes YouTube" },
              ]}
            />
          </div>
        </section>

        {/* Aspect Diffusion & Rayonnement Section */}
        <section id="diffusion" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Aspect Diffusion & Rayonnement</h1>
          </div>
          <div
            ref={diffusionChartRef}
            style={{
              minHeight: "100vh",
              width: "100%",
              padding: "0 40px",
              boxSizing: "border-box",
            }}
          >
            <CrossPlatformPerformanceChart
              data={filteredData}
              defaultConfig={
                selectedQuestion?.targetSection === "diffusionChart"
                  ? selectedQuestion.defaultConfig
                  : {}
              }
            />
            {selectedQuestion?.targetSection === "diffusionChart" &&
              selectedQuestion.defaultConfig.info && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {selectedQuestion.defaultConfig.info}
                </p>
              )}
          </div>
        </section>

        {/* Aspect Engagement des Utilisateurs Section */}
        <section id="engagement" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Aspect Engagement des Utilisateurs</h1>
          </div>
          <div
            ref={engagementRatioRef}
            style={{
              minHeight: "100vh",
              width: "100%",
              padding: "0 40px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: "80px",
                backgroundColor: "#fff",
                padding: "0 0 15px 0",
                zIndex: 1,
              }}
            >
              <h2>Ratio Vues/Likes par Plateforme</h2>
            </div>
            <RatioChart data={filteredData} />
          </div>

          <div
            ref={engagementTikTokRef}
            style={{
              minHeight: "100vh",
              width: "100%",
              padding: "0 40px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: "80px",
                backgroundColor: "#fff",
                padding: "0 0 15px 0",
                zIndex: 1,
              }}
            >
              <h2>Impact des Posts TikTok sur la Popularité</h2>
            </div>
            <TikTokImpact data={filteredData} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScrollytellingDashboard;
