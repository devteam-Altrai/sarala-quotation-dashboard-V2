// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { BASE_URL } from "../utils/AppConstant";
// import { FileSpreadsheet } from "lucide-react";
// import Loading from "../components/Loading";

// const JobTracking = () => {
//   const navigate = useNavigate();
//   const [project, setProject] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchJobTracking = async () => {
//       setLoading(true);
//       try {
//         const [jobRes, serialRes] = await Promise.all([
//           fetch(`${BASE_URL}jobdata/`),
//           fetch(`${BASE_URL}fetchorderserial/`),
//         ]);

//         const jobJson = await jobRes.json();
//         const serialJson = await serialRes.json();

//         if (jobJson.status === "ok" && serialJson.status === "ok") {
//           const merged = jobJson.data.map((job) => {
//             // Try multiple possible key names
//             const match = serialJson.data.find(
//               (item) =>
//                 item.projectName === job.projectName ||
//                 item.project_name === job.projectName ||
//                 item.project === job.projectName
//             );

//             return {
//               ...job,
//               order_serial: match?.order_serial || "",
//               serialInfo: match || null,
//             };
//           });

//           setProject(merged);
//         }
//       } catch (e) {
//         console.error("Error fetching data:", e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobTracking();
//   }, []);

//   return (
//     <div className="w-full h-[87vh] flex flex-col">
//       <div className="pb-4">
//         <h1 className="text-2xl font-medium text-[#0e9dc7]  pl-8 pt-8 pr-8 ">
//           JOB TRACKING
//         </h1>
//         <p className="text-sm text-[#444] ml-8 mt-1">
//           Specific job details with Specific Part No.
//         </p>
//       </div>
//       <div className="flex-1 overflow-y-auto gap-4">
//         <div className="flex flex-col gap-5 p-5">
//           {project.length === 0 ? (
//             <EmptyState
//               title="Empty here!!"
//               subtitle="Once job details are available, they will appear here instantly."
//             />
//           ) : (
//             project.map((assembly, index) => (
//               <div
//                 key={index}
//                 className="flex flex-row justify-between items-center p-4 border border-[#0e9dc7] w-full rounded-lg"
//               >
//                 <h2 className="text-xl font-semibold text-[#0e9dc7]">
//                   {assembly.order_serial} | PO No. - {assembly.po_number}
//                 </h2>

//                 <button
//                   onClick={() =>
//                     navigate("/job/bom", {
//                       state: { name: assembly.projectName },
//                     })
//                   }
//                   className="relative group hidden md:block"
//                 >
//                   <div className="absolute top-1/2 right-1 -translate-y-1/2 h-[82%] bg-white flex justify-center items-center rounded-md p-1 w-10 group-hover:w-[94%] transition-all">
//                     <FileSpreadsheet
//                       style={{ width: 20, height: 20 }}
//                       color="#0e9dc7"
//                     />
//                   </div>

//                   <div className="bg-[#3da5c5] w-38 h-10 flex items-center rounded-lg pl-4">
//                     <p className="text-white">BOM TABLE</p>
//                   </div>
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//       {loading && (
//         <div className="w-full h-screen">
//           <Loading />
//         </div>
//       )}
//     </div>
//   );
// };

// const EmptyState = ({ title, subtitle }) => (
//   <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-white p-8 text-center text-slate-500">
//     <p className="text-lg font-semibold text-slate-700">{title}</p>
//     <p className="text-sm">{subtitle}</p>
//   </div>
// );

// export default JobTracking;

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { BASE_URL } from "../utils/AppConstant";
// import { FileSpreadsheet, FolderDown } from "lucide-react";
// import Loading from "../components/Loading";

// const JobTracking = () => {
//   const navigate = useNavigate();
//   const [project, setProject] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ---------------- Download project with progress ----------------
//   const handleProjectdownload = async (fileName) => {
//     try {
//       const response = await axios.get(`${BASE_URL}download/${fileName}`, {
//         responseType: "blob",
//       });

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `${fileName}_all_files.zip`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (e) {
//       console.error("Error downloading project file:", e);
//     }
//   };

//   // ---------------- Fetch job tracking data ----------------
//   useEffect(() => {
//     const fetchJobTracking = async () => {
//       setLoading(true);
//       try {
//         const [jobRes, serialRes] = await Promise.all([
//           axios.get(`${BASE_URL}jobdata/`),
//           axios.get(`${BASE_URL}fetchorderserial/`),
//         ]);

//         if (jobRes.data.status === "ok" && serialRes.data.status === "ok") {
//           const merged = jobRes.data.data.map((job) => {
//             const match = serialRes.data.data.find(
//               (item) =>
//                 item.projectName === job.projectName ||
//                 item.project_name === job.projectName ||
//                 item.project === job.projectName
//             );
//             return {
//               ...job,
//               order_serial: match?.order_serial || "",
//               serialInfo: match || null,
//             };
//           });
//           setProject(merged);
//         }
//       } catch (e) {
//         console.error("Error fetching job tracking data:", e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobTracking();
//   }, []);

//   return (
//     <div className="w-full h-[87vh] flex flex-col">
//       <div className="pb-4">
//         <h1 className="text-2xl font-medium text-[#0e9dc7] pl-8 pt-8 pr-8">
//           JOB TRACKING
//         </h1>
//         <p className="text-sm text-[#444] ml-8 mt-1">
//           Specific job details with Specific Part No.
//         </p>
//       </div>

//       <div className="flex-1 overflow-y-auto gap-4">
//         <div className="flex flex-col gap-5 p-5">
//           {project.length === 0 ? (
//             <EmptyState
//               title="Empty here!!"
//               subtitle="Once job details are available, they will appear here instantly."
//             />
//           ) : (
//             project.map((assembly, index) => (
//               <div
//                 key={index}
//                 className="flex flex-row justify-between items-center p-4 border border-[#0e9dc7] w-full rounded-lg"
//               >
//                 <h2 className="text-xl font-semibold text-[#0e9dc7]">
//                   {assembly.order_serial} | PO No. - {assembly.po_number}
//                 </h2>
//                 <div className="flex flex-row justify-center items-center w-fit px-2 gap-4">
//                   <button
//                     onClick={() => handleProjectdownload(assembly.projectName)}
//                   >
//                     <FolderDown
//                       style={{ width: 30, height: 30 }}
//                       color="#0e9dc7"
//                       className="hover:scale-112 transition-transform cursor-pointer"
//                     />
//                   </button>
//                   <button
//                     onClick={() =>
//                       navigate("/job/bom", {
//                         state: { name: assembly.projectName },
//                       })
//                     }
//                     className="relative group hidden md:block"
//                   >
//                     <div className="absolute top-1/2 right-1 -translate-y-1/2 h-[82%] bg-white flex justify-center items-center rounded-md p-1 w-10 group-hover:w-[94%] transition-all">
//                       <FileSpreadsheet
//                         style={{ width: 20, height: 20 }}
//                         color="#0e9dc7"
//                       />
//                     </div>
//                     <div className="bg-[#3da5c5] w-38 h-10 flex items-center rounded-lg pl-4">
//                       <p className="text-white">BOM TABLE</p>
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {loading && (
//         <div className="w-full h-screen">
//           <Loading />
//         </div>
//       )}
//     </div>
//   );
// };

// const EmptyState = ({ title, subtitle }) => (
//   <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-white p-8 text-center text-slate-500">
//     <p className="text-lg font-semibold text-slate-700">{title}</p>
//     <p className="text-sm">{subtitle}</p>
//   </div>
// );

// export default JobTracking;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/AppConstant";
import { FileSpreadsheet, FolderDown } from "lucide-react";
import Loading from "../components/Loading";

const JobTracking = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState([]);
  const [loading, setLoading] = useState(true);

  // const [progress, setProgress] = useState(0);
  // const [showLoader, setShowLoader] = useState(false);

  // const pollProgress = () => {
  //   const interval = setInterval(async () => {
  //     try {
  //       const res = await axios.get(`${BASE_URL}get_progress/`);
  //       const percent = res.data.progress;
  //       setProgress(percent);

  //       if (percent >= 100) {
  //         clearInterval(interval);
  //         // ❌ DO NOT hide loader here
  //       }
  //     } catch (err) {
  //       clearInterval(interval);
  //     }
  //   }, 500);
  // };

  // ---------------- Download project with progress ----------------
  // const handleProjectdownload = async (fileName) => {
  //   try {
  //     setProgress(0);
  //     setShowLoader(true);

  //     pollProgress();

  //     const response = await axios.get(`${BASE_URL}download/${fileName}`, {
  //       responseType: "blob",
  //     });

  //     const blob = new Blob([response.data], {
  //       type: "application/zip",
  //     });

  //     const url = window.URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `${fileName}_all_files.zip`;

  //     document.body.appendChild(link);
  //     link.click(); // ⬅️ DOWNLOAD DIALOG TRIGGERS HERE

  //     // ✅ HIDE LOADER ONLY NOW
  //     setShowLoader(false);

  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);
  //   } catch (e) {
  //     setShowLoader(false);
  //     console.error("Download error:", e);
  //   }
  // };

  // ---------------- Fetch job tracking data ----------------
  useEffect(() => {
    const fetchJobTracking = async () => {
      setLoading(true);
      try {
        const [jobRes, serialRes, postatusRes] = await Promise.all([
          axios.get(`${BASE_URL}jobdata/`),
          axios.get(`${BASE_URL}fetchorderserial/`),
          axios.get(`${BASE_URL}fetchorderpostatus/`),
        ]);

        if (
          jobRes.data.status === "ok" &&
          serialRes.data.status === "ok" &&
          postatusRes.data.status === "ok"
        ) {
          const merged = jobRes.data.data.map((job) => {
            const matchSerial = serialRes.data.data.find(
              (item) =>
                item.projectName === job.projectName ||
                item.project_name === job.projectName ||
                item.project === job.projectName
            );

            const matchPoStatus = postatusRes.data.data.find(
              (item) => item.projectName === job.projectName
            );

            return {
              ...job,
              order_serial: matchSerial?.order_serial || "",
              serialInfo: matchSerial || null,
              po_status: matchPoStatus?.po_status || "",
            };
          });

          setProject(merged);
        }
      } catch (e) {
        console.error("Error fetching job tracking data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchJobTracking();
  }, []);

  return (
    <>
      <div className="w-full h-[87vh] flex flex-col">
        <div className="pb-4">
          <h1 className="text-2xl font-medium text-[#0e9dc7] pl-8 pt-8 pr-8">
            JOB TRACKING
          </h1>
          <p className="text-sm text-[#444] ml-8 mt-1">
            Specific job details with Specific Part No.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto gap-4">
          <div className="flex flex-col gap-5 p-5">
            {project.length === 0 ? (
              <EmptyState
                title="Empty here!!"
                subtitle="Once job details are available, they will appear here instantly."
              />
            ) : (
              project.map((assembly, index) => (
                <div
                  key={index}
                  className="flex flex-row justify-between items-center p-4 border border-[#0e9dc7] w-full rounded-lg"
                >
                  <h2 className="text-xl font-semibold text-[#0e9dc7]">
                    {assembly.order_serial} | PO No. - {assembly.po_number} | PO
                    Status - {assembly.po_status}
                  </h2>
                  <div className="flex flex-row justify-center items-center w-fit px-2 gap-4">
                    {/* <button
                      onClick={() =>
                        handleProjectdownload(assembly.projectName)
                      }
                    >
                      <FolderDown
                        style={{ width: 30, height: 30 }}
                        color="#0e9dc7"
                        className="hover:scale-112 transition-transform cursor-pointer"
                      />
                    </button> */}
                    <button
                      onClick={() =>
                        navigate("/job/bom", {
                          state: {
                            name: assembly.projectName,
                            po_no: assembly.po_number,
                          },
                        })
                      }
                      className="relative group hidden md:block"
                    >
                      <div className="absolute top-1/2 right-1 -translate-y-1/2 h-[82%] bg-white flex justify-center items-center rounded-md p-1 w-10 group-hover:w-[94%] transition-all">
                        <FileSpreadsheet
                          style={{ width: 20, height: 20 }}
                          color="#0e9dc7"
                        />
                      </div>
                      <div className="bg-[#3da5c5] w-38 h-10 flex items-center rounded-lg pl-4">
                        <p className="text-white">BOM TABLE</p>
                      </div>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {loading && (
          <div className="w-full h-screen">
            <Loading />
          </div>
        )}
      </div>

      {/* {showLoader && (
        <div className="w-full px-8 mb-4">
          <p className="text-sm mb-1">Fetching & cleaning files… {progress}%</p>
          <div className="w-full h-3 bg-gray-200 rounded">
            <div
              className="h-3 bg-green-500 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )} */}
    </>
  );
};

const EmptyState = ({ title, subtitle }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-white p-8 text-center text-slate-500">
    <p className="text-lg font-semibold text-slate-700">{title}</p>
    <p className="text-sm">{subtitle}</p>
  </div>
);

export default JobTracking;
