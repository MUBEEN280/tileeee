import React, { createContext, useContext, useState, useEffect } from 'react';

const TileSimulatorContext = createContext();

// Sample tiles with mask data
const tileCollections = {
  "Pattern Collection": [
    {
      id: 1,
      name: "BARS",
      image: "/Images/tiles/Tile-11.png",
      shape: 'square',
      grout: 'cross',
      scale: 1,
      colorsUsed: [
        '#2D3748', // dark gray
        '#E2E8F0', // light gray
        '#A0AEC0', // blue gray
        '#4A5568', // slate
        '#FFB300'  // orange (new, unique)
      ],
      masks: [
        {
          id: 'mask1',
          name: 'Mask Pattern 1',
          image: '/Images/tiles/masks/Mask-1.png',
          color: '#2D3748',
          availableColors: [
            '#2D3748', '#1A202C', '#171923', '#4A5568', '#718096', '#FF0000', '#FFB300', '#00B894', '#00BFFF', '#FFD700', '#FFFFFF', '#000000'
          ]
        },
        {
          id: 'mask2',
          name: 'Mask Pattern 2',
          image: '/Images/tiles/masks/Mask-2.png',
          color: '#E2E8F0',
          availableColors: [
            '#E2E8F0', '#CBD5E0', '#A0AEC0', '#718096', '#4A5568', '#2D3748', '#FFB300', '#00B894', '#00BFFF', '#FFD700', '#FFFFFF', '#000000'
          ]
        },
        {
          id: 'mask3',
          name: 'Mask Pattern 3',
          image: '/Images/tiles/masks/Mask-3.png',
          color: '#A0AEC0',
          availableColors: [
            '#A0AEC0', '#CBD5E0', '#E2E8F0', '#718096', '#4A5568', '#2D3748', '#FFB300', '#00B894', '#00BFFF', '#FFD700', '#FFFFFF', '#000000'
          ]
        },
        {
          id: 'mask4',
          name: 'Mask Pattern 4',
          image: '/Images/tiles/masks/Mask-4.png',
          color: '#4A5568',
          availableColors: [
            '#4A5568', '#718096', '#A0AEC0', '#E2E8F0', '#2D3748', '#FFB300', '#00B894', '#00BFFF', '#FFD700', '#FFFFFF', '#000000'
          ]
        },
        {
          id: 'mask5',
          name: 'Mask Pattern 5',
          image: '/Images/tiles/masks/Mask-5.png',
          color: '#FFB300',
          availableColors: [
            '#FFB300', '#FFD700', '#FF0000', '#00B894', '#00BFFF', '#FFFFFF', '#000000', '#2D3748', '#E2E8F0', '#A0AEC0', '#4A5568', '#718096'
          ]
        },
      ]
    },
  ],
  "Hexagon Collection": [
    {
      id: 2,
      name: "HEX ONE",
      image: "/Images/tiles/hex1.jpg",
      shape: 'hexagon',
      grout: 'hex',
      scale: 1,
      colorsUsed: ['#4299E1', '#EBF8FF', '#63B3ED', '#3182CE', '#2B6CB0'],
      masks: [
        {
          id: 'mask1',
          name: 'Hex Pattern',
          image: '/Images/tiles/masks/hex-mask-1.png',
          color: '#4299E1',
          availableColors: [
            '#4299E1', '#3182CE', '#2B6CB0', '#2C5282', '#2A4365', '#1A365D'
          ]
        },
        {
          id: 'mask2',
          name: 'Background',
          image: '/Images/tiles/masks/hex-mask-2.png',
          color: '#EBF8FF',
          availableColors: [
            '#EBF8FF', '#BEE3F8', '#90CDF4', '#63B3ED', '#4299E1', '#3182CE'
          ]
        }
      ]
    },
    {
      id: 3,
      name: "HEX TWO",
      image: "/Images/tiles/hex2.jpg",
      shape: 'hexagon',
      grout: 'hex',
      scale: 1,
      colorsUsed: ['#ED8936', '#FEEBC8', '#F6AD55', '#DD6B20', '#C05621'],
      masks: [
        {
          id: 'mask1',
          name: 'Hex Pattern',
          image: '/Images/tiles/masks/hex-mask-3.png',
          color: '#ED8936',
          availableColors: [
            '#ED8936', '#DD6B20', '#C05621', '#9C4221', '#7B341E', '#652B19'
          ]
        },
        {
          id: 'mask2',
          name: 'Background',
          image: '/Images/tiles/masks/hex-mask-4.png',
          color: '#FEEBC8',
          availableColors: [
            '#FEEBC8', '#FBD38D', '#F6AD55', '#ED8936', '#DD6B20', '#C05621'
          ]
        }
      ]
    }
  ],
  "Elite Collection": [
    {
      id: 4,
      name: "ELITE A",
      image: "/Images/tiles/elitea.jpg",
      shape: 'square',
      grout: 'cross',
      scale: 1,
      colorsUsed: ['#2D3748', '#E2E8F0', '#A0AEC0', '#4A5568', '#2D3748'],
      masks: [
        {
          id: 'mask1',
          name: 'Elite Pattern',
          image: '/Images/tiles/masks/elite-mask-1.png',
          color: '#2D3748',
          availableColors: [
            '#2D3748', '#1A202C', '#171923', '#2D3748', '#4A5568', '#718096'
          ]
        },
        {
          id: 'mask2',
          name: 'Accent',
          image: '/Images/tiles/masks/elite-mask-2.png',
          color: '#E2E8F0',
          availableColors: [
            '#E2E8F0', '#CBD5E0', '#A0AEC0', '#718096', '#4A5568', '#2D3748'
          ]
        }
      ]
    },
    {
      id: 5,
      name: "ELITE B",
      image: "/Images/tiles/eliteb.jpg",
      shape: 'square',
      grout: 'cross',
      scale: 1,
      colorsUsed: ['#1A202C', '#F7FAFC', '#A0AEC0', '#4A5568', '#2D3748'],
      masks: [
        {
          id: 'mask1',
          name: 'Elite Pattern',
          image: '/Images/tiles/masks/elite-mask-3.png',
          color: '#1A202C',
          availableColors: [
            '#1A202C', '#171923', '#2D3748', '#4A5568', '#718096', '#A0AEC0'
          ]
        },
        {
          id: 'mask2',
          name: 'Background',
          image: '/Images/tiles/masks/elite-mask-4.png',
          color: '#F7FAFC',
          availableColors: [
            '#F7FAFC', '#EDF2F7', '#E2E8F0', '#CBD5E0', '#A0AEC0', '#718096'
          ]
        }
      ]
    }
  ],
  "Border Collection": [
    {
      id: 6,
      name: "BORDER A",
      image: "/Images/borders/Main-Border.png",
      shape: 'rectangle',
      grout: 'line',
      scale: 1,
      colorsUsed: ['#000000', '#FFFFFF', '#A0AEC0', '#FFB300', '#718096'],
      masks:[
        {
           maskId: 'mask1',
           name: 'Border Mask 1',
           image:'/Images/borders/bordersmask/Border-1.png',
           color:'#000000',
            availableColors: [
            '#F7FAFC', '#EDF2F7', '#E2E8F0', '#CBD5E0', '#A0AEC0', '#718096'
          ]
        },
        {
           maskId: 'mask2',
           name: 'Border Mask 2',
           image:'/Images/borders/bordersmask/Border-2.png',
           color: '#FF5733',
            availableColors: [
            '#F7FAFC', '#EDF2F7', '#E2E8F0', '#CBD5E0', '#A0AEC0', '#718096'
          ]
        },
        {
           maskId: 'mask3',
           name: 'Border Mask 3',
           image:'/Images/borders/bordersmask/Border-3.png',
          color: '#3498DB',
            availableColors: [
            '#F7FAFC', '#EDF2F7', '#E2E8F0', '#CBD5E0', '#A0AEC0', '#718096'
          ]
        },
      ]
    },    
  ]
};

export const TileSimulatorProvider = ({ children }) => {
  // Existing state
  const [selectedTile, setSelectedTile] = useState(() => {
    const savedTile = localStorage.getItem('selectedTile');
    return savedTile ? JSON.parse(savedTile) : null;
  });

  const [selectedColor, setSelectedColor] = useState(() => {
    const savedColor = localStorage.getItem('selectedColor');
    return savedColor || null;
  });

  const [selectedSize, setSelectedSize] = useState(() => {
    const savedSize = localStorage.getItem('selectedSize');
    return savedSize || "8x8";
  });

  const [selectedBorder, setSelectedBorder] = useState(() => {
    const savedBorder = localStorage.getItem('selectedBorder');
    return savedBorder ? JSON.parse(savedBorder) : null;
  });

  // New state for mask functionality
  const [selectedEnvironment, setSelectedEnvironment] = useState(() => {
    const savedEnv = localStorage.getItem('selectedEnvironment');
    return savedEnv || 'bedroom';
  });

  const [groutColor, setGroutColor] = useState(() => {
    const savedGroutColor = localStorage.getItem('groutColor');
    return savedGroutColor || '#ffffff';
  });

  const [groutThickness, setGroutThickness] = useState(() => {
    const savedThickness = localStorage.getItem('groutThickness');
    return savedThickness || 2;
  });

  const [tileMasks, setTileMasks] = useState(() => {
    const savedMasks = localStorage.getItem('tileMasks');
    return savedMasks ? JSON.parse(savedMasks) : [];
  });

  const handleTileSelect = (tile) => {
    console.log('Selecting tile:', tile);
    // Clear any existing selections
    setSelectedColor(null);
    // Set the new tile
    setSelectedTile(tile);
    // Set initial masks with original colors
    if (tile.masks) {
      const initialMasks = tile.masks.map(mask => ({
        ...mask,
        color: mask.color // Use the original color from the tile data
      }));
      setTileMasks(initialMasks);
      // Save to localStorage
      localStorage.setItem('tileMasks', JSON.stringify(initialMasks));
    }
  };

  // Update masks when tile changes
  useEffect(() => {
    if (selectedTile?.masks) {
      console.log('Updating masks for tile:', selectedTile);
      // Check if this is a new tile selection or a page refresh
      const isNewSelection = !localStorage.getItem('selectedTile') ||
        JSON.parse(localStorage.getItem('selectedTile'))?.id !== selectedTile.id;

      if (isNewSelection) {
        // For new tile selection, use original mask colors
        const initialMasks = selectedTile.masks.map(mask => ({
          ...mask,
          color: mask.color // Use the original color from the tile data
        }));
        setTileMasks(initialMasks);
        localStorage.setItem('tileMasks', JSON.stringify(initialMasks));
      } else {
        // For page refresh, use the saved masks
        const savedMasks = localStorage.getItem('tileMasks');
        if (savedMasks) {
          setTileMasks(JSON.parse(savedMasks));
        }
      }
      setSelectedColor(null);
    }
  }, [selectedTile]);

  const setTileMaskColor = (maskId, color) => {
    console.log('Setting mask color:', { maskId, color });
    setTileMasks(prevMasks => {
      const updatedMasks = prevMasks.map(mask =>
        mask.id === maskId
          ? { ...mask, color }
          : mask
      );
      // Save to localStorage
      localStorage.setItem('tileMasks', JSON.stringify(updatedMasks));
      return updatedMasks;
    });
  };
  const handleBorderSelect = (border) => {
    setSelectedBorder(border);
    localStorage.setItem('selectedBorder', JSON.stringify(border));
  };


  // Save to localStorage whenever state changes
  useEffect(() => {
    if (selectedTile) {
      localStorage.setItem('selectedTile', JSON.stringify(selectedTile));
    }
  }, [selectedTile]);

  useEffect(() => {
    if (selectedBorder) {
      localStorage.setItem('selectedBorder', JSON.stringify(selectedBorder));
    }
  }, [selectedBorder]);

  useEffect(() => {
    if (selectedColor) {
      localStorage.setItem('selectedColor', selectedColor);
    }
  }, [selectedColor]);

  useEffect(() => {
    localStorage.setItem('selectedSize', selectedSize);
  }, [selectedSize]);

  useEffect(() => {
    localStorage.setItem('selectedEnvironment', selectedEnvironment);
  }, [selectedEnvironment]);

  useEffect(() => {
    localStorage.setItem('groutColor', groutColor);
  }, [groutColor]);

  useEffect(() => {
    localStorage.setItem('groutThickness', groutThickness);
  }, [groutThickness]);

  return (
    <TileSimulatorContext.Provider
      value={{
        // Existing values
        selectedTile,
        setSelectedTile: handleTileSelect,
        selectedColor,
        setSelectedColor,
        selectedSize,
        setSelectedSize,
        // New values for mask functionality
        selectedEnvironment,
        setSelectedEnvironment,
        groutColor,
        setGroutColor,
        groutThickness,
        setGroutThickness,
        tileMasks,
        setTileMaskColor,
        selectedBorder,
        setSelectedBorder,
        handleBorderSelect,
        availableTiles: Object.values(tileCollections).flat(),
        tileCollections
      }}
    >
      {children}
    </TileSimulatorContext.Provider>
  );
};

export const useTileSimulator = () => {
  const context = useContext(TileSimulatorContext);
  if (!context) {
    throw new Error('useTileSimulator must be used within a TileSimulatorProvider');
  }
  return context;
}; 