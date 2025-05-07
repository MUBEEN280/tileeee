import React, { useState } from "react";

const tileData = {
  "Pattern Collection": [
    { name: "RABBITS", img: "/Images/tiles/tile-1.png"},
    { name: "ABIGALE", img: "/Images/tiles/tile-2.png"},
    { name: "AGATHA", img: "/Images/tiles/tile-3.png"},
    { name: "ALINE", img: "/Images/tiles/tile-4.png"},
    { name: "AMANDA", img: "/Images/tiles/tile-5.png" },
    { name: "ARGUILE", img: "/Images/tiles/tile-6.png"},
    { name: "ARROW", img: "/Images/tiles/tile-7.png"},
    { name: "ASTRID", img: "/Images/tiles/tile-8.png"},
    { name: "ATHENA", img: "/Images/tiles/tile-9.png" },
    { name: "BALI", img: "/Images/tiles/tile-10.png",},
    { name: "BARS", img: "/Images/tiles/tile-1.png" },
    { name: "BELLE", img: "/Images/tiles/tile-2.png"},
  ],
  "Hexagon Collection": [
    { name: "HEX ONE", img: "hex1.jpg"},
    { name: "HEX TWO", img: "hex2.jpg"},
  ],
  "Elite Collection": [
    { name: "ELITE A", img: "elitea.jpg"},
    { name: "ELITE B", img: "eliteb.jpg"},
  ],
};

const categories = Object.keys(tileData);

const TileSelector = ({ onSelectTile }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedTile, setSelectedTile] = useState(null);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
  };

  const handleTileClick = (tile) => {
    setSelectedTile(tile);
    onSelectTile({ ...tile, category: selectedCategory });
  };

  return (
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 w-full h-screen p-4 font-sans">
      <div className="w-auto lg:max-w-2xl mb-6 md:mb-0 md:pr-6 space-y-4 text-sm font-medium text-gray-400">
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`cursor-pointer transition-all ${
              selectedCategory === cat
                ? "text-black font-bold underline underline-offset-4"
                : ""
            }`}
          >
            {cat}
          </div>
        ))}
      </div>

      <div className="max-h-full overflow-y-auto pr-2 md:pr-4 scrollbar-thin scrollbar-thumb-red-400">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tileData[selectedCategory]?.map((tile, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center text-center cursor-pointer hover:scale-105 transition ${
                selectedTile?.name === tile.name ? "ring-2 ring-black rounded-md " : ""
              }`}
              onClick={() => handleTileClick(tile)}
            >
              <div className="w-20 h-20 rounded-md overflow-hidden shadow-md">
                <img
                  src={tile.img}
                  className="w-full h-full object-cover"
                  alt={tile.name}
                />
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">
                {tile.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TileSelector;
