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

    const numerator = d3.sum(
      data,
      (d) => (d.age - meanX) * (d[selectedMetric] - meanY)
    );
    const denominator = d3.sum(data, (d) => Math.pow(d.age - meanX, 2));
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

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

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .style("font-size", "14px");

    yAxis.selectAll(".tick text").text((d) => formatNumber(d));

    const metricLabels = {
      spotifyStreams: "Streams Spotify",
      youtubeViews: "Vues YouTube",
      tiktokViews: "Vues TikTok",
      shazamCounts: "Comptes Shazam",
      pandoraStreams: "Streams Pandora",
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
    <div style={{ position: "relative", paddingBottom: "2rem" }}>
      <h4>
        Le nuage de points interactif présenté ci-dessous montre la relation
        entre l'âge des chansons (années écoulées depuis leur sortie) et divers
        indicateurs de succès, avec une ligne de régression pour visualiser la
        tendance globale. Un coéfficient de corrélation (R) proche de 1 indique
        une forte corrélation entre l'âge et la métrique choisie, tandis qu'un R
        proche de 0 suggère une absence de corrélation.
      </h4>
      <div style={{ margin: "1rem" }}>
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
          <option value="pandoraStreams">Streams Pandora</option>
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
      <div style={{ fontSize: "1rem", marginTop: "1rem" }}>
        En observant la répartition des points, on peut repérer plusieurs faits
        intéressants. Premièrement, il y a une forte densité pour les chansons
        récentes. Les chansons parues le plus récemment (0 à 5 ans d'âge) sont
        généralement plus nombreuses dans les données, ce qui se traduit par un
        nuage plus dense sur la partie gauche du graphique. Cela pourrait être
        dû à l'effet des playlists, des algorithmes de recommandation et d'une
        plus grande consommation de musique récente par les utilisateurs.
        Deuxièmement, il y a présence d'outliers. Effectivement, certains
        titres, même très anciens, peuvent totaliser un nombre de streams
        exceptionnel. Cela indique l'existence de « classiques » intemporels qui
        conservent un haut niveau d'écoute, malgré leur ancienneté.
        <br /> <br />
        En analysant la dispersion des points, on remarque que les chansons les
        plus anciennes tendent à avoir moins de streams que les morceaux
        récents, bien qu'il y ait des exceptions notables. De plus, il y a
        beaucoup moins d'anciennes chansons (parus il y a plus de 10 ans) ayant
        plus de 1 milliards de streams comparativement au nombre de chansons
        plus récentes (parues il y a moins de 10 ans) pour ce même barème.
        Également, dans le cas de la métrique de popularité “Streams Spotify”,
        on peut observer une corrélation moyenne (R = 0.558) entre les
        paramètres indiquant que le nombre de Streams Spotify et l'âge d'une
        chanson ne sont pas intimement corrélés.
        <br /> <br />
        En bref, cette visualisation met en évidence l'avantage temporel des
        chansons récentes sur Spotify, dans cet exemple, mais aussi l'existence
        de quelques titres plus anciens qui parviennent à se maintenir au sommet
        des écoutes. Elle illustre la forte rotation du marché de la musique et
        la difficulté pour un titre de conserver une audience massive au fil des
        décennies, sauf pour certains morceaux emblématiques.
      </div>
    </div>
  );
};

export default AgeVsPopularityMetric;
