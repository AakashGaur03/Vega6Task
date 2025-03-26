import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { fabric } from "fabric";
import "./Editor.css"; // Import the CSS file

const Editor = () => {
	const [searchParams] = useSearchParams();
	const canvasRef = useRef(null);
	const canvasInstanceRef = useRef(null);

	useEffect(() => {
		// Initialize canvas
		const canvas = new fabric.Canvas(canvasRef.current, {
			width: 600,
			height: 400,
			backgroundColor: "#f0f0f0",
		});
		canvasInstanceRef.current = canvas;

		const imageUrl = searchParams.get("image");
		if (!imageUrl) {
			console.error("No image URL provided");
			return;
		}

		const decodedUrl = decodeURIComponent(imageUrl);

		// Load image using Fabric.js directly
		fabric.Image.fromURL(
			decodedUrl,
			(fabricImg) => {
				if (!fabricImg) {
					console.error("Failed to load image");
					alert("Failed to load image. Please try another one.");
					return;
				}

				// Scale image to fit canvas
				const scale = Math.min(600 / fabricImg.width, 400 / fabricImg.height);
				fabricImg.scaleToWidth(600 * scale);
				fabricImg.scaleToHeight(400 * scale);

				fabricImg.set({
					left: 0,
					top: 0,
					selectable: false,
					crossOrigin: "anonymous",
				});

				// Set as background image
				canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas), {
					scaleX: scale,
					scaleY: scale,
					left: 0,
					top: 0,
				});
			},
			{ crossOrigin: "anonymous" }
		);

		// Cleanup
		return () => {
			if (canvasInstanceRef.current) {
				canvasInstanceRef.current.dispose();
				canvasInstanceRef.current = null;
			}
		};
	}, [searchParams]);

	const addText = () => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) {
			console.error("Canvas not initialized");
			return;
		}

		const text = new fabric.Textbox("Your Caption", {
			left: 50,
			top: 50,
			width: 200,
			fontSize: 20,
			fill: "#000000",
			fontFamily: "Arial",
			editable: true,
		});
		canvas.add(text);
		canvas.setActiveObject(text);
		canvas.renderAll();
	};

	const addShape = (shapeType) => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) {
			console.error("Canvas not initialized");
			return;
		}

		let shape;
		switch (shapeType) {
			case "triangle":
				shape = new fabric.Triangle({
					width: 80,
					height: 60,
					fill: "green",
					left: 50,
					top: 50,
				});
				break;
			case "rectangle":
				shape = new fabric.Rect({
					width: 80,
					height: 50,
					fill: "blue",
					left: 50,
					top: 50,
				});
				break;
			case "circle":
				shape = new fabric.Circle({
					radius: 30,
					fill: "red",
					left: 50,
					top: 50,
				});
				break;
			case "polygon":
				shape = new fabric.Polygon(
					[
						{ x: 50, y: 50 },
						{ x: 100, y: 50 },
						{ x: 120, y: 90 },
						{ x: 80, y: 120 },
						{ x: 40, y: 90 },
					],
					{
						fill: "purple",
						left: 50,
						top: 50,
					}
				);
				break;
			default:
				return;
		}
		canvas.add(shape);
		canvas.setActiveObject(shape);
		canvas.renderAll();
	};

	const downloadImage = () => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) {
			console.error("Canvas not initialized");
			return;
		}
		const dataURL = canvas.toDataURL({
			format: "png",
			quality: 1.0,
		});
		const link = document.createElement("a");
		link.href = dataURL;
		link.download = "edited-image.png";
		link.click();
	};

	return (
		<div className="editor-container">
			<h1>Image Editor</h1>
			<div className="editor-layout">
				{/* Left Side: Canvas */}
				<div className="canvas-container">
					<canvas ref={canvasRef} className="editor-canvas" />
				</div>

				{/* Right Side: Buttons in a Box */}
				<div className="button-box">
					<button onClick={addText}>Add Caption</button>
					<button onClick={() => addShape("triangle")}>Add Triangle</button>
					<button onClick={() => addShape("rectangle")}>Add Rectangle</button>
					<button onClick={() => addShape("circle")}>Add Circle</button>
					<button onClick={() => addShape("polygon")}>Add Polygon</button>
					<button onClick={downloadImage} className="download-button">
						Download Image
					</button>
				</div>
			</div>
		</div>
	);
};

export default Editor;
