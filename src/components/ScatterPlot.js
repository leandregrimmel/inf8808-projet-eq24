import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ScatterPlot = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d.age))
      .range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d.spotify_streams))
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg
      .append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(+d.age))
      .attr("cy", (d) => y(+d.spotify_streams))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            `<strong>${d.track_name}</strong><br/>Âge: ${d.age}<br/>Streams: ${d.spotify_streams}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });
  }, [data]);

  return (
    <div>
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
