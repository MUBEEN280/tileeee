import React from 'react';

const SaveButton = ({ onSave }) => {
  return (
    <button
      className="bg-black text-white px-6 py-2 uppercase text-sm hover:bg-gray-800 transition"
      onClick={onSave}
    >
      Save
    </button>
  );
};

export default SaveButton; 