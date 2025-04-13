import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import formatNumber from "../../utils"; // The number formatting function

const SeasonalTrends = ({ data, metric = "spotifyPopularity" }) => {
  const ref = useRef();
  const tooltipRef = useRef();
  const [activeYear, setActiveYear] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(metric);
  const animationRef = useRef(null);

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

    if (animationRef.current) {
      d3.select(ref.current).interrupt();
    }

    const filteredData = activeYear
      ? data.filter((d) => d.releaseDate.getFullYear() === activeYear)
      : data;

    const monthNames = [
      { full: "Janvier", abr: "JAN" },
      { full: "Février", abr: "FÉV" },
      { full: "Mars", abr: "MAR" },
      { full: "Avril", abr: "AVR" },
      { full: "Mai", abr: "MAI" },
      { full: "Juin", abr: "JUN" },
      { full: "Juillet", abr: "JUL" },
      { full: "Août", abr: "AOÛ" },
      { full: "Septembre", abr: "SEP" },
      { full: "Octobre", abr: "OCT" },
      { full: "Novembre", abr: "NOV" },
      { full: "Décembre", abr: "DÉC" },
    ];

    const monthlyData = monthNames.map((month, i) => {
      const monthData = filteredData.filter(
        (d) => d.releaseDate.getMonth() === i
      );
      return {
        month,
        value: monthData.length
          ? d3.mean(monthData, (d) => d[selectedMetric])
          : 0,
      };
    });

    const width = 600;
    const height = 500;
    const innerRadius = 80;
    const outerRadius = Math.min(width, height) / 2 - 50;

    if (!elementsRef.current.path) {
      d3.select(ref.current).selectAll("*").remove();

      const svg = d3
        .select(ref.current)
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      elementsRef.current.rScale = d3
        .scaleLinear()
        .range([innerRadius, outerRadius]);
      elementsRef.current.angleScale = d3
        .scaleBand()
        .domain(monthNames.map((m) => m.abr))
        .range([0, 2 * Math.PI])
        .align(0);

      g.selectAll("circle.grid")
        .data([1, 2, 3, 4])
        .enter()
        .append("circle")
        .attr("class", "grid")
        .attr("r", (d) => innerRadius + ((outerRadius - innerRadius) * d) / 4)
        .attr("fill", "none")
        .attr("stroke", "#eee")
        .attr("stroke-dasharray", "2,2");

      elementsRef.current.labels = g
        .selectAll("text.label")
        .data(monthlyData)
        .enter()
        .append("text")
        .attr("class", "label")
        .text((d) => d.month.abr)
        .style("font-size", "12px")
        .style("fill", "#555");

      elementsRef.current.path = g
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 3);

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
    }

    // Update the radial scale domain based on the new data.
    elementsRef.current.rScale
      .domain([0, d3.max(monthlyData, (d) => d.value)])
      .nice();

    d3.select(ref.current).selectAll(".radial-ticks").remove();
    const ticks = elementsRef.current.rScale.ticks(4);
    const svg = d3.select(ref.current);
    const g = svg.select("g");
    const tickGroup = g.append("g").attr("class", "radial-ticks");

    tickGroup
      .selectAll("text")
      .data(ticks)
      .enter()
      .append("text")
      .attr("x", (d) => elementsRef.current.rScale(d) + 4)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "10px")
      .style("fill", "#aaa")
      .text((d) => formatNumber(d));

    const line = d3
      .lineRadial()
      .angle(
        (d) =>
          elementsRef.current.angleScale(d.month.abr) +
          elementsRef.current.angleScale.bandwidth() / 2
      )
      .radius((d) => elementsRef.current.rScale(d.value))
      .curve(d3.curveCardinalClosed);

    animationRef.current = d3.select(ref.current).transition().duration(800);

    elementsRef.current.path
      .datum(monthlyData)
      .transition(animationRef.current)
      .attr("d", line);

    elementsRef.current.points
      .data(monthlyData)
      .transition(animationRef.current)
      .attr("cx", (d) => {
        const a =
          elementsRef.current.angleScale(d.month.abr) +
          elementsRef.current.angleScale.bandwidth() / 2;
        return elementsRef.current.rScale(d.value) * Math.cos(a - Math.PI / 2);
      })
      .attr("cy", (d) => {
        const a =
          elementsRef.current.angleScale(d.month.abr) +
          elementsRef.current.angleScale.bandwidth() / 2;
        return elementsRef.current.rScale(d.value) * Math.sin(a - Math.PI / 2);
      });

    elementsRef.current.labels
      .data(monthlyData)
      .attr("text-anchor", (d) => {
        const a =
          elementsRef.current.angleScale(d.month.abr) +
          elementsRef.current.angleScale.bandwidth() / 2;
        return a > Math.PI ? "end" : "start";
      })
      .attr("x", (d) => {
        const a =
          elementsRef.current.angleScale(d.month.abr) +
          elementsRef.current.angleScale.bandwidth() / 2;
        return (outerRadius + 15) * Math.cos(a - Math.PI / 2);
      })
      .attr("y", (d) => {
        const a =
          elementsRef.current.angleScale(d.month.abr) +
          elementsRef.current.angleScale.bandwidth() / 2;
        return (outerRadius + 15) * Math.sin(a - Math.PI / 2);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedMetric, activeYear, years]);

  // Tooltip functions.
  const showTooltip = (event, d) => {
    const [x, y] = d3.pointer(event, d3.select(ref.current).node());
    d3
      .select(tooltipRef.current)
      .style("opacity", 1)
      .style("left", `${x + 150}px`)
      .style("top", `${y - 50}px`).html(`
      <div class="bg-white p-3 rounded shadow-lg border border-gray-200 min-w-[200px]">
        <strong class="text-sm block">${d.month.full}</strong>
        <div class="text-xs mt-2">
          <div>Popularité Moyenne: ${formatNumber(d.value)}</div>
          ${
            activeYear
              ? `<div class="text-gray-500">Année: ${activeYear}</div>`
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
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Title and descriptive text */}
      <h4 style={{ textAlign: "center", maxWidth: "600px" }}>
        Ce graphique circulaire révèle les tendances mensuelles de popularité
        des musiques. La courbe et les points interactifs mettent en évidence
        les pics saisonniers, tandis que le filtre par année permet d'analyser
        leur évolution dans le temps.
      </h4>

      {/* Dropdown to select a popularity metric */}
      <div style={{ margin: "1rem", textAlign: "center" }}>
        <label htmlFor="popularity-metric" style={{ marginRight: "0.5rem" }}>
          Choisissez une métrique de popularité :
        </label>
        <select
          id="popularity-metric"
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

      {/* SVG Radial Chart */}
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

        {/* Year slider for filtering */}
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
            <button
              onClick={() => setActiveYear(null)}
              className={`px-3 py-1 mt-8 rounded text-sm transition-colors ${
                !activeYear
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Toutes les années
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalTrends;
