import axios from "axios";
import { use, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/AppConstant";
import { ArrowLeft, Info, MoveLeft, SquarePen } from "lucide-react";

const table_fields = [
  "part_no",
  "description",
  "qty",
  "unit_price",
  "total_price",
  "hsn",
];

const tableLabels = {
  part_no: "PART NO.",
  description: "DESCRIPTION",
  qty: "QUANTITY",
  unit_price: "UNIT",
  total_price: "TOTAL",
  hsn: "HSN",
};

const coloumnWidth = {
  part_no: "150px",
  description: "250px",
  qty: "80px",
  unit_price: "80px",
  total_price: "100px",
  hsn: "150px",
};

const QuoteGenerationWindow = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const quote_items = state?.quote_items;
  const quotationName = state?.quote_name;
  const assemblyClient = state?.assembly_Client;

  const [data, setData] = useState([]);
  const [consigneeData, setConsigneeData] = useState([]);
  const [quoteItems, setQuoteItems] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState({
    client_id: 0,
    consignee_id: 0,
  });
  const [quoteGST, setQuoteGST] = useState(18);
  const [quoteValidity, setQuoteValidity] = useState(15);
  const [tab, setTab] = useState("part_details");
  const [formError, setFormError] = useState("");

  const handleCellChange = (rowIndex, field, value) => {
    const newData = [...quoteItems];
    const updatedRow = {
      ...newData[rowIndex],
      [field]: value,
    };

    const qty = Number(updatedRow.qty) || 0;
    const unitPrice = Number(updatedRow.unit_price) || 0;
    updatedRow.total_price = qty * unitPrice;
    newData[rowIndex] = updatedRow;
    setQuoteItems(newData);
  };

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`${BASE_URL}get_customer_address/`, {
          params: {
            company_code: assemblyClient,
          },
        });

        // console.log("Data:", res.data.data);
        setData(res.data.data);
        setConsigneeData(res.data.data);
      } catch (err) {
      const apiMessage = "❌ We could't Process yr request.";
      setFormError(apiMessage);
      }
    };

    fetchClient();
  }, [quotationName, assemblyClient]);

  useEffect(() => {
    setQuoteItems(quote_items);
  }, [quote_items]);

  const handleGenerateQuote = async () => {
    const formattedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
    const payload = {
      customer_id: selectedClient.client_id,
      consignee_id: selectedClient.consignee_id,
      quote_date: formattedDate,
      quote_no: quotationName,
      validity_days: quoteValidity,
      gst_rate: quoteGST,
      items: quoteItems,
    };

    const allFieldsPresent = Object.values(payload).every(
      (value) => value !== null && value !== undefined,
    );
    console.log("FFF:", payload);
    if (!payload.customer_id || !payload.customer_id) {
      const apiMessage = "❌ Insufficent Information to make quotation.";
      setFormError(apiMessage);
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}quotation_generation/`,
        payload,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${quotationName || "quotation"}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("Status:", err.response?.status);
      console.log("Headers:", err.response?.headers);
      console.log("Data:", err.response?.data);

      if (err.response?.data instanceof Blob) {
        err.response.data.text().then((text) => {
          console.log("Blob text:", text);
        });
      }
    }
  };

  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => {
        setFormError("");
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [formError]);

  return (
    <>
      <div className="w-full h-[87vh] flex flex-col">
        <div className="pb-2">
          <div className="flex items-center gap-3 pl-8 pt-8 pr-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2  rounded-full hover:bg-gray-100 transition mt-1"
            >
              <MoveLeft size={25} className="text-[#0e9dc7]" />
            </button>

            <h1 className="text-2xl font-medium text-[#0e9dc7]">
              QUOTE GENERATION
            </h1>
          </div>
        </div>
        <div className="relative overflow-hidden sm:rounded-xl h-full w-full px-3">
          <div className="w-full py-2 flex flex-row p-6">
            <div className="w-full flex flex-row gap-4">
              <button
                onClick={() => setTab("part_details")}
                className={`${tab === "part_details" ? "underline underline-offset-[3px] decoration-[#0e9dc7] decoration-2" : ""}`}
              >
                <p className={`text-md px-1.5 pt-1`}>PART DETAILS</p>
              </button>
              <button
                onClick={() => setTab("client")}
                className={`${tab === "client" ? "underline underline-offset-[3px] decoration-[#0e9dc7] decoration-2" : ""}`}
              >
                <p className={`text-md px-1.5 pt-1`}>OTHER DETAILS</p>
              </button>
            </div>

            {tab === "part_details" && (
              <div>
                <label
                  className="m-3 relative group cursor-pointer hidden md:block"
                  onClick={() => {
                    setTab("client");
                  }}
                >
                  <div className="relative bg-[#3da5c5] w-44 h-10 rounded-lg overflow-hidden flex items-center">
                    <p className="ml-4 text-white z-10  group-hover:opacity-0">
                      ORDER DETAILS
                    </p>

                    <div className="absolute top-1/2 right-1 -translate-y-1/2 w-10 h-[80%] bg-white rounded-md flex items-center justify-center transition-all duration-100 group-hover:w-[95.5%]">
                      <Info
                        color="#0e9dc7"
                        style={{ width: 20, height: 20 }}
                        className="transition-all"
                      />
                    </div>
                  </div>
                </label>
              </div>
            )}
            {tab === "client" && (
              <div>
                <label
                  className="m-3 relative group cursor-pointer hidden md:block"
                  onClick={() => handleGenerateQuote()}
                >
                  <div className="relative bg-[#3da5c5] w-36 h-10 rounded-lg overflow-hidden flex items-center">
                    <p className="ml-4 text-white z-10  group-hover:opacity-0">
                      GENERATE
                    </p>

                    <div className="absolute top-1/2 right-1 -translate-y-1/2 w-10 h-[80%] bg-white rounded-md flex items-center justify-center transition-all duration-100 group-hover:w-[94.5%]">
                      <SquarePen
                        color="#0e9dc7"
                        style={{ width: 20, height: 20 }}
                        className="transition-all"
                      />
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {tab === "part_details" && (
            <div className=" overflow-auto max-h-[57vh] border border-gray-400 rounded mx-6 my-2">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 uppercase text-xs sticky top-0 z-10">
                  <tr>
                    {table_fields.map((field) => (
                      <th
                        key={field}
                        className="px-1 py-3 border text-center"
                        style={{ width: coloumnWidth[field] }}
                      >
                        <span>{tableLabels[field]}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...quoteItems]
                    .sort((a, b) => a.part_no.localeCompare(b.part_no))
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {table_fields.map((field) => (
                          <td
                            key={field}
                            className={`py-3 border text-center ${
                              field === "part_no"
                                ? "whitespace-normal break-words"
                                : ""
                            }`}
                            style={{ width: coloumnWidth[field] }}
                          >
                            {field === "part_no" ? (
                              <span>{item.part_no}</span>
                            ) : field === "total_price" ? (
                              <span>{item.total_price}</span>
                            ) : (
                              <input
                                type="text"
                                value={
                                  item[field] === 0 ? "" : (item[field] ?? "")
                                }
                                onChange={(e) =>
                                  handleCellChange(
                                    idx,
                                    field,
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                  )
                                }
                                className="w-full text-center border-none outline-none focus:outline-none"
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "client" && (
            <div className="w-full max-h-[65vh] overflow-y-auto p-4 sm:p-6 md:p-8">
              <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center items-center">
                  <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[90px]">
                    GST % :
                  </label>
                  <div
                    className={`flex w-25 rounded-md border border-[#0e9dc7] items-center justify-center hover:cursor-pointer ${quoteGST === 5 ? "bg-[#0e9dc7] text-white" : ""}`}
                    onClick={() => setQuoteGST(5)}
                  >
                    <p>5 %</p>
                  </div>
                  <div
                    className={`flex w-25 rounded-md border border-[#0e9dc7] items-center justify-center hover:cursor-pointer ${quoteGST === 9 ? "bg-[#0e9dc7] text-white" : ""}`}
                    onClick={() => setQuoteGST(9)}
                  >
                    <p>9 %</p>
                  </div>
                  <div
                    className={`flex w-25 rounded-md border border-[#0e9dc7] items-center justify-center hover:cursor-pointer ${quoteGST === 18 ? "bg-[#0e9dc7] text-white" : ""}`}
                    onClick={() => setQuoteGST(18)}
                  >
                    <p>18 %</p>
                  </div>
                  <div
                    className={`flex w-25 rounded-md border border-[#0e9dc7] items-center justify-center hover:cursor-pointer ${quoteGST === 28 ? "bg-[#0e9dc7] text-white" : ""}`}
                    onClick={() => setQuoteGST(28)}
                  >
                    <p>28 %</p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[90px]">
                    VALIDITY :
                  </label>

                  <input
                    type="text"
                    placeholder="Days"
                    value={quoteValidity || ""}
                    onChange={(e) => setQuoteValidity(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-slate-700 outline-none shadow-sm focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7]"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
                <div className="flex flex-col">
                  <p className="mb-3 text-lg text-[#0e9dc7]">BILLING DETAILS</p>
                  <div className="px-2">
                    <div className="max-h-[40vh] overflow-y-auto rounded-md p-4 md:p-6 bg-slate-50 grid grid-cols-2 gap-4 sm:grid-cols-2">
                      {data?.length > 0 ? (
                        data.map((item, idx) => (
                          <div
                            key={item.id ?? idx}
                            onClick={() =>
                              setSelectedClient((prev) => ({
                                ...prev,
                                client_id: item.id,
                              }))
                            }
                            className="mb-2 cursor-pointer"
                          >
                            <div
                              className={`rounded-xl bg-white px-2 py-2 ring transition-all hover:shadow-md hover:ring-[#0e9dc7] ${
                                item.id === selectedClient?.client_id
                                  ? "ring-[#0e9dc7]"
                                  : "ring-white"
                              }`}
                            >
                              <div>
                                <p className="font-medium text-[#0e9dc7] text-md">
                                  Known as
                                </p>
                                <p className="text-[#444] text-lg">
                                  {item.refName || "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyState
                          title="No address available"
                          subtitle="Please add address under the client"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="mb-3 text-lg text-[#0e9dc7]">SHIPPING</p>
                   <div className="max-h-[40vh] overflow-y-auto rounded-md p-4 md:p-6 bg-slate-50 grid grid-cols-2 gap-4 sm:grid-cols-2">
                    {consigneeData?.length > 0 ? (
                      consigneeData.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            setSelectedClient((prev) => ({
                              ...prev,
                              consignee_id: item.id,
                            }))
                          }
                          className="mb-2 cursor-pointer"
                        >
                          <div
                            className={`rounded-xl bg-white px-2 py-2 ring transition-all hover:shadow-md hover:ring-[#0e9dc7] ${
                              item.id === selectedClient?.consignee_id
                                ? "ring-[#0e9dc7] "
                                : "ring-white"
                            }`}
                          >
                          
                                <div>
                                  <p className="font-medium text-lg text-[#0e9dc7]">
                                    Known as
                                  </p>
                                  <p className="text-[#444] text-md">
                                    {item.refName || "-"}
                                  </p>
                                
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No address available"
                        subtitle="Please add address under the client"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {formError && (
        <div className="fixed top-4 right-4 z-50 w-fit rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-md text-rose-600 shadow-lg animate-slide-in">
          {formError}
        </div>
      )}
    </>
  );
};

const EmptyState = ({ title, subtitle }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
    <p className="text-lg font-semibold text-slate-700">{title}</p>
    <p className="text-sm">{subtitle}</p>
  </div>
);

export default QuoteGenerationWindow;
