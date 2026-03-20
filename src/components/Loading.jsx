import React from "react";
import logo from "../assets/icon.ico";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 border-4 border-[#0e9dc7] border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={logo} alt="logo" className="w-18 h-18" />
        </div>
      </div>
    </div>
  );
};
export default Loading;
