import { createPortal } from "react-dom";

const Portal = ({ children }) => {
  return createPortal(children, document.getElementById("dropdown-root"));
};

export default Portal;
