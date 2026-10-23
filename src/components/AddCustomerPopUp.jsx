import axios from "axios";
import { CloudUpload } from "lucide-react";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/AppConstant";

const AddCustomerPopUp = ({ open, onClose }) => {
  if (!open) return null;
  const [name, setName] = useState("");
  const [known_as, setKnow_as] = useState("")
  const [desc, setDesc] = useState("");

  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const handleAddCustomer = async () => {
    const payload = { "customer_name": name, "customer_code":name.toLocaleLowerCase().replace(/\s+/g, "_")};
    try {
      const response = await axios.post(`${BASE_URL}create_customer/`, payload);
      const apiMessage = "✅ EDIT SUCCESSFULL";
      setFormSuccess(apiMessage);
      setTimeout(() => {
        onClose();
        setFormSuccess("");
        setName("");
        setDesc("");
      }, 500);
    } catch (err) {
      const apiMessage = "❌ ERROR IN EDITING";
      setFormError(apiMessage);
      console.log("error", err);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px]">
        <div
          className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Add Customer</h2>

            <button
              type="button"
              onClick={onClose}
              className="text-xl text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[90px]">
                Name :
              </label>

              <input
                type="text"
                placeholder="Enter Name"
                value={name ||""}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-slate-700 outline-none shadow-sm focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7]"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <div>
              <label
                className="m-3 relative group cursor-pointer hidden md:block"
                onClick={() => handleAddCustomer()}
              >
                <div className="relative bg-[#3da5c5] w-48 h-10 rounded-lg overflow-hidden flex items-center">
                  <p className="ml-4 text-white z-10  group-hover:opacity-0">
                    NEW CUSTOMER
                  </p>

                  <div className="absolute top-1/2 right-1 -translate-y-1/2 w-10 h-[80%] bg-white rounded-md flex items-center justify-center transition-all duration-100 group-hover:w-[96%]">
                    <CloudUpload
                      color="#0e9dc7"
                      style={{ width: 20, height: 20 }}
                      className="transition-all"
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
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
    </>
  );
};

export default AddCustomerPopUp;
