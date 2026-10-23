import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../utils/AppConstant";
import Loading from "../components/Loading";
import Error from "../components/Error";
import {
  FileDown,
  FolderDown,
  FolderSync,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { TbReplace } from "react-icons/tb";
import { useAuthContext } from "../auth/AuthContext";

const COST_LABEL = [
  "MAT COST",
  "VMC COST",
  "CNC COST",
  "HANDLING COST",
  "LASER COST",
  "BENDING COST",
  "EXTRA COST",
  "WELDING COST",
  "UNIT COST",
  "QUANTITY",
  "PROFIT",
];
const PriceList = () => {

  const { user_id } = useAuthContext();

  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProjects, setExpandedProjects] = useState(() => new Set());
  const [partDetailsPopup, setPartDetailsPopup] = useState(false);
  const [fileReplacePopUp, setFileReplacePopUp] = useState(false);
  const [partDetails, setPartDetails] = useState([]);
  const [fileReplaceFolderName, setFileReplaceFolderName] = useState();
  const [assemblyReplacePopUp, setAssemblyReplacePopup] = useState(false);
  const [replaceZipFile,setReplaceZipFile] = useState(null);
  const [replaceFile1, setReplaceFile1] = useState(null);
  const [replaceFile2, setReplaceFile2] = useState(null);
  const [replacingFiles, setReplacingFiles] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // ------------------------------
  // Fetch Price List + PO List
  // ------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [priceRes, poRes] = await Promise.all([
          axios.get(`${BASE_URL}pricelist/`),
          axios.get(`${BASE_URL}fetch_po/`),
        ]);

        const priceList = priceRes.data?.data || [];
        const poList = poRes.data?.data || [];

        // Create PO lookup map
        const poMap = poList.reduce((acc, item) => {
          acc[item.projectName?.toLowerCase()] = item.po_number || "N/A";
          return acc;
        }, {});

        // Group price list and attach PO number
        const grouped = priceList.reduce((acc, item) => {
          const project = item.project_name || "Unknown Project";
          const key = project.toLowerCase();

          if (!acc[project]) {
            acc[project] = {
              po_number: poMap[key] || "N/A",
              items: [],
            };
          }

          acc[project].items.push(item);
          return acc;
        }, {});

        setGroupedData(grouped);
      } catch (err) {
        setError(
          "We could not load the price list right now. Please try again shortly.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ------------------------------
  // Sorted project entries
  // ------------------------------
  const projectEntries = useMemo(
    () =>
      Object.entries(groupedData).sort(([a], [b]) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      ),
    [groupedData],
  );

  // ------------------------------
  // Cleanup expanded projects when filters change
  // ------------------------------
  useEffect(() => {
    setExpandedProjects((prev) => {
      if (prev.size === 0) return prev;

      const valid = new Set(projectEntries.map(([name]) => name));
      let changed = false;
      const next = new Set();

      prev.forEach((name) => {
        if (valid.has(name)) next.add(name);
        else changed = true;
      });

      return changed ? next : prev;
    });
  }, [projectEntries]);

  // ------------------------------
  // Filter search results
  // ------------------------------
  const filteredEntries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return projectEntries;

    return projectEntries
      .map(([project, data]) => {
        const items = data.items;

        const projectMatch = project.toLowerCase().includes(q);
        const matchedItems = items.filter((item) =>
          (item.part_no || "").toLowerCase().includes(q),
        );

        if (projectMatch) return [project, data];
        if (matchedItems.length > 0)
          return [project, { ...data, items: matchedItems }];

        return null;
      })
      .filter(Boolean);
  }, [projectEntries, searchTerm]);

  const totalVisibleProjects = filteredEntries.length;
  const totalVisibleParts = filteredEntries.reduce(
    (acc, [, data]) => acc + data.items.length,
    0,
  );

  const autoExpand = searchTerm.trim().length > 0;

  // ------------------------------
  // Toggle accordion
  // ------------------------------
  const toggleProject = (name) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const downloadAllFilesAsZip = async (projectName) => {
    setLoading(true);
    try {
      // Get file list from your Django backend
      const response = await fetch(
        `${BASE_URL}${encodeURIComponent(projectName)}/`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch file list");
      }

      const data = await response.json();

      if (data.status !== "ok") {
        throw new Error(data.error || "Failed to fetch files");
      }

      const zip = new JSZip();

      // Download each file and add it to ZIP
      await Promise.all(
        data.files.map(async (file) => {
          const fileResponse = await fetch(file.url);

          if (!fileResponse.ok) {
            throw new Error(`Failed to download ${file.name}`);
          }

          const blob = await fileResponse.blob();

          zip.file(file.name, blob);
        }),
      );

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${projectName}.zip`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error("ZIP download failed:", error);
    }
  };
  const downloadSelectedFilesAsZip = async (projectName, filename) => {
    setLoading(true);
    try {
      // Get file list from your Django backend
      const response = await fetch(
        `${BASE_URL}${encodeURIComponent(projectName)}/${encodeURIComponent(filename)}/`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch file list");
      }

      const data = await response.json();

      if (data.status !== "ok") {
        throw new Error(data.error || "Failed to fetch files");
      }

      const zip = new JSZip();

      // Download each file and add it to ZIP
      await Promise.all(
        data.files.map(async (file) => {
          const fileResponse = await fetch(file.url);

          if (!fileResponse.ok) {
            throw new Error(`Failed to download ${file.name}`);
          }

          const blob = await fileResponse.blob();

          zip.file(file.name, blob);
        }),
      );

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${projectName}.zip`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error("ZIP download failed:", error);
    } finally {
      setLoading(false)
    }
  };

  //   const handleReplaceFiles = async () => {
  //   if (!replaceFile1 || !replaceFile2) {
  //     return;
  //   }

  //   try {
  //     setReplacingFiles(true);

  //     const formData = new FormData();

  //     formData.append("folder_name", fileReplaceFolderName);

  //     formData.append("new_file", replaceFile1);
  //     formData.append("new_file", replaceFile2);

  //     const response = await axios.post(
  //       `${BASE_URL}/api/onedrive/file-replace/`,
  //       formData
  //     );

  //     console.log("Replace response:", response.data);

  //     alert("Files replaced successfully");

  //     setReplaceFile1(null);
  //     setReplaceFile2(null);

  //     setFileReplacePopUp(false);

  //   } catch (error) {
  //     console.error("File replacement failed:", error);

  //     alert(
  //       error.response?.data?.error ||
  //       "Failed to replace files"
  //     );

  //   } finally {
  //     setReplacingFiles(false);
  //   }
  // };

  // ------------------------------
  // Render
  // ------------------------------

  const handleReplaceFiles = async () => {
    if (!replaceFile1 || !replaceFile2) {
      return;
    }

    try {
      setReplacingFiles(true);

      const formData = new FormData();

      formData.append("folder_name", fileReplaceFolderName);

      formData.append("new_file", replaceFile1);
      formData.append("new_file", replaceFile2);

      const response = await axios.post(`${BASE_URL}update/file/`, formData);

      const apiMessage = "✅ FILE REPLACE SUCCESSFULLY";
      setFormSuccess(apiMessage);

      setReplaceFile1(null);
      setReplaceFile2(null);
      setFileReplaceFolderName(null);
      setFileReplacePopUp(false);
    } catch (error) {
      console.error("File replacement failed:", error);

      const apiMessage = "❌ ERROR IN SAVING DATA";
      setFormError(apiMessage);
    } finally {
      setReplacingFiles(false);
    }
  };

  const handleReplaceZipFiles = async () => {
    if(!replaceZipFile) return 

     try {
      setReplacingFiles(true);

      const formData = new FormData();

      formData.append("folder_name", fileReplaceFolderName);

      formData.append("new_file", replaceZipFile);

      formData.append("user_id", user_id)

      const response = await axios.post(`${BASE_URL}assmeblyfile/update/`, formData);

      const apiMessage = "✅ FILES REPLACED SUCCESSFULLY";
      setFormSuccess(apiMessage);

      setReplaceZipFile(null)
      setFileReplaceFolderName(null);
      setAssemblyReplacePopup(false);
      setReplacingFiles(false)
    } catch (error) {
      console.error("File replacement failed:", error);

      const apiMessage = "❌ ERROR IN REPLACING FILES";
      setFormError(apiMessage);
    } finally {
      setReplacingFiles(false);
    }

  }
  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => {
        setFormError("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [formError]);

  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [formSuccess]);

  return (
    <>
      <div className="flex h-full w-full flex-col bg-white p-4 md:p-8">
        {/* HEADER */}
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-medium text-[#0e9dc7]">
              PRICE CATALOGUE
            </h1>
            <p className="text-sm text-[#444]">
              Specific pricing details for a Specific Part No.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {/* Search */}
            <div className="relative w-full max-w-xs">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="m21 21-4.35-4.35M6 11a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" />
                </svg>
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7]"
              />
            </div>

            {/* Counters */}
            <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
              <span className="rounded-full bg-black/5 px-3 py-1 text-[#0e9dc7]">
                {totalVisibleProjects} Project
                {totalVisibleProjects !== 1 && "s"}
              </span>
              <span className="rounded-full bg-black/5 px-3 py-1 text-[#0e9dc7]">
                {totalVisibleParts} Part{totalVisibleParts !== 1 && "s"}
              </span>
            </div>
          </div>
        </header>

        {/* BODY */}
        <section className=" overflow-y-auto flex-1 space-y-4 pr-1">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loading />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <Error />
            </div>
          ) : projectEntries.length === 0 ? (
            <EmptyState
              title="No price data available"
              subtitle="Once projects have price details, they will appear here instantly."
            />
          ) : filteredEntries.length === 0 ? (
            <EmptyState
              title="No matches found"
              subtitle="Try a different project name or part number search."
            />
          ) : (
            filteredEntries.map(([projectName, data]) => {
              const { po_number, items } = data;
              const isExpanded =
                autoExpand || expandedProjects.has(projectName);

              return (
                <article
                  key={projectName}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200"
                >
                  {/* Project Header */}
                  <button
                    onClick={() => toggleProject(projectName)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-[#0e9dc7]">
                        {projectName}
                      </h2>
                      <p className="text-md text-slate-600">
                        PO Number:{" "}
                        <span className="font-semibold text-[#0e9dc7]">
                          {po_number}
                        </span>
                      </p>
                      <span className="text-sm text-slate-500">
                        {items.length} part{items.length !== 1 && "s"} listed
                      </span>
                    </div>

                    <div className="flex flex-row justify-between gap-4">
                      <FolderDown
                        className="text-[#0e9dc7] size-7 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAllFilesAsZip(projectName);
                        }}
                      />
                      <FolderSync 
                       className="text-[#0e9dc7] size-7 hover:scale-110"
                       onClick={(e) => {
                          e.stopPropagation();
                          setFileReplaceFolderName(projectName);
                          setAssemblyReplacePopup(true);
                        }}
                      />
                      <svg
                        className={`h-8 w-8 text-slate-400 transition-transform ${
                          isExpanded && "rotate-180"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m6 9 6 6 6-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* List of Parts */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50 p-4">
                      <div className="grid max-h-96 grid-cols-1 gap-4 overflow-y-auto pr-4 sm:grid-cols-2 lg:grid-cols-3 p-2">
                        {items.map((item, idx) => (
                          <div
                            key={`${item.part_no}-${idx}`}
                            className="rounded-xl border border-slate-200 bg-white p-3.5 hover:-translate-y-1 hover:shadow-md transition"
                            onClick={(e) => {
                              console.log("Item:", item);
                              e.stopPropagation();
                              setPartDetailsPopup(true);
                              setPartDetails([
                                item.mat ?? "N/A",
                                item.vmc ?? "N/A",
                                item.cnc ?? "N/A",
                                item.hand ?? "N/A",
                                item.laser ?? "N/A",
                                item.bend ?? "N/A",
                                item.extra ?? "N/A",
                                item.weld ?? "N/A",
                                item.unit ?? "N/A",
                                item.qunatity ?? 1,
                                item.profit ?? "N/A",
                              ]);
                            }}
                          >
                            <div className="flex flex-row justify-between items-center w-full">
                              <p className="text-xs font-medium uppercase text-slate-500">
                                Part Number
                              </p>
                              <div className="flex flex-row gap-4 items-center">
                                <TbReplace
                                  className="text-[#0e9dc7] size-6 hover:scale-110 hover:cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFileReplaceFolderName(projectName);
                                    setFileReplacePopUp(true);
                                  }}
                                />
                                <FileDown
                                  className="text-[#0e9dc7] hover:scale-110 hover:cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadSelectedFilesAsZip(projectName, item.part_no);
                                  }}
                                />
                              </div>
                            </div>
                            <p className="mt-1 text-lg font-semibold text-[#0e9dc7]">
                              {item.part_no || "Not specified"}
                            </p>

                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-md font-medium text-slate-500">
                                Unit
                              </span>
                              <span className="text-md font-semibold text-[#0e9dc7]">
                                {item.unit || "N/A"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
      <AnimatePresence>
        {partDetailsPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-6 rounded-lg shadow-lg w-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-center text-slate-500">
                  Cost Break-Up:
                </h2>
                <button
                  onClick={() => {
                    setPartDetailsPopup(false);
                    setPartDetails({});
                  }}
                >
                  <X className="text-slate-500" />
                </button>
              </div>
              <div className="flex-1 text-slate-500">
                <ul>
                  {partDetails.map((value, index) => (
                    <li key={index}>
                      {COST_LABEL[index]} : {value}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
        {fileReplacePopUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-6 rounded-lg shadow-lg w-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-500 truncate">
                  Replace Files : {fileReplaceFolderName}
                </h2>

                <button
                  onClick={() => {
                    setFileReplacePopUp(false);
                    setFileReplaceFolderName();
                    setReplaceFile1(null);
                    setReplaceFile2(null);
                  }}
                >
                  <X className="text-slate-500" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Select PDF FILE
                  </label>

                  <input
                    type="file"
                    onChange={(e) => {
                      setReplaceFile1(e.target.files?.[0] || null);
                    }}
                    className="block w-full text-sm text-slate-500 border p-2 rounded border-[#0e9dc7]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Select STEP FILE
                  </label>

                  <input
                    type="file"
                    onChange={(e) => {
                      setReplaceFile2(e.target.files?.[0] || null);
                    }}
                    className="block w-full text-sm text-slate-500 border p-2 rounded border-[#0e9dc7]"
                  />
                </div>

                {/* Replace button */}
                <button
                  onClick={handleReplaceFiles}
                  disabled={!replaceFile1 || !replaceFile2 || replacingFiles}
                  className="w-full bg-[#0e9dc7] text-white py-2 rounded-md hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replacingFiles ? "Replacing..." : "Replace Files"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

          {assemblyReplacePopUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-6 rounded-lg shadow-lg w-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-500 truncate">
                  Replace Assmebly : {fileReplaceFolderName}
                </h2>

                <button
                  onClick={() => {
                    setAssemblyReplacePopup(false);
                    setFileReplaceFolderName();
                    setReplaceZipFile(null)
                  }}
                >
                  <X className="text-slate-500" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Select ASSEMBLY FILE
                  </label>

                  <input
                    type="file"
                    onChange={(e) => {
                      setReplaceZipFile(e.target.files[0]);
                    }}
                    className="block w-full text-sm text-slate-500 border p-2 rounded border-[#0e9dc7]"
                  />
                </div>

                {/* Replace button */}
                <button
                  onClick={handleReplaceZipFiles}
                  disabled={!replaceZipFile || replacingFiles}
                  className="w-full bg-[#0e9dc7] text-white py-2 rounded-md hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replacingFiles ? "Replacing..." : "Replace Files"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {formError && (
        <div className="fixed top-0 right-10 z-50 w-fit rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-lg text-rose-600 shadow-lg animate-slide-in">
          {formError}
        </div>
      )}
      {formSuccess && (
        <div className="fixed top-0 right-10 z-50 w-fit rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-lg text-emerald-700 shadow-lg animate-slide-in">
          {formSuccess}
        </div>
      )}
      {replacingFiles && (
        <div className="w-full  h-screen">
          <Loading />
        </div>
      )}
    </>
  );
};

// ------------------------------
// Reusable empty state component
// ------------------------------
const EmptyState = ({ title, subtitle }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
    <p className="text-lg font-semibold text-slate-700">{title}</p>
    <p className="text-sm">{subtitle}</p>
  </div>
);

export default PriceList;
