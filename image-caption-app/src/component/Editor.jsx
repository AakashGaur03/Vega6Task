import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fabric } from "fabric";
import "./Editor.css";

const Editor = () => {
	const [searchParams] = useSearchParams();
	const canvasRef = useRef(null);
	const canvasInstanceRef = useRef(null);
	const [captionText, setCaptionText] = useState(""); // State to store the caption input
	const [hasActiveObject, setHasActiveObject] = useState(false); // State to track active object(s)

	useEffect(() => {
		// Initialize canvas with multi-selection enabled
		const canvas = new fabric.Canvas(canvasRef.current, {
			width: 600,
			height: 400,
			backgroundColor: "#f0f0f0",
			selection: true, // Enable selection
		});
		canvasInstanceRef.current = canvas;

		// Update active object state when selection changes
		canvas.on("selection:created", () => setHasActiveObject(true));
		canvas.on("selection:updated", () => setHasActiveObject(true));
		canvas.on("selection:cleared", () => setHasActiveObject(false));

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

		if (!captionText.trim()) {
			alert("Please enter a caption!");
			return;
		}

		const text = new fabric.Textbox(captionText, {
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

		// Reset the input
		setCaptionText("");
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

	const removeSelected = () => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) {
			console.error("Canvas not initialized");
			return;
		}

		const activeObjects = canvas.getActiveObjects();
		if (!activeObjects || activeObjects.length === 0) {
			alert("Please select at least one object to remove!");
			return;
		}

		activeObjects.forEach((object) => {
			canvas.remove(object);
		});
		canvas.discardActiveObject(); // Clear the selection
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

	// Handle form submission for caption input (Enter key or button click)
	const handleCaptionSubmit = (e) => {
		e.preventDefault();
		addText();
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
					{/* Line 1: Caption Form */}
					<form onSubmit={handleCaptionSubmit} className="caption-form">
						<span className="caption-label">Add Caption:</span>
						<div className="caption-input-group">
							<input
								type="text"
								value={captionText}
								onChange={(e) => setCaptionText(e.target.value)}
								placeholder="Enter your caption"
								autoFocus
							/>
							<button type="submit">Add</button>
							<button
								type="button"
								onClick={() => setCaptionText("")} // Clear the input
							>
								Clear
							</button>
						</div>
					</form>

					{/* Line 2: Add Triangle and Add Rectangle */}
					<div className="button-row">
						<button onClick={() => addShape("triangle")}>Add Triangle</button>
						<button onClick={() => addShape("rectangle")}>Add Rectangle</button>
					</div>

					{/* Line 3: Add Circle and Add Polygon */}
					<div className="button-row">
						<button onClick={() => addShape("circle")}>Add Circle</button>
						<button onClick={() => addShape("polygon")}>Add Polygon</button>
					</div>

					{/* Line 4: Remove Selected */}
					<button onClick={removeSelected} className="remove-button" disabled={!hasActiveObject}>
						Remove Selected
					</button>

					{/* Line 5: Download Image */}
					<button onClick={downloadImage} className="download-button">
						Download Image
					</button>
				</div>
			</div>
		</div>
	);
};

export default Editor;
