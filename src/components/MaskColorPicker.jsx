import { useTileSimulator } from "../context/TileSimulatorContext";
import { useState } from "react";

const MaskColorPicker = () => {
  const { tileMasks, setTileMaskColor } = useTileSimulator();
  const [activeMask, setActiveMask] = useState(null);

  const handleMaskClick = (maskId) => {
    setActiveMask(maskId === activeMask ? null : maskId);
  };

  if (!tileMasks || tileMasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Pattern Colors</h3>
      {tileMasks.map((mask, index) => (
        <div 
          key={mask.id} 
          className={`border-b pb-4 last:border-b-0 transition-all ${
            activeMask === mask.id ? 'bg-blue-50 rounded-lg p-3' : ''
          }`}
        >
          <div 
            className="flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => handleMaskClick(mask.id)}
          >
            <h4 className={`font-semibold ${
              activeMask === mask.id ? 'text-blue-600' : 'text-gray-700'
            }`}>
              {mask.name}
            </h4>
            <div 
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                activeMask === mask.id ? 'border-blue-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: mask.color }}
            />
          </div>
          {activeMask === mask.id && (
            <div className="flex flex-wrap gap-2">
              {mask.availableColors.map(color => (
                <button
                  key={color}
                  onClick={() => setTileMaskColor(mask.id, color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${
                    mask.color === color 
                      ? 'border-black ring-2 ring-offset-2 ring-primary' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Set ${mask.name} to ${color}`}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MaskColorPicker; 