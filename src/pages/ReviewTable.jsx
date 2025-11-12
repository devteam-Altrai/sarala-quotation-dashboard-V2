import React, { useEffect, useState } from "react";
import { FileText, MoveLeft, Save, Table2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/AppConstant";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReviewTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { assembly } = location.state || {};

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profitPercentage, setProfitPercentage] = useState(20);
  const [quotationName, setQuotationName] = useState("");
  const [grandTotal, setGrandTotal] = useState(0);

  const costFieldLabels = {
    part_no: "PART NO.",
    mat: "MATERIAL COST",
    vmc: "VMC COST",
    cnc: "CNC COST",
    hand: "HANDLING CHARGES",
    laser: "LASER CUTTING COST",
    bend: "BENDING COST",
    weld: "WELDING COST",
    ext: "EXTRA",
    quantity: "QUANTITY",
    profit: "PROFIT",
    unit: "UNIT",
    total: "TOTAL",
  };

  const costFields = [
    "part_no",
    "mat",
    "vmc",
    "cnc",
    "hand",
    "laser",
    "bend",
    "weld",
    "ext",
    "quantity",
    "profit",
    "unit",
    "total",
  ];

  const numericFields = [
    "mat",
    "vmc",
    "cnc",
    "hand",
    "laser",
    "bend",
    "weld",
    "ext",
  ];

  const fetchMetaData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}get_metadata/?projectName=${assembly}`
      );
      if (res.data.status === "ok" && res.data.data.length > 0) {
        setQuotationName(res.data.data[0].quotationname);
      }
    } catch (err) {
      console.error("Metadata fetch failed", err);
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}fetch/?project_name=${assembly}`);

      if (res.data.status !== "ok") {
        setError("No data found");
        return;
      }

      // Sort data and ensure description fallback
      const sorted = res.data.data
        .map((item) => ({ ...item, description: item.description || "N/A" }))
        .sort((a, b) => a.part_no.localeCompare(b.part_no));

      // Get saved profit or fallback to default
      const savedPercentage = Number(
        localStorage.getItem(`profit_${assembly}`)
      );
      const currentProfit = savedPercentage || profitPercentage;
      setProfitPercentage(currentProfit);

      // Recalculate unit, profit, total immediately
      const recalculatedData = sorted.map((row) => {
        const unit = numericFields.reduce(
          (acc, nf) => acc + Number(row[nf] || 0),
          0
        );
        const profit = (unit * currentProfit) / 100;
        const total = (unit + profit) * Number(row.quantity || 0);

        return { ...row, unit, profit, total };
      });

      setTableData(recalculatedData);
      recalcGrandTotal(recalculatedData);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMetaData();
  }, []);

  const recalcGrandTotal = (data) =>
    setGrandTotal(data.reduce((sum, row) => sum + (row.total || 0), 0));

  const handleCellChange = (rowIndex, field, value) => {
    const newData = [...tableData];
    newData[rowIndex][field] = value;

    const unit = numericFields.reduce(
      (acc, nf) => acc + Number(newData[rowIndex][nf] || 0),
      0
    );

    const profit = (unit * profitPercentage) / 100;
    const quantity = Number(newData[rowIndex].quantity || 0);
    const total = (unit + profit) * quantity;

    newData[rowIndex].unit = unit;
    newData[rowIndex].profit = profit;
    newData[rowIndex].total = total;

    setTableData(newData);
    recalcGrandTotal(newData);
  };

  const handleProfitSlider = (value) => {
    setProfitPercentage(value);
    localStorage.setItem(`profit_${assembly}`, value);

    const newData = tableData.map((row) => {
      const unit = numericFields.reduce(
        (acc, nf) => acc + Number(row[nf] || 0),
        0
      );
      const profit = (unit * value) / 100;
      const total = (unit + profit) * Number(row.quantity || 0);
      return { ...row, unit, profit, total };
    });

    setTableData(newData);
    recalcGrandTotal(newData);
  };

  const handleSave = async () => {
    try {
      const payload = tableData.map((i) => ({ ...i, project_name: assembly }));
      await axios.post(`${BASE_URL}update_cost/`, payload);
      await axios.post(`${BASE_URL}update_dashboard/`, {
        projectName: assembly,
        quotationname: quotationName,
        grandTotal,
      });
      alert("Data saved successfully!");
    } catch {
      alert("Failed to save data");
    }
  };

  const exportToExcel = () => {
    const sortedData = [...tableData].sort((a, b) =>
      a.part_no.localeCompare(b.part_no)
    );

    // ✅ Format description with line breaks for wrapping
    const wrapText = (text) => {
      if (!text) return "";
      return text
        .replace(/(.{30})/g, "$1\n") // insert line break every 30 characters
        .trim();
    };

    // Prepare data with SL No and formatted Description
    const exportData = sortedData.map((item, index) => ({
      "Sl No": index + 1,
      "Part No.": item.part_no,
      Description: wrapText(item.description),
      "MATERIAL COST": item.mat || "",
      "VMC COST": item.vmc || "",
      "CNC COST": item.cnc || "",
      "HANDLING CHARGES": item.hand || "",
      "LASER CUTTING COST": item.laser || "",
      "BENDING COST": item.bend || "",
      "WELDING COST": item.weld || "",
      EXTRA: item.ext || "",
      PROFIT: item.profit?.toFixed(2) || "",
      "UNIT PRICE": item.unit?.toFixed(2) || "",
      QUANTITY: item.quantity || "",
      "TOTAL PRICE": item.total?.toFixed(2) || "",
    }));

    // ✅ Insert Grand Total row with clear name
    exportData.push({
      "Sl No": "",
      "Part No.": "",
      Description: "Grand Total", // <-- Clear label here
      "MATERIAL COST": "",
      "VMC COST": "",
      "CNC COST": "",
      "HANDLING CHARGES": "",
      "LASER CUTTING COST": "",
      "BENDING COST": "",
      "WELDING COST": "",
      EXTRA: "",
      PROFIT: "",
      "UNIT PRICE": "",
      QUANTITY: "",
      "TOTAL PRICE": grandTotal.toFixed(2),
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Costing");

    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // ✅ Apply styling for all cells
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (!cell) continue;

        const isHeader = R === 0;
        const isGrandTotal = R === range.e.r;

        cell.s = {
          alignment: {
            wrapText: true, // ✅ allow multi-line cells
            vertical: "center",
            horizontal: isGrandTotal ? "right" : "center", // Grand total aligns right
          },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          font: { bold: isHeader || isGrandTotal },
          fill: isGrandTotal ? { fgColor: { rgb: "F2F2F2" } } : undefined,
        };
      }
    }

    // ✅ Merge Grand Total label row
    const totalRowIndex = range.e.r;
    const totalColCount = Object.keys(exportData[0]).length;
    worksheet["!merges"] = [
      {
        s: { r: totalRowIndex, c: 0 },
        e: { r: totalRowIndex, c: totalColCount - 2 }, // merge all columns except TOTAL PRICE
      },
    ];

    // ✅ Increase Grand Total row height
    worksheet["!rows"] = worksheet["!rows"] || [];
    worksheet["!rows"][totalRowIndex] = { hpt: 28 };

    // ✅ Column widths
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 40 }, // Description wider for wrapping
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 16 },
    ];

    XLSX.writeFile(workbook, `${quotationName}.xlsx`);
  };

  const exportToPDF = () => {
    const sortedData = [...tableData].sort((a, b) =>
      a.part_no.localeCompare(b.part_no)
    );
    const doc = new jsPDF({ orientation: "landscape" });

    doc.text(`Review Table - ${assembly} (${quotationName})`, 14, 15);

    autoTable(doc, {
      head: [
        [
          "Part No.",
          "Description",
          "Material",
          "VMC",
          "CNC",
          "HAND",
          "LASER",
          "BEND",
          "WELD",
          "EXT",
          "QTY",
          "PROFIT",
          "UNIT",
          "TOTAL",
        ],
      ],
      body: sortedData.map((item) => [
        item.part_no,
        item.description,
        item.mat || 0,
        item.vmc || 0,
        item.cnc || 0,
        item.hand || 0,
        item.laser || 0,
        item.bend || 0,
        item.weld || 0,
        item.ext || 0,
        item.quantity || 0,
        (item.profit || 0).toFixed(2),
        (item.unit || 0).toFixed(2),
        (item.total || 0).toFixed(2),
      ]),
      startY: 20,
      styles: { fontSize: 6 },
    });

    doc.text(
      `GRAND TOTAL: ${grandTotal.toFixed(2)}`,
      14,
      doc.lastAutoTable.finalY + 10
    );
    doc.save(`${quotationName}.pdf`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row bg-gray-200 items-center justify-center w-full h-full">
      <div className="relative overflow-hidden shadow-lg sm:rounded-xl h-full w-full bg-white p-3">
        <div className="flex flex-row justify-between items-center gap-3 ml-2 mt-5">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)}>
              <MoveLeft className="w-7 h-7 ml-3" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              Review Table: <span className="text-[#119cc2]">{assembly}</span>
            </h2>
          </div>
        </div>

        <div className="mt-3 mb-3 flex items-center justify-between pl-2 pr-2">
          <div className="flex flex-row w-[50%] gap-5">
            <label className="text-xl ml-3">PROFIT: {profitPercentage}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={profitPercentage}
              onChange={(e) => handleProfitSlider(Number(e.target.value))}
              className="w-[50%] "
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 bg-white border border-[#0e9dc7] rounded hover:bg-blue-50"
            >
              <Save color="#0e9dc7" />
            </button>
            <button
              onClick={exportToExcel}
              className="p-2 bg-white border border-[#0e9dc7] rounded hover:bg-blue-50"
            >
              <Table2 color="#0e9dc7" />
            </button>
            <button
              onClick={exportToPDF}
              className="p-2 bg-white border border-[#0e9dc7] rounded hover:bg-blue-50"
            >
              <FileText color="#0e9dc7" />
            </button>
          </div>
        </div>

        <div className=" overflow-auto max-h-[62vh] border border-gray-400 rounded">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 uppercase text-xs sticky top-0 z-10">
              <tr>
                {costFields.map((field) => (
                  <th key={field} className="px-3 py-3 border">
                    {costFieldLabels[field]}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[...tableData]
                .sort((a, b) => a.part_no.localeCompare(b.part_no))
                .map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {costFields.map((field) => (
                      <td key={field} className="px-4 py-3 border text-center">
                        {["unit", "profit", "total"].includes(field) ? (
                          <span>{item[field]?.toFixed(2)}</span>
                        ) : (
                          <span>
                            <input
                              type="text"
                              value={item[field] === 0 ? "" : item[field] ?? ""}
                              onChange={(e) =>
                                handleCellChange(
                                  idx,
                                  field,
                                  field === "part_no"
                                    ? e.target.value
                                    : e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                              className="w-full text-center border-none focus:ring-0"
                            />
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="text-right mt-1 md:mt-3 text-xl font-bold">
          GRAND TOTAL: {grandTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default ReviewTable;
