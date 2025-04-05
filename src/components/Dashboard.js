import React from "react";
import useData from "../hooks/useData";
import ScatterPlot from "./ScatterPlot";

const Dashboard = () => {
  const data = useData();

  if (!data) return <div>Loading data...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <ScatterPlot data={data} />
    </div>
  );
};

export default Dashboard;
