import React, { useState, useRef, useEffect } from "react";
import { FaBed, FaUtensils, FaBath, FaStore, FaWarehouse } from "react-icons/fa";
import { MdCloseFullscreen, MdFullscreen } from "react-icons/md";

const environments = [
  { icon: <FaBed />, label: "bedroom", image: "/Images/react-project.png" },
  { icon: <FaUtensils />, label: "dining", image: "/envs/dining.jpg" },
  { icon: <FaWarehouse />, label: "kitchen", image: "/envs/kitchen.jpg" },
  { icon: <FaBath />, label: "bathroom", image: "/envs/bathroom.jpg" },
  { icon: <FaStore />, label: "store", image: "/envs/store.jpg" },
];

const groutColors = ["#ffffff", "#cccccc", "#333333"];
const thicknessLevels = ["none", "thin", "thick"];

const TileCanvasView = ({ selectedTile, selectedColor, selectedSize }) => {
  const [activeEnv, setActiveEnv] = useState("bedroom");
  const [groutColor, setGroutColor] = useState("#333333");
  const [thickness, setThickness] = useState("thin");
  const [tileColor, setTileColor] = useState(selectedColor || "#16A34A");
  const [isExpanded, setIsExpanded] = useState(false);
  const canvasRef = useRef(null);
  
  // Calculate tile size based on selected size
  const getTileSize = () => {
    switch(selectedSize) {
      case "8x8": return 40;
      case "12x12": return 30;
      default: return 50;
    }
  };
  
  const tileSize = getTileSize();
  const rows = 6;
  const cols = 6;

  // Update tile color when selected color changes
  useEffect(() => {
    if (selectedColor) {
      setTileColor(selectedColor);
    }
  }, [selectedColor]);

  // Draw tile canvas on change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = cols * tileSize;
    canvas.height = rows * tileSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if selected tile has one
    if (selectedTile?.img) {
      const img = new Image();
      img.src = selectedTile.img;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Draw color overlay after image loads
        drawColorOverlay(ctx);
      };
    } else {
      // If no image, just draw the color overlay
      drawColorOverlay(ctx);
    }
  }, [tileColor, groutColor, thickness, selectedTile, tileSize]);

  const drawColorOverlay = (ctx) => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        ctx.fillStyle = tileColor;
        ctx.globalAlpha = 0.7; // Make color overlay semi-transparent
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        ctx.globalAlpha = 1.0;

        if (thickness !== "none") {
          ctx.strokeStyle = groutColor;
          ctx.lineWidth = thickness === "thin" ? 1 : 3;
          ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
        }
      }
    }
  };

  const currentEnv = environments.find((env) => env.label === activeEnv);

  return (
    <div className={`max-w-4xl mx-auto p-4 ${isExpanded ? "h-screen" : ""}`}>
      <h2 className="text-center text-xl tracking-widest mb-2">TILE VISUALIZER</h2>
      <hr className="mb-4" />

      <div className="relative mb-6">
        <img
          src={currentEnv.image}
          alt="Room preview"
          className={`w-full object-cover rounded shadow ${isExpanded ? "h-full" : ""}`}
        />
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 w-full h-full opacity-70 pointer-events-none ${isExpanded ? "h-full" : ""}`}
        />
        
        <button
          className="absolute top-2 right-2 text-white bg-black p-1 rounded"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <MdCloseFullscreen size={20} /> : <MdFullscreen size={20} />}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
