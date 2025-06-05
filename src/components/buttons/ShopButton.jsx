import React from 'react';
import { FaCartShopping } from "react-icons/fa6";

const ShopButton = () => {
  return (
    <button
      className="bg-white text-black border border-black px-4 py-2 flex justify-center items-center gap-2 hover:bg-black hover:text-white  transition-all duration-300 ease"
    >

     <span><FaCartShopping size={18}/></span>
     <span className='text-sm font-poppins font-light'>Shop Now</span>
    </button>
  );
};

export default ShopButton; 