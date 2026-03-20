import React, { use, useEffect, useRef, useState, useMemo } from "react";
import { CloudUpload, Info, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteFileByName, fetchFiles } from "../redux/FilesSlice";
import Loading from "../components/Loading";
import Error from "../components/Error";
import axios from "axios";
import { BASE_URL, SPI_URL } from "../utils/AppConstant";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";
import { MdOutlineRateReview, MdDelete } from "react-icons/md";

const StatusDropdown = ({ value, options, onChange }) => {
  const STATUS_STYLES = {
    CANCELLED: {
      border: "border-red-500",
      bg: "bg-red-500",
      text: "text-black",
    },
    PENDING: {
      border: "border-[#ffea00]",
      bg: "bg-[#ffea00]",
      text: "text-black",
    },
    REVIEW: {
      border: "border-orange-500",
      bg: "bg-orange-500",
      text: "text-black",
    },
    SENT: {
      border: "border-green-500",
      bg: "bg-green-500",
      text: "text-black",
    },
    "PO PENDING": {
      border: "border-blue-100",
      bg: "bg-blue-300",
      text: "text-black",
    },
    "PO RECEIVED": {
      border: "border-blue-300",
      bg: "bg-blue-500",
      text: "text-black",
    },
  };

  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleToggle = () => {
    if (!ref.current) return;

    // 🔍 find scroll parent
    const scrollParent = ref.current.closest(".overflow-y-auto");
    const parentRect = scrollParent.getBoundingClientRect();
    const rect = ref.current.getBoundingClientRect();

    const spaceBelow = parentRect.bottom - rect.bottom;
    const spaceAbove = rect.top - parentRect.top;

    // dropdown height ≈ 160px
    setOpenUp(spaceBelow < 160 && spaceAbove > spaceBelow);
    setOpen((p) => !p);
  };

  return (
    <div ref={ref} className="relative inline-block sm:w-[110px] md:w-[130px]">
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full ${
          STATUS_STYLES[value]?.bg
        } border rounded-xl px-2 py-2
        font-semibold text-md shadow-sm hover:shadow transition-all duration-200
        flex justify-between items-center ${
          STATUS_STYLES[value]?.border || ""
        }`}
      >
        <span className={` ${STATUS_STYLES[value]?.text}`}>{value}</span>
        <span className={` ${STATUS_STYLES[value]?.text}`}>▼</span>
      </button>

      {open && (
        <ul
          className={`absolute z-[9999] w-full bg-white border border-[#0e9dc7]
          rounded-xl shadow-lg ${
            openUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-[#3da5c5]/10 ${
                opt === value ? "font-semibold" : ""
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { role } = useAuthContext();
  const CAN_DELETE = [import.meta.env.VITE_ROLE1];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const files = useSelector((state) => state.files.data);
  const status = useSelector((state) => state.files.status);

  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quoteString, setQuoteString] = useState("");
  const [localQuote, setLocalQuote] = useState({});

  const [showPoPopup, setShowPoPopup] = useState(false);
  const [popupFilename, setPopupFilename] = useState("");
  const [popupQuote, setPopQuote] = useState("");
  const [popupTotal, setPoptTotal] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [popupInput, setPopupInput] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [showPoContact, setShowPoContact] = useState(false);
  const [poContact, setPoContact] = useState("");

  const [localStatus, setLocalStatus] = useState({});
  const [previousStatus, setPreviousStatus] = useState({});

  const [extraInfo, setExtraInfo] = useState(false);
  const [extraInfoInput, setExtraInfoInput] = useState("");

  const statusOptions = [
    "CANCELLED",
    "PENDING",
    "REVIEW",
    "SENT",
    "PO PENDING",
    "PO RECEIVED",
  ];

  useEffect(() => {
    dispatch(fetchFiles());
    const interval = setInterval(() => dispatch(fetchFiles()), 3000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("site_url", SPI_URL);

    try {
      setUploading(true);

      await axios.post(`${BASE_URL}upload/zip/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchFiles());
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleMakeQuotation = async (filekey) => {
    if (!filekey) {
      alert("Please select a file first.");
      return;
    }

    const selectedFile = files.find((file) => file.name === filekey);
    if (selectedFile?.quotationname) {
      navigate("/viewer", { state: { fileName: filekey } });
      return;
    }

    let latestQuote;
    try {
      const res = await fetch(`${BASE_URL}get_quote/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
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
          projectName: filekey,
          quotationname: updatedQuotation,
        }),
      });
      if (!dashboardResp.ok) throw new Error(`HTTP ${dashboardResp.status}`);
    } catch (err) {
      console.error("Failed to update dashboard:", err);
      alert("Dashboard update failed.");
      return;
    }

    navigate("/viewer", { state: { fileName: filekey } });
  };

  const filteredFiles = files.filter(
    (file) =>
      file.quotationname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ------------ SORTING ---------------
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const aHasQuotation = !!a.quotationname;
    const bHasQuotation = !!b.quotationname;

    if (!aHasQuotation && bHasQuotation) return -1;
    if (aHasQuotation && !bHasQuotation) return 1;

    if (!aHasQuotation && !bHasQuotation) {
      return new Date(a.uploaded_at) - new Date(b.uploaded_at);
    }

    const nameCompare = b.quotationname.localeCompare(a.quotationname);
    if (nameCompare !== 0) return nameCompare;

    return new Date(a.uploaded_at) - new Date(b.uploaded_at);
  });

  const saveponumber = async (poname, po_num) => {
    setUploading(true);
    try {
      const resp = await fetch(`${BASE_URL}update_dashboard/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: popupFilename,
          quotationname: popupQuote,
          grandTotal: popupTotal,
          projectStatus: orderStatus,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(
          `Dashboard update failed: HTTP ${resp.status} - ${errText}`,
        );
      }

      dispatch(fetchFiles());

      const response = await fetch(`${BASE_URL}add_po/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: poname,
          po_number: po_num,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`PO save failed: HTTP ${response.status} - ${errText}`);
      }

      const res = await fetch(`${BASE_URL}orderstatus/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: poname,
          quotationname: popupQuote,
          po_number: po_num,
        }),
      });

      dispatch(fetchFiles());
    } catch (error) {
      console.error("Error in saveponumber:", error);
    } finally {
      setPopupInput("");
      setUploading(false);
    }
  };

  const savePoContact = async () => {
    setUploading(true);

    try {
      const resp1 = await fetch(`${BASE_URL}pending/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: popupFilename,
          projectStatus: "PO PENDING",
        }),
      });

      if (!resp1.ok) {
        throw new Error("Failed to update project status");
      }

      const resp2 = await fetch(`${BASE_URL}addcontact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: popupFilename,
          quotationname: popupQuote,
          po_contact: poContact,
          po_number: "N/A",
        }),
      });

      if (!resp2.ok) {
        throw new Error("Failed to save PO contact");
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      dispatch(fetchFiles());
      setUploading(false);
    }
  };

  const handleDelete = async (projectName) => {
    setDeleting(true);
    try {
      const response = await fetch(`${BASE_URL}delete/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: projectName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(deleteFileByName(projectName));

        dispatch(fetchFiles());
        setDeleting(false);
        const apiMessage = "✅ DELETED SUCCESFULL";
        setFormSuccess(apiMessage);
      } else {
        console.error("Error:", data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const projectStatusUpdate = async (name, quote, total, status) => {
    setUploading(true);
    try {
      const resp = await fetch(`${BASE_URL}update_dashboard/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: name,
          quotationname: quote,
          grandTotal: total,
          projectStatus: status,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errText}`);
      }

      dispatch(fetchFiles());
    } catch (err) {
      alert("Failed to update project status.");
    } finally {
      dispatch(fetchFiles());
      setUploading(false);
    }
  };

  const addOnInfo = async (projectName, ext_info) => {
    setUploading(true);
    try {
      const response = await fetch(`${BASE_URL}addinfo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          ext_info,
        }),
      });

      if (response.ok) {
        const apiMessage = "✅ Project Note Added";
        setFormSuccess(apiMessage);
        setUploading(false);
      }
    } catch (err) {
      console.error("Failed to update quotation name", err);
    }
  };
  const updateQuotationName = async (projectName, quotationname) => {
    setUploading(true);
    try {
      const response = await fetch(`${BASE_URL}rename_quote/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          quotationname,
        }),
      });

      if (response.ok) {
        dispatch(
          updateQuotationName({
            fileName: projectName,
            newQuotationName: quotationname,
          }),
        );

        dispatch(fetchFiles());

        setUploading(false);
        alert("✅ Quotation name Updated");
      }
    } catch (err) {
      console.error("Failed to update quotation name", err);
      setUploading(false);
    }
  };

  function debounce(fn, delay = 1000) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const debouncedUpdateQuotationName = useMemo(
    () => debounce(updateQuotationName, 2000),
    [],
  );

  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [formSuccess]);

  useEffect(() => {
    const statusMap = {};
    files.forEach((f) => {
      statusMap[f.name] = f.projectStatus;
    });
    setLocalStatus(statusMap);
  }, [files]);

  return (
    <>
      {status === "failed" ? (
        <Error />
      ) : (
        (status === "loading" || uploading || deleting) && <Loading />
      )}

      <div className="flex flex-col w-full h-full">
        {/* HEADER */}
        <div className="w-full h-15 p-2.5">
          <div className="flex flex-row md:mr-1 justify-between">
            <div className="flex items-center md:ml-1">
              {/* <h2 className="text-2xl font-medium text-[#0e9dc7] flex items-center m-4">
                DELIVERIES
              </h2> */}
              <div className="ml-1">
                <h1 className="text-2xl font-medium text-[#0e9dc7]  pl-3.5 pt-5 pr-8 ">
                  DELIVERIES
                </h1>
                <p className="text-sm text-[#444] ml-3.5">
                  All the assembly specific data.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center items-center">
              <input
                type="text"
                placeholder="Search"
                className="p-2 border border-[#3da5c5] rounded hidden md:block outline-none focus:outline-none"
                style={{ width: "180px", height: "36px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div>
                <label
                  htmlFor="fileUploader"
                  className="m-3 relative group cursor-pointer hidden md:block"
                >
                  <div className="relative bg-[#3da5c5] w-34 h-10 rounded-lg overflow-hidden flex items-center">
                    <p className="ml-4 text-white z-10  group-hover:opacity-0">
                      UPLOAD
                    </p>

                    <div className="absolute top-1/2 right-1 -translate-y-1/2 w-10 h-[80%] bg-white rounded-md flex items-center justify-center transition-all duration-100 group-hover:w-[94%]">
                      <CloudUpload
                        color="#0e9dc7"
                        style={{ width: 20, height: 20 }}
                        className="transition-all"
                      />
                    </div>
                  </div>
                </label>

                <input
                  id="fileUploader"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>
              <div className="flex justify-centeritems-center">
                <label
                  htmlFor="fileUploader"
                  className="m-3 relative group cursor-pointer md:hidden"
                >
                  <CloudUpload
                    color="#0e9dc7"
                    style={{ width: 30, height: 30 }}
                    className="mr-2"
                  />
                </label>

                <input
                  id="fileUploader"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="hidden md:flex flex-col w-full flex-1 p-3 mt-8">
          <div className="flex flex-col w-full h-full rounded-lg overflow-hidden">
            <table className="w-full table-fixed">
              <thead className="sticky top-0 z-10 bg-[#ececec]">
                <tr className="text-center">
                  <th className="px-6 py-4 text-[17px] font-semibold uppercase">
                    Projects
                  </th>
                  <th className="px-6 py-4 text-[17px] font-semibold uppercase">
                    Upload Date
                  </th>
                  <th className="px-6 py-4 text-[17px] font-semibold uppercase">
                    Quotation Name
                  </th>
                  <th className="px-6 py-4 text-[17px] font-semibold uppercase">
                    Quotation Date
                  </th>
                  <th className="px-6 py-4 text-[17px] font-semibold uppercase">
                    Grand Total
                  </th>
                  <th className="px-6 py-4 text-[17px] font-semibold uppercase">
                    Status
                  </th>
                  <th className="px-2 py-4 text-[17px] font-semibold up">
                    Actions
                  </th>
                </tr>
              </thead>
            </table>

            <div className="overflow-y-auto max-h-[58vh]">
              <table className="w-full table-fixed">
                <tbody className="text-[#444] text-center">
                  {sortedFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 ">
                      <td className="px-2 py-2 break-words">{file.name}</td>
                      <td className="px-6 py-4">
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </td>
                      {/* <td className="px-6 py-4">{file.quotationname}</td> */}
                      <td className="py-4">
                        {CAN_DELETE.includes(role) ? (
                          <input
                            type="text"
                            className="rounded py-1 w-full text-center text-sm md:text-[16.5px]"
                            value={localQuote[file.name] ?? file.quotationname}
                            onChange={(e) => {
                              const value = e.target.value;

                              setLocalQuote((prev) => ({
                                ...prev,
                                [file.name]: value,
                              }));

                              debouncedUpdateQuotationName(file.name, value);
                            }}
                          />
                        ) : (
                          file.quotationname
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {file.grandTotal
                          ? new Date(file.last_date).toLocaleDateString()
                          : ""}
                      </td>
                      <td className="px-6 py-4">
                        {file.grandTotal
                          ? Number(file.grandTotal).toFixed(2)
                          : ""}
                      </td>

                      <td className="px-6 py-4">
                        <td>
                          <StatusDropdown
                            value={
                              localStatus[file.name] ??
                              file.projectStatus ??
                              "PENDING"
                            }
                            options={statusOptions}
                            onChange={(newStatus) => {
                              const oldStatus =
                                localStatus[file.name] ??
                                file.projectStatus ??
                                "PENDING";

                              setOrderStatus(newStatus);
                              setLocalStatus((p) => ({
                                ...p,
                                [file.name]: newStatus,
                              }));
                              setPreviousStatus((p) => ({
                                ...p,
                                [file.name]: oldStatus,
                              }));

                              if (newStatus === "PO RECEIVED") {
                                setPopupFilename(file.name);
                                setPopQuote(file.quotationname);
                                setPoptTotal(file.grandTotal);
                                setPopupInput("");
                                setShowPoPopup(true);
                              } else if (newStatus === "PO PENDING") {
                                setPopupFilename(file.name);
                                setPopQuote(file.quotationname);
                                setPoptTotal(file.grandTotal);
                                setPopupInput("N/A");
                                setPoContact("");
                                setShowPoContact(true);
                              } else {
                                projectStatusUpdate(
                                  file.name,
                                  file.quotationname,
                                  file.grandTotal,
                                  newStatus,
                                );
                              }
                            }}
                          />
                        </td>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-row justify-center items-center gap-4">
                          <button
                            onClick={() => handleMakeQuotation(file.name)}
                          >
                            <MdOutlineRateReview
                              className="hover:text-[#0e9dc7] "
                              style={{ width: "25px", height: "25px" }}
                            />
                          </button>
                          <button
                            onClick={() => {
                              setExtraInfoInput(file.ext_info);
                              setPopupFilename(file.name);
                              setExtraInfo(true);
                            }}
                          >
                            <Info
                              className="hover:text-[#0e9dc7] "
                              style={{ width: "25px", height: "25px" }}
                            />
                          </button>
                          {CAN_DELETE.includes(role) && (
                            <button
                              onClick={() =>
                                window.confirm(
                                  "Are You sure you want to delete this assembly?",
                                )
                                  ? handleDelete(file.name)
                                  : null
                              }
                            >
                              <MdDelete
                                className="hover:text-[#0e9dc7] "
                                style={{ width: "25px", height: "25px" }}
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <div className="block md:hidden w-full flex-1 p-3 space-y-3 overflow-y-auto mt-10">
          {sortedFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200 hover:shadow-md"
            >
              <div className="font-semibold text-lg text-gray-800 mb-2">
                {file.name}
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-semibold">Upload Date:</span>{" "}
                  {new Date(file.uploaded_at).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Quotation Name:</span>{" "}
                  {file.quotationname || "—"}
                </p>
                <p>
                  <span className="font-semibold">Quotation Date:</span>{" "}
                  {file.grandTotal
                    ? new Date(file.last_date).toLocaleDateString()
                    : "—"}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  {file.projectStatus}
                </p>
                <p>
                  <span className="font-semibold">Grand Total:</span>{" "}
                  {file.grandTotal ? Number(file.grandTotal).toFixed(2) : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showPoContact && (
        <div className="fixed inset-0 backdrop-blur-lg flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-100">
            <h2 className="text-xl font-semibold mb-4 text-center">
              PO Contact Info
            </h2>

            <div className="mb-3">
              <label className="text-sm font-semibold">
                ASSEMBLY : {popupFilename}
              </label>
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold">
                Enter Contact Name
              </label>
              <input
                type="text"
                value={poContact}
                onChange={(e) => setPoContact(e.target.value)}
                className="w-full mt-1 p-2 border border-[#3da5c5] rounded"
              />
            </div>

            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  const prevStatus = previousStatus[popupFilename];

                  setLocalStatus((prev) => ({
                    ...prev,
                    [popupFilename]: prevStatus,
                  }));

                  projectStatusUpdate(
                    popupFilename,
                    popupQuote,
                    popupTotal,
                    prevStatus,
                  );

                  setShowPoContact(false);
                  setPoContact("");
                }}
              >
                Cancel
              </button>

              <button
                className={`px-4 py-2 text-white rounded 
            ${
              poContact.trim()
                ? "bg-[#3da5c5]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
                disabled={!poContact.trim()}
                onClick={async () => {
                  if (!poContact.trim()) return;
                  savePoContact(popupFilename, popupInput);
                  setShowPoContact(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showPoPopup && (
        <div className="fixed inset-0 backdrop-blur-lg flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-100">
            <h2 className="text-xl font-semibold mb-4 text-center">
              PO Details
            </h2>

            <div className="mb-3">
              <label className="text-sm font-semibold">
                ASSEMBLY : {popupFilename}
              </label>
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold">Enter Po Number</label>
              <input
                type="text"
                value={popupInput}
                onChange={(e) => setPopupInput(e.target.value)}
                className="w-full mt-1 p-2 border border-[#3da5c5] rounded"
              />
            </div>

            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  const prevStatus = previousStatus[popupFilename];

                  setLocalStatus((prev) => ({
                    ...prev,
                    [popupFilename]: prevStatus,
                  }));

                  projectStatusUpdate(
                    popupFilename,
                    popupQuote,
                    popupTotal,
                    prevStatus,
                  );

                  setShowPoPopup(false);
                  setPopupInput("");
                }}
              >
                Cancel
              </button>

              <button
                className={`px-4 py-2 text-white rounded 
            ${
              popupInput.trim()
                ? "bg-[#3da5c5]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
                disabled={!popupInput.trim()}
                onClick={async () => {
                  if (!popupInput.trim()) return;
                  saveponumber(popupFilename, popupInput);
                  setShowPoPopup(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {extraInfo && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-center">Note</h2>
              <button onClick={() => setExtraInfo(false)}>
                <X />
              </button>
            </div>

            <div className="mb-4">
              <textarea
                value={extraInfoInput || ""}
                onChange={(e) => setExtraInfoInput(e.target.value)}
                className="w-full mt-1 p-2 border border-[#3da5c5] rounded h-32 resize-none overflow-x-auto overflow-y-auto whitespace-nowrap outline-[#3da5c5] focus:outline-[#3da5c5]"
                placeholder="Type here ..."
              />
            </div>

            <div className="flex justify-center">
              <button
                className="px-4 py-2 text-white bg-[#3da5c5] rounded"
                onClick={() => {
                  addOnInfo(popupFilename, extraInfoInput);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {formSuccess && (
        <div className="fixed top-2 right-10 z-50 w-fit rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-lg text-emerald-700 shadow-lg animate-slide-in">
          {formSuccess}
        </div>
      )}
    </>
  );
};

export default Dashboard;
