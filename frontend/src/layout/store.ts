import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TFiles {
  files: File[];
}

const initialState: TFiles = {
  files: [],
};

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setFiles(state, action: PayloadAction<File[]>) {
      state.files = [...state.files, ...action.payload];
    },
  },
});

export const { setFiles } = filesSlice.actions;
export default filesSlice.reducer;
