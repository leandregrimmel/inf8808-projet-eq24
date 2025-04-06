import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BarChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;

    // 1) Extract the release year from each song
    //    Then group by year to compute the average Spotify popularity
    const yearMap = d3.rollup(
      data,
      (v) => d3.mean(v, (d) => d.spotifyPopularity),
      (d) => new Date(d.releaseDate).getFullYear()
    );

    // Convert to array of {year, avgPopularity}
    const yearData = Array.from(yearMap, ([year, avgPop]) => ({ year, avgPop }))
      .sort((a, b) => a.year - b.year);

    const width = 700;
    const height = 500;
    const margin = { top: 40, right: 20, bottom: 50, left: 60 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    // X scale (years)
    const x = d3
      .scaleBand()
      .domain(yearData.map((d) => d.year))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    // Y scale (average popularity)
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(yearData, (d) => d.avgPop)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // 'd' = integer format for year

    // Y axis
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
      .text("Popularité moyenne sur Spotify par année de sortie");

    // Bars
    svg
      .selectAll("rect.bar")
      .data(yearData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.avgPop))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.avgPop))
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            `<strong>Année: ${d.year}</strong><br/>Popularité Moy: ${d.avgPop.toFixed(
              1
            )}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
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

export default BarChart;
