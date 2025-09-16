import React from "react";
import NavigationBar from "./NavigationBar";

const Layout = ({ children }) => {
  return (
    <div className="h-screen custom-gradient flex flex-col p-2">
      {/* NavigationBar with fixed height */}
      <div className="mb-2">
        <NavigationBar />
      </div>

      {/* Main container grows to fill space and scrolls inside */}
      <div className="flex-1 overflow-hidden border border-white/50 shadow-xl backdrop-blur-xl rounded-xl">
        <main className="h-full w-full rounded-lg p-2.5">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
