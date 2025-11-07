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

  // holds string from GET /uploader/get_quote/ -> { id, text }
  const [quoteString, setQuoteString] = useState("");

  // Fetch files repeatedly
  useEffect(() => {
    dispatch(fetchFiles());
    const interval = setInterval(() => dispatch(fetchFiles()), 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Fetch quotation base string on load
  useEffect(() => {
    fetch(`${BASE_URL}get_quote/`)
      .then((res) => res.json())
      .then((data) => {
        // API returns { id: number, text: "QUOTE-SE-323-25-29" }
        setQuoteString(data?.text ?? "");
      })
      .catch((err) => console.error("Error fetching quote:", err));
  }, []);

  // Loading and error states
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

  // Make Quotation Logic
  const handleMakeQuotation = async () => {
    if (!selectedFileName) {
      alert("Please select a file first.");
      return;
    }

    const selectedFile = files.find((file) => file.name === selectedFileName);

    // If file already has a quotation → Just navigate (no update)
    if (selectedFile?.quotationname) {
      navigate("/viewer", { state: { fileName: selectedFileName } });
      return;
    }

    // No quotation exists → generate a new one
    if (typeof quoteString !== "string" || !quoteString.includes("-")) {
      alert("Quotation seed not available/invalid. Refresh and try again.");
      return;
    }

    const parts = quoteString.split("-");
    parts[2] = (parseInt(parts[2], 10) + 1).toString();
    const updatedQuotation = parts.join("-");

    // 1️⃣ POST to /uploader/quote/
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

      // Update stored string so the next increment continues
      setQuoteString(updatedQuotation);
    } catch (err) {
      console.error("Failed to post quotation:", err);
      alert("Failed to create quotation on server.");
      return;
    }

    // 2️⃣ POST to /uploader/update_dashboard/
    try {
      const dashboardResp = await fetch(`${BASE_URL}update_dashboard/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // this one accepts JSON
        body: JSON.stringify({
          projectName: selectedFileName, // ✅ from selected file
          quotationname: updatedQuotation, // ✅ new quotation
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

    // 3️⃣ Navigate with fileName only (no quotationName passed anymore)
    navigate("/viewer", {
      state: { fileName: selectedFileName },
    });
  };

  return (
    <div className="w-full h-full bg-white overflow-y-auto rounded-lg p-2.5 flex flex-col">
      {/* Header */}
      <div className="w-full h-20 flex flex-row justify-between items-center mb-3">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center m-4">
          ASSEMBLIES
        </h2>
        <div className="hidden md:block">
          <button onClick={handleMakeQuotation} className="m-3 relative group">
            <div className="absolute top-1/2 right-1 -translate-y-1/2 duration-400 w-10 group-hover:w-[95.9%] h-[82%] bg-white flex justify-center items-center rounded-md p-1">
              <FilePlus2 style={{ width: 20, height: 20 }} color="#0e9dc7" />
            </div>
            <div className="bg-[#3da5c5] w-50 h-10 flex justify-start items-center rounded-lg">
              <p className="ml-4 text-white">MAKE QUOTATION</p>
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
        {files.map((file) => {
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
