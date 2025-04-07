import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

/**
 * Utility function: Given an array of numeric values,
 * returns { q1, median, q3, min, max, outliers } for boxplot.
 */
function computeBoxStats(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const q1 = d3.quantileSorted(sorted, 0.25);
  const median = d3.quantileSorted(sorted, 0.5);
  const q3 = d3.quantileSorted(sorted, 0.75);

  // Interquartile range
  const iqr = q3 - q1;
  const lowerLimit = q1 - 1.5 * iqr;
  const upperLimit = q3 + 1.5 * iqr;

  // Filter outliers
  const outliers = sorted.filter((v) => v < lowerLimit || v > upperLimit);

  return {
    q1,
    median,
    q3,
    min: d3.min(sorted.filter((v) => v >= lowerLimit)) ?? sorted[0],
    max: d3.max(sorted.filter((v) => v <= upperLimit)) ?? sorted[sorted.length - 1],
    outliers,
  };
}

const BoxPlot = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;

    // Theme colors
    const colors = {
      explicit: "#E94C3D", // Red for explicit content
      nonExplicit: "#1DB954", // Spotify green for non-explicit content
      background: "#f9f9f9",
      gridLines: "#eeeeee",
      text: "#333333",
      outliers: "#7D54EA" // Purple for outliers
    };

    // Separate data by explicit vs. non-explicit
    const groups = [
      { key: "Non-Explicit", data: data.filter((d) => d.explicitTrack === false), color: colors.nonExplicit },
      { key: "Explicit", data: data.filter((d) => d.explicitTrack === true), color: colors.explicit },
    ];

    // Compute stats for each group
    const stats = groups.map((group) => {
      const streams = group.data.map((d) => d.spotifyStreams);
      return {
        group: group.key,
        color: group.color,
        count: group.data.length,
        ...computeBoxStats(streams),
      };
    });

    // Calculate responsive dimensions
    const container = d3.select(ref.current.parentNode);
    const containerWidth = parseInt(container.style("width")) || 800;
    
    const width = Math.min(containerWidth, 900);
    const height = 550;
    const margin = { top: 80, right: 160, bottom: 80, left: 100 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("font-family", "'Gotham', 'Helvetica Neue', Arial, sans-serif");

    // Add background rectangle with subtle gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "bg-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f9f9f9");
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f0f0f0");
    
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#bg-gradient)")
      .attr("rx", 8);

    // X scale for groups
    const x = d3
      .scaleBand()
      .domain(stats.map((s) => s.group))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    // Find meaningful minimum and maximum for the y-axis
    // Start from a minimum of 1 million to focus on the meaningful range
    const minValue = 1000000; // Start from 1 million
    
    // Find the max of all stream values to catch outliers
    const allOutliers = stats.flatMap(s => s.outliers);
    // If we have outliers, use them to determine max, otherwise use the max from stats
    const maxOutlier = allOutliers.length > 0 ? d3.max(allOutliers) : 0;
    const maxRegular = d3.max(stats, s => s.max);
    const maxValue = Math.max(maxOutlier, maxRegular) * 1.1;

    // Use log scale for Y axis with better bounds
    const y = d3
      .scaleLog()
      .domain([minValue, maxValue])
      .range([height - margin.bottom, margin.top])
      .nice();

    // Format tick values for the log scale
    const formatStreams = (val) => {
      if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val;
    };

    // Calculate y-axis ticks to be more readable
    const logMinValue = Math.log10(minValue);
    const logMaxValue = Math.log10(maxValue);
    const tickCount = 5; // Limit the number of ticks for better readability
    const yTicks = d3.ticks(logMinValue, logMaxValue, tickCount)
      .map(d => Math.pow(10, d));

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

    // Axes with styled appearance
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .tickSize(0)
      );
    
    // Style x-axis
    xAxis.select(".domain").attr("stroke", "#cccccc");
    xAxis.selectAll("text")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", colors.text)
      .attr("dy", "0.5em");
    
    // Add count labels below the group names
    xAxis.selectAll("text.count-label")
      .data(stats)
      .enter()
      .append("text")
      .attr("class", "count-label")
      .attr("x", d => x(d.group) + x.bandwidth() / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#666")
      .text(d => `${d.count} tracks`);
    
    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y)
          .tickValues(yTicks)
          .tickFormat(formatStreams)
          .tickSize(6)
      );
    
    // Style y-axis
    yAxis.select(".domain").attr("stroke", "#cccccc");
    yAxis.selectAll("text")
      .attr("font-size", "12px")
      .attr("fill", colors.text)
      .attr("dx", "-0.5em");
    
    yAxis.selectAll(".tick line")
      .attr("stroke", "#cccccc");

    // Add y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2))
      .attr("y", margin.left / 3 - 10)
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .text("Spotify Streams (log scale)");

    // Title with enhanced styling
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2 - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .attr("fill", "#191414")
      .text("Spotify Streams Distribution by Content Type");
      
    // Subtitle
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2 + 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#666")
      .text("Comparison between explicit and non-explicit tracks (logarithmic scale)");

    // Function to create a smooth animation
    const animate = (selection, duration = 1000) => {
      return selection.transition().duration(duration).ease(d3.easeCubicOut);
    };

    // Boxplot elements with animations
    const boxWidth = x.bandwidth();
    const boxContainer = svg.append("g");

    // Create text positions for each stat to avoid overlaps
    const textPositions = {
      max: { offsetY: -25, side: "top" },
      q3: { offsetY: -5, side: "right" },
      median: { offsetY: 0, side: "inside" },
      q1: { offsetY: 5, side: "right" },
      min: { offsetY: 25, side: "bottom" }
    };

    stats.forEach((s, i) => {
      const center = x(s.group) + boxWidth / 2;
      // Calculate horizontal offset based on which box (left/right)
      const horizontalPosition = i === 0 ? -1 : 1; // -1 for left, 1 for right

      // Check if values are within our y-axis domain
      const isMinVisible = s.min >= minValue;
      const isMaxVisible = s.max <= maxValue;
      
      // Add vertical line from min to max (whiskers)
      animate(
        boxContainer
          .append("line")
          .attr("x1", center)
          .attr("x2", center)
          .attr("y1", isMinVisible ? y(s.min) : y(minValue))
          .attr("y2", isMinVisible ? y(s.min) : y(minValue))
          .attr("stroke", "#555555")
          .attr("stroke-width", 1.5)
      )
      .attr("y2", isMaxVisible ? y(s.max) : y(maxValue));

      // Box with animation
      animate(
        boxContainer
          .append("rect")
          .attr("x", x(s.group))
          .attr("y", y(s.q3))
          .attr("width", boxWidth)
          .attr("height", 0)
          .attr("stroke", "#555555")
          .attr("stroke-width", 1.5)
          .attr("fill", s.color)
          .attr("opacity", 0.8)
          .attr("rx", 2)
      )
      .attr("height", y(s.q1) - y(s.q3));

      // Add the median value inside the box
      boxContainer
        .append("text")
        .attr("x", center)
        .attr("y", y(s.median) + 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("text-shadow", "0 0 2px rgba(0,0,0,0.5)")
        .text(formatStreams(Math.round(s.median)));

      // Median line with animation
      animate(
        boxContainer
          .append("line")
          .attr("x1", x(s.group))
          .attr("x2", x(s.group))
          .attr("y1", y(s.median))
          .attr("y2", y(s.median))
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2.5)
      )
      .attr("x2", x(s.group) + boxWidth);

      // Min "tick" with animation - only if in range
      if (isMinVisible) {
        animate(
          boxContainer
            .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(s.min))
            .attr("y2", y(s.min))
            .attr("stroke", "#555555")
            .attr("stroke-width", 1.5)
        )
        .attr("x1", center - boxWidth / 3)
        .attr("x2", center + boxWidth / 3);
      }

      // Max "tick" with animation - only if in range
      if (isMaxVisible) {
        animate(
          boxContainer
            .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(s.max))
            .attr("y2", y(s.max))
            .attr("stroke", "#555555")
            .attr("stroke-width", 1.5)
        )
        .attr("x1", center - boxWidth / 3)
        .attr("x2", center + boxWidth / 3);
      }

      // Add statistics labels with positioning to avoid overlap
      // Q3 label - positioned on left or right side of the box based on index
      const q3Position = {
        x: center + (horizontalPosition * boxWidth * 0.6),
        y: y(s.q3),
        anchor: horizontalPosition < 0 ? "end" : "start"
      };
      
      boxContainer
        .append("text")
        .attr("x", q3Position.x)
        .attr("y", q3Position.y)
        .attr("text-anchor", q3Position.anchor)
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", s.color)
        .attr("opacity", 0.9)
        .text(`Q3: ${formatStreams(s.q3)}`);

      // Q1 label
      const q1Position = {
        x: center + (horizontalPosition * boxWidth * 0.6),
        y: y(s.q1),
        anchor: horizontalPosition < 0 ? "end" : "start"
      };
      
      boxContainer
        .append("text")
        .attr("x", q1Position.x)
        .attr("y", q1Position.y)
        .attr("text-anchor", q1Position.anchor)
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", s.color)
        .attr("opacity", 0.9)
        .text(`Q1: ${formatStreams(s.q1)}`);
        
      // Max label
      if (isMaxVisible) {
        const maxPosition = {
          x: center + (horizontalPosition * boxWidth * 0.6),
          y: y(s.max) - 10,
          anchor: horizontalPosition < 0 ? "end" : "start"
        };
        
        boxContainer
          .append("text")
          .attr("x", maxPosition.x)
          .attr("y", maxPosition.y)
          .attr("text-anchor", maxPosition.anchor)
          .attr("font-size", "11px")
          .attr("font-weight", "bold")
          .attr("fill", "#555")
          .text(`Max: ${formatStreams(s.max)}`);
          
        // Connect line from max to label for clarity
        boxContainer
          .append("line")
          .attr("x1", center)
          .attr("x2", maxPosition.x - (horizontalPosition < 0 ? 5 : -5))
          .attr("y1", y(s.max))
          .attr("y2", maxPosition.y + 5)
          .attr("stroke", "#999")
          .attr("stroke-width", 0.7)
          .attr("stroke-dasharray", "2,1");
      }

      // Outlier count below group label
      boxContainer
        .append("text")
        .attr("x", center)
        .attr("y", height - margin.bottom + 25)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#666")
        .text(`${s.outliers.length} outliers`);

      // Display visible outliers
      if (s.outliers.length > 0) {
        // Only show outliers in the visible range
        const visibleOutliers = s.outliers.filter(d => d >= minValue && d <= maxValue);
        
        // Limit to a reasonable number for display (max 10 per group)
        const displayOutliers = visibleOutliers.length <= 10 ? 
          visibleOutliers : 
          visibleOutliers.sort(() => Math.random() - 0.5).slice(0, 10);
      
        const outlierCircles = boxContainer
          .selectAll(`circle.outlier-${s.group.replace(/\s+/g, "")}`)
          .data(displayOutliers)
          .enter()
          .append("circle")
          .attr("class", `outlier-${s.group.replace(/\s+/g, "")}`)
          .attr("cx", d => center + (Math.random() - 0.5) * boxWidth * 0.8)
          .attr("cy", d => y(d))
          .attr("r", 0)
          .attr("fill", colors.outliers)
          .attr("opacity", 0.7)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.5);
          
        // Animate outliers
        animate(outlierCircles, 1500)
          .delay((d, i) => 500 + i * 50)
          .attr("r", 4);
        
        // Add hover interactions for outliers
        outlierCircles
          .on("mouseover", function(event, val) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 6)
              .attr("opacity", 1);
              
            // Fix tooltip positioning to appear near the cursor
            const tooltip = d3.select("#tooltip");
            tooltip
              .style("opacity", 1)
              .html(
                `<div style="border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 6px;">
                  <div style="font-weight: bold; font-size: 14px; color: ${s.color};">
                    ${s.group} Track
                  </div>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${colors.outliers}; margin-right: 6px;"></div>
                  <div><strong>${val.toLocaleString()}</strong> streams</div>
                </div>
                <div style="font-size: 11px; color: #666; margin-top: 6px; display: flex; align-items: center;">
                  <svg width="12" height="12" viewBox="0 0 24 24" style="margin-right: 4px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" 
                    fill="#999"/>
                  </svg>
                  ${val > s.max ? 'Above' : 'Below'} normal range
                </div>`
              );
              
            // Calculate position relative to the SVG container
            const svgRect = svg.node().getBoundingClientRect();
            const tooltipX = event.clientX - svgRect.left + 180; // Slightly to the right
            const tooltipY = event.clientY - svgRect.top - 105; // More above the point
            
            // Position tooltip at the top right of the hovered point
            tooltip
              .style("left", `${tooltipX}px`)
              .style("top", `${tooltipY}px`);
          })
          .on("mouseout", function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 4)
              .attr("opacity", 0.7);
              
            d3.select("#tooltip").style("opacity", 0);
          });
          
        // If we have outliers that aren't shown, add a note
        const hiddenOutliers = s.outliers.length - visibleOutliers.length;
        if (hiddenOutliers > 0) {
          boxContainer
            .append("text")
            .attr("x", center)
            .attr("y", height - margin.bottom + 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#999")
            .text(`(${hiddenOutliers} outliers outside visible range)`);
        }
        
        // If we limited the visible outliers, add a note
        else if (visibleOutliers.length > 10) {
          boxContainer
            .append("text")
            .attr("x", center)
            .attr("y", height - margin.bottom + 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#999")
            // .text(`(showing 10 of ${visibleOutliers.length} visible outliers)`);
        }
      }
    });

    // Replace the current legend with an enhanced version
    // Add a legend with better styling and positioning
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 25}, ${margin.top})`)
      .attr("class", "legend");
      
    // Add background for the legend with better styling
    legend.append("rect")
      .attr("x", -10)
      .attr("y", -15)
      .attr("width", 140)
      .attr("height", 120)
      .attr("fill", "white")
      .attr("opacity", 0.95)
      .attr("rx", 6)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1)
      .attr("filter", "drop-shadow(0px 1px 3px rgba(0,0,0,0.1))");
      
    // Legend title with better styling
    legend.append("text")
      .attr("x", 60)
      .attr("y", 5)
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .text("Legend");
      
    // Add divider line under title
    legend.append("line")
      .attr("x1", 5)
      .attr("x2", 115)
      .attr("y1", 15)
      .attr("y2", 15)
      .attr("stroke", "#eee")
      .attr("stroke-width", 1);
      
    // Add legend items with improved styling
    groups.forEach((group, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(10, ${i * 25 + 30})`);
        
      // Add rectangle with better styling
      legendItem.append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", group.color)
        .attr("opacity", 0.8)
        .attr("rx", 3)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);
        
      // Add text with count in same line
      legendItem.append("text")
        .attr("x", 25)
        .attr("y", 12)
        .attr("font-size", "13px")
        .attr("fill", "#333")
        .text(`${group.key} (${group.data.length})`);
    });

    // Add outlier information to legend with better styling
    const outlierLegend = legend.append("g")
      .attr("transform", `translate(10, 80)`);
      
    outlierLegend.append("circle")
      .attr("cx", 8)
      .attr("cy", 8)
      .attr("r", 5)
      .attr("fill", colors.outliers)
      .attr("opacity", 0.8)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.8);
      
    outlierLegend.append("text")
      .attr("x", 25)
      .attr("y", 12)
      .attr("font-size", "13px")
      .attr("fill", "#333")
      .text("Outliers");
      
    // Add a note about the log scale and visible range
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#777")
      .text(`Note: Y-axis uses logarithmic scale from ${formatStreams(minValue)} to ${formatStreams(maxValue)} to better visualize the distribution`);

  }, [data]);

  return (
    <div className="boxplot-wrapper">
      <svg ref={ref}></svg>
      <div
        id="tooltip"
        className="boxplot-tooltip"
        style={{
          position: "absolute",
          opacity: 0,
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          border: "1px solid #ddd",
          borderRadius: "6px",
          padding: "10px",
          pointerEvents: "none",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
          transition: "opacity 0.2s ease",
          zIndex: 100,
          maxWidth: "200px"
        }}
      ></div>
    </div>
  );
};

export default BoxPlot;
