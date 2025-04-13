import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import formatNumber from "../../utils";

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

// Custom correlation function
function correlation(xArray, yArray) {
  const n = xArray.length;
  const meanX = d3.mean(xArray);
  const meanY = d3.mean(yArray);
  const cov =
    d3.sum(xArray.map((xi, i) => (xi - meanX) * (yArray[i] - meanY))) / n;
  const stdX = Math.sqrt(
    d3.sum(xArray.map((xi) => Math.pow(xi - meanX, 2))) / n
  );
  const stdY = Math.sqrt(
    d3.sum(yArray.map((yi) => Math.pow(yi - meanY, 2))) / n
  );
  return cov / (stdX * stdY);
}

function computeCorrelationMatrix(data, numericKeys) {
  const matrix = [];
  const n = numericKeys.length;
  const vectors = numericKeys.map((k) => data.map((d) => d[k]));
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      const corrVal = correlation(vectors[i], vectors[j]);
      row.push(corrVal);
    }
    matrix.push(row);
  }
  return matrix;
}

const CorrelationMatrix = ({ data, defaultMetrics }) => {
  const initialMetrics =
    defaultMetrics.length > 0 ? defaultMetrics : dimensionConfigs;
  console.log("Initial metrics:", initialMetrics);
  const ref = useRef();
  const [selectedMetrics, setSelectedMetrics] = useState(initialMetrics);
  const handleToggleMetric = (metric) => {
    setSelectedMetrics((prevSelected) => {
      const exists = prevSelected.some((m) => m.id === metric.id);
      return exists
        ? prevSelected.filter((m) => m.id !== metric.id)
        : [...prevSelected, metric];
    });
  };

  useEffect(() => {
    if (!data || selectedMetrics.length === 0) return;

    // Compute correlation matrix using metric id.
    const numericKeys = selectedMetrics.map((m) => m.id);
    const corrMatrix = computeCorrelationMatrix(data, numericKeys);
    const n = numericKeys.length;

    // Dimensions and margins
    const width = 800;
    const height = 600;
    const margin = { top: 150, right: 200, bottom: 50, left: 150 };

    // Calculate cell size and actual matrix width.
    const cellSize = (width - margin.left - margin.right) / n;
    const matrixWidth = n * cellSize;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    // Color scale with inverted domain to map red to 1 and blue to -1.
    const color = d3
      .scaleSequential()
      .domain([1, -1])
      .interpolator(d3.interpolateRdBu);

    // Center the matrix horizontally.
    const container = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left + (width - matrixWidth) / 2}, ${margin.top})`
      );

    // Draw cells with rounded corners and tooltip interaction.
    container
      .selectAll("rect")
      .data(
        corrMatrix.flatMap((row, i) => row.map((val, j) => ({ i, j, val })))
      )
      .enter()
      .append("rect")
      .attr("x", (d) => d.j * cellSize)
      .attr("y", (d) => d.i * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", (d) => color(d.val))
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        const [xPos, yPos] = d3.pointer(event, svg.node());
        d3
          .select("#tooltip-corr")
          .style("opacity", 1)
          .style("left", `${xPos}px`)
          .style("cursor", "pointer")
          .style("top", `${yPos + 150}px`).html(`
            <div class="bg-white p-3 rounded shadow-lg border border-gray-200 min-w-[200px]">
              <strong class="text-sm block">${
                selectedMetrics[d.i].label
              } vs. ${selectedMetrics[d.j].label}</strong>
              <div class="text-xs mt-2">
                <div>Correlation: ${d.val.toFixed(2)}</div>
              </div>
            </div>
          `);
      })
      .on("mouseout", function () {
        d3.select("#tooltip-corr").style("opacity", 0);
      });

    // Row labels
    container
      .selectAll(".rowLabel")
      .data(selectedMetrics.map((m) => m.label))
      .enter()
      .append("text")
      .attr("class", "rowLabel")
      .attr("x", -10)
      .attr("y", (d, i) => i * cellSize + cellSize / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .style("font-size", "11px")
      .style("font-family", "sans-serif")
      .style("fill", "#555")
      .text((d) => d);

    // Column labels with rotated text.
    container
      .selectAll(".colLabel")
      .data(selectedMetrics.map((m) => m.label))
      .enter()
      .append("text")
      .attr("class", "colLabel")
      .attr("x", (d, i) => i * cellSize + cellSize / 2)
      .attr("y", -10)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "central")
      .attr(
        "transform",
        (d, i) =>
          `translate(0,0) rotate(-45, ${i * cellSize + cellSize / 2}, 0)`
      )
      .style("font-size", "11px")
      .style("font-family", "sans-serif")
      .style("fill", "#555")
      .text((d) => d);

    // Title for the matrix
    svg
      .append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("font-family", "sans-serif")
      .text("Popularity Metrics Correlation Matrix");

    // --- Updated Legend Section ---
    const legendWidth = 20,
      legendHeight = 150;

    const legendGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width + margin.left + 30}, ${margin.top})`
      );

    legendGroup
      .append("rect")
      .attr("x", -20)
      .attr("y", -30)
      .attr("width", legendWidth + 80)
      .attr("height", legendHeight + 50)
      .attr("fill", "#fff")
      .attr("stroke", "#ccc")
      .attr("rx", 8)
      .attr("ry", 8);

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", color(1));
    gradient.append("stop").attr("offset", "50%").attr("stop-color", color(0));
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color(-1));

    const legend = legendGroup.append("g").attr("transform", "translate(20,0)");

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .style("stroke", "#ccc");

    // Inverted legend scale to match our color scale (red corresponds to 1).
    const legendScale = d3
      .scaleLinear()
      .domain([1, -1])
      .range([legendHeight, 0]);

    const legendAxis = d3
      .axisRight(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".1f"));
    legend
      .append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis);

    legend
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "sans-serif")
      .text("Correlation");
  }, [data, selectedMetrics]);

  return (
    <div style={{ position: "relative" }}>
      {/* Updated metric selection controls */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Select Metrics:
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "8px",
            fontSize: "12px",
          }}
        >
          {dimensionConfigs.map((metric) => {
            const isSelected = selectedMetrics.some((m) => m.id === metric.id);
            return (
              <div
                key={metric.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px",
                  borderRadius: "4px",
                  background: isSelected ? "#f0f0f0" : "transparent",
                  cursor: "pointer",
                }}
                onClick={() => handleToggleMetric(metric)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleMetric(metric)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <div style={{ fontWeight: "500" }}>{metric.label}</div>
                  {metric.description && (
                    <div style={{ fontSize: "0.8em", color: "#666" }}>
                      {metric.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <svg ref={ref} width={600} height={500}></svg>
        <div
          id="tooltip-corr"
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            fontSize: "13px",
            zIndex: 100,
            transform: "translate(-50%, -100%)",
          }}
        ></div>
      </div>
    </div>
  );
};

export default CorrelationMatrix;
