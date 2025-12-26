import React, { useEffect, useState } from "react";
import StepViewer from "../features/3D Viewer/StepViewer";
import { BASE_URL } from "../utils/AppConstant";
import { useLocation, useNavigate } from "react-router-dom";
import { Maximize, Minimize } from "lucide-react";
import Loading from "../components/Loading";

const Viewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileName } = location.state || {};

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [viewType, setViewType] = useState("pdf");
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const [isFullScreen, setIsFullScreen] = useState(false);

  const [costInput, setCostInput] = useState({
    project_name: "",
    part_no: "",
    mat: "",
    vmc: "",
    cnc: "",
    hand: "",
    laser: "",
    bend: "",
    weld: "",
    ext: "",
    quantity: "",
  });

  const NUMERIC_FIELDS = [
    "mat",
    "vmc",
    "cnc",
    "hand",
    "laser",
    "bend",
    "weld",
    "ext",
  ];

  const PROFIT_PERCENTAGE = 0.2;

  const [costOptions, setCostOptions] = useState([]);
  const [showCostSelectModal, setShowCostSelectModal] = useState(false);

  const applyCostToInputs = (cost) => {
    setCostInput({
      mat: cost.mat ?? "",
      vmc: cost.vmc ?? "",
      cnc: cost.cnc ?? "",
      hand: cost.hand ?? "",
      laser: cost.laser ?? "",
      bend: cost.bend ?? "",
      weld: cost.weld ?? "",
      ext: cost.ext ?? "",
      quantity: cost.quantity ?? "",
    });
  };

  const costLabels = {
    project_name: "ASSEMBLY",
    part_no: "PART No.",
    mat: "MATERIAL",
    vmc: "VMC",
    cnc: "CNC",
    hand: "HANDLING",
    laser: "LASER",
    bend: "BENDING",
    weld: "WELDING",
    ext: "EXTRA",
    quantity: "QUNATITY",
    profit: "PROFIT",
    unit: "UNIT",
    total: "TOTAL",
  };

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}${fileName}/`);
        const data = await response.json();

        if (data.status === "ok" && Array.isArray(data.files)) {
          const grouped = {};
          data.files.forEach((file) => {
            const baseName = file.name.split(".")[0];
            const ext = file.name.split(".").pop().toLowerCase();
            if (!grouped[baseName]) grouped[baseName] = { name: baseName };
            grouped[baseName][ext] = file.url;
          });

          const groupedList = Object.values(grouped);
          setModels(groupedList);
          setSelectedModel(groupedList[0] || null);
        }
      } catch (err) {
        console.error("Error fetching file list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [fileName]);

  const loadFile = async (model, type) => {
    const key = `${model.name}_${type}`;
    if (cache[key]) return cache[key];

    try {
      setLoading(true);
      const resp = await fetch(model[type]);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      setCache((prev) => ({ ...prev, [key]: url }));
      return url;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedModel) return;

    if (viewType === "pdf" && selectedModel.pdf) {
      loadFile(selectedModel, "pdf");
    } else if (viewType === "step" && selectedModel.step) {
      loadFile(selectedModel, "step");
    } else if (viewType === "stp" && selectedModel.stp) {
      loadFile(selectedModel, "stp");
    } else if (["step", "stp"].includes(viewType)) {
      if (selectedModel.step) {
        setViewType("step");
      } else if (selectedModel.stp) {
        setViewType("stp");
      }
    }

    fetchExistingCostData(selectedModel.name);
  }, [selectedModel, viewType]);

  const fileUrl = selectedModel
    ? cache[`${selectedModel.name}_${viewType}`]
    : null;

  const fetchExistingCostData = async (partName) => {
    try {
      const response = await fetch(`${BASE_URL}fetch/?part_no=${partName}`);

      const data = await response.json();

      if (data.status === "ok" && Array.isArray(data.data)) {
        if (data.data.length > 1) {
          setCostOptions(data.data);
          setShowCostSelectModal(true);
          return;
        }
        if (data.data.length === 1) applyCostToInputs(data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching existing cost data:", error);
    }
  };

  const toNumber = (value) => parseFloat(value) || 0;

  const baseCost = NUMERIC_FIELDS.reduce(
    (sum, field) => sum + toNumber(costInput[field]),
    0
  );

  const profit = baseCost * PROFIT_PERCENTAGE;
  const unit = baseCost + profit;
  const total = unit * toNumber(costInput.quantity);

  const handleSave = async () => {
    if (!selectedModel && !fileName) return alert("Missing data.");
    try {
      const payload = {
        project_name: fileName,
        part_no: selectedModel.name,
        mat: parseFloat(costInput.mat) || 0,
        vmc: parseFloat(costInput.vmc) || 0,
        cnc: parseFloat(costInput.cnc) || 0,
        hand: parseFloat(costInput.hand) || 0,
        laser: parseFloat(costInput.laser) || 0,
        bend: parseFloat(costInput.bend) || 0,
        weld: parseFloat(costInput.weld) || 0,
        ext: parseFloat(costInput.ext) || 0,
        quantity: parseFloat(costInput.quantity) || 0,
      };

      const response = await fetch(`${BASE_URL}update_cost/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const apiMessage = "✅ DATA SAVED SUCCESSFULLY";
      setFormSuccess(apiMessage);
    } catch (err) {
      const apiMessage = "❌ ERROR IN SAVING DATA";
      setFormError(apiMessage);
    }
  };

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
      {showCostSelectModal && (
        <div className="fixed inset-0 backdrop-blur-sm  flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-[900px] max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl text-[#0e9dc7] font-semibold mb-4 text-center">
              SELECT THE EXSISTING DATA
            </h2>

            <div className="flex flex-wrap gap-4 justify-center">
              {costOptions.map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    applyCostToInputs(item);
                    setShowCostSelectModal(false);
                  }}
                  className="border rounded-lg p-4 w-[280px] cursor-pointer hover:border-[#0e9dc7] hover:shadow-md transition"
                >
                  <p className="text-sm font-semibold text-[#0e9dc7] mb-2">
                    {item.project_name} — {item.part_no}
                  </p>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-gray-700">
                    <span className="font-medium">Material:</span>
                    <span>{item.mat}</span>
                    <span className="font-medium">VMC:</span>
                    <span>{item.vmc}</span>
                    <span className="font-medium">CNC:</span>
                    <span>{item.cnc}</span>
                    <span className="font-medium">Handling:</span>
                    <span>{item.hand}</span>
                    <span className="font-medium">Laser:</span>
                    <span>{item.laser}</span>
                    <span className="font-medium">Bend:</span>
                    <span>{item.bend}</span>
                    <span className="font-medium">Weld:</span>
                    <span>{item.weld}</span>
                    <span className="font-medium">Extra:</span>
                    <span>{item.ext}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const matchedItem = costOptions.find(
                  (item) => item.project_name === fileName
                );
                if (matchedItem) {
                  applyCostToInputs(matchedItem);
                }
                setShowCostSelectModal(false);
              }}
              className="mt-6 w-full bg-[#0e9dc7] text-white py-2 rounded-md hover:bg-[#0c89ac] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex flex-row h-full w-full overflow-hidden p-1">
        {/* SIDEBAR (Hidden in Fullscreen) */}
        {!isFullScreen && (
          <div className="hidden md:flex w-[20%] h-full overflow-hidden">
            <div className="flex flex-col h-full w-full">
              <div className="flex justify-center items-center h-[10%] shrink-0">
                <p className="text-2xl mt-3">Part List</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 overflow-x-hidden">
                {[...models]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((model) => (
                    <div
                      key={model.name}
                      onClick={() => setSelectedModel(model)}
                      className={`cursor-pointer px-3 py-2 mb-2 rounded ${
                        selectedModel?.name === model.name
                          ? "bg-[#0e9dc7] text-white"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      <span>{model.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEWER */}
        <div className="flex flex-col w-full h-full overflow-y-auto">
          <div
            className={`w-full flex flex-col items-center justify-center overflow-y-auto p-1 ${
              isFullScreen ? "h-screen" : "md:h-2/3 h-1/2 min-h-[50vh]"
            }`}
          >
            {selectedModel && (
              <div className="w-full h-full max-w-6xl flex flex-col overflow-hidden">
                <div className="flex-1 overflow-hidden flex items-center justify-center">
                  {/* {loading && !fileUrl && (
                    <div className="text-gray-600 text-lg">
                      Loading {viewType.toUpperCase()}...
                    </div>
                  )} */}
                  {loading && !fileUrl && (
                    <div className="text-gray-600 text-lg">
                      <Loading />
                    </div>
                  )}

                  {fileUrl && viewType && viewType.toLowerCase() === "pdf" && (
                    <iframe
                      src={fileUrl}
                      className="w-full h-full border-none"
                    />
                  )}

                  {fileUrl &&
                    ["step", "stp"].includes(viewType?.toLowerCase()) && (
                      <StepViewer stepFiles={fileUrl} />
                    )}
                </div>
              </div>
            )}
          </div>

          {/* COST INPUTS (hidden in fullscreen) */}
          {!isFullScreen && (
            <div
              id="Metadata"
              className="w-full rounded-md pl-4 pr-4 pb-4 md:mt-2"
            >
              <div className="md:hidden w-full overflow-x-auto py-2">
                <div className="flex gap-2 px-2">
                  {[...models]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((model) => (
                      <div
                        key={model.name}
                        onClick={() => setSelectedModel(model)}
                        className={`flex-shrink-0 cursor-pointer px-4 py-2 rounded ${
                          selectedModel?.name === model.name
                            ? "bg-[#0e9dc7] text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {model.name}
                      </div>
                    ))}
                </div>
              </div>
              {selectedModel && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <input
                    className="rounded-md bg-gray-100 px-3 py-2 text-sm"
                    value={fileName}
                    disabled
                  />
                  <input
                    className="rounded-md bg-gray-100 px-3 py-2 text-sm"
                    value={selectedModel.name}
                    disabled
                  />

                  {[
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
                  ].map((field) => {
                    const isCalculated = ["profit", "unit", "total"].includes(
                      field
                    );

                    const value =
                      field === "profit"
                        ? profit.toFixed(2)
                        : field === "unit"
                        ? unit.toFixed(2)
                        : field === "total"
                        ? total.toFixed(2)
                        : costInput[field] || "";

                    return (
                      <div key={field} className="relative">
                        <input
                          name={field}
                          value={value}
                          onChange={(e) =>
                            setCostInput({
                              ...costInput,
                              [e.target.name]: e.target.value,
                            })
                          }
                          disabled={isCalculated || field === "quantity"}
                          className={`peer w-full border border-[#0e9dc7] rounded-md px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0
          ${isCalculated ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                        />

                        <label
                          className={`absolute left-3 px-1 bg-white text-xs transition-all
          ${
            value
              ? "top-0 -translate-y-1/2 text-[#0e9dc7]"
              : "top-1/2 -translate-y-1/2 text-gray-400"
          }
          peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[#0e9dc7]`}
                        >
                          {costLabels[field]}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between mt-4">
                <div className="flex items-center gap-7">
                  {/* FULLSCREEN TOGGLE BUTTON */}
                  <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="py-2 hover:scale-110 transition"
                  >
                    {isFullScreen ? <Minimize /> : <Maximize />}
                  </button>

                  <button
                    onClick={() => {
                      if (viewType === "pdf") {
                        if (selectedModel?.step) {
                          setViewType("step");
                        } else if (selectedModel?.stp) {
                          setViewType("stp");
                        } else {
                          setFormError("No STEP file available for this model");
                        }
                      } else {
                        setViewType("pdf");
                      }
                    }}
                    className="px-4 py-2 rounded bg-[#0e9dc7] text-white"
                  >
                    {viewType === "pdf" ? "STEP" : "PDF"}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() =>
                      navigate("/review", { state: { assembly: fileName } })
                    }
                    className="bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    REVIEW TABLE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING MINIMIZE BUTTON IN FULLSCREEN MODE */}
      {isFullScreen && (
        <button
          onClick={() => setIsFullScreen(false)}
          className="fixed bottom-6 right-4 z-50 bg-[#ffffff] text-black p-3 hover:scale-110 transition"
        >
          <Minimize size={30} />
        </button>
      )}
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
      {loading && (
        <div className="w-full  h-screen">
          <Loading />
        </div>
      )}
    </>
  );
};

export default Viewer;
