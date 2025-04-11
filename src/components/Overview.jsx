import React from "react";
import useData from "../hooks/useData";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import formatNumber from "../utils";

const Overview = () => {
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
        <p className="text-lg text-muted-foreground">
          Bienvenue sur notre projet de visualisation de données pour le cours
          INF8808. Dans un paysage musical en pleine transformation grâce aux
          plateformes de streaming, nous analysons comment la popularité des
          chansons évolue après leur sortie. Nous nous intéressons
          particulièrement aux impacts des réseaux sociaux, à l'évolution des
          tendances temporelles et aux interactions multi-plateformes.
        </p>
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

      {/* Section d'Explication de la Méthodologie */}
      {/* <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Méthodologie & Visualisations
      </h2>
        <p className="mb-4">
          Notre analyse se base sur une série de visualisations interactives
          développées avec D3. Chaque diagramme répond à l'une des questions de
          recherche définies dans le projet :
        </p>
        <ul className="list-disc ml-6">
          <li>
            <strong>Aspect Temporel :</strong> Un scatter plot enrichi (avec une
            ligne de tendance) analyse l'évolution de la popularité en fonction
            de l'âge des chansons. Un graphique des tendances saisonnières
            permet de repérer des cycles récurrents.
          </li>
          <li>
            <strong>Multi-plateformes :</strong> Une matrice de corrélation
            interactive et un sunburst chart détaillent les relations entre les
            indicateurs (Spotify, YouTube, TikTok, Shazam…) et la répartition de
            la consommation par artiste.
          </li>
          <li>
            <strong>Contenu Explicite :</strong> Un box plot compare la
            distribution des streams entre pistes explicites et non-explicites,
            et permet d'identifier des variations significatives.
          </li>
          <li>
            <strong>Diffusion & Rayonnement :</strong> Des scatter plots
            comparent la portée des playlists et le nombre de diffusions radio
            aux mesures de popularité en ligne.
          </li>
          <li>
            <strong>Engagement des Utilisateurs :</strong> Des analyses du ratio
            vues/likes et l'impact des posts sur TikTok ainsi que l'engagement
            sur Shazam révèlent comment les interactions influencent la
            popularité.
          </li>
        </ul>
      </section> */}

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
    </div>
  );
};

export default Overview;
