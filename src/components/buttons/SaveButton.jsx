import React from "react";
import { FaDownload } from "react-icons/fa6";

const SaveButton = ({ onSave }) => {
  return (
    <button
      className="bg-black text-white px-6 py-2 flex justify-center items-center gap-2 hover:bg-white hover:text-black hover:border hover:border-black transition-all duration-300 ease"
      onClick={onSave}
    >
      <span><FaDownload size={18}/></span>
      <span className="text-sm font-poppins font-light">Download Print</span>
    </button>
  );
};

export default SaveButton;
