import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/AppConstant";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, MoveLeft, Save, Table2 } from "lucide-react";
import { SlArrowDown } from "react-icons/sl";
import Loading from "../components/Loading";
import * as XLSX from "xlsx";
import Portal from "../components/Portal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* -------------------------------- CONFIG -------------------------------- */

const BOM_FIELDS = [
  { key: "part_no", label: "PART No.", width: "150px" },
  { key: "description", label: "DESCRIPTION", width: "300px" },
  { key: "quantity", label: "QTY", width: "70px" },
  { key: "part_status", label: "STATUS", width: "120px" },
  { key: "part_remark", label: "REMARKS", width: "200px" },
];

const EDITABLE_FIELDS = new Set(["quantity", "part_status", "part_remark"]);

const JOB_STATUSES = [
  "NOT YET",
  "RM PROCESSING",
  "MACHINING",
  "FINISHING",
  "QC",
  "READY FOR DISPATCH",
];

const STATUS_COLORS = {
  "NOT YET": "text-red-500",
  "MATERIAL PURCHASE": "text-yellow-800",
  "RM PROCESSING": "text-yellow-800",
  MACHINING: "text-orange-500",
  FINISHING: "text-yellow-400",
  QC: "text-blue-500",
  "READY FOR DISPATCH": "text-green-500",
};

/* ------------------------------ COMPONENT ------------------------------ */

const BomTable = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const projectName = state?.name || "";
  const poNumber = state?.po_no || "";

  const [bomData, setBomData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [openIndex, setOpenIndex] = useState(null);
  const [dropdownDir, setDropdownDir] = useState({});
  const dropdownRefs = useRef([]);

  /* ------------------------------ FETCH BOM ------------------------------ */

  useEffect(() => {
    const fetchBom = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}fetchbom/?project_name=${projectName}`,
        );

        if (res.data.status === "ok") {
          const sorted = res.data.data
            .map((row) => ({
              ...row,
              description: row.description || "N/A",
            }))
            .sort((a, b) => a.part_no.localeCompare(b.part_no));

          setBomData(sorted);
        } else {
          alert("No BOM data found");
        }
      } catch {
        alert("Failed to fetch BOM");
      } finally {
        setLoading(false);
      }
    };

    fetchBom();
  }, [projectName]);

  /* -------------------------- UNSAVED CHANGES --------------------------- */

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  /* ------------------------------ HELPERS ------------------------------ */

  const handleCellChange = (rowIndex, key, value) => {
    setIsDirty(true);
    setBomData((prev) =>
      prev.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row)),
    );
  };

  /* ------------------------------ SAVE ------------------------------ */

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = bomData.map((row) => ({
        project_name: projectName,
        part_no: row.part_no,
        description: row.description,
        quantity: row.quantity,
        part_status: row.part_status || "",
        part_remark: row.part_remark || "",
      }));

      const res = await axios.post(`${BASE_URL}update_cost/`, payload);

      if (res.data.status === "ok") {
        alert("✔ Saved successfully");
        setIsDirty(false);
      } else {
        alert("Save failed");
      }
    } catch {
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------ EXPORT ------------------------------ */

  const exportToExcel = () => {
    const data = bomData.map((row, i) => ({
      "SL NO": i + 1,
      PART_NO: row.part_no,
      DESCRIPTION: row.description,
      QTY: row.quantity,
      STATUS: row.part_status,
      REMARKS: row.part_remark,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BOM");
    XLSX.writeFile(wb, `${projectName}_BOM.xlsx`);
  };

  // const exportToPDF = () => {
  //   const doc = new jsPDF("p", "pt", "a4");

  //   doc.setFontSize(18);
  //   doc.text(`BOM SHEET - ${projectName}`, 40, 40);

  //   autoTable(doc, {
  //     startY: 70,
  //     head: [["Sl No.", ...BOM_FIELDS.map((f) => f.label)]],
  //     body: bomData.map((row, i) => [
  //       i + 1,
  //       row.part_no,
  //       row.description,
  //       row.quantity,
  //       row.part_status,
  //       row.part_remark,
  //     ]),
  //     styles: {
  //       fontSize: 10,
  //       cellPadding: 6,
  //       overflow: "linebreak",
  //     },
  //     headStyles: {
  //       fillColor: [14, 156, 199],
  //       textColor: [255, 255, 255],
  //       fontStyle: "bold",
  //     },
  //     columnStyles: {
  //       2: { cellWidth: 150 },
  //       5: { cellWidth: 170 },
  //     },
  //     margin: { left: 25, right: 25 },
  //   });

  //   doc.save(`${projectName}-BOM.pdf`);
  // };

  const exportToPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`BOM SHEET - ${projectName} | ${poNumber}`, 30, 30, {
      maxWidth: 400,
    });

    autoTable(doc, {
      startY: 70,

      head: [["Sl No.", ...BOM_FIELDS.map((f) => f.label)]],
      body: bomData.map((row, i) => [
        i + 1,
        row.part_no,
        row.description,
        row.quantity,
        row.part_status,
        row.part_remark,
      ]),

      styles: {
        fontSize: 10,
        cellPadding: 6,
        overflow: "linebreak",
        fillColor: false,
      },

      headStyles: {
        fillColor: [14, 156, 199],
        textColor: 255,
        fontStyle: "bold",
      },

      columnStyles: {
        2: { cellWidth: 150 },
        5: { cellWidth: 170 },
      },

      margin: { left: 25, right: 25 },
    });

    doc.save(`${projectName}-BOM.pdf`);
  };

  /* ----------------------- CLICK OUTSIDE DROPDOWN ----------------------- */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openIndex === null) return;

      const button = dropdownRefs.current[openIndex];
      const menu = document.getElementById("portal-dropdown");

      if (
        button &&
        !button.contains(e.target) &&
        menu &&
        !menu.contains(e.target)
      ) {
        setOpenIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openIndex]);

  /* ------------------------------ RENDER ------------------------------ */

  return (
    <>
      <div className="flex flex-col w-full h-[95%] p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                !isDirty ||
                window.confirm("Unsaved changes will be lost. Continue?")
                  ? navigate("/job")
                  : null
              }
            >
              <MoveLeft className="w-8 h-8 text-[#0e9dc7] opacity-60" />
            </button>

            <h1 className="text-2xl font-semibold text-[#0e9dc7] ml-4">
              BOM SHEET: {projectName}
            </h1>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="p-2 border border-[#0e9dc7] hover:bg-blue-50  rounded"
            >
              <Save color="#0e9dc7" />
            </button>
            <button
              onClick={exportToExcel}
              className="p-2 border  border-[#0e9dc7] hover:bg-blue-50 not-first:rounded"
            >
              <Table2 color="#0e9dc7" />
            </button>
            <button
              onClick={exportToPDF}
              className="p-2 border border-[#0e9dc7] hover:bg-blue-50 rounded"
            >
              <FileText color="#0e9dc7" />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full table-fixed">
            <thead className="bg-[#ececec] sticky top-0 z-20">
              <tr className="text-center text-lg">
                <th style={{ width: "40px" }}>Sl No.</th>
                {BOM_FIELDS.map((f) => (
                  <th key={f.key} style={{ width: f.width }}>
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-center">
              {bomData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td>{idx + 1}</td>

                  {BOM_FIELDS.map((field) => (
                    <td key={field.key} className="px-2 py-2">
                      {/* STATUS */}
                      {field.key === "part_status" ? (
                        <div ref={(el) => (dropdownRefs.current[idx] = el)}>
                          <button
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const below = window.innerHeight - rect.bottom;
                              const above = rect.top;

                              setDropdownDir((p) => ({
                                ...p,
                                [idx]:
                                  below < 180 && above > 180 ? "up" : "down",
                              }));

                              setOpenIndex(openIndex === idx ? null : idx);
                            }}
                            className="h-[40px] w-full border rounded flex justify-between items-center px-2"
                          >
                            <span className={STATUS_COLORS[row.part_status]}>
                              {row.part_status || "STATUS"}
                            </span>
                            <SlArrowDown />
                          </button>

                          {openIndex === idx && (
                            <Portal>
                              <div
                                id="portal-dropdown"
                                className="absolute bg-white border rounded shadow-xl z-[9999]"
                                style={{
                                  position: "fixed",
                                  top:
                                    dropdownDir[idx] === "down"
                                      ? dropdownRefs.current[
                                          idx
                                        ].getBoundingClientRect().bottom + 4
                                      : dropdownRefs.current[
                                          idx
                                        ].getBoundingClientRect().top - 184,
                                  left: dropdownRefs.current[
                                    idx
                                  ].getBoundingClientRect().left,
                                  width: dropdownRefs.current[idx].offsetWidth,
                                }}
                              >
                                {JOB_STATUSES.map((status) => (
                                  <div
                                    key={status}
                                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${STATUS_COLORS[status]}`}
                                    onClick={() => {
                                      handleCellChange(
                                        idx,
                                        "part_status",
                                        status,
                                      );
                                      setOpenIndex(null);
                                    }}
                                  >
                                    {status}
                                  </div>
                                ))}
                              </div>
                            </Portal>
                          )}
                        </div>
                      ) : EDITABLE_FIELDS.has(field.key) ? (
                        <textarea
                          rows={2}
                          value={row[field.key] || ""}
                          onChange={(e) =>
                            handleCellChange(idx, field.key, e.target.value)
                          }
                          className="w-full text-center rounded resize-none outline-none focus:outline-none"
                        />
                      ) : (
                        <span className="text-gray-700 select-none">
                          {row[field.key]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && <Loading />}
    </>
  );
};

export default BomTable;
