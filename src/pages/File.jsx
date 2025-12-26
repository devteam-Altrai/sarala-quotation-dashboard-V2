import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchFiles } from "../redux/FilesSlice";
import Loading from "../components/Loading";
import { FilePlus2 } from "lucide-react";
import { BASE_URL } from "../utils/AppConstant";

const File = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const files = useSelector((state) => state.files.data);
  const status = useSelector((state) => state.files.status);

  const [activeFileId, setActiveFileId] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);

  const [quoteString, setQuoteString] = useState("");

  useEffect(() => {
    dispatch(fetchFiles());
    const interval = setInterval(() => dispatch(fetchFiles()), 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-full">
        <Loading />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">Error loading files</p>
      </div>
    );
  }

  const handleMakeQuotation = async () => {
    if (!selectedFileName) {
      alert("Please select a file first.");
      return;
    }

    const selectedFile = files.find((file) => file.name === selectedFileName);

    if (selectedFile?.quotationname) {
      navigate("/viewer", { state: { fileName: selectedFileName } });
      return;
    }

    let latestQuote;
    try {
      const res = await fetch(`${BASE_URL}get_quote/`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      const data = await res.json();
      latestQuote = data?.text;
    } catch (err) {
      console.error("Error fetching latest quote:", err);
      alert("Could not fetch the latest quotation from server.");
      return;
    }

    if (typeof latestQuote !== "string" || !latestQuote.includes("-")) {
      alert("Quotation seed invalid.");
      return;
    }

    const parts = latestQuote.split("-");
    parts[2] = (parseInt(parts[2], 10) + 1).toString();
    const updatedQuotation = parts.join("-");

    try {
      const resp = await fetch(`${BASE_URL}quote/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text: updatedQuotation }).toString(),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errText}`);
      }
    } catch (err) {
      console.error("Failed to post quotation:", err);
      alert("Failed to create quotation on server.");
      return;
    }

    try {
      const dashboardResp = await fetch(`${BASE_URL}update_dashboard/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: selectedFileName,
          quotationname: updatedQuotation,
        }),
      });

      if (!dashboardResp.ok) {
        const errText = await dashboardResp.text();
        throw new Error(`HTTP ${dashboardResp.status}: ${errText}`);
      }
    } catch (err) {
      console.error("Failed to update dashboard:", err);
      alert("Dashboard update failed.");
      return;
    }

    navigate("/viewer", { state: { fileName: selectedFileName } });
  };

  const sortedFiles = [...files].sort(
    (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
  );

  return (
    <div className="w-full h-full bg-white overflow-y-auto rounded-lg p-2.5 flex flex-col">
      {/* Header */}
      <div className="w-full h-20 flex flex-row justify-between items-center mb-3">
        <div className="ml-2">
          <h1 className="text-2xl font-medium text-[#0e9dc7]  pl-3.5 pt-3.5 pr-8 ">
            ASSEMBLIES
          </h1>
          <p className="text-sm text-[#444] ml-3.5">
            A complete view of all the assemblies here.
          </p>
        </div>
        <div className="hidden md:block">
          <button onClick={handleMakeQuotation} className="m-3 relative group">
            <div className="absolute top-1/2 right-1 -translate-y-1/2 duration-5 w-10 group-hover:w-[95%] h-[82%] bg-white flex justify-center items-center rounded-md p-1">
              <FilePlus2 style={{ width: 20, height: 20 }} color="#0e9dc7" />
            </div>
            <div className="bg-[#3da5c5] w-40 h-10 flex justify-start items-center rounded-lg">
              <p className="ml-4 text-white">QUOTATION</p>
            </div>
          </button>
        </div>
        <div className="md:hidden flex justify-center items-center mr-4">
          <button onClick={handleMakeQuotation}>
            <FilePlus2 color="#0e9dc7" style={{ width: "30", height: "30" }} />
          </button>
        </div>
      </div>

      {/* File Grid */}
      <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pl-4 pb-4 pr-4">
        {sortedFiles.map((file) => {
          const hasQuotation = !!file.quotationname;
          const isActive = activeFileId === file.id;

          return (
            <div
              key={file.id}
              onClick={() => {
                setActiveFileId(file.id);
                setSelectedFileName(file.name);
              }}
              className={`relative rounded-lg shadow hover:shadow-md transition-all p-4 flex items-center justify-center text-center cursor-pointer h-17
                ${
                  hasQuotation
                    ? "bg-[#59ceee] text-white"
                    : "bg-[#656668] text-white"
                }
                ${
                  isActive
                    ? hasQuotation
                      ? "border-3 border-[#656668]"
                      : "border-3 border-[#59ceee]"
                    : ""
                }
              `}
            >
              <p className="font-medium">{file.name}</p>

              {isActive && (
                <span
                  className={`absolute top-1 right-1 rounded-full w-2 h-2 ${
                    hasQuotation ? "bg-[#656668]" : "bg-[#59ceee]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default File;
