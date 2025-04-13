import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const RatioChart = ({ data }) => {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);

    useEffect(() => {
        if (!data || !svgRef.current) return;

        // Préparation des données
        const artists = d3
            .rollups(
                data,
                (v) => ({
                    youtubeRatio: d3.mean(v, (d) => d.youtubeViews / d.youtubeLikes),
                    tiktokRatio: d3.mean(v, (d) => d.tiktokViews / d.tiktokLikes),
                    totalViews: d3.sum(v, (d) => d.youtubeViews + d.tiktokViews),
                }),
                (d) => d.artist
            )
            .sort((a, b) => b[1].totalViews - a[1].totalViews)
            .slice(0, 15);

        // Configuration du graphique
        const margin = { top: 40, right: 80, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3
            .select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Échelles
        const x = d3
            .scaleBand()
            .domain(artists.map((d) => d[0]))
            .range([0, width])
            .padding(0.2);

        const yRatio = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(artists, (d) => Math.max(d[1].youtubeRatio, d[1].tiktokRatio)) *
                    1.1,
            ])
            .range([height, 0]);

        const yViews = d3
            .scaleLog()
            .domain([
                d3.min(artists, (d) => d[1].totalViews) * 0.9,
                d3.max(artists, (d) => d[1].totalViews) * 1.1,
            ])
            .range([height, 0]);

        // Barres YouTube
        svg
            .selectAll(".youtube-bar")
            .data(artists)
            .enter()
            .append("rect")
            .attr("class", "youtube-bar")
            .attr("x", (d) => x(d[0]))
            .attr("y", (d) => yRatio(d[1].youtubeRatio))
            .attr("width", x.bandwidth() / 2)
            .attr("height", (d) => height - yRatio(d[1].youtubeRatio))
            .attr("fill", "#4e79a7")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("opacity", 0.8);
                showTooltip(event, "YouTube", d[1].youtubeRatio);
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 1);
                hideTooltip();
            });

        // Barres TikTok
        svg
            .selectAll(".tiktok-bar")
            .data(artists)
            .enter()
            .append("rect")
            .attr("class", "tiktok-bar")
            .attr("x", (d) => x(d[0]) + x.bandwidth() / 2)
            .attr("y", (d) => yRatio(d[1].tiktokRatio))
            .attr("width", x.bandwidth() / 2)
            .attr("height", (d) => height - yRatio(d[1].tiktokRatio))
            .attr("fill", "#f28e2b")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("opacity", 0.8);
                showTooltip(event, "TikTok", d[1].tiktokRatio);
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 1);
                hideTooltip();
            });

        // Ligne des vues totales
        const line = d3
            .line()
            .x((d) => x(d[0]) + x.bandwidth() / 2)
            .y((d) => yViews(d[1].totalViews));

        svg
            .append("path")
            .datum(artists)
            .attr("class", "views-line")
            .attr("d", line)
            .attr("stroke", "#e15759")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        // Axes
        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg
            .append("g")
            .call(d3.axisLeft(yRatio))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .text("Ratio Vues/Likes");

        svg
            .append("g")
            .attr("transform", `translate(${width},0)`)
            .call(d3.axisRight(yViews))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(90)")
            .attr("y", 50)
            .attr("x", height / 2)
            .attr("text-anchor", "middle")
            .text("Vues Totales (log)");

        // Légende
        const legend = svg
            .append("g")
            .attr("transform", `translate(${width - 150},20)`);

        legend
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", "#4e79a7");

        legend
            .append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text("YouTube")
            .style("font-size", "12px");

        legend
            .append("rect")
            .attr("x", 0)
            .attr("y", 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", "#f28e2b");

        legend
            .append("text")
            .attr("x", 20)
            .attr("y", 30)
            .text("TikTok")
            .style("font-size", "12px");

        legend
            .append("path")
            .attr("d", "M0,40 L12,40")
            .attr("stroke", "#e15759")
            .attr("stroke-width", 2);

        legend
            .append("text")
            .attr("x", 20)
            .attr("y", 45)
            .text("Vues Totales")
            .style("font-size", "12px");

        // Fonctions tooltip
        function showTooltip(event, platform, value) {
            d3.select(tooltipRef.current)
                .style("opacity", 1)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`)
                .html(`<strong>${platform}</strong><br/>Ratio: ${value.toFixed(2)}`);
        }

        function hideTooltip() {
            d3.select(tooltipRef.current).style("opacity", 0);
        }

        return () => {
            d3.select(svgRef.current).selectAll("*").remove();
        };
    }, [data]);

    return (
        <div className="relative">
            <svg ref={svgRef} className="w-full h-[400px]"></svg>
            <div
                ref={tooltipRef}
                className="absolute bg-white p-2 border rounded shadow-lg pointer-events-none opacity-0 text-sm"
            ></div>
        </div>
    );
};

export default RatioChart;
