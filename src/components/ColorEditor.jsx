import React, { useState, useEffect } from "react";
import { useTileSimulator } from "../context/TileSimulatorContext";

const ColorEditor = ({ tile }) => {
  const { setTileMaskColor, tileMasks } = useTileSimulator();
  const [hoveredColor, setHoveredColor] = useState(null);
  const [activeMask, setActiveMask] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Return null if no tile is selected
  if (!tile) {
    return null;
  }

  const handleColorSelect = (maskId, color) => {
    setTileMaskColor(maskId, color);
    setPreviewMode(false);
    setActiveMask(null);
    setHoveredColor(null);
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Color Editor</h3>
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Editing Tile: {tile.name}</h4>
        
        {/* Original Tile Preview with Mask Overlay */}
        <div className="mb-4 aspect-square max-w-xs mx-auto relative">
          {/* Base tile image */}
          <img
            src={tile.image}
            alt={tile.name}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
          
          {/* Mask layers */}
          {tileMasks.map(mask => (
            <div
              key={mask.id}
              className="absolute inset-0"
              style={{
                backgroundColor: previewMode && activeMask === mask.id 
                  ? hoveredColor 
                  : mask.color,
                maskImage: `url(${mask.image})`,
                WebkitMaskImage: `url(${mask.image})`,
                maskSize: 'cover',
                WebkitMaskSize: 'cover',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                outline: activeMask === mask.id ? '2px solid #3B82F6' : 'none',
                outlineOffset: '0px',
                pointerEvents: 'none',
                opacity: 1,
                mixBlendMode: 'darken'
              }}
            />
          ))}
        </div>

        {/* Colors Used Section */}
        <div className="mb-6">
          <h4 className="font-medium mb-2">Colors Used</h4>
          <div className="flex flex-wrap gap-2">
            {tile.colorsUsed.map((color, index) => (
              <div
                key={`color-${index}-${color}`}
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Mask Color Editors */}
        <div className="space-y-6">
          {tileMasks.map((mask) => (
            <div 
              key={mask.id} 
              className="border-t pt-4"
            >
              <h4 className="font-medium mb-2">{mask.name}</h4>
              
              {/* Color Palette */}
              <div className="flex flex-wrap gap-2">
                {mask.availableColors.map((color, index) => (
                  <button
                    key={`${mask.id}-color-${index}-${color}`}
                    onClick={() => handleColorSelect(mask.id, color)}
                    onMouseEnter={() => {
                      setPreviewMode(true);
                      setHoveredColor(color);
                      setActiveMask(mask.id);
                    }}
                    onMouseLeave={() => {
                      setPreviewMode(false);
                      setHoveredColor(null);
                      setActiveMask(null);
                    }}
                    className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${
                      mask.color === color 
                        ? 'border-black ring-2 ring-offset-2 ring-primary' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorEditor;
