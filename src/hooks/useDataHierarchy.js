// src/hooks/useDataHierarchy.js
import { useState, useEffect } from "react";
import * as d3 from "d3";

/**
 * Transforme un tableau de données en structure hiérarchique pour le sunburst,
 * mais en ne conservant que le top 10 des artistes selon la somme de Spotify + YouTube + TikTok.
 *
 * @param {Array} data - Tableau des données brutes (chacune contient artist, spotifyStreams, youtubeViews, tiktokViews).
 * @returns {Object} - Objet racine { name: "Artistes", children: [...] } pour le sunburst.
 */
export function flatToHierarchyTop10(data) {
  // 1) Grouper les chansons par artiste
  const groupByArtist = d3.group(data, d => d.artist);

  // 2) Créer un tableau pour stocker la somme de chaque plateforme par artiste
  const arrayByArtist = Array.from(groupByArtist, ([artist, tracks]) => {
    const totalSpotify = d3.sum(tracks, d => d.spotifyStreams);
    const totalYouTube = d3.sum(tracks, d => d.youtubeViews);
    const totalTikTok  = d3.sum(tracks, d => d.tiktokViews);
    const totalAll     = totalSpotify + totalYouTube + totalTikTok; // Critère pour le top 10

    return {
      artist,
      totalSpotify,
      totalYouTube,
      totalTikTok,
      totalAll
    };
  });

  // 3) Trier ce tableau selon totalAll (descendant) et garder les 10 premiers
  arrayByArtist.sort((a, b) => d3.descending(a.totalAll, b.totalAll));
  const top10 = arrayByArtist.slice(0, 10);

  // 4) Construire la hiérarchie uniquement pour ces 10 artistes
  const children = top10.map(artistData => ({
    name: artistData.artist,
    children: [
      { name: "Spotify", value: artistData.totalSpotify },
      { name: "YouTube", value: artistData.totalYouTube },
      { name: "TikTok",  value: artistData.totalTikTok }
    ]
  }));

  return {
    name: "Artistes",
    children
  };
}


/**
 * Hook qui prend les données brutes (rawData) déjà chargées,
 * et génère la structure hiérarchique pour le sunburst.
 *
 * @param {Array|null} rawData - tableau d’objets, ou null si pas encore disponible
 * @returns {Object|null} - la hiérarchie {name, children}, ou null si rawData n’est pas prêt
 */
export function useDataHierarchy(rawData) {
  const [hierarchy, setHierarchy] = useState(null);

  useEffect(() => {
    if (!rawData) {
      // Si les données brutes ne sont pas encore chargées,
      // on met la hiérarchie à null
      setHierarchy(null);
      return;
    }

    // Transformer les données brutes en hiérarchie
    const hierarchicalData = flatToHierarchyTop10(rawData);
    console.log("Données hiérarchiques :", hierarchicalData);
    setHierarchy(hierarchicalData);
  }, [rawData]);

  return hierarchy;
}
