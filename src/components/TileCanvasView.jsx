import React from "react";
import { IoMdClose } from "react-icons/io";
import SaveButton from "./buttons/SaveButton";
import ShopButton from "./buttons/ShopButton";
import TileModal from "./TileModals";
import { useTileSimulator } from "../context/TileSimulatorContext";

const environments = [
  { icon: null, label: "bedroom", image: "/Images/bedroomjpg.png" },
  { icon: null, label: "dining", image: "/Images/livingjpg.png" },
  { icon: null, label: "kitchen", image: "/Images/kitchen.png" },
  { icon: null, label: "bathroom", image: "/Images/env/bathroom.png" },
  { icon: null, label: "store", image: "/Images/commercial_old.png" },
];

const thicknessToPx = {
  none: "0px",
  thin: "2px",
  thick: "6px",
};

const TileCanvasView = () => {
  const {
    selectedTile,
    selectedColor,
    selectedSize,
    selectedEnvironment,
    setSelectedEnvironment,
    groutColor,
    groutThickness,
    tileMasks,
    borderMasks,
    selectedBorder,
    blockRotations,
    rotateBlock,
  } = useTileSimulator();

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const currentEnv = environments.find(
    (env) => env.label === selectedEnvironment
  );

  const gridSize = selectedSize === "8x8" ? 8 : 12;
  const totalTiles = gridSize * gridSize;

  const containerWidth = 1200;
  const containerHeight = selectedEnvironment ? "auto" : "800px";

  const getTileSizeInPx = (size) => {
    const baseSize = size === "8x8" ? 8 : 12;
    const tileSize = containerWidth / baseSize;
    return `${tileSize}px`;
  };

  const tileSizePx = getTileSizeInPx(selectedSize);
  const groutThicknessPx = thicknessToPx[groutThickness] || "2px";

  const tileStyles = [
    "bg-[0%_0%]",
    "bg-[100%_0%]",
    "bg-[0%_100%]",
    "bg-[100%_100%]",
  ];

  const handleSave = () => {
    setIsModalOpen(true);
  };

  if (!selectedTile) {
    return (
      <div className="max-w-full mx-auto p-4">
        <h2 className="font-poppins font-semibold tracking-wide text-lg mb-2">
          TILE Preview
        </h2>
        <div className="text-center lg:text-left font-light font-poppins text-gray-500">
          Select a tile to preview
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto lg:mx-0 p-1">
      <h2 className="font-poppins font-semibold tracking-wide text-lg mb-2">
        TILE Preview
      </h2>
      <div className="relative mb-6">
        <div
          className="w-full rounded shadow"
          style={{
            position: "relative",
            overflow: "hidden",
            width: `${containerWidth}px`,
            height: containerHeight,
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          {/* Tile Grid Container */}
          <div className="relative">
            <div className="relative w-full h-full">
              <div
                className="grid bg-white"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  gap: groutThickness !== "none" ? groutThicknessPx : "0px",
                  width: "100%",
                  height: "100%",
                  backgroundColor: groutColor,
                }}
              >
                {Array.from({ length: totalTiles }).map((_, index) => {
                  const patternIndex =
                    (index % 2) + 2 * (Math.floor(index / gridSize) % 2);
                  const bgPos = tileStyles[patternIndex];

                  // Calculate the block index for rotation (0-3 for each 2x2 block)
                  const blockIndex =
                    (index % 2) +
                    2 *
                      (Math.floor((index % gridSize) / 2) +
                        Math.floor(index / (gridSize * 2)) * 2);

                  return (
                    <div
                      key={index}
                      className="relative bg-white cursor-pointer"
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                      }}
                      onClick={() => rotateBlock(blockIndex % 4)}
                    >
                      {/* Base Tile */}
                      <div
                        className="absolute inset-0"
                        style={{
                          transform: `rotate(${
                            blockRotations[blockIndex % 4] || 0
                          }deg)`,
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
                              transformOrigin: `${
                                index % 2 === 0 ? "0" : "100%"
                              } ${index < gridSize ? "0" : "100%"}`,
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
                              maskImage: mask.image
                                ? `url(${mask.image})`
                                : "none",
                              WebkitMaskImage: mask.image
                                ? `url(${mask.image})`
                                : "none",
                              maskSize: "cover",
                              WebkitMaskSize: "cover",
                              maskPosition: "center",
                              WebkitMaskPosition: "center",
                              maskRepeat: "no-repeat",
                              WebkitMaskRepeat: "no-repeat",
                              transform: `scale(2)`,
                              transformOrigin: `${
                                index % 2 === 0 ? "0" : "100%"
                              } ${index < gridSize ? "0" : "100%"}`,
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
              {selectedBorder &&
                borderMasks?.map((mask) => (
                  <div
                    key={mask.maskId}
                    className="absolute inset-0"
                    style={{
                      backgroundColor: mask.color,
                      maskImage: mask.image ? `url(${mask.image})` : "none",
                      WebkitMaskImage: mask.image
                        ? `url(${mask.image})`
                        : "none",
                      maskSize: "100%",
                      WebkitMaskSize: "100%",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      mixBlendMode: "source-in",
                      zIndex: 3,
                      clipPath:
                        "polygon(0 0, 5% 0, 5% 5%, 0 5%, 0 0, 100% 0, 100% 5%, 95% 5%, 95% 0, 100% 0, 100% 100%, 95% 100%, 95% 95%, 100% 95%, 100% 100%, 0 100%, 0 95%, 5% 95%, 5% 100%, 0 100%)",
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
                      zIndex: 3,
                    }}
                  />
                  <button
                    onClick={() => setSelectedEnvironment(null)}
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

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-20 mt-5">
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
          size: selectedSize,
          groutColor: groutColor,
          thickness: groutThickness,
          environment: currentEnv
            ? {
                label: currentEnv.label,
                image: currentEnv.image,
              }
            : null,
        }}
      />
    </div>
  );
};

export default TileCanvasView;
