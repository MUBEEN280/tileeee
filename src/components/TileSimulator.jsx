import React, { useRef } from "react";
import { useTileSimulator } from "../context/TileSimulatorContext";
import TileSelector from "./TileSelector";
import ColorEditor from "./ColorEditor";
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
  const colorRef = useRef(null);
  const viewRef = useRef(null);

  const tileInView = useInView(tileRef, { once: true });
  const colorInView = useInView(colorRef, { once: true });
  const viewInView = useInView(viewRef, { once: true });

  return (
    <div className="min-h-screen max-w-9xl p-3 lg:p-0 m-auto  grid grid-cols-1 lg:grid-rows-1 lg:grid-cols-[1fr_0.7fr_2.3fr] gap-4">
      {/* Tile Selection */}
      <motion.div
        className="flex flex-col"
        ref={tileRef}
        initial={{ opacity: 0, x: -100, scale: 0.1 }}
        animate={tileInView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center lg:text-left py-6">
          <div className="text-lg  tracking-widest font-poppins">
            TILE SELECTION
          </div>
          <hr className="bg-red-500 h-[2px] w-full my-3 rounded-full" />
        </div>
        <div className="overflow-y-auto">
          <TileSelector onSelectTile={setSelectedTile} />
        </div>
      </motion.div>

      {/* Color Editor */}
      <motion.div
        className=" flex flex-col"
        ref={colorRef}
        initial={{ opacity: 0, y: 150, scale: 0.2 }}
        animate={colorInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="text-center lg:text-left py-6">
          <div className="text-lg  tracking-widest font-poppins">
            COLOR EDITOR
          </div>
          <hr className="bg-red-500 h-[2px] w-full my-3 rounded-full" />
        </div>
        <div className="overflow-y-auto">
          {selectedTile && (
            <ColorEditor
              tile={selectedTile}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              selectedEnvironment={selectedEnvironment}
              setSelectedEnvironment={setSelectedEnvironment}
              groutColor={groutColor}
              setGroutColor={setGroutColor}
              groutThickness={groutThickness}
              setGroutThickness={setGroutThickness}
              tileMasks={tileMasks}
              setTileMaskColor={setTileMaskColor}
            />
          )}
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
        <div className="text-center lg:text-left py-6">
          <div className="text-lg font-light font-poppins">VIEW</div>
          <hr className="bg-red-500 h-[2px] w-full my-3 rounded-full" />
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
