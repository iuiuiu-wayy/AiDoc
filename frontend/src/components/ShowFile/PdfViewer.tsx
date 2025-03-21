import { Document, Page } from "react-pdf";
import { useGetFilePdfQuery } from "../../services/api";
import React, { useEffect, useRef, useState } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface PdfViewerProps {
  file_id: number;
  selectedPageNum: number | null;
}

interface MoveFocusProps {
  pagenum: number;
  numPages: number;
}
export const PdfViewer: React.FC<PdfViewerProps> = ({
  file_id,
  selectedPageNum,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { data, isLoading } = useGetFilePdfQuery(file_id);
  const [numPages, setNumPages] = useState<number | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const singlePageRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(selectedPageNum || 1);

  useEffect(() => {
    if (data) {
      const url = URL.createObjectURL(data);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [data, file_id]);
  const moveFocus = (info: MoveFocusProps) => {
    if (info.numPages && info.numPages > 30) {
      setCurrentPage(info.pagenum);
      singlePageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    if (info.pagenum && pageRefs.current[info.pagenum - 1]) {
      pageRefs.current[info.pagenum - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };
  useEffect(() => {
    moveFocus({ pagenum: selectedPageNum || 1, numPages: numPages || 1 });
  }, [selectedPageNum, numPages]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(selectedPageNum || 1);
  };
  const handleNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
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
            {numPages && numPages > 30 && (
              <>
                <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      border: "none",
                      background: "#e6f7ff",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <i className="anticon anticon-left" />
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {numPages || 0}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={numPages ? currentPage === numPages : false}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      border: "none",
                      background: "#e6f7ff",
                      cursor:
                        numPages && currentPage === numPages
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Next
                    <i className="anticon anticon-right" />
                  </button>
                </div>
              </>
            )}
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
              {numPages && numPages > 30 ? (
                <div ref={singlePageRef}>
                  <Page pageNumber={currentPage} />
                </div>
              ) : (
                Array.from(new Array(numPages), (_el, index) => (
                  <div key={index} ref={(el) => (pageRefs.current[index] = el)}>
                    <Page
                      key={index + 1}
                      pageNumber={index + 1}
                      onLoadSuccess={() =>
                        moveFocus({
                          pagenum: selectedPageNum || 1,
                          numPages: numPages || 1,
                        })
                      }
                    />
                  </div>
                ))
              )}
            </Document>
          </div>
        </>
      )}
    </div>
  );
};
