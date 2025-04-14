import React from "react";

const QuestionCards = ({ scrollRefs, onQuestionSelect }) => {
  const sectionColors = {
    temporal: "rgba(245, 158, 11, 0.15)",
    multiplatform: "rgba(101, 163, 13, 0.15)",
    style: "rgba(168, 85, 247, 0.15)",
    diffusion: "rgba(239, 68, 68, 0.15)",
    engagement: "rgba(6, 182, 212, 0.15)",
    questions: "rgba(107, 114, 128, 0.15)",
  };

  const borderColors = {
    temporal: "#f59e0b",
    multiplatform: "#65a30d",
    style: "#a855f7",
    diffusion: "#ef4444",
    engagement: "#06b6d4",
    questions: "#6b7280",
  };

  const questions = [
    {
      id: 1,
      question:
        "Comment la popularité d'une chanson varie-t-elle en fonction de son âge (calculé à partir de la date de sortie) ?",
      targetSection: "temporalAge",
      section: "temporal",
      defaultConfig: { metric: "spotifyStreams" },
    },
    {
      id: 2,
      question:
        "Peut-on identifier des corrélations entre l'ancienneté d'une chanson et ses indicateurs de succès sur différentes plateformes ?",
      targetSection: "temporalAge",
      section: "temporal",
      defaultConfig: { metric: "spotifyStreams" },
    },
    {
      id: 3,
      question:
        "Existe-t-il un lien entre le moment de l'année de la parution d'une chanson et sa popularité ?",
      targetSection: "temporalSeason",
      section: "temporal",
      defaultConfig: { year: 2024, metric: "spotifyPopularity" },
    },

    {
      id: 4,
      question:
        "Quelle est la corrélation entre la popularité sur Spotify et les indicateurs provenant d'autres plateformes (YouTube, TikTok, Shazam) ?",
      targetSection: "multiCorrelation",
      section: "multiplatform",
      defaultConfig: {
        metrics: [
          { id: "spotifyStreams", label: "Streams Spotify" },
          { id: "tiktokViews", label: "Vues TikTok" },
          { id: "youtubeViews", label: "Vues YouTube" },
          { id: "shazamCounts", label: "Shazams" },
        ],
      },
    },
    {
      id: 5,
      question:
        "Les pics de popularité sur une plateforme suivent-ils ceux sur une autre ?",
      targetSection: "multiCorrelation",
      section: "multiplatform",
      defaultConfig: {
        metrics: [
          { id: "spotifyStreams", label: "Streams Spotify" },
          { id: "tiktokViews", label: "Vues TikTok" },
          { id: "youtubeViews", label: "Vues YouTube" },
          { id: "shazamCounts", label: "Shazams" },
        ],
      },
    },
    {
      id: 6,
      question:
        "Quelles plateformes attirent le plus grand nombre de consommateurs selon l'artiste ?",
      targetSection: "multiSunburst",
      section: "multiplatform",
      defaultConfig: {},
    },

    {
      id: 7,
      question:
        "Comment les indicateurs de popularité varient-ils selon l'artiste ?",
      targetSection: "diffusionChart",
      section: "style",
      defaultConfig: {},
    },
    {
      id: 8,
      question:
        "Comment les indicateurs de popularité varient-ils selon la présence de mots vulgaires ?",
      targetSection: "styleExplicit",
      section: "style",
      defaultConfig: { metric: "spotifyStreams" },
    },

    {
      id: 9,
      question:
        "Comment la portée des playlists (Playlist Reach) influence-t-elle le nombre total de streams ?",
      targetSection: "diffusionChart",
      section: "diffusion",
      defaultConfig: { metrics: ["spotifyPlaylistReach", "spotifyStreams"] },
    },
    {
      id: 10,
      question:
        "Quelle est la relation entre le nombre de playlists contenant une chanson et sa popularité globale ?",
      targetSection: "diffusionChart",
      section: "diffusion",
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
      section: "diffusion",
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
        "Comment le ratio vues/likes sur YouTube ou TikTok varie-t-il selon l'artiste ?",
      targetSection: "engagementRatio",
      section: "engagement",
      defaultConfig: {},
    },
    {
      id: 13,
      question:
        "Quelle est la relation entre les posts TikTok et les vues TikTok, et comment cela impacte-t-il la popularité Spotify ?",
      targetSection: "engagementTikTok",
      section: "engagement",
      defaultConfig: {},
    },
    {
      id: 14,
      question:
        "Comment l'engagement sur Shazam (recherche de titres) corrèle-t-il avec la découvrabilité d'une chanson sur d'autres plateformes ?",
      targetSection: "diffusionChart",
      section: "engagement",
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

  const handleClick = (questionObj) => {
    onQuestionSelect(questionObj);
    if (scrollRefs && scrollRefs[questionObj.targetSection]?.current) {
      scrollRefs[questionObj.targetSection].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {questions.map((q) => (
          <div
            key={q.id}
            onClick={() => handleClick(q)}
            style={{
              borderLeft: `4px solid ${borderColors[q.section]}`,
              borderRadius: "8px",
              padding: "18px",
              cursor: "pointer",
              backgroundColor: sectionColors[q.section],
              transition: "all 0.2s ease",
              minHeight: "120px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)";
              e.currentTarget.style.backgroundColor = sectionColors[
                q.section
              ].replace("0.15", "0.25");
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
              e.currentTarget.style.backgroundColor = sectionColors[q.section];
            }}
          >
            <p
              style={{
                fontSize: "17px",
                fontWeight: "500",
                color: "#1a1a1a",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              {q.question}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCards;
