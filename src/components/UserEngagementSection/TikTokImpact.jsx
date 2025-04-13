import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import formatNumber from "../../utils";

const TikTokImpact = ({ data }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Filter out data points with missing or non-positive values
    const filteredData = data.filter(
      (d) => d.tiktokPosts > 0 && d.tiktokViews > 0 && d.spotifyStreams > 0
    );

    // Apply log transformation to the data
    const logData = filteredData.map((d) => ({
      ...d,
      logTikTokPosts: Math.log10(d.tiktokPosts),
      logTikTokViews: Math.log10(d.tiktokViews),
      logSpotifyStreams: Math.log10(d.spotifyStreams),
    }));

    // Set up margins and dimensions
    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a clipping path
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // Set up scales
    const x = d3
      .scaleLinear()
      .domain(d3.extent(logData, (d) => d.logTikTokPosts))
      .range([0, width])
      .nice();

    const y = d3
      .scaleLinear()
      .domain(d3.extent(logData, (d) => d.logTikTokViews))
      .range([height, 0])
      .nice();

    // Logarithmic size scale for circles
    const size = d3
      .scaleLog()
      .base(10)
      .domain([1e3, 1e9]) // Fixed domain for size
      .range([4, 30]);

    // Color scale using a perceptually uniform sequential color scheme
    const color = d3.scaleSequential(d3.interpolateViridis).domain([3, 9]);

    // Create circles for each data point
    const circles = svg
      .append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll(".dot")
      .data(logData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.logTikTokPosts))
      .attr("cy", (d) => y(d.logTikTokViews))
      .attr("r", (d) => size(d.spotifyStreams))
      .attr("fill", (d) => color(Math.log10(d.spotifyStreams)))
      .attr("opacity", 0.8)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.8).attr("fill", "#ff0000");
        showTooltip(event, d);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("opacity", 0.8)
          .attr("fill", color(Math.log10(d.spotifyStreams)));
        hideTooltip();
      });

    // Add axes
    const xAxis = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => formatNumber(Math.pow(10, d))));

    xAxis
      .append("text")
      .attr("fill", "#000")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Nombre de Posts TikTok (Log10)");

    const yAxis = svg
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).tickFormat((d) => formatNumber(Math.pow(10, d))));

    yAxis
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Vues TikTok (Log10)");

    // Unified legend showing size and color together
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 20}, 40)`);

    legend
      .append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text("Streams Spotify");

    // Standard stream values for legend
    const legendValues = [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9]; // 1K to 1B

    legendValues.forEach((value, i) => {
      const yPos = i * 35 + 20;
      const logValue = Math.log10(value);

      // Legend circle
      legend
        .append("circle")
        .attr("cx", 15)
        .attr("cy", yPos)
        .attr("r", size(value))
        .attr("fill", color(logValue))
        .attr("opacity", 0.6)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);

      // Legend text with abbreviated values
      const formattedValue = formatNumber(value);

      legend
        .append("text")
        .attr("x", 40)
        .attr("y", yPos + 5)
        .attr("font-size", "11px")
        .text(formattedValue);
    });

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([1, 40]) // Increased max zoom level
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);

        circles
          .attr("cx", (d) => newX(d.logTikTokPosts))
          .attr("cy", (d) => newY(d.logTikTokViews));

        xAxis.call(
          d3.axisBottom(newX).tickFormat((d) => formatNumber(Math.pow(10, d)))
        );
        yAxis.call(
          d3.axisLeft(newY).tickFormat((d) => formatNumber(Math.pow(10, d)))
        );
      });

    // Add reset zoom button
    const resetZoom = () => {
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    };

    svg
      .append("g")
      .attr("class", "zoom-controls")
      .append("foreignObject")
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", 100)
      .attr("height", 30)
      .append("xhtml:div")
      .style("background", "white")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("cursor", "pointer")
      .style("font-size", "12px")
      .style("text-align", "center")
      .style("border", "1px solid black")
      .style("transition", "background 0.2s")
      .html("Reset Zoom")
      .on("mouseover", function () {
        d3.select(this).style("background", "#f0f0f0");
      })
      .on("mouseout", function () {
        d3.select(this).style("background", "white");
      })
      .on("click", resetZoom);

    // Apply zoom behavior to the SVG
    svg.call(zoom);

    // Tooltip functions
    function showTooltip(event, d) {
      const [xpos, ypos] = d3.pointer(event, svg.node());

      d3
        .select(tooltipRef.current)
        .style("opacity", 1)
        .style("left", `${xpos + 250}px`)
        .style("top", `${ypos + 250}px`).html(`
          <div class="text-sm bg-white p-3 rounded shadow-lg border border-gray-200">
            <strong class="block text-base mb-1">${d.track}</strong>
            <div class="mb-1"><span class="font-semibold">Artiste:</span> ${
              d.artist
            }</div>
            <div class="mb-1"><span class="font-semibold">Posts TikTok:</span> ${formatNumber(
              d.tiktokPosts
            )}</div>
            <div class="mb-1"><span class="font-semibold">Vues TikTok:</span> ${formatNumber(
              d.tiktokViews
            )}</div>
            <div><span class="font-semibold">Streams Spotify:</span> ${formatNumber(
              d.spotifyStreams
            )}</div>
          </div>
        `);
    }

    function hideTooltip() {
      d3.select(tooltipRef.current).style("opacity", 0);
    }

    // Cleanup function
    return () => {
      d3.select(svgRef.current).selectAll("*").remove();
    };
  }, [data]);

  return (
    <div className="relative">
      <h4>
        Bien qu'aucune corrélation globale forte n'apparaisse entre l'activité
        TikTok (posts et vues) et les streams Spotify, on observe des tendances
        plus marquées pour certains artistes jeunes comme Taylor Swift, où
        l'engagement TikTok semble mieux correspondre au succès sur Spotify. Les
        cercles plus grands et plus pâles représentent les artistes avec le plus
        de streams, permettant d'identifier visuellement ces relations
        potentielles lorsqu'on zoome sur des segments spécifiques du graphique.
      </h4>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none opacity-0 transition-opacity duration-200"
      ></div>
    </div>
  );
};

export default TikTokImpact;
