import React, { useState, useEffect } from "react";
import { FaBed, FaUtensils, FaBath, FaStore, FaWarehouse } from "react-icons/fa";
import { MdCloseFullscreen, MdFullscreen } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { IoGridSharp } from "react-icons/io5";
import SaveButton from "./buttons/SaveButton";
import ShopButton from "./buttons/ShopButton";
import TileModal from "./TileModals";
import { useTileSimulator } from "../context/TileSimulatorContext";

const environments = [
  { icon: <FaBed />, label: "bedroom", image: "/Images/bedroomjpg.png" },
  { icon: <FaUtensils />, label: "dining", image: "/Images/livingjpg.png" },
  { icon: <FaWarehouse />, label: "kitchen", image: "/Images/kitchen.png" },
  { icon: <FaBath />, label: "bathroom", image: "/Images/env/bathroom.png" },
  { icon: <FaStore />, label: "store", image: "/Images/commercial_old.png" },
];

const groutColors = ["#ffffff", "#cccccc", "#333333", "#FF0000",];
const thicknessLevels = ["none", "thin", "thick"];

const TileCanvasView = ({
  selectedTile,
  selectedColor,
  selectedSize,
  selectedEnvironment,
  groutColor: propGroutColor,
  groutThickness: propGroutThickness,
  tileMasks,
  borderMasks,
  selectedBorder,
}) => {
  const { blockRotations } = useTileSimulator();

  const [activeEnv, setActiveEnv] = useState(() => {
    const savedEnv = localStorage.getItem('activeEnv');
    return savedEnv || null;
  });

  const [localGroutColor, setLocalGroutColor] = useState(() => {
    const savedGroutColor = localStorage.getItem('groutColor');
    return savedGroutColor || "#333333";
  });

  const [localThickness, setLocalThickness] = useState(() => {
    const savedThickness = localStorage.getItem('thickness');
    return savedThickness || "thin";
  });

  const [localSize, setLocalSize] = useState(() => {
    const savedSize = localStorage.getItem('tileSize');
    return (savedSize === "8x8" || savedSize === "12x12") ? savedSize : "12x12";
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentEnv = environments.find((env) => env.label === activeEnv);

  // Calculate grid size based on selected size
  const gridSize = localSize === "8x8" ? 8 : 12;
  const totalTiles = gridSize * gridSize;

  // Calculate container dimensions
  const containerWidth = 1200;
  const containerHeight = 600; 

  // Calculate tile size in pixels
  const getTileSizeInPx = (size) => {
    const baseSize = size === "8x8" ? 8 : 12;
    const containerWidth = 1200; // Base container width
    const tileSize = containerWidth / baseSize;
    return `${tileSize}px`;
  };

  const tileSizePx = getTileSizeInPx(localSize);

  const thicknessToPx = {
    none: "0px",
    thin: "2px",
    thick: "6px",
  };
  const groutThicknessPx = thicknessToPx[localThickness] || "2px";

  // Define 4 background positions for 2x2 split
  const tileStyles = [
    'bg-[0%_0%]',     // Top-left
    'bg-[100%_0%]',   // Top-right
    'bg-[0%_100%]',   // Bottom-left
    'bg-[100%_100%]', // Bottom-right
  ];

  const handleSave = () => {
    setIsModalOpen(true);
  };

  if (!selectedTile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-center lg:text-left font-light font-poppins text-xl tracking-widest mb-2">TILE VISUALIZER</h2>
        <div className="text-center lg:text-left font-light font-poppins text-gray-500">
          Please select a tile to preview
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto lg:mx-0 p-1 ${isExpanded ? "h-screen" : ""}`}>
      <h2 className="text-center lg:text-left font-light font-poppins text-xl tracking-widest mb-2">TILE VISUALIZER</h2>
      <div className="relative mb-6">
        <div
          className={`w-full rounded shadow ${isExpanded ? "h-full" : ""}`}
          style={{
            position: "relative",
            overflow: "hidden",
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
            maxWidth: "100%",
            margin: "0 auto"
          }}
        >
          {/* Tile Grid Container */}
          <div className="relative" style={{ minHeight: "500px" }}>
            <div className="relative w-full h-full" style={{ minHeight: "500px" }}>
              <div
                className="grid bg-white"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  gap: localThickness !== "none" ? groutThicknessPx : "0px",
                  width: "100%",
                  height: "100%",
                  backgroundColor: localGroutColor,
                }}
              >
                {Array.from({ length: totalTiles }).map((_, index) => {
                  const patternIndex = (index % 2) + 2 * (Math.floor(index / gridSize) % 2);
                  const bgPos = tileStyles[patternIndex];

                  // Calculate the block index for rotation (0-3 for each 2x2 block)
                  const blockIndex = (index % 2) + 2 * (Math.floor((index % gridSize) / 2) + Math.floor(index / (gridSize * 2)) * 2);

                  return (
                    <div
                      key={index}
                      className="relative bg-white"
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                      }}
                    >
                      {/* Base Tile */}
                      <div
                        className="absolute inset-0"
                        style={{
                          transform: `rotate(${blockRotations[blockIndex % 4] || 0}deg)`,
                          transition: "transform 0.3s ease-in-out",
                        }}
                      >
                        {selectedTile?.image && (
                          <img
                            src={selectedTile.image}
                            alt={`Tile Block ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                              transform: `scale(2)`,
                              transformOrigin: `${index % 2 === 0 ? '0' : '100%'} ${index < gridSize ? '0' : '100%'}`,
                            }}
                          />
                        )}

                        {/* Tile Masks */}
                        {tileMasks?.map((mask) => (
                          <div
                            key={mask.id}
                            className="absolute inset-0"
                            style={{
                              backgroundColor: mask.color,
                              maskImage: mask.image ? `url(${mask.image})` : 'none',
                              WebkitMaskImage: mask.image ? `url(${mask.image})` : 'none',
                              maskSize: "cover",
                              WebkitMaskSize: "cover",
                              maskPosition: "center",
                              WebkitMaskPosition: "center",
                              maskRepeat: "no-repeat",
                              WebkitMaskRepeat: "no-repeat",
                              transform: `scale(2)`,
                              transformOrigin: `${index % 2 === 0 ? '0' : '100%'} ${index < gridSize ? '0' : '100%'}`,
                              zIndex: 1,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Border Mask Layers */}
              {selectedBorder && borderMasks?.map(mask => (
                <div
                  key={mask.maskId}
                  className="absolute inset-0"
                  style={{
                    backgroundColor: mask.color,
                    maskImage: mask.image ? `url(${mask.image})` : 'none',
                    WebkitMaskImage: mask.image ? `url(${mask.image})` : 'none',
                    maskSize: '100%',
                    WebkitMaskSize: '100%',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    mixBlendMode: 'source-in',
                    zIndex: 3,
                    clipPath: 'polygon(0 0, 5% 0, 5% 5%, 0 5%, 0 0, 100% 0, 100% 5%, 95% 5%, 95% 0, 100% 0, 100% 100%, 95% 100%, 95% 95%, 100% 95%, 100% 100%, 0 100%, 0 95%, 5% 95%, 5% 100%, 0 100%)'
                  }}
                />
              ))}

              {/* Environment Image */}
              {currentEnv && (
                <>
                  <img
                    src={currentEnv.image}
                    alt="Room preview"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{
                      zIndex: 3
                    }}
                  />
                  <button
                    onClick={() => setActiveEnv(null)}
                    className="absolute top-3 right-3 bg-black bg-opacity-70 text-white rounded-full p-1 z-50 hover:ring-2 hover:ring-[#bd5b4c] hover:shadow-md hover:shadow-[#bd5b4c] transition-all duration-300 ease-in-out"
                  >
                    <IoMdClose size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          className="absolute bottom-2 right-2 text-white bg-black p-1 rounded z-50 hover:ring-2 hover:ring-[#bd5b4c] hover:shadow-md hover:shadow-[#bd5b4c] transition-all duration-300 ease-in-out"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <MdCloseFullscreen size={20} /> : <MdFullscreen size={20} />}
        </button>
      </div>

      {/* Expanded View Popup */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-lg overflow-hidden">
            <div className="absolute bottom-2 right-2 z-50">
              <button
                onClick={() => setIsExpanded(false)}
                className="bg-black bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90 transition"
              >
                <MdCloseFullscreen size={20} />
              </button>
            </div>
            <div className="relative" style={{ minHeight: "500px" }}>
              {/* Tile Grid Container */}
              <div className="relative w-full h-full" style={{ minHeight: "500px" }}>
                <div
                  className="grid bg-white"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    gap: localThickness !== "none" ? groutThicknessPx : "0px",
                    width: "100%",
                    height: "100%",
                    backgroundColor: localGroutColor,
                  }}
                >
                  {Array.from({ length: totalTiles }).map((_, index) => {
                    const patternIndex = (index % 2) + 2 * (Math.floor(index / gridSize) % 2);
                    const bgPos = tileStyles[patternIndex];

                    // Calculate the block index for rotation (0-3 for each 2x2 block)
                    const blockIndex = (index % 2) + 2 * (Math.floor((index % gridSize) / 2) + Math.floor(index / (gridSize * 2)) * 2);

                    return (
                      <div
                        key={index}
                        className="relative bg-white"
                        style={{
                          aspectRatio: "1 / 1",
                          width: "100%",
                          overflow: "hidden",
                        }}
                      >
                        {/* Base Tile */}
                        <div
                          className="absolute inset-0"
                          style={{
                            transform: `rotate(${blockRotations[blockIndex % 4] || 0}deg)`,
                            transition: "transform 0.3s ease-in-out",
                          }}
                        >
                          {selectedTile?.image && (
                            <img
                              src={selectedTile.image}
                              alt={`Tile Block ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-cover"
                              style={{
                                transform: `scale(2)`,
                                transformOrigin: `${index % 2 === 0 ? '0' : '100%'} ${index < gridSize ? '0' : '100%'}`,
                              }}
                            />
                          )}

                          {/* Tile Masks */}
                          {tileMasks?.map((mask) => (
                            <div
                              key={mask.id}
                              className="absolute inset-0"
                              style={{
                                backgroundColor: mask.color,
                                maskImage: mask.image ? `url(${mask.image})` : 'none',
                                WebkitMaskImage: mask.image ? `url(${mask.image})` : 'none',
                                maskSize: "cover",
                                WebkitMaskSize: "cover",
                                maskPosition: "center",
                                WebkitMaskPosition: "center",
                                maskRepeat: "no-repeat",
                                WebkitMaskRepeat: "no-repeat",
                                transform: `scale(2)`,
                                transformOrigin: `${index % 2 === 0 ? '0' : '100%'} ${index < gridSize ? '0' : '100%'}`,
                                zIndex: 1,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Border Mask Layers */}
                {selectedBorder && borderMasks?.map(mask => (
                  <div
                    key={mask.maskId}
                    className="absolute inset-0"
                    style={{
                      backgroundColor: mask.color,
                      maskImage: mask.image ? `url(${mask.image})` : 'none',
                      WebkitMaskImage: mask.image ? `url(${mask.image})` : 'none',
                      maskSize: '100%',
                      WebkitMaskSize: '100%',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      mixBlendMode: 'source-in',
                      zIndex: 3,
                      clipPath: 'polygon(0 0, 5% 0, 5% 5%, 0 5%, 0 0, 100% 0, 100% 5%, 95% 5%, 95% 0, 100% 0, 100% 100%, 95% 100%, 95% 95%, 100% 95%, 100% 100%, 0 100%, 0 95%, 5% 95%, 5% 100%, 0 100%)'
                    }}
                  />
                ))}

                {/* Environment Image */}
                {currentEnv && (
                  <>
                    <img
                      src={currentEnv.image}
                      alt="Room preview"
                      className="w-full h-full object-cover absolute inset-0"
                      style={{
                        zIndex: 3
                      }}
                    />
                    <button
                      onClick={() => setActiveEnv(null)}
                      className="absolute top-3 right-3 bg-black bg-opacity-70 text-white rounded-full p-1 z-50 hover:ring-2 hover:ring-[#bd5b4c] hover:shadow-md hover:shadow-[#bd5b4c] transition-all duration-300 ease-in-out"
                    >
                      <IoMdClose size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tile Size Selection & Environment Selection */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mt-6 mb-6">
        {/* Environment Selection */}
        <div className="p-2">
          <div className="text-sm font-light font-poppins mb-2 tracking-wider">CHOOSE ENVIRONMENT:</div>
          <div className="flex items-center gap-4 flex-wrap">
            {environments.map((env) => (
              <button
                key={env.label}
                className={`p-3 border text-2xl sm:text-3xl hover:bg-black hover:text-white hover:ring-2 hover:ring-[#bd5b4c] hover:rounded-md hover:shadow-md hover:shadow-[#bd5b4c] transition-all duration-300 ease-in-out ${activeEnv === env.label ? "bg-black text-white border border-[#bd5b4c] rounded-md shadow-md shadow-[#bd5b4c]" : "bg-white text-black"
                  } rounded`}
                onClick={() => setActiveEnv(env.label)}
              >
                {env.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Tile Size Selection */}
        <div className="pr-2">
          <br />
          <div className="flex gap-2">
            {["8x8", "12x12"].map((size) => {
              let Icon = IoGridSharp;

              // Conditional classes for scaling
              const isSelected = localSize === size;
              const isLarge = size === "12x12";
              const baseClasses =
                "px-3 py-1 tracking-wide flex flex-col items-center gap-1 hover:bg-black hover:text-white hover:ring-2 hover:ring-[#bd5b4c] hover:rounded-md hover:shadow-md hover:shadow-[#bd5b4c] transition-all duration-300 ease-in-out";
              const textSize = isLarge ? "text-sm font-light font-poppins" : "text-xs font-light font-poppins";
              const iconSize = isLarge ? 30 : 22;

              return (
                <button
                  key={size}
                  onClick={() => setLocalSize(size)}
                  className={`${baseClasses} ${textSize} ${isSelected
                      ? "bg-black text-white border border-[#bd5b4c] rounded-md shadow-md shadow-[#bd5b4c]"
                      : "bg-white text-black"
                    }`}
                >
                  {Icon && <Icon size={iconSize} />}
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grout Controls */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        {/* Grout Color */}
        <div className="">
          <div className="text-sm mb-2 tracking-wider font-light font-poppins">GROUT COLOR:</div>
          <div className="flex gap-4">
            {groutColors.map((color, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full border cursor-pointer hover:ring-1 hover:ring-[#bd5b4c] transition-all duration-300 ease-in-out ${localGroutColor === color ? "ring-2 ring-[#bd5b4c]" : ""
                  }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setLocalGroutColor(color);
                  localStorage.setItem('groutColor', color);
                }}
              />
            ))}
          </div>
        </div>

        {/* Grout Thickness */}
        <div className="">
          <div className="text-sm mb-2 tracking-wider font-light font-poppins">GROUT THICKNESS:</div>
          <div className="flex flex-wrap gap-2">
            {thicknessLevels.map((level) => (
              <button
                key={level}
                onClick={() => setLocalThickness(level)}
                className={`border px-3 py-1 uppercase text-xs tracking-wide font-light font-poppins hover:bg-black hover:text-white hover:ring-1 hover:ring-[#bd5b4c] hover:rounded-md hover:shadow-md hover:shadow-[#bd5b4c] transition-all duration-300 ease-in-out ${localThickness === level ? "bg-black text-white border border-[#bd5b4c] rounded-md shadow-md shadow-[#bd5b4c]" : "bg-white text-black"
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
          tile: selectedTile,
          color: selectedColor,
          size: localSize,
          groutColor: localGroutColor,
          thickness: localThickness,
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
