import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import formatNumber from "../../utils";

const CrossPlatformPerformanceChart = ({ data, defaultConfig = {} }) => {
  const initialDimensions = defaultConfig?.metrics || [
    "spotifyPlaylistReach",
    "spotifyStreams",
    "spotifyPopularity",
  ];
  const ref = useRef(null);
  const tooltipRef = useRef(null);
  const [selectedDimensions, setSelectedDimensions] =
    useState(initialDimensions);
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setSelectedDimensions(
      defaultConfig.metrics || [
        "spotifyPlaylistReach",
        "spotifyStreams",
        "spotifyPopularity",
      ]
    );
  }, [defaultConfig.metrics]);

  const dimensionConfigs = [
    {
      id: "spotifyPlaylistReach",
      label: "Portée des Playlists",
      format: formatNumber,
      description: "Audience estimée des playlists",
      unit: "auditeurs",
    },
    {
      id: "spotifyStreams",
      label: "Streams Spotify",
      format: formatNumber,
      description: "Streams totaux sur Spotify",
      unit: "streams",
    },
    {
      id: "spotifyPopularity",
      label: "Popularité",
      format: (d) => `${d}/100`,
      description: "Score de popularité Spotify",
      unit: "score",
    },
    {
      id: "airplaySpins",
      label: "Passages Radio",
      format: formatNumber,
      description: "Passages radio traditionnels",
      unit: "passages",
    },
    {
      id: "siriusXMSpins",
      label: "Passages SiriusXM",
      format: formatNumber,
      description: "Passages radio satellite",
      unit: "passages",
    },
    {
      id: "spotifyPlaylistCount",
      label: "Nombre de Playlists",
      format: formatNumber,
      description: "Nombre de playlists Spotify",
      unit: "playlists",
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
  ];

  useEffect(() => {
    if (!data || data.length === 0 || !filteredData) return;

    const margin = { top: 60, right: 150, bottom: 60, left: 50 };
    const containerWidth = ref.current.parentNode.clientWidth;
    const containerHeight = 500;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    d3.select(ref.current).selectAll("*").remove();
    const svg = d3
      .select(ref.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScales = {};
    selectedDimensions.forEach((dimId) => {
      const values = filteredData
        .map((d) => +d[dimId])
        .filter((v) => !isNaN(v));
      if (values.length > 0) {
        yScales[dimId] = d3
          .scaleLinear()
          .domain(d3.extent(values))
          .range([height, 0])
          .nice();
      }
    });

    const xScale = d3
      .scalePoint()
      .domain(
        selectedDimensions.map(
          (d) => dimensionConfigs.find((dim) => dim.id === d)?.label || d
        )
      )
      .range([0, width])
      .padding(0.5);

    const colorScale = d3
      .scaleOrdinal()
      .domain(["très faible", "faible", "moyenne", "élevée", "très élevée"])
      .range(["#4e79a7", "#59a14f", "#f1ce63", "#f28e2b", "#e15759"]);

    const popularityExtent = d3.extent(
      filteredData,
      (d) => d.spotifyPopularity
    );
    const categorizePopularity = (score) => {
      const range = popularityExtent[1] - popularityExtent[0];
      if (score < popularityExtent[0] + range * 0.2) return "très faible";
      if (score < popularityExtent[0] + range * 0.4) return "faible";
      if (score < popularityExtent[0] + range * 0.6) return "moyenne";
      if (score < popularityExtent[0] + range * 0.8) return "élevée";
      return "très élevée";
    };

    const lines = svg
      .selectAll(".line")
      .data(filteredData)
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("d", (d) =>
        d3
          .line()
          .x((_, i) =>
            xScale(
              dimensionConfigs.find((dim) => dim.id === selectedDimensions[i])
                ?.label || selectedDimensions[i]
            )
          )
          .y((_, i) =>
            yScales[selectedDimensions[i]](+d[selectedDimensions[i]])
          )
          .defined((_, i) => !isNaN(+d[selectedDimensions[i]]))(
          selectedDimensions.map((_, i) => i)
        )
      )
      .attr("stroke", (d) =>
        colorScale(categorizePopularity(d.spotifyPopularity))
      )
      .attr("fill", "none")
      .attr("stroke-width", 1)
      .attr("opacity", 0.6)
      .style("cursor", "pointer");

    lines
      .on("mouseover", function (event, d) {
        d3.selectAll(".line").attr("opacity", 0.1);

        d3.select(this).raise().attr("stroke-width", 3).attr("opacity", 1);

        const [xpos, ypos] = d3.pointer(event, svg.node());
        d3
          .select(tooltipRef.current)
          .style("opacity", 1)
          .style("left", `${xpos + 100}px`)
          .style("top", `${ypos}px`).html(`
              <strong class="text-sm block">${
                d.track || "Titre inconnu"
              }</strong>
              <span class="text-xs text-gray-500">${
                d.artist || "Artiste inconnu"
              }</span>
              <div class="text-xs mt-2 grid grid-cols-2 gap-2">
                ${selectedDimensions
                  .map((dim) => {
                    const dimConfig = dimensionConfigs.find(
                      (d) => d.id === dim
                    );
                    return `
                    <div class="font-semibold">${dimConfig?.label || dim}:</div>
                    <div>${dimConfig?.format(d[dim]) || d[dim]} ${
                      dimConfig?.unit || ""
                    }</div>
                  `;
                  })
                  .join("")}
              </div>
          `);
      })
      .on("mouseout", function () {
        d3.selectAll(".line").attr("opacity", 0.6);
        d3.select(this).attr("stroke-width", 1);
        d3.select(tooltipRef.current).style("opacity", 0);
      });

    selectedDimensions.forEach((dimId) => {
      const dimConfig = dimensionConfigs.find((d) => d.id === dimId);
      const axisGroup = svg
        .append("g")
        .attr("transform", `translate(${xScale(dimConfig?.label || dimId)},0)`);

      axisGroup
        .call(
          d3
            .axisLeft(yScales[dimId])
            .ticks(5)
            .tickFormat((d) => formatNumber(d))
        )
        .selectAll("text")
        .style("font-size", "10px");

      axisGroup
        .append("text")
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("fill", "#555")
        .text(dimConfig?.label || dimId);

      const brushGroup = axisGroup.append("g").attr("class", "brush");

      const brush = d3
        .brushY()
        .extent([
          [-12, 0],
          [12, height],
        ])
        .on("brush end", function (event) {
          if (!event.selection) {
            setFilteredData(data);
            return;
          }

          const [y0, y1] = event.selection;
          const minVal = yScales[dimId].invert(y1);
          const maxVal = yScales[dimId].invert(y0);

          setFilteredData(
            data.filter((d) => {
              const val = +d[dimId];
              return val >= minVal && val <= maxVal;
            })
          );
        });

      brushGroup.call(brush);
    });

    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(${width + 30}, 20)`);

    legendGroup
      .append("text")
      .attr("y", 0)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Niveau de Popularité");

    const legendItems = [
      { label: "Très élevée (80-100)", color: "#e15759" },
      { label: "Élevée (60-80)", color: "#f28e2b" },
      { label: "Moyenne (40-60)", color: "#f1ce63" },
      { label: "Faible (20-40)", color: "#59a14f" },
      { label: "Très faible (0-20)", color: "#4e79a7" },
    ];

    legendItems.forEach((item, i) => {
      const itemGroup = legendGroup
        .append("g")
        .attr("transform", `translate(0, ${i * 20 + 20})`);

      itemGroup
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", item.color);

      itemGroup
        .append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .text(item.label);
    });

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Métriques de Performance");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Valeurs des Métriques");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDimensions, filteredData, dimensionConfigs]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const toggleDimension = (dimId) => {
    setSelectedDimensions((prev) =>
      prev.includes(dimId) ? prev.filter((d) => d !== dimId) : [...prev, dimId]
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <h4>
        Le graphique parallèle suivant compare les performances des titres sur
        différentes plateformes via plusieurs métriques clés. Chaque ligne
        représente un titre, colorée selon sa popularité Spotify. Utilisez les
        filtres pour sélectionner les métriques à analyser et cliquez sur les
        axes pour zoomer sur des plages de valeurs spécifiques. Passez votre
        souris sur une ligne pour voir les détails du titre.
      </h4>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "bold",
            fontSize: "13px",
          }}
        >
          Sélectionnez les Métriques:
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "8px",
            fontSize: "12px",
          }}
        >
          {dimensionConfigs.map((dim) => (
            <div
              key={dim.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px",
                borderRadius: "4px",
                background: selectedDimensions.includes(dim.id)
                  ? "#f0f0f0"
                  : "transparent",
                cursor: "pointer",
              }}
              onClick={() => toggleDimension(dim.id)}
            >
              <input
                type="checkbox"
                checked={selectedDimensions.includes(dim.id)}
                onChange={() => toggleDimension(dim.id)}
                onClick={(e) => e.stopPropagation()}
                style={{ width: "14px", height: "14px" }}
              />
              <div>
                <div style={{ fontWeight: "500" }}>{dim.label}</div>
                <div style={{ fontSize: "0.75em", color: "#666" }}>
                  {dim.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <svg ref={ref}></svg>
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 0.2s",
            zIndex: 10,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "6px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
            maxWidth: "250px",
          }}
        ></div>
        <div style={{ fontSize: "1rem", marginTop: "1rem" }}>
          Dans ce graphique parallèle, on constate globalement que les titres
          présentant une portée de playlist élevée se distinguent souvent par un
          nombre de streams Spotify également plus élevé, suggérant un lien
          étroit entre l'audience potentielle offerte par les playlists et la
          réussite en termes de streams.
          <br /> <br />
          Par ailleurs, plusieurs chansons très populaires conservent des
          valeurs relativement élevées sur des indicateurs en apparence
          indépendants, comme les Passages Radio (AirPlay et SiriusXM),
          confirmant qu'une diffusion soutenue sur des canaux traditionnels peut
          encore contribuer au succès numérique. Certains artistes se démarquent
          aussi par un nombre de playlists nettement plus important, témoignant
          de la portée de leur rayonnement et de la tendance qu'ont les
          utilisateurs à inclure ces titres dans leurs sélections musicales.
          Enfin, on observe pour quelques pistes une forte présence sur Shazam,
          en corrélation avec une découvrabilité accrue via les réseaux sociaux
          et les playlists, ce qui souligne le rôle de Shazam dans
          l'identification de nouveaux morceaux et l'augmentation de leur
          popularité sur d'autres plateformes.
          <br /> <br />
          Les différences de lignes sur les axes indiquent aussi que l'impact du
          rayonnement radio ou de la portée des playlists n'a pas la même
          importance pour tous les artistes : certaines étoiles montantes, par
          exemple, peuvent générer un grand nombre de streams malgré peu de
          diffusions radio, tandis que d'autres artistes établis s'appuient
          davantage sur ces canaux traditionnels.
        </div>
      </div>
    </div>
  );
};

export default CrossPlatformPerformanceChart;
