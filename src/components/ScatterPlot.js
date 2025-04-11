import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ScatterPlotRegression = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;
    
    const width = 700;
    const height = 500;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };

    // Nettoyage du SVG
    d3.select(ref.current).selectAll("*").remove();
    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    // Définition des échelles
    const xExtent = d3.extent(data, d => d.age);
    const yExtent = d3.extent(data, d => d.spotifyStreams);
    const x = d3.scaleLinear().domain(xExtent).nice().range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain(yExtent).nice().range([height - margin.bottom, margin.top]);

    // Axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    xAxis.append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .text("Âge (années)");

    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height - margin.top - margin.bottom) / 2)
      .attr("y", -40)
      .attr("fill", "black")
      .text("Spotify Streams");

    // Nuage de points interactif
    const scatter = svg.append("g");
    scatter.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.age))
      .attr("cy", d => y(d.spotifyStreams))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            `<strong>${d.track}</strong><br/>Âge: ${d.age.toFixed(1)} ans<br/>Streams: ${d.spotifyStreams.toLocaleString()}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    // Calcul de la régression linéaire (méthode des moindres carrés)
    const n = data.length;
    const sumX = d3.sum(data, d => d.age);
    const sumY = d3.sum(data, d => d.spotifyStreams);
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = d3.sum(data, d => (d.age - meanX) * (d.spotifyStreams - meanY));
    const denominator = d3.sum(data, d => Math.pow(d.age - meanX, 2));
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    // Points d'extrémité de la ligne de régression
    const regLine = [
      { age: xExtent[0], spotifyStreams: intercept + slope * xExtent[0] },
      { age: xExtent[1], spotifyStreams: intercept + slope * xExtent[1] }
    ];

    // Tracé de la ligne de régression
    svg.append("line")
      .datum(regLine)
      .attr("x1", d => x(d[0].age))
      .attr("y1", d => y(d[0].spotifyStreams))
      .attr("x2", d => x(d[1].age))
      .attr("y2", d => y(d[1].spotifyStreams))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Ajout du zoom/pan
    const zoom = d3.zoom()
      .scaleExtent([0.5, 20])
      .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);
        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));
        scatter.selectAll("circle")
          .attr("cx", d => newX(d.age))
          .attr("cy", d => newY(d.spotifyStreams));
        svg.selectAll("line")
          .filter(function() { return d3.select(this).attr("stroke") === "red"; })
          .attr("x1", d => newX(regLine[0].age))
          .attr("y1", d => newY(regLine[0].spotifyStreams))
          .attr("x2", d => newX(regLine[1].age))
          .attr("y2", d => newY(regLine[1].spotifyStreams));
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
          pointerEvents: "none"
        }}
      ></div>
    </div>
  );
};

export default ScatterPlotRegression;
