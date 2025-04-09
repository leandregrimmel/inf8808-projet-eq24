import * as d3 from "d3";

/**
 * Transforme des données plates en une structure hiérarchique.
 * Les données sont d'abord groupées par année de sortie,
 * puis pour chaque année, on calcule pour chaque artiste la somme des streams
 * de ses top 3 chansons (classées par nombre de streams décroissant).
 * On conserve ensuite pour chaque année les 10 artistes ayant le plus de streams.
 *
 * Les niveaux de la hiérarchie :
 *   Racine : "Spotify Data"
 *     └── Année (string)
 *            └── Top 10 Artistes (avec agrégation des streams de leurs top 3 chansons)
 *                  └── Top 3 chansons (chaque feuille a un "value" correspondant aux streams)
 *
 * @param {Array} data - Les données plates, avec au moins les champs :
 *   - releaseDate (objet Date)
 *   - artist (chaîne)
 *   - track (chaîne, nom de la chanson)
 *   - spotifyStreams (nombre)
 * @returns {Object} La structure hiérarchique.
 */
export function flatToHierarchy(data) {
  // Groupement par année (en s'assurant que releaseDate est un objet Date)
  const dataByYear = d3.group(data, d => d.releaseDate.getFullYear());

  // Pour chaque année...
  const children = Array.from(dataByYear, ([year, songs]) => {
    // Groupe par artiste pour cette année
    const groupByArtist = d3.group(songs, d => d.artist);
    
    // Créer un tableau pour chaque artiste avec ses top 3 chansons
    const artistsArray = Array.from(groupByArtist, ([artist, tracks]) => {
      // Trier les chansons par spotifyStreams décroissant
      const sortedTracks = tracks.sort((a, b) => b.spotifyStreams - a.spotifyStreams);
      // Conserver les 3 premiers
      const top3 = sortedTracks.slice(0, 3);
      // Calculer la somme des streams sur ces 3 chansons
      const totalStreams = d3.sum(top3, d => d.spotifyStreams);
      return {
        name: artist,
        value: totalStreams,
        children: top3.map(track => ({
          name: track.track,
          value: track.spotifyStreams
        }))
      };
    });

    // Trier les artistes par ordre décroissant de streams agrégés
    artistsArray.sort((a, b) => b.value - a.value);
    // Conserver les 10 premiers artistes de l'année
    const top5 = artistsArray.slice(0, 5);

    return {
      name: year.toString(),
      children: top5
    };
  });

  // Retourner l'objet racine
  return {
    name: "Spotify Data",
    children: children
  };
}
