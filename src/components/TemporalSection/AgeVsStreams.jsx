import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import formatNumber from "../../utils";

const AgeVsStreams = ({ data }) => {
  const ref = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    const width = 700;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height].join(" "))
      .attr("style", "max-width: 100%; height: auto;");

    const xExtent = d3.extent(data, (d) => d.age);
    const yExtent = d3.extent(data, (d) => d.spotifyStreams);
    const x = d3
      .scaleLinear()
      .domain(xExtent)
      .nice()
      .range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain(yExtent)
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .style("font-size", "14px");

    xAxis
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.bottom - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "16px")
      .text("Âge (années)");

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .style("font-size", "14px");

    yAxis.selectAll(".tick text").text((d) => formatNumber(d));

    yAxis
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "16px")
      .text("Spotify Streams");

    const scatter = svg.append("g");
    
    scatter
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.age))
      .attr("cy", (d) => y(d.spotifyStreams))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("stroke", "none")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "red").attr("r", 7);

        const [xPos, yPos] = d3.pointer(event, svg.node());

        d3
          .select(tooltipRef.current)
          .style("opacity", 1)
          .style("left", `${xPos + 150}px`)
          .style("cursor", "pointer")
          .style("top", `${yPos - 50}px`).html(`
            <div class="bg-white p-3 rounded shadow-lg border border-gray-200 min-w-[200px]">
              <strong class="text-sm block">${d.track}</strong>
              <span class="text-xs text-gray-500">${d.artist}</span>
              <div class="text-xs mt-2">
                <div>Âge: ${d.age.toFixed(1)} ans</div>
                <div>Streams: ${formatNumber(d.spotifyStreams)}</div>
              </div>
            </div>
          `);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue").attr("r", 5);
        d3.select(tooltipRef.current).style("opacity", 0);
      });

    const n = data.length;
    const sumX = d3.sum(data, (d) => d.age);
    const sumY = d3.sum(data, (d) => d.spotifyStreams);
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = d3.sum(
      data,
      (d) => (d.age - meanX) * (d.spotifyStreams - meanY)
    );
    const denominator = d3.sum(data, (d) => Math.pow(d.age - meanX, 2));
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    const regLine = [
      { age: xExtent[0], spotifyStreams: intercept + slope * xExtent[0] },
      { age: xExtent[1], spotifyStreams: intercept + slope * xExtent[1] },
    ];

    svg
      .append("line")
      .datum(regLine)
      .attr("x1", (d) => x(d[0].age))
      .attr("y1", (d) => y(d[0].spotifyStreams))
      .attr("x2", (d) => x(d[1].age))
      .attr("y2", (d) => y(d[1].spotifyStreams))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <h4>
        Ce nuage de points interactif montre la relation entre l'âge des
        chansons et divers indicateurs de succès, avec une ligne de régression
        pour visualiser la tendance globale.
      </h4>
      <svg ref={ref}></svg>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.2s",
          zIndex: 10,
        }}
      ></div>
    </div>
  );
};

export default AgeVsStreams;
