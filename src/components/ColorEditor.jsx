import React, { useState } from "react";
import { useTileSimulator } from "../context/TileSimulatorContext";
import { FaPlus } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";

const ColorEditor = ({ tile }) => {
  const { 
    setTileMaskColor, 
    tileMasks, 
    selectedBorder, 
    setSelectedBorder, 
    setSelectedCategory, 
    borderMasks, 
    setBorderMaskColor 
  } = useTileSimulator();

  const [hoveredPaletteColor, setHoveredPaletteColor] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedMaskId, setSelectedMaskId] = useState(
    tileMasks && tileMasks.length > 0 ? tileMasks[0].id : null
  );
  const [selectedBorderMaskId, setSelectedBorderMaskId] = useState(
    borderMasks && borderMasks.length > 0 ? borderMasks[0].maskId : null
  );

  if (!tile || !Array.isArray(tileMasks)) return null;

  // All unique available colors from all masks
  const allAvailableColors = Array.from(
    new Set([
      ...tileMasks.flatMap((mask) => mask.availableColors || []),
      ...(borderMasks || []).flatMap((mask) => mask.availableColors || [])
    ])
  );

  // The currently selected mask object
  const selectedMask = tileMasks.find((mask) => mask.id === selectedMaskId);
  const selectedBorderMask = borderMasks?.find((mask) => mask.maskId === selectedBorderMaskId);

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

  // For preview: if previewMode, show hoveredPaletteColor for selected mask only
  const getMaskColor = (mask) => {
    if (
      previewMode &&
      hoveredPaletteColor &&
      ((selectedMask && mask.id === selectedMask.id) || 
       (selectedBorderMask && mask.maskId === selectedBorderMask.maskId))
    ) {
      return hoveredPaletteColor;
    }
    return mask.color;
  };

  // When a color in "Colors Used" is clicked, select the first mask with that color
  const handleColorUsedClick = (color) => {
    // First check tile masks
    const tileMaskWithColor = tileMasks.find((mask) => mask.color === color);
    if (tileMaskWithColor) {
      setSelectedMaskId(tileMaskWithColor.id);
      setSelectedBorderMaskId(null);
      return;
    }
    
    // Then check border masks
    const borderMaskWithColor = borderMasks?.find((mask) => mask.color === color);
    if (borderMaskWithColor) {
      setSelectedBorderMaskId(borderMaskWithColor.maskId);
      setSelectedMaskId(null);
    }
  };

  // The color of the selected mask (for highlighting in palette and 'Colors Used')
  const selectedMaskColor = selectedMask ? selectedMask.color : 
                          selectedBorderMask ? selectedBorderMask.color : null;

  // Handle Add Borders & Remove Borders
  const handleAddOrRemoveBorders = () => {
    if (selectedBorder) {
      setSelectedBorder(null); // Remove border
      setSelectedBorderMaskId(null); // Clear selected border mask
    } else {
      const confirmed = window.confirm("Please choose a border first");
      if (!confirmed) return;
      setSelectedCategory("Border Collection"); // Switch to Border Collection
    }
  };

  // Get unique colors with their sources
  const getUniqueColors = () => {
    const colorMap = new Map();
    
    // First add tile mask colors
    tileMasks.forEach(mask => {
      colorMap.set(mask.color, { type: 'tile', mask });
    });
    
    // Then add/update with border mask colors
    borderMasks?.forEach(mask => {
      if (colorMap.has(mask.color)) {
        // If color exists, mark it as both tile and border
        const existing = colorMap.get(mask.color);
        colorMap.set(mask.color, { 
          ...existing, 
          hasBorder: true,
          borderMask: mask 
        });
      } else {
        // If color doesn't exist, add it as border only
        colorMap.set(mask.color, { 
          type: 'border', 
          mask,
          hasBorder: true,
          borderMask: mask 
        });
      }
    });

    return colorMap;
  };

  return (
    <div className="pb-4 p-1">
      <div className="mb-4">
        <h4 className="text-md mb-2 font-light font-poppins text-center lg:text-left uppercase tracking-wide">
          Edit Tile : {tile.name}
        </h4>
        
        {/* Tile Preview */}
        <div className="mb-4 aspect-square max-w-xs mx-auto lg:mx-0 relative">
          <div
            className="relative w-full h-full rounded-lg overflow-hidden"
            style={{
              backgroundColor: "transparent",
              borderRadius: "12px",
              boxSizing: "border-box",
            }}
          >
            {/* Border Image */}
            {selectedBorder && (
              <img
                src={selectedBorder}
                alt="Selected Border"
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  objectFit: "contain",
                  zIndex: 10,
                }}
              />
            )}

            {/* Tile Image */}
            <img
              src={tile.image}
              alt={tile.name}
              className="absolute inset-0 mx-auto my-auto"
              style={{
                width: selectedBorder ? "54%" : "100%",
                height: selectedBorder ? "50%" : "100%",
                top: selectedBorder ? "50%" : "100%",
                left: selectedBorder ? "50%" : "50%",
                transform: "translate(-50%, -50%)",
                position: "absolute",
                objectFit: "contain",
                zIndex: 5,
                borderRadius: "8px",
              }}
            />

            {/* Tile Masks */}
            {tileMasks.map((mask) => (
              <div
                key={mask.id}
                className="absolute inset-0"
                style={{
                  backgroundColor: getMaskColor(mask),
                  WebkitMaskImage: `url(${mask.image})`,
                  maskImage: `url(${mask.image})`,
                  WebkitMaskSize: "cover",
                  maskSize: "cover",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  width: selectedBorder ? "54%" : "100%",
                  height: selectedBorder ? "50%" : "100%",
                  top: selectedBorder ? "50%" : "0",
                  left: selectedBorder ? "50%" : "0",
                  transform: selectedBorder ? "translate(-50%, -50%)" : "none",
                  zIndex: 6,
                  pointerEvents: "none",
                  borderRadius: "8px",
                }}
              />
            ))}

            {/* Border Masks */}
            {selectedBorder && borderMasks && borderMasks.map((mask) => (
              <div
                key={mask.maskId}
                className="absolute inset-0"
                style={{
                  backgroundColor: getMaskColor(mask),
                  WebkitMaskImage: `url(${mask.image})`,
                  maskImage: `url(${mask.image})`,
                  WebkitMaskSize: "100%",
                  maskSize: "100%",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  zIndex: 7,
                  pointerEvents: "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Add/Remove Border Button */}
        <div className="mb-4 flex justify-center items-center lg:justify-start lg:items-start gap-2">
          <button 
            className="flex justify-center items-center gap-2 bg-black hover:bg-black/90 text-white font-poppins font-light py-2 px-4 rounded-md hover:border hover:border-red-500 hover:shadow-md hover:shadow-red-500 transition duration-300 ease-in-out"
            onClick={handleAddOrRemoveBorders}
          >
            <span>{selectedBorder ? <FaTimes /> : <FaPlus />}</span>
            <span>{selectedBorder ? 'Remove Border' : 'Add Border'}</span>
          </button>
        </div>

        {/* Colors Used */}
        <div className="mb-4">
          <h4 className="mb-2 font-light font-poppins text-center lg:text-left">Colors Used</h4>
          <div className="flex justify-center items-center lg:justify-start lg:items-start flex-wrap gap-2">
            {Array.from(getUniqueColors().entries()).map(([color, data], index) => (
              <button
                key={`color-used-${index}-${color}`}
                className={`w-6 h-6 border-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-red-500 ${
                  selectedMaskColor === color
                    ? "border-black ring-1 ring-offset-1 ring-red-500"
                    : "border-gray-200 hover:border-red-500"
                } ${data.hasBorder ? 'rounded-md' : 'rounded-full'}`}
                style={{ backgroundColor: color }}
                title={`${color}${data.hasBorder ? ' (Border)' : ' (Tile)'}`}
                onClick={() => handleColorUsedClick(color)}
              />
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="w-full flex flex-wrap justify-center gap-2 bg-gray-100 rounded-lg p-2 shadow-inner max-w-xs mx-auto lg:mx-0">
          {allAvailableColors.map((paletteColor, index) => (
            <button
              key={`palette-color-${index}-${paletteColor}`}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                selectedMaskColor === paletteColor
                  ? "border-black ring-1 ring-offset-1 ring-red-500"
                  : "border-transparent hover:border-red-500"
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
