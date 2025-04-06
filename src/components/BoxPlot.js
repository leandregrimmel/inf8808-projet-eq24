import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

/**
 * Utility function: Given an array of numeric values,
 * returns { q1, median, q3, min, max, outliers } for boxplot.
 */
function computeBoxStats(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const q1 = d3.quantileSorted(sorted, 0.25);
  const median = d3.quantileSorted(sorted, 0.5);
  const q3 = d3.quantileSorted(sorted, 0.75);

  // Interquartile range
  const iqr = q3 - q1;
  const lowerLimit = q1 - 1.5 * iqr;
  const upperLimit = q3 + 1.5 * iqr;

  // Filter outliers
  const outliers = sorted.filter((v) => v < lowerLimit || v > upperLimit);

  return {
    q1,
    median,
    q3,
    min: d3.min(sorted.filter((v) => v >= lowerLimit)) ?? sorted[0],
    max: d3.max(sorted.filter((v) => v <= upperLimit)) ?? sorted[sorted.length - 1],
    outliers,
  };
}

const BoxPlot = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;

    // Separate data by explicit vs. non-explicit
    const groups = [
      { key: "Non explicite", data: data.filter((d) => d.explicitTrack === false) },
      { key: "Explicite", data: data.filter((d) => d.explicitTrack === true) },
    ];

    // Compute stats for each group
    const stats = groups.map((group) => {
      const streams = group.data.map((d) => d.spotifyStreams);
      return {
        group: group.key,
        ...computeBoxStats(streams),
      };
    });

    const width = 700;
    const height = 500;
    const margin = { top: 40, right: 20, bottom: 50, left: 60 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    // X scale for groups
    const x = d3
      .scaleBand()
      .domain(stats.map((s) => s.group))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    // Y scale for streams
    const maxStream = d3.max(data, (d) => d.spotifyStreams);
    const y = d3
      .scaleLinear()
      .domain([0, maxStream])
      .range([height - margin.bottom, margin.top])
      .nice();

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .text("Distribution des streams sur Spotify selon la présence de contenu explicite");

    // Boxplot elements
    const boxWidth = x.bandwidth();

    const boxContainer = svg.append("g");

    stats.forEach((s) => {
      const center = x(s.group) + boxWidth / 2;
      // Draw line from min to max
      boxContainer
        .append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", y(s.min))
        .attr("y2", y(s.max))
        .attr("stroke", "black");

      // Draw box from q1 to q3
      boxContainer
        .append("rect")
        .attr("x", x(s.group))
        .attr("y", y(s.q3))
        .attr("width", boxWidth)
        .attr("height", y(s.q1) - y(s.q3))
        .attr("stroke", "black")
        .attr("fill", "#69b3a2");

      // Draw median line
      boxContainer
        .append("line")
        .attr("x1", x(s.group))
        .attr("x2", x(s.group) + boxWidth)
        .attr("y1", y(s.median))
        .attr("y2", y(s.median))
        .attr("stroke", "black");

      // Min/Max "ticks"
      boxContainer
        .append("line")
        .attr("x1", center - boxWidth / 4)
        .attr("x2", center + boxWidth / 4)
        .attr("y1", y(s.min))
        .attr("y2", y(s.min))
        .attr("stroke", "black");

      boxContainer
        .append("line")
        .attr("x1", center - boxWidth / 4)
        .attr("x2", center + boxWidth / 4)
        .attr("y1", y(s.max))
        .attr("y2", y(s.max))
        .attr("stroke", "black");

      // Outliers
      boxContainer
        .selectAll(`circle.outlier-${s.group}`)
        .data(s.outliers)
        .enter()
        .append("circle")
        .attr("cx", center)
        .attr("cy", (d) => y(d))
        .attr("r", 3)
        .attr("fill", "red")
        .on("mouseover", (event, val) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(
              `<strong>${s.group}</strong><br/>Outlier Streams: ${val.toLocaleString()}`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("opacity", 0);
        });
    });
  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={ref}></svg>
      <div
        id="tooltip"
        style={{
          position: "absolute",
          opacity: 0,
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "5px",
          pointerEvents: "none",
        }}
      ></div>
    </div>
  );
};

export default BoxPlot;
