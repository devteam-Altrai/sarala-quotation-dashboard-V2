import { useEffect, useState } from "react";
import { useFileWebSocket } from "../context/webSocketContext";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FileProcessingLoader() {
  const { loading, progress, message } = useFileWebSocket();

  const [expanded, setExpanded] = useState(true);

  if (!loading) return null;


  return (
    <>
      <div className=" fixed bottom-0 right-4 z-[9999] w-[calc(100vw-2rem)] max-w-[300px] overflow-hidden rounded-t-xl border border-gray-300 bg-white shadow-xl transition-all duration-300">
        <div
          onClick={() => setExpanded(!expanded)}
          className=" flex min-h-[52px] cursor-pointer select-none items-center justify-between bg-[#0e9dc7] px-4 py-3 text-white"
        >
          <div className="flex items-center gap-2.5">
            <span>📄</span>

            <span className="font-semibold">File Processing</span>
          </div>

          <div className="text-lg transition-all duration-300">
            {expanded ? <ChevronDown /> : <ChevronUp />}
          </div>
        </div>

        <div
          className={`overflow-hidden bg-white transition-all duration-300 ${
            expanded ? "max-h-[220px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-4">
            <div className="mb-3 font-semibold text-gray-700">{message}</div>

            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0e9dc7] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
{/* 
            <div className="flex flex-col justify-between">
              {progress !== 100 && <div>

              </div> }
            </div> */}
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>Progress</span>

              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
