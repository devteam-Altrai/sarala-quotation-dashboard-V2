import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/AppConstant";
import { SlArrowDown } from "react-icons/sl";
import axios from "axios";
import { STATE_CODE } from "../utils/StateCode";

// const clientItems = {
//   VVDN: "vvdn",
//   SANMINA: "sanmina",
//   ASM: "asm",
//   ANORA: "anora",
// };

const AddCustomerAddressPopUp = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    customer_code: "",
    ref_name: "",
    addressLine1: "",
    addressLine2: "",
    gstin: "",
    email: "",
    address_state: "",
    address_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientDropdown, setClientDropDown] = useState(false);
  const [clientStateDropDown, setClientStateDropDown] = useState(false);
  const [stateCode, setStateCode] = useState();
  const [client, setClient] = useState({ key: "", value: "" });
  const [existingClients, setExistingClients] = useState({
    key: "",
    value: "",
  });
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const resp = await axios.get(`${BASE_URL}get_customer/`);

        if (resp.data.status === "success") {
          const clientItems = resp.data.data.reduce((acc, client) => {
            acc[client.customerName] = client.customerCode;
            return acc;
          }, {});

          setExistingClients(clientItems);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchClients();
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleClose = () => {
    setFormData({
      customer_code: "",
      ref_name: "",
      addressLine1: "",
      addressLine2: "",
      gstin: "",
      email: "",
      address_state: "",
      address_code: "",
    });
    setClient({ key: "", value: "" });
    setError("");
    onClose();
  };

  const handleAddAddress = async (event) => {
    event.preventDefault();
    setError("");

    const addressCode = STATE_CODE[formData.address_state]?.digit_code || "00";

    const payload = {
      customer_code: client.value,
      ref_name: client.value,
      address: [formData.addressLine1.trim(), formData.addressLine2.trim()],
      gstin: formData.gstin.trim(),
      email: formData.email.trim(),
      address_state: formData.address_state.trim(),
      address_code: addressCode,
    };

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}add_address/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("RES:", response);

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Unable to add customer address.");
      }

      setFormData({
        customer_code: "",
        ref_name: "",
        addressLine1: "",
        addressLine2: "",
        gstin: "",
        email: "",
        address_state: "",
        address_code: "",
      });
      const apiMessage = "✅ EDIT SUCCESSFULL";
      setFormSuccess(apiMessage);
      handleClose();
    } catch (err) {
      const apiMessage = "❌ ERROR IN EDITING";
      setFormError(apiMessage);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    client.value.trim() !== "" &&
    formData.addressLine1.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.address_state.trim() !== "" &&
    !!STATE_CODE[formData.address_state]?.digit_code;

  if (!open) return null;

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
              Add Address
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
                Customer Name:
              </label>
              <div className="relative w-[170px] md:w-[320px] ">
                <button
                  type="button"
                  onClick={() => setClientDropDown((prev) => !prev)}
                  className="flex items-center justify-between w-full px-3 py-2 border border-[#0e9dc7] rounded-md bg-white"
                >
                  <span className="text-md text-[#444]">
                    {client.key || "Select Client"}
                  </span>

                  <SlArrowDown
                    className={`text-lg text-[#0e9dc7] transition-transform ${
                      clientDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {clientDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#0e9dc7] rounded-md shadow-lg z-50">
                    {Object.entries(existingClients).map(([label, value]) => (
                      <div
                        key={value}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                        onClick={() => {
                          setClient({ key: label, value: value });
                          setClientDropDown(false);
                        }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-md font-medium text-[#0e9dc7] sm:min-w-[135px]">
                Ref Name:
              </label>
              <input
                required
                name="ref_name"
                value={formData.ref_name}
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
                State:
              </label>
              {/* <input
                required
                name="address_state"
                value={formData.address_state}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "address_state",
                      value: e.target.value.toUpperCase(),
                    },
                  })
                }
                placeholder="e.g. GOA"
                className={inputClass}
              /> */}
              <div className="relative w-[170px] md:w-[320px] ">
                <button
                  type="button"
                  onClick={() => setClientStateDropDown((prev) => !prev)}
                  className="flex items-center justify-between w-full px-3 py-2 border border-[#0e9dc7] rounded-md bg-white"
                >
                  <span className="text-md text-[#444]">
                    {formData.address_state || "Select State"}
                  </span>

                  <SlArrowDown
                    className={`text-lg text-[#0e9dc7] transition-transform ${
                      clientStateDropDown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {clientStateDropDown && (
                  <div className="absolute left-0 top-full mt-1 h-40 w-full overflow-y-auto bg-white border border-[#0e9dc7] rounded-md shadow-lg z-50">
                    {Object.entries(STATE_CODE).map(([label, value]) => (
                      <div
                        key={value}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            address_state: label,
                          }));
                          setClientStateDropDown(!clientStateDropDown)
                        }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                State Code:
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
                  : STATE_CODE[formData.address_state]?.digit_code ||
                    "Please Enter a Valid State"}
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="rounded-lg bg-[#0e9dc7] px-8 py-2.5 font-medium text-white shadow-sm transition hover:bg-[#3da5c5] disabled:cursor-not-allowed "
              >
                {loading ? "Saving..." : "ADD ADDRESS"}
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

export default AddCustomerAddressPopUp;
