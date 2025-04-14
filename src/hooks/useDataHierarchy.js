import { useState, useEffect } from "react";
import * as d3 from "d3";

export function flatToHierarchyTop10(data) {
  const groupByArtist = d3.group(data, (d) => d.artist);

  const arrayByArtist = Array.from(groupByArtist, ([artist, tracks]) => {
    const totalSpotify = d3.sum(tracks, (d) => d.spotifyStreams);
    const totalYouTube = d3.sum(tracks, (d) => d.youtubeViews);
    const totalTikTok = d3.sum(tracks, (d) => d.tiktokViews);
    const totalAll = totalSpotify + totalYouTube + totalTikTok;

    return {
      artist,
      totalSpotify,
      totalYouTube,
      totalTikTok,
      totalAll,
    };
  });

  arrayByArtist.sort((a, b) => d3.descending(a.totalAll, b.totalAll));
  const top10 = arrayByArtist.slice(0, 10);

  const children = top10.map((artistData) => ({
    name: artistData.artist,
    children: [
      { name: "Spotify", value: artistData.totalSpotify },
      { name: "YouTube", value: artistData.totalYouTube },
      { name: "TikTok", value: artistData.totalTikTok },
    ],
  }));

  return {
    name: "Artistes",
    children,
  };
}

export function useDataHierarchy(rawData) {
  const [hierarchy, setHierarchy] = useState(null);

  useEffect(() => {
    if (!rawData) {
      setHierarchy(null);
      return;
    }

    const hierarchicalData = flatToHierarchyTop10(rawData);
    setHierarchy(hierarchicalData);
  }, [rawData]);

  return hierarchy;
}
