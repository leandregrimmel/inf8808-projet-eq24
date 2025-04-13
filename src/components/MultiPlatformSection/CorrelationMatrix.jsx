import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

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

const CorrelationMatrix = ({ data }) => {
  const ref = useRef();

  const availableMetrics = [
    { label: "Spotify Popularity", field: "spotifyPopularity" },
    { label: "Spotify Streams", field: "spotifyStreams" },
    { label: "Spotify Playlist Reach", field: "spotifyPlaylistReach" },
    { label: "YouTube Views", field: "youtubeViews" },
    { label: "YouTube Likes", field: "youtubeLikes" },
    { label: "TikTok Posts", field: "tiktokPosts" },
    { label: "TikTok Likes", field: "tiktokLikes" },
    { label: "TikTok Views", field: "tiktokViews" },
    { label: "Shazam Counts", field: "shazamCounts" },
    { label: "AirPlay Spins", field: "airplaySpins" },
    { label: "SiriusXM Spins", field: "siriusXMSpins" },
  ];

  const [selectedMetrics, setSelectedMetrics] = useState([...availableMetrics]);

  const handleToggleMetric = (metric) => {
    setSelectedMetrics((prevSelected) => {
      const exists = prevSelected.some((m) => m.field === metric.field);
      if (exists) {
        return prevSelected.filter((m) => m.field !== metric.field);
      } else {
        return [...prevSelected, metric];
      }
    });
  };

  useEffect(() => {
    if (!data || selectedMetrics.length === 0) return;

    const numericKeys = selectedMetrics.map((m) => m.field);
    const corrMatrix = computeCorrelationMatrix(data, numericKeys);
    const n = numericKeys.length;

    // Adjusted dimensions for better fit
    const width = 800;
    const height = 600;
    const margin = { top: 150, right: 200, bottom: 50, left: 150 };
    const cellSize = (width - margin.left - margin.right) / n;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const color = d3
      .scaleSequential()
      .domain([1, -1])
      .interpolator(d3.interpolateRdBu);

    const container = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Draw cells with rounded corners and updated tooltip styling
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
        // Get pointer coordinates relative to the svg element
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

    // Improved row labels
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

    // Improved column labels
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

    svg
      .append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("font-family", "sans-serif")
      .text("Popularity Metrics Correlation Matrix");

    // Right-aligned legend
    const legendWidth = 20,
      legendHeight = 150;
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width + margin.left + 30}, ${margin.top})`
      );

    // Create gradient for vertical legend
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

    // Draw the legend rectangle
    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .style("stroke", "#ccc");

    // Add legend axis on the right
    const legendScale = d3
      .scaleLinear()
      .domain([-1, 1])
      .range([legendHeight, 0]);
    const legendAxis = d3
      .axisRight(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".1f"));
    legend
      .append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis);

    // Add legend title
    legend
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .text("Correlation");
  }, [data, selectedMetrics]);

  return (
    <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Improved metric selection controls */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "10px",
            color: "#333",
          }}
        >
          Select Metrics:
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "8px",
          }}
        >
          {availableMetrics.map((metric) => (
            <label
              key={metric.field}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#555",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "background-color 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={selectedMetrics.some((m) => m.field === metric.field)}
                onChange={() => handleToggleMetric(metric)}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#4e79a7",
                  cursor: "pointer",
                }}
              />
              {metric.label}
            </label>
          ))}
        </div>
      </div>

      <svg ref={ref} style={{ display: "block", margin: "0 auto" }}></svg>

      {/* Enhanced tooltip */}
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
  );
};

export default CorrelationMatrix;
