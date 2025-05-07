import React, { useState, useEffect } from "react";
import { FaBed, FaUtensils, FaBath, FaStore, FaWarehouse } from "react-icons/fa";
import { MdCloseFullscreen, MdFullscreen } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import SaveButton from "./buttons/SaveButton";
import ShopButton from "./buttons/ShopButton";
import TileModal from "./TileModals";

const environments = [
  { icon: <FaBed />, label: "bedroom", image: "/Images/bedroomjpg.png" },
  { icon: <FaUtensils />, label: "dining", image: "/Images/livingjpg.png" },
  { icon: <FaWarehouse />, label: "kitchen", image: "/Images/kitchen.png" },
  { icon: <FaBath />, label: "bathroom", image: "/Images/env/bathroom.png" },
  { icon: <FaStore />, label: "store", image: "/Images/commercial_old.png" },
];

const groutColors = ["#ffffff", "#cccccc", "#333333"];
const thicknessLevels = ["none", "thin", "thick"];

const TileCanvasView = ({ selectedTile, selectedColor, selectedSize }) => {
  const [activeEnv, setActiveEnv] = useState(() => {
    const savedEnv = localStorage.getItem('activeEnv');
    return savedEnv || null;
  });
  
  const [groutColor, setGroutColor] = useState(() => {
    const savedGroutColor = localStorage.getItem('groutColor');
    return savedGroutColor || "#333333";
  });
  
  const [thickness, setThickness] = useState(() => {
    const savedThickness = localStorage.getItem('thickness');
    return savedThickness || "thin";
  });
  
  const [tileColor, setTileColor] = useState(selectedColor || "#16A34A");
  const [isExpanded, setIsExpanded] = useState(false);
  const [overlayColor, setOverlayColor] = useState("transparent");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultTile = { img: "/Images/tiles.jpg" };
  const currentTile = selectedTile?.img ? selectedTile : null;

  // Save to localStorage whenever these states change
  useEffect(() => {
    localStorage.setItem('activeEnv', activeEnv);
  }, [activeEnv]);

  useEffect(() => {
    localStorage.setItem('groutColor', groutColor);
  }, [groutColor]);

  useEffect(() => {
    localStorage.setItem('thickness', thickness);
  }, [thickness]);

  useEffect(() => {
    if (selectedColor) {
      setTileColor(selectedColor);
    }
  }, [selectedColor]);

  const currentEnv = environments.find((env) => env.label === activeEnv);

  const sizeToPx = {
    "8x8": "80px 80px",
    "12x12": "120px 120px",
    "16x16": "160px 160px",
  };
  const tileBgSize = sizeToPx[selectedSize] || "100px 100px";

  const thicknessToPx = {
    none: "0px",
    thin: "2px",
    thick: "6px",
  };
  const groutThicknessPx = thicknessToPx[thickness] || "2px";
  const tileSizePx = tileBgSize.split(" ")[0] || "100px";

  const handleSave = () => {
    setIsModalOpen(true);
  };

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
            minHeight: "200px",
          }}
        >
          {/* Show tiles only if selected */}
          {currentTile && (
            <>
              {/* Tile pattern */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${currentTile.img})`,
                  backgroundSize: tileBgSize,
                  backgroundRepeat: "repeat",
                  backgroundPosition: "center",
                  opacity: overlayColor !== "transparent" ? 0.7 : 1,
                  zIndex: 1,
                  backgroundColor: tileColor,
                }}
              />
              {/* Grout overlay */}
              {thickness !== "none" && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: "none",
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
                    backgroundRepeat: "repeat",
                    backgroundPosition: "center",
                    opacity: 1,
                  }}
                />
              )}
            </>
          )}

          {/* Show environment image whenever selected */}
          {currentEnv && (
            <>
              <img
                src={currentEnv.image}
                alt="Room preview"
                className="w-full h-full object-cover"
                style={{
                  position: "relative",
                  mixBlendMode: overlayColor !== "transparent" ? "multiply" : "normal",
                  backgroundColor: overlayColor,
                  zIndex: currentTile ? 3 : 1,
                }}
              />
              <button
                onClick={() => setActiveEnv(null)}
                className="absolute top-3 right-3 bg-black bg-opacity-70 text-white rounded-full p-1 z-50"
              >
                <IoMdClose size={20} />
              </button>
            </>
          )}
        </div>

        <button
          className="absolute bottom-2 right-2 text-white bg-black p-1 rounded z-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <MdCloseFullscreen size={20} /> : <MdFullscreen size={20} />}
        </button>
      </div>

      {/* Expanded View Popup */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-lg overflow-hidden">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setIsExpanded(false)}
                className="bg-black bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90 transition"
              >
                <MdCloseFullscreen size={24} />
              </button>
            </div>
            <div className="relative" style={{ minHeight: "200px" }}>
              {/* Show tiles only if selected */}
              {currentTile && (
                <>
                  {/* Tile pattern */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${currentTile.img})`,
                      backgroundSize: tileBgSize,
                      backgroundRepeat: "repeat",
                      backgroundPosition: "center",
                      opacity: overlayColor !== "transparent" ? 0.7 : 1,
                      zIndex: 1,
                      backgroundColor: tileColor,
                    }}
                  />
                  {/* Grout overlay */}
                  {thickness !== "none" && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: "none",
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
                        backgroundRepeat: "repeat",
                        backgroundPosition: "center",
                        opacity: 1,
                      }}
                    />
                  )}
                </>
              )}

              {/* Show environment image whenever selected */}
              {currentEnv && (
                <img
                  src={currentEnv.image}
                  alt="Room preview"
                  className="w-full h-full object-cover"
                  style={{
                    position: "relative",
                    mixBlendMode: overlayColor !== "transparent" ? "multiply" : "normal",
                    backgroundColor: overlayColor,
                    zIndex: currentTile ? 3 : 1,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Environment Selection */}
      <div className="mb-6">
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

      {/* Grout Controls */}
      <div className="flex gap-6 mb-6">
        {/* Grout Color */}
        <div className="flex-1">
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
        <div className="flex-1">
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

      {/* Action Buttons */}
      <div className="flex gap-4 mt-10">
        <SaveButton onSave={handleSave} />
        <ShopButton />
      </div>

      {/* TileModal */}
      <TileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tileConfig={{
          tile: currentTile,
          color: tileColor,
          size: selectedSize,
          groutColor,
          thickness,
          environment: currentEnv ? {
            label: currentEnv.label,
            image: currentEnv.image
          } : null
        }}
      />
    </div>
  );
};

export default TileCanvasView;
