import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const ShazamCorrelation = ({ data }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Préparation des données
    const metrics = [
      "shazamCounts",
      "spotifyStreams",
      "youtubeViews",
      "tiktokViews",
      "spotifyPlaylistReach",
    ];

    const metricNames = {
      shazamCounts: "Shazams",
      spotifyStreams: "Streams Spotify",
      youtubeViews: "Vues YouTube",
      tiktokViews: "Vues TikTok",
      spotifyPlaylistReach: "Portée Playlists",
    };

    // Calcul des corrélations
    const correlations = {};
    for (let i = 0; i < metrics.length; i++) {
      const metricI = metrics[i];
      correlations[metricI] = {};
      for (let j = 0; j < metrics.length; j++) {
        const metricJ = metrics[j];
        const x = data.map((d) => +d[metricI] || 0);
        const y = data.map((d) => +d[metricJ] || 0);
        correlations[metricI][metricJ] = pearsonCorrelation(x, y);
      }
    }

    // Configuration du graphique
    const margin = { top: 80, right: 80, bottom: 80, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const cellSize = Math.min(width, height) / metrics.length;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Échelle de couleur
    const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);

    // Création des cellules
    svg
      .selectAll(".cell")
      .data(d3.cross(metrics, metrics))
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", ([, j]) => j * cellSize)
      .attr("y", ([i]) => i * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", ([i, j]) => colorScale(correlations[i][j]))
      .attr("stroke", "#fff")
      .on("mouseover", function (event, [i, j]) {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
        showTooltip(event, metrics[i], metrics[j], correlations[i][j]);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#fff").attr("stroke-width", 1);
        hideTooltip();
      });

    // Ajouter les valeurs de corrélation
    svg
      .selectAll(".correlation-value")
      .data(d3.cross(metrics, metrics))
      .enter()
      .append("text")
      .attr("class", "correlation-value")
      .attr("x", ([, j]) => j * cellSize + cellSize / 2)
      .attr("y", ([i]) => i * cellSize + cellSize / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text(([i, j]) => correlations[i][j].toFixed(2))
      .style("font-size", "10px")
      .style("fill", ([i, j]) =>
        Math.abs(correlations[i][j]) > 0.5 ? "white" : "black"
      );

    // Ajouter les labels
    svg
      .selectAll(".metric-label")
      .data(metrics)
      .enter()
      .append("text")
      .attr("class", "metric-label")
      .attr("x", (_, i) => i * cellSize + cellSize / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text((d) => metricNames[d])
      .style("font-size", "10px")
      .attr(
        "transform",
        (d) =>
          `rotate(-45, ${metrics.indexOf(d) * cellSize + cellSize / 2}, -10)`
      );

    svg
      .selectAll(".metric-label-side")
      .data(metrics)
      .enter()
      .append("text")
      .attr("class", "metric-label-side")
      .attr("x", -10)
      .attr("y", (_, i) => i * cellSize + cellSize / 2)
      .attr("text-anchor", "end")
      .text((d) => metricNames[d])
      .style("font-size", "10px");

    // Légende
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width / 2 - legendWidth / 2},${height + 40})`
      );

    const legendScale = d3
      .scaleLinear()
      .domain([-1, 1])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale).ticks(5);

    legend.append("g").call(legendAxis);

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient
      .selectAll("stop")
      .data(colorScale.range())
      .enter()
      .append("stop")
      .attr("offset", (d, i) => i / (colorScale.range().length - 1))
      .attr("stop-color", (d) => d);

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    // Tooltip functions
    function showTooltip(event, metricX, metricY, value) {
      d3
        .select(tooltipRef.current)
        .style("opacity", 1)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`).html(`
          <div class="text-sm">
            <strong>${metricNames[metricX]} ↔ ${
        metricNames[metricY]
      }</strong><br/>
            Corrélation: ${value.toFixed(2)}<br/>
            ${getCorrelationInterpretation(value)}
          </div>
        `);
    }

    function hideTooltip() {
      d3.select(tooltipRef.current).style("opacity", 0);
    }

    return () => {
      d3.select(svgRef.current).selectAll("*").remove();
    };
  }, [data]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full h-[700px]"></svg>
      <div
        ref={tooltipRef}
        className="absolute bg-white p-2 border rounded shadow-lg pointer-events-none opacity-0 text-sm"
      ></div>
    </div>
  );
};

// Helper functions
function pearsonCorrelation(x, y) {
  const n = x.length;
  const meanX = d3.mean(x);
  const meanY = d3.mean(y);

  let cov = 0;
  let stdX = 0;
  let stdY = 0;

  for (let i = 0; i < n; i++) {
    cov += (x[i] - meanX) * (y[i] - meanY);
    stdX += Math.pow(x[i] - meanX, 2);
    stdY += Math.pow(y[i] - meanY, 2);
  }

  return cov / Math.sqrt(stdX * stdY);
}

function getCorrelationInterpretation(value) {
  const absValue = Math.abs(value);
  if (absValue > 0.7) return "Forte corrélation";
  if (absValue > 0.3) return "Corrélation modérée";
  if (absValue > 0.1) return "Faible corrélation";
  return "Pas de corrélation significative";
}

export default ShazamCorrelation;
