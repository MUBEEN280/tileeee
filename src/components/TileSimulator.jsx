import React, { useState } from "react";
import TileSelector from "./TileSelector";
import ColorEditor from "./ColorEditor";
import TileCanvasView from "./TileCanvasView";

const TileSimulator = () => {
  const [selectedTile, setSelectedTile] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('8x8');

  const handleTileSelect = (tile) => {
    setSelectedTile(tile);
    // Set initial color from the tile's colors
    if (tile.colorsUsed && tile.colorsUsed.length > 0) {
      setSelectedColor(tile.colorsUsed[0]);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left side - Tile Selector */}
      <div className="w-full lg:w-1/3 border-r">
        <TileSelector onSelectTile={handleTileSelect} />
      </div>

      {/* Right side - Color Editor and Canvas */}
      <div className="w-full lg:w-2/3 flex flex-col">
        <div className="h-1/2 border-b">
          <ColorEditor
            selectedTile={selectedTile}
            onColorChange={handleColorChange}
            onSizeChange={handleSizeChange}
          />
        </div>
        <div className="h-1/2">
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
