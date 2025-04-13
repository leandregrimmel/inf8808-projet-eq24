import React from "react";
import useData from "../hooks/useData";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "./common/card";
import formatNumber from "../utils";

const Overview = ({ temporalSectionRef }) => {
  const data = useData();

  if (!data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading visualization data...</p>
        </div>
      </div>
    );
  }

  const totalTracks = data.length;
  const avgStreams = Math.round(d3.mean(data, (d) => d.spotifyStreams));
  const explicitTracks = data.filter((d) => d.explicitTrack).length;
  const explicitPercentage = Math.round((explicitTracks / totalTracks) * 100);
  const mostRecentDate = new Date(Math.max(...data.map((d) => d.releaseDate)));

  return (
    <div>
      {/* Section Introductive et Contexte */}
      <header className="mb-8">
        <h2>Spotify Top Streamed Songs 2024</h2>
        <h4>
          Bienvenue sur notre projet de visualisation de données pour le cours
          INF8808. Dans un paysage musical en pleine transformation grâce aux
          plateformes de streaming, nous analyserons comment la popularité des
          chansons évolue après leur sortie. Nous nous intéressons
          particulièrement aux impacts des réseaux sociaux, à l'évolution des
          tendances temporelles et aux interactions multi-plateformes.
        </h4>
      </header>

      {/* Section des Indicateurs Clés */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Statistiques Clés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalTracks.toLocaleString()}
              </div>
              <p className="text-xs">Nombre total de pistes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Avg. Spotify Streams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(avgStreams)}
              </div>
              <p className="text-xs">Streams moyens par piste</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Explicit Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {explicitTracks.toLocaleString()}{" "}
                <span className="ml-2 text-sm">({explicitPercentage}%)</span>
              </div>
              <p className="text-xs">Pistes marquées comme explicites</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Most Recent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mostRecentDate.toLocaleDateString()}
              </div>
              <p className="text-xs">Date de sortie la plus récente</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section Navigation */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Navigation</h2>
        <p>
          La barre latérale vous permet de naviguer facilement entre les
          différentes sections de l'application. Sélectionnez l'onglet désiré
          pour explorer les visualisations détaillées qui répondent chacune à
          une partie spécifique de notre analyse.
        </p>
      </section>
      <div className="mt-8 flex justify-center">
        <button
          onClick={() =>
            temporalSectionRef.current.scrollIntoView({ behavior: "smooth" })
          }
          className="mb-4 px-4 py-2 bg-primary rounded-md border border-black hover:bg-primary-dark hover:scale-105 transition-transform"
        >
          Commencer à explorer
        </button>
      </div>
    </div>
  );
};

export default Overview;
