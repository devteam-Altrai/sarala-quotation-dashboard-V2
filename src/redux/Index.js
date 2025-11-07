import { configureStore } from "@reduxjs/toolkit";
import filesReducer from "../redux/FilesSlice";

export const store = configureStore({
  reducer: {
    files: filesReducer,
  },
});
