import React, { useState, useRef } from "react";
import useData from "../hooks/useData";
import BoxPlot from "./BoxPlot";
import CorrelationMatrix from "./CorrelationMatrix";
import ScatterPlot from "./ScatterPlot";
import RadialLineChart from "./RadialLineChart";
import MultiPlatformOverview from "./MultiPlatformOverview";
import SunburstChart from "./SunburstChart";
import { useDataHierarchy } from "../hooks/useDataHierarchy";
import ParallelCoordinates from "./ParallelCoordinates";

import * as d3 from "d3";
import {
  BarChart3,
  LayoutDashboard,
  ScatterChart,
  Grid2X2,
  Music2,
  TrendingUp,
  Calendar,
  Headphones,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import { cn } from "./ui/utils";

const Dashboard = () => {
  const data = useData();
  const hierarchicalData = useDataHierarchy(data);
  
  // Refs for each section
  const overviewRef = useRef(null);
  const temporalRef = useRef(null);
  const multiplatformRef = useRef(null);
  const genreRef = useRef(null);
  const diffusionRef = useRef(null);
  const engagementRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

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

  // Calculate statistics
  const totalTracks = data.length;
  const avgStreams = Math.round(d3.mean(data, (d) => d.spotifyStreams));
  const explicitTracks = data.filter((d) => d.explicitTrack).length;
  const explicitPercentage = Math.round((explicitTracks / totalTracks) * 100);
  const mostRecentDate = new Date(Math.max(...data.map((d) => d.releaseDate)));

  // Helper to format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  const MainContent = () => {
    const { isOpen } = useSidebar();

    return (
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 relative",
          isOpen ? "ml-64" : "ml-20"
        )}
      >
        <main className="flex-1 overflow-x-hidden">
          {/* Overview Section */}
          <section 
            ref={overviewRef} 
            className="min-h-screen w-full p-6 snap-start"
          >
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Spotify Top Streamed Songs 2024
                </h2>
                <p className="text-muted-foreground">
                  Explore the dataset through different visualizations
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Tracks
                    </CardTitle>
                    <Music2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalTracks.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tracks in the dataset
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Spotify Streams
                    </CardTitle>
                    <Headphones className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(avgStreams)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average streams per track
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Explicit Tracks
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {explicitTracks.toLocaleString()}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({explicitPercentage}%)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tracks marked as explicit
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Most Recent
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mostRecentDate.toLocaleDateString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Latest release date
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Temporal Aspect Section */}
          <section 
            ref={temporalRef} 
            className="min-h-screen w-full p-6 snap-start"
          >
            <h1 className="text-3xl font-bold mb-4">Aspect Temporel</h1>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Scatter Plot : Age vs. Spotify Streams
              </h2>
              <ScatterPlot data={data} />
              <p className="text-xs text-muted-foreground mt-2">
                Ce nuage de points interactif montre la relation entre l&apos;âge
                des chansons et divers indicateurs de succès, avec une ligne de
                régression calculée en temps réel pour visualiser la tendance
                globale.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Graphique des Tendances Saisonnières
              </h2>
              <RadialLineChart data={data} />
              <p className="text-xs text-muted-foreground mt-2">
                Ce graphique radial permet d&apos;identifier les tendances
                saisonnières en fonction du mois ou de la saison, en cliquant sur
                une section pour zoomer sur les détails.
              </p>
            </div>
          </section>

          {/* Multi-platform Aspect Section */}
          <section 
            ref={multiplatformRef} 
            className="min-h-screen w-full p-6 snap-start"
          >
            <h1 className="text-3xl font-bold mb-4">Aspect Multi-plateformes</h1>
            <MultiPlatformOverview data={data} />
          </section>

          {/* Genre Aspect Section */}
          <section 
            ref={genreRef} 
            className="min-h-screen w-full p-6 snap-start"
          >
            <h1 className="text-3xl font-bold mb-4">Aspect Genre Musical</h1>
            <BoxPlot data={data} />
          </section>

          {/* Diffusion Aspect Section */}
          <section 
            ref={diffusionRef} 
            className="min-h-screen w-full p-6 snap-start"
          >
            <h1 className="text-3xl font-bold mb-4">
              Aspect Diffusion & Rayonnement
            </h1>
            <CorrelationMatrix data={data} />
          </section>

          {/* Engagement Aspect Section */}
          <section 
            ref={engagementRef} 
            className="min-h-screen w-full p-6 snap-start"
          >
            <h1 className="text-3xl font-bold mb-4">
              Aspect Engagement des Utilisateurs
            </h1>
            <SunburstChart data={hierarchicalData} />
          </section>
        </main>

        <footer className="border-t bg-muted/40 px-6 py-4 text-center text-sm text-muted-foreground">
          <p>INF8808 Project - Spotify Data Visualization - 2024</p>
        </footer>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex bg-background">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#1DB954] p-1">
                <Music2 className="h-5 w-5 text-black" />
              </div>
              <h1 className="text-xl font-bold text-[#1DB954]">Spotify Data</h1>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => scrollToSection(overviewRef)}>
                  <LayoutDashboard />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => scrollToSection(temporalRef)}>
                  <Calendar />
                  <span>Temporal Aspect</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => scrollToSection(multiplatformRef)}>
                  <Grid2X2 />
                  <span>Multi-platform</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => scrollToSection(genreRef)}>
                  <Music2 />
                  <span>Genre Aspect</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => scrollToSection(diffusionRef)}>
                  <TrendingUp />
                  <span>Diffusion</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => scrollToSection(engagementRef)}>
                  <Headphones />
                  <span>User Engagement</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <MainContent />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;