import React from "react";
import { MdRateReview, MdDeleteForever } from "react-icons/md";

const Dashboard = () => {
  return (
    <div className="w-full h-full rounded-xl">
      <div className="glass-morphism-strong rounded-xl h-full flex flex-col">
        {/* Table Header */}
        <div className="rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="glass-morphism-subtle sticky top-0 z-10">
              <tr className="text-left">
                <th className="px-6 py-4 text-[17px] font-semibold text-center text-glass-text-primary tracking-wider uppercase">
                  Projects
                </th>
                <th className="px-6 py-4 text-[17px] font-semibold text-center text-glass-text-primary tracking-wider uppercase">
                  Upload Date
                </th>
                <th className="px-6 py-4 text-[17px] font-semibold text-center text-glass-text-primary tracking-wider uppercase">
                  Quotation Name
                </th>
                <th className="px-6 py-4 text-[17px] font-semibold text-center text-glass-text-primary tracking-wider uppercase">
                  Quotation Date
                </th>
                <th className="px-6 py-4 text-[17px] font-semibold text-center text-glass-text-primary tracking-wider uppercase">
                  Total
                </th>
                <th className="px-6 py-4 text-[17px] font-semibold text-center text-glass-text-primary tracking-wider uppercase">
                  Action
                </th>
              </tr>
            </thead>
            {/* ...tbody */}
          </table>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto overflow-x-auto flex-1">
          <table className="w-full table-fixed">
            <tbody className="divide-y divide-white/50 text-black relative hover:z-10 text-center">
              <tr className=" hover:bg-[#90d1f4] transition-all duration-200 rounded-md">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[16px] font-medium tw">Project Beta</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[16px]">2025-02-02</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[16px]">Beta Quotation</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[16px]">2025-02-05</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[16px] font-semibold">8,300</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="inline-flex justify-center items-center gap-4">
                    <button title="Review">
                      <MdRateReview className="w-[23px] h-[23px]" />
                    </button>
                    <button title="Delete">
                      <MdDeleteForever className="w-[23px] h-[23px]" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-[#90d1f4] transition-colors duration-200 ">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[16px] font-medium">Project Beta</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[16px]">2025-02-02</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[16px]">Beta Quotation</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[16px]">2025-02-05</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[16px] font-semibold">8,300</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="inline-flex justify-center items-center gap-4">
                    <button title="Review">
                      <MdRateReview className="w-[23px] h-[23px]" />
                    </button>
                    <button title="Delete">
                      <MdDeleteForever className="w-[23px] h-[23px]" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
