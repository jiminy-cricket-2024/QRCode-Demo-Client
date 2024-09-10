import React, { useEffect, useState, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { baseUrl } from "../../constants/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa"; // Spinner icon for loading

const ListView = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [visibleQrCodes, setVisibleQrCodes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [qrPerPage] = useState(5);
  const lastQrRef = useRef(null);
  const topPageRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const generateVanityUrl = (redirectUrl, qrId) => {
    const protocol = redirectUrl.startsWith("https") ? "https" : "http";
    const vanityBaseUrl = "www.hil.ls.com";
    return `${protocol}://${vanityBaseUrl}/${qrId}`;
  };

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/qrcodes`);
        const data = await response.json();
        setQrCodes(data);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchQRCodes();
  }, []);

  const handleShowQRCode = (qrCode) => {
    setVisibleQrCodes((prevVisible) => {
      if (prevVisible[qrCode.Id]) {
        return { ...prevVisible, [qrCode.Id]: false };
      }

      const newVisible = Object.keys(prevVisible).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});

      return { ...newVisible, [qrCode.Id]: true };
    });

    setTimeout(() => {
      const qrContainer = document.getElementById(`qr-code-${qrCode.Id}`);
      if (qrContainer && !qrContainer.innerHTML) {
        qrContainer.innerHTML = "";
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
        modifyRects(qrCode.Id);
      }
    }, 100);
  };

  const modifyRects = (id) => {
    const svgElement = document.getElementById(`qr-code-${id}`);
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

  const handleDownload = async (id, qrCodeId, format = "png") => {
    setIsLoading(true); // Show the loader
    setTimeout(async () => {
      const qrContainer = document.getElementById(`qr-code-${id}`);
      const svgElement = qrContainer.querySelector("svg");
      if (!svgElement) return;

      const serializer = new XMLSerializer();
      let rawSvg = serializer.serializeToString(svgElement);
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(rawSvg, "image/svg+xml");

      const vanityUrl = generateVanityUrl(
        qrCodes.find((qr) => qr.QRCodeId === qrCodeId).RedirectUrl,
        id
      );
      const maxVisibleLength = 60;
      const clippedUrl =
        vanityUrl.length > maxVisibleLength
          ? `${vanityUrl.substring(0, maxVisibleLength)}...`
          : vanityUrl;

      if (format === "svg") {
        const svgElement = svgDoc.documentElement;
        svgElement.setAttribute("width", "250");
        svgElement.setAttribute("height", "250");

        const updatedSvg = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([updatedSvg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement("a");
        link.download = `qr-code-${id}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const image = new Image();
        const svgBlob = new Blob(
          [new XMLSerializer().serializeToString(svgDoc)],
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
          link.download = `qr-code-${id}.${format}`;
          link.href = imgData;
          link.click();
          URL.revokeObjectURL(url);
        };
        image.src = url;
      }
      setIsLoading(false); // Hide the loader
    }, 500); // Simulate 0.5 second delay for loader
  };

  useEffect(() => {
    if (qrCodes.length > 0 && isInitialLoad) {
      setTimeout(() => {
        if (lastQrRef.current) {
          lastQrRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 500);
      setIsInitialLoad(false);
    }
  }, [qrCodes, isInitialLoad]);

  useEffect(() => {
    if (topPageRef.current && !isInitialLoad) {
      topPageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  const indexOfLastQR = currentPage * qrPerPage;
  const indexOfFirstQR = indexOfLastQR - qrPerPage;
  const currentQRCodes = qrCodes.slice(indexOfFirstQR, indexOfLastQR);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div ref={topPageRef} className="container mx-auto px-4 py-6 relative">
      {/* Full-screen loader */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <FaSpinner className="text-white text-6xl animate-spin" />
        </div>
      )}
      <h2 className="text-3xl font-bold text-center mb-6">All QR Codes</h2>
      {currentQRCodes?.length > 0 &&
        currentQRCodes?.map((qrCode, index) => (
          <div
            key={qrCode.Id}
            ref={index === currentQRCodes.length - 1 ? lastQrRef : null}
            className="text-center mb-6 p-4 border border-gray-300 rounded-lg shadow-md"
          >
            <p className="font-semibold">ID: {qrCode.Id}</p>
            <p>QR Code Id: {qrCode.QRCodeId}</p>
            <p>Redirect URL: {qrCode.RedirectUrl}</p>

            <p>
              Vanity URL:{" "}
              <a
                href={qrCode.RedirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-600 underline"
              >
                {generateVanityUrl(qrCode.RedirectUrl, qrCode.QRCodeId)}
              </a>
            </p>

            <button
              onClick={() => handleShowQRCode(qrCode)}
              className="mt-4 text-2xl text-blue-500 hover:text-blue-700 focus:outline-none"
              title={
                visibleQrCodes[qrCode.Id] ? "Hide QR Code" : "Show QR Code"
              }
            >
              {visibleQrCodes[qrCode.Id] ? <FaEyeSlash /> : <FaEye />}
            </button>

            {visibleQrCodes[qrCode.Id] && (
              <>
                <div
                  id={`qr-code-${qrCode.Id}`}
                  className="mx-auto mt-4 p-0 bg-white flex items-center justify-center"
                  style={{ width: "200px", height: "200px" }}
                ></div>

                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={() =>
                      handleDownload(qrCode.Id, qrCode.QRCodeId, "png")
                    }
                    className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(qrCode.Id, qrCode.QRCodeId, "jpeg")
                    }
                    className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Download JPEG
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(qrCode.Id, qrCode.QRCodeId, "svg")
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

      {/* Pagination Controls */}
      <div className="flex justify-center flex-wrap space-x-2 mt-6">
        {Array.from({ length: Math.ceil(qrCodes.length / qrPerPage) }).map(
          (_, idx) => (
            <button
              key={idx + 1}
              onClick={() => paginate(idx + 1)}
              className={`py-2 px-4 rounded-lg ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black border border-gray-300"
              } hover:bg-blue-500 transition`}
            >
              {idx + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ListView;
