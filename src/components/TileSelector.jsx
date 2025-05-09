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
    <div className="p-4">
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {Object.keys(tileCollections).map((collection) => (
          <button
            key={collection}
            onClick={() => setActiveCollection(collection)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeCollection === collection
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-lg transition-colors`}
          >
            {collection}
          </button>
        ))}
      </div>

      {/* Tile Grid - Show original tiles only */}
      <div className="grid grid-cols-3 gap-4">
        {tileCollections[activeCollection].map((tile) => (
          <div
            key={tile.id}
            className={`relative aspect-square group  cursor-pointer group ${
              selectedTile?.id === tile.id ? 'overflow-hidden' : ''
            }`}
            onClick={() => handleTileSelect(tile)}
          >
            <img
              src={tile.image}
              alt={tile.name}
              className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg " />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-sm rounded-b-lg text-center hidden group-hover:block transition-all duration-300 ease-in-out">
              {tile.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TileSelector;
