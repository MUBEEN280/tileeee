import React, { useState, useEffect, useRef } from "react";
import { FaBed, FaUtensils, FaBath, FaStore, FaWarehouse } from "react-icons/fa";
import { MdCloseFullscreen, MdFullscreen } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { IoGridSharp } from "react-icons/io5";
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
  blockRotations = [0, 0, 0, 0]
}) => {
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
  const [loadedImages, setLoadedImages] = useState(new Map());

  const canvasRef = useRef(null);
  const expandedCanvasRef = useRef(null);

  const currentEnv = environments.find((env) => env.label === activeEnv);

  const sizeToPx = {
    "8x8": 8,    // 8 inches
    "12x12": 12, // 12 inches
  };

  // Convert size to pixels for display
  const getTileSizeInPx = (size) => {
    const inches = sizeToPx[size] || 12;
    // Reverse the scale - larger number for smaller tiles
    // 8x8 should be largest, 16x16 should be smallest
    const scale = 96 - (inches * 4); // This will give us 64px for 8x8, 48px for 12x12, 
    return `${scale}px`;
  };

  // Get the actual pixel size for the current tile
  const tileBgSize = getTileSizeInPx(localSize);
  const tileSizePx = tileBgSize;

  const thicknessToPx = {
    none: "0px",
    thin: "2px",
    thick: "6px",
  };
  const groutThicknessPx = thicknessToPx[localThickness] || "2px";

  // Function to load and cache images
  const loadImage = (src) => {
    if (loadedImages.has(src)) {
      return Promise.resolve(loadedImages.get(src));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        loadedImages.set(src, img);
        resolve(img);
      };

      img.onerror = (e) => {
        console.error('Error loading image:', src, e);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  };

  // Function to draw tiles on a canvas
  const drawTilesOnCanvas = async (canvas, ctx) => {
    if (!canvas || !selectedTile) return;

    // Always use a 2x2 grid for the environment view
    const gridSize = 2;
    const tileSize = canvas.width / gridSize;

    // Helper to get transformOrigin for each block
    const getTransformOrigin = (blockIndex) => {
      return [
        blockIndex % 2 === 0 ? 0 : 1, // x: 0 for left, 1 for right
        blockIndex < 2 ? 0 : 1        // y: 0 for top, 1 for bottom
      ];
    };

    // Draw tiles in a 2x2 grid pattern
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col * tileSize;
        const y = row * tileSize;
        const blockIndex = row * gridSize + col;

        // Calculate transform origin for this block
        const [originX, originY] = getTransformOrigin(blockIndex);

        // Draw base tile with scale(2) and correct origin, plus rotation
        if (selectedTile.image) {
          try {
            let baseImage = null;
            baseImage = await loadImage(selectedTile.image);

            ctx.save();
            // Move to the block's top-left corner
            ctx.translate(x, y);
            // Move to the transform origin within the block
            ctx.translate(originX * tileSize, originY * tileSize);
            // Apply rotation
            ctx.rotate((blockRotations[blockIndex] * Math.PI) / 180);
            // Move back by the origin
            ctx.translate(-originX * tileSize, -originY * tileSize);
            // Scale up by 2x
            ctx.scale(2, 2);
            // Draw the image so that only the relevant quadrant is visible
            ctx.drawImage(baseImage, 0, 0, tileSize, tileSize);
            ctx.restore();
          } catch (error) {
            console.error('Failed to load base tile image:', error);
          }
        }

        // Load mask images
        const maskImages = [];
        if (tileMasks && tileMasks.length > 0) {
          for (const mask of tileMasks) {
            if (mask.image) {
              try {
                const maskImg = await loadImage(mask.image);
                maskImages.push({ image: maskImg, mask });
              } catch (error) {
                console.error('Failed to load mask image:', error);
              }
            }
          }
        }

        // Draw masks with the same logic
        maskImages.forEach(({ image, mask }) => {
          ctx.save();
          ctx.translate(x, y);
          ctx.translate(originX * tileSize, originY * tileSize);
          ctx.rotate((blockRotations[blockIndex] * Math.PI) / 180);
          ctx.translate(-originX * tileSize, -originY * tileSize);
          ctx.scale(2, 2);
          ctx.globalCompositeOperation = 'source-in';
          ctx.drawImage(image, 0, 0, tileSize, tileSize);
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = mask.color;
          ctx.fillRect(0, 0, tileSize, tileSize);
          ctx.restore();
        });

        // Draw grout with proper scaling (optional for 2x2)
        if (localThickness !== "none") {
          const groutWidth = parseInt(groutThicknessPx);
          ctx.fillStyle = localGroutColor;
          // Vertical grout
          ctx.fillRect(x - groutWidth / 2, y, groutWidth, tileSize);
          // Horizontal grout
          ctx.fillRect(x, y - groutWidth / 2, tileSize, groutWidth);
        }
      }
    }

    // Add size indicator with more visible styling
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`${sizeToPx[selectedSize] || 12}" x ${sizeToPx[selectedSize] || 12}"`, 20, 40);
    ctx.restore();

  };

  // Effect to draw on main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to maintain aspect ratio
    canvas.width = 500;
    canvas.height = 500;

    drawTilesOnCanvas(canvas, ctx);
  }, [selectedTile, selectedColor, selectedSize, localThickness, localGroutColor, tileMasks]);

  // Effect to draw on expanded canvas
  useEffect(() => {
    if (isExpanded) {
      const canvas = expandedCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 800;

      drawTilesOnCanvas(canvas, ctx);
    }
  }, [isExpanded, selectedTile, selectedColor, localSize, localThickness, localGroutColor, tileMasks]);

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
      <h2 className="text-center lg:text-left font-light font-poppins  text-xl tracking-widest mb-2">TILE VISUALIZER</h2>
      <div className="relative mb-6">
        <div
          className={`w-full rounded shadow ${isExpanded ? "h-full" : ""}`}
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "200px"
          }}
        >
          {/* Original Tile Image */}
          {selectedTile && (
            <div className="relative w-full max-h-[500px]">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain bg-gray-100"
              />

              {/* Mask Layers */}
              {tileMasks && tileMasks.map(mask => (
                <div
                  key={mask.id}
                  className="absolute inset-0"
                  style={{
                    backgroundColor: mask.color,
                    maskImage: `url(${mask.image})`,
                    WebkitMaskImage: `url(${mask.image})`,
                    maskSize: tileBgSize,
                    WebkitMaskSize: tileBgSize,
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    maskRepeat: 'repeat',
                    WebkitMaskRepeat: 'repeat',
                    mixBlendMode: 'source-in',
                    zIndex: 1
                  }}
                />
              ))}

              {/* Border Mask Layers */}
              {selectedBorder && borderMasks && borderMasks.map(mask => (
                <div
                  key={mask.maskId}
                  className="absolute inset-0"
                  style={{
                    backgroundColor: mask.color,
                    maskImage: `url(${mask.image})`,
                    WebkitMaskImage: `url(${mask.image})`,
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

              {/* Updated Grout overlay */}
              {localThickness !== "none" && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: "none",
                    backgroundImage: `
                      repeating-linear-gradient(
                        to right,
                        ${localGroutColor},
                        ${localGroutColor} ${groutThicknessPx},
                        transparent ${groutThicknessPx},
                        transparent ${tileSizePx}
                      ),
                      repeating-linear-gradient(
                        to bottom,
                        ${localGroutColor},
                        ${localGroutColor} ${groutThicknessPx},
                        transparent ${groutThicknessPx},
                        transparent ${tileSizePx}
                      )
                    `,
                    backgroundSize: `${tileSizePx} ${tileSizePx}`,
                    backgroundRepeat: "repeat",
                    backgroundPosition: "center",
                    opacity: 1,
                    zIndex: 2
                  }}
                />
              )}
            </div>
          )}

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
                className="absolute top-3 right-3 bg-black bg-opacity-70 text-white rounded-full p-1 z-50 hover:ring-2 hover:ring-red-500 hover:shadow-md hover:shadow-red-500 transition-all duration-300 ease-in-out"
              >
                <IoMdClose size={20} />
              </button>
            </>
          )}
        </div>

        <button
          className="absolute bottom-2 right-2 text-white bg-black p-1 rounded z-50 hover:ring-2 hover:ring-red-500 hover:shadow-md hover:shadow-red-500 transition-all duration-300 ease-in-out"
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
                className="bg-black bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90 transition "
              >
                <MdCloseFullscreen size={20} />
              </button>
            </div>
            <div className="relative" style={{ minHeight: "500px" }}>
              {/* Tile image and overlays as full background */}
              <div className="relative w-full h-full" style={{ minHeight: "500px" }}>
                {/* Mask Layers */}
                {tileMasks && tileMasks.map(mask => (
                  <div
                    key={mask.id}
                    className="absolute inset-0"
                    style={{
                      backgroundColor: mask.color,
                      maskImage: `url(${mask.image})`,
                      WebkitMaskImage: `url(${mask.image})`,
                      maskSize: tileBgSize,
                      WebkitMaskSize: tileBgSize,
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                      maskRepeat: 'repeat',
                      WebkitMaskRepeat: 'repeat',
                      mixBlendMode: 'source-in',
                      opacity: 0.8,
                      zIndex: 1
                    }}
                  />
                ))}
                {/* Grout overlay */}
                {localThickness !== "none" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: "none",
                      backgroundImage: `
                  repeating-linear-gradient(
                    to right,
                    ${localGroutColor},
                    ${localGroutColor} ${groutThicknessPx},
                    transparent ${groutThicknessPx},
                    transparent ${tileSizePx}
                  ),
                  repeating-linear-gradient(
                    to bottom,
                    ${localGroutColor},
                    ${localGroutColor} ${groutThicknessPx},
                    transparent ${groutThicknessPx},
                    transparent ${tileSizePx}
                  )
                `,
                      backgroundSize: `${tileSizePx} ${tileSizePx}`,
                      backgroundRepeat: "repeat",
                      backgroundPosition: "center",
                      opacity: 1,
                      zIndex: 2
                    }}
                  />
                )}
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
                      className="absolute top-3 right-3 bg-black bg-opacity-70 text-white rounded-full p-1 z-50  hover:ring-2 hover:ring-red-500 hover:shadow-md hover:shadow-red-500 transition-all duration-300 ease-in-out"
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
                className={`p-3 border text-2xl sm:text-3xl hover:bg-black hover:text-white hover:ring-2 hover:ring-red-500 hover:rounded-md hover:shadow-md hover:shadow-red-500 transition-all duration-300 ease-in-out ${activeEnv === env.label ? "bg-black text-white border border-red-500 rounded-md shadow-md shadow-red-500" : "bg-white text-black"
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
            {Object.keys(sizeToPx).map((size) => {
              let Icon;
              switch (size) {
                case "8x8":
                  Icon = IoGridSharp;
                  break;
                case "12x12":
                  Icon = IoGridSharp;
                  break;
                default:
                  Icon = null;
              }

              // Conditional classes for scaling
              const isSelected = localSize === size;
              const isLarge = size === "12x12";
              const baseClasses =
                " px-3 py-1  tracking-wide flex flex-col items-center gap-1 hover:bg-black hover:text-white hover:ring-2 hover:ring-red-500 hover:rounded-md hover:shadow-md hover:shadow-red-500 transition-all duration-300 ease-in-out";
              const textSize = isLarge ? "text-sm font-light font-poppins" : "text-xs font-light font-poppins"; // larger text for 12x12
              const iconSize = isLarge ? 30 : 22; // larger icon for 12x12
              return (
                <button
                  key={size}
                  onClick={() => setLocalSize(size)}
                  className={`${baseClasses} ${textSize} ${isSelected ? "bg-black text-white border border-red-500 rounded-md shadow-md shadow-red-500" : "bg-white text-black"
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
          <div className="text-sm  mb-2 tracking-wider font-light font-poppins">GROUT COLOR:</div>
          <div className="flex gap-4">
            {groutColors.map((color, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full border cursor-pointer hover:ring-1 hover:ring-red-500 transition-all duration-300 ease-in-out ${localGroutColor === color ? "ring-2 ring-red-500" : ""
                  }`}
                style={{ backgroundColor: color }}
                onClick={() => setLocalGroutColor(color)}
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
                className={`border px-3 py-1 uppercase text-xs tracking-wide font-light font-poppins hover:bg-black hover:text-white hover:ring-1 hover:ring-red-500 hover:rounded-md hover:shadow-md hover:shadow-red-500 transition-all duration-300 ease-in-out ${localThickness === level ? "bg-black text-white border border-red-500 rounded-md shadow-md shadow-red-500" : "bg-white text-black"
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
