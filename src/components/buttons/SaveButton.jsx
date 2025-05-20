import React from "react";

const SaveButton = ({ onSave }) => {
  return (
    <button
      className="bg-black text-white px-6 py-2 uppercase font-poppins text-sm hover:bg-gray-800   hover:ring-2 hover:ring-[#bd5b4c] hover:rounded-md hover:shadow-md hover:shadow-[#bd5b4c] transition-all duration-300 ease-in-out"
      onClick={onSave}
    >
      Save
    </button>
  );
};

export default SaveButton;
