import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import formatNumber from "../../utils";

const CrossPlatformPerformanceChart = ({ data }) => {
  const ref = useRef(null);
  const tooltipRef = useRef(null);
  const [selectedDimensions, setSelectedDimensions] = useState([
    "spotifyPlaylistReach",
    "spotifyStreams",
    "spotifyPopularity",
    "airplaySpins",
    "tiktokViews",
  ]);
  const [filteredData, setFilteredData] = useState(data);

  const dimensionConfigs = [
    {
      id: "spotifyPlaylistReach",
      label: "Playlist Reach",
      format: formatNumber,
      description: "Estimated audience size of playlists",
      unit: "listeners",
    },
    {
      id: "spotifyStreams",
      label: "Spotify Streams",
      format: formatNumber,
      description: "Total streams on Spotify",
      unit: "streams",
    },
    {
      id: "spotifyPopularity",
      label: "Popularity",
      format: (d) => `${d}/100`,
      description: "Spotify's popularity score",
      unit: "score",
    },
    {
      id: "airplaySpins",
      label: "Radio Plays",
      format: formatNumber,
      description: "Traditional radio spins",
      unit: "spins",
    },
    {
      id: "siriusXMSpins",
      label: "SiriusXM Plays",
      format: formatNumber,
      description: "Satellite radio plays",
      unit: "plays",
    },
    {
      id: "spotifyPlaylistCount",
      label: "Playlist Count",
      format: formatNumber,
      description: "Number of Spotify playlists",
      unit: "playlists",
    },
    {
      id: "tiktokViews",
      label: "TikTok Views",
      format: formatNumber,
      description: "Total TikTok views",
      unit: "views",
    },
    {
      id: "youtubeViews",
      label: "YouTube Views",
      format: formatNumber,
      description: "Total YouTube views",
      unit: "views",
    },
    {
      id: "shazamCounts",
      label: "Shazams",
      format: formatNumber,
      description: "Shazam identifications",
      unit: "shazams",
    },
  ];

  useEffect(() => {
    if (!data || data.length === 0 || !filteredData) return;

    const margin = { top: 80, right: 200, bottom: 80, left: 60 };
    const containerWidth = ref.current.parentNode.clientWidth;
    const containerHeight = 650;
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

    // Create scales for selected dimensions only
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

    // Color scale with better contrast
    const colorScale = d3
      .scaleOrdinal()
      .domain(["low", "medium", "high"])
      .range(["#4e79a7", "#f28e2b", "#e15759"]);

    // Categorize popularity into low/medium/high
    const popularityExtent = d3.extent(
      filteredData,
      (d) => d.spotifyPopularity
    );
    const categorizePopularity = (score) => {
      if (
        score <
        popularityExtent[0] + (popularityExtent[1] - popularityExtent[0]) / 3
      )
        return "low";
      if (
        score <
        popularityExtent[0] +
          (2 * (popularityExtent[1] - popularityExtent[0])) / 3
      )
        return "medium";
      return "high";
    };

    // Draw lines
    svg
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
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).raise().attr("stroke-width", 3).attr("opacity", 1);

        const [x, y] = d3.pointer(event, svg.node());
        d3
          .select(tooltipRef.current)
          .style("opacity", 1)
          .style("left", `${event.pageX + 20}px`)
          .style("top", `${event.pageY - 80}px`).html(`
              <strong class="text-sm block">${
                d.track || "Unknown track"
              }</strong>
              <span class="text-xs text-gray-500">${
                d.artist || "Unknown artist"
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
        d3.select(this).attr("stroke-width", 1).attr("opacity", 0.6);
        d3.select(tooltipRef.current).style("opacity", 0);
      });

    // Add axes
    selectedDimensions.forEach((dimId) => {
      const dimConfig = dimensionConfigs.find((d) => d.id === dimId);
      const axisGroup = svg
        .append("g")
        .attr("transform", `translate(${xScale(dimConfig?.label || dimId)},0)`);

      // Y axis with formatted numbers
      axisGroup
        .call(
          d3
            .axisLeft(yScales[dimId])
            .ticks(5)
            .tickFormat((d) => formatNumber(d))
        )
        .selectAll("text")
        .style("font-size", "11px");

      // Axis title
      axisGroup
        .append("text")
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#555")
        .text(dimConfig?.label || dimId);

      // Add brushing
      const brushGroup = axisGroup.append("g").attr("class", "brush");

      const brush = d3
        .brushY()
        .extent([
          [-15, 0],
          [15, height],
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

    // Add color legend to the right of the graph
    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(${width + 40}, 20)`);

    // Legend title
    legendGroup
      .append("text")
      .attr("y", 0)
      .attr("text-anchor", "start")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Popularity Level");

    // Legend items
    const legendItems = [
      { label: "High (66-100)", color: "#e15759" },
      { label: "Medium (33-66)", color: "#f28e2b" },
      { label: "Low (0-33)", color: "#4e79a7" },
    ];

    legendItems.forEach((item, i) => {
      const itemGroup = legendGroup
        .append("g")
        .attr("transform", `translate(0, ${i * 25 + 25})`);

      itemGroup
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", item.color);

      itemGroup
        .append("text")
        .attr("x", 25)
        .attr("y", 12)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .text(item.label);
    });

    // Add X axis title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Performance Metrics");

    // Add Y axis title
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Metric Values");
  }, [data, selectedDimensions, filteredData]);

  const toggleDimension = (dimId) => {
    setSelectedDimensions((prev) =>
      prev.includes(dimId) ? prev.filter((d) => d !== dimId) : [...prev, dimId]
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <h4 style={{ marginBottom: "20px" }}>
        Compare how tracks perform across different platforms and metrics.
        Select metrics below to analyze relationships.
      </h4>

      {/* Dimension selector */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Select Metrics:
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "10px",
          }}
        >
          {dimensionConfigs.map((dim) => (
            <div
              key={dim.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px",
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
              />
              <div>
                <div style={{ fontWeight: "500" }}>{dim.label}</div>
                <div style={{ fontSize: "0.8em", color: "#666" }}>
                  {dim.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setFilteredData(data)}
        style={{
          padding: "8px 16px",
          background: "#f0f0f0",
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        Reset All Filters
      </button>

      <div style={{ position: "relative" }}>
        <svg
          ref={ref}
          style={{
            width: "100%",
            height: "650px",
          }}
        ></svg>
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 0.2s",
            zIndex: 10,
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "6px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            maxWidth: "300px",
          }}
        ></div>
      </div>
    </div>
  );
};

export default CrossPlatformPerformanceChart;
