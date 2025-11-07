import React, { useEffect, useRef, useState } from "react";
import { MdRateReview, MdDeleteForever } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchFiles } from "../redux/FilesSlice";
import Loading from "../components/Loading";
import Error from "../components/Error";
import { CloudUpload } from "lucide-react";
import axios from "axios";
import { BASE_URL, SPI_URL } from "../utils/AppConstant";

const Dashboard = () => {
  const dispatch = useDispatch();
  const files = useSelector((state) => state.files.data);
  const status = useSelector((state) => state.files.status);

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchFiles()); // initial fetch
    const interval = setInterval(() => {
      dispatch(fetchFiles()); // auto-refresh in background
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const siteUrl = SPI_URL;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("site_url", siteUrl);

    try {
      setUploading(true);
      await axios.post(`${BASE_URL}upload/zip/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchFiles());
    } catch (error) {
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (status === "loading" || uploading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loading />
      </div>
    );

  if (status === "failed")
    return (
      <div className="flex justify-center items-center h-full">
        <Error />
      </div>
    );

  // --- Sorting logic ---
  const sortedFiles = [...files].sort((a, b) => {
    const aHasQuotation = !!a.quotationname;
    const bHasQuotation = !!b.quotationname;

    // 1️⃣ Entries without quotation come first
    if (!aHasQuotation && bHasQuotation) return -1;
    if (aHasQuotation && !bHasQuotation) return 1;

    // 2️⃣ Both without quotation → sort by upload date (oldest first)
    if (!aHasQuotation && !bHasQuotation) {
      return new Date(a.uploaded_at) - new Date(b.uploaded_at);
    }

    // 3️⃣ Both with quotation → sort by quotation name alphabetically
    const nameCompare = a.quotationname.localeCompare(b.quotationname);
    if (nameCompare !== 0) return nameCompare;

    // 4️⃣ If quotation names are same → sort by upload date (oldest first)
    return new Date(a.uploaded_at) - new Date(b.uploaded_at);
  });

  return (
    <div className="flex flex-col w-full h-full">
      <input
        type="file"
        accept=".zip"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="w-full h-15 p-2.5 ">
        <div className="flex flex-row md:mr-1 justify-between">
          <div className="flex items-center md:ml-1">
            <p className="text-lg md:text-2xl ml-3">DELIVERIES</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <input
              type="text"
              placeholder="Search"
              className="p-2 border rounded"
              style={{ width: "120px" }}
            />
            <div className="hidden md:block">
              <button
                className="m-3 relative group"
                onClick={handleClick}
                disabled={uploading}
              >
                <div className="absolute top-1/2 right-1 -translate-y-1/2 duration-400 w-10 group-hover:w-[94%] h-[82%] bg-white flex justify-center items-center rounded-md p-1">
                  <CloudUpload
                    color={uploading ? "#999" : "#0e9dc7"}
                    style={{ width: 20, height: 20 }}
                  />
                </div>

                <div className="bg-[#3da5c5] w-35 h-10 flex justify-start items-center rounded-lg">
                  <p className="ml-4 text-white">UPLOAD</p>
                </div>
              </button>
            </div>
            <div className="md:hidden flex justify-center items-center">
              <button onClick={handleClick} disabled={uploading}>
                <CloudUpload
                  color="#0e9dc7"
                  style={{ width: "30", height: "30" }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className=" w-full h-full p-3">
        <div className="overflow-hidden">
          <table className="w-full h-full table-fixed  ">
            <thead className="sticky top-0 z-10 ">
              <tr className="text-center">
                <th className="px-6 py-4 text-[17px] font-semibold text-glass-text-primary tracking-wider uppercase">
                  Projects
                </th>
                <th className="px-6 py-4 text-[17px] font-semibold text-glass-text-primary tracking-wider uppercase">
                  Upload Date
                </th>
                <th className="px-6 py-4 text-[17px] font-semibold text-glass-text-primary tracking-wider uppercase">
                  Quotation Name
                </th>
                <th className="px-6 py-4 text-[17px] font-semibold text-glass-text-primary tracking-wider uppercase">
                  Quotation Date
                </th>
                <th className="px-6 py-4 text-[17px] font-semibold text-glass-text-primary tracking-wider uppercase">
                  Grand Total
                </th>
              </tr>
            </thead>
          </table>
          <div className="overflow-y-auto overflow-x-auto flex-1">
            <table className="w-full h-full table-fixed">
              <tbody className="text-[#444] text-center">
                {sortedFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-[#90d1f4] transition-all duration-200"
                  >
                    {/* File Name */}
                    <td className="px-2 py-2 whitespace-normal max-w-xl break-words">
                      <div className="text-[16px] font-medium">{file.name}</div>
                    </td>

                    {/* Uploaded Date */}
                    <td className="px-6 py-4 whitespace-normal max-w-xs break-words">
                      <div className="text-[16px] font-medium">
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Quotation Name */}
                    <td className="px-6 py-4 whitespace-normal max-w-xs break-words">
                      <div className="text-[16px] font-medium">
                        {file.quotationname}
                      </div>
                    </td>

                    {/* Last Date */}
                    <td className="px-6 py-4 whitespace-normal max-w-xs break-words">
                      <div className="text-[16px] font-medium">
                        {file.grandTotal
                          ? new Date(file.last_date).toLocaleDateString()
                          : ""}
                      </div>
                    </td>

                    {/* Grand Total */}
                    <td className="px-6 py-4 whitespace-normal max-w-xs break-words">
                      <div className="text-[16px] font-medium">
                        {file.grandTotal}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
