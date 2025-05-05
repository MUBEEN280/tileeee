import React, { useState } from "react";

const tileData = {
  "Pattern Collection": [
    { name: "RABBITS", img: "/Images/tilefour.jpeg", colorsUsed: ['#d1a954', '#e9e0d1', '#a8a29e'] },
    { name: "ABIGALE", img: "/Images/tiles.jpg", colorsUsed: ['#e63946', '#f1faee', '#a8dadc'] },
    { name: "AGATHA", img: "/Images/tilesthree.jpeg", colorsUsed: ['#8e44ad', '#3498db', '#2ecc71'] },
    { name: "ALINE", img: "/Images/tilestwo.jpg", colorsUsed: ['#e74c3c', '#f39c12', '#1abc9c'] },
    { name: "AMANDA", img: "amanda.jpg", colorsUsed: ['#9b59b6', '#2c3e50', '#ecf0f1'] },
    { name: "ARGUILE", img: "arguile.jpg", colorsUsed: ['#34495e', '#f39c12', '#7f8c8d'] },
    { name: "ARROW", img: "arrow.jpg", colorsUsed: ['#1abc9c', '#16a085', '#2ecc71'] },
    { name: "ASTRID", img: "astrid.jpg", colorsUsed: ['#d35400', '#e67e22', '#f39c12'] },
    { name: "ATHENA", img: "athena.jpg", colorsUsed: ['#e74c3c', '#ecf0f1', '#bdc3c7'] },
    { name: "BALI", img: "bali.jpg", colorsUsed: ['#9b59b6', '#2ecc71', '#e74c3c'] },
    { name: "BARS", img: "bars.jpg", colorsUsed: ['#3498db', '#2ecc71', '#95a5a6'] },
    { name: "BELLE", img: "belle.jpg", colorsUsed: ['#f1c40f', '#e67e22', '#e74c3c'] },
  ],
  "Hexagon Collection": [
    { name: "HEX ONE", img: "hex1.jpg", colorsUsed: ['#2c3e50', '#34495e', '#7f8c8d'] },
    { name: "HEX TWO", img: "hex2.jpg", colorsUsed: ['#e74c3c', '#ecf0f1', '#bdc3c7'] },
  ],
  "Elite Collection": [
    { name: "ELITE A", img: "elitea.jpg", colorsUsed: ['#16a085', '#1abc9c', '#2ecc71'] },
    { name: "ELITE B", img: "eliteb.jpg", colorsUsed: ['#9b59b6', '#2ecc71', '#e74c3c'] },
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
    <div className="border-2 border-black flex flex-col lg:flex-row space-y-4 lg:space-y-0 w-full h-screen p-4 font-sans">
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

      <div className="w-full lg:w-auto max-h-full overflow-y-auto pr-2 md:pr-4 scrollbar-thin scrollbar-thumb-gray-400">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {tileData[selectedCategory]?.map((tile, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center text-center cursor-pointer hover:scale-105 transition ${
                selectedTile?.name === tile.name ? "ring-2 ring-black" : ""
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
