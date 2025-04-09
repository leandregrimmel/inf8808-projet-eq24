import * as d3 from "d3";

/**
 *
 * @param {Array} data - Les données plates, avec au moins les champs:
 *   - releaseDate (objet Date)
 *   - artist (chaîne)
 *   - track (chaîne, nom de la chanson)
 *   - spotifyStreams (nombre)
 * @returns {Object} La structure hiérarchique.
 */
export function flatToHierarchy(data) {
  // Grouper par année de sortie (en s'assurant que releaseDate est un objet Date)
  const groupByYear = d3.group(data, d => d.releaseDate.getFullYear());

  // Pour chaque année, grouper ensuite par artiste
  const children = Array.from(groupByYear, ([year, songs]) => {
    const groupByArtist = d3.group(songs, d => d.artist);
    
    const artistChildren = Array.from(groupByArtist, ([artist, tracks]) => ({
      name: artist,
      children: tracks.map(track => ({
        name: track.track,
        value: track.spotifyStreams  // La valeur (nombre de streams)
      }))
    }));
    
    return {
      name: year.toString(),  // Convertir l'année en chaîne
      children: artistChildren
    };
  });

  // Retourner l'objet racine
  return {
    name: "Spotify Data",
    children: children
  };
}
