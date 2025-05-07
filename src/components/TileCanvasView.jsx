import React, { useState, useEffect } from "react";
import { FaBed, FaUtensils, FaBath, FaStore, FaWarehouse } from "react-icons/fa";
import { MdCloseFullscreen, MdFullscreen } from "react-icons/md";

const environments = [
  {
    icon: <FaBed />,
    label: "bedroom",
    image: "/Images/bedroomjpg.png",
  },
  {
    icon: <FaUtensils />,
    label: "dining",
    image: "/Images/livingjpg.png",
  },
  {
    icon: <FaWarehouse />,
    label: "kitchen",
    image: "/Images/kitchen.png",
  },
  {
    icon: <FaBath />,
    label: "bathroom",
    image: "/Images/env/bathroom.png",
  },
  {
    icon: <FaStore />,
    label: "store",
    image: "/Images/commercial_old.png",
  },
];

const groutColors = ["#ffffff", "#cccccc", "#333333"];
const thicknessLevels = ["none", "thin", "thick"];
const tileShapes = ["rectangle", "hexagon"];
const backgroundColors = ["transparent", "#ffffff", "#f0f0f0", "#333333"];

const TileCanvasView = ({ selectedTile, selectedColor, selectedSize }) => {
  const [activeEnv, setActiveEnv] = useState("bedroom");
  const [groutColor, setGroutColor] = useState("#333333");
  const [thickness, setThickness] = useState("thin");
  const [tileColor, setTileColor] = useState(selectedColor || "#16A34A");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedShape, setSelectedShape] = useState("rectangle");
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [overlayColor, setOverlayColor] = useState("transparent");

  // Fallback tile image if not passed from parent
  const defaultTile = { img: "/Images/tiles.jpg" };
  const currentTile = selectedTile?.img ? selectedTile : defaultTile;

  useEffect(() => {
    if (selectedColor) {
      setTileColor(selectedColor);
    }
  }, [selectedColor]);

  const currentEnv = environments.find((env) => env.label === activeEnv);

  // Helper to map selectedSize to pixel values
  const sizeToPx = {
    '8x8': '80px 80px',
    '12x12': '120px 120px',
    '16x16': '160px 160px',
    // Add more mappings as needed
  };
  const tileBgSize = sizeToPx[selectedSize] || '100px 100px';

  // Helper to map thickness to pixel value
  const thicknessToPx = {
    'none': '0px',
    'thin': '2px',
    'thick': '6px',
  };
  const groutThicknessPx = thicknessToPx[thickness] || '2px';

  // Extract tile size in px (assume square for simplicity)
  const tileSizePx = (tileBgSize.split(' ')[0] || '100px');

  return (
    <div className={`max-w-4xl mx-auto p-4 ${isExpanded ? "h-screen" : ""}`}>
      <h2 className="text-center text-xl tracking-widest mb-2">TILE VISUALIZER</h2>
      <hr className="mb-4" />

      <div className="relative mb-6">
        <div
          className={`w-full rounded shadow ${isExpanded ? "h-full" : ""}`}
          style={{
            position: "relative",
            overflow: "hidden",
            backgroundColor: backgroundColor !== "transparent" ? backgroundColor : "transparent",
          }}
        >
          {/* Tile pattern background */}
          {selectedTile?.img && (
            <>
              {/* Tile pattern background */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${currentTile.img})`,
                  backgroundSize: tileBgSize,
                  backgroundRepeat: 'repeat',
                  backgroundPosition: 'center',
                  opacity: overlayColor !== "transparent" ? 0.7 : 1,
                  zIndex: 1
                }}
              />
              {/* Grout lines overlay */}
              {thickness !== 'none' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 2,
                    backgroundImage: `
                      repeating-linear-gradient(
                        to right,
                        ${groutColor},
                        ${groutColor} ${groutThicknessPx},
                        transparent ${groutThicknessPx},
                        transparent ${tileSizePx}
                      ),
                      repeating-linear-gradient(
                        to bottom,
                        ${groutColor},
                        ${groutColor} ${groutThicknessPx},
                        transparent ${groutThicknessPx},
                        transparent ${tileSizePx}
                      )
                    `,
                    backgroundSize: tileBgSize,
                    backgroundRepeat: 'repeat',
                    backgroundPosition: 'center',
                    opacity: 1,
                  }}
                />
              )}
            </>
          )}
          
          {/* Environment image overlay */}
          <img
            src={currentEnv.image}
            alt="Room preview"
            className="w-full h-full object-cover"
            style={{
              position: 'relative',
              mixBlendMode: overlayColor !== "transparent" ? "multiply" : "normal",
              backgroundColor: overlayColor,
              zIndex: 2
            }}
          />
        </div>

        <button
          className="absolute top-2 right-2 text-white bg-black p-1 rounded"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <MdCloseFullscreen size={20} /> : <MdFullscreen size={20} />}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Environment Select */}
        <div>
          <div className="text-sm font-medium mb-2 tracking-wider">CHOOSE ENVIRONMENT:</div>
          <div className="flex items-center gap-4 flex-wrap">
            {environments.map((env) => (
              <button
                key={env.label}
                className={`p-3 border text-xl ${
                  activeEnv === env.label ? "bg-black text-white" : "bg-white text-black"
                } rounded`}
                onClick={() => setActiveEnv(env.label)}
              >
                {env.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Tile Color */}
        <div>
          <div className="text-sm font-medium mb-2 tracking-wider">TILE COLOR:</div>
          <input
            type="color"
            value={tileColor}
            onChange={(e) => setTileColor(e.target.value)}
            className="w-24 h-10 p-0 border"
          />
        </div>

        {/* Background Color */}
        <div>
          <div className="text-sm font-medium mb-2 tracking-wider">BACKGROUND COLOR:</div>
          <div className="flex gap-2">
            {backgroundColors.map((color, index) => (
              <button
                key={index}
                onClick={() => setBackgroundColor(color)}
                className={`border px-3 py-1 uppercase text-xs tracking-wide ${
                  backgroundColor === color ? "bg-black text-white" : "bg-white text-black"
                }`}
                style={color !== "transparent" ? { backgroundColor: color } : {}}
              >
                {color === "transparent" ? "none" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Overlay Color */}
        <div>
          <div className="text-sm font-medium mb-2 tracking-wider">OVERLAY EFFECT:</div>
          <input
            type="color"
            value={overlayColor}
            onChange={(e) => setOverlayColor(e.target.value)}
            className="w-24 h-10 p-0 border"
          />
          <button 
            className="ml-2 border px-2 py-1 text-xs uppercase"
            onClick={() => setOverlayColor("transparent")}
          >
            Clear
          </button>
        </div>

        {/* Grout Color */}
        <div>
          <div className="text-sm font-medium mb-2 tracking-wider">GROUT COLOR:</div>
          <div className="flex gap-4">
            {groutColors.map((color, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full border cursor-pointer ${
                  groutColor === color ? "ring-2 ring-black" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setGroutColor(color)}
              />
            ))}
          </div>
        </div>

        {/* Grout Thickness */}
        <div>
          <div className="text-sm font-medium mb-2 tracking-wider">GROUT THICKNESS:</div>
          <div className="flex gap-2">
            {thicknessLevels.map((level) => (
              <button
                key={level}
                onClick={() => setThickness(level)}
                className={`border px-3 py-1 uppercase text-xs tracking-wide ${
                  thickness === level ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Tile Shape */}
        <div>
          <div className="text-sm font-medium mb-2 tracking-wider">TILE SHAPE:</div>
          <div className="flex gap-2">
            {tileShapes.map((shape) => (
              <button
                key={shape}
                onClick={() => setSelectedShape(shape)}
                className={`border px-3 py-1 uppercase text-xs tracking-wide ${
                  selectedShape === shape ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          className="bg-black text-white px-6 py-2 uppercase text-sm"
          onClick={() => alert("Configuration saved!")}
        >
          Save
        </button>
        <button className="bg-white border border-black px-6 py-2 uppercase text-sm hover:bg-black hover:text-white transition">
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default TileCanvasView;