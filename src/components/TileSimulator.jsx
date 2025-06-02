import React, { useRef } from "react";
import { useTileSimulator } from "../context/TileSimulatorContext";
import TileSelector from "./TileSelector";
import TileCanvasView from "./TileCanvasView";
import { motion, useInView } from "framer-motion";

const TileSimulator = () => {
  const {
    selectedTile,
    setSelectedTile,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedEnvironment,
    setSelectedEnvironment,
    groutColor,
    setGroutColor,
    groutThickness,
    setGroutThickness,
    tileMasks,
    setTileMaskColor,
    borderMasks,
    selectedBorder,
  } = useTileSimulator();

  const tileRef = useRef(null);
  const viewRef = useRef(null);

  const tileInView = useInView(tileRef, { once: true });
  const viewInView = useInView(viewRef, { once: true });

  return (
    <div className="min-h-screen  max-w-9xl p-3 lg:p-0 m-auto grid grid-cols-1 lg:grid-rows-1 lg:grid-cols-[1fr_2fr] gap-0">
      {/* Tile Selection */}
      <motion.div
        className="flex flex-col bg-gray-50 p-2"
        ref={tileRef}
        initial={{ opacity: 0, x: -100, scale: 0.1 }}
        animate={tileInView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="py-4">
        </div>
        <div className="overflow-y-auto">
          <TileSelector onSelectTile={setSelectedTile} />
        </div>
      </motion.div>

      {/* View */}
      <motion.div
        className="flex flex-col"
        ref={viewRef}
        initial={{ opacity: 0, x: 100, scale: 0.3 }}
        animate={viewInView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="py-4">
        </div>
        <div className="flex-1 overflow-y-auto mb-4">
          <TileCanvasView
            selectedTile={selectedTile}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            selectedEnvironment={selectedEnvironment}
            groutColor={groutColor}
            groutThickness={groutThickness}
            tileMasks={tileMasks}
            borderMasks={borderMasks}
            selectedBorder={selectedBorder}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TileSimulator;
