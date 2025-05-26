// src/components/ChartWidget.tsx
import React from "react";
import { Bar } from "recharts";

interface ChartWidgetProps {
  type: "bar" | "line";
  data: string; // key per prelevare i dati
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ type, data }) => {
  // Esempio: prendo i dati da uno store fittizio
  const seriesData = useMyDataStore(store => store[data]);
  if (!seriesData) return <div>Loading chart…</div>;
  // Rende un semplice grafico a barre usando Recharts
  return (
    <Bar data={seriesData} dataKey="value" />
  );
};

function useMyDataStore(selector: (store: any) => any) {
  const [fakeStore] = React.useState({
    barData: [{ value: 10 }, { value: 15 }, { value: 8 }],
    lineData: [{ value: 12 }, { value: 25 }, { value: 7 }]
  });

  return selector(fakeStore);
}

export default ChartWidget;

