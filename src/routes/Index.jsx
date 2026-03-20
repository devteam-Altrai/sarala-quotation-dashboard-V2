import { Route } from "react-router-dom";
import LanderPage from "../pages/LanderPage";
import Dashboard from "../pages/Dashboard";
import PriceList from "../pages/PriceList";
import Settings from "../pages/Settings";
import ShowCase from "../pages/ShowCase";
import ReviewTable from "../pages/ReviewTable";
import Viewer from "../pages/Viewer";
import File from "../pages/File";
import OrderTracking from "../pages/OrderTracking";
import JobTracking from "../pages/JobTracking";

import { element } from "prop-types";
import BomTable from "../components/BomTable";
const landerpageRoutes = {
  path: "/",
  name: "root",
  element: <LanderPage />,
  route: Route,
};

const dashboardRoutes = {
  path: "/dashboard",
  name: "Dashboard",
  element: <Dashboard />,
  route: Route,
};
const filesRoutes = {
  path: "/files",
  name: "Repository",
  element: <File />,
  route: Route,
};
const viewerRoutes = {
  path: "/viewer",
  name: "Viewer",
  element: <Viewer />,
  route: Route,
  displaySidebar: false,
};
const pricelistRoutes = {
  path: "/pricelist",
  name: "PriceList",
  element: <PriceList />,
  route: Route,
};
// const showcaseRoutes = {
//   path: "/fileviewer",
//   name: "File viewer",
//   element: <ShowCase />,
//   route: Route,
//   displaySidebar: true,
// };
// const settings = {
//   path: "/settings",
//   name: "Settings",
//   element: <Settings />,
//   route: Route,
// };
const reviewFiles = {
  path: "/review",
  name: "Review",
  element: <ReviewTable />,
  route: Route,
  displaySidebar: false,
};
const orderTracking = {
  path: "/order",
  name: "Order",
  element: <OrderTracking />,
  route: Route,
  displaySidebar: false,
};
const jobTracker = {
  path: "/job",
  name: "Job",
  element: <JobTracking />,
  route: Route,
  children: [
    {
      path: "/job/bom",
      name: "BOM",
      element: <BomTable />,
      route: Route,
      displaySidebar: false,
    },
  ],
};

const listedRoutes = (routes) => {
  let routeList = [];
  routes = routes || [];

  routes.forEach((item) => {
    routeList.push(item);
    if (item.children) {
      routeList = [...routeList, ...listedRoutes(item.children)];
    }
  });
  return routeList;
};

const authProtectedRoutes = listedRoutes([
  dashboardRoutes,
  filesRoutes,
  viewerRoutes,
  pricelistRoutes,
  // showcaseRoutes,
  // settings,
  reviewFiles,
  orderTracking,
  jobTracker,
]);

const publicRoutes = listedRoutes([landerpageRoutes]);

export {
  authProtectedRoutes,
  publicRoutes,
  landerpageRoutes,
  dashboardRoutes,
  filesRoutes,
  viewerRoutes,
  pricelistRoutes,
  // showcaseRoutes,
  // settings,
  reviewFiles,
  orderTracking,
  jobTracker,
};
