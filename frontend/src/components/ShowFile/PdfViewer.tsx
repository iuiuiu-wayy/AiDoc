import { Document, Page } from "react-pdf";
import { useGetFilePdfQuery } from "../../services/api";
import React, { useEffect, useRef, useState } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface PdfViewerProps {
  file_id: number;
  selectedPageNum: number | null;
  moveFocus: boolean;
}

interface MoveFocusProps {
  pagenum: number;
  numPages: number;
}
export const PdfViewer: React.FC<PdfViewerProps> = ({
  moveFocus: moveFocusProp,
  file_id,
  selectedPageNum,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { data, isLoading } = useGetFilePdfQuery(file_id);
  const [numPages, setNumPages] = useState<number | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const singlePageRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(selectedPageNum || 1);

  const [zoomLevel, setZoomLevel] = useState(1);

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
    if (moveFocusProp) {
      moveFocus({
        pagenum: selectedPageNum || 1,
        numPages: numPages || 1,
      });
    }
    // moveFocus({ pagenum: selectedPageNum || 1, numPages: numPages || 1 });
  }, [selectedPageNum, numPages, moveFocusProp]);

  useEffect(() => {
    // const handleKeyDown = (event: KeyboardEvent) => {
    //   if (event.ctrlKey && event.key === "+") {
    //     event.preventDefault();
    //     setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 3));
    //   } else if (event.ctrlKey && event.key === "-") {
    //     event.preventDefault();
    //     setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
    //   }
    // };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
        setZoomLevel((prevZoom) => {
          const newZoom = event.deltaY < 0 ? prevZoom + 0.1 : prevZoom - 0.1;
          return Math.min(Math.max(newZoom, 0.5), 3);
        });
      }
    };

    // window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel);
    return () => {
      // window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

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
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top",
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
