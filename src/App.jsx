import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllRoutes from "./routes/AllRoutes";
import FileProcessingLoader from "./components/FileProcessingLoader";

function App() {
  return (
    <BrowserRouter>
    <FileProcessingLoader/>
      <AllRoutes />
    </BrowserRouter>
  );
}

export default App;
