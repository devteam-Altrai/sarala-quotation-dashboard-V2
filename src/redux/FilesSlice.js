// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
// import { BASE_URL } from "../utils/AppConstant";

// // Fetch files from API
// export const fetchFiles = createAsyncThunk("files/fetchFiles", async () => {
//   const response = await axios.get(`${BASE_URL}list_zip_files/`);
//   return response.data.files;
// });

// const filesSlice = createSlice({
//   name: "files",
//   initialState: {
//     data: [],
//     status: "idle", // idle | loading | succeeded | failed
//     error: null,
//     firstLoadDone: false, // new flag to track initial load
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchFiles.pending, (state) => {
//         if (!state.firstLoadDone) {
//           state.status = "loading"; // only show loading on first fetch
//         }
//       })
//       .addCase(fetchFiles.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.data = action.payload;
//         state.firstLoadDone = true; // mark first fetch as done
//       })
//       .addCase(fetchFiles.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.error.message;
//       });
//   },
// });

// export default filesSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../utils/AppConstant";

// Fetch files from API
export const fetchFiles = createAsyncThunk("files/fetchFiles", async () => {
  // Fetch first API (list of zip files)
  const filesResponse = await axios.get(`${BASE_URL}list_zip_files/`);
  const files = filesResponse.data.files;

  // Fetch second API (project quotations)
  const quotesResponse = await axios.get(`${BASE_URL}get_metadata/`);
  const quotes = quotesResponse.data.data;

  // Merge files and quotes by name/projectName
  const mergedData = files.map((file) => {
    const match = quotes.find((q) => q.projectName === file.name);
    if (match) {
      return {
        ...file,
        quotationname: match.quotationname,
        grandTotal: match.grandTotal,
        last_date: match.last_date,
      };
    }
    return file; // if no match, keep original file
  });

  return mergedData;
});

const filesSlice = createSlice({
  name: "files",
  initialState: {
    data: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    firstLoadDone: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        if (!state.firstLoadDone) {
          state.status = "loading";
        }
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.firstLoadDone = true;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default filesSlice.reducer;
