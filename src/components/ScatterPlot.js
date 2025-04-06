import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ScatterPlot = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;

    const width = 700;
    const height = 500;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    // X scale: Age in years
    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.age))
      .nice()
      .range([margin.left, width - margin.right]);

    // Y scale: Spotify streams
    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.spotifyStreams))
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Axes
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    xAxis
      .append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .text("Âge (années)");

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
    yAxis
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height - margin.top - margin.bottom) / 2)
      .attr("y", -40)
      .attr("fill", "black")
      .text("Streams Spotify");

    // Define a clip path for zooming/panning (without assigning to a variable)
    svg
      .append("defs")
      .append("SVG:clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("x", margin.left)
      .attr("y", margin.top);

    // Main plot area
    const scatter = svg.append("g").attr("clip-path", "url(#clip)");

    // Points
    scatter
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.age))
      .attr("cy", (d) => y(d.spotifyStreams))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            `<strong>${d.track}</strong><br/>Âge: ${d.age.toFixed(
              1
            )} ans<br/>Streams: ${d.spotifyStreams.toLocaleString()}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    // Zoom/Pan
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 20])
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);

        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));

        scatter
          .selectAll("circle")
          .attr("cx", (d) => newX(d.age))
          .attr("cy", (d) => newY(d.spotifyStreams));
      });

    svg.call(zoom);
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

export default ScatterPlot;
