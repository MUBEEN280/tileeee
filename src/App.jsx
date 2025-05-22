import React from "react";
import { TileSimulatorProvider } from './context/TileSimulatorContext';
import TileSimulator from "./components/TileSimulator";



export default function App() {
  return (
    <TileSimulatorProvider>
      <TileSimulator />
    </TileSimulatorProvider>
  );
}