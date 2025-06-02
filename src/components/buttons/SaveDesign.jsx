import React from 'react'
import { FaSave } from 'react-icons/fa'
const SaveDesign = () => {
  return (
     <div className="mb-4 flex justify-center items-center">
           <button className="bg-black text-white px-6 py-2 flex justify-center items-center gap-2 hover:bg-white hover:text-black hover:border hover:border-black transition-all duration-300 ease">
             <span>< FaSave size={18}/> </span>
             <span className="text-sm font-poppins font-light">Save Design</span>
           </button>
         </div>
  )
}

export default SaveDesign