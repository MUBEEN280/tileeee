import React, { useState, useEffect } from "react";
import { FaRegSquare, FaTh } from "react-icons/fa";

// Predefined colors and colors already in use
const colorsUsed = ['#d1a954', '#e9e0d1', '#a8a29e'];
const allSwatches = [
  '#f0eae2', '#e6d3b3', '#c1b2a3', '#b3a68a', '#e5d5c3',
  '#000000', '#555555', '#aaaaaa', '#dddddd', '#eeeeee',
  '#d1a954', '#e9e0d1', '#a8a29e', '#6b7280', '#a3a3a3',
  '#808d4c', '#7f7f7f', '#5a5a5a', '#324d5c', '#008080',
  '#006994', '#1f7a8c', '#0096c7', '#00b4d8', '#90e0ef',
  '#e63946', '#f77f00', '#ff6d00', '#a44a3f', '#6c584c',
  '#b5651d', '#e0ac69', '#f4a261', '#e5989b', '#f8edeb',
  '#9b5de5', '#f15bb5', '#fee440', '#00bbf9', '#00f5d4',
  '#6c584c', '#d3c0cd', '#f7f7f7', '#7c7f87', '#7cb9e8'
];

const ColorEditor = ({ selectedTile, onColorChange, onSizeChange }) => {
  // State to manage colors used
  const [colorsUsedState, setColorsUsedState] = useState(colorsUsed);
  const [hoveredColor, setHoveredColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("8x8");

  // Update colors when a new tile is selected
  useEffect(() => {
    if (selectedTile?.colorsUsed) {
      setColorsUsedState(selectedTile.colorsUsed);
      // Set initial color to the first color of the tile
      if (selectedTile.colorsUsed.length > 0) {
        onColorChange?.(selectedTile.colorsUsed[0]);
      }
    }
  }, [selectedTile]);

  const handleSizeClick = (size) => {
    setSelectedSize(size);
    onSizeChange?.(size);
  };

  const handleColorSelect = (color) => {
    // Add the selected color to the colorsUsed list if it's not already there
    if (!colorsUsedState.includes(color)) {
      setColorsUsedState([...colorsUsedState, color]);
    }
    onColorChange?.(color);
  };

  const handleColorHover = (color) => {
    setHoveredColor(color);
    onColorChange?.(color);
  };

  const handleColorLeave = () => {
    setHoveredColor(null);
    // Revert to the last selected color or default
    onColorChange?.(colorsUsedState[0] || '#d1a954');
  };

  return (
    <div className="w-full p-4 border-2 border-black rounded shadow">
      <h2 className="text-center text-xl font-semibold tracking-widest mb-2">
        Editing Tile: {selectedTile?.name}
      </h2>
      <hr className="mb-4" />

      {/* Tile Preview */}
      <div className="grid grid-cols-2 gap-0 max-w-lg">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="  border-2 border-[#d1a954] overflow-hidden">
            <img
              src={selectedTile?.img}
              alt={selectedTile?.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <button className=" mt-5 bg-black text-white  py-2 px-10 mb-6 hover:bg-gray-800 transition">
        + ADD BORDERS
      </button>

      {/* Color Swatches and Size Selection */}
      <div className="flex md:flex-col justify-start lg:justify-between w-full items-center">
        <div className="flex flex-col justify-start">
          <div className="mb-2 font-semibold">COLORS USED:</div>
          <div className="flex gap-2 mb-4">
            {colorsUsedState.map((color, i) => (
              <div 
                key={i} 
                className="w-6 h-6 rounded border cursor-pointer hover:scale-110 transition"
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>
        </div>

        {/* Size selection buttons */}
        <div className="">
          <div className="flex justify-end items-end gap-0">
            <button
              className={`text-black px-4 py-2 rounded transition ${
                selectedSize === "8x8" ? "bg-gray-300" : "hover:bg-gray-300"
              }`}
              onClick={() => handleSizeClick("8x8")}
            >
              <FaRegSquare className="inline mr-2" /> 8x8
            </button>
            <button
              className={`text-black px-4 py-2 rounded transition ${
                selectedSize === "12x12" ? "bg-gray-300" : "hover:bg-gray-300"
              }`}
              onClick={() => handleSizeClick("12x12")}
            >
              <FaTh className="inline mr-2" /> 12x12
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {allSwatches.map((color, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded border cursor-pointer hover:scale-110 transition ${
              hoveredColor === color ? "ring-2 ring-black" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
            onMouseEnter={() => handleColorHover(color)}
            onMouseLeave={handleColorLeave}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorEditor;
