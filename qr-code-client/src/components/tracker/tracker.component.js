import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { baseUrl, clientUrl } from "../../constants/api";

const Tracker = () => {
  const [currentQr, setCurrentQr] = useState();
  const params = useParams();
  const navigate = useNavigate();
  useEffect(() => {

    const fetchQRCodes = async () => {
      const response = await fetch(`${baseUrl}/api/qrcodes`);
      const data = await response.json();
      let currentQr_ = data?.find((x) => x.Id == params?.id);
      setCurrentQr(currentQr_);
      axios
        .post(`${baseUrl}/api/scan/${params?.id}`)
        .then((result) => {
          console.log("result", result, window.location, currentQr_, data);
          window.open(`https://${currentQr_.RedirectUrl}`);
        })
        .catch((err) => {
          console.log("error", err);
        });
    };
    fetchQRCodes();
  }, []);
  return (
    <div>
      {currentQr && (
        <div key={currentQr?.Id}>
          
          <qr-code
        contents={`${clientUrl}/track/${currentQr?.Id}`}
        module-color={currentQr.SquareColor}
        position-ring-color={currentQr.EyeColor}
        position-center-color={currentQr.EyeColor}
        style={{

          width: '200px',
          height: '200px',
          margin: '2em auto',
          backgroundColor: '#fff'
        }}
        
      >
      </qr-code>
          <p>ID: {currentQr.Id}</p>
          <p>Redirecting to {currentQr.RedirectUrl}</p>
          <hr />
        </div>
      )}
    </div>
  );
};

export default Tracker;
