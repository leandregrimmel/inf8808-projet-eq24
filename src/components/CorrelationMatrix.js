import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Custom correlation function
function correlation(xArray, yArray) {
  const n = xArray.length;
  const meanX = d3.mean(xArray);
  const meanY = d3.mean(yArray);
  const cov =
    d3.sum(xArray.map((xi, i) => (xi - meanX) * (yArray[i] - meanY))) / n;
  const stdX = Math.sqrt(
    d3.sum(xArray.map((xi) => Math.pow(xi - meanX, 2))) / n
  );
  const stdY = Math.sqrt(
    d3.sum(yArray.map((yi) => Math.pow(yi - meanY, 2))) / n
  );
  return cov / (stdX * stdY);
}

function computeCorrelationMatrix(data, numericKeys) {
  const matrix = [];
  const n = numericKeys.length;
  const vectors = numericKeys.map((k) => data.map((d) => d[k]));

  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      const corrVal = correlation(vectors[i], vectors[j]);
      row.push(corrVal);
    }
    matrix.push(row);
  }
  return matrix;
}

const CorrelationMatrix = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;

    // Choose which numeric fields to correlate
    const numericKeys = [
      "spotifyStreams",
      "youtubeViews",
      "tiktokLikes",
      "tiktokViews",
      "shazamCounts",
      "spotifyPlaylistReach",
      // ... add more fields as needed
    ];

    // Compute correlation matrix
    const corrMatrix = computeCorrelationMatrix(data, numericKeys);
    const n = numericKeys.length;

    const width = 600;
    const height = 600;
    const margin = { top: 100, right: 10, bottom: 10, left: 100 };
    const cellSize = (width - margin.left - margin.right) / n;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    // Create color scale: -1 -> +1
    const color = d3
      .scaleSequential()
      .domain([-1, 1])
      .interpolator(d3.interpolatePuOr);

    // Render each cell
    const container = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    container
      .selectAll("rect")
      .data(
        corrMatrix.flatMap((row, i) => row.map((val, j) => ({ i, j, val })))
      )
      .enter()
      .append("rect")
      .attr("x", (d) => d.j * cellSize)
      .attr("y", (d) => d.i * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", (d) => color(d.val))
      .on("mouseover", (event, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            `<strong>${numericKeys[d.i]} vs. ${
              numericKeys[d.j]
            }</strong><br/>Corr: ${d.val.toFixed(2)}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    // Add row labels
    container
      .selectAll(".rowLabel")
      .data(numericKeys)
      .enter()
      .append("text")
      .attr("class", "rowLabel")
      .attr("x", -10)
      .attr("y", (d, i) => i * cellSize + cellSize / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .text((d) => d);

    // Add column labels
    container
      .selectAll(".colLabel")
      .data(numericKeys)
      .enter()
      .append("text")
      .attr("class", "colLabel")
      .attr("x", (d, i) => i * cellSize + cellSize / 2)
      .attr("y", -10)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "central")
      .attr(
        "transform",
        (d, i) =>
          `translate(0,0) rotate(-45, ${i * cellSize + cellSize / 2}, 0)`
      )
      .text((d) => d);
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

export default CorrelationMatrix;
