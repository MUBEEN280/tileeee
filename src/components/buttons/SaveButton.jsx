import React from 'react';

const SaveButton = ({ onSave }) => {
  return (
    <button
      className="bg-black text-white px-6 py-2 uppercase font-poppins text-sm hover:bg-gray-800   hover:border hover:border-red-500 hover:rounded-md hover:shadow-md hover:shadow-red-500 transition-all duration-300 ease-in-out"
      onClick={onSave}
    >
      Save
    </button>
  );
};

export default SaveButton; 