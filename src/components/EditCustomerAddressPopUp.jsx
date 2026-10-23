import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/AppConstant";
import { STATE_CODE } from "../utils/StateCode";
const initialFormData = {
  refName:"",
  addressLine1: "",
  addressLine2: "",
  gstin: "",
  email: "",
  address_state: "",
  address_code: "",
};

const EditCustomerAddressPopUp = ({ open, onClose, data }) => {
  const [loading, setLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (!data) return;
    setFormData({
      refName: data.refName,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      gstin: data.gstin,
      email: data.email,
      address_state: data.address_state,
      address_code: data.address_code,
    });
  }, [data]);

  // useEffect(()=>{
  //   console.log("Dta:", data);
  // },[data])

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

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleClose = () => {
    setFormData(initialFormData);
    // console.log("post:", formData)
    onClose();
  };

  const handleAddAddress = async (event) => {
    event.preventDefault();

    const state = formData.address_state.trim().toUpperCase();

    const addressCode = STATE_CODE[state]?.digit_code || "00";
    
    const payload = {
      refName: formData.refName.trim(),
      address: [formData.addressLine1.trim(), formData.addressLine2.trim()],
      gstin: formData.gstin.trim(),
      email: formData.email.trim(),
      address_state: formData.address_state.trim(),
      address_code: addressCode,
    };

    // console.log("KK:", payload)

    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}update_customer_address/${data.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Unable to add customer address.");
      }

      const apiMessage = "✅ EDIT SUCCESSFULL";
      setFormSuccess(apiMessage);
      setFormData(initialFormData);
      console.log();
      handleClose();
    } catch (err) {
      const apiMessage = "❌ ERROR IN EDITING";
      setFormError(apiMessage);
      // console.log("post:", formData)
    } finally {
      setLoading(false);
    }
  };
  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 outline-none shadow-sm focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7]";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[1px]">
        <div
          className="w-full max-w-lg rounded-xl bg-white p-6 shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              Edit Address
            </h2>

            <button
              type="button"
              onClick={handleClose}
              className="text-xl text-gray-500 transition hover:text-black"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[135px]">
                Ref Name:
              </label>
              <input
                required
                name="refName"
                value={formData.refName}
                onChange={handleChange}
                placeholder="Type"
                className={inputClass}
              />
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[135px]">
                Address Line 1:
              </label>
              <input
                required
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="House / building / street"
                className={inputClass}
              />
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[135px]">
                Address Line 2:
              </label>
              <input
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Area, locality, landmark"
                className={inputClass}
              />
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[135px]">
                GSTIN:
              </label>
              <input
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="Enter GSTIN"
                className={inputClass}
              />
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[135px]">
                Email:
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={inputClass}
              />
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[135px]">
                State:
              </label>
              <input
                required
                name="address_state"
                value={formData.address_state}
                onChange={(e) =>  handleChange({
                    target: {
                      name: "address_state",
                      value: e.target.value.toUpperCase(),
                    },
                  })}
                placeholder="e.g. TN"
                className={inputClass}
              />
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[135px]">
                Address Code:
              </label>
              {/* <input
                required
                name="address_code"
                value={formData.address_code}
                onChange={handleChange}
                placeholder="e.g. 33"
                className={inputClass}
              /> */}
              <p className="text-slate-700 ml-4">
                {!formData.address_state
                  ? "Please Enter State"
                  : STATE_CODE[formData.address_state]?.digit_code || "00"}
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#3da5c5] px-8 py-2.5 font-medium text-white shadow-sm transition hover:bg-[#0e9dc7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : "EDIT ADDRESS"}
              </button>
            </div>
          </form>
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

export default EditCustomerAddressPopUp;
