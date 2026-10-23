import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/AppConstant";
import Loading from "../components/Loading";
import { MapPinPlus, SquarePen } from "lucide-react";
import AddCustomerPopUp from "../components/AddCustomerPopUp";
import AddCustomerAddressPopUp from "../components/AddCustomerAddressPopUp";
import { MdOutlineDelete } from "react-icons/md";
import EditCustomerAddressPopUp from "../components/EditCustomerAddressPopUp";

const Clients = () => {
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedClient, setExpandedClient] = useState(() => new Set());
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddAddressopen, setIsAddAddressopen] = useState(false);
  const [isEditAddress, setIsEditAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const groupCustomers = (customers, addresses) => {
    const result = {};

    customers.forEach((customer) => {
      const customerName = customer.customerName;
      const customerCode = customer.customer_id;
      let customerAddresses
      if(addresses) {
        customerAddresses = addresses.filter(
        (address) => address.customerCode === customer.customerCode,
      );
      }

      result[`${customerName} | ${customerCode}`] = customerAddresses;
    });

    return result;
  };

  const toggleClient = (name) => {
    setExpandedClient((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const fetchClients = async () => {
    // setLoading(true);
    try {
      const [customerRes, addressRes] = await Promise.all([
        axios.get(`${BASE_URL}get_customer/`),
        axios.get(`${BASE_URL}get_customer_address/`),
      ]);

      if (
        customerRes.data.status === "success" &&
        addressRes.data.status === "success"
      ) {
        const sortedClients = groupCustomers(
          customerRes.data.data,
          addressRes.data.data,
        );
        // console.log("resp1", customerRes.data.data);
        // console.log("Resp2", addressRes.data.data);
        console.log("Sorted:", sortedClients);
        setClients(sortedClients);
      }
      // setLoading(false);
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    setLoading(true);
    const initialFetchClients = async () => {
      try {
        const [customerRes, addressRes] = await Promise.all([
          axios.get(`${BASE_URL}get_customer/`),
          axios.get(`${BASE_URL}get_customer_address/`),
        ]);

        if (
          customerRes.data.status === "success" &&
          addressRes.data.status === "success"
        ) {
          const sortedClients = groupCustomers(
            customerRes.data.data,
            addressRes.data.data,
          );
          setLoading(false);
          setClients(sortedClients);
        }
      } catch (err) {
        console.log("ERROR:", err);
      }
    };

    initialFetchClients();
  }, [isAddCustomerOpen || isAddAddressopen || isEditAddress]);

  const handleAddressDelete = async (id) => {
    // setLoading(true)
    try {
      const res = await axios.post(`${BASE_URL}delete_address/${id}/`);
      // setLoading(false)
    } catch (err) {
      console.log(err);
    }
    fetchClients();
  };

  return (
    <>
      <div className="flex h-[87vh] w-full flex-col">
        <div className="flex flex-row w-full justify-between items-center">
          <div className="pb-2">
            <h1 className="px-8 pt-8 text-2xl font-medium text-[#0e9dc7]">
              CLIENTS DASHBOARD
            </h1>
            <p className="ml-8 mt-1 text-sm text-[#444]">
              All client details are here.
            </p>
          </div>
          <div className="flex flex-row pr-8 gap-4 ">
            {Object.keys(clients).length > 0 && (
              <button
                type="button"
                className="rounded-md bg-[#0e9dc7] px-4 py-2 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddAddressopen(true);
                }}
              >
                ADD ADDRESS
              </button>
            )}

            <button
              type="button"
              className="rounded-md bg-[#0e9dc7] px-4 py-2 text-white"
              onClick={() => setIsAddCustomerOpen(true)}
            >
              ADD CUSTOMER
            </button>
          </div>

          <AddCustomerPopUp
            open={isAddCustomerOpen}
            onClose={() => setIsAddCustomerOpen(false)}
          />
          <AddCustomerAddressPopUp
            open={isAddAddressopen}
            onClose={() => setIsAddAddressopen(false)}
          />
        </div>
        <section className="overflow-y-auto flex-1 space-y-4 p-8">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loading />
            </div>
          ) : Object.keys(clients).length === 0 ? (
            <EmptyState
              title="No clients available"
              subtitle="Once clients have been added, they will appear here."
            />
          ) : (
            Object.entries(clients).map(([label, data]) => {
              const isExpanded = expandedClient.has(label);

              return (
                <article
                  key={label}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200"
                >
                  <button
                    onClick={() => toggleClient(label)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                  >
                    <div className="flex flex-row justify-between items-center w-full">
                      <h2 className="text-xl font-semibold text-[#0e9dc7]">
                        {label}
                      </h2>
                    </div>

                    <svg
                      className={`h-8 w-8 text-slate-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="m6 9 6 6 6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50 p-3  sm:p-6 h-[45vh] overflow-y-auto">
                      {data.length === 0 ? (
                        <EmptyState
                          title="No address available"
                          subtitle="Once addresses have been added, they will appear here."
                        />
                      ) : (
                        <div className=" space-y-4 pr-2">
                          {data.map((address, index) => (
                            <div
                              key={address.id ?? index}
                              className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
                            >
                              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                                <div>
                                  <p className="text-sm font-medium text-[#0e9dc7]">
                                    Address Line 1
                                  </p>
                                  <p className="text-md text-slate-700">
                                    {address.address?.[0] || "-"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-[#0e9dc7]">
                                    Address Line 2
                                  </p>
                                  <p className="text-md text-slate-700">
                                    {address.address?.[1] || "-"}
                                  </p>
                                </div>
                                 <div>
                                  <p className="text-sm font-medium text-[#0e9dc7]">
                                    Ref Name
                                  </p>
                                  <p className="text-md text-slate-700">
                                    {address.refName || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#0e9dc7]">
                                    GSTIN
                                  </p>
                                  <p className="text-md text-slate-700">
                                    {address.gstin || "-"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-[#0e9dc7]">
                                    Email
                                  </p>
                                  <p className="break-all text-sm text-slate-700">
                                    {address.email || "-"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-[#0e9dc7]">
                                    State
                                  </p>
                                  <p className="text-md text-slate-700">
                                    {address.address_state || "-"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-[#0e9dc7]">
                                    Address Code
                                  </p>
                                  <p className="text-md text-slate-700">
                                    {address.address_code || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#0e9dc7]">
                                    Created At
                                  </p>
                                  <p className="text-md text-slate-700">
                                    {new Date(
                                      address.created_at,
                                    ).toLocaleDateString() || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#0e9dc7]">
                                    Last Update
                                  </p>
                                  <p className="text-md text-slate-700">
                                    {new Date(
                                      address.updated_at,
                                    ).toLocaleDateString() || "-"}
                                  </p>
                                </div>
                                <div className="flex flex-row gap-3 items-center mt-2">
                                  <SquarePen
                                    className="text-[#0e9dc7] size-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAddress({
                                        id: address.id,
                                        name: address.label,
                                        refName: address.refName,
                                        addressLine1:
                                          address.address?.[0] ?? "",
                                        addressLine2:
                                          address.address?.[1] ?? "",
                                        gstin: address.gstin ?? "",
                                        email: address.email ?? "",
                                        address_state:
                                          address.address_state ?? "",
                                        address_code:
                                          address.address_code ?? "",
                                      });
                                      setIsEditAddress(true);
                                    }}
                                  />
                                  <MdOutlineDelete
                                    className="text-red-500 size-7"
                                    onClick={() =>
                                      handleAddressDelete(address.id)
                                    }
                                  />
                                  <EditCustomerAddressPopUp
                                    open={isEditAddress}
                                    data={selectedAddress}
                                    onClose={() => {
                                      setIsEditAddress(false);
                                      setSelectedAddress(null);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </>
  );
};

const EmptyState = ({ title, subtitle }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
    <p className="text-lg font-semibold text-slate-700">{title}</p>
    <p className="text-sm">{subtitle}</p>
  </div>
);
export default Clients;
