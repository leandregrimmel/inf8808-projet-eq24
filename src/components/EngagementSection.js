// EngagementSection.js
import React, { useState } from "react";
import * as d3 from "d3";

// ---------------------------------------------------------------------------
// (A) Ratio Vues/Likes sur YouTube et TikTok
// ---------------------------------------------------------------------------
const RatioViewsLikes = ({ data }) => {
  const [platform, setPlatform] = useState("YouTube");
  const [selectedArtist, setSelectedArtist] = useState("");

  // Extraction de la liste d'artistes uniques pour le dropdown
  const artistOptions = Array.from(new Set(data.map((d) => d.artist))).sort();

  // Fonction de calcul du ratio pour chaque piste
  const computeRatio = (d, platform) => {
    if (platform === "YouTube") {
      return d.youtubeLikes ? d.youtubeViews / d.youtubeLikes : 0;
    } else if (platform === "TikTok") {
      return d.tiktokLikes ? d.tiktokViews / d.tiktokLikes : 0;
    }
    return 0;
  };

  // Si aucun artiste n'est sélectionné, on regroupe les données par artiste 
  // et on calcule la moyenne du ratio pour chaque artiste
  let content;
  if (selectedArtist) {
    const filteredData = data.filter((d) => d.artist === selectedArtist);
    content = <ScatterPlotRatio data={filteredData} platform={platform} />;
  } else {
    const grouped = d3.rollup(
      data,
      (v) => d3.mean(v, (d) => computeRatio(d, platform)),
      (d) => d.artist
    );
    const groupedData = Array.from(grouped, ([artist, avgRatio]) => ({
      artist,
      avgRatio,
    }));
    content = <BarChartRatio data={groupedData} />;
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">
        Ratio Vues/Likes ({platform})
      </h2>
      <div className="mb-4 space-x-4">
        <label>
          Plateforme:
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="ml-2 border rounded p-1"
          >
            <option value="YouTube">YouTube</option>
            <option value="TikTok">TikTok</option>
          </select>
        </label>
        <label>
          Artiste:
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="ml-2 border rounded p-1"
          >
            <option value="">Tous</option>
            {artistOptions.map((artist) => (
              <option key={artist} value={artist}>
                {artist}
              </option>
            ))}
          </select>
        </label>
      </div>
      {content}
    </div>
  );
};

const ScatterPlotRatio = ({ data, platform }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    if (!data) return;
    const width = 700,
      height = 500,
      margin = { top: 30, right: 30, bottom: 50, left: 60 };
    d3.select(ref.current).selectAll("*").remove();
    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    const xExtent = d3.extent(data, (d) => d.age);
    const yExtent = d3.extent(data, (d) =>
      platform === "YouTube"
        ? d.youtubeLikes ? d.youtubeViews / d.youtubeLikes : 0
        : d.tiktokLikes ? d.tiktokViews / d.tiktokLikes : 0
    );
    const x = d3.scaleLinear().domain(xExtent).nice().range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain(yExtent).nice().range([height - margin.bottom, margin.top]);

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    xAxis
      .append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .text("Âge (années)");

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));
    yAxis
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height - margin.top - margin.bottom) / 2)
      .attr("y", -40)
      .attr("fill", "black")
      .text("Ratio Vues/Likes");

    const scatter = svg.append("g");
    scatter
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.age))
      .attr("cy", (d) => {
        let ratio =
          platform === "YouTube"
            ? d.youtubeLikes ? d.youtubeViews / d.youtubeLikes : 0
            : d.tiktokLikes ? d.tiktokViews / d.tiktokLikes : 0;
        return y(ratio);
      })
      .attr("r", 4)
      .attr("fill", "teal")
      .on("mouseover", (event, d) => {
        let ratio =
          platform === "YouTube"
            ? d.youtubeLikes ? d.youtubeViews / d.youtubeLikes : 0
            : d.tiktokLikes ? d.tiktokViews / d.tiktokLikes : 0;
        d3.select("#tooltip-ratio")
          .style("opacity", 1)
          .html(
            `<strong>${d.track}</strong><br/>Âge: ${d.age.toFixed(
              1
            )} ans<br/>Ratio: ${ratio.toFixed(2)}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip-ratio").style("opacity", 0);
      });

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 20])
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);
        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));
        scatter
          .selectAll("circle")
          .attr("cx", (d) => newX(d.age))
          .attr("cy", (d) => {
            let ratio =
              platform === "YouTube"
                ? d.youtubeLikes ? d.youtubeViews / d.youtubeLikes : 0
                : d.tiktokLikes ? d.tiktokViews / d.tiktokLikes : 0;
            return newY(ratio);
          });
      });
    svg.call(zoom);
  }, [data, platform]);
  return (
    <div style={{ position: "relative" }}>
      <svg ref={ref}></svg>
      <div
        id="tooltip-ratio"
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

const BarChartRatio = ({ data }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    if (!data) return;
    const width = 700,
      height = 500,
      margin = { top: 30, right: 30, bottom: 100, left: 60 };
    d3.select(ref.current).selectAll("*").remove();
    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.artist))
      .range([margin.left, width - margin.right])
      .padding(0.2);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.avgRatio)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-40)");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.artist))
      .attr("y", (d) => y(d.avgRatio))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - margin.bottom - y(d.avgRatio))
      .attr("fill", "teal")
      .on("mouseover", (event, d) => {
        d3.select("#tooltip-ratio-bar")
          .style("opacity", 1)
          .html(
            `<strong>${d.artist}</strong><br/>Avg Ratio: ${d.avgRatio.toFixed(2)}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip-ratio-bar").style("opacity", 0);
      });
  }, [data]);
  return (
    <div style={{ position: "relative" }}>
      <svg ref={ref}></svg>
      <div
        id="tooltip-ratio-bar"
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

// ---------------------------------------------------------------------------
// (B) Impact des Posts TikTok sur les Vues et Spotify Streams
// ---------------------------------------------------------------------------
const TikTokImpact = ({ data }) => {
  const [yMetric, setYMetric] = useState("tiktokViews");
  const ref = React.useRef();
  React.useEffect(() => {
    if (!data) return;
    const width = 700,
      height = 500,
      margin = { top: 30, right: 30, bottom: 50, left: 60 };
    d3.select(ref.current).selectAll("*").remove();
    const svg = d3.select(ref.current).attr("width", width).attr("height", height);

    const xExtent = d3.extent(data, (d) => d.tiktokPosts);
    const yExtent = d3.extent(data, (d) => d[yMetric]);
    const x = d3.scaleLinear().domain(xExtent).nice().range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain(yExtent).nice().range([height - margin.bottom, margin.top]);

    const xAxis = svg.append("g")
                     .attr("transform", `translate(0, ${height - margin.bottom})`)
                     .call(d3.axisBottom(x));
    xAxis.append("text")
         .attr("x", (width - margin.left - margin.right) / 2)
         .attr("y", 40)
         .attr("fill", "black")
         .text("TikTok Posts");

    const yAxis = svg.append("g")
                     .attr("transform", `translate(${margin.left}, 0)`)
                     .call(d3.axisLeft(y));
    yAxis.append("text")
         .attr("transform", "rotate(-90)")
         .attr("x", -(height - margin.top - margin.bottom) / 2)
         .attr("y", -40)
         .attr("fill", "black")
         .text(yMetric === "tiktokViews" ? "TikTok Views" : "Spotify Streams");

    const scatter = svg.append("g");
    scatter.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.tiktokPosts))
      .attr("cy", (d) => y(d[yMetric]))
      .attr("r", 4)
      .attr("fill", "purple")
      .on("mouseover", (event, d) => {
        d3.select("#tooltip-tiktok")
          .style("opacity", 1)
          .html(
            `<strong>${d.track}</strong><br/>TikTok Posts: ${d.tiktokPosts}<br/>${yMetric === "tiktokViews" ? "TikTok Views" : "Spotify Streams"}: ${d[yMetric].toLocaleString()}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip-tiktok").style("opacity", 0);
      });
    
    const zoom = d3.zoom()
                   .scaleExtent([0.5, 20])
                   .translateExtent([
                     [margin.left, margin.top],
                     [width - margin.right, height - margin.bottom],
                   ])
                   .extent([
                     [margin.left, margin.top],
                     [width - margin.right, height - margin.bottom],
                   ])
                   .on("zoom", (event) => {
                     const newX = event.transform.rescaleX(x);
                     const newY = event.transform.rescaleY(y);
                     xAxis.call(d3.axisBottom(newX));
                     yAxis.call(d3.axisLeft(newY));
                     scatter.selectAll("circle")
                       .attr("cx", (d) => newX(d.tiktokPosts))
                       .attr("cy", (d) => newY(d[yMetric]));
                   });
    svg.call(zoom);
  }, [data, yMetric]);
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Impact des Posts TikTok sur Vues / Spotify Streams</h2>
      <div className="mb-4">
        <label htmlFor="yMetric-select" className="mr-2 font-semibold">
          Sélectionnez l'indicateur Y:
        </label>
        <select
          id="yMetric-select"
          value={yMetric}
          onChange={(e) => setYMetric(e.target.value)}
          className="border rounded p-1"
        >
          <option value="tiktokViews">TikTok Views</option>
          <option value="spotifyStreams">Spotify Streams</option>
        </select>
      </div>
      <div>
        <svg ref={ref}></svg>
        <div id="tooltip-tiktok" style={{
          position: "absolute",
          opacity: 0,
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "5px",
          pointerEvents: "none"
        }}></div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// (C) Corrélation entre Engagement Shazam et Découvrabilité
// ---------------------------------------------------------------------------
const ShazamEngagement = ({ data }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    if (!data) return;

    // Choisir des indicateurs à comparer avec shazamCounts
    const indicators = ["spotifyStreams", "youtubeViews", "tiktokViews", "spotifyPlaylistReach"];
    // Calculer la corrélation entre shazamCounts et chaque indicateur
    const correlation = (xArray, yArray) => {
      const n = xArray.length;
      const meanX = d3.mean(xArray);
      const meanY = d3.mean(yArray);
      const cov = d3.sum(xArray.map((xi, i) => (xi - meanX) * (yArray[i] - meanY))) / n;
      const stdX = Math.sqrt(d3.sum(xArray.map(xi => Math.pow(xi - meanX, 2))) / n);
      const stdY = Math.sqrt(d3.sum(yArray.map(yi => Math.pow(yi - meanY, 2))) / n);
      return cov / (stdX * stdY);
    };
    const correlations = indicators.map(indicator => {
      const xArray = data.map(d => d.shazamCounts);
      const yArray = data.map(d => d[indicator]);
      return { indicator, corr: correlation(xArray, yArray) };
    });

    const width = 700, height = 400, margin = { top: 30, right: 30, bottom: 50, left: 60 };
    d3.select(ref.current).selectAll("*").remove();
    const svg = d3.select(ref.current).attr("width", width).attr("height", height);

    const x = d3.scaleBand()
                .domain(correlations.map(d => d.indicator))
                .range([margin.left, width - margin.right])
                .padding(0.2);
    const y = d3.scaleLinear()
                .domain([d3.min(correlations, d => d.corr), d3.max(correlations, d => d.corr)])
                .nice()
                .range([height - margin.bottom, margin.top]);

    svg.append("g")
       .attr("transform", `translate(0, ${height - margin.bottom})`)
       .call(d3.axisBottom(x));

    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(y));

    svg.selectAll("rect")
       .data(correlations)
       .enter()
       .append("rect")
       .attr("x", d => x(d.indicator))
       .attr("y", d => y(d.corr))
       .attr("width", x.bandwidth())
       .attr("height", d => height - margin.bottom - y(d.corr))
       .attr("fill", "slateblue")
       .on("mouseover", (event, d) => {
         d3.select("#tooltip-shazam")
           .style("opacity", 1)
           .html(
             `<strong>${d.indicator}</strong><br/>Corrélation: ${d.corr.toFixed(2)}`
           )
           .style("left", event.pageX + 10 + "px")
           .style("top", event.pageY - 28 + "px");
       })
       .on("mouseout", () => {
         d3.select("#tooltip-shazam").style("opacity", 0);
       });
  }, [data]);
  
  return (
    <div className="p-6" style={{ position: "relative" }}>
      <h2 className="text-2xl font-bold mb-4">
        Corrélation entre Engagement Shazam et Découvrabilité
      </h2>
      <svg ref={ref}></svg>
      <div id="tooltip-shazam" style={{
        position: "absolute",
        opacity: 0,
        backgroundColor: "white",
        border: "1px solid #ccc",
        padding: "5px",
        pointerEvents: "none"
      }}></div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Composant principal pour la section Engagement des Utilisateurs
// ---------------------------------------------------------------------------
const EngagementSection = ({ data }) => {
  return (
    <div className="p-6 space-y-8">
      {/* Partie A : Ratio Vues/Likes */}
      <section>
        <RatioViewsLikes data={data} />
      </section>
      {/* Partie B : Impact des Posts TikTok */}
      <section>
        <TikTokImpact data={data} />
      </section>
      {/* Partie C : Corrélation Shazam */}
      <section>
        <ShazamEngagement data={data} />
      </section>
    </div>
  );
};

export default EngagementSection;
