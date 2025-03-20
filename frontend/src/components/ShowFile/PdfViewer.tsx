import { Document, Page } from "react-pdf";
import { useGetFilePdfQuery } from "../../services/api";
import React, { useEffect, useRef, useState } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface PdfViewerProps {
  file_id: number;
  selectedPageNum: number | null;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  file_id,
  selectedPageNum,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { data, isLoading } = useGetFilePdfQuery(file_id);
  const [numPages, setNumPages] = useState<number | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (data) {
      const url = URL.createObjectURL(data);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [data, file_id]);
  const moveFocus = (pagenum: number) => {
    if (pagenum && pageRefs.current[pagenum - 1]) {
      pageRefs.current[pagenum - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };
  useEffect(() => {
    moveFocus(selectedPageNum || 1);
  }, [selectedPageNum, numPages]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  console.log("selectedPageNum", selectedPageNum);
  return (
    <div>
      {pdfUrl && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflowY: "scroll",
              height: "90vh",
            }}
          >
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from(new Array(numPages), (_el, index) => (
                <div key={index} ref={(el) => (pageRefs.current[index] = el)}>
                  <Page
                    key={index + 1}
                    pageNumber={index + 1}
                    onLoadSuccess={() => moveFocus(selectedPageNum || 1)}
                  />
                </div>
              ))}
            </Document>
          </div>
        </>
      )}
    </div>
  );
};
