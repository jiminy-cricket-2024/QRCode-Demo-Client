import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import QRCodeStyling from "qr-code-styling";
import { baseUrl, clientUrl } from "../../constants/api";

const Tracker = () => {
  const [currentQr, setCurrentQr] = useState(null);
  const [qrScans, setQrScans] = useState([]); // Initialize as empty array
  const [currentPage, setCurrentPage] = useState(1);
  const scansPerPage = 5;

  const params = useParams();
  const qrCodeRef = useRef(null);
  const qrCodeInstance = useRef(null);

  const modifyRects = () => {
    const svgElement = qrCodeRef.current.querySelector("svg");
    if (svgElement) {
      const rects = svgElement.querySelectorAll("#clip-path-dot-color rect");
      rects.forEach((rect) => {
        const x = parseFloat(rect.getAttribute("x"));
        const y = parseFloat(rect.getAttribute("y"));
        const width = parseFloat(rect.getAttribute("width"));
        const height = parseFloat(rect.getAttribute("height"));
        const newSize = 4;
        const newX = x + (width - newSize) / 2;
        const newY = y + (height - newSize) / 2;
        rect.setAttribute("width", newSize);
        rect.setAttribute("height", newSize);
        rect.setAttribute("x", newX);
        rect.setAttribute("y", newY);
      });
    }
  };

  useEffect(() => {
    const fetchQRCodeWithScans = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/qrcodes?id=${params?.id}&withScans=true`
        );
        const data = await response.json();
        setCurrentQr(data.qrCode);
        setQrScans(data.scans || []); // Ensure scans is an array or empty
      } catch (err) {
        console.log("Error fetching QR Code:", err);
      }
    };

    fetchQRCodeWithScans();
  }, [params.id]);

  useEffect(() => {
    if (currentQr && qrCodeRef.current) {
      if (!qrCodeInstance.current) {
        qrCodeInstance.current = new QRCodeStyling({
          width: 200,
          height: 200,
          margin: 7,
          type: "svg",
          data: `${clientUrl}/track/${currentQr.Id}`,
          dotsOptions: {
            color: currentQr.SquareColor || "#000000",
            type: "square",
          },
          cornersSquareOptions: {
            color: currentQr.SquareColor || "#000000",
            type: "dot",
          },
          cornersDotOptions: {
            color: currentQr.EyeColor || "#000000",
            type: "square",
          },
          backgroundOptions: {
            color: "#ffffff",
          },
        });
        qrCodeInstance.current.append(qrCodeRef.current);
      } else {
        qrCodeInstance.current.update({
          data: `${clientUrl}/track/${currentQr.Id}`,
          dotsOptions: { color: currentQr.SquareColor },
          cornersSquareOptions: { color: currentQr.SquareColor },
          cornersDotOptions: { color: currentQr.EyeColor },
        });
      }
      setTimeout(() => modifyRects(), 100);
    }
  }, [currentQr]);

  // Pagination logic
  const indexOfLastScan = currentPage * scansPerPage;
  const indexOfFirstScan = indexOfLastScan - scansPerPage;
  const currentScans = qrScans?.length ? qrScans.slice(indexOfFirstScan, indexOfLastScan) : [];

  // Pagination handler
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      {currentQr && (
        <>
          <div className="flex justify-center items-center">
            <div
              ref={qrCodeRef}
              className="mx-auto p-2 bg-white flex items-center justify-center"
              style={{ width: "fit-content", height: "fit-content" }}
            />
          </div>
          <p className="text-center text-black font-semibold mt-4 text-lg">
            QR Code ID: {currentQr.Id}
          </p>
          <p className="text-center text-gray-500 mt-2 text-sm">
            Redirecting to: {currentQr.RedirectUrl}
          </p>
          <hr className="my-6" />

          {currentScans.length > 0 && (
            <>
              <h2 className="text-center font-bold text-lg">Scan History</h2>
              {currentScans.map((scan, index) => (
                <div
                  key={scan.ScanDateTime}
                  className="p-4 my-2 bg-gray-50 rounded-lg shadow-md"
                >
                  <div className="text-black">
                    <strong className="text-black">Country:</strong> {scan.Country}
                  </div>
                  <div className="text-black">
                    <strong className="text-black">Timestamp:</strong> {scan.ScanDateTime}
                  </div>
                  <div className="text-black">
                    <strong className="text-black">MacAddress:</strong> {scan.MacAddress}
                  </div>
                  <div className="text-black">
                    <strong className="text-black">Device Details:</strong> {scan.DeviceDetails}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center flex-wrap space-x-2 mt-6">
            {Array.from({ length: Math.ceil(qrScans.length / scansPerPage) }).map(
              (_, idx) => (
                <button
                  key={idx + 1}
                  className={`py-2 px-4 rounded-lg m-1 ${
                    idx === currentPage - 1
                      ? "bg-blue-600 text-white"
                      : "bg-white text-black border border-gray-300"
                  } hover:bg-blue-500 transition`}
                  onClick={() => paginate(idx + 1)}
                >
                  {idx + 1}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Tracker;
