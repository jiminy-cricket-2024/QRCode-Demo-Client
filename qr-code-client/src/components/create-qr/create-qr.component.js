import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import "./create-qr.scss";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../constants/api";

const CreateQR = () => {
  const [id, setId] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [squareColor, setSquareColor] = useState("#000000");
  const [eyeColor, setEyeColor] = useState("#000000");
  const [qrCode, setQrCode] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await fetch(`${baseUrl}/api/qrcodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, redirectUrl, squareColor, eyeColor }),
      });
      const data = await response.json();
      setQrCode(true);
    }catch(err){
      console.log('Error saving QR Code: ',err)
    }
  };

  return (
    <div className="create-wrapper">
      <h2>Create QR Code</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="ID"
        />
        <input
          type="text"
          value={redirectUrl}
          onChange={(e) => setRedirectUrl(e.target.value)}
          placeholder="Redirect URL"
        />
        <input
          type="color"
          value={squareColor}
          onChange={(e) => setSquareColor(e.target.value)}
        />
        <input
          type="color"
          value={eyeColor}
          onChange={(e) => setEyeColor(e.target.value)}
        />
        <button type="submit">Generate QR Code</button>
      </form>
      <br />
      <button
        onClick={() => {
          navigate("/list");
        }}
      >
        View All
      </button>
      <br />
      {qrCode && (
        <qr-code
        contents={redirectUrl}
        module-color={squareColor}
        position-ring-color={eyeColor}
        position-center-color={eyeColor}
        style={{

          width: '200px',
          height: '200px',
          margin: '2em auto',
          backgroundColor: '#fff'
        }}
        
      >
      </qr-code>
      )}
      <div id='qrcode'></div>
      

    </div>
  );
};

export default CreateQR;
