import { ArrowUpToLine } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
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

const ScrollytellingDashboard = () => {
  const filteredData = useFilteredData();
  const { isOpen } = useSidebar();
  const [activeSection, setActiveSection] = useState("overview");

  const overviewRef = useRef(null);
  const questionsRef = useRef(null);
  const temporalRef = useRef(null);
  const multiplatformRef = useRef(null);
  const styleRef = useRef(null);
  const diffusionRef = useRef(null);
  const engagementRef = useRef(null);

  const temporalAgeRef = useRef(null);
  const temporalSeasonRef = useRef(null);
  const multiCorrelationRef = useRef(null);
  const multiSunburstRef = useRef(null);
  const styleExplicitRef = useRef(null);
  const diffusionChartRef = useRef(null);
  const engagementRatioRef = useRef(null);
  const engagementTikTokRef = useRef(null);

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

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
  };

  console.log(
    selectedQuestion?.targetSection === "styleExplicit" &&
      selectedQuestion?.defaultConfig.metric
      ? selectedQuestion.defaultConfig.metric
      : "spotifyStreams"
  );

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const containerRef = useRef(null);
  const containerStyle = {
    marginLeft: isOpen ? "18rem" : "5rem",
    height: "100vh",
    width: `calc(100vw - ${isOpen ? "18rem" : "5rem"})`,
    overflowY: "auto",
    transition: "margin-left 0.3s ease, width 0.3s ease",
  };

  const [showTopButton, setShowTopButton] = useState(false);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => {
      setShowTopButton(container.scrollTop > 100);
    };
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const goTopButtonStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "10px",
    backgroundColor: "#d3d3d3",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    zIndex: 1000,
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    transition:
      "background-color 0.3s ease, transform 0.3s ease, opacity 0.3s ease",
  };

  const dynamicButtonStyle = {
    ...goTopButtonStyle,
    backgroundColor: isHover ? "#a9a9a9" : "#d3d3d3",
    transform: isHover ? "scale(1.1)" : "scale(1)",
    pointerEvents: showTopButton ? "auto" : "none",
  };

  return (
    <div className="flex bg-background">
      <Sidebar
        scrollToSection={scrollToSection}
        sectionRefs={{
          overviewRef,
          questionsRef,
          temporalRef,
          multiplatformRef,
          styleRef,
          diffusionRef,
          engagementRef,
        }}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div ref={containerRef} style={containerStyle}>
        <section ref={overviewRef} id="overview" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Vue d'ensemble</h1>
          </div>
          <Overview temporalSectionRef={temporalRef} />
        </section>

        <section ref={questionsRef} id="questions" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h1>Questions</h1>
          </div>
          <div
            style={{
              minHeight: "50vh",
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
              <h2>Explorez nos questions d'analyse</h2>
            </div>
            <QuestionCards
              scrollRefs={scrollRefs}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>
        </section>

        <section ref={temporalRef} id="temporal" style={{ sectionStyle }}>
          <div style={{ ...sectionHeaderStyle, height: "80px" }}>
            <h1>Aspect Temporel</h1>
          </div>
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
              <h2>Âge vs. Indicateur de Popularité</h2>
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
              <h2>Tendances Saisonnières</h2>
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

        <section ref={multiplatformRef} id="multiplatform" style={sectionStyle}>
          <div style={{ ...sectionHeaderStyle, height: "80px" }}>
            <h1>Aspect Multi-plateformes</h1>
          </div>
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
                  : []
              }
            />
          </div>
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
              <h2>Répartition des Consommations par Artiste et Plateforme</h2>
            </div>
            <SunburstChart data={useDataHierarchy(filteredData)} />
          </div>
        </section>

        <section ref={styleRef} id="style" style={{ sectionStyle }}>
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
            />
          </div>
        </section>

        <section ref={diffusionRef} id="diffusion" style={sectionStyle}>
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

        <section ref={engagementRef} id="engagement" style={sectionStyle}>
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
      {showTopButton && (
        <button
          style={dynamicButtonStyle}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={() =>
            containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
          }
        >
          <ArrowUpToLine />
        </button>
      )}
    </div>
  );
};

export default ScrollytellingDashboard;
