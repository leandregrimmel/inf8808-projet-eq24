// AgeVsPopularityMetric.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import formatNumber from "../../utils";

const AgeVsPopularityMetric = ({ data, initialMetric }) => {
  const ref = useRef();
  const tooltipRef = useRef();
  const [selectedMetric, setSelectedMetric] = React.useState(
    initialMetric || "spotifyStreams"
  );

  useEffect(() => {
    setSelectedMetric(initialMetric || "spotifyStreams");
  }, [initialMetric]);

  useEffect(() => {
    if (!data || !data.length) return;

    const width = 800;
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
    const yExtent = d3.extent(data, (d) => d[selectedMetric]);
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

    // Calculate correlation coefficient (Pearson's R)
    const n = data.length;
    const sumX = d3.sum(data, (d) => d.age);
    const sumY = d3.sum(data, (d) => d[selectedMetric]);
    const meanX = sumX / n;
    const meanY = sumY / n;
    const covXY =
      d3.sum(data, (d) => (d.age - meanX) * (d[selectedMetric] - meanY)) / n;
    const stdX = Math.sqrt(d3.sum(data, (d) => Math.pow(d.age - meanX, 2)) / n);
    const stdY = Math.sqrt(
      d3.sum(data, (d) => Math.pow(d[selectedMetric] - meanY, 2)) / n
    );
    const rValue = covXY / (stdX * stdY);

    // Calculate regression line parameters
    const numerator = d3.sum(
      data,
      (d) => (d.age - meanX) * (d[selectedMetric] - meanY)
    );
    const denominator = d3.sum(data, (d) => Math.pow(d.age - meanX, 2));
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    // X axis
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

    // Y axis
    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .style("font-size", "14px");

    yAxis.selectAll(".tick text").text((d) => formatNumber(d));

    const metricLabels = {
      spotifyStreams: "Spotify Streams",
      youtubeViews: "YouTube Views",
      tiktokViews: "TikTok Views",
      shazamCounts: "Shazam Counts",
      pandoraStreams: "Pandora Streams",
    };

    yAxis
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "16px")
      .text(metricLabels[selectedMetric]);

    // Grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-height + margin.top + margin.bottom)
          .tickFormat("")
      )
      .style("stroke", "lightgray")
      .style("stroke-opacity", 0.3);

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat("")
      )
      .style("stroke", "lightgray")
      .style("stroke-opacity", 0.3);

    // Draw scatter plot
    const scatter = svg.append("g");

    scatter
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.age))
      .attr("cy", (d) => y(d[selectedMetric]))
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
                <div>${
                  metricLabels[selectedMetric]
                }: ${formatNumber(d[selectedMetric])}</div>
              </div>
            </div>
          `);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue").attr("r", 5);
        d3.select(tooltipRef.current).style("opacity", 0);
      });

    // Draw regression line
    const regLine = [
      { age: xExtent[0], [selectedMetric]: intercept + slope * xExtent[0] },
      { age: xExtent[1], [selectedMetric]: intercept + slope * xExtent[1] },
    ];

    svg
      .append("line")
      .datum(regLine)
      .attr("x1", (d) => x(d[0].age))
      .attr("y1", (d) => y(d[0][selectedMetric]))
      .attr("x2", (d) => x(d[1].age))
      .attr("y2", (d) => y(d[1][selectedMetric]))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Info box with regression details
    const infoBox = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right - 200},${margin.top})`
      );

    infoBox
      .append("rect")
      .attr("width", 180)
      .attr("height", 80)
      .attr("fill", "white")
      .attr("stroke", "#ccc")
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("filter", "url(#drop-shadow)");

    const formatEquation = () => {
      const roundedSlope = slope.toExponential(2);
      const roundedIntercept = intercept.toExponential(2);
      return `y = ${roundedSlope}x + ${roundedIntercept}`;
    };

    infoBox
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("font-size", "12px")
      .text("Régression linéaire:");
    infoBox
      .append("text")
      .attr("x", 10)
      .attr("y", 35)
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(formatEquation());
    infoBox
      .append("text")
      .attr("x", 10)
      .attr("y", 55)
      .attr("font-size", "12px")
      .text(`Coefficient de corrélation (R):`);
    infoBox
      .append("text")
      .attr("x", 10)
      .attr("y", 70)
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(`${rValue.toFixed(3)}`);

    const rText = infoBox
      .selectAll("text")
      .filter((d, i, nodes) => nodes[i].textContent === `${rValue.toFixed(3)}`);
    rText.attr("fill", () => {
      const absR = Math.abs(rValue);
      if (absR > 0.7) return "#2ecc71";
      if (absR > 0.3) return "#f39c12";
      return "#e74c3c";
    });
  }, [data, selectedMetric]);

  return (
    <div style={{ position: "relative" }}>
      <h4>
        Le nuage de points interactif présenté ci-dessous montre la relation
        entre l'âge des chansons et divers indicateurs de succès, avec une ligne
        de régression pour visualiser la tendance globale.
      </h4>
      <div style={{ margin: "1rem" }}>
        <label htmlFor="metric-selector" style={{ marginRight: "0.5rem", fontWeight: "bold", color: "black" }}>
          Métrique de popularité :
        </label>
        <select
          id="metric-selector"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          <option value="spotifyStreams">Spotify Streams</option>
          <option value="youtubeViews">YouTube Views</option>
          <option value="tiktokViews">TikTok Views</option>
          <option value="shazamCounts">Shazam Counts</option>
          <option value="pandoraStreams">Pandora Streams</option>
        </select>
      </div>
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

export default AgeVsPopularityMetric;
