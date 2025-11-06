import price from "../assets/currency.png";
import dashboard from "../assets/dashboard-panel.png";
import repo from "../assets/folder-archive.png";
import view from "../assets/model-cube-arrows.png";

const Menu_Items = [
  {
    key: "Dashboard",
    label: "DASHBOARD",
    url: "/dashboard",
    icon: dashboard,
  },
  {
    key: "Repository",
    label: "REPOSITORY",
    url: "/files",
    icon: repo,
  },
  {
    key: "PriceList",
    label: "PRICE LIST",
    url: "/pricelist",
    icon: price,
  },
  // {
  //   key: "Fileviewer",
  //   label: "FILE VIEWER",
  //   url: "/fileviewer",
  //   icon: view,
  // },
];

export { Menu_Items };
