import React from "react";
import offline from "../assets/offline.png";

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
      <div className="flex items-center justify-center">
        {/* Logo bar */}
        <img
          src={offline}
          alt="offline"
          className="w-30 h-30 "
          style={{ Color: "red" }}
        />
      </div>
      <p className="text-lg text-[#444]">
        WE ARE UNABLE TO PROCESS YOUR REQUEST
      </p>
    </div>
  );
};

export default Error;
