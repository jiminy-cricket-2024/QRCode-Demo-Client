import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../constants/api";
import { FaSpinner, FaDownload } from "react-icons/fa"; // For loading spinner and download icon

const CreateQR = () => {
  const [id, setId] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [squareColor, setSquareColor] = useState("#0054A4");
  const [eyeColor, setEyeColor] = useState("#ED1B34");
  const [fileExt, setFileExt] = useState("png"); // Set the default value as png
  const [isGenerated, setIsGenerated] = useState(false); // State to track if QR has been generated
  const [loading, setLoading] = useState(false); // State for showing the loading spinner
  const qrCodeRef = useRef(null);
  const qrCodeInstance = useRef(null);
  const navigate = useNavigate();

  // Initialize QRCodeStyling only once when the component mounts
  useEffect(() => {
    qrCodeInstance.current = new QRCodeStyling({
      width: 200,
      height: 200,
      margin: 7,
      type: "svg",
      data: "", // Placeholder data until user submits
      dotsOptions: {
        color: squareColor,
        type: "square",
      },
      cornersSquareOptions: {
        color: squareColor,
        type: "dot",
      },
      cornersDotOptions: {
        color: eyeColor,
        type: "square",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
      },
    });
  }, [squareColor, eyeColor]);

  const modifyRects = () => {
    setTimeout(() => {
      if (qrCodeRef.current) {
        const svgElement = qrCodeRef.current.querySelector("svg");
        if (svgElement) {
          const rects = svgElement.querySelectorAll(
            "#clip-path-dot-color rect"
          );
          rects.forEach((rect) => {
            const x = parseFloat(rect.getAttribute("x"));
            const y = parseFloat(rect.getAttribute("y"));
            const width = parseFloat(rect.getAttribute("width"));
            const height = parseFloat(rect.getAttribute("height"));
            const newSize = 4; // New size for rects
            const newX = x + (width - newSize) / 2;
            const newY = y + (height - newSize) / 2;
            rect.setAttribute("width", newSize);
            rect.setAttribute("height", newSize);
            rect.setAttribute("x", newX);
            rect.setAttribute("y", newY);
          });
        }
      }
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!redirectUrl) {
      console.error("Please provide a valid redirect URL");
      return;
    }

    // Update the QR code with the current input values
    qrCodeInstance.current.update({
      data: `${baseUrl}/api/scan/${id}`,
      dotsOptions: { color: squareColor },
      cornersSquareOptions: { color: squareColor },
      cornersDotOptions: { color: eyeColor },
    });

    // Set the flag to show the preview section
    setIsGenerated(true);

    // Apply modifyRects after the QR code is updated
    modifyRects();

    // Call the API after the form is submitted
    try {
      const response = await fetch(`${baseUrl}/api/qrcodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, redirectUrl, squareColor, eyeColor }),
      });
      const data = await response.json();
      console.log(`QR code has been created`);
    } catch (err) {
      console.log("Error saving QR Code: ", err);
    }
  };

  useEffect(() => {
    if (isGenerated && qrCodeRef.current) {
      qrCodeRef.current.innerHTML = "";
      qrCodeInstance.current.append(qrCodeRef.current);
    }
  }, [isGenerated]);

  const onDownloadClick = async (id, format = "png") => {
    if (!redirectUrl) {
      console.error("Redirect URL is missing. Cannot download.");
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      try {
        const svgElement = qrCodeRef.current.querySelector("svg");
        if (!svgElement) {
          console.error("SVG element is not available in the DOM");
          setLoading(false);
          return;
        }

        const serializer = new XMLSerializer();
        const rawSvg = serializer.serializeToString(svgElement);
        const url = URL.createObjectURL(
          new Blob([rawSvg], { type: "image/svg+xml" })
        );
        const link = document.createElement("a");
        link.download = `qr-code-${id}.${format}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        setId("");
        setRedirectUrl("");
        setSquareColor("#0054A4");
        setEyeColor("#ED1B34");
        setIsGenerated(false);
      } catch (error) {
        console.error("Download error: ", error);
      } finally {
        setLoading(false);
      }
    }, 500); // 0.5-second delay
  };

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Form Section */}
      <div>
        <h2 className="text-xl font-semibold text-center mb-4">
          Create QR Code
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg"
        >
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ID"
            className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-base"
          />
          <input
            type="text"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            placeholder="Redirect URL"
            className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-base"
          />
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Square Color
              </label>
              <input
                type="color"
                value={squareColor}
                onChange={(e) => setSquareColor(e.target.value)}
                className="mt-1 block w-full h-8 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Eye Color
              </label>
              <input
                type="color"
                value={eyeColor}
                onChange={(e) => setEyeColor(e.target.value)}
                className="mt-1 block w-full h-8 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base"
          >
            Generate QR Code
          </button>
        </form>
      </div>

      {/* Preview Section */}
      {isGenerated && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-center text-black mb-4">
            QR Code Preview
          </h2>
          <div className="flex justify-between items-center mb-2 w-full">
            <select
              onChange={(e) => setFileExt(e.target.value)}
              value={fileExt} // "png" is already the default state in useState
              className="border border-gray-300 p-2 rounded-lg text-base text-black"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WEBP</option>
              <option value="svg">SVG</option>
            </select>
            <button
              onClick={() => onDownloadClick(id, fileExt)}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-purple-700 transition flex items-center justify-center"
            >
              <FaDownload />
            </button>
          </div>
          <div
            ref={qrCodeRef}
            className="border-2 border-gray-300  bg-gray-100 rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FaSpinner className="text-white text-6xl animate-spin" />
        </div>
      )}
    </div>
  );
};

export default CreateQR;
