import React, { useState, useEffect } from "react";
import TileSelector from "./TileSelector";
import ColorEditor from "./ColorEditor";
import TileCanvasView from "./TileCanvasView";

const TileSimulator = () => {
  // Initialize state from localStorage or defaults
  const [selectedTile, setSelectedTile] = useState(() => {
    const savedTile = localStorage.getItem('selectedTile');
    return savedTile ? JSON.parse(savedTile) : '';
  });

  const [selectedColor, setSelectedColor] = useState(() => {
    const savedColor = localStorage.getItem('selectedColor');
    return savedColor || '#ffffff';
  });

  const [selectedSize, setSelectedSize] = useState(() => {
    const savedSize = localStorage.getItem('selectedSize');
    return savedSize || "8x8";
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('selectedTile', JSON.stringify(selectedTile));
  }, [selectedTile]);

  useEffect(() => {
    localStorage.setItem('selectedColor', selectedColor);
  }, [selectedColor]);

  useEffect(() => {
    localStorage.setItem('selectedSize', selectedSize);
  }, [selectedSize]);

  return (
    <div className="min-h-screen max-w-7xl m-auto bg-white grid grid-cols-1  lg:grid-rows-1 lg:grid-cols-[1fr_1fr_2fr]">
      {/* Tile Selection */}
      <div className="flex flex-col">
        <div className="text-center lg:text-left py-6">
          <div className="text-lg font-semibold tracking-widest">TILE SELECTION</div>
          <div className="text-xs italic text-gray-500">(SCROLL FOR MORE OPTIONS)</div>
        </div>
        <div className="overflow-y-auto">
          <TileSelector onSelectTile={(tile) => {
            setSelectedTile(tile);
            if (tile.colorsUsed?.length > 0) {
              setSelectedColor(tile.colorsUsed[0]);
            }
          }} />
        </div>
      </div>

      {/* Color Editor */}
      <div className="border-b lg:border-r lg:border-b-0 flex flex-col">
        <div className="text-center lg:text-left py-6">
          <div className="text-lg font-semibold tracking-widest">COLOR EDITOR</div>
        </div>
        <div className="overflow-y-auto">
          <ColorEditor
            selectedTile={selectedTile}
            onColorChange={setSelectedColor}
            onSizeChange={setSelectedSize}
          />
        </div>
      </div>

      {/* View */}
      <div className="flex flex-col">
        <div className="text-center lg:text-left py-6">
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
};

export default TileSimulator;
