import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import "./create-qr.scss";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../constants/api";

const CreateQR = () => {
    const [id, setId] = useState("");
    const [redirectUrl, setRedirectUrl] = useState("");
    const [squareColor, setSquareColor] = useState("#0054A4");
    const [eyeColor, setEyeColor] = useState("#ED1B34");
    const [fileExt, setFileExt] = useState("png");
    const qrCodeRef = useRef(null);
    const qrCodeInstance = useRef(null); // Store QRCodeStyling instance
    const navigate = useNavigate();

    // Initialize QRCodeStyling only once when the component mounts
    useEffect(() => {
        qrCodeInstance.current = new QRCodeStyling({
            width: 300,
            height: 300,
            margin: 7,
            data: "https://qr-code-styling.com", // Placeholder data until user submits
            dotsOptions: {
                color: squareColor,
                type: "dots",
            },
            cornersSquareOptions: {
                color: squareColor,
                type: "dot", // Change type to create more space visually
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
        qrCodeInstance.current.append(qrCodeRef.current);
    }, []); // Initialize only once

    // Handle form submission to update the QR code and call the API
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Update the QR code with the current input values
        qrCodeInstance.current.update({
            data: redirectUrl,
            dotsOptions: { color: squareColor },
            cornersSquareOptions: {
                color: squareColor,
                type: "extra-rounded", // This will make the corners visually smaller and appear padded
            },
            cornersDotOptions: { color: eyeColor },
        });

        // Call the API after the form is submitted
        try {
            const response = await fetch(`${baseUrl}/api/qrcodes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, redirectUrl, squareColor, eyeColor }),
            });
            const data = await response.json();
            setRedirectUrl(data.redirectUrl); // Set the URL returned from the server, if necessary
        } catch (err) {
            console.log("Error saving QR Code: ", err);
        }
    };

    // Handle download click for exporting the QR code in the selected format
    const onDownloadClick = () => {
        if (qrCodeInstance.current) {
            qrCodeInstance.current.download({ extension: fileExt });
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
                    title="Change Square Color"
                />
                <input
                    type="color"
                    value={eyeColor}
                    onChange={(e) => setEyeColor(e.target.value)}
                    title="Change Eye Color"
                />
                <button type="submit">Generate QR Code</button>
            </form>
            <br />
            <button onClick={() => navigate("/list")}>View All</button>
            <br />
            <div style={{ position: "relative", display: "inline-block" }}>
                <div ref={qrCodeRef} />
            </div>
            <div style={{ marginTop: "20px" }}>
                <select onChange={(e) => setFileExt(e.target.value)} value={fileExt}>
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WEBP</option>
                    <option value="svg">SVG</option>
                </select>
                <button onClick={onDownloadClick}>Download QR Code</button>
            </div>
        </div>
    );
};

export default CreateQR;
