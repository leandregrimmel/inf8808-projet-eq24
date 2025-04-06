import React from "react";
import useData from "../hooks/useData";
import BoxPlot from "./BoxPlot";
import CorrelationMatrix from "./CorrelationMatrix";
import BarChart from "./BarChart";
import ScatterPlot from "./ScatterPlot";

const Dashboard = () => {
  const data = useData();

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <BoxPlot data={data} />
      <CorrelationMatrix data={data} />
      <BarChart data={data} />
      <ScatterPlot data={data} />
    </div>
  );
};

export default Dashboard;
