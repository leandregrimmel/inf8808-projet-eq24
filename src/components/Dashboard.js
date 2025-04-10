import React from "react";
import useData from "../hooks/useData";
import BoxPlot from "./BoxPlot";
import CorrelationMatrix from "./CorrelationMatrix";
import BarChart from "./BarChart";
import ScatterPlot from "./ScatterPlot";
import SunburstChart from "./SunburstChart";
import { useDataHierarchy } from "../hooks/useDataHierarchy";


const Dashboard = () => {
  const data = useData();

  const hierarchicalData = useDataHierarchy(data);

  if (!data) return <div>Loading...</div>;

  if (!hierarchicalData) {
    return <div>Building hierarchy…</div>;
  }
  
  

  return (
    <div>
      <SunburstChart data={hierarchicalData} />
    </div>
  );
};

export default Dashboard;
