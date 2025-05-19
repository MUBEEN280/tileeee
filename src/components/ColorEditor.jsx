import React, { useState, useEffect } from "react";
import { useTileSimulator } from "../context/TileSimulatorContext";
import { FaPlus } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";

const ColorEditor = ({ tile }) => {
  const {
    setTileMaskColor,
    tileMasks,
    selectedBorder,
    setSelectedBorder,
    setSelectedCategory,
    borderMasks,
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

  const [blockRotations, setBlockRotations] = useState([0, 0, 0, 0]); // Rotation degrees for each block
  const [hoveredBlockIndex, setHoveredBlockIndex] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rotateBlock = (blockIndex) => {
    const newRotations = [...blockRotations];
    newRotations[blockIndex] = (newRotations[blockIndex] + 90) % 360; // Rotate by 90 degrees
    setBlockRotations(newRotations);
  };

  if (!tile || !Array.isArray(tileMasks)) return null;

  // All unique available colors from all masks
  const allAvailableColors = Array.from(
    new Set([
      ...tileMasks.flatMap((mask) => mask.availableColors || []),
      ...(borderMasks || []).flatMap((mask) => mask.availableColors || []),
    ])
  );

  // The currently selected mask object
  const selectedMask = tileMasks.find((mask) => mask.id === selectedMaskId);
  const selectedBorderMask = borderMasks?.find(
    (mask) => mask.maskId === selectedBorderMaskId
  );

  // When a palette color is clicked, update only the selected mask
  const handlePaletteColorSelect = (paletteColor) => {
    if (selectedBorderMask && selectedBorderMaskId) {
      // Update border mask color
      setBorderMaskColor(selectedBorderMaskId, paletteColor);
    } else if (selectedMask) {
      setTileMaskColor(selectedMask.id, paletteColor);
    }
    setPreviewMode(false);
    setHoveredPaletteColor(null);
  };

  // For preview: if previewMode, show hoveredPaletteColor for selected mask only
  const getMaskColor = (mask) => {
    if (previewMode && hoveredPaletteColor) {
      // Check if this is a border mask
      if (
        mask.maskId &&
        selectedBorderMask &&
        mask.maskId === selectedBorderMask.maskId
      ) {
        return hoveredPaletteColor;
      }
      // Check if this is a tile mask
      if (mask.id && selectedMask && mask.id === selectedMask.id) {
        return hoveredPaletteColor;
      }
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

    // Then check tile masks
    const borderMaskWithColor = borderMasks?.find(
      (mask) => mask.color === color
    );
    if (borderMaskWithColor) {
      setSelectedBorderMaskId(borderMaskWithColor.maskId);
      setSelectedMaskId(null);
    }
  };

  // The color of the selected mask (for highlighting in palette and 'Colors Used')
  const selectedMaskColor = selectedMask
    ? selectedMask.color
    : selectedBorderMask
      ? selectedBorderMask.color
      : null;

  // Handle Add Borders & Remove Borders
  const handleAddOrRemoveBorders = () => {
    if (selectedBorder) {
      setSelectedBorder(null); // Remove border
      setSelectedBorderMaskId(null); // Clear selected border mask
    } else {
      const confirmed = window.confirm("Select a border from the Border Collection to add");
      if (!confirmed) return;
      setSelectedCategory("Border Collection"); // Switch to Border Collection
    }
  };

  // Get unique colors with their sources
  const getUniqueColors = () => {
    const colorMap = new Map();

    // First add tile mask colors
    tileMasks.forEach((mask) => {
      colorMap.set(mask.color, { type: "tile", mask });
    });

    // Then add/update with border mask colors
    borderMasks?.forEach((mask) => {
      if (colorMap.has(mask.color)) {
        // If color exists, mark it as both tile and border
        const existing = colorMap.get(mask.color);
        colorMap.set(mask.color, {
          ...existing,
          hasBorder: true,
          borderMask: mask,
        });
      } else {
        // If color doesn't exist, add it as border only
        colorMap.set(mask.color, {
          type: "border",
          mask,
          hasBorder: true,
          borderMask: mask,
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
            {selectedBorder && borderMasks && borderMasks.length > 0 && (
              <img
                src={borderMasks[0].image || selectedBorder}
                alt="Tile Border"
                className="absolute left-1/2 top-1/2 pointer-events-none "
                style={{
                  width: 1200,
                  height: 500,
                  transform: "translate(-50%, -50%)",
                  objectFit: "contain",
                  zIndex: 10,
                }}
              />
            )}

            {/* Tile Grid Container */}
            <div
              className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[1px]"
              style={{
                width: selectedBorder ? "50%" : "100%",
                height: selectedBorder ? "50%" : "100%",
                top: selectedBorder ? "50%" : "0",
                left: selectedBorder ? "50%" : "0",
                transform: selectedBorder ? "translate(-50%, -50%)" : "none",
              }}
            >
              {[0, 1, 2, 3].map((blockIndex) => (
                <div
                  key={blockIndex}
                  className="relative group "
                  style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                  }}
                  onMouseEnter={() => setHoveredBlockIndex(blockIndex)}
                  onMouseLeave={() => setHoveredBlockIndex(null)}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePosition({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}

                >
                  {/* Tile Block */}
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: `rotate(${blockRotations[blockIndex]}deg)`,
                      transition: "transform 0.3s ease-in-out",
                    }}
                  >
                    <img
                      src={tile.image}
                      alt={`Tile Block ${blockIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        transform: `scale(2)`,
                        transformOrigin: `${blockIndex % 2 === 0 ? '0' : '100%'} ${blockIndex < 2 ? '0' : '100%'}`,
                      }}
                    />

                    {/* Tile Masks for this block */}
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
                          transform: `scale(2)`,
                          transformOrigin: `${blockIndex % 2 === 0 ? '0' : '100%'} ${blockIndex < 2 ? '0' : '100%'}`,
                          zIndex: 6,
                          pointerEvents: "none",
                        }}
                      />
                    ))}
                  </div>

                  {/* Rotation Button - Always show on hover */}
                  {hoveredBlockIndex === blockIndex && (

                    <button
                      className="absolute bg-black/50 text-white p-2 rounded-full 
               transition-opacity duration-300 hover:bg-black/70 z-20 cursor-pointer"
                      onClick={() => rotateBlock(blockIndex)}
                      style={{
                        left: mousePosition.x,
                        top: mousePosition.y,
                        transform: "translate(-50%, -50%)",
                      }}
                      title="Rotate Block"
                    >
                      <IoMdRefresh className="w-3 h-3" />
                    </button>



                  )}
                </div>
              ))}
            </div>

            {/* Border Masks */}
            {selectedBorder &&
              borderMasks &&
              borderMasks.map((mask) => (
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
                    width: "100%",
                    height: "100%",
                    top: "0",
                    left: "0",
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
            className={`flex justify-center items-center gap-2 
    ${selectedBorder
                ? "bg-red-600 hover:bg-red-700"
                : "bg-black hover:bg-black/90"
              }
    text-white font-poppins font-light py-2 px-4 rounded-md 
    ${selectedBorder
                ? "ring-2 ring-red-500 shadow-md shadow-red-500"
                : "hover:ring-2 hover:ring-red-500 hover:shadow-md hover:shadow-red-500"
              } 
    transition duration-300 ease-in-out`}
            onClick={handleAddOrRemoveBorders}
          >
            <span>{selectedBorder ? <FaTimes /> : <FaPlus />}</span>
            <span>{selectedBorder ? "Remove Border" : "Add Border"}</span>
          </button>
        </div>

        {/* Colors Used */}
      <div className="mb-4">
  <h4 className="mb-2 font-light font-poppins text-center lg:text-left">
    Colors Used
  </h4>
  <div className="flex justify-center items-center lg:justify-start lg:items-start flex-wrap gap-2">
    {Array.from(getUniqueColors().entries()).map(([color, data], index) => {
      const isActive = selectedMaskColor === color;
      return (
        <div key={`color-used-${index}-${color}`} className="flex flex-col items-center group">
          <button
            className={`w-6 h-6 transition-all duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-red-500
              ${isActive ? "rounded-full  ring-1 ring-offset-1 ring-red-500" : "rounded-md hover:ring-2 hover:ring-red-500"}
              ${isActive ? "group-hover:rounded-full" : ""}
            `}
            style={{ backgroundColor: color }}
            title={`${color}${data.hasBorder ? " (Border)" : " (Tile)"}`}
            onClick={() => handleColorUsedClick(color)}
          />
          {/* Border appears under the button only when active and hovered */}
          {isActive && (
            <div className=" mt-1 rounded-full"></div>
          )}
        </div>
      );
    })}
  </div>
</div>


        {/* Color Palette */}
      <div className="w-full flex flex-wrap justify-center gap-2 bg-gray-100 rounded-lg pt-2 shadow-inner max-w-xs mx-auto lg:mx-0">
  {allAvailableColors.map((paletteColor, index) => {
    const isActive = selectedMaskColor === paletteColor;
    return (
      <div
        key={`palette-color-${index}-${paletteColor}`}
        className="flex flex-col items-center group"
      >
        <button
          className={`w-6 h-6 transition-all duration-300 ease-in-out transform hover:scale-110
            ${isActive
              ? "rounded-full ring-2 ring-red-500"
              : "rounded-md group-hover:rounded-full group-hover:ring-1 group-hover:ring-red-500 transition-all duration-300 ease-in-out"
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
        {/* Show colored stripe under active color */}
        {isActive && (
          <div
            className="mt-1 rounded-full"
            style={{ backgroundColor: paletteColor }}
          ></div>
        )}
      </div>
    );
  })}
</div>

      </div>
    </div>
  );
};

export default ColorEditor;
