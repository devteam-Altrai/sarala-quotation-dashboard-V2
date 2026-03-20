import price from "../assets/currency.png";
import dashboard from "../assets/dashboard-panel.png";
import repo from "../assets/folder-archive.png";
import view from "../assets/model-cube-arrows.png";

const role1 = import.meta.env.VITE_ROLE1;
const role2 = import.meta.env.VITE_ROLE2;
const role3 = import.meta.env.VITE_ROLE3;

const Menu_Items = [
  {
    key: "Dashboard",
    label: "DASHBOARD",
    url: "/dashboard",
    icon: dashboard,
    allowedRoles: [role1, role2],
  },
  {
    key: "FILES",
    label: "FILES",
    url: "/files",
    icon: repo,
    allowedRoles: [role1, role2],
  },
  {
    key: "PriceList",
    label: "PRICE LIST",
    url: "/pricelist",
    icon: price,
    allowedRoles: [role1, role2],
  },
  // {
  //   key: "Settings",
  //   label: "REQUEST QUEUE",
  //   url: "/settings",
  //   allowedRoles: [role1],
  // },

  // {
  //   key: "Fileviewer",
  //   label: "FILE VIEWER",
  //   url: "/fileviewer",
  //   icon: view,
  // },
  {
    key: "OrderTracking",
    label: "ORDER TRACKING",
    url: "/order",
    allowedRoles: [role1, role2, role3],
  },
  {
    key: "jobTracking",
    label: "JOB TRACKING",
    url: "/job",
    allowedRoles: [role1, role2, role3],
  },
];

export { Menu_Items };
