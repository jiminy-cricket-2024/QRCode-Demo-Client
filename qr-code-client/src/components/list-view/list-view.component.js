import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import axios from "axios";
import { baseUrl, clientUrl } from "../../constants/api";

let localUrl = "http://localhost:5000/api/scan/5";
let prodUrl = "https://qr-code-generator-v2-api.vercel.app/api/scan/5";

const ListView = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [qrScans, setQrScans] = useState([]);

  useEffect(() => {
    const fetchQRCodes = async () => {
      try{
        const response = await fetch(`${baseUrl}/api/qrcodes`);
        const data = await response.json();
        setQrCodes(data);
      }catch(error){
        console.log('Error fetching data:', error)
      }
    };
    fetchQRCodes();
    const fetchQRScans = async () => {
      try{
        const response = await fetch(`${baseUrl}/api/qrscans`);
        const data = await response.json();
        setQrScans(data);
      }catch(error){
        console.log('Error fetching scans:', error)
      }
    };
    fetchQRCodes();
    fetchQRScans();
  }, []);

  return (
    <div>
      <h2>All QR Codes</h2>
      {qrCodes?.length > 0 && qrCodes?.map((qrCode) => (
        <div key={qrCode.Id}>
          
           <qr-code
        contents={`${clientUrl}/track/${qrCode.Id}`}
        module-color={qrCode.SquareColor}
        position-ring-color={qrCode.EyeColor}
        position-center-color={qrCode.EyeColor}
        style={{

          width: '200px',
          height: '200px',
          margin: '2em auto',
          backgroundColor: '#fff'
        }}
        
      >
      </qr-code>
          <p>ID: {qrCode.Id}</p>
          <p>QR Code Id: {qrCode.QRCodeId}</p>
          <p>Redirect URL: {qrCode.RedirectUrl}</p>
          {qrScans.length > 0 && (
            <>
              <hr />
              <div>
                {qrScans?.map((x) =>
                  x.QRCodeId == qrCode.Id ? (
                    <div>
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
