import React from "react";
import formatNumber from "../utils";

const QuestionCards = ({ scrollRefs, onQuestionSelect }) => {
  // List of question objects with their default configuration
  const questions = [
    {
      id: 1,
      question:
        "Comment la popularité d’une chanson varie-t-elle en fonction de son âge (calculé à partir de la date de sortie) ?",
      targetSection: "temporalAge",
      defaultConfig: { metric: "spotifyStreams" },
    },
    {
      id: 2,
      question:
        "Peut-on identifier des corrélations entre l’ancienneté d’une chanson et ses indicateurs de succès sur différentes plateformes ?",
      targetSection: "temporalAge",
      defaultConfig: { metric: "spotifyStreams" },
    },
    {
      id: 3,
      question:
        "Existe-t-il un lien entre le moment de l’année de la parution d’une chanson et sa popularité ?",
      targetSection: "temporalSeason",
      defaultConfig: { year: 2024, metric: "spotifyPopularity" },
    },
    {
      id: 4,
      question:
        "Quelle est la corrélation entre la popularité sur Spotify et les indicateurs provenant d’autres plateformes (YouTube, TikTok, Shazam) ?",
      targetSection: "multiCorrelation",
      defaultConfig: {
        metrics: [
          {
            id: "spotifyStreams",
            label: "Streams Spotify",
            format: formatNumber,
            description: "Streams totaux sur Spotify",
            unit: "streams",
          },
          {
            id: "tiktokViews",
            label: "Vues TikTok",
            format: formatNumber,
            description: "Vues totales sur TikTok",
            unit: "vues",
          },
          {
            id: "youtubeViews",
            label: "Vues YouTube",
            format: formatNumber,
            description: "Vues totales sur YouTube",
            unit: "vues",
          },
          {
            id: "shazamCounts",
            label: "Shazams",
            format: formatNumber,
            description: "Identifications Shazam",
            unit: "shazams",
          },
        ],
      },
    },
    {
      id: 5,
      question:
        "Les pics de popularité sur une plateforme suivent-ils ceux sur une autre ?",
      targetSection: "multiCorrelation",
      defaultConfig: {
        metrics: [
          {
            id: "spotifyStreams",
            label: "Streams Spotify",
            format: formatNumber,
            description: "Streams totaux sur Spotify",
            unit: "streams",
          },
          {
            id: "tiktokViews",
            label: "Vues TikTok",
            format: formatNumber,
            description: "Vues totales sur TikTok",
            unit: "vues",
          },
          {
            id: "youtubeViews",
            label: "Vues YouTube",
            format: formatNumber,
            description: "Vues totales sur YouTube",
            unit: "vues",
          },
          {
            id: "shazamCounts",
            label: "Shazams",
            format: formatNumber,
            description: "Identifications Shazam",
            unit: "shazams",
          },
        ],
      },
    },
    {
      id: 6,
      question:
        "Quelles plateformes attirent le plus grand nombre de consommateurs selon l’artiste ?",
      targetSection: "multiSunburst",
      defaultConfig: {},
    },
    {
      id: 7,
      question:
        "Comment les indicateurs de popularité varient-ils selon la présence de mots vulgaires ?",
      targetSection: "styleExplicit",
      defaultConfig: { metric: "spotifyStreams" },
    },
    {
      id: 8,
      question:
        "Comment les indicateurs de popularité varient-ils selon l’artiste ?",
      targetSection: "diffusionChart",
      defaultConfig: {
        info: "Pour sélectionner un artiste, utilisez la barre de recherche dans la barre latérale.",
      },
    },
    {
      id: 9,
      question:
        "Comment la portée des playlists (Playlist Reach) influence-t-elle le nombre total de streams ?",
      targetSection: "diffusionChart",
      defaultConfig: { metrics: ["spotifyPlaylistReach", "spotifyStreams"] },
    },
    {
      id: 10,
      question:
        "Quelle est la relation entre le nombre de playlists contenant une chanson et sa popularité globale ?",
      targetSection: "diffusionChart",
      defaultConfig: {
        metrics: [
          "spotifyPlaylistCount",
          "spotifyPopularity",
          "spotifyStreams",
          "tiktokViews",
          "youtubeViews",
        ],
      },
    },
    {
      id: 11,
      question:
        "Comment les diffusions radio (AirPlay Spins, SiriusXM Spins) se comparent-elles aux mesures de popularité en ligne ?",
      targetSection: "diffusionChart",
      defaultConfig: {
        metrics: [
          "airplaySpins",
          "siriusXMSpins",
          "spotifyPopularity",
          "spotifyStreams",
          "tiktokViews",
          "youtubeViews",
        ],
      },
    },
    {
      id: 12,
      question:
        "Comment le ratio vues/likes sur YouTube ou TikTok varie-t-il selon l’artiste ?",
      targetSection: "engagementRatio",
      defaultConfig: {},
    },
    {
      id: 13,
      question:
        "Quelle est la relation entre les posts TikTok et les vues TikTok, et comment cela impacte-t-il la popularité Spotify ?",
      targetSection: "engagementTikTok",
      defaultConfig: {},
    },
    {
      id: 14,
      question:
        "Comment l'engagement sur Shazam (recherche de titres) corrèle-t-il avec la découvrabilité d'une chanson sur d'autres plateformes ?",
      targetSection: "diffusionChart",
      defaultConfig: {
        metrics: [
          "shazamCounts",
          "spotifyStreams",
          "spotifyPopularity",
          "tiktokViews",
          "youtubeViews",
        ],
      },
    },
  ];

  // Handle card click: set the selected question and scroll to its section
  const handleClick = (questionObj) => {
    onQuestionSelect(questionObj);
    if (
      scrollRefs &&
      scrollRefs[questionObj.targetSection] &&
      scrollRefs[questionObj.targetSection].current
    ) {
      scrollRefs[questionObj.targetSection].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Questions de l'Analyse</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {questions.map((q) => (
          <div
            key={q.id}
            onClick={() => handleClick(q)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            <h3 style={{ marginBottom: "10px", fontSize: "16px" }}>
              Question {q.id}
            </h3>
            <p style={{ fontSize: "14px", color: "#333" }}>{q.question}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCards;
