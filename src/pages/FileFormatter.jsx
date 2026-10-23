import React, { useState } from "react";
import sanmina from "../assets/sanmina.png";
import anora from "../assets/Anora.png";
import asm from "../assets/ASM.png";
import vvdn from "../assets/vvdn_site_logo.svg";
import { CloudUpload, X } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../utils/AppConstant";
import BufferLoader from "../components/BufferLoader";

const clients = [
  { name: "ANORA", image: anora, key: "anora" },
  { name: "ASM TECHNOLOGIES", image: asm, key: "asm" },
  { name: "SANMINA", image: sanmina, key: "sanmina" },
  { name: "VVDN TECHNOLOGIES", image: vvdn, key: "vvdn" },
];

const FileFormatter = () => {
  const [uploadingClient, setUploadingClient] = useState(null);
  const [filePopup, setFilePopup] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [FileDetails, setFileDetails] = useState({ name: "", id: "", key: "" });
  const [customFilename, setCustomFilename] = useState();

  // const handleFileUpload = async (clientKey) => {
  //   const formData = new FormData();
  //   formData.append("zip", selectedFile);
  //   formData.append("assembly_client", clientKey);
  //   formData.append("custom_filename", customFilename);

  //   try {
  //     setUploadingClient(clientKey);

  //     const response = await axios.post(`${BASE_URL}formatfile/`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //       responseType: "blob",
  //     });

  //     let fileName = customFilename;

  //     const disposition = response.headers["content-disposition"];

  //     if (disposition) {
  //       const match = disposition.match(/filename="?([^"]+)"?/);

  //       if (match?.[1]) {
  //         fileName = match[1];
  //       }
  //     }

  //     const blob = new Blob([response.data]);
  //     const url = window.URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = fileName;

  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();

  //     window.URL.revokeObjectURL(url);
  //     setCustomFilename("")
  //     setSelectedFile(null)
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //   } finally {
  //     setUploadingClient(null);
  //   }
  // };

  const handleFileUpload = async (clientKey) => {
  const formData = new FormData();
  formData.append("zip", selectedFile);
  formData.append("assembly_client", clientKey);
  formData.append("filename", customFilename);

  try {
    setUploadingClient(clientKey);

    const response = await axios.post(
      `${BASE_URL}formatfile/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      }
    );

    let fileName = `${customFilename}.zip`;

    const disposition = response.headers["content-disposition"];

    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);

      if (match && match[1]) {
        fileName = match[1];
      }
    }

    const blob = new Blob([response.data], {
      type: "application/zip",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setCustomFilename("")
    setSelectedFile(null)
  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    setUploadingClient(null);
  }
};

  const handleFileChange = async (e, clientKey) => {
    const file = e.target.files[0];

    if (!file) return;
    setSelectedFile(file);
  };

  return (
    <>
      <div className="flex h-full w-full flex-col bg-white p-4 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-medium text-[#0e9dc7]">
            ASSEMBLY FORMATTER
          </h1>

          <p className="text-sm text-[#444]">
            Every assembly can be converted into suitable format here.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => {
              const inputId = `fileUploader-${client.key}`;
              const isUploading = uploadingClient === client.key;

              return (
                <div
                  key={client.key}
                  className="flex w-full flex-col items-center justify-center rounded-lg border border-[#0e9dc7] p-2 shadow-lg"
                >
                  <div className="flex flex-1 items-center justify-center">
                    <img
                      src={client.image}
                      alt={client.name}
                      className="h-40 w-60 object-contain"
                    />
                  </div>
                  {isUploading ? (
                    <div className="relative flex h-10 w-fit items-center justify-center overflow-hidden rounded-lg bg-[#3da5c5] px-4">
                      <div className="flex items-center gap-2">
                        <BufferLoader />
                        <p className="text-white">Please Wait...</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileDetails({
                          name: client.name,
                          id: inputId,
                          key: client.key,
                        });
                        setFilePopup(!filePopup);
                      }}
                      disabled={uploadingClient}
                       className={uploadingClient ? "cursor-not-allowed opacity-50 bg-black/10" : ""}
                    >
                      <div className="relative flex h-10 w-42.5 items-center justify-center overflow-hidden rounded-lg bg-[#3da5c5] px-4">
                        <div className="flex items-center gap-2">
                          <p className="text-white">SELECT</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {filePopup && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white px-5 py-4 rounded-lg shadow-lg w-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {FileDetails.name}<span className="text-xs block text-gray-500">
                  **Make sure you select the appropriate file.
                </span>
              </h2>
              <button onClick={() => setFilePopup(!filePopup)}>
                <X />
              </button>
            </div>

            <div className="flex flex-row w-full justify-between items-center p-2 bg-[#3da5c5]/20 rounded">
              <p className="">
                {selectedFile ? selectedFile.name : "Please Select a file"}
              </p>
              {selectedFile && (
                <button onClick={() => setSelectedFile(null)}>
                  <X className="size-5" />
                </button>
              )}
            </div>
            <div className="w-full flex items-center gap-3 mt-4">
              <label className="min-w-[70px] ml-2 text-base font-medium">
                Filename:
              </label>

              <textarea
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder="Type here ..."
                rows={1}
                className="flex-1 p-1 text-md border border-[#3da5c5] rounded-md resize-none overflow-hidden whitespace-nowrap outline-none focus:ring-2 focus:ring-[#3da5c5] focus:border-[#3da5c5]"
              />
            </div>
            <div className=" flex w-full flex-col items-center justify-center gap-2">
              {!selectedFile ? (
                <>
                  <label
                    htmlFor={FileDetails.id}
                    className={`relative m-3 cursor-pointer group`}
                  >
                    <div className="relative flex h-10 w-34 items-center overflow-hidden rounded-lg bg-[#3da5c5]">
                      <p className="z-10 ml-4 text-white transition-opacity duration-100 group-hover:opacity-0">
                        UPLOAD
                      </p>

                      <div className="absolute right-1 top-1/2 flex h-[80%] w-10 -translate-y-1/2 items-center justify-center rounded-md bg-white transition-all duration-100 group-hover:w-[94%]">
                        <CloudUpload className="h-5 w-5 text-[#0e9dc7]" />
                      </div>
                    </div>
                  </label>
                  <input
                    id={FileDetails.id}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, FileDetails.key)}
                  />
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileUpload(FileDetails.key);
                    setFilePopup(!filePopup);
                  }}
                >
                  <div className="relative flex h-9.5 w-34 items-center justify-center overflow-hidden rounded-lg bg-[#3da5c5] px-4 my-[13px]">
                    <div className="flex items-center gap-2">
                      <p className="text-white">UPLOAD</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileFormatter;
