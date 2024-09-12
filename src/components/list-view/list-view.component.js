// import React, { useEffect, useState, useRef } from "react";
// import QRCodeStyling from "qr-code-styling";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
// import { baseUrl } from "../../constants/api";
// import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa"; // Spinner and eye icons
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// const ListView = () => {
//   const [qrCodes, setQrCodes] = useState([]);
//   const [visibleQrCodes, setVisibleQrCodes] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isLoading, setIsLoading] = useState(false); // Loader for zip process
//   const [isDownloadAllTriggered, setIsDownloadAllTriggered] = useState(false); // Track if "Download All" is pressed
//   const zip = useRef(new JSZip()); // Use ref to store JSZip instance
//   const [renderedCount, setRenderedCount] = useState(0); // State to track rendered QR codes count
//   const qrPerPage = 5;

//   // Pagination control
//   const visiblePageLimit = 15; // Only show 15 pages at a time
//   const [pageWindowStart, setPageWindowStart] = useState(1);

//   // Fetch QR Codes from API
//   useEffect(() => {
//     const fetchQRCodes = async () => {
//       try {
//         const response = await fetch(`${baseUrl}/api/qrcodes`);
//         const data = await response.json();
//         setQrCodes(data); // Ensure all QR codes are fetched
//       } catch (error) {
//         console.log("Error fetching data:", error);
//       }
//     };

//     fetchQRCodes();
//   }, []);

//   // Dynamically calculate total pages based on QR codes
//   const totalPages = qrCodes.length ? Math.ceil(qrCodes.length / qrPerPage) : 0;

//   const generateVanityUrl = (redirectUrl, qrId) => {
//     const protocol = redirectUrl.startsWith("https") ? "https" : "http";
//     const vanityBaseUrl = "www.hil.ls.com";
//     return `${protocol}://${vanityBaseUrl}/${qrId}`;
//   };

//   // Process QR codes in batches and download ZIP after every 20 pages
// const processQrCodesInBatch = async (format = "svg") => {
//   const currentQRCodes = qrCodes.slice(
//     (currentPage - 1) * qrPerPage,
//     currentPage * qrPerPage
//   );

//   // Render and download each QR code in the current page batch
//   for (const qrCode of currentQRCodes) {
//     await renderAndDownloadQRCode(qrCode, format);  // Ensure format is passed properly
//   }

//   // Check if 20 pages have been processed or we are on the last page
//   const isEndOfBatch = currentPage % 20 === 0 || currentPage === totalPages;

//   if (isEndOfBatch) {
//     // Generate and download the ZIP for the current batch of 20 pages
//     if (format === "svg") {
//       await generateZipFile();  // ZIP for SVGs
//     } else if (format === "pdf") {
//       await generatePdfFile();  // ZIP for PDFs
//     }

//     // Reset the zip for the next batch
//     zip.current = new JSZip();
//   }

//   // If there are more pages to process, continue to the next batch
//   if (currentPage < totalPages) {
//     setTimeout(() => {
//       setCurrentPage((prevPage) => prevPage + 1);  // Move to the next page
//       processQrCodesInBatch(format);  // Ensure the format is passed here as well
//     }, 500);  // Small delay to allow state to update and prevent race conditions
//   } else {
//     // Once all pages are processed, stop the loader
//     setIsLoading(false);
//     setIsDownloadAllTriggered(false);  // Mark process as finished
//   }
// };

//   // Trigger the ZIP generation process
//   const handleDownloadAllAsZip = async () => {
//     setIsLoading(true); // Start the loader for the entire process
//     setIsDownloadAllTriggered(true); // Mark that "Download All" is triggered
//     setCurrentPage(1); // Start from the first page
//     zip.current = new JSZip(); // Reset the ZIP for new batches
//     setRenderedCount(0); // Reset the rendered count

//     processQrCodesInBatch("svg"); // Start processing immediately
//   };

//   // Trigger the PDF generation process
//   const handleDownloadAllAsPdf = async () => {
//     setIsLoading(true); // Start the loader for the entire process
//     setIsDownloadAllTriggered(true); // Mark that "Download All" is triggered
//     setCurrentPage(1); // Start from the first page
//     zip.current = new JSZip(); // Reset the ZIP for new batches
//     setRenderedCount(0); // Reset the rendered count

//     processQrCodesInBatch("pdf"); // Start processing immediately
//   };

//  // Render and download a QR code as SVG or PDF
// const renderAndDownloadQRCode = (qrCode, format = "svg") => {
//   return new Promise((resolve) => {
//     setVisibleQrCodes((prevVisible) => ({
//       ...prevVisible,
//       [qrCode.Id]: true,
//     }));

//     setTimeout(() => {
//       const qrContainer = document.getElementById(`${qrCode.Id}`);
//       if (qrContainer && !qrContainer.innerHTML) {
//         const qrCodeStyling = new QRCodeStyling({
//           width: 200,
//           height: 200,
//           margin: 7,
//           type: "svg",
//           data: `${baseUrl}/api/scan/${qrCode.QRCodeId}`,
//           dotsOptions: {
//             color: qrCode.SquareColor || "#000000",
//             type: "square",
//           },
//           cornersSquareOptions: {
//             color: qrCode.SquareColor || "#000000",
//             type: "dot",
//           },
//           cornersDotOptions: {
//             color: qrCode.EyeColor || "#000000",
//             type: "square",
//           },
//           backgroundOptions: {
//             color: "#ffffff",
//           },
//         });

//         qrCodeStyling.append(qrContainer);

//         // Check format before downloading
//         if (format === "svg") {
//           downloadQRCodeAsSVG(qrCode.Id, qrCode.QRCodeId).then(() => {
//             resolve();  // Proceed to the next QR code after downloading
//           });
//         } else if (format === "pdf") {
//           downloadQRCodeAsPDF(qrCode.Id, qrCode.QRCodeId).then(() => {
//             resolve();  // Proceed to the next QR code after downloading
//           });
//         }
//       }
//     }, 500);  // Allow some time for QR code rendering
//   });
// };

//   // Download QR code as SVG and add to ZIP
//   const downloadQRCodeAsSVG = async (id, qrCodeId) => {
//     const qrContainer = document.getElementById(`${id}`);
//     const svgElement = qrContainer?.querySelector("svg");
//     if (!svgElement) return;

//     const serializer = new XMLSerializer();
//     const rawSvg = serializer.serializeToString(svgElement);
//     zip.current.file(`${qrCodeId}.svg`, rawSvg); // Add the QR code to the current ZIP
//   };

//   // Download QR code as PDF
//   const downloadQRCodeAsPDF = async (id, qrCodeId) => {
//     const qrContainer = document.getElementById(`${id}`);
//     const svgElement = qrContainer?.querySelector("svg");
//     if (!svgElement) return;

//     const canvas = await html2canvas(qrContainer);
//     const imgData = canvas.toDataURL("image/png");

//     const doc = new jsPDF();
//     doc.addImage(imgData, "PNG", 10, 10, 180, 180);
//     zip.current.file(`${qrCodeId}.pdf`, doc.output("blob"));
//   };

//   // Generate the ZIP file for SVG
//   const generateZipFile = () => {
//     return zip.current.generateAsync({ type: "blob" }).then((content) => {
//       saveAs(content, `qr-codes-batch-${currentPage}.zip`);
//     });
//   };

//   // Generate the ZIP file for PDF
//   const generatePdfFile = () => {
//     return zip.current.generateAsync({ type: "blob" }).then((content) => {
//       saveAs(content, `qr-codes-pdf-batch-${currentPage}.zip`);
//     });
//   };

//   // Manual QR code toggle
//   const handleToggleQrCode = (qrCodeId) => {
//     setVisibleQrCodes((prevVisible) => {
//       const newVisible = {};
//       Object.keys(prevVisible).forEach((key) => (newVisible[key] = false)); // Close previous QR codes
//       return { ...newVisible, [qrCodeId]: !prevVisible[qrCodeId] };
//     });

//     // Re-render the QR code when toggled
//     setTimeout(() => {
//       const qrContainer = document.getElementById(`${qrCodeId}`);
//       if (qrContainer && !qrContainer.innerHTML) {
//         const qrCode = qrCodes.find((code) => code.Id === qrCodeId);
//         const qrCodeStyling = new QRCodeStyling({
//           width: 200,
//           height: 200,
//           margin: 7,
//           type: "svg",
//           data: `${baseUrl}/api/scan/${qrCode.QRCodeId}`,
//           dotsOptions: {
//             color: qrCode.SquareColor || "#000000",
//             type: "square",
//           },
//           cornersSquareOptions: {
//             color: qrCode.SquareColor || "#000000",
//             type: "dot",
//           },
//           cornersDotOptions: {
//             color: qrCode.EyeColor || "#000000",
//             type: "square",
//           },
//           backgroundOptions: {
//             color: "#ffffff",
//           },
//         });
//         qrCodeStyling.append(qrContainer);
//       }
//     }, 300);
//   };

//   // Download individual QR code
//   const downloadQRCode = (id, qrCodeId, format) => {
//     const qrContainer = document.getElementById(`${id}`);
//     const svgElement = qrContainer?.querySelector("svg");
//     if (!svgElement) return;

//     const serializer = new XMLSerializer();
//     const rawSvg = serializer.serializeToString(svgElement);

//     if (format === "svg") {
//       const updatedSvg = new XMLSerializer().serializeToString(svgElement);
//       const svgBlob = new Blob([updatedSvg], { type: "image/svg+xml" });
//       const url = URL.createObjectURL(svgBlob);
//       const link = document.createElement("a");
//       link.download = `${id}.svg`;
//       link.href = url;
//       link.click();
//       URL.revokeObjectURL(url);
//     } else {
//       const image = new Image();
//       const svgBlob = new Blob(
//         [new XMLSerializer().serializeToString(svgElement)],
//         {
//           type: "image/svg+xml",
//         }
//       );
//       const url = URL.createObjectURL(svgBlob);
//       image.onload = () => {
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");
//         const canvasWidth = 220;
//         const canvasHeight = 200;
//         canvas.width = canvasWidth;
//         canvas.height = canvasHeight;
//         ctx.fillStyle = "#ffffff";
//         ctx.fillRect(0, 0, canvasWidth, canvasHeight);
//         ctx.drawImage(image, 0, 0, canvasWidth, 200);
//         const imgData = canvas.toDataURL(`image/${format}`);
//         const link = document.createElement("a");
//         link.download = `${id}.${format}`;
//         link.href = imgData;
//         link.click();
//         URL.revokeObjectURL(url);
//       };
//       image.src = url;
//     }
//   };

//   // Watch for page change and process QR codes on the new page
//   useEffect(() => {
//     if (
//       isDownloadAllTriggered &&
//       renderedCount < qrCodes.length &&
//       currentPage <= totalPages
//     ) {
//       processQrCodesInBatch(); // Automatically process the next page
//     }
//   }, [currentPage, isDownloadAllTriggered]); // Only process when "Download All" is triggered and page changes

//   // Handle Pagination Scroll
//   const handlePageClick = (pageNum) => {
//     setCurrentPage(pageNum);
//     if (pageNum > pageWindowStart + visiblePageLimit - 1) {
//       setPageWindowStart((prevStart) => prevStart + visiblePageLimit);
//     } else if (pageNum < pageWindowStart) {
//       setPageWindowStart((prevStart) => prevStart - visiblePageLimit);
//     }
//   };

//   const indexOfLastQR = currentPage * qrPerPage;
//   const indexOfFirstQR = indexOfLastQR - qrPerPage;
//   const currentQRCodes = qrCodes.slice(indexOfFirstQR, indexOfLastQR);

//   return (
//     <div className="container mx-auto px-4 py-6 relative">
//       {/* Full-screen loader */}
//       {isLoading && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <FaSpinner className="text-white text-6xl animate-spin" />
//         </div>
//       )}
//       <h2 className="text-3xl font-bold text-center mb-6">All QR Codes</h2>

//       {currentQRCodes.map((qrCode, index) => (
//         <div
//           key={qrCode.Id}
//           className="text-center mb-6 p-4 border border-gray-300 rounded-lg shadow-md"
//         >
//           <p className="font-semibold">ID: {qrCode.Id}</p>
//           <p>QR Code Id: {qrCode.QRCodeId}</p>
//           <p>Redirect URL: {qrCode.RedirectUrl}</p>

//           <button
//             onClick={() => handleToggleQrCode(qrCode.Id)}
//             className="mt-4 text-2xl text-blue-500 hover:text-blue-700 focus:outline-none"
//             title={visibleQrCodes[qrCode.Id] ? "Hide QR Code" : "Show QR Code"}
//           >
//             {visibleQrCodes[qrCode.Id] ? <FaEyeSlash /> : <FaEye />}
//           </button>

//           {visibleQrCodes[qrCode.Id] && (
//             <>
//               <div
//                 id={`${qrCode.Id}`}
//                 className="mx-auto mt-4 p-0 bg-white flex items-center justify-center"
//                 style={{ width: "200px", height: "200px" }}
//               ></div>

//               <div className="mt-4 flex justify-center space-x-4">
//                 <button
//                   onClick={() =>
//                     downloadQRCode(qrCode.Id, qrCode.QRCodeId, "jpeg")
//                   }
//                   className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
//                 >
//                   Download JPEG
//                 </button>
//                 <button
//                   onClick={() =>
//                     downloadQRCode(qrCode.Id, qrCode.QRCodeId, "png")
//                   }
//                   className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
//                 >
//                   Download PNG
//                 </button>
//                 <button
//                   onClick={() =>
//                     downloadQRCode(qrCode.Id, qrCode.QRCodeId, "svg")
//                   }
//                   className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
//                 >
//                   Download SVG
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       ))}

//       {/* Pagination Controls with horizontal scroll */}
//       <div className="flex justify-center flex-wrap space-x-2 mt-6 overflow-x-auto whitespace-nowrap">
//         <button
//           onClick={() =>
//             handlePageClick(Math.max(pageWindowStart - visiblePageLimit, 1))
//           }
//           disabled={pageWindowStart === 1}
//           className="py-2 px-4 rounded-lg bg-gray-300 text-black"
//         >
//           &laquo; Prev
//         </button>

//         {Array.from({
//           length: Math.min(visiblePageLimit, totalPages - pageWindowStart + 1),
//         }).map((_, idx) => (
//           <button
//             key={idx + pageWindowStart}
//             onClick={() => handlePageClick(idx + pageWindowStart)}
//             className={`py-2 px-4 rounded-lg ${
//               currentPage === idx + pageWindowStart
//                 ? "bg-blue-600 text-white"
//                 : "bg-white text-black border border-gray-300"
//             } hover:bg-blue-500 transition`}
//           >
//             {idx + pageWindowStart}
//           </button>
//         ))}

//         <button
//           onClick={() =>
//             handlePageClick(
//               Math.min(pageWindowStart + visiblePageLimit, totalPages)
//             )
//           }
//           disabled={pageWindowStart + visiblePageLimit > totalPages}
//           className="py-2 px-4 rounded-lg bg-gray-300 text-black"
//         >
//           Next &raquo;
//         </button>
//       </div>

//       {/* Start ZIP generation */}
//       <div className="flex justify-center mt-6">
//         <button
//           onClick={handleDownloadAllAsZip}
//           className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg"
//         >
//           Download All as Zip
//         </button>
//         <button
//           onClick={handleDownloadAllAsPdf}
//           className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg mt-4 ml-4"
//         >
//           Download All as PDF
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ListView;

import React, { useEffect, useState, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { baseUrl } from "../../constants/api";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa"; // Spinner and eye icons
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ListView = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [visibleQrCodes, setVisibleQrCodes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // Loader for zip process
  const [isDownloadAllTriggered, setIsDownloadAllTriggered] = useState(false); // Track if "Download All" is pressed
  const [selectedFormat, setSelectedFormat] = useState(); // Store the selected format (svg or pdf)
  const zip = useRef(new JSZip()); // Use ref to store JSZip instance
  const [renderedCount, setRenderedCount] = useState(0); // State to track rendered QR codes count
  const qrPerPage = 5;

  
  // Pagination control
  const visiblePageLimit = 15; // Only show 15 pages at a time
  const [pageWindowStart, setPageWindowStart] = useState(1);

  // Fetch QR Codes from API
  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/qrcodes`);
        const data = await response.json();
        setQrCodes(data); // Ensure all QR codes are fetched
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchQRCodes();
  }, []);

  // Dynamically calculate total pages based on QR codes
  const totalPages = qrCodes.length ? Math.ceil(qrCodes.length / qrPerPage) : 0;

  const generateVanityUrl = (redirectUrl, qrId) => {
    const protocol = redirectUrl.startsWith("https") ? "https" : "http";
    const vanityBaseUrl = "www.hil.ls.com";
    return `${protocol}://${vanityBaseUrl}/${qrId}`;
  };

  // Process QR codes in batches and download ZIP after every 20 pages
  const processQrCodesInBatch = async () => {
    const currentQRCodes = qrCodes.slice(
      (currentPage - 1) * qrPerPage,
      currentPage * qrPerPage
    );

    // Render and download each QR code in the current page batch
    for (const qrCode of currentQRCodes) {
      await renderAndDownloadQRCode(qrCode, selectedFormat);  // Use selectedFormat
    }

    // Check if we are on the last page or batch
    const isEndOfBatch = currentPage === 5 || currentPage === totalPages;

    if (isEndOfBatch) {
      // Generate and download the ZIP for the current batch of 20 pages
      if (selectedFormat === "svg") {        
        await generateZipFile();
      } else if (selectedFormat === "pdf") {
        await generatePdfFile();
      }

      // Reset the zip for the next batch
      zip.current = new JSZip();
    }

    // If there are more pages to process, continue to the next batch
    if (currentPage < totalPages) {
      setTimeout(() => {
        setCurrentPage((prevPage) => prevPage + 1);  // Move to the next page

        // Ensure that after updating the page, the batch process continues with the selected format
        processQrCodesInBatch(); // Use the stored format from state
      }, 500);  // Small delay to allow state to update and prevent race conditions
    } else {
      // Once all pages are processed, stop the loader
      setIsLoading(false);
      setIsDownloadAllTriggered(false);  // Mark process as finished
      setSelectedFormat('svg');  // Reset format back to default (SVG)
    }
  };

  // Trigger the ZIP generation process
  const handleDownloadAllAsZip = async () => {
    setIsLoading(true);  // Start the loader for the entire process
    setIsDownloadAllTriggered(true);  // Mark that "Download All" is triggered
    setCurrentPage(1);  // Start from the first page
    zip.current = new JSZip();  // Reset the ZIP for new batches
    setRenderedCount(0);  // Reset the rendered count
    setSelectedFormat('svg');  // Set selected format to SVG
    setTimeout(() => {
      processQrCodesInBatch();  // Start processing with a dleay to give time to get updated selected format
    }, 1000);
  };

  // Trigger the PDF generation process
  const handleDownloadAllAsPdf = async () => {
    setIsLoading(true);  // Start the loader for the entire process
    setIsDownloadAllTriggered(true);  // Mark that "Download All" is triggered
    setCurrentPage(1);  // Start from the first page
    zip.current = new JSZip();  // Reset the ZIP for new batches
    setRenderedCount(0);  // Reset the rendered count
    setSelectedFormat('pdf');  // Set selected format to PDF
    setTimeout(() => {
      processQrCodesInBatch();  // Start processing with a dleay to give time to get updated selected format
    }, 1000);
  };

  // Render and download a QR code as SVG or PDF
  const renderAndDownloadQRCode = (qrCode, format) => {
    return new Promise((resolve) => {
      setVisibleQrCodes((prevVisible) => ({
        ...prevVisible,
        [qrCode.Id]: true,
      }));

      setTimeout(() => {
        const qrContainer = document.getElementById(`${qrCode.Id}`);
        if (qrContainer && !qrContainer.innerHTML) {
          const qrCodeStyling = new QRCodeStyling({
            width: 200,
            height: 200,
            margin: 7,
            type: "svg",  // Always set to "svg" for rendering
            data: `${baseUrl}/api/scan/${qrCode.QRCodeId}`,
            dotsOptions: {
              color: qrCode.SquareColor || "#000000",
              type: "square",
            },
            cornersSquareOptions: {
              color: qrCode.SquareColor || "#000000",
              type: "dot",
            },
            cornersDotOptions: {
              color: qrCode.EyeColor || "#000000",
              type: "square",
            },
            backgroundOptions: {
              color: "#ffffff",
            },
          });

          qrCodeStyling.append(qrContainer);

          // Check format before downloading
          if (format === "svg") {
            console.log("SVG DOWNLOAD MEN AGAYA");
            downloadQRCodeAsSVG(qrCode.Id, qrCode.QRCodeId).then(() => {
              resolve();  // Proceed to the next QR code after downloading
            });
          } else if (format === "pdf") {
            console.log("PDFFFFFFFF DOWNLOAD MEN AGAYA");
            downloadQRCodeAsPDF(qrCode.Id, qrCode.QRCodeId).then(() => {
              resolve();  // Proceed to the next QR code after downloading
            });
          }
        }
      }, 800);  // Allow some time for QR code rendering
    });
  };

  // Download QR code as SVG and add to ZIP
  const downloadQRCodeAsSVG = async (id, qrCodeId) => {
    const qrContainer = document.getElementById(`${id}`);
    const svgElement = qrContainer?.querySelector("svg");
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const rawSvg = serializer.serializeToString(svgElement);
    zip.current.file(`${qrCodeId}.svg`, rawSvg);  // Add the QR code to the current ZIP
  };

  // Download QR code as PDF
  const downloadQRCodeAsPDF = async (id, qrCodeId) => {
    const qrContainer = document.getElementById(`${id}`);
    const svgElement = qrContainer?.querySelector("svg");
    if (!svgElement) return;

    const canvas = await html2canvas(qrContainer);
    const imgData = canvas.toDataURL("image/png");

    const doc = new jsPDF();
    doc.addImage(imgData, "PNG", 10, 10, 180, 180);
    zip.current.file(`${qrCodeId}.pdf`, doc.output("blob"));
  };

  // Generate the ZIP file for SVG
  const generateZipFile = () => {
    return zip.current.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `qr-codes-batch-${currentPage}.zip`);
    });
  };

  // Generate the ZIP file for PDF
  const generatePdfFile = () => {
    return zip.current.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `qr-codes-pdf-batch-${currentPage}.zip`);
    });
  };

  // Manual QR code toggle
  const handleToggleQrCode = (qrCodeId) => {
    setVisibleQrCodes((prevVisible) => {
      const newVisible = {};
      Object.keys(prevVisible).forEach((key) => (newVisible[key] = false));  // Close previous QR codes
      return { ...newVisible, [qrCodeId]: !prevVisible[qrCodeId] };
    });

    // Re-render the QR code when toggled
    setTimeout(() => {
      const qrContainer = document.getElementById(`${qrCodeId}`);
      if (qrContainer && !qrContainer.innerHTML) {
        const qrCode = qrCodes.find((code) => code.Id === qrCodeId);
        const qrCodeStyling = new QRCodeStyling({
          width: 200,
          height: 200,
          margin: 7,
          type: "svg",
          data: `${baseUrl}/api/scan/${qrCode.QRCodeId}`,
          dotsOptions: {
            color: qrCode.SquareColor || "#000000",
            type: "square",
          },
          cornersSquareOptions: {
            color: qrCode.SquareColor || "#000000",
            type: "dot",
          },
          cornersDotOptions: {
            color: qrCode.EyeColor || "#000000",
            type: "square",
          },
          backgroundOptions: {
            color: "#ffffff",
          },
        });
        qrCodeStyling.append(qrContainer);
      }
    }, 300);
  };

  // Download individual QR code
  const downloadQRCode = (id, qrCodeId, format) => {
    const qrContainer = document.getElementById(`${id}`);
    const svgElement = qrContainer?.querySelector("svg");
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const rawSvg = serializer.serializeToString(svgElement);

    if (format === "svg") {
      const updatedSvg = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([updatedSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement("a");
      link.download = `${id}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const image = new Image();
      const svgBlob = new Blob(
        [new XMLSerializer().serializeToString(svgElement)],
        {
          type: "image/svg+xml",
        }
      );
      const url = URL.createObjectURL(svgBlob);
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const canvasWidth = 220;
        const canvasHeight = 200;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(image, 0, 0, canvasWidth, 200);
        const imgData = canvas.toDataURL(`image/${format}`);
        const link = document.createElement("a");
        link.download = `${id}.${format}`;
        link.href = imgData;
        link.click();
        URL.revokeObjectURL(url);
      };
      image.src = url;
    }
  };

  // Watch for page change and process QR codes on the new page
  useEffect(() => {
    if (
      isDownloadAllTriggered &&
      renderedCount < qrCodes.length &&
      currentPage <= totalPages
    ) {
      processQrCodesInBatch();  // Automatically process the next page
    }
  }, [currentPage, isDownloadAllTriggered]);  // Only process when "Download All" is triggered and page changes

  // Handle Pagination Scroll
  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
    if (pageNum > pageWindowStart + visiblePageLimit - 1) {
      setPageWindowStart((prevStart) => prevStart + visiblePageLimit);
    } else if (pageNum < pageWindowStart) {
      setPageWindowStart((prevStart) => prevStart - visiblePageLimit);
    }
  };

  const indexOfLastQR = currentPage * qrPerPage;
  const indexOfFirstQR = indexOfLastQR - qrPerPage;
  const currentQRCodes = qrCodes.slice(indexOfFirstQR, indexOfLastQR);

  return (
    <div className="container mx-auto px-4 py-6 relative">
      {/* Full-screen loader */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
        <FaSpinner className="text-white text-6xl animate-spin" />
        <p className="mt-4 text-yellow-500 text-center">
          ⚠ Warning: This is a bulk operation that might take time. Please be patient until it finishes off completely.
        </p>
      </div>
      )}
      <h2 className="text-3xl font-bold text-center mb-6">All QR Codes</h2>

      {currentQRCodes.map((qrCode, index) => (
        <div
          key={qrCode.Id}
          className="text-center mb-6 p-4 border border-gray-300 rounded-lg shadow-md"
        >
          <p className="font-semibold">ID: {qrCode.Id}</p>
          <p>QR Code Id: {qrCode.QRCodeId}</p>
          <p>Redirect URL: {qrCode.RedirectUrl}</p>

          <button
            onClick={() => handleToggleQrCode(qrCode.Id)}
            className="mt-4 text-2xl text-blue-500 hover:text-blue-700 focus:outline-none"
            title={visibleQrCodes[qrCode.Id] ? "Hide QR Code" : "Show QR Code"}
          >
            {visibleQrCodes[qrCode.Id] ? <FaEyeSlash /> : <FaEye />}
          </button>

          {visibleQrCodes[qrCode.Id] && (
            <>
              <div
                id={`${qrCode.Id}`}
                className="mx-auto mt-4 p-0 bg-white flex items-center justify-center"
                style={{ width: "200px", height: "200px" }}
              ></div>

              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={() =>
                    downloadQRCode(qrCode.Id, qrCode.QRCodeId, "jpeg")
                  }
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Download JPEG
                </button>
                <button
                  onClick={() =>
                    downloadQRCode(qrCode.Id, qrCode.QRCodeId, "png")
                  }
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Download PNG
                </button>
                <button
                  onClick={() =>
                    downloadQRCode(qrCode.Id, qrCode.QRCodeId, "svg")
                  }
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Download SVG
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Pagination Controls with horizontal scroll */}
      <div className="flex justify-center flex-wrap space-x-2 mt-6 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() =>
            handlePageClick(Math.max(pageWindowStart - visiblePageLimit, 1))
          }
          disabled={pageWindowStart === 1}
          className="py-2 px-4 rounded-lg bg-gray-300 text-black"
        >
          &laquo; Prev
        </button>

        {Array.from({
          length: Math.min(visiblePageLimit, totalPages - pageWindowStart + 1),
        }).map((_, idx) => (
          <button
            key={idx + pageWindowStart}
            onClick={() => handlePageClick(idx + pageWindowStart)}
            className={`py-2 px-4 rounded-lg ${
              currentPage === idx + pageWindowStart
                ? "bg-blue-600 text-white"
                : "bg-white text-black border border-gray-300"
            } hover:bg-blue-500 transition`}
          >
            {idx + pageWindowStart}
          </button>
        ))}

        <button
          onClick={() =>
            handlePageClick(
              Math.min(pageWindowStart + visiblePageLimit, totalPages)
            )
          }
          disabled={pageWindowStart + visiblePageLimit > totalPages}
          className="py-2 px-4 rounded-lg bg-gray-300 text-black"
        >
          Next &raquo;
        </button>
      </div>

      {/* Start ZIP generation */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleDownloadAllAsZip}
          className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg"
        >
          Download All as Zip
        </button>
        <button
          onClick={handleDownloadAllAsPdf}
          className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg ml-4"
        >
          Download All as PDF
        </button>
      </div>
    </div>
  );
};

export default ListView;
