import React from "react";
import NavigationBar from "./NavigationBar";

const Layout = ({ children }) => {
  return (
    <div className="h-screen custom-gradient flex flex-col p-2">
      <div className="mb-2">
        <NavigationBar />
      </div>

      <div className="flex-1 overflow-hidden border border-white/50 shadow-xl backdrop-blur-xl rounded-xl bg-white">
        <main className="h-full w-full rounded-lg">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
