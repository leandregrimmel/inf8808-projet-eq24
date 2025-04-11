import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ParallelCoordinates = ({ data, config }) => {
  const ref = useRef(null);
  // Use a default configuration if none is provided.
  const dimensions = React.useMemo(() => config?.dimensions || [
    "playlistReach",
    "streams",
    "popularity",
    "airPlaySpins",
    "siriusXMSpins",
  ], [config]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Dimensions of the SVG container
    const margin = { top: 40, right: 50, bottom: 30, left: 50 };
    const containerWidth = ref.current.parentNode.clientWidth;
    const containerHeight = ref.current.parentNode.clientHeight;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Clear previous drawing
    d3.select(ref.current).selectAll("*").remove();
    const svg = d3
      .select(ref.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create a y-scale for each dimension based on extents from the data.
    const yScales = {};
    dimensions.forEach((dim) => {
      const domain = d3.extent(data, (d) => +d[dim]);
      yScales[dim] = d3.scaleLinear().domain(domain).range([height, 0]).nice();
    });

    // X scale for positioning the axes
    const xScale = d3
      .scalePoint()
      .domain(dimensions)
      .range([0, width])
      .padding(1);

    // Define a line generator that maps a datum to a path using the current dimensions.
    const pathGenerator = (d) => {
      return d3.line()(
        dimensions.map((dim) => [xScale(dim), yScales[dim](d[dim])])
      );
    };

    // Draw all the lines for each data point.
    const lines = svg
      .selectAll("path.data-line")
      .data(data)
      .join("path")
      .attr("class", "data-line")
      .attr("d", pathGenerator)
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.4);

    // === (A) Interaction : Survol (mouseover/mouseout) ===
    lines
      .on("mouseover", function (event, d) {
        // Passe la ligne survolée en avant, augmente l'opacité et la largeur
        d3.select(this)
          .raise()
          .style("stroke", "orange")
          .style("opacity", 1)
          .style("stroke-width", 2);

        // Diminue l'opacité des autres lignes
        lines.filter((x) => x !== d).style("opacity", 0.1);

        // Petit tooltip natif (title) affichant quelques infos
        d3.select(this)
          .append("title")
          .text(() => {
            return d.track
              ? `Track: ${d.track}\nPopularity: ${d.popularity}\n...`
              : `Popularity: ${d.popularity}`;
          });
      })
      .on("mouseout", function (event, d) {
        lines
          .style("stroke", "#69b3a2")
          .style("opacity", 0.4)
          .style("stroke-width", 1);

        // Retirer le <title>
        d3.select(this).select("title").remove();
      });

    // === (B) Brushing : Filtrer en sélectionnant des plages sur chaque axe ===

    // On garde dans brushedRanges la plage [minVal, maxVal] autorisée pour chaque dimension
    const brushedRanges = {};
    dimensions.forEach((dim) => {
      brushedRanges[dim] = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
    });

    function isVisible(song) {
      return dimensions.every((dim) => {
        const [minVal, maxVal] = brushedRanges[dim];
        const val = song[dim];
        return val >= minVal && val <= maxVal;
      });
    }

    function brushHandler(event, dim) {
      const selection = event.selection;
      if (!selection) {
        // Brush effacé → on remet la plage infinie
        brushedRanges[dim] = [
          Number.NEGATIVE_INFINITY,
          Number.POSITIVE_INFINITY,
        ];
      } else {
        // Inversion du Y (plus haut = plus grand)
        const [y0, y1] = selection;
        brushedRanges[dim] = [yScales[dim].invert(y1), yScales[dim].invert(y0)];
      }
      // Met à jour l'affichage des lignes
      lines.style("display", (d) => (isVisible(d) ? null : "none"));
    }

    dimensions.forEach((dim) => {
      // Add Y axis
      const axisGroup = svg
        .append("g")
        .attr("transform", `translate(${xScale(dim)},0)`)
        .call(d3.axisLeft(yScales[dim]).ticks(6));

      // Label the axis
      axisGroup
        .append("text")
        .attr("y", -9)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(dim);

      // Ajout du brush sur l'axe
      axisGroup.append("g")
      .attr("class", `brush-${dim}`)
      .call(d3.brushY()
        // On limite la zone du brush à environ 20px de large [-10..10]
        .extent([[-10, 0], [10, height]])
        .on("brush end", (event) => brushHandler(event, dim))
      );
    });

    // Animate transition for updated lines (optional, simple fade-in)
    lines.transition().duration(1000).style("opacity", 0.8);
  }, [data, config, dimensions]);

  return <svg ref={ref}></svg>;
};

export default ParallelCoordinates;
