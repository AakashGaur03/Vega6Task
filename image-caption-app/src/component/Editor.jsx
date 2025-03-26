import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fabric } from "fabric";
import "./Editor.css";

/**
 * Editor component for image manipulation using Fabric.js.
 * Allows adding text, shapes, removing objects, and downloading the edited image.
 */
const Editor = () => {
	// Retrieve URL search parameters (e.g., ?image=URL) from react-router-dom
	const [searchParams] = useSearchParams();

	// Reference to the canvas DOM element
	const canvasRef = useRef(null);

	// Reference to the Fabric.js canvas instance
	const canvasInstanceRef = useRef(null);

	// State for managing caption text input
	const [captionText, setCaptionText] = useState("");

	// State to track if an object is currently selected on the canvas
	const [hasActiveObject, setHasActiveObject] = useState(false);

	// State to indicate if the background image is loading
	const [isImageLoading, setIsImageLoading] = useState(true);

	/**
	 * Effect to initialize the Fabric.js canvas and load the background image.
	 * Runs when searchParams change.
	 */
	useEffect(() => {
		// Initialize Fabric.js canvas with predefined dimensions and settings
		const canvas = new fabric.Canvas(canvasRef.current, {
			width: 600, // Fixed canvas width
			height: 420, // Fixed canvas height (3:2 aspect ratio)
			backgroundColor: "#f0f0f0", // Light gray background color
			selection: true, // Enable object selection
		});
		canvasInstanceRef.current = canvas;

		// Bind selection event handlers
		canvas.on("selection:created", () => setHasActiveObject(true));
		canvas.on("selection:updated", () => setHasActiveObject(true));
		canvas.on("selection:cleared", () => setHasActiveObject(false));

		// Extract image URL from search parameters
		const imageUrl = searchParams.get("image");
		if (!imageUrl) {
			console.error("No image URL provided in search parameters");
			setIsImageLoading(false);
			return;
		}

		// Decode URL to handle encoded characters
		const decodedUrl = decodeURIComponent(imageUrl);

		// Set loading state to true while fetching the image
		setIsImageLoading(true);

		// Load image and set it as the canvas background
		fabric.Image.fromURL(
			decodedUrl,
			(fabricImg) => {
				if (!fabricImg) {
					console.error("Failed to load image from URL:", decodedUrl);
					alert("Failed to load image. Please try another one.");
					setIsImageLoading(false);
					return;
				}

				// Calculate scale to fit image within canvas dimensions
				const scale = Math.min(600 / fabricImg.width, 400 / fabricImg.height);
				fabricImg.scaleToWidth(600 * scale);
				fabricImg.scaleToHeight(400 * scale);

				// Configure image properties
				fabricImg.set({
					left: 0, // Align to top-left
					top: 0,
					selectable: false, // Prevent background image from being selected
					crossOrigin: "anonymous", // Support cross-origin images
				});

				// Set image as canvas background and render
				canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas), {
					scaleX: scale,
					scaleY: scale,
					left: 0,
					top: 0,
				});

				// Update loading state once image is loaded
				setIsImageLoading(false);
			},
			{ crossOrigin: "anonymous" } // Cross-origin configuration
		);

		// Cleanup function to dispose of canvas instance
		return () => {
			if (canvasInstanceRef.current) {
				canvasInstanceRef.current.dispose();
				canvasInstanceRef.current = null;
			}
		};
	}, [searchParams]);

	/**
	 * Adds a textbox with the current caption text to the canvas.
	 */
	const addText = () => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) {
			console.error("Canvas instance not initialized");
			return;
		}

		if (!captionText.trim()) {
			alert("Please enter a caption!");
			return;
		}

		// Create a new textbox object
		const text = new fabric.Textbox(captionText, {
			left: 50, // Initial x-position
			top: 50, // Initial y-position
			width: 200, // Fixed width
			fontSize: 20, // Text size
			fill: "#000000", // Black color
			fontFamily: "Arial", // Font family
			editable: true, // Allow in-place editing
		});

		canvas.add(text); // Add textbox to canvas
		canvas.setActiveObject(text); // Set as active object
		canvas.renderAll(); // Render changes
		setCaptionText(""); // Reset input field
	};

	/**
	 * Adds a shape to the canvas based on the specified type.
	 * @param {string} shapeType - Type of shape to add ("triangle", "rectangle", "circle", "polygon")
	 */
	const addShape = (shapeType) => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) {
			console.error("Canvas instance not initialized");
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
				return; // Exit if shapeType is invalid
		}

		canvas.add(shape); // Add shape to canvas
		canvas.setActiveObject(shape); // Set as active object
		canvas.renderAll(); // Render changes
	};

	/**
	 * Removes all currently selected objects from the canvas.
	 */
	const removeSelected = () => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) {
			console.error("Canvas instance not initialized");
			return;
		}

		const activeObjects = canvas.getActiveObjects();
		if (!activeObjects || activeObjects.length === 0) {
			alert("Please select at least one object to remove!");
			return;
		}

		activeObjects.forEach((object) => canvas.remove(object)); // Remove each selected object
		canvas.discardActiveObject(); // Clear selection
		canvas.renderAll(); // Render changes
	};

	/**
	 * Downloads the current canvas content as a PNG image.
	 */
	const downloadImage = () => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) {
			console.error("Canvas instance not initialized");
			return;
		}

		// Convert canvas to data URL
		const dataURL = canvas.toDataURL({
			format: "png",
			quality: 1.0, // Maximum quality
		});

		// Create and trigger download link
		const link = document.createElement("a");
		link.href = dataURL;
		link.download = "edited-image.png";
		link.click();
	};

	/**
	 * Handles form submission to add caption text.
	 * @param {Event} e - Form submission event
	 */
	const handleCaptionSubmit = (e) => {
		e.preventDefault(); // Prevent page refresh
		addText(); // Call addText function
	};

	// Render the editor UI
	return (
		<div className="editor-container">
			<h1>Image Editor</h1>
			<div className="editor-layout">
				{/* Canvas container with loading overlay */}
				<div className="canvas-container">
					<canvas ref={canvasRef} className="editor-canvas" />
					{isImageLoading && (
						<div className="canvas-loader">
							<div className="spinner"></div>
							<p>Loading image...</p>
						</div>
					)}
				</div>

				{/* Control panel for editing options */}
				<div className="button-box">
					{/* Form for adding captions */}
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
							<button type="submit" disabled={!captionText.trim()} className="add-button">
								Add
							</button>
							<button type="button" onClick={() => setCaptionText("")}>
								Clear
							</button>
						</div>
					</form>

					{/* Shape buttons: Triangle and Rectangle */}
					<div className="button-row">
						<button onClick={() => addShape("triangle")}>Add Triangle</button>
						<button onClick={() => addShape("rectangle")}>Add Rectangle</button>
					</div>

					{/* Shape buttons: Circle and Polygon */}
					<div className="button-row">
						<button onClick={() => addShape("circle")}>Add Circle</button>
						<button onClick={() => addShape("polygon")}>Add Polygon</button>
					</div>

					{/* Button to remove selected objects */}
					<button onClick={removeSelected} className="remove-button" disabled={!hasActiveObject}>
						Remove Selected
					</button>

					{/* Button to download the edited image */}
					<button onClick={downloadImage} className="download-button">
						Download Image
					</button>
				</div>
			</div>
		</div>
	);
};

export default Editor;
