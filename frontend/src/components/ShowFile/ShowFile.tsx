import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { PdfViewer } from "./PdfViewer";

export const ShowFile = () => {
  const selectedFile = useSelector((state: RootState) => state.selectedFile);
  return (
    <div>
      {selectedFile.file_id && (
        <PdfViewer
          file_id={selectedFile.file_id}
          selectedPageNum={selectedFile.page_number}
          moveFocus={selectedFile.move_focus}
        />
      )}
    </div>
  );
};
