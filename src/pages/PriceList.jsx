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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${BASE_URL}pricelist/`);
        const data = res.data?.data || [];

        const grouped = data.reduce((acc, item) => {
          const project = item.project_name || "Unknown Project";
          if (!acc[project]) acc[project] = [];
          acc[project].push(item);
          return acc;
        }, {});

        setGroupedData(grouped);
      } catch (err) {
        console.error("Download failed", err);
        setError(
          "We could not load the price list right now. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const projectEntries = useMemo(
    () =>
      Object.entries(groupedData).sort(([a], [b]) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      ),
    [groupedData]
  );

  useEffect(() => {
    setExpandedProjects((prev) => {
      if (prev.size === 0) {
        return prev;
      }

      const validProjects = new Set(
        projectEntries.map(([projectName]) => projectName)
      );
      let changed = false;
      const next = new Set();

      prev.forEach((project) => {
        if (validProjects.has(project)) {
          next.add(project);
        } else {
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [projectEntries]);

  const filteredEntries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return projectEntries;
    }

    return projectEntries
      .map(([projectName, items]) => {
        const projectMatch = projectName.toLowerCase().includes(query);
        const matchingItems = items.filter((item) =>
          (item.part_no || "").toLowerCase().includes(query)
        );

        if (projectMatch) {
          return [projectName, items];
        }

        if (matchingItems.length > 0) {
          return [projectName, matchingItems];
        }

        return null;
      })
      .filter(Boolean);
  }, [projectEntries, searchTerm]);

  const totalVisibleProjects = filteredEntries.length;
  const totalVisibleParts = filteredEntries.reduce(
    (acc, [, items]) => acc + items.length,
    0
  );
  const shouldForceExpand = searchTerm.trim().length > 0;

  const toggleProject = (projectName) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectName)) {
        next.delete(projectName);
      } else {
        next.add(projectName);
      }
      return next;
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="flex h-full w-full flex-col bg-white p-4 md:p-8">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[#0e9dc7]">
            Part Price Catalogue
          </h1>
          <p className="text-sm text-[#444]">
            Specific pricing details for a Specific Part No.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative w-full max-w-xs">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="m21 21-4.35-4.35M6 11a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7]"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span className="rounded-full bg-black/2 px-3 py-1 text-[#0e9dc7]">
              {totalVisibleProjects} Project
              {totalVisibleProjects !== 1 ? "s" : ""}
            </span>
            <span className="rounded-full bg-black/2 px-3 py-1 text-[#0e9dc7]">
              {totalVisibleParts} Part
              {totalVisibleParts !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      <section className="flex-1 space-y-4 pr-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            <Loading />
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
            <Error />
          </div>
        ) : projectEntries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            <p className="text-lg font-semibold text-slate-700">
              No price data available
            </p>
            <p className="text-sm">
              Once projects have price details, they will appear here instantly.
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            <p className="text-lg font-semibold text-slate-700">
              No matches found
            </p>
            <p className="text-sm">
              Try a different project name or part number search.
            </p>
          </div>
        ) : (
          filteredEntries.map(([projectName, items]) => {
            const isExpanded =
              shouldForceExpand || expandedProjects.has(projectName);

            return (
              <article
                key={projectName}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200"
              >
                <button
                  type="button"
                  onClick={() => toggleProject(projectName)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-[#0e9dc7]">
                      {projectName}
                    </h2>
                    <span className="text-sm text-slate-500">
                      {items.length} part{items.length !== 1 ? "s" : ""} listed
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-slate-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="h-10 w-10"
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
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 p-6">
                    {/* Scroll only the grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto pr-2">
                      {items.map((item, idx) => (
                        <div
                          key={`${item.part_no || "part"}-${idx}`}
                          className="rounded-xl border border-slate-200 bg-white p-4 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md"
                        >
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Part Number
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#0e9dc7]">
                            {item.part_no || "Not specified"}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-md font-medium uppercase text-slate-500">
                              Unit
                            </span>
                            <span className="rounded-full px-1 py-1 text-md font-semibold text-[#0e9dc7]">
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

export default PriceList;
