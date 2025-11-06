import React, { useState } from "react";

const ShowCase = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const path = event.target.files[0];
    if (!path) return;
    setFile(path);
    console.log("Path:", path);
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-4">
      {!file ? (
        <>
          <p className="text-xl text-center">
            To view a model, please upload a file below.
          </p>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Choose File
            <input
              type="file"
              accept=".stp,.step,.obj,.glb,.gltf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </>
      ) : (
        <div className="w-full h-full">
          {/* Pass the uploaded file to the StepViewer */}
          <FileViewer file={file} />
        </div>
      )}
    </div>
  );
};

export default ShowCase;
