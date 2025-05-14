import React from "react";
import { useTileSimulator } from "../context/TileSimulatorContext";
import TileSelector from "./TileSelector";
import ColorEditor from "./ColorEditor";
import TileCanvasView from "./TileCanvasView";

const TileSimulator = () => {
  const {
    selectedTile,
    setSelectedTile,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedEnvironment,
    setSelectedEnvironment,
    groutColor,
    setGroutColor,
    groutThickness,
    setGroutThickness,
    tileMasks,
    setTileMaskColor
  } = useTileSimulator();

  return (
    <div className="min-h-screen max-w-9xl p-3 lg:p-0 m-auto  grid grid-cols-1 lg:grid-rows-1 lg:grid-cols-[1fr_0.7fr_2.3fr] gap-4">
      {/* Tile Selection */}
      <div className="flex flex-col">
        <div className="text-center lg:text-left py-6">
          <div className="text-lg  tracking-widest font-poppins">TILE SELECTION</div>
          <div className="text-sm italic text-gray-500 font-poppins font-light">(SCROLL FOR MORE OPTIONS)</div>
        </div>
        <div className="overflow-y-auto">
          <TileSelector onSelectTile={setSelectedTile} />
        </div>
      </div>

      {/* Color Editor */}
      <div className=" flex flex-col">
        <div className="text-center lg:text-left py-6">
          <div className="text-lg  tracking-widest font-poppins">COLOR EDITOR</div>
        </div>
        <div className="overflow-y-auto">
          {selectedTile && (
            <ColorEditor
              tile={selectedTile}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              selectedEnvironment={selectedEnvironment}
              setSelectedEnvironment={setSelectedEnvironment}
              groutColor={groutColor}
              setGroutColor={setGroutColor}
              groutThickness={groutThickness}
              setGroutThickness={setGroutThickness}
              tileMasks={tileMasks}
              setTileMaskColor={setTileMaskColor}
            />
          )}
        </div>
      </div>

      {/* View */}
      <div className="flex flex-col">
        <div className="text-center lg:text-left py-6">
          <div className="text-lg font-light font-poppins">VIEW</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TileCanvasView
            selectedTile={selectedTile}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            selectedEnvironment={selectedEnvironment}
            groutColor={groutColor}
            groutThickness={groutThickness}
            tileMasks={tileMasks}
          />
        </div>
      </div>
    </div>
  );
};

export default TileSimulator;
