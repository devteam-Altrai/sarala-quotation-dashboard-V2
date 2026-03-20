import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../utils/AppConstant";

export const fetchFiles = createAsyncThunk("files/fetchFiles", async () => {
  const filesResponse = await axios.get(`${BASE_URL}list_zip_files/`);

  const files = filesResponse.data.files;

  const quotesResponse = await axios.get(`${BASE_URL}get_metadata/`);

  const quotes = quotesResponse.data.data;

  const mergedData = files.map((file) => {
    const match = quotes.find((q) => q.projectName === file.name);

    return match
      ? {
          ...file,
          quotationname: match.quotationname,
          grandTotal: match.grandTotal,
          projectStatus: match.projectStatus,
          ext_info: match.ext_info,
          last_date: match.last_date,
        }
      : file;
  });

  return mergedData;
});

const filesSlice = createSlice({
  name: "files",
  initialState: {
    data: [],
    status: "idle",
    error: null,
    firstLoadDone: false,
  },
  reducers: {
    deleteFileByName: (state, action) => {
      const fileName = action.payload;
      state.data = state.data.filter((file) => file.name !== fileName);
    },
    updateQuotationName: (state, action) => {
      const { fileName, newQuotationName } = action.payload;
      const file = state.data.find((f) => f.name === fileName);
      if (file) {
        file.quotationname = newQuotationName;
      }
    },
  },
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
export const { deleteFileByName } = filesSlice.actions;
export default filesSlice.reducer;
