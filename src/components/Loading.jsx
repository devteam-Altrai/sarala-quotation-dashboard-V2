import React from "react";
import logo from "../assets/icon.ico";

const Loading = () => {
  return (
    <div className="flex items-center justify-center w-32 h-32">
      {/* Spinner / buffer around logo */}
      <div className="relative w-27 h-27">
        {/* Spinning border */}
        <div className="absolute inset-0 border-4 border-[#0e9dc7] border-t-transparent rounded-full animate-spin"></div>
        {/* Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={logo} alt="logo" className="w-17 h-17" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
