import React, { useState } from "react";
import { useTileSimulator } from "../context/TileSimulatorContext";

const ColorEditor = ({ tile }) => {
  const {
    tileMasks,
    borderMasks,
    setTileMaskColor,
    setBorderMaskColor,
  } = useTileSimulator();

  const [hoveredPaletteColor, setHoveredPaletteColor] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedMaskId, setSelectedMaskId] = useState(
    tileMasks && tileMasks.length > 0 ? tileMasks[0].id : null
  );
  const [selectedBorderMaskId, setSelectedBorderMaskId] = useState(
    borderMasks && borderMasks.length > 0 ? borderMasks[0].maskId : null
  );
  const [visibleRows, setVisibleRows] = useState(1);

  if (!tile || !Array.isArray(tileMasks)) return null;
  const allAvailableColors = Array.from(
    new Set([
      ...tileMasks.flatMap((mask) => mask.availableColors || []),
      ...(borderMasks || []).flatMap((mask) => mask.availableColors || []),
    ])
  );

  // Split colors into rows of 5
  const colorRows = [];
  for (let i = 0; i < allAvailableColors.length; i += 5) {
    colorRows.push(allAvailableColors.slice(i, i + 5));
  }

  // The currently selected mask objects
  const selectedMask = tileMasks.find((mask) => mask.id === selectedMaskId);
  const selectedBorderMask = borderMasks?.find(
    (mask) => mask.maskId === selectedBorderMaskId
  );

  // When a palette color is clicked, update only the selected mask
  const handlePaletteColorSelect = (paletteColor) => {
    if (selectedBorderMask && selectedBorderMaskId) {
      setBorderMaskColor(selectedBorderMaskId, paletteColor);
    } else if (selectedMask) {
      setTileMaskColor(selectedMask.id, paletteColor);
    }
    setPreviewMode(false);
    setHoveredPaletteColor(null);
  };

  // When a color in "Colors Used" is clicked, select the first mask with that color
  const handleColorUsedClick = (color) => {
    const tileMaskWithColor = tileMasks.find((mask) => mask.color === color);
    if (tileMaskWithColor) {
      setSelectedMaskId(tileMaskWithColor.id);
      setSelectedBorderMaskId(null);
      return;
    }
    const borderMaskWithColor = borderMasks?.find(
      (mask) => mask.color === color
    );
    if (borderMaskWithColor) {
      setSelectedBorderMaskId(borderMaskWithColor.maskId);
      setSelectedMaskId(null);
    }
  };

  const selectedMaskColor = selectedMask
    ? selectedMask.color
    : selectedBorderMask
    ? selectedBorderMask.color
    : null;

  // Get unique colors used by masks
  const getUniqueColors = () => {
    const colorSet = new Set();
    tileMasks.forEach((mask) => colorSet.add(mask.color));
    borderMasks?.forEach((mask) => colorSet.add(mask.color));
    return Array.from(colorSet);
  };

  const handleShowMore = () => {
    setVisibleRows(prev => Math.min(prev + 1, colorRows.length));
  };

  return (
    <div className="pb-2">
      {/* Instructions */}
      <div className="mb-4">
        <div className="text-sm font-poppins text-gray-600">
          Customize Colors
        </div>
        <ol className="text-xs text-gray-500 mt-1 space-y-1">
          <li>Click on a color from "Color Used" to select an area</li>
          <li>Choose a new color from "Availabe Colors" to apply it</li>
        </ol>
      </div>
         {/* Colors Used */}
      <div className="mb-6">
        <div className="text-sm mb-2 tracking-wider font-light font-poppins">
          Color Used
        </div>
        <div className="flex flex-wrap gap-3 ">
          {getUniqueColors().map((color) => (
            <button
              key={color}
              className={`w-6 h-6 transition-all duration-300 ease-in-out transform hover:scale-110
                ${selectedMaskColor === color
                  ? "rounded-md ring-2 ring-[#bd5b4c]"
                  : "rounded-full hover:rounded-full hover:ring-1 hover:ring-[#bd5b4c]"
                }`}
              style={{ backgroundColor: color }}
              title={color}
              onClick={() => handleColorUsedClick(color)}
            />
          ))}
        </div>
      </div>

      {/* Available Colors */}
      <div className="mb-4">
        <div className="text-sm mb-3 tracking-wider font-light font-poppins">
          Available Colors
        </div>
        <div className="flex flex-col gap-2">
          {colorRows.slice(0, visibleRows).map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((paletteColor, index) => {
                const isActive = selectedMaskColor === paletteColor;
                return (
                  <button
                    key={`palette-color-${rowIndex}-${index}-${paletteColor}`}
                    className={`w-6 h-6 transition-all duration-300 ease-in-out transform hover:scale-110
                      ${isActive
                        ? "rounded-md ring-2 ring-[#bd5b4c]"
                        : "rounded-full hover:rounded-full hover:ring-1 hover:ring-[#bd5b4c]"
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
                );
              })}
            </div>
          ))}
        </div>
        {visibleRows < colorRows.length && (
          <div className="mt-1">
            <button
              onClick={handleShowMore}
              className="p-1  font-poppins text-sm text-gray-600 hover:text-black transition-colors duration-300 ease"
            >
              More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorEditor;
