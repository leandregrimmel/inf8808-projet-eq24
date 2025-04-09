import React from "react";
import useData from "../hooks/useData";
import BoxPlot from "./BoxPlot";
import CorrelationMatrix from "./CorrelationMatrix";
import BarChart from "./BarChart";
import ScatterPlot from "./ScatterPlot";
import SunburstChart from "./SunburstChart";
import { flatToHierarchy } from "../hooks/prepareHierarchyTop10"; // ou le chemin correct



const Dashboard = () => {
  const data = useData();

  if (!data) return <div>Loading...</div>;

  // Convertir les données plates en structure hiérarchique.
  const hierarchicalData = flatToHierarchy(data);

  return (
    <div>
      <SunburstChart data={hierarchicalData} />
    </div>
  );
};

export default Dashboard;
