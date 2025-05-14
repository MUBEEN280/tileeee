import React, { useState } from "react";
import { useTileSimulator } from "../context/TileSimulatorContext";

const TileSelector = ({ onSelectTile }) => {
  const { tileCollections } = useTileSimulator();
  const [activeCollection, setActiveCollection] = useState(Object.keys(tileCollections)[0]);
  const [selectedTile, setSelectedTile] = useState(null);

  const handleTileSelect = (tile) => {
    setSelectedTile(tile);
    if (onSelectTile) {
      onSelectTile(tile);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="flex md:flex-col justify-start items-start overflow-x-auto md:overflow-y-auto gap-2 md:min-w-[180px] bg-gray-100 p-2 rounded-lg">
        {Object.keys(tileCollections).map((collection) => (
          <button
            key={collection}
            onClick={() => setActiveCollection(collection)}
            className={`px-4 py-2 whitespace-nowrap font-poppins font-light ${
              activeCollection === collection
                ? 'text-sm text-gray-900'
                : 'text-xs text-gray-700 hover:text-gray-900'
            } rounded-lg transition-all duration-300 ease-in-out`}
          >
            {collection}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3  lg:grid-cols-2  gap-2 flex-1 bg-gray-100 p-2 rounded-lg font-light font-poppins overflow-x-auto lg:overflow-y-auto">
        {tileCollections[activeCollection].map((tile) => (
          <div
            key={tile.id}
            className={`relative aspect-square group cursor-pointer ${
              selectedTile?.id === tile.id ? 'overflow-hidden' : ''
            }`}
            onClick={() => handleTileSelect(tile)}
          >
            <img
              src={tile.image}
              alt={tile.name}
              className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
            <div className="absolute bottom-0 left-0 right-0 py-1 bg-black bg-opacity-50 text-white text-[10px]  rounded-b-lg text-center hidden group-hover:block transition-all duration-300 ease-in-out">
              {tile.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TileSelector;
