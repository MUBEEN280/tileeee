import React from "react";

const TileGridPreview = ({ tile, tileMasks, gridSize = 3, onMaskClick, selectedMaskId, getMaskColor }) => {
  if (!tile || !Array.isArray(tileMasks)) return null;

  // Create a grid of [gridSize x gridSize]
  const grid = Array.from({ length: gridSize * gridSize });

  return (
    <div
      className="relative w-full max-w-lg mx-auto"
      style={{ aspectRatio: "1 / 1" }}
    >
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          width: "100%",
          height: "100%",
        }}
      >
        {grid.map((_, idx) => (
          <div key={idx} className="relative w-full h-full">
            {/* Base tile image */}
            <img
              src={tile.image}
              alt={tile.name}
              className="absolute inset-0 w-full h-full object-cover rounded"
              draggable={false}
              style={{ pointerEvents: "none" }}
            />
            {/* Mask layers */}
            {tileMasks.map((mask) => (
              <div
                key={mask.id}
                className={`absolute inset-0 cursor-pointer`}
                onClick={onMaskClick ? () => onMaskClick(mask.id) : undefined}
                style={{
                  backgroundColor: getMaskColor ? getMaskColor(mask) : mask.color,
                  maskImage: `url(${mask.image})`,
                  WebkitMaskImage: `url(${mask.image})`,
                  maskSize: "cover",
                  WebkitMaskSize: "cover",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  pointerEvents: onMaskClick ? "auto" : "none",
                  opacity: 1,
                  mixBlendMode: "darken",
                  outline:
                    selectedMaskId === mask.id ? "2px solid #3B82F6" : "none",
                  boxShadow:
                    selectedMaskId === mask.id
                      ? "0 0 0 2px #3B82F6, 0 2px 8px rgba(59,130,246,0.1)"
                      : "none",
                  transition: "outline 0.2s, box-shadow 0.2s",
                }}
                title={`Select ${mask.name}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TileGridPreview; 