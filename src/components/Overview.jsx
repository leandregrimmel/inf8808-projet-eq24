import React from "react";
import useData from "../hooks/useData";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import formatNumber from "../utils";

const Overview = ({ temporalSectionRef }) => {
  const data = useData();

  if (!data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">
<<<<<<< Updated upstream
            Chargement des données de visualisation…
=======
            Chargement des données de visualisation...
>>>>>>> Stashed changes
          </p>
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
<<<<<<< Updated upstream
      <header className="mb-8">
        <h2>Spotify Top Streamed Songs 2024</h2>
        <h4>
          Bienvenue sur notre projet de visualisation de données pour le cours
          INF8808. Dans un paysage musical en pleine transformation grâce aux
          plateformes de streaming, nous analysons comment la popularité des
          chansons évolue après leur sortie. Nous nous intéressons
          particulièrement aux impacts des réseaux sociaux, à l'évolution des
          tendances temporelles et aux interactions multi-plateformes.
        </h4>
      </header>
=======
      <h4>
        Bienvenue sur notre projet de visualisation de données pour le cours
        INF8808. Dans un paysage musical en pleine transformation grâce aux
        plateformes de streaming, nous analyserons comment la popularité des
        chansons évolue après leur sortie. Nous nous intéressons
        particulièrement aux impacts des réseaux sociaux, à l'évolution des
        tendances temporelles et aux interactions multi-plateformes.
      </h4>
>>>>>>> Stashed changes

      {/* Section des Indicateurs Clés */}
      <section className="mb-12">
        <h2 className="mb-4">Statistiques Clés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pistes totales</CardTitle>
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
              <CardTitle>Streams Spotify moyens</CardTitle>
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
              <CardTitle>Pistes explicites</CardTitle>
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
              <CardTitle>Sortie la plus récente</CardTitle>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="mb-8">
          <h2 className="mb-4">Filtrer par artistes</h2>
          <h4 className="mt-0 text-start">
            Utilisez le filtre global situé dans la barre latérale pour comparer
            vos artistes préférés. Ce filtre vous permet de sélectionner un ou
            plusieurs artistes et de visualiser uniquement les données qui leur
            sont associées. Cela vous aide à explorer leurs performances en
            détail et à les comparer avec d'autres artistes présents dans les
            données.
          </h4>
        </section>

        <section>
          <h2 className="mb-4">Navigation</h2>
          <h4 className="mt-0 mb-4 text-start">
            La barre latérale vous permet de naviguer facilement entre les
            différentes sections de l'application. Sélectionnez l'onglet désiré
            pour explorer les visualisations détaillées qui répondent chacune à
            une partie spécifique de notre analyse.
          </h4>
          <div className="mt-0 flex justify-center">
            <button
              onClick={() =>
                temporalSectionRef.current.scrollIntoView({ behavior: "smooth" })
              }
              className="mb-4 px-4 py-2 bg-primary rounded-md border border-black hover:bg-primary-dark hover:scale-105 transition-transform"
            >
              Commencer à explorer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Overview;
