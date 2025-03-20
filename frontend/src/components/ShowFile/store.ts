import { createSlice } from "@reduxjs/toolkit";

interface SelectedFile {
  file_id: number | null;
  page_number: number | null;
}

const initialState: SelectedFile = {
  file_id: null,
  page_number: null,
};

const selectedFileSlice = createSlice({
  name: "selectedFile",
  initialState,
  reducers: {
    setSelectedFile(state, action) {
      state.file_id = action.payload.file_id;
      state.page_number = action.payload.page_number;
    },
  },
});

export const { setSelectedFile } = selectedFileSlice.actions;
export default selectedFileSlice.reducer;
