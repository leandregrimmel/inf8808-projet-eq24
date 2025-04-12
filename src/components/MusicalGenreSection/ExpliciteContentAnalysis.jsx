import { useEffect, useRef } from "react";
import * as d3 from "d3";
import formatNumber from "../../utils";

const ExpliciteContentAnalysis = ({ data }) => {
  const ref = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    const width = 700;
    const height = 500;
    const margin = { top: 40, right: 160, bottom: 80, left: 80 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height].join(" "))
      .attr("style", "max-width: 100%; height: auto;");

    // Theme colors
    const colors = {
      explicit: "#E94C3D",
      nonExplicit: "#1DB954",
      outliers: "#4285F4",
      background: "#f9f9f9",
      gridLines: "#eeeeee",
      text: "#333333",
    };

    // Group data by explicit vs non-explicit
    const groups = [
      { 
        key: "Non-Explicite", 
        data: data.filter(d => !d.explicitTrack), 
        color: colors.nonExplicit 
      },
      { 
        key: "Explicite", 
        data: data.filter(d => d.explicitTrack), 
        color: colors.explicit 
      }
    ];

    // Compute box plot statistics
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
        max: d3.max(sorted.filter((v) => v <= upperLimit)) ?? sorted[sorted.length - 1],
        outliers,
      };
    };

    const stats = groups.map(group => ({
      group: group.key,
      color: group.color,
      count: group.data.length,
      ...computeBoxStats(group.data.map(d => d.spotifyStreams))
    }));

    // X scale for groups
    const x = d3
      .scaleBand()
      .domain(groups.map(g => g.key))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    // Y scale (logarithmic)
    const minValue = 1000000;
    const maxValue = d3.max(stats, s => s.max) * 1.1;
    const y = d3
      .scaleLog()
      .domain([minValue, maxValue])
      .range([height - margin.bottom, margin.top])
      .nice();

    // Calculate y-axis ticks
    const logMinValue = Math.log10(minValue);
    const logMaxValue = Math.log10(maxValue);
    const tickCount = 5;
    const yTicks = d3
      .ticks(logMinValue, logMaxValue, tickCount)
      .map((d) => Math.pow(10, d));

    // Add grid lines
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

    // Add axes
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

    // Add count labels below group names
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
      .text((d) => `${d.count} tracks`);

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y).tickValues(yTicks).tickFormat(formatNumber).tickSize(6)
      )
      .style("font-size", "14px");

    yAxis.select(".domain").attr("stroke", "#000").attr("stroke-width", 1);

    yAxis
      .selectAll("text")
      .attr("fill", colors.text)
      .attr("dx", "-0.5em");

    yAxis.selectAll(".tick line").attr("stroke", "#cccccc");

    // Add y-axis title
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Spotify Streams (log scale)");

    // Draw box plots
    const boxWidth = x.bandwidth();
    
    stats.forEach((stat, i) => {
      const center = x(stat.group) + boxWidth / 2;

      // Check visibility
      const isMinVisible = stat.min >= minValue;
      const isMaxVisible = stat.max <= maxValue;

      // Create box group for hover interactions
      const boxGroup = svg.append("g")
        .attr("class", `box-group-${stat.group.replace(/\s+/g, '-')}`)
        .on("mouseover", function(event) {
          const [xPos, yPos] = d3.pointer(event, svg.node());
          
          d3.select(tooltipRef.current)
            .style("opacity", 1)
            .style("left", `${xPos + 150}px`)
            .style("cursor", "pointer")
            .style("top", `${yPos - 50}px`).html(`
              <strong class="text-sm block">${stat.group}</strong>
              <div class="text-xs mt-2">
                <div>Median: ${formatNumber(Math.round(stat.median))}</div>
                <div>Q1: ${formatNumber(Math.round(stat.q1))}</div>
                <div>Q3: ${formatNumber(Math.round(stat.q3))}</div>
              </div>
            `);
        })
        .on("mouseout", function() {
          d3.select(tooltipRef.current).style("opacity", 0);
        });

      // Whisker line (min to max)
      boxGroup.append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", isMinVisible ? y(stat.min) : y(minValue))
        .attr("y2", isMaxVisible ? y(stat.max) : y(maxValue))
        .attr("stroke", "#555")
        .attr("stroke-width", 1.5);

      // Box (Q1 to Q3)
      boxGroup.append("rect")
        .attr("x", x(stat.group))
        .attr("y", y(stat.q3))
        .attr("width", boxWidth)
        .attr("height", y(stat.q1) - y(stat.q3))
        .attr("fill", stat.color)
        .attr("opacity", 0.8)
        .attr("stroke", "#555")
        .attr("stroke-width", 1.5)
        .attr("rx", 2);

      // Median line
      boxGroup.append("line")
        .attr("x1", x(stat.group))
        .attr("x2", x(stat.group) + boxWidth)
        .attr("y1", y(stat.median))
        .attr("y2", y(stat.median))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2.5);

      // Min "tick" - only if in range
      if (isMinVisible) {
        boxGroup.append("line")
          .attr("x1", center - boxWidth / 3)
          .attr("x2", center + boxWidth / 3)
          .attr("y1", y(stat.min))
          .attr("y2", y(stat.min))
          .attr("stroke", "#555")
          .attr("stroke-width", 1.5);
      }

      // Max "tick" - only if in range
      if (isMaxVisible) {
        boxGroup.append("line")
          .attr("x1", center - boxWidth / 3)
          .attr("x2", center + boxWidth / 3)
          .attr("y1", y(stat.max))
          .attr("y2", y(stat.max))
          .attr("stroke", "#555")
          .attr("stroke-width", 1.5);
      }

      // Outliers
      stat.outliers.forEach(outlier => {
        const isBelowMin = outlier < minValue;
        const yPos = isBelowMin ? y(minValue) + 20 : y(outlier);
        
        svg.append("circle")
          .attr("cx", center + (Math.random() - 0.5) * boxWidth * 0.8)
          .attr("cy", yPos)
          .attr("r", 4)
          .attr("fill", colors.outliers)
          .attr("opacity", 0.7)
          .on("mouseover", function(event) {
            d3.select(this).attr("r", 6).attr("opacity", 1);
            
            const [xPos, yPos] = d3.pointer(event, svg.node());
            
            d3.select(tooltipRef.current)
              .style("opacity", 1)
              .style("left", `${xPos + 150}px`)
              .style("cursor", "pointer")
              .style("top", `${yPos - 50}px`).html(`
                <strong class="text-sm block">Outlier</strong>
                <span class="text-xs text-gray-500">${stat.group}</span>
                <div class="text-xs mt-2">
                  <div>Streams: ${formatNumber(outlier)}</div>
                </div>
              `);
          })
          .on("mouseout", function() {
            d3.select(this).attr("r", 4).attr("opacity", 0.7);
            d3.select(tooltipRef.current).style("opacity", 0);
          });

        if (isBelowMin) {
          svg.append("line")
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

      // Outlier count
      svg.append("text")
        .attr("x", center)
        .attr("y", height - margin.bottom + 45)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#666")
        .text(`${stat.outliers.length} outliers`);
    });

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top + 40})`);

    // Legend background
    legend
      .append("rect")
      .attr("width", 140)
      .attr("height", 110)
      .attr("fill", "white")
      .attr("opacity", 0.95)
      .attr("rx", 6)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);

    // Legend title
    legend
      .append("text")
      .attr("x", 70)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Légende");

    // Legend items
    const legendItems = [
      { label: "Non-Explicite", color: colors.nonExplicit, y: 45 },
      { label: "Explicite", color: colors.explicit, y: 70 },
      { label: "Outliers", color: colors.outliers, y: 95 }
    ];

    legendItems.forEach(item => {
      const itemGroup = legend.append("g");
      
      if (item.label === "Outliers") {
        itemGroup.append("circle")
          .attr("cx", 15)
          .attr("cy", item.y - 8)
          .attr("r", 6)
          .attr("fill", item.color);
      } else {
        itemGroup.append("rect")
          .attr("x", 10)
          .attr("y", item.y - 15)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", item.color)
          .attr("rx", 2);
      }
      
      itemGroup.append("text")
        .attr("x", 30)
        .attr("y", item.y - 5)
        .attr("dominant-baseline", "middle")
        .attr("font-size", "13px")
        .text(item.label);
    });

  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <h4 style={{ marginBottom: "20px" }}>
        Ce diagramme en boîte compare la distribution des streams Spotify entre les 
        chansons explicites et non-explicites, avec une échelle logarithmique pour 
        mieux visualiser l'étendue des données.
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
          backgroundColor: "white",
          padding: "12px",
          borderRadius: "6px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb",
          fontSize: "14px",
          maxWidth: "220px"
        }}
      ></div>
    </div>
  );
};

export default ExpliciteContentAnalysis;