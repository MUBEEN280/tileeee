import React, { useState, useEffect, useRef } from "react";
import { FaBed, FaUtensils, FaBath, FaStore, FaWarehouse } from "react-icons/fa";
import { MdCloseFullscreen, MdFullscreen } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { BsGrid3X3, BsGrid3X3Gap, BsGrid3X3GapFill } from "react-icons/bs";
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

const groutColors = ["#ffffff", "#cccccc", "#333333","#FF0000",];
const thicknessLevels = ["none", "thin", "thick"];

const TileCanvasView = ({
  selectedTile,
  selectedColor,
  selectedSize,
  selectedEnvironment,
  groutColor: propGroutColor,
  groutThickness: propGroutThickness,
  tileMasks
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
    return savedSize || "12x12";
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
    "16x16": 16  // 16 inches
  };

  // Convert size to pixels for display
  const getTileSizeInPx = (size) => {
    const inches = sizeToPx[size] || 12;
    // Reverse the scale - larger number for smaller tiles
    // 8x8 should be largest, 16x16 should be smallest
    const scale = 96 - (inches * 4); // This will give us 64px for 8x8, 48px for 12x12, 32px for 16x16
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

    // Get the actual size in inches
    const sizeInInches = sizeToPx[selectedSize] || 12;
    
    // Reverse the grid size logic
    // Smaller tiles (16x16) should show more tiles, larger tiles (8x8) should show fewer
    const gridSize = Math.max(2, Math.ceil(sizeInInches / 4));
    const tileSize = canvas.width / gridSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Load base tile image
      let baseImage = null;
      if (selectedTile.image) {
        try {
          baseImage = await loadImage(selectedTile.image);
        } catch (error) {
          console.error('Failed to load base tile image:', error);
          return;
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

      // Draw tiles in a grid pattern
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const x = col * tileSize;
          const y = row * tileSize;

          // Draw base tile with proper scaling
          if (baseImage) {
            ctx.save();
            // Maintain aspect ratio while scaling
            const scale = Math.min(tileSize / baseImage.width, tileSize / baseImage.height);
            const scaledWidth = baseImage.width * scale;
            const scaledHeight = baseImage.height * scale;
            
            const offsetX = (tileSize - scaledWidth) / 2;
            const offsetY = (tileSize - scaledHeight) / 2;
            
            ctx.drawImage(baseImage, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
            ctx.restore();
          }

          // Draw masks with proper scaling
          maskImages.forEach(({ image, mask }) => {
            ctx.save();
            const scale = Math.min(tileSize / image.width, tileSize / image.height);
            const scaledWidth = image.width * scale;
            const scaledHeight = image.height * scale;
            const offsetX = (tileSize - scaledWidth) / 2;
            const offsetY = (tileSize - scaledHeight) / 2;

            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(image, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = mask.color;
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.restore();
          });

          // Draw grout with proper scaling
          if (localThickness !== "none") {
            const groutWidth = parseInt(groutThicknessPx);
            ctx.fillStyle = localGroutColor;
            // Vertical grout
            ctx.fillRect(x - groutWidth/2, y, groutWidth, tileSize);
            // Horizontal grout
            ctx.fillRect(x, y - groutWidth/2, tileSize, groutWidth);
          }
        }
      }

      // Add size indicator with more visible styling
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`${sizeInInches}" x ${sizeInInches}"`, 20, 40);
      ctx.restore();

    } catch (error) {
      console.error('Error in drawing process:', error);
    }
  };

  // Effect to draw on main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to maintain aspect ratio
    canvas.width = 800;
    canvas.height = 800;
    
    drawTilesOnCanvas(canvas, ctx);
  }, [selectedTile, selectedColor, selectedSize, localThickness, localGroutColor, tileMasks]);

  // Effect to draw on expanded canvas
  useEffect(() => {
    if (isExpanded) {
      const canvas = expandedCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = 100;
      canvas.height = 100;
      
      drawTilesOnCanvas(canvas, ctx);
    }
  }, [isExpanded, selectedTile, selectedColor, localSize, localThickness, localGroutColor, tileMasks]);

  const handleSave = () => {
    setIsModalOpen(true);
  };

  if (!selectedTile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-center text-xl tracking-widest mb-2">TILE VISUALIZER</h2>
        <hr className="mb-4" />
        <div className="text-center text-gray-500">
          Please select a tile to preview
        </div>
      </div>
    );
  }

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
          {/* Original Tile Image */}
          {selectedTile && (
            <div className="relative w-full h-full">
              <img
                src={selectedTile.image}
                alt={selectedTile.name}
                className="w-full h-full object-cover bg-gray-100 rounded-lg"
                style={{
                  backgroundSize: tileBgSize,
                  backgroundRepeat: 'repeat'
                }}
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
                    opacity: 0.8
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
                  zIndex: 1
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
            <div className="absolute bottom-2 right-2 z-50">
              <button
                onClick={() => setIsExpanded(false)}
                className="bg-black bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90 transition"
              >
                <MdCloseFullscreen size={20} />
              </button>
            </div>
            <div className="relative" style={{ minHeight: "200px" }}>
              {/* Original Tile Image */}
              {selectedTile && (
                <div className="relative w-full h-full">
                  <img
                    src={selectedTile.image}
                    alt={selectedTile.name}
                    className="w-full h-full object-contain bg-gray-100 rounded-lg"
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
                        maskSize: 'cover',
                        WebkitMaskSize: 'cover',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        mixBlendMode: 'source-in',
                        opacity: 0.8
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
                      zIndex: 1
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
          </div>
        </div>
      )}

      {/* Tile Size Selection */}
      <div className="mb-6">
        <div className="text-sm font-medium mb-2 tracking-wider">TILE SIZE:</div>
        <div className="flex gap-2">
          {Object.keys(sizeToPx).map((size) => {
            let Icon;
            switch(size) {
              case "8x8":
                Icon = BsGrid3X3;
                break;
              case "12x12":
                Icon = BsGrid3X3Gap;
                break;
              case "16x16":
                Icon = BsGrid3X3GapFill;
                break;
              default:
                Icon = BsGrid3X3;
            }
            return (
              <button
                key={size}
                onClick={() => setLocalSize(size)}
                className={`border px-3 py-1 uppercase text-xs tracking-wide flex items-center gap-2 ${
                  localSize === size ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                <Icon size={16} />
                {size}
              </button>
            );
          })}
        </div>
      </div>

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
                  localGroutColor === color ? "ring-2 ring-black" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setLocalGroutColor(color)}
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
                onClick={() => setLocalThickness(level)}
                className={`border px-3 py-1 uppercase text-xs tracking-wide ${
                  localThickness === level ? "bg-black text-white" : "bg-white text-black"
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
