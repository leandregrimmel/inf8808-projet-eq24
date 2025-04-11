// RadialLineChart.js
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const RadialLineChart = ({ data, metric = "spotifyPopularity" }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;
    
    // Extraction des mois depuis la date de sortie
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthMap = d3.rollup(
      data,
      v => d3.mean(v, d => d[metric]),
      d => d.releaseDate.getMonth() // renvoie 0 à 11
    );
    
    // Créer un tableau pour les 12 mois
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      value: monthMap.get(i) || 0
    }));
    
    // Dimensions
    const width = 500;
    const height = 500;
    const innerRadius = 50;
    const outerRadius = Math.min(width, height) / 2 - 40;
    
    // Nettoyage du SVG
    d3.select(ref.current).selectAll("*").remove();
    const svg = d3.select(ref.current)
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Échelle radiale pour la valeur
    const r = d3.scaleLinear()
                .domain([0, d3.max(monthlyData, d => d.value)])
                .range([innerRadius, outerRadius]);
    
    // Échelle angulaire pour les mois
    const angle = d3.scaleBand()
                    .domain(monthlyData.map(d => d.month))
                    .range([0, 2 * Math.PI])
                    .align(0);
    
    // Générateur de ligne radiale
    const line = d3.lineRadial()
                   .angle(d => angle(d.month) + angle.bandwidth() / 2)
                   .radius(d => r(d.value))
                   .curve(d3.curveCardinalClosed);
    
    // Tracé de la courbe
    svg.append("path")
       .datum(monthlyData)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 2)
       .attr("d", line);
       
    // Ajout de cercles interactifs sur chaque point
    svg.selectAll("circle")
       .data(monthlyData)
       .enter()
       .append("circle")
       .attr("cx", d =>
         r(d.value) * Math.cos(angle(d.month) + angle.bandwidth() / 2 - Math.PI/2)
       )
       .attr("cy", d =>
         r(d.value) * Math.sin(angle(d.month) + angle.bandwidth() / 2 - Math.PI/2)
       )
       .attr("r", 4)
       .attr("fill", "orange")
       .on("mouseover", (event, d) => {
         d3.select("#tooltip-radial")
           .style("opacity", 1)
           .html(`<strong>${d.month}</strong><br/>Avg ${metric}: ${d.value.toFixed(1)}`)
           .style("left", event.pageX + 10 + "px")
           .style("top", event.pageY - 28 + "px");
       })
       .on("mouseout", () => {
         d3.select("#tooltip-radial").style("opacity", 0);
       });
       
    // Ajout des étiquettes pour les mois
    svg.selectAll("text.label")
       .data(monthlyData)
       .enter()
       .append("text")
       .attr("class", "label")
       .attr("text-anchor", d => {
         const angleValue = angle(d.month) + angle.bandwidth() / 2;
         return angleValue > Math.PI ? "end" : "start";
       })
       .attr("x", d => (outerRadius + 10) * Math.cos(angle(d.month) + angle.bandwidth() / 2 - Math.PI/2))
       .attr("y", d => (outerRadius + 10) * Math.sin(angle(d.month) + angle.bandwidth() / 2 - Math.PI/2))
       .text(d => d.month);
    
  }, [data, metric]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={ref}></svg>
      <div
        id="tooltip-radial"
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

export default RadialLineChart;
