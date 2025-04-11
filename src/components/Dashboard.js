import React, { useState } from "react";
import useData from "../hooks/useData";
import BoxPlot from "./BoxPlot";
import CorrelationMatrix from "./CorrelationMatrix";
import ScatterPlot from "./ScatterPlot";
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
  const [activeViz, setActiveViz] = useState("overview");

  if (!data) return <div>Loading...</div>;
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

  // Helper to render the active visualization
  const renderVisualization = () => {
    switch (activeViz) {
      case "boxplot":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Stream Distribution by Explicit Content
                </h2>
                <p className="text-muted-foreground">
                  Compare distribution of Spotify streams between explicit and
                  non-explicit tracks
                </p>
              </div>
            </div>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <BoxPlot data={data} />
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Note: Y-axis uses logarithmic scale for better visualization
                </p>
              </CardFooter>
            </Card>
          </div>
        );
      case "correlation":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Correlation Matrix
                </h2>
                <p className="text-muted-foreground">
                  Explore relationships between different metrics across
                  platforms
                </p>
              </div>
            </div>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <CorrelationMatrix data={data} />
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Darker colors indicate stronger correlations
                </p>
              </CardFooter>
            </Card>
          </div>
        );
      case "scatterplot":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Age vs. Stream Count
                </h2>
                <p className="text-muted-foreground">
                  Relationship between song age and number of Spotify streams
                </p>
              </div>
            </div>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <ScatterPlot data={data} />
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Each point represents a single track
                </p>
              </CardFooter>
            </Card>
          </div>
        );
      // (B) Nouveau cas : SUNBURST
      case "sunburst":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Sunburst Chart
                </h2>
                <p className="text-muted-foreground">
                  Visualizing how streams are distributed by Artist → Platform
                </p>
              </div>
            </div>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                {!hierarchicalData ? (
                  <div>Building hierarchy…</div>
                ) : (
                  <SunburstChart data={hierarchicalData} />
                )}
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Click segments to drill down, or center to zoom out
                </p>
              </CardFooter>
            </Card>
          </div>
        );

      // (B) Nouveau cas : PARALLEL
      case "parallel":
        // Construire le tableau pcData à partir des données brutes
        const pcData = data.map((d) => ({
          // Q9: spotifyPlaylistReach & spotifyStreams
          playlistReach: d.spotifyPlaylistReach,
          streams: d.spotifyStreams,

          // Q10: spotifyPlaylistCount & spotifyPopularity
          playlistCount: d.spotifyPlaylistCount,
          popularity: d.spotifyPopularity,

          // Q11: airPlaySpins & siriusXMSpins
          airPlaySpins: d.airplaySpins,
          siriusXMSpins: d.siriusXMSpins,
        }));

        console.log("pcData:", pcData);

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Parallel Coordinates
                </h2>
                <p className="text-muted-foreground">
                  Compare playlist reach, streams, popularity, etc.
                </p>
              </div>
            </div>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <ParallelCoordinates data={pcData} />
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Use brush on each axis to filter songs
                </p>
              </CardFooter>
            </Card>
          </div>
        );
      case "overview":
      default:
        return (
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

            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold tracking-tight">
                Visualizations
              </h3>
            </div>

            <div className="relative">
              <div className="flex flex-nowrap gap-6 pb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-4">
                <Card className="overflow-hidden transition-all hover:shadow-md min-w-[320px] flex-shrink-0">
                  <CardHeader className="p-4">
                    <CardTitle>Stream Distribution</CardTitle>
                    <CardDescription>
                      Compare explicit vs non-explicit tracks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div
                      className="aspect-video bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 flex items-center justify-center cursor-pointer"
                      onClick={() => setActiveViz("boxplot")}
                    >
                      <div className="w-3/4 h-1/2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between items-center">
                    <Badge variant="outline">Box Plot</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveViz("boxplot")}
                    >
                      View <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden transition-all hover:shadow-md min-w-[320px] flex-shrink-0">
                  <CardHeader className="p-4">
                    <CardTitle>Correlation Matrix</CardTitle>
                    <CardDescription>
                      Relationships between metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div
                      className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center cursor-pointer"
                      onClick={() => setActiveViz("correlation")}
                    >
                      <div className="w-3/4 h-1/2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Grid2X2 className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between items-center">
                    <Badge variant="outline">Heatmap</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveViz("correlation")}
                    >
                      View <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden transition-all hover:shadow-md min-w-[320px] flex-shrink-0">
                  <CardHeader className="p-4">
                    <CardTitle>Popularity by Year</CardTitle>
                    <CardDescription>
                      Trends across release years
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div
                      className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center cursor-pointer"
                      onClick={() => setActiveViz("barchart")}
                    >
                      <div className="w-3/4 h-1/2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between items-center">
                    <Badge variant="outline">Bar Chart</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveViz("barchart")}
                    >
                      View <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden transition-all hover:shadow-md min-w-[320px] flex-shrink-0">
                  <CardHeader className="p-4">
                    <CardTitle>Age vs. Streams</CardTitle>
                    <CardDescription>
                      Impact of song age on popularity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div
                      className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 flex items-center justify-center cursor-pointer"
                      onClick={() => setActiveViz("scatterplot")}
                    >
                      <div className="w-3/4 h-1/2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <ScatterChart className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between items-center">
                    <Badge variant="outline">Scatter Plot</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveViz("scatterplot")}
                    >
                      View <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background to-transparent w-12 h-full pointer-events-none"></div>
            </div>
          </div>
        );
    }
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
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Spotify Data Visualization</h1>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          {renderVisualization()}
        </main>

        <footer className="border-t bg-muted/40 px-6 py-4 text-center text-sm text-muted-foreground">
          <p>INF8808 Project - Spotify Data Visualization - 2024</p>
        </footer>
      </div>
    );
  };

  return (
    /* <div>
      <SunburstChart data={hierarchicalData} />
      <ParallelCoordinates data={pcData} />
    </div>*/

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
                <SidebarMenuButton
                  isActive={activeViz === "overview"}
                  onClick={() => setActiveViz("overview")}
                >
                  <LayoutDashboard />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeViz === "boxplot"}
                  onClick={() => setActiveViz("boxplot")}
                >
                  <BarChart3 />
                  <span>Box Plot</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeViz === "correlation"}
                  onClick={() => setActiveViz("correlation")}
                >
                  <Grid2X2 />
                  <span>Correlation Matrix</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeViz === "barchart"}
                  onClick={() => setActiveViz("barchart")}
                >
                  <TrendingUp />
                  <span>Bar Chart</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeViz === "scatterplot"}
                  onClick={() => setActiveViz("scatterplot")}
                >
                  <ScatterChart />
                  <span>Scatter Plot</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* (A) NOUVEAU : Sunburst */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeViz === "sunburst"}
                  onClick={() => setActiveViz("sunburst")}
                >
                  <Music2 />
                  <span>Sunburst</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* (A) NOUVEAU : Parallel */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeViz === "parallel"}
                  onClick={() => setActiveViz("parallel")}
                >
                  <Grid2X2 />
                  <span>Parallel Coords</span>
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
