import { createSlice } from "@reduxjs/toolkit";

interface SelectedFile {
  file_id: number | null;
  page_number: number | null;
  move_focus: boolean;
}

const initialState: SelectedFile = {
  file_id: null,
  page_number: null,
  move_focus: true,
};

const selectedFileSlice = createSlice({
  name: "selectedFile",
  initialState,
  reducers: {
    setSelectedFile(state, action) {
      state.file_id = action.payload.file_id;
      state.page_number = action.payload.page_number;
      state.move_focus = action.payload.move_focus;
    },
  },
});

export const { setSelectedFile } = selectedFileSlice.actions;
export default selectedFileSlice.reducer;
