// MultiPlatform.js
import React from "react";
import CorrelationMatrix from "./CorrelationMatrix";
import SunburstChart from "./SunburstChart";

const MultiPlatform = ({ data, hierarchicalData }) => {
  return (
    <div className="p-6 space-y-8">
      {/* Section A : Matrice de Corrélation */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Matrice de Corrélation</h2>
        <p className="mb-4 text-muted-foreground">
          Explorez les relations entre différents indicateurs issus de plateformes variées telles que Spotify, YouTube, TikTok et Shazam. Chaque cellule de cette matrice représente le coefficient de corrélation entre deux indicateurs, vous permettant ainsi de visualiser rapidement si des pics de popularité sur une plateforme se reflètent sur une autre.
        </p>
        <div className="border p-4">
          <CorrelationMatrix data={data} />
        </div>
      </section>

      {/* Section B : Sunburst Chart */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          Sunburst Chart : Répartition des Consommations par Artiste et Plateforme
        </h2>
        <p className="mb-4 text-muted-foreground">
          Ce graphique vous permet de visualiser comment les différents canaux (Spotify, YouTube, TikTok, etc.) se répartissent pour les artistes les plus populaires. Le niveau 1 présente le top des artistes (par exemple, top 10 basé sur la somme des streams sur plusieurs plateformes) et les niveaux suivants détaillent la contribution de chaque plateforme. Cliquez sur un segment pour zoomer sur un artiste et explorer les données détaillées.
        </p>
        <div className="border p-4">
          { !hierarchicalData ? (
            <div>Construction de la hiérarchie...</div>
          ) : (
            <SunburstChart data={hierarchicalData} />
          ) }
        </div>
      </section>
    </div>
  );
};

export default MultiPlatform;
