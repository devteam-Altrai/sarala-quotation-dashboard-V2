import React from "react";

const Main = ({ page }) => {
  return (
    <div className="w-full h-full p-2 border border-white/50 bg-white/10 shadow-xl backdrop-blur-xl rounded-xl">
      <div className="bg-white/50 h-full w-full rounded-lg">{page}</div>
    </div>
  );
};

export default Main;
