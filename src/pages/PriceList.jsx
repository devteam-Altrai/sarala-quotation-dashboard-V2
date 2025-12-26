import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../utils/AppConstant";
import Loading from "../components/Loading";
import Error from "../components/Error";

const PriceList = () => {
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProjects, setExpandedProjects] = useState(() => new Set());

  // ------------------------------
  // Fetch Price List + PO List
  // ------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [priceRes, poRes] = await Promise.all([
          axios.get(`${BASE_URL}pricelist/`),
          axios.get(`${BASE_URL}fetch_po/`),
        ]);

        const priceList = priceRes.data?.data || [];
        const poList = poRes.data?.data || [];

        // Create PO lookup map
        const poMap = poList.reduce((acc, item) => {
          acc[item.projectName?.toLowerCase()] = item.po_number || "N/A";
          return acc;
        }, {});

        // Group price list and attach PO number
        const grouped = priceList.reduce((acc, item) => {
          const project = item.project_name || "Unknown Project";
          const key = project.toLowerCase();

          if (!acc[project]) {
            acc[project] = {
              po_number: poMap[key] || "N/A",
              items: [],
            };
          }

          acc[project].items.push(item);
          return acc;
        }, {});

        setGroupedData(grouped);
      } catch (err) {
        setError(
          "We could not load the price list right now. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ------------------------------
  // Sorted project entries
  // ------------------------------
  const projectEntries = useMemo(
    () =>
      Object.entries(groupedData).sort(([a], [b]) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      ),
    [groupedData]
  );

  // ------------------------------
  // Cleanup expanded projects when filters change
  // ------------------------------
  useEffect(() => {
    setExpandedProjects((prev) => {
      if (prev.size === 0) return prev;

      const valid = new Set(projectEntries.map(([name]) => name));
      let changed = false;
      const next = new Set();

      prev.forEach((name) => {
        if (valid.has(name)) next.add(name);
        else changed = true;
      });

      return changed ? next : prev;
    });
  }, [projectEntries]);

  // ------------------------------
  // Filter search results
  // ------------------------------
  const filteredEntries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return projectEntries;

    return projectEntries
      .map(([project, data]) => {
        const items = data.items;

        const projectMatch = project.toLowerCase().includes(q);
        const matchedItems = items.filter((item) =>
          (item.part_no || "").toLowerCase().includes(q)
        );

        if (projectMatch) return [project, data];
        if (matchedItems.length > 0)
          return [project, { ...data, items: matchedItems }];

        return null;
      })
      .filter(Boolean);
  }, [projectEntries, searchTerm]);

  const totalVisibleProjects = filteredEntries.length;
  const totalVisibleParts = filteredEntries.reduce(
    (acc, [, data]) => acc + data.items.length,
    0
  );

  const autoExpand = searchTerm.trim().length > 0;

  // ------------------------------
  // Toggle accordion
  // ------------------------------
  const toggleProject = (name) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="flex h-full w-full flex-col bg-white p-4 md:p-8">
      {/* HEADER */}
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[#0e9dc7]">
            PRICE CATALOGUE
          </h1>
          <p className="text-sm text-[#444]">
            Specific pricing details for a Specific Part No.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* Search */}
          <div className="relative w-full max-w-xs">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="m21 21-4.35-4.35M6 11a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" />
              </svg>
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7]"
            />
          </div>

          {/* Counters */}
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
            <span className="rounded-full bg-black/5 px-3 py-1 text-[#0e9dc7]">
              {totalVisibleProjects} Project{totalVisibleProjects !== 1 && "s"}
            </span>
            <span className="rounded-full bg-black/5 px-3 py-1 text-[#0e9dc7]">
              {totalVisibleParts} Part{totalVisibleParts !== 1 && "s"}
            </span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <section className=" overflow-y-auto flex-1 space-y-4 pr-1">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <Error />
          </div>
        ) : projectEntries.length === 0 ? (
          <EmptyState
            title="No price data available"
            subtitle="Once projects have price details, they will appear here instantly."
          />
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            title="No matches found"
            subtitle="Try a different project name or part number search."
          />
        ) : (
          filteredEntries.map(([projectName, data]) => {
            const { po_number, items } = data;
            const isExpanded = autoExpand || expandedProjects.has(projectName);

            return (
              <article
                key={projectName}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200"
              >
                {/* Project Header */}
                <button
                  onClick={() => toggleProject(projectName)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-[#0e9dc7]">
                      {projectName}
                    </h2>
                    <p className="text-md text-slate-600">
                      PO Number:{" "}
                      <span className="font-semibold text-[#0e9dc7]">
                        {po_number}
                      </span>
                    </p>
                    <span className="text-sm text-slate-500">
                      {items.length} part{items.length !== 1 && "s"} listed
                    </span>
                  </div>

                  <svg
                    className={`h-8 w-8 text-slate-400 transition-transform ${
                      isExpanded && "rotate-180"
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

                {/* List of Parts */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 p-6">
                    <div className="grid max-h-96 grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((item, idx) => (
                        <div
                          key={`${item.part_no}-${idx}`}
                          className="rounded-xl border border-slate-200 bg-white p-4 hover:-translate-y-1 hover:shadow-md transition"
                        >
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Part Number
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#0e9dc7]">
                            {item.part_no || "Not specified"}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-md font-medium text-slate-500">
                              Unit
                            </span>
                            <span className="text-md font-semibold text-[#0e9dc7]">
                              {item.unit || "N/A"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
};

// ------------------------------
// Reusable empty state component
// ------------------------------
const EmptyState = ({ title, subtitle }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
    <p className="text-lg font-semibold text-slate-700">{title}</p>
    <p className="text-sm">{subtitle}</p>
  </div>
);

export default PriceList;
