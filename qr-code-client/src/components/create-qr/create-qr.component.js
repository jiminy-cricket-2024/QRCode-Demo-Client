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
            type: "svg",
            data: "", // Placeholder data until user submits
            dotsOptions: {
                color: squareColor,
                type: "square", // Dots initially, will replace them later
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

        // Function to modify only the rectangles under the element with ID 'clip-path-dot-color'
        const modifyRects = () => {
            const svgElement = qrCodeRef.current.querySelector("svg");

            if (svgElement) {
                // Select all <rect> elements that are inside the clip-path with id 'clip-path-dot-color'
                const rects = svgElement.querySelectorAll("#clip-path-dot-color rect");

                rects.forEach((rect) => {
                    const x = parseFloat(rect.getAttribute("x"));
                    const y = parseFloat(rect.getAttribute("y"));
                    const width = parseFloat(rect.getAttribute("width"));
                    const height = parseFloat(rect.getAttribute("height"));

                    // Reduce the size of the rect to create spacing
                    const newSize = 7; // Set new smaller size for the rects

                    // Update the x and y attributes to keep the rect centered
                    const newX = x + (width - newSize) / 2;
                    const newY = y + (height - newSize) / 2;

                    // Set new attributes for the smaller rects
                    rect.setAttribute("width", newSize);
                    rect.setAttribute("height", newSize);
                    rect.setAttribute("x", newX);
                    rect.setAttribute("y", newY);
                });
            }
        };

        // Run the function to modify the rects after the QR code is appended
        modifyRects();

    }, [squareColor, eyeColor]); // Re-run whenever the colors are updated

    // Handle form submission to update the QR code and call the API
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Update the QR code with the current input values
        qrCodeInstance.current.update({
            data: redirectUrl,
            dotsOptions: { color: squareColor },
            cornersSquareOptions: {
                color: squareColor,
                type: "dots", // This will make the corners visually smaller and appear padded
            },
            cornersDotOptions: { color: eyeColor },
        });

        // After updating the QR code, modify the circles into rects again
        const svgElement = qrCodeRef.current.querySelector("svg");
        if (svgElement) {
            // Select all <rect> elements that are inside the clip-path with id 'clip-path-dot-color'
            const rects = svgElement.querySelectorAll("#clip-path-dot-color rect");

            rects.forEach((rect) => {
                const x = parseFloat(rect.getAttribute("x"));
                const y = parseFloat(rect.getAttribute("y"));
                const width = parseFloat(rect.getAttribute("width"));
                const height = parseFloat(rect.getAttribute("height"));

                // Reduce the size of the rect to create spacing
                const newSize = 7; // Set new smaller size for the rects

                // Update the x and y attributes to keep the rect centered
                const newX = x + (width - newSize) / 2;
                const newY = y + (height - newSize) / 2;

                // Set new attributes for the smaller rects
                rect.setAttribute("width", newSize);
                rect.setAttribute("height", newSize);
                rect.setAttribute("x", newX);
                rect.setAttribute("y", newY);
            });
        }

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
