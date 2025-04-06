import { useState, useEffect } from "react";
import * as d3 from "d3";

export default function useData() {
  const [data, setData] = useState(null);
  d3.csv("/inf8808-projet-eq24/Most_Streamed_Spotify_Songs_2024.csv").then((data) => {
    console.log(data);
  });

  useEffect(() => {
    d3.csv("/inf8808-projet-eq24/Most_Streamed_Spotify_Songs_2024.csv", function (d) {
      const toNumber = (str) => (str ? +str.replace(/,/g, "") : 0);

      const releaseDate = new Date(d["Release Date"]);
      const today = new Date();
      const age = (today - releaseDate) / (1000 * 60 * 60 * 24 * 365);

      return {
        track: d["Track"],
        album: d["Album Name"],
        artist: d["Artist"],
        releaseDate: releaseDate,
        age: age,
        ISRC: d["ISRC"],
        allTimeRank: toNumber(d["All Time Rank"]),
        trackScore: +d["Track Score"],
        spotifyStreams: toNumber(d["Spotify Streams"]),
        spotifyPlaylistCount: toNumber(d["Spotify Playlist Count"]),
        spotifyPlaylistReach: toNumber(d["Spotify Playlist Reach"]),
        spotifyPopularity: toNumber(d["Spotify Popularity"]),
        youtubeViews: toNumber(d["YouTube Views"]),
        youtubeLikes: toNumber(d["YouTube Likes"]),
        tiktokPosts: toNumber(d["TikTok Posts"]),
        tiktokLikes: toNumber(d["TikTok Likes"]),
        tiktokViews: toNumber(d["TikTok Views"]),
        youtubePlaylistReach: toNumber(d["YouTube Playlist Reach"]),
        appleMusicPlaylistCount: toNumber(d["Apple Music Playlist Count"]),
        airplaySpins: toNumber(d["AirPlay Spins"]),
        siriusXMSpins: toNumber(d["SiriusXM Spins"]),
        deezerPlaylistCount: toNumber(d["Deezer Playlist Count"]),
        deezerPlaylistReach: toNumber(d["Deezer Playlist Reach"]),
        amazonPlaylistCount: toNumber(d["Amazon Playlist Count"]),
        pandoraStreams: toNumber(d["Pandora Streams"]),
        pandoraTrackStations: toNumber(d["Pandora Track Stations"]),
        soundcloudStreams: toNumber(d["Soundcloud Streams"]),
        shazamCounts: toNumber(d["Shazam Counts"]),
        tidalPopularity: d["TIDAL Popularity"]
          ? toNumber(d["TIDAL Popularity"])
          : null,
        explicitTrack: d["Explicit Track"] === "1", // Convert "0"/"1" to a boolean
      };
    }).then((data) => {
      console.log(data);
      setData(data);
    });
  }, []);

  return data;
}
