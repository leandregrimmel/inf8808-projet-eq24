import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const SeasonalTrends = ({ data, metric = "spotifyPopularity" }) => {
  const ref = useRef();
  const tooltipRef = useRef();
  const [activeYear, setActiveYear] = useState(null);
  const [years, setYears] = useState([]);
  const animationRef = useRef(null);

  // Store visualization elements
  const elementsRef = useRef({
    path: null,
    points: null,
    labels: null,
    rScale: null,
    angleScale: null,
  });

  useEffect(() => {
    if (!data) return;

    const uniqueYears = [
      ...new Set(data.map((d) => d.releaseDate.getFullYear())),
    ].sort();
    setYears(uniqueYears);
  }, [data]);

  useEffect(() => {
    if (!data || !years.length) return;

    // Cancel any pending animation
    if (animationRef.current) {
      d3.select(ref.current).interrupt();
    }

    const filteredData = activeYear
      ? data.filter((d) => d.releaseDate.getFullYear() === activeYear)
      : data;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlyData = monthNames.map((month, i) => {
      const monthData = filteredData.filter(
        (d) => d.releaseDate.getMonth() === i
      );
      return {
        month,
        value: monthData.length ? d3.mean(monthData, (d) => d[metric]) : 0,
      };
    });

    const width = 600;
    const height = 500;
    const innerRadius = 80;
    const outerRadius = Math.min(width, height) / 2 - 50;

    // Initialize SVG if not already done
    if (!elementsRef.current.path) {
      d3.select(ref.current).selectAll("*").remove();

      const svg = d3
        .select(ref.current)
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      // Create scales
      elementsRef.current.rScale = d3
        .scaleLinear()
        .range([innerRadius, outerRadius]);

      elementsRef.current.angleScale = d3
        .scaleBand()
        .domain(monthNames)
        .range([0, 2 * Math.PI])
        .align(0);

      // Add grid
      g.selectAll("circle.grid")
        .data([1, 2, 3, 4]) // Simple grid levels
        .enter()
        .append("circle")
        .attr("r", (d) => innerRadius + ((outerRadius - innerRadius) * d) / 4)
        .attr("fill", "none")
        .attr("stroke", "#eee")
        .attr("stroke-dasharray", "2,2");

      // Create path
      elementsRef.current.path = g
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 3);

      // Create points
      elementsRef.current.points = g
        .selectAll("circle.point")
        .data(monthlyData)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 6)
        .attr("fill", "#3b82f6")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
          d3.select(this).attr("fill", "#ef4444");
          showTooltip(event, d);
        })
        .on("mouseout", function () {
          d3.select(this).attr("fill", "#3b82f6");
          hideTooltip();
        });

      // Create labels
      elementsRef.current.labels = g
        .selectAll("text.label")
        .data(monthlyData)
        .enter()
        .append("text")
        .attr("class", "label")
        .text((d) => d.month.substring(0, 3))
        .style("font-size", "12px")
        .style("fill", "#555");
    }

    // Update scales
    elementsRef.current.rScale
      .domain([0, d3.max(monthlyData, (d) => d.value)])
      .nice();

    // Create line generator
    const line = d3
      .lineRadial()
      .angle(
        (d) =>
          elementsRef.current.angleScale(d.month) +
          elementsRef.current.angleScale.bandwidth() / 2
      )
      .radius((d) => elementsRef.current.rScale(d.value))
      .curve(d3.curveCardinalClosed);

    // Animate transitions
    animationRef.current = d3.select(ref.current).transition().duration(800);

    // Animate path
    elementsRef.current.path
      .datum(monthlyData)
      .transition(animationRef.current)
      .attr("d", line);

    // Animate points
    elementsRef.current.points
      .data(monthlyData)
      .transition(animationRef.current)
      .attr("cx", (d) => {
        const a =
          elementsRef.current.angleScale(d.month) +
          elementsRef.current.angleScale.bandwidth() / 2;
        return elementsRef.current.rScale(d.value) * Math.cos(a - Math.PI / 2);
      })
      .attr("cy", (d) => {
        const a =
          elementsRef.current.angleScale(d.month) +
          elementsRef.current.angleScale.bandwidth() / 2;
        return elementsRef.current.rScale(d.value) * Math.sin(a - Math.PI / 2);
      });

    // Update labels (no animation)
    elementsRef.current.labels
      .data(monthlyData)
      .attr("text-anchor", (d) => {
        const a =
          elementsRef.current.angleScale(d.month) +
          elementsRef.current.angleScale.bandwidth() / 2;
        return a > Math.PI ? "end" : "start";
      })
      .attr("x", (d) => {
        const a =
          elementsRef.current.angleScale(d.month) +
          elementsRef.current.angleScale.bandwidth() / 2;
        return (outerRadius + 15) * Math.cos(a - Math.PI / 2);
      })
      .attr("y", (d) => {
        const a =
          elementsRef.current.angleScale(d.month) +
          elementsRef.current.angleScale.bandwidth() / 2;
        return (outerRadius + 15) * Math.sin(a - Math.PI / 2);
      });
  }, [data, metric, activeYear, years]);

  const showTooltip = (event, d) => {
    const [x, y] = d3.pointer(event, d3.select(ref.current).node());
    d3
      .select(tooltipRef.current)
      .style("opacity", 1)
      .style("left", `${x + 150}px`)
      .style("top", `${y - 50}px`).html(`
        <div class="bg-white p-3 rounded shadow-lg border border-gray-200 min-w-[200px]">
          <strong class="text-sm block">${d.month}</strong>
          <div class="text-xs mt-2">
            <div>Average Popularity: ${d.value.toFixed(1)}</div>
            ${
              activeYear
                ? `<div class="text-gray-500">Year: ${activeYear}</div>`
                : ""
            }
          </div>
        </div>
      `);
  };

  const hideTooltip = () => {
    d3.select(tooltipRef.current).style("opacity", 0);
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Radial Chart */}
      <div style={{ position: "relative" }}>
        <svg ref={ref} width={600} height={500}></svg>
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

      {/* Year Slider */}
      {years.length > 0 && (
        <div className="w-full max-w-2xl mt-8 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Filtrer par année:</span>
            <span
              className={`text-sm font-medium px-3 py-1 rounded ${
                activeYear
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {activeYear ? activeYear : "Toutes les années"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveYear(null)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                !activeYear
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Toutes les années
            </button>
            <input
              type="range"
              min={Math.min(...years)}
              max={Math.max(...years)}
              value={activeYear || Math.max(...years)}
              onChange={(e) => setActiveYear(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              step="1"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{Math.min(...years)}</span>
            <span>{Math.max(...years)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalTrends;
