import React, { useState } from "react";
import TileSelector from "./components/TileSelector";
import ColorEditor from "./components/ColorEditor";
import TileCanvasView from "./components/TileCanvasView";

export default function App() {
  const [selectedTile, setSelectedTile] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("8x8");

  return (
    <div className="min-h-screen max-w-[80%] m-auto bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr]">
      {/* Tile Selection */}
      <div className="border-r min-h-screen flex flex-col">
        <div className="text-center py-6">
          <div className="text-lg font-semibold tracking-widest">TILE SELECTION</div>
          <div className="text-xs italic text-gray-500">(SCROLL FOR MORE OPTIONS)</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TileSelector onSelectTile={tile => {
            setSelectedTile(tile);
            if (tile.colorsUsed && tile.colorsUsed.length > 0) {
              setSelectedColor(tile.colorsUsed[0]);
            }
          }} />
        </div>
      </div>
      {/* Color Editor */}
      <div className="border-r min-h-screen flex flex-col">
        <div className="text-center py-6">
          <div className="text-lg font-semibold tracking-widest">COLOR EDITOR</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ColorEditor
            selectedTile={selectedTile}
            onColorChange={setSelectedColor}
            onSizeChange={setSelectedSize}
          />
        </div>
      </div>
      {/* View */}
      <div className="min-h-screen flex flex-col">
        <div className="text-center py-6">
          <div className="text-lg font-semibold tracking-widest">VIEW</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TileCanvasView
            selectedTile={selectedTile}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
          />
        </div>
      </div>
    </div>
  );
}