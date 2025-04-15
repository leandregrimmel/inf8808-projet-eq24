import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import formatNumber from "../../utils";

const ExpliciteContentAnalysis = ({ data, initialMetric }) => {
  const ref = useRef();
  const tooltipRef = useRef();
  const [selectedMetric, setSelectedMetric] = useState(
    initialMetric || "spotifyStreams"
  );
  useEffect(() => {
    setSelectedMetric(initialMetric || "spotifyStreams");
  }, [initialMetric]);

  useEffect(() => {
    if (!data || !data.length) return;

    const width = 700;
    const height = 500;
    const margin = { top: 70, right: 160, bottom: 80, left: 80 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height].join(" "))
      .attr("style", "max-width: 100%; height: auto;");

    const colors = {
      explicit: "#E94C3D",
      nonExplicit: "#1DB954",
      outliers: "#4285F4",
      background: "#f9f9f9",
      gridLines: "#eeeeee",
      text: "#333333",
    };

    const metricLabels = {
      spotifyStreams: "Streams Spotify",
      youtubeViews: "Vues YouTube",
      tiktokViews: "Vues TikTok",
      shazamCounts: "Comptes Shazam",
    };

    const metricMinValues = {
      spotifyStreams: 1000000,
      youtubeViews: 1000000,
      tiktokViews: 10000,
      shazamCounts: 10000,
    };

    const groups = [
      {
        key: "Non-Explicite",
        data: data.filter((d) => !d.explicitTrack),
        color: colors.nonExplicit,
      },
      {
        key: "Explicite",
        data: data.filter((d) => d.explicitTrack),
        color: colors.explicit,
      },
    ];

    const computeBoxStats = (values) => {
      const sorted = values.slice().sort((a, b) => a - b);
      const q1 = d3.quantileSorted(sorted, 0.25);
      const median = d3.quantileSorted(sorted, 0.5);
      const q3 = d3.quantileSorted(sorted, 0.75);
      const iqr = q3 - q1;
      const lowerLimit = q1 - 1.5 * iqr;
      const upperLimit = q3 + 1.5 * iqr;

      const outliers = sorted.filter((v) => v < lowerLimit || v > upperLimit);

      return {
        q1,
        median,
        q3,
        min: d3.min(sorted.filter((v) => v >= lowerLimit)) ?? sorted[0],
        max:
          d3.max(sorted.filter((v) => v <= upperLimit)) ??
          sorted[sorted.length - 1],
        outliers,
      };
    };

    const stats = groups.map((group) => ({
      group: group.key,
      color: group.color,
      count: group.data.length,
      ...computeBoxStats(group.data.map((d) => d[selectedMetric])),
    }));

    const x = d3
      .scaleBand()
      .domain(groups.map((g) => g.key))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const minValue = metricMinValues[selectedMetric];
    const maxValue = d3.max(stats, (s) => s.max) * 1.1;

    const yDomainMin = Math.max(minValue, 1);
    const yDomainMax = Math.max(maxValue, yDomainMin * 10);

    const y = d3
      .scaleLog()
      .domain([yDomainMin, yDomainMax])
      .range([height - margin.bottom, margin.top])
      .nice();

    const logMinValue = Math.log10(minValue);
    const logMaxValue = Math.log10(maxValue);
    const tickCount = 5;
    const yTicks = d3
      .ticks(logMinValue, logMaxValue, tickCount)
      .map((d) => Math.pow(10, d));

    svg
      .selectAll("line.grid")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "grid")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", colors.gridLines)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0))
      .style("font-size", "14px");

    xAxis.select(".domain").attr("stroke", "#000").attr("stroke-width", 1);

    xAxis
      .selectAll("text")
      .attr("font-weight", "bold")
      .attr("fill", colors.text)
      .attr("dy", "1.5em");

    xAxis
      .selectAll("text.count-label")
      .data(stats)
      .enter()
      .append("text")
      .attr("class", "count-label")
      .attr("x", (d) => x(d.group) + x.bandwidth() / 2)
      .attr("y", 60)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#666")
      .text((d) => `${d.count} pistes`);

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y).tickValues(yTicks).tickFormat(formatNumber).tickSize(6)
      )
      .style("font-size", "14px");

    yAxis.select(".domain").attr("stroke", "#000").attr("stroke-width", 1);

    yAxis.selectAll("text").attr("fill", colors.text).attr("dx", "-0.5em");

    yAxis.selectAll(".tick line").attr("stroke", "#cccccc");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${metricLabels[selectedMetric]} (échelle log)`);

    const boxWidth = x.bandwidth();

    stats.forEach((stat, i) => {
      const center = x(stat.group) + boxWidth / 2;

      const isMinVisible = stat.min >= minValue;
      const isMaxVisible = stat.max <= maxValue;

      const boxGroup = svg
        .append("g")
        .attr("class", `box-group-${stat.group.replace(/\s+/g, "-")}`)
        .on("mouseover", function (event) {
          const [xPos, yPos] = d3.pointer(event, svg.node());
          d3
            .select(tooltipRef.current)
            .style("opacity", 1)
            .style("left", `${xPos + 150}px`)
            .style("cursor", "pointer")
            .style("top", `${yPos - 50}px`).html(`
              <strong class="text-sm block">${stat.group}</strong>
              <div class="text-xs mt-2">
                <div>Médiane: ${formatNumber(Math.round(stat.median))}</div>
                <div>1er quartile: ${formatNumber(Math.round(stat.q1))}</div>
                <div>3e quartile: ${formatNumber(Math.round(stat.q3))}</div>
              </div>
            `);
        })
        .on("mouseout", function () {
          d3.select(tooltipRef.current).style("opacity", 0);
        });

      boxGroup
        .append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", isMinVisible ? y(stat.min) : y(minValue))
        .attr("y2", isMaxVisible ? y(stat.max) : y(maxValue))
        .attr("stroke", "#555")
        .attr("stroke-width", 1.5);

      boxGroup
        .append("rect")
        .attr("x", x(stat.group))
        .attr("y", y(stat.q3))
        .attr("width", boxWidth)
        .attr("height", y(stat.q1) - y(stat.q3))
        .attr("fill", stat.color)
        .attr("opacity", 0.8)
        .attr("stroke", "#555")
        .attr("stroke-width", 1.5)
        .attr("rx", 2);

      boxGroup
        .append("line")
        .attr("x1", x(stat.group))
        .attr("x2", x(stat.group) + boxWidth)
        .attr("y1", y(stat.median))
        .attr("y2", y(stat.median))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2.5);

      if (isMinVisible) {
        boxGroup
          .append("line")
          .attr("x1", center - boxWidth / 3)
          .attr("x2", center + boxWidth / 3)
          .attr("y1", y(stat.min))
          .attr("y2", y(stat.min))
          .attr("stroke", "#555")
          .attr("stroke-width", 1.5);
      }

      if (isMaxVisible) {
        boxGroup
          .append("line")
          .attr("x1", center - boxWidth / 3)
          .attr("x2", center + boxWidth / 3)
          .attr("y1", y(stat.max))
          .attr("y2", y(stat.max))
          .attr("stroke", "#555")
          .attr("stroke-width", 1.5);
      }

      stat.outliers.forEach((outlier) => {
        const isBelowMin = outlier < minValue;
        const yPos = isBelowMin ? y(minValue) + 20 : y(outlier);

        svg
          .append("circle")
          .attr("cx", center + (Math.random() - 0.5) * boxWidth * 0.8)
          .attr("cy", yPos)
          .attr("r", 4)
          .attr("fill", colors.outliers)
          .attr("opacity", 0.7)
          .on("mouseover", function (event) {
            d3.select(this).attr("r", 6).attr("opacity", 1);
            const [xPos, yPos] = d3.pointer(event, svg.node());
            d3
              .select(tooltipRef.current)
              .style("opacity", 1)
              .style("left", `${xPos + 150}px`)
              .style("cursor", "pointer")
              .style("top", `${yPos - 50}px`).html(`
                <strong class="text-sm block">Valeur aberrante</strong>
                <span class="text-xs text-gray-500">${stat.group}</span>
                <div class="text-xs mt-2">
                  <div>Valeur: ${formatNumber(outlier)}</div>
                </div>
              `);
          })
          .on("mouseout", function () {
            d3.select(this).attr("r", 4).attr("opacity", 0.7);
            d3.select(tooltipRef.current).style("opacity", 0);
          });

        if (isBelowMin) {
          svg
            .append("line")
            .attr("x1", center)
            .attr("x2", center + (Math.random() - 0.5) * boxWidth * 0.8)
            .attr("y1", y(minValue))
            .attr("y2", yPos)
            .attr("stroke", colors.outliers)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2")
            .attr("opacity", 0.5);
        }
      });

      svg
        .append("text")
        .attr("x", center)
        .attr("y", height - margin.bottom + 45)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#666")
        .text(`${stat.outliers.length} valeurs aberrantes`);
    });

    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 20}, ${margin.top + 40})`
      );

    legend
      .append("rect")
      .attr("width", 140)
      .attr("height", 110)
      .attr("fill", "white")
      .attr("opacity", 0.95)
      .attr("rx", 6)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);

    legend
      .append("text")
      .attr("x", 70)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Légende");

    const legendItems = [
      { label: "Non-Explicite", color: colors.nonExplicit, y: 45 },
      { label: "Explicite", color: colors.explicit, y: 70 },
      { label: "Valeurs aberrantes", color: colors.outliers, y: 95 },
    ];

    legendItems.forEach((item) => {
      const itemGroup = legend.append("g");

      if (item.label === "Valeurs aberrantes") {
        itemGroup
          .append("circle")
          .attr("cx", 15)
          .attr("cy", item.y - 8)
          .attr("r", 6)
          .attr("fill", item.color);
      } else {
        itemGroup
          .append("rect")
          .attr("x", 10)
          .attr("y", item.y - 15)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", item.color)
          .attr("rx", 2);
      }

      itemGroup
        .append("text")
        .attr("x", 30)
        .attr("y", item.y - 5)
        .attr("dominant-baseline", "middle")
        .attr("font-size", "13px")
        .text(item.label);
    });
  }, [data, selectedMetric]);

  return (
    <div style={{ position: "relative" }}>
      <h4>
        Ce graphique en boîte compare les pistes explicites et non explicites
        sur plusieurs plateformes. Il met en évidence les différences de
        popularité entre les deux catégories, en se concentrant sur les écoutes
        Spotify, les vues YouTube, les vues TikTok et les comptes Shazam.
        L'analyse montre que le caractère explicite influence différemment les
        performances selon les plateformes - avantage léger sur Spotify, léger
        désavantage sur YouTube et impact variable sur TikTok.
      </h4>
      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="metric-selector"
          style={{ marginRight: "0.5rem", fontWeight: "bold", color: "black" }}
        >
          Métrique de popularité :
        </label>
        <select
          id="metric-selector"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          <option value="spotifyStreams">Streams Spotify</option>
          <option value="youtubeViews">Vues YouTube</option>
          <option value="tiktokViews">Vues TikTok</option>
          <option value="shazamCounts">Comptes Shazam</option>
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
          backgroundColor: "white",
          padding: "12px",
          borderRadius: "6px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb",
          fontSize: "14px",
          maxWidth: "220px",
        }}
      ></div>
    </div>
  );
};

export default ExpliciteContentAnalysis;
