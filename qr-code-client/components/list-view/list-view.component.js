import React, { useEffect, useState, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { baseUrl, clientUrl } from "../../constants/api";

const ListView = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [qrScans, setQrScans] = useState([]);
  const qrRefs = useRef({});
  const qrInstances = useRef({}); // Store QRCodeStyling instances

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

    const fetchQRScans = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/qrscans`);
        const data = await response.json();
        setQrScans(data);
      } catch (error) {
        console.log("Error fetching scans:", error);
      }
    };

    fetchQRCodes();
    fetchQRScans();
  }, []);

  // Initialize QRCodeStyling instances for each QR code
  useEffect(() => {
    if (qrCodes?.length > 0) {
      qrCodes.forEach((qrCode) => {
        if (qrRefs.current[qrCode.Id]) {
          qrInstances.current[qrCode.Id] = new QRCodeStyling({
            width: 200,
            height: 200,
            margin: 7,
            data: `${clientUrl}/track/${qrCode.Id}`,
            dotsOptions: {
              color: qrCode.SquareColor || "#000000",
              type: "dots",
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
              color: "#ffffff", // White background
            },
            imageOptions: {
              crossOrigin: "anonymous",
              margin: 10,
            },
          });

          qrInstances.current[qrCode.Id].append(qrRefs.current[qrCode.Id]);
        }
      });
    }
  }, [qrCodes]);

  // Handle download click for each QR code
  const handleDownload = (id, format = "png") => {
    if (qrInstances.current[id]) {
      qrInstances.current[id].download({ extension: format });
    }
  };

  return (
      <div>
        <h2>All QR Codes</h2>
        {qrCodes?.length > 0 &&
            qrCodes?.map((qrCode) => (
                <div key={qrCode.Id} style={{ textAlign: "center", margin: "2em 0" }}>
                  {/* QR Code display */}
                  <div
                      ref={(el) => (qrRefs.current[qrCode.Id] = el)}
                      style={{
                        width: "200px",
                        height: "200px",
                        margin: "2em auto",
                        backgroundColor: "#fff",
                      }}
                  />
                  <p>ID: {qrCode.Id}</p>
                  <p>QR Code Id: {qrCode.QRCodeId}</p>
                  <p>Redirect URL: {qrCode.RedirectUrl}</p>

                  {/* Download options */}
                  <div style={{ marginTop: "10px" }}>
                    <button onClick={() => handleDownload(qrCode.Id, "png")}>
                      Download PNG
                    </button>
                    <button onClick={() => handleDownload(qrCode.Id, "jpeg")}>
                      Download JPEG
                    </button>
                    <button onClick={() => handleDownload(qrCode.Id, "svg")}>
                      Download SVG
                    </button>
                  </div>

                  {qrScans.length > 0 && (
                      <>
                        <hr />
                        <div>
                          {qrScans?.map((x) =>
                              x.QRCodeId == qrCode.Id ? (
                                  <div key={x.ScanDateTime}>
                                    <div>
                                      Country: {x.Country}, {x.City}
                                    </div>
                                    <div>Timestamp: {x.ScanDateTime}</div>
                                    <div>MacAddress: {x.MacAddress}</div>
                                    <div>Agent: {x.DeviceDetails}</div>
                                  </div>
                              ) : null
                          )}
                        </div>
                      </>
                  )}
                  <hr />
                </div>
            ))}
      </div>
  );
};

export default ListView;
