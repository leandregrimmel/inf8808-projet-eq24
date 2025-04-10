import React from "react";
import useData from "../hooks/useData";
import BoxPlot from "./BoxPlot";
import CorrelationMatrix from "./CorrelationMatrix";
import BarChart from "./BarChart";
import ScatterPlot from "./ScatterPlot";
import SunburstChart from "./SunburstChart";
import { useDataHierarchy } from "../hooks/useDataHierarchy";
import ParallelCoordinates from "./ParallelCoordinates";



const Dashboard = () => {
  const data = useData();

  const hierarchicalData = useDataHierarchy(data);

  if (!data) return <div>Loading...</div>;

  if (!hierarchicalData) {
    return <div>Building hierarchy…</div>;
  }
  
   // Construire le tableau pcData à partir des données brutes
   const pcData = data.map(d => ({
    // Q9: spotifyPlaylistReach & spotifyStreams
    playlistReach: d.spotifyPlaylistReach,
    streams: d.spotifyStreams,

    // Q10: spotifyPlaylistCount & spotifyPopularity
    playlistCount: d.spotifyPlaylistCount,
    popularity: d.spotifyPopularity,

    // Q11: airPlaySpins & siriusXMSpins
    airPlaySpins: d.airplaySpins,
    siriusXMSpins: d.siriusXMSpins
  }));

  console.log("pcData:", pcData);

  

  return (
    <div>
      <SunburstChart data={hierarchicalData} />
      <ParallelCoordinates data={pcData} />
    </div>

  );
};

export default Dashboard;
