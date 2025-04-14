import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import formatNumber from "./../../utils";

const RatioChart = ({ data }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const safeRatio = (views, likes) => {
      return likes > 0 ? views / likes : 0;
    };

    const artists = d3
      .rollups(
        data,
        (v) => {
          const youtubeViews = d3.sum(v, (d) => d.youtubeViews || 0);
          const youtubeLikes = d3.sum(v, (d) => d.youtubeLikes || 0);
          const tiktokViews = d3.sum(v, (d) => d.tiktokViews || 0);
          const tiktokLikes = d3.sum(v, (d) => d.tiktokLikes || 0);

          return {
            youtubeRatio: safeRatio(youtubeViews, youtubeLikes),
            tiktokRatio: safeRatio(tiktokViews, tiktokLikes),
            youtubeViews,
            tiktokViews,
            youtubeLikes,
            tiktokLikes,
          };
        },
        (d) => d.artist
      )
      .filter((d) => {
        return !isNaN(d[1].youtubeRatio) && !isNaN(d[1].tiktokRatio);
      })
      .sort(
        (a, b) =>
          b[1].youtubeViews +
          b[1].tiktokViews -
          (a[1].youtubeViews + a[1].tiktokViews)
      )
      .slice(0, 10);

    if (artists.length === 0) return;

    const margin = { top: 60, right: 80, bottom: 150, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(artists.map((d) => d[0]))
      .range([0, width])
      .padding(0.2);

    const maxRatio =
      d3.max(artists, (d) => Math.max(d[1].youtubeRatio, d[1].tiktokRatio)) ||
      10;

    const yRatio = d3
      .scaleLinear()
      .domain([0, maxRatio * 1.2])
      .range([height, 0])
      .nice();

    const platformColors = {
      youtube: "#CC2B2B",
      tiktok: "#333333",
    };

    const barWidth = x.bandwidth() / 2;

    const platforms = [
      {
        id: "youtube",
        name: "YouTube",
        views: "youtubeViews",
        likes: "youtubeLikes",
      },
      {
        id: "tiktok",
        name: "TikTok",
        views: "tiktokViews",
        likes: "tiktokLikes",
      },
    ];

    platforms.forEach((platform, i) => {
      svg
        .selectAll(`.${platform.id}-bar`)
        .data(artists)
        .enter()
        .append("rect")
        .attr("class", `${platform.id}-bar`)
        .attr("x", (d) => x(d[0]) + i * barWidth)
        .attr("y", (d) => yRatio(d[1][`${platform.id}Ratio`] || 0))
        .attr("width", barWidth - 2)
        .attr(
          "height",
          (d) => height - yRatio(d[1][`${platform.id}Ratio`] || 0)
        )
        .attr("fill", platformColors[platform.id])
        .on("mouseover", function (event, d) {
          d3.select(this).attr("opacity", 0.8);
          showTooltip(
            event,
            platform.name,
            d[1][`${platform.id}Ratio`],
            d[1][platform.views],
            d[1][platform.likes]
          );
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 1);
          hideTooltip();
        });
    });

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "14px");

    svg
      .append("g")
      .call(d3.axisLeft(yRatio))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Ratio Vues/Likes");

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 180}, -20)`);

    platforms.forEach((platform, i) => {
      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", platformColors[platform.id]);

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 10)
        .text(platform.name)
        .style("font-size", "14px");
    });

    function showTooltip(event, platform, ratio, views, likes) {
      const [xpos, ypos] = d3.pointer(event);

      d3
        .select(tooltipRef.current)
        .style("opacity", 1)
        .style("left", `${xpos + 150}px`)
        .style("top", `${ypos + 100}px`).html(`
                    <div class="text-sm">
                        <strong>${platform}</strong><br/>
                        Ratio: ${ratio ? ratio.toFixed(2) : "N/A"}<br/>
                        ${
                          views !== undefined
                            ? `Vues: ${formatNumber(views)}<br/>`
                            : ""
                        }
                        ${
                          likes !== undefined
                            ? `Likes: ${formatNumber(likes)}`
                            : ""
                        }
                    </div>
                `);
    }

    function hideTooltip() {
      d3.select(tooltipRef.current).style("opacity", 0);
    }
  }, [data]);

  return (
    <div className="relative">
      <h4>
        On constate que les ratios TikTok présentent une régularité plus marquée
        entre les artistes (notamment parmi les 10 plus populaires), ce qui
        suggère un engagement relativement constant sur cette plateforme. En
        revanche, les ratios YouTube varient de manière significative et ne
        semblent montrer aucune corrélation évidente, ni avec les performances
        TikTok, ni avec la popularité générale des artistes. Cette disparité
        souligne l'existence de dynamiques d'engagement distinctes entre ces
        deux plateformes.
      </h4>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        className="absolute bg-white p-2 border rounded shadow-lg pointer-events-none opacity-0 text-sm"
      ></div>
    </div>
  );
};

export default RatioChart;
