import React, { useState, useRef, useEffect } from "react";
import { SlArrowDown } from "react-icons/sl";
import { BASE_URL } from "../utils/AppConstant";
import { useAuthContext } from "../auth/AuthContext";
import Loading from "../components/Loading";

const poItems = [
  "PENDING",
  "IN PROGRESS",
  "FINISHING",
  "QC",
  "READY FOR DISPATCH",
  "DISPATCHED",
];
const postatuscolor = {
  PENDING: { border: "border-red-400", text: "text-white", bg: "bg-red-600" },
  "IN PROGRESS": {
    border: "border-[#774113]",
    text: "text-white",
    bg: "bg-[#774113]",
  },
  FINISHING: {
    border: "border-orange-500",
    text: "text-white",
    bg: "bg-orange-500",
  },
  QC: { border: "border-[#ffea00]", text: "text-black", bg: "bg-[#ffea00]" },
  "READY FOR DISPATCH": {
    border: "border-blue-500",
    text: "text-white",
    bg: "bg-blue-500",
  },
  DISPATCHED: {
    border: "border-green-500",
    text: "text-white",
    bg: "bg-green-500",
  },
};
const invoiceItems = ["PENDING", "INVOICED"];
const instatuscolor = {
  PENDING: {
    border: "border-red-400",
    text: "text-white",
    bg: "bg-red-600",
  },
  INVOICED: {
    border: "border-green-500",
    text: "text-white",
    bg: "bg-green-500",
  },
};
const paymentItems = ["PENDING", "RECEIVED"];

const pystatuscolor = {
  PENDING: {
    border: "border-red-400",
    text: "text-white",
    bg: "bg-red-600",
  },
  RECEIVED: {
    border: "border-green-500",
    text: "text-white",
    bg: "bg-green-500",
  },
};

const OrderTracking = () => {
  const [projects, setProjects] = useState([]);
  const { role } = useAuthContext();
  const view = import.meta.env.VITE_ROLE2;

  // Dropdown open states per project
  const [openPOStates, setOpenPOStates] = useState([]);
  const [openInvoiceStates, setOpenInvoiceStates] = useState([]);
  const [openPaymentStates, setOpenPaymentStates] = useState([]);

  // Popup state
  const [showPoPopup, setShowPoPopup] = useState(false);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);

  // Popup form fields
  const [popupPoStatus, setPopupPoStatus] = useState("");
  const [popupInvoiceStatus, setPopupInvoiceStatus] = useState("");
  const [popupDc, setPopupDc] = useState("");
  const [popupDcDate, setPopupDcDate] = useState("");
  const [popupDcTracking, setPopupDcTracking] = useState("");
  const [popupInvoiceNo, setPopupInvoiceNo] = useState("");
  const [assemblyName, setAssemblyName] = useState("");

  const [previousPoStatus, setPreviousPoStatus] = useState({});
  const [previousInvoiceStatus, setPreviousInvoiceStatus] = useState({});

  const [loading, setLoading] = useState(true);

  // Refs arrays for outside click detection
  const poRefs = useRef([]);
  const invoiceRefs = useRef([]);
  const paymentRefs = useRef([]);

  const [openStates, setOpenStates] = useState(
    Array(projects.length).fill(false)
  );

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}getorderstatus/`);
        const json = await res.json();
        if (json.status === "ok") {
          const normalizedProjects = json.data.map((proj) => ({
            ...proj,
            po_status: proj.po_status || "PENDING",
            invoice_status: proj.invoice_status || "PENDING",
            payment_status: proj.payment_status || "PENDING",
          }));

          setProjects(normalizedProjects);

          setOpenPOStates(new Array(json.data.length).fill(false));
          setOpenInvoiceStates(new Array(json.data.length).fill(false));
          setOpenPaymentStates(new Array(json.data.length).fill(false));
        }
      } catch (e) {
        console.error("Failed to fetch projects:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);
  ////////////////////////////PO Status//////////////////////////////
  const updatePoStatus = async (projectName, status) => {
    try {
      await fetch(`${BASE_URL}orderstatus/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, po_status: status }),
      });
    } catch (e) {
      console.error("PO status update failed:", e);
    }
  };

  const savePoDetails = async () => {
    try {
      await fetch(`${BASE_URL}orderstatus/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: assemblyName,
          po_status: popupPoStatus,
          dc_number: popupDc,
          dispatch_date: popupDcDate,
          tracking_number: popupDcTracking,
        }),
      });
      // Update local projects data with latest details
      setProjects((prevProjects) =>
        prevProjects.map((proj) =>
          proj.projectName === assemblyName
            ? {
                ...proj,
                po_status: popupPoStatus,
                dc_number: popupDc,
                dispatch_date: popupDcDate,
                tracking_number: popupDcTracking,
              }
            : proj
        )
      );
    } catch (e) {
      console.error("PO details save failed:", e);
    } finally {
      setPopupDc("");
      setPopupDcDate("");
      setPopupDcTracking("");
      setPopupPoStatus("");
    }
  };
  ///////////////////////////////////////////////////////////////////
  ////////////////////////////Invoice Status////////////////////////
  const updateInvoiceStatus = async (projectName, status) => {
    try {
      await fetch(`${BASE_URL}orderstatus/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          invoice_status: status,
        }),
      });
    } catch (e) {
      console.error("Invoice status update failed:", e);
    }
  };

  const saveInvoiceDetails = async () => {
    try {
      await fetch(`${BASE_URL}orderstatus/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: assemblyName,
          invoice_status: popupInvoiceStatus,
          invoice_number: popupInvoiceNo,
        }),
      });
      setProjects((prevProjects) =>
        prevProjects.map((proj) =>
          proj.projectName === assemblyName
            ? {
                ...proj,
                invoice_status: popupInvoiceStatus,
                invoice_number: popupInvoiceNo,
              }
            : proj
        )
      );
    } catch (e) {
      console.error("Invoice details save failed:", e);
    } finally {
      setPopupInvoiceStatus("");
      setPopupInvoiceNo("");
    }
  };
  /////////////////////////////////////////////////////////////////
  ////////////////////////////Payment Status//////////////////////
  const updatePaymentStatus = async (projectName, status) => {
    try {
      await fetch(`${BASE_URL}orderstatus/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          payment_status: status,
        }),
      });
    } catch (e) {
      console.error("Payment status update failed:", e);
    }
  };
  ///////////////////////////////////////////////////////////////
  //////////////////////////////Status Button Toggle//////////////
  const toggleOpenPO = (index) => {
    setOpenPOStates((prev) => prev.map((v, i) => (i === index ? !v : false)));
    setOpenInvoiceStates(new Array(projects.length).fill(false));
    setOpenPaymentStates(new Array(projects.length).fill(false));
  };

  // const toggleOpenInvoice = (index) => {
  //   setOpenInvoiceStates((prev) =>
  //     prev.map((v, i) => (i === index ? !v : false))
  //   );
  //   setOpenPOStates(new Array(projects.length).fill(false));
  //   setOpenPaymentStates(new Array(projects.length).fill(false));
  // };

  const toggleOpenInvoice = (index, project) => {
    // When opening dropdown, store previous status ONCE
    if (!openInvoiceStates[index]) {
      setPreviousInvoiceStatus((prev) => ({
        ...prev,
        [project.projectName]: project.invoice_status,
      }));
    }

    setOpenInvoiceStates((prev) =>
      prev.map((v, i) => (i === index ? !v : false))
    );
  };
  const toggleOpenPayment = (index) => {
    setOpenPaymentStates((prev) =>
      prev.map((v, i) => (i === index ? !v : false))
    );
    setOpenPOStates(new Array(projects.length).fill(false));
    setOpenInvoiceStates(new Array(projects.length).fill(false));
  };
  //////////////////////////////////////////////////////////////
  /////////////////////////Input FIled update///////////////////

  const debounce = (func, delay = 400) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedTrackingUpdate = useRef(
    debounce((projectName, trackingNumber) => {
      updateTrackingNumberAPI(projectName, trackingNumber);
    }, 400)
  ).current;

  const handleTrackingChange = (index, value) => {
    setProjects((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], tracking_number: value };
      return updated;
    });

    const projectName = projects[index].projectName;

    // Debounced backend update
    debouncedTrackingUpdate(projectName, value);
  };

  const updateTrackingNumberAPI = async (projectName, trackingNumber) => {
    try {
      await fetch(`${BASE_URL}orderstatus/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, tracking_number: trackingNumber }),
      });
    } catch (error) {
      console.error("Tracking number update failed:", error);
    }
  };

  const debouncedFieldUpdate = useRef(
    debounce((projectName, field, value) => {
      updateFieldAPI(projectName, field, value);
    }, 400)
  ).current;

  const handleFieldChange = (index, field, value) => {
    setProjects((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    const projectName = projects[index].projectName;

    // Debounced backend update
    debouncedFieldUpdate(projectName, field, value);
  };

  const updateFieldAPI = async (projectName, field, value) => {
    try {
      await fetch(`${BASE_URL}orderstatus/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          [field]: value,
        }),
      });
    } catch (e) {
      console.error(`Failed to update ${field}:`, e);
    }
  };
  /////////////////////////////////////////////////////////////

  useEffect(() => {
    const handleClickOutside = (e) => {
      poRefs.current.forEach((ref, i) => {
        if (ref?.current && !ref.current.contains(e.target)) {
          setOpenPOStates((prev) => {
            const copy = [...prev];
            copy[i] = false;
            return copy;
          });
        }
      });

      invoiceRefs.current.forEach((ref, i) => {
        if (ref?.current && !ref.current.contains(e.target)) {
          setOpenInvoiceStates((prev) => {
            const copy = [...prev];
            copy[i] = false;
            return copy;
          });
        }
      });
      paymentRefs.current.forEach((ref, i) => {
        if (ref?.current && !ref.current.contains(e.target)) {
          setOpenPaymentStates((prev) => {
            const copy = [...prev];
            copy[i] = false;
            return copy;
          });
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [projects.length]);

  const toggle = (index) => {
    const newOpenStates = [...openStates];
    newOpenStates[index] = !newOpenStates[index];
    setOpenStates(newOpenStates);
  };

  return (
    <>
      <div className="w-full h-[87vh] flex flex-col">
        <div className="pb-2">
          <h1 className="text-2xl font-medium text-[#0e9dc7]  pl-8 pt-8 pr-8 ">
            ORDER TRACKING
          </h1>
          <p className="text-sm text-[#444] ml-8 mt-1">
            Specific order details here.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto gap-4">
          <div className="flex flex-col gap-5 p-5">
            {projects.length === 0 ? (
              <EmptyState
                title="No order's available now!!"
                subtitle="Once order details are available, they will appear here instantly."
              />
            ) : (
              projects.map((project, index) => {
                poRefs.current[index] =
                  poRefs.current[index] || React.createRef();
                invoiceRefs.current[index] =
                  invoiceRefs.current[index] || React.createRef();
                paymentRefs.current[index] =
                  paymentRefs.current[index] || React.createRef();

                return (
                  <div
                    className="border border-[#0e9dc7] w-full rounded-lg"
                    key={index}
                  >
                    {/* Header */}
                    <div className="flex flex-row justify-between items-center p-4">
                      <h2 className="text-xl font-semibold text-[#0e9dc7] ">
                        {project.order_serial} | PO No. - {project.po_number} |{" "}
                        {project.projectName}
                      </h2>
                      <div className="flex flex-row w-fit px-3 gap-3">
                        {/* PO STATUS DROPDOWN */}
                        <div
                          ref={poRefs.current[index]}
                          className={`relative w-[150px] `}
                        >
                          <label
                            className={`absolute -top-2 left-3 bg-white px-1 text-xs font-semibold text-[#0e9dc7] z-10 rounded-sm`}
                          >
                            PO STATUS
                          </label>

                          <button
                            onClick={() => toggleOpenPO(index)}
                            className={`h-[48px] w-full ${
                              postatuscolor[project.po_status]?.bg
                            } border rounded-lg px-3 flex justify-between items-center shadow-sm ${
                              postatuscolor[project.po_status]?.border
                            }`}
                          >
                            <p
                              className={`text-sm ${
                                postatuscolor[project.po_status]?.text
                              }`}
                            >
                              {project.po_status || "PO STATUS"}
                            </p>
                            <SlArrowDown
                              className={`text-lg text-[#0e9dc7]  ${
                                postatuscolor[project.po_status]?.text
                              } ${openPOStates[index] ? "rotate-180" : ""}`}
                            />
                          </button>

                          {openPOStates[index] && (
                            <div className="absolute left-0 mt-1 w-full bg-white border border-[#0e9dc7] rounded-lg shadow-xl z-[9999]">
                              {poItems.map((item, i) => (
                                <div
                                  key={i}
                                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50`}
                                  onClick={() => {
                                    setPreviousPoStatus((prev) => ({
                                      ...prev,
                                      [project.projectName]: project.po_status,
                                    }));

                                    setProjects((prev) =>
                                      prev.map((p) =>
                                        p.projectName === project.projectName
                                          ? { ...p, po_status: item }
                                          : p
                                      )
                                    );

                                    setAssemblyName(project.projectName);
                                    setPopupPoStatus(item);

                                    if (item === "DISPATCHED") {
                                      setShowPoPopup(true);
                                      setPopupDc(project.dc_number || "");
                                      setPopupDcDate(
                                        project.dispatch_date || ""
                                      );
                                      setPopupDcTracking(
                                        project.tracking_number || ""
                                      );
                                    } else {
                                      updatePoStatus(project.projectName, item);
                                    }

                                    toggleOpenPO(index);
                                  }}
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* INVOICE STATUS */}
                        <div
                          ref={invoiceRefs.current[index]}
                          className="relative w-[150px]"
                        >
                          <label
                            className={`absolute -top-2 left-3 bg-white px-1 text-xs font-semibold z-10 text-[#0e9dc7] rounded-sm`}
                          >
                            INVOICE STATUS
                          </label>

                          <button
                            // onClick={() => toggleOpenInvoice(index)}
                            onClick={() => toggleOpenInvoice(index, project)}
                            className={`h-[48px] w-full rounded-lg px-3 flex justify-between items-center shadow-sm ${
                              instatuscolor[project.invoice_status]?.bg
                            }`}
                          >
                            <p
                              className={`text-sm ${
                                instatuscolor[project.invoice_status]?.text
                              }`}
                            >
                              {project.invoice_status || "INVOICE STATUS"}
                            </p>
                            <SlArrowDown
                              className={`text-lg  ${
                                instatuscolor[project.invoice_status]?.text
                              } ${
                                openInvoiceStates[index] ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {openInvoiceStates[index] && (
                            <div className="absolute left-0 mt-1 w-full bg-white border border-[#0e9dc7] rounded-lg shadow-xl z-[9999]">
                              {invoiceItems.map((item, i) => (
                                <div
                                  key={i}
                                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50`}
                                  onClick={() => {
                                    // setPreviousInvoiceStatus((prev) => ({
                                    //   ...prev,
                                    //   [project.projectName]:
                                    //     project.invoice_status,
                                    // }));

                                    setProjects((prev) =>
                                      prev.map((p) =>
                                        p.projectName === project.projectName
                                          ? { ...p, invoice_status: item }
                                          : p
                                      )
                                    );

                                    setAssemblyName(project.projectName);
                                    setPopupInvoiceStatus(item);

                                    if (item === "INVOICED") {
                                      setShowInvoicePopup(true);
                                      setPopupInvoiceNo(
                                        project.invoice_number || ""
                                      );
                                    } else {
                                      updateInvoiceStatus(
                                        project.projectName,
                                        item
                                      );
                                    }

                                    toggleOpenInvoice(index);
                                  }}
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* PAYMENT STATUS */}
                        <div
                          ref={paymentRefs.current[index]}
                          className="relative w-[150px]"
                        >
                          <label
                            className={`absolute -top-2 left-3 bg-white px-1 text-xs font-semibold text-[#0e9dc7] z-10 rounded-sm`}
                          >
                            PAYMENT STATUS
                          </label>

                          <button
                            onClick={() => toggleOpenPayment(index)}
                            className={`h-[48px] w-full rounded-lg px-3 flex justify-between items-center shadow-sm ${
                              pystatuscolor[project.payment_status]?.bg
                            }`}
                          >
                            <p
                              className={`text-sm ${
                                pystatuscolor[project.payment_status]?.text
                              }`}
                            >
                              {project.payment_status || "PAYMENT STATUS"}
                            </p>
                            <SlArrowDown
                              className={`text-lg ${
                                pystatuscolor[project.payment_status]?.text ||
                                ""
                              } ${
                                openPaymentStates[index] ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {openPaymentStates[index] && (
                            <div className="absolute left-0 mt-1 w-full bg-white border border-[#0e9dc7] rounded-lg shadow-xl z-[9999]">
                              {paymentItems.map((item, i) => (
                                <div
                                  key={i}
                                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50`}
                                  onClick={() => {
                                    setProjects((prev) =>
                                      prev.map((p) =>
                                        p.projectName === project.projectName
                                          ? { ...p, payment_status: item }
                                          : p
                                      )
                                    );

                                    updatePaymentStatus(
                                      project.projectName,
                                      item
                                    );

                                    toggleOpenPayment(index);
                                  }}
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* EXPAND ARROW */}
                        <button
                          onClick={() => toggle(index)}
                          className="p-2 hover:bg-slate-100 rounded"
                        >
                          <SlArrowDown
                            className={`text-2xl text-slate-400 transition-transform duration-300 ${
                              openStates[index] ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* DROPDOWN CONTENT */}
                    <div
                      className={`
                      overflow-hidden transition-all duration-50
                      ${openStates[index] ? "h-[33vh] md:h-[32vh]" : "h-0"}
                    `}
                    >
                      <div className=" bg-black/2 w-full h-full rounded-xl">
                        {view === role ? (
                          <div className="border-t border-slate-100 bg-slate-50 pl-6 pr-6 pb-6 pt-1 h-[28vh] overflow-y-auto rounded-bl-2xl rounded-br-2xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                              {project.po_number === "N/A" && (
                                <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                  <p className="text-center text-xl text-[#0e9dc7]">
                                    PO CONTACT : {project.po_contact}
                                  </p>
                                </div>
                              )}
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  ORDER No. : {project.order_serial}
                                </p>
                              </div>
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  QUOTATION NAME : {project.quotationname}
                                </p>
                              </div>
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  DC No. : {project.dc_number}
                                </p>
                              </div>
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  DATE OF DISPATCH : {project.dispatch_date}
                                </p>
                              </div>
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  INVOICE NUMBER : {project.invoice_number}
                                </p>
                              </div>
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  TRACKING NUMBER
                                </p>
                                <input
                                  placeholder="Tracking Number"
                                  value={project.tracking_number || ""}
                                  onChange={(e) =>
                                    handleTrackingChange(index, e.target.value)
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-4 text-md text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7] shadow-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-slate-100 bg-slate-50 pl-6 pr-6 pb-6 pt-1 h-[34vh] overflow-y-auto rounded-bl-xl rounded-br-xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                              {/* ORDER SERIAL */}
                              {project.po_number === "N/A" && (
                                <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                  <p className="text-center text-xl text-[#0e9dc7]">
                                    PO CONTACT : {project.po_contact}
                                  </p>
                                </div>
                              )}
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  ORDER No. : {project.order_serial}
                                </p>
                              </div>

                              {/* QUOTATION NAME */}
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  QUOTATION NAME : {project.quotationname}
                                </p>
                              </div>

                              {/* DC NUMBER */}
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  DC No.
                                </p>
                                <input
                                  placeholder="Enter DC Number"
                                  value={project.dc_number || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      index,
                                      "dc_number",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-4 text-md
                   text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1
                   focus:ring-[#0e9dc7] shadow-sm"
                                />
                              </div>

                              {/* DISPATCH DATE */}
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  DATE OF DISPATCH
                                </p>
                                <input
                                  id="dcDateInput"
                                  type="date"
                                  value={project.dispatch_date || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      index,
                                      "dispatch_date",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-4 text-md
                   text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1
                   focus:ring-[#0e9dc7] shadow-sm"
                                />
                              </div>

                              {/* INVOICE NUMBER */}
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  INVOICE NUMBER
                                </p>
                                <input
                                  placeholder="Enter Invoice Number"
                                  value={project.invoice_number || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      index,
                                      "invoice_number",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-4 text-md
                   text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1
                   focus:ring-[#0e9dc7] shadow-sm"
                                />
                              </div>

                              {/* TRACKING NUMBER */}
                              <div className="flex flex-col justify-center items-center gap-2 mt-3">
                                <p className="text-center text-xl text-[#0e9dc7]">
                                  TRACKING NUMBER
                                </p>
                                <input
                                  placeholder="Enter Tracking Number"
                                  value={project.tracking_number || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      index,
                                      "tracking_number",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-4 text-md
                   text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1
                   focus:ring-[#0e9dc7] shadow-sm"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showPoPopup && (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-lg z-50">
          <div className="bg-white p-6 rounded shadow-lg w-150 max-w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-center">
              PO Status Details
            </h2>

            <div className="mb-4">
              <label className="text-sm font-semibold" htmlFor="dcNumberInput">
                Enter DC No.
              </label>
              <input
                id="dcNumberInput"
                type="text"
                value={popupDc}
                onChange={(e) => setPopupDc(e.target.value)}
                className="w-full mt-1 p-2 border border-[#3da5c5] rounded outline-none focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold" htmlFor="dcDateInput">
                Select Dispatch Date
              </label>
              <input
                id="dcDateInput"
                type="date"
                value={popupDcDate}
                onChange={(e) => setPopupDcDate(e.target.value)}
                className="w-full mt-1 p-2 border border-[#3da5c5] rounded"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold" htmlFor="trackingInput">
                Tracking No.
              </label>
              <input
                id="trackingInput"
                type="text"
                value={popupDcTracking}
                onChange={(e) => setPopupDcTracking(e.target.value)}
                className="w-full mt-1 p-2 border border-[#3da5c5] rounded outline-none focus:outline-none"
              />
            </div>

            <div className="flex justify-between gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  const prevStatus = previousPoStatus[assemblyName];
                  if (prevStatus) {
                    setProjects((prev) =>
                      prev.map((proj) =>
                        proj.projectName === assemblyName
                          ? { ...proj, po_status: prevStatus }
                          : proj
                      )
                    );
                  }
                  setPopupPoStatus("");
                  setPopupDc("");
                  setPopupDcDate("");
                  setPopupDcTracking("");
                  setShowPoPopup(false);
                }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-[#0e9dc7] text-white rounded"
                disabled={!popupDc.trim() || !popupDcDate.trim()}
                onClick={() => {
                  if (!popupDc.trim() || !popupDcDate.trim()) return;
                  savePoDetails();
                  setShowPoPopup(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* INVOICE POPUP */}
      {showInvoicePopup && (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-lg z-50">
          <div className="bg-white p-6 rounded shadow-lg w-150 max-w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Invoice Status Details
            </h2>
            <div className="mb-4">
              <label
                className="text-sm font-semibold"
                htmlFor="invoiceNumberInput"
              >
                Enter Invoice Number
              </label>
              <input
                id="invoiceNumberInput"
                type="text"
                value={popupInvoiceNo}
                onChange={(e) => setPopupInvoiceNo(e.target.value)}
                className="w-full mt-1 p-2 border border-[#3da5c5] rounded outline-none focus:outline-none"
              />
            </div>
            <div className="flex justify-between gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  // Revert Invoice status to previous value
                  const prevStatus = previousInvoiceStatus[assemblyName];
                  if (prevStatus) {
                    setProjects((prevProjects) =>
                      prevProjects.map((proj) =>
                        proj.projectName === assemblyName
                          ? { ...proj, invoice_status: prevStatus }
                          : proj
                      )
                    );
                  }

                  // Close popup and reset fields
                  setPopupInvoiceStatus("");
                  setPopupInvoiceNo("");
                  setShowInvoicePopup(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#0e9dc7] text-white rounded"
                disabled={!popupInvoiceNo.trim()}
                onClick={() => {
                  if (!popupInvoiceNo.trim()) return;
                  saveInvoiceDetails();
                  setShowInvoicePopup(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
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
const EmptyState = ({ title, subtitle }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-white p-8 text-center text-slate-500">
    <p className="text-lg font-semibold text-slate-700">{title}</p>
    <p className="text-sm">{subtitle}</p>
  </div>
);
export default OrderTracking;
