// import React, { useState, useEffect, useRef } from "react";
// import { SlArrowDown } from "react-icons/sl";
// import { BASE_URL } from "../utils/AppConstant";
// import { useAuthContext } from "../auth/AuthContext";

// const poItems = [
//   "PENDING",
//   "IN PROGRESS",
//   "FINISHING",
//   "QC",
//   "READY FOR DISPATCH",
//   "DISPATCHED",
// ];

// const postatuscolor = {
//   PENDING: "text-red-400",
//   "IN PROGRESS": "text-yellow-800",
//   FINISHING: "text-orange-500",
//   QC: "text-yellow-800",
//   "READY FOR DISPATCH": "text-blue-500",
//   DISPATCHED: "text-green-500",
// };
// const invoiceItems = ["PENDING", "INVOICED"];

// const instatus = {
//   PENDING: "text-red-400",
//   INVOICED: "text-green-500",
// };
// const paymentItems = ["PENDING", "RECEIVED"];

// const pystatus = {
//   PENDING: "text-red-400",
//   RECEIVED: "text-green-500",
// };

// const OrderTracking = () => {
//   const { role } = useAuthContext();
//   const view = import.meta.env.VITE_ROLE2;

//   const [expanded, setExpanded] = useState(null);
//   const [projects, setProjects] = useState([]);

//   // Dropdown open states per project
//   const [openPOStates, setOpenPOStates] = useState([]);
//   const [openInvoiceStates, setOpenInvoiceStates] = useState([]);
//   const [openPaymentStates, setOpenPaymentStates] = useState([]);

//   // Popup state
//   const [showPoPopup, setShowPoPopup] = useState(false);
//   const [showInvoicePopup, setShowInvoicePopup] = useState(false);

//   // Popup form fields
//   const [popupPoStatus, setPopupPoStatus] = useState("");
//   const [popupInvoiceStatus, setPopupInvoiceStatus] = useState("");
//   const [popupDc, setPopupDc] = useState("");
//   const [popupDcDate, setPopupDcDate] = useState("");
//   const [popupDcTracking, setPopupDcTracking] = useState("");
//   const [popupInvoiceNo, setPopupInvoiceNo] = useState("");
//   const [assemblyName, setAssemblyName] = useState("");

//   const [previousPoStatus, setPreviousPoStatus] = useState({});
//   const [previousInvoiceStatus, setPreviousInvoiceStatus] = useState({});

//   // Refs arrays for outside click detection
//   const poRefs = useRef([]);
//   const invoiceRefs = useRef([]);
//   const paymentRefs = useRef([]);

//   // Fetch projects on mount
//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}getorderstatus/`);
//         const json = await res.json();
//         if (json.status === "ok") {
//           setProjects(json.data);

//           // Initialize dropdown states arrays
//           setOpenPOStates(new Array(json.data.length).fill(false));
//           setOpenInvoiceStates(new Array(json.data.length).fill(false));
//           setOpenPaymentStates(new Array(json.data.length).fill(false));
//         }
//       } catch (e) {
//         console.error("Failed to fetch projects:", e);
//       }
//     };
//     fetchProjects();
//   }, []);

//   // Handlers for toggling dropdowns
//   const toggleOpenPO = (index) => {
//     setOpenPOStates((prev) => prev.map((v, i) => (i === index ? !v : false)));
//     // Close others when opening this dropdown
//     setOpenInvoiceStates(new Array(projects.length).fill(false));
//     setOpenPaymentStates(new Array(projects.length).fill(false));
//   };

//   const toggleOpenInvoice = (index) => {
//     setOpenInvoiceStates((prev) =>
//       prev.map((v, i) => (i === index ? !v : false))
//     );
//     setOpenPOStates(new Array(projects.length).fill(false));
//     setOpenPaymentStates(new Array(projects.length).fill(false));
//   };

//   const toggleOpenPayment = (index) => {
//     setOpenPaymentStates((prev) =>
//       prev.map((v, i) => (i === index ? !v : false))
//     );
//     setOpenPOStates(new Array(projects.length).fill(false));
//     setOpenInvoiceStates(new Array(projects.length).fill(false));
//   };

//   // Outside click handlers

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       // PO dropdowns
//       poRefs.current.forEach((ref, i) => {
//         if (ref?.current && !ref.current.contains(e.target)) {
//           setOpenPOStates((prev) => {
//             const copy = [...prev];
//             copy[i] = false;
//             return copy;
//           });
//         }
//       });

//       // Invoice dropdowns
//       invoiceRefs.current.forEach((ref, i) => {
//         if (ref?.current && !ref.current.contains(e.target)) {
//           setOpenInvoiceStates((prev) => {
//             const copy = [...prev];
//             copy[i] = false;
//             return copy;
//           });
//         }
//       });

//       // Payment dropdowns
//       paymentRefs.current.forEach((ref, i) => {
//         if (ref?.current && !ref.current.contains(e.target)) {
//           setOpenPaymentStates((prev) => {
//             const copy = [...prev];
//             copy[i] = false;
//             return copy;
//           });
//         }
//       });
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [projects.length]);

//   // API POST update functions
//   const updatePoStatus = async (projectName, status) => {
//     try {
//       await fetch(`${BASE_URL}orderstatus/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ projectName, po_status: status }),
//       });
//     } catch (e) {
//       console.error("PO status update failed:", e);
//     }
//   };

//   const savePoDetails = async () => {
//     try {
//       await fetch(`${BASE_URL}orderstatus/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           projectName: assemblyName,
//           po_status: popupPoStatus,
//           dc_number: popupDc,
//           dispatch_date: popupDcDate,
//           tracking_number: popupDcTracking,
//         }),
//       });
//       // Update local projects data with latest details
//       setProjects((prevProjects) =>
//         prevProjects.map((proj) =>
//           proj.projectName === assemblyName
//             ? {
//                 ...proj,
//                 po_status: popupPoStatus,
//                 dc_number: popupDc,
//                 dispatch_date: popupDcDate,
//                 tracking_number: popupDcTracking,
//               }
//             : proj
//         )
//       );
//     } catch (e) {
//       console.error("PO details save failed:", e);
//     } finally {
//       setPopupDc("");
//       setPopupDcDate("");
//       setPopupDcTracking("");
//       setPopupPoStatus("");
//     }
//   };

//   const updateInvoiceStatus = async (projectName, status) => {
//     try {
//       await fetch(`${BASE_URL}orderstatus/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           projectName,
//           invoice_status: status,
//         }),
//       });
//     } catch (e) {
//       console.error("Invoice status update failed:", e);
//     }
//   };

//   const saveInvoiceDetails = async () => {
//     try {
//       await fetch(`${BASE_URL}orderstatus/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           projectName: assemblyName,
//           invoice_status: popupInvoiceStatus,
//           invoice_number: popupInvoiceNo,
//         }),
//       });
//       setProjects((prevProjects) =>
//         prevProjects.map((proj) =>
//           proj.projectName === assemblyName
//             ? {
//                 ...proj,
//                 invoice_status: popupInvoiceStatus,
//                 invoice_number: popupInvoiceNo,
//               }
//             : proj
//         )
//       );
//     } catch (e) {
//       console.error("Invoice details save failed:", e);
//     } finally {
//       setPopupInvoiceStatus("");
//       setPopupInvoiceNo("");
//     }
//   };

//   const updatePaymentStatus = async (projectName, status) => {
//     try {
//       await fetch(`${BASE_URL}orderstatus/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           projectName,
//           payment_status: status,
//         }),
//       });
//     } catch (e) {
//       console.error("Payment status update failed:", e);
//     }
//   };

//   const debounce = (func, delay = 400) => {
//     let timeout;
//     return (...args) => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => func(...args), delay);
//     };
//   };

//   const debouncedTrackingUpdate = useRef(
//     debounce((projectName, trackingNumber) => {
//       updateTrackingNumberAPI(projectName, trackingNumber);
//     }, 400)
//   ).current;

//   const handleTrackingChange = (index, value) => {
//     setProjects((prev) => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], tracking_number: value };
//       return updated;
//     });

//     const projectName = projects[index].projectName;

//     // Debounced backend update
//     debouncedTrackingUpdate(projectName, value);
//   };

//   const updateTrackingNumberAPI = async (projectName, trackingNumber) => {
//     try {
//       await fetch(`${BASE_URL}orderstatus/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ projectName, tracking_number: trackingNumber }),
//       });
//     } catch (error) {
//       console.error("Tracking number update failed:", error);
//     }
//   };

//   const debouncedFieldUpdate = useRef(
//     debounce((projectName, field, value) => {
//       updateFieldAPI(projectName, field, value);
//     }, 400)
//   ).current;

//   const handleFieldChange = (index, field, value) => {
//     setProjects((prev) => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], [field]: value };
//       return updated;
//     });

//     const projectName = projects[index].projectName;

//     // Debounced backend update
//     debouncedFieldUpdate(projectName, field, value);
//   };

//   const updateFieldAPI = async (projectName, field, value) => {
//     try {
//       await fetch(`${BASE_URL}orderstatus/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           projectName,
//           [field]: value,
//         }),
//       });
//     } catch (e) {
//       console.error(`Failed to update ${field}:`, e);
//     }
//   };

//   // Expand toggle
//   const toggleExpand = (index) =>
//     setExpanded(expanded === index ? null : index);

//   return (
//     <div className="w-full h-[90vh] p-6">
//       <h1 className="text-2xl font-semibold text-[#0e9dc7] mb-6 pl-5 pt-5 pr-5 pb-2">
//         ORDER TRACKING
//       </h1>

//       <div className="space-y-5 h-[85vh] overflow-y-auto">
//         {projects.map((project, index) => {
//           // Assign refs
//           poRefs.current[index] = poRefs.current[index] || React.createRef();
//           invoiceRefs.current[index] =
//             invoiceRefs.current[index] || React.createRef();
//           paymentRefs.current[index] =
//             paymentRefs.current[index] || React.createRef();

//           const isOpen = expanded === index;

//           return (
//             <article
//               key={project.projectName}
//               className="bg-white rounded-xl shadow-sm overflow-y-auto"
//             >
//               {/* HEADER */}

//               <div className="flex justify-between border border-[#0e9dc7] p-4 rounded-2xl">
//                 <h2 className="text-xl font-semibold flex items-center text-[#0e9dc7]">
//                   PO No. - {project.po_number} | {project.projectName}
//                 </h2>

//                 <div className="flex items-center gap-3">
//                   {/* PO STATUS */}
//                   <div
//                     ref={poRefs.current[index]}
//                     className="relative w-[150px]"
//                   >
//                     <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-semibold text-[#0e9dc7] z-10">
//                       PO STATUS
//                     </label>

//                     <button
//                       onClick={() => toggleOpenPO(index)}
//                       className={`h-[48px] w-full bg-white border border-slate-300 rounded-lg px-3 flex justify-between items-center shadow-sm`}
//                     >
//                       <p
//                         className={`text-md ${
//                           postatuscolor[project.po_status]
//                         }`}
//                       >
//                         {project.po_status || "PO STATUS"}
//                       </p>
//                       <SlArrowDown
//                         className={`text-lg text-[#0e9dc7] ${
//                           openPOStates[index] ? "rotate-180" : ""
//                         }`}
//                       />
//                     </button>

//                     {openPOStates[index] && (
//                       <div className="absolute left-0 mt-1 w-full bg-white border border-[#0e9dc7] rounded-lg shadow-xl z-[9999]">
//                         {poItems.map((item, i) => (
//                           <div
//                             key={i}
//                             className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${postatuscolor[item]}`}
//                             onClick={() => {
//                               setPreviousPoStatus((prev) => ({
//                                 ...prev,
//                                 [project.projectName]: project.po_status,
//                               }));

//                               setProjects((prev) =>
//                                 prev.map((p) =>
//                                   p.projectName === project.projectName
//                                     ? { ...p, po_status: item }
//                                     : p
//                                 )
//                               );

//                               setAssemblyName(project.projectName);
//                               setPopupPoStatus(item);

//                               if (item === "DISPATCHED") {
//                                 setShowPoPopup(true);
//                                 setPopupDc(project.dc_number || "");
//                                 setPopupDcDate(project.dispatch_date || "");
//                                 setPopupDcTracking(
//                                   project.tracking_number || ""
//                                 );
//                               } else {
//                                 updatePoStatus(project.projectName, item);
//                               }

//                               toggleOpenPO(index);
//                             }}
//                           >
//                             {item}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* INVOICE STATUS */}
//                   <div
//                     ref={invoiceRefs.current[index]}
//                     className="relative w-[150px]"
//                   >
//                     <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-semibold text-[#0e9dc7] z-10">
//                       INVOICE STATUS
//                     </label>

//                     <button
//                       onClick={() => toggleOpenInvoice(index)}
//                       className="h-[48px] w-full bg-white border border-slate-300 rounded-lg px-3 flex justify-between items-center shadow-sm"
//                     >
//                       {project.invoice_status || "INVOICE STATUS"}
//                       <SlArrowDown
//                         className={`text-lg text-[#0e9dc7] ${
//                           openInvoiceStates[index] ? "rotate-180" : ""
//                         }`}
//                       />
//                     </button>

//                     {openInvoiceStates[index] && (
//                       <div className="fixed left-0 mt-1 w-full bg-white border border-[#0e9dc7] rounded-lg shadow-xl z-[9999]">
//                         {invoiceItems.map((item, i) => (
//                           <div
//                             key={i}
//                             className="px-4 py-2 cursor-pointer hover:bg-blue-50"
//                             onClick={() => {
//                               setPreviousInvoiceStatus((prev) => ({
//                                 ...prev,
//                                 [project.projectName]: project.invoice_status,
//                               }));

//                               setProjects((prev) =>
//                                 prev.map((p) =>
//                                   p.projectName === project.projectName
//                                     ? { ...p, invoice_status: item }
//                                     : p
//                                 )
//                               );

//                               setAssemblyName(project.projectName);
//                               setPopupInvoiceStatus(item);

//                               if (item === "INVOICED") {
//                                 setShowInvoicePopup(true);
//                                 setPopupInvoiceNo(project.invoice_number || "");
//                               } else {
//                                 updateInvoiceStatus(project.projectName, item);
//                               }

//                               toggleOpenInvoice(index);
//                             }}
//                           >
//                             {item}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* PAYMENT STATUS */}
//                   <div
//                     ref={paymentRefs.current[index]}
//                     className="relative w-[150px]"
//                   >
//                     <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-semibold text-[#0e9dc7] z-10">
//                       PAYMENT STATUS
//                     </label>

//                     <button
//                       onClick={() => toggleOpenPayment(index)}
//                       className="h-[48px] w-full bg-white border border-slate-300 rounded-lg px-3 flex justify-between items-center shadow-sm"
//                     >
//                       {project.payment_status || "PAYMENT STATUS"}
//                       <SlArrowDown
//                         className={`text-lg text-[#0e9dc7] ${
//                           openPaymentStates[index] ? "rotate-180" : ""
//                         }`}
//                       />
//                     </button>

//                     {openPaymentStates[index] && (
//                       <div className="absolute left-0 mt-1 w-full bg-white border border-[#0e9dc7] rounded-lg shadow-xl z-[9999]">
//                         {paymentItems.map((item, i) => (
//                           <div
//                             key={i}
//                             className="px-4 py-2 cursor-pointer hover:bg-blue-50"
//                             onClick={() => {
//                               setProjects((prev) =>
//                                 prev.map((p) =>
//                                   p.projectName === project.projectName
//                                     ? { ...p, payment_status: item }
//                                     : p
//                                 )
//                               );

//                               updatePaymentStatus(project.projectName, item);

//                               toggleOpenPayment(index);
//                             }}
//                           >
//                             {item}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* EXPAND BUTTON */}
//                   <button
//                     onClick={() => toggleExpand(index)}
//                     className="p-2 hover:bg-slate-100 rounded"
//                     aria-label={isOpen ? "Collapse details" : "Expand details"}
//                   >
//                     <SlArrowDown
//                       className={`text-2xl text-slate-400 ${
//                         isOpen ? "rotate-180" : ""
//                       }`}
//                     />
//                   </button>
//                 </div>
//               </div>

//               {/* EXPANDED BODY */}
//               {isOpen ? (
//                 view === role ? (
//                   <div className="border-t border-slate-100 bg-slate-50 pl-6 pr-6 pb-6 pt-3 h-[28vh] overflow-y-auto rounded-bl-2xl rounded-br-2xl">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           ORDER SERIAL : {project.order_serial}
//                         </p>
//                       </div>
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           QUOTATION NAME : {project.quotationname}
//                         </p>
//                       </div>
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           DC No. : {project.dc_number}
//                         </p>
//                       </div>
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           DATE OF DISPATCH : {project.dispatch_date}
//                         </p>
//                       </div>
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           INVOICE NUMBER : {project.invoice_number}
//                         </p>
//                       </div>
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           TRACKING NUMBER
//                         </p>
//                         <input
//                           placeholder="Tracking Number"
//                           value={project.tracking_number || ""}
//                           onChange={(e) =>
//                             handleTrackingChange(index, e.target.value)
//                           }
//                           className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-4 text-md text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7] shadow-sm"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="border-t border-slate-100 bg-slate-50 pl-6 pr-6 pb-6 pt-3 h-[34vh] overflow-y-auto rounded-bl-2xl rounded-br-2xl">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//                       {/* ORDER SERIAL */}
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           ORDER SERIAL : {project.order_serial}
//                         </p>
//                       </div>

//                       {/* QUOTATION NAME */}
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           QUOTATION NAME : {project.quotationname}
//                         </p>
//                       </div>

//                       {/* DC NUMBER */}
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           DC No.
//                         </p>
//                         <input
//                           placeholder="Enter DC Number"
//                           value={project.dc_number || ""}
//                           onChange={(e) =>
//                             handleFieldChange(
//                               index,
//                               "dc_number",
//                               e.target.value
//                             )
//                           }
//                           className="w-full rounded-lg border border-slate-200 bg-white py-2 px-4 text-md
//                    text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1
//                    focus:ring-[#0e9dc7] shadow-sm"
//                         />
//                       </div>

//                       {/* DISPATCH DATE */}
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           DATE OF DISPATCH
//                         </p>
//                         <input
//                           id="dcDateInput"
//                           type="date"
//                           value={project.dispatch_date || ""}
//                           onChange={(e) =>
//                             handleFieldChange(
//                               index,
//                               "dispatch_date",
//                               e.target.value
//                             )
//                           }
//                           className="w-full rounded-lg border border-slate-200 bg-white py-2 px-4 text-md
//                    text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1
//                    focus:ring-[#0e9dc7] shadow-sm"
//                         />
//                       </div>

//                       {/* INVOICE NUMBER */}
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           INVOICE NUMBER
//                         </p>
//                         <input
//                           placeholder="Enter Invoice Number"
//                           value={project.invoice_number || ""}
//                           onChange={(e) =>
//                             handleFieldChange(
//                               index,
//                               "invoice_number",
//                               e.target.value
//                             )
//                           }
//                           className="w-full rounded-lg border border-slate-200 bg-white py-2 px-4 text-md
//                    text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1
//                    focus:ring-[#0e9dc7] shadow-sm"
//                         />
//                       </div>

//                       {/* TRACKING NUMBER */}
//                       <div className="flex flex-col justify-center items-center gap-2 mt-3">
//                         <p className="text-center text-xl text-[#0e9dc7]">
//                           TRACKING NUMBER
//                         </p>
//                         <input
//                           placeholder="Enter Tracking Number"
//                           value={project.tracking_number || ""}
//                           onChange={(e) =>
//                             handleFieldChange(
//                               index,
//                               "tracking_number",
//                               e.target.value
//                             )
//                           }
//                           className="w-full rounded-lg border border-slate-200 bg-white py-2 px-4 text-md
//                    text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1
//                    focus:ring-[#0e9dc7] shadow-sm"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )
//               ) : null}
//             </article>
//           );
//         })}
//       </div>

//       {/* PO POPUP */}
//       {showPoPopup && (
//         <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-150 max-w-full mx-4">
//             <h2 className="text-xl font-semibold mb-4 text-center">
//               PO Status Details
//             </h2>

//             {/* DC Number */}
//             <div className="mb-4">
//               <label className="text-sm font-semibold" htmlFor="dcNumberInput">
//                 Enter DC No.
//               </label>
//               <input
//                 id="dcNumberInput"
//                 type="text"
//                 value={popupDc}
//                 onChange={(e) => setPopupDc(e.target.value)}
//                 className="w-full mt-1 p-2 border border-[#3da5c5] rounded"
//               />
//             </div>

//             {/* DISPATCH DATE (CALENDAR ENABLED) */}
//             <div className="mb-4">
//               <label className="text-sm font-semibold" htmlFor="dcDateInput">
//                 Select Dispatch Date
//               </label>
//               <input
//                 id="dcDateInput"
//                 type="date" // <-- Calendar enabled
//                 value={popupDcDate}
//                 onChange={(e) => setPopupDcDate(e.target.value)}
//                 className="w-full mt-1 p-2 border border-[#3da5c5] rounded"
//               />
//             </div>

//             {/* TRACKING NUMBER */}
//             <div className="mb-4">
//               <label className="text-sm font-semibold" htmlFor="trackingInput">
//                 Tracking No.
//               </label>
//               <input
//                 id="trackingInput"
//                 type="text"
//                 value={popupDcTracking}
//                 onChange={(e) => setPopupDcTracking(e.target.value)}
//                 className="w-full mt-1 p-2 border border-[#3da5c5] rounded"
//               />
//             </div>

//             {/* BUTTONS */}
//             <div className="flex justify-between gap-3">
//               <button
//                 className="px-4 py-2 bg-gray-300 rounded"
//                 onClick={() => {
//                   const prevStatus = previousPoStatus[assemblyName];
//                   if (prevStatus) {
//                     setProjects((prev) =>
//                       prev.map((proj) =>
//                         proj.projectName === assemblyName
//                           ? { ...proj, po_status: prevStatus }
//                           : proj
//                       )
//                     );
//                   }
//                   setPopupPoStatus("");
//                   setPopupDc("");
//                   setPopupDcDate("");
//                   setPopupDcTracking("");
//                   setShowPoPopup(false);
//                 }}
//               >
//                 Cancel
//               </button>

//               <button
//                 className="px-4 py-2 bg-[#0e9dc7] text-white rounded"
//                 onClick={() => {
//                   savePoDetails();
//                   setShowPoPopup(false);
//                 }}
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* INVOICE POPUP */}
//       {showInvoicePopup && (
//         <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-150 max-w-full mx-4">
//             <h2 className="text-xl font-semibold mb-4 text-center">
//               Invoice Status Details
//             </h2>
//             <div className="mb-4">
//               <label
//                 className="text-sm font-semibold"
//                 htmlFor="invoiceNumberInput"
//               >
//                 Enter Invoice Number
//               </label>
//               <input
//                 id="invoiceNumberInput"
//                 type="text"
//                 value={popupInvoiceNo}
//                 onChange={(e) => setPopupInvoiceNo(e.target.value)}
//                 className="w-full mt-1 p-2 border border-[#3da5c5] rounded"
//               />
//             </div>
//             <div className="flex justify-between gap-3">
//               <button
//                 className="px-4 py-2 bg-gray-300 rounded"
//                 onClick={() => {
//                   // Revert Invoice status to previous value
//                   const prevStatus = previousInvoiceStatus[assemblyName];
//                   if (prevStatus) {
//                     setProjects((prevProjects) =>
//                       prevProjects.map((proj) =>
//                         proj.projectName === assemblyName
//                           ? { ...proj, invoice_status: prevStatus }
//                           : proj
//                       )
//                     );
//                   }

//                   // Close popup and reset fields
//                   setPopupInvoiceStatus("");
//                   setPopupInvoiceNo("");
//                   setShowInvoicePopup(false);
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-4 py-2 bg-[#0e9dc7] text-white rounded"
//                 onClick={() => {
//                   saveInvoiceDetails();
//                   setShowInvoicePopup(false);
//                 }}
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderTracking;

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/AppConstant";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, MoveLeft, Save, Table2 } from "lucide-react";
import { SlArrowDown } from "react-icons/sl";
import Loading from "../components/Loading";
import * as XLSX from "xlsx";

const bomFields = [
  { key: "part_no", label: "PART No.", width: "150px" },
  { key: "description", label: "DESCRIPTION", width: "300px" },
  { key: "quantity", label: "QTY", width: "70px" },
  { key: "part_status", label: "STATUS", width: "120px" },
  { key: "part_remark", label: "REMARKS", width: "200px" },
];

const jobItems = [
  "NOT YET",
  "MATERIAL PURCHASE",
  "MACHINING",
  "FINISHING",
  "QC",
  "READY FOR DISPATCH",
];

// Font colors for status
const statusColors = {
  "NOT YET": "text-red-500",
  "MATERIAL PURCHASE": "text-yellow-800",
  MACHINING: "text-orange-500",
  FINISHING: "text-yellow-400",
  QC: "text-blue-500",
  "READY FOR DISPATCH": "text-green-500",
};

const BomTable = () => {
  const { state } = useLocation();
  const projectName = state?.name || "";
  const navigate = useNavigate();

  const [bomData, setBomData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openIndex, setOpenIndex] = useState(null);
  const dropdownRefs = useRef([]);

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (
        openIndex !== null &&
        dropdownRefs.current[openIndex] &&
        !dropdownRefs.current[openIndex].contains(e.target)
      ) {
        setOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openIndex]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}fetchbom/?project_name=${projectName}`
      );
      if (res.data.status !== "ok") {
        setError("No data found");
        return;
      }
      const sorted = res.data.data
        .map((item) => ({ ...item, description: item.description || "N/A" }))
        .sort((a, b) => a.part_no.localeCompare(b.part_no));
      setBomData(sorted);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleCellChange = (rowIndex, field, value) => {
    setIsDirty(true);
    setBomData((prev) =>
      prev.map((row, i) => (i === rowIndex ? { ...row, [field]: value } : row))
    );
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = bomData.map((i) => ({
      project_name: projectName,
      part_no: i.part_no,
      description: i.description,
      quantity: i.quantity,
      part_status: i.part_status || "",
      part_remark: i.part_remark || "",
    }));

    try {
      const res = await axios.post(`${BASE_URL}update_cost/`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.status === "ok") {
        alert("✅ Data saved successfully!");
      } else {
        alert("❌ Server error — Check console");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save");
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  };

  const exportToExcel = () => {
    const sortedData = [...bomData].sort((a, b) =>
      a.part_no.localeCompare(b.part_no)
    );

    const exportData = sortedData.map((row, index) => ({
      "SL NO": index + 1,
      PART_NO: row.part_no,
      DESCRIPTION: row.description || "",
      QTY: row.quantity || "",
      STATUS: row.part_status || "",
      REMARKS: row.part_remark || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BOM");

    XLSX.writeFile(workbook, `${projectName}_BOM.xlsx`);
  };

  const exportToPDF = () => {
    const printWindow = window.open("", "_blank");
    const html = `
      <html>
      <head>
        <title>BOM PDF</title>
        <style>
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; text-align: center; }
          th { background: #eee; }
        </style>
      </head>
      <body>
        <h2>BOM SHEET - ${projectName}</h2>
        <table>
          <tr>
            <th>Sl No.</th>
            ${bomFields.map((f) => `<th>${f.label}</th>`).join("")}
          </tr>
          ${bomData
            .map(
              (row, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${row.part_no}</td>
              <td>${row.description}</td>
              <td>${row.quantity}</td>
              <td style="color: ${getStatusColor(row.part_status)}">${
                row.part_status
              }</td>
              <td>${row.part_remark}</td>
            </tr>`
            )
            .join("")}
        </table>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  // Helper for PDF color
  const getStatusColor = (status) => {
    switch (status) {
      case "NOT YET":
        return "red";
      case "MATERIAL PURCHASE":
        return "brown";
      case "MACHINING":
        return "orange";
      case "FINISHING":
        return "yellow";
      case "QC":
        return "blue";
      case "READY FOR DISPATCH":
        return "green";
      default:
        return "black";
    }
  };

  return (
    <>
      <div className="flex flex-col w-full h-[95%] p-8">
        <div className="w-full flex flex-row justify-between item-center">
          <div className="w-fit flex flex-row justify-between items-center py-2 gap-2">
            <button
              onClick={() => {
                const confirmLeave = window.confirm(
                  "Are you sure you want to leave this page? Unsaved changes will be lost."
                );

                if (confirmLeave) {
                  navigate("/job");
                }
              }}
            >
              <MoveLeft className="w-8 h-8 text-[#0e9dc7] opacity-50" />
            </button>

            <h1 className="text-2xl font-semibold text-[#0e9dc7] ml-1">
              BOM SHEET: {projectName}
            </h1>
          </div>
          <div className="w-fit flex gap-4">
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

        <div className="overflow-x-auto rounded-lg mt-6">
          <table className="w-full table-fixed">
            <thead className="bg-[#ececec] sticky top-0 border-b-1 border-black/10 z-10">
              <tr className="text-center text-lg">
                <th style={{ width: "30px" }}>Sl No.</th>
                {bomFields.map((field) => (
                  <th
                    key={field.key}
                    className="px-2 py-2"
                    style={{ width: field.width }}
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-center">
              {bomData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 relative">
                  <td className="border-b-1 border-black/10">{idx + 1}</td>

                  {bomFields.map((field) => (
                    <td
                      key={field.key}
                      className={`px-2 py-2 border-1 border-black/10 ${
                        field.key === "part_no" ? "break-words" : ""
                      }`}
                    >
                      {field.key === "part_status" ? (
                        <div
                          className="relative"
                          ref={(el) => (dropdownRefs.current[idx] = el)}
                        >
                          <button
                            onClick={() =>
                              setOpenIndex(openIndex === idx ? null : idx)
                            }
                            className="h-[40px] w-full bg-white border border-slate-300 rounded px-1 flex justify-between items-center text-sm"
                          >
                            <span
                              className={statusColors[row.part_status] || ""}
                            >
                              {row.part_status || "STATUS"}
                            </span>
                            <SlArrowDown
                              className={`text-lg text-[#0e9dc7] transition-transform ${
                                openIndex === idx ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {openIndex === idx && (
                            <div className="absolute left-0 mt-1 w-full bg-white border border-[#0e9dc7] rounded-lg shadow-xl z-50 text-sm">
                              {jobItems.map((item) => (
                                <div
                                  key={item}
                                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${statusColors[item]}`}
                                  onClick={() => {
                                    handleCellChange(idx, "part_status", item);
                                    setOpenIndex(null);
                                  }}
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : field.key === "description" ? (
                        <textarea
                          value={row.description}
                          onChange={(e) =>
                            handleCellChange(idx, "description", e.target.value)
                          }
                          rows={2}
                          className="w-full border-none bg-transparent focus:outline-none resize-none whitespace-pre-wrap break-words text-center"
                        />
                      ) : (
                        <textarea
                          value={row[field.key] ?? ""}
                          onChange={(e) =>
                            handleCellChange(idx, field.key, e.target.value)
                          }
                          className="w-full text-center border-none bg-transparent focus:outline-none resize-none whitespace-normal break-words"
                          rows={2}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {loading && (
        <div className="w-full  h-screen">
          <Loading />
        </div>
      )}
    </>
  );
};

export default BomTable;
