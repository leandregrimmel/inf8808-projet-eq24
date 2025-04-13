import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { regressionLinear } from "d3-regression";
import formatNumber from "../../utils";

const TikTokImpact = ({ data }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Configuration du graphique
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Échelles
    const x = d3.scaleLog()
      .domain(d3.extent(data, d => d.tiktokPosts || 1))
      .range([0, width]);

    const y = d3.scaleLog()
      .domain(d3.extent(data, d => d.tiktokViews || 1))
      .range([height, 0]);

    const size = d3.scaleLinear()
      .domain(d3.extent(data, d => d.spotifyPopularity))
      .range([5, 30]);

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.style))])
      .range(d3.schemeTableau10);

    // Points
    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.tiktokPosts || 1))
      .attr("cy", d => y(d.tiktokViews || 1))
      .attr("r", d => size(d.spotifyPopularity))
      .attr("fill", d => color(d.style))
      .attr("opacity", 0.7)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 1);
        showTooltip(event, d);
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.7);
        hideTooltip();
      });

    const regression = regressionLinear()
      .x(d => Math.log(d.tiktokPosts || 1))
      .y(d => Math.log(d.tiktokViews || 1))
      .domain(x.domain());

    const regressionData = regression(data);

    svg.append("path")
      .datum(regressionData)
      .attr("class", "regression-line")
      .attr("d", d3.line()
        .x(d => x(Math.exp(d[0])))
        .y(d => y(Math.exp(d[1])))
      )
      .attr("stroke", "#000")
      .attr("stroke-dasharray", "5,5")
      .attr("stroke-width", 1.5);

    // Ajouter l'équation R²
    const rSquared = computeRSquared(data, regression);

    svg.append("text")
      .attr("x", width - 10)
      .attr("y", 20)
      .attr("text-anchor", "end")
      .text(`R² = ${rSquared.toFixed(2)}`)
      .style("font-size", "12px");

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("fill", "#000")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text("Nombre de Posts TikTok (log)");

    svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Vues TikTok (log)");

    // Légende
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150},40)`);

    const styles = [...new Set(data.map(d => d.style))];
    styles.forEach((style, i) => {
      legend.append("circle")
        .attr("cx", 0)
        .attr("cy", i * 20)
        .attr("r", 5)
        .attr("fill", color(style));

      legend.append("text")
        .attr("x", 10)
        .attr("y", i * 20 + 5)
        .text(style)
        .style("font-size", "10px");
    });

    // Tooltip functions
    function showTooltip(event, d) {
      d3.select(tooltipRef.current)
        .style("opacity", 1)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`)
        .html(`
          <div class="text-sm">
            <strong>${d.track}</strong><br/>
            Artiste: ${d.artist}<br/>
            Posts: ${d.tiktokPosts || 0}<br/>
            Vues: ${formatNumber(d.tiktokViews || 0)}<br/>
            Popularité Spotify: ${d.spotifyPopularity}
          </div>
        `);
    }

    function hideTooltip() {
      d3.select(tooltipRef.current).style("opacity", 0);
    }

    return () => {
      d3.select(svgRef.current).selectAll("*").remove();
    };
  }, [data]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full h-[500px]"></svg>
      <div
        ref={tooltipRef}
        className="absolute bg-white p-2 border rounded shadow-lg pointer-events-none opacity-0 text-sm"
      ></div>
    </div>
  );
};

function computeRSquared(data, regressionFunc) {
    const meanY = d3.mean(data, d => Math.log(d.tiktokViews || 1));
  
    const ssTot = d3.sum(data, d => {
      const y = Math.log(d.tiktokViews || 1);
      return Math.pow(y - meanY, 2);
    });
  
    const ssRes = d3.sum(data, d => {
      const predictedY = regressionFunc(Math.log(d.tiktokPosts || 1))[1];
      const actualY = Math.log(d.tiktokViews || 1);
      return Math.pow(actualY - predictedY, 2);
    });
  
    return 1 - (ssRes / ssTot);
  }
  

export default TikTokImpact;