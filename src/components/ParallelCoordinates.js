import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

/**
 * @param {Array} data - Tableau d'objets, chaque objet représentant une chanson.
 * Chaque objet doit contenir les propriétés numériques suivantes :
 *   - playlistReach (nombre)
 *   - streams (nombre)
 *   - popularity (nombre)
 *   - airPlaySpins (nombre)
 *   - siriusXMSpins (nombre)
 * 
 * Optionnellement, vous pouvez inclure .track (nom de la chanson) pour l'afficher
 * dans le tooltip.
 */
const ParallelCoordinates = ({ data }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // 1) Liste des dimensions affichées, dans l'ordre X
    const dimensions = [
      "playlistReach",
      "streams",
      "popularity",
      "airPlaySpins",
      "siriusXMSpins"
    ];

    // 2) Dimensions du SVG
    const margin = { top: 40, right: 50, bottom: 30, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // 3) Création/Nettoyage du conteneur SVG
    const svgEl = d3.select(ref.current);
    svgEl.selectAll("*").remove();
    const svg = svgEl
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // 4) Échelles Y, une par dimension (linéaires)
    const yScales = {};
    dimensions.forEach(dim => {
      const domain = d3.extent(data, d => +d[dim]);
      yScales[dim] = d3.scaleLinear()
        .domain(domain)       // [min, max] pour la dimension
        .range([height, 0]);  // haut = max
    });

    // 5) Échelle X pour positionner les axes verticaux
    const xScale = d3.scalePoint()
      .domain(dimensions)
      .range([0, width])
      .padding(1);

    // 6) Générateur de chemins
    function pathGenerator(d) {
      return d3.line()(dimensions.map(dim => {
        return [ xScale(dim), yScales[dim](d[dim]) ];
      }));
    }

    // 7) Dessin des lignes (une par chanson)
    const lines = svg.selectAll("path.data-line")
      .data(data)
      .join("path")
      .attr("class", "data-line")
      .attr("d", pathGenerator)
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.4);

    // === (A) Interaction : Survol (mouseover/mouseout) ===
    lines
      .on("mouseover", function(event, d) {
        // Passe la ligne survolée en avant, augmente l'opacité et la largeur
        d3.select(this)
          .raise()
          .style("stroke", "orange")
          .style("opacity", 1)
          .style("stroke-width", 2);

        // Diminue l'opacité des autres lignes
        lines.filter(x => x !== d)
          .style("opacity", 0.1);

        // Petit tooltip natif (title) affichant quelques infos
        d3.select(this)
          .append("title")
          .text(() => {
            return d.track
              ? `Track: ${d.track}\nPopularity: ${d.popularity}\n...`
              : `Popularity: ${d.popularity}`;
          });
      })
      .on("mouseout", function(event, d) {
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
    dimensions.forEach(dim => {
      brushedRanges[dim] = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
    });

    function isVisible(song) {
      return dimensions.every(dim => {
        const [minVal, maxVal] = brushedRanges[dim];
        const val = song[dim];
        return val >= minVal && val <= maxVal;
      });
    }

    function brushHandler(event, dim) {
      const selection = event.selection;
      if (!selection) {
        // Brush effacé → on remet la plage infinie
        brushedRanges[dim] = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
      } else {
        // Inversion du Y (plus haut = plus grand)
        const [y0, y1] = selection;
        brushedRanges[dim] = [
          yScales[dim].invert(y1),
          yScales[dim].invert(y0)
        ];
      }
      // Met à jour l'affichage des lignes
      lines.style("display", d => isVisible(d) ? null : "none");
    }

    // Pour chaque dimension, on dessine l’axe + on ajoute le brush
    dimensions.forEach(dim => {
      // Axe Y
      const axisGroup = svg.append("g")
        .attr("transform", `translate(${xScale(dim)}, 0)`)
        .call(d3.axisLeft(yScales[dim]).ticks(6));  // 6 ticks, par ex.

      // Label d'axe
      axisGroup.append("text")
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

  }, [data]);

  return <svg ref={ref}></svg>;
};

export default ParallelCoordinates;
