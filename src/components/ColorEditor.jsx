import React, { useState } from "react";
import { useTileSimulator } from "../context/TileSimulatorContext";

const ColorEditor = ({ tile }) => {
  const { setTileMaskColor, tileMasks } = useTileSimulator();
  const [hoveredPaletteColor, setHoveredPaletteColor] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  // Track which mask is selected for editing
  const [selectedMaskId, setSelectedMaskId] = useState(
    tileMasks && tileMasks.length > 0 ? tileMasks[0].id : null
  );

  if (!tile || !Array.isArray(tileMasks)) return null;

  // All unique available colors from all masks
  const allAvailableColors = Array.from(
    new Set(tileMasks.flatMap((mask) => mask.availableColors || []))
  );

  // The currently selected mask object
  const selectedMask = tileMasks.find((mask) => mask.id === selectedMaskId);

  // When a palette color is clicked, update only the selected mask
  const handlePaletteColorSelect = (paletteColor) => {
    if (!selectedMask) return;
    setTileMaskColor(selectedMask.id, paletteColor);
    setPreviewMode(false);
    setHoveredPaletteColor(null);
  };

  // For preview: if previewMode, show hoveredPaletteColor for selected mask only
  const getMaskColor = (mask) => {
    if (
      previewMode &&
      hoveredPaletteColor &&
      selectedMask &&
      mask.id === selectedMask.id
    ) {
      return hoveredPaletteColor;
    }
    return mask.color;
  };

  // When a mask layer is clicked, select it
  const handleMaskLayerClick = (maskId) => {
    setSelectedMaskId(maskId);
    setPreviewMode(false);
    setHoveredPaletteColor(null);
  };

  // When a color in "Colors Used" is clicked, select the first mask with that color
  const handleColorUsedClick = (color) => {
    const maskWithColor = tileMasks.find((mask) => mask.color === color);
    if (maskWithColor) {
      setSelectedMaskId(maskWithColor.id);
    }
  };

  // The color of the selected mask (for highlighting in palette and 'Colors Used')
  const selectedMaskColor = selectedMask ? selectedMask.color : null;

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Color Editor</h3>
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Editing Tile: {tile.name}</h4>
        {/* Tile Preview */}
        <div className="mb-4 aspect-square max-w-xs mx-auto relative">
          <img
            src={tile.image}
            alt={tile.name}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
          {tileMasks.map((mask) => (
            <div
              key={mask?.id}
              className={`absolute inset-0 cursor-pointer ${
                selectedMaskId === mask?.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleMaskLayerClick(mask?.id)}
              style={{
                backgroundColor: getMaskColor(mask),
                maskImage: `url(${mask?.image})`,
                WebkitMaskImage: `url(${mask?.image})`,
                maskSize: "cover",
                WebkitMaskSize: "cover",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                opacity: 1,
                pointerEvents: "auto",
                mixBlendMode: "darken",
                outline:
                  selectedMaskId === mask?.id ? "2px solid #3B82F6" : "none",
                boxShadow:
                  selectedMaskId === mask?.id
                    ? "0 0 0 2px #3B82F6, 0 2px 8px rgba(59,130,246,0.1)"
                    : "none",
              }}
              title={`Select ${mask?.name}`}
            />
          ))}
        </div>
        {/* Colors Used */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Colors Used</h4>
          <div className="flex flex-wrap gap-2">
            {(tile.colorsUsed || []).map((color, index) => (
              <button
                key={`color-used-${index}-${color}`}
                className={`w-8 h-8 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                  selectedMaskColor === color
                    ? "border-black ring-2 ring-offset-2 ring-primary"
                    : "border-gray-200 hover:border-primary"
                }`}
                style={{ backgroundColor: color }}
                title={color}
                onClick={() => handleColorUsedClick(color)}
              />
            ))}
          </div>
        </div>
        {/* Unified Color Palette */}
        <div className="w-full flex flex-wrap justify-center gap-2 bg-gray-100 rounded-lg p-2 shadow-inner">
          {allAvailableColors.map((paletteColor, index) => (
            <button
              key={`palette-color-${index}-${paletteColor}`}
              className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary ${
                selectedMaskColor === paletteColor
                  ? "border-black ring-2 ring-offset-2 ring-primary"
                  : "border-transparent hover:border-gray-400"
              }`}
              style={{ backgroundColor: paletteColor }}
              title={paletteColor}
              onClick={() => handlePaletteColorSelect(paletteColor)}
              onMouseEnter={() => {
                setPreviewMode(true);
                setHoveredPaletteColor(paletteColor);
              }}
              onMouseLeave={() => {
                setPreviewMode(false);
                setHoveredPaletteColor(null);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorEditor;
