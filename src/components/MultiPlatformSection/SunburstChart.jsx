import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const SunburstChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;

    if (!Array.isArray(data.children) || data.children.length === 0) {
      console.error(
        "La structure des données est incomplète : 'children' est manquant ou vide."
      );
      return;
    }

    const width = 600;
    const height = width;
    const radius = width / 7;

    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, data.children.length + 1)
    );

    const hierarchyData = d3
      .hierarchy(data)
      .sum((d) => {
        if (d.children) return 0;
        if (typeof d.value !== "number" || isNaN(d.value)) {
          console.warn(
            "Valeur non numérique détectée pour un nœud feuille :",
            d
          );
          return 0;
        }
        return d.value;
      })
      .sort((a, b) => b.value - a.value);

    const root = d3.partition().size([2 * Math.PI, hierarchyData.height + 1])(
      hierarchyData
    );

    root.each((d) => (d.current = d));

    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d) => d.y0 * radius)
      .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3
      .select(ref.current)
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("font", "10px sans-serif");

    svg.selectAll("*").remove();

    const path = svg
      .append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", (d) => {
        let current = d;
        while (current.depth > 1) current = current.parent;
        return color(current.data.name);
      })
      .attr("fill-opacity", (d) =>
        arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("pointer-events", (d) => (arcVisible(d.current) ? "auto" : "none"))
      .attr("d", (d) => arc(d.current));

    path
      .filter((d) => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    path.append("title").text((d) => {
      const labelPath = d
        .ancestors()
        .map((p) => p.data.name)
        .reverse()
        .join("/");

      return `${labelPath}\n${d3.format(",d")(d.value)} vues`;
    });

    const label = svg
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", (d) => +labelVisible(d.current))
      .attr("transform", (d) => labelTransform(d.current))
      .text((d) => d.data.name);

    const parent = svg
      .append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

    function clicked(event, p) {
      parent.datum(p.parent || root);
      root.each((d) => {
        d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        };
      });
      const t = svg.transition().duration(event.altKey ? 7500 : 750);
      path
        .transition(t)
        .tween("data", (d) => {
          const i = d3.interpolate(d.current, d.target);
          return (t) => (d.current = i(t));
        })
        .filter(function (d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", (d) =>
          arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
        )
        .attr("pointer-events", (d) => (arcVisible(d.target) ? "auto" : "none"))
        .attrTween("d", (d) => () => arc(d.current));
      label
        .transition(t)
        .attr("fill-opacity", (d) => +labelVisible(d.target))
        .attrTween("transform", (d) => () => labelTransform(d.current));
    }

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }
    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }
    function labelTransform(d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
  }, [data]);

  return (
    <>
      <h4>
        Le diagramme en soleil (sunburst) ci-dessous révèle la répartition des
        audiences musicales selon les artistes les plus écoutés sur divers
        plateformes. La hiérarchie va des artistes (centre) aux plateformes
        (anneaux extérieurs), avec des segments proportionnels aux volumes
        d'écoute. Cliquez sur un artiste pour et découvrez quelles plateformes
        contribuent le plus à chaque artiste. En mode zoom, cliquez l'intérieur
        du cercle pour revenir à la vue d'ensemble.
      </h4>
      <div style={{ margin: "0 auto", maxWidth: "600px" }}>
        <svg ref={ref}></svg>
      </div>
    </>
  );
};

export default SunburstChart;
