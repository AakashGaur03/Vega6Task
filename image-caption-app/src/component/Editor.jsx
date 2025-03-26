import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fabric } from "fabric";
import "./Editor.css";

/**
 * Editor component for image manipulation using Fabric.js.
 * Allows adding text, shapes, removing objects, and downloading the edited image.
 */
const Editor = () => {
	const [searchParams] = useSearchParams();
	const canvasRef = useRef(null);
	const canvasInstanceRef = useRef(null);
	const buttonBoxRef = useRef(null); // Ref for button-box to set its height
	const [captionText, setCaptionText] = useState("");
	const [hasActiveObject, setHasActiveObject] = useState(false);
	const [isImageLoading, setIsImageLoading] = useState(true);
	// Optional: Uncomment to display layers in UI
	// const [canvasLayers, setCanvasLayers] = useState([]);

	/**
	 * Logs all canvas layers and their attributes to the console.
	 */
	const logCanvasLayers = () => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) {
			return;
		}

		const layers = [];

		// Add background image if it exists
		const bgImage = canvas.backgroundImage;
		if (bgImage) {
			layers.push({
				type: "background-image",
				url: bgImage.getSrc(),
				width: bgImage.width * bgImage.scaleX,
				height: bgImage.height * bgImage.scaleY,
				scaleX: bgImage.scaleX,
				scaleY: bgImage.scaleY,
				left: bgImage.left,
				top: bgImage.top,
			});
		}

		// Add all canvas objects (text, shapes, etc.)
		const objects = canvas.getObjects();
		objects.forEach((obj) => {
			const layer = {
				type: obj.type,
				left: obj.left,
				top: obj.top,
				angle: obj.angle,
				scaleX: obj.scaleX,
				scaleY: obj.scaleY,
			};

			// Add type-specific attributes
			switch (obj.type) {
				case "textbox":
					layer.text = obj.text;
					layer.fontSize = obj.fontSize;
					layer.fontFamily = obj.fontFamily;
					layer.fill = obj.fill;
					layer.width = obj.width;
					break;
				case "triangle":
				case "rect":
					layer.width = obj.width * obj.scaleX;
					layer.height = obj.height * obj.scaleY;
					layer.fill = obj.fill;
					break;
				case "circle":
					layer.radius = obj.radius * obj.scaleX; // Scale affects radius
					layer.fill = obj.fill;
					break;
				case "polygon":
					layer.points = obj.points.map((p) => ({ x: p.x, y: p.y }));
					layer.fill = obj.fill;
					break;
				default:
					break;
			}

			layers.push(layer);
		});

		console.log("Canvas Layers:", layers);
		// Optional: Uncomment to set state for UI display
		// setCanvasLayers(layers);
	};

	/**
	 * Effect to initialize the Fabric.js canvas and load the background image.
	 * Runs when searchParams change.
	 */
	useEffect(() => {
		// Dynamically calculate canvas dimensions based on container width
		const canvasContainer = canvasRef.current?.parentElement;
		const updateCanvasSize = () => {
			const maxWidth = 600; // Maximum width
			const containerWidth = canvasContainer?.offsetWidth || maxWidth;
			const width = Math.min(containerWidth, maxWidth); // Cap at 600px
			const height = width * (7 / 10); // Maintain ~3:2 aspect ratio (420/600 ≈ 0.7)
			return { width, height };
		};

		const { width, height } = updateCanvasSize();
		const canvas = new fabric.Canvas(canvasRef.current, {
			width, // Responsive width
			height, // Responsive height
			backgroundColor: "#f0f0f0",
			selection: true,
		});
		canvasInstanceRef.current = canvas;

		// Set the button-box height to match the canvas
		if (buttonBoxRef.current) {
			buttonBoxRef.current.style.height = `${height}px`;
		}

		// Bind selection event handlers
		canvas.on("selection:created", () => setHasActiveObject(true));
		canvas.on("selection:updated", () => setHasActiveObject(true));
		canvas.on("selection:cleared", () => setHasActiveObject(false));

		// Add event listeners for canvas changes to log layers
		canvas.on("object:added", logCanvasLayers);
		canvas.on("object:removed", logCanvasLayers);
		canvas.on("object:modified", logCanvasLayers);

		const imageUrl = searchParams.get("image");
		if (!imageUrl) {
			console.error("No image URL provided in search parameters");
			setIsImageLoading(false);
			return;
		}

		const decodedUrl = decodeURIComponent(imageUrl);
		setIsImageLoading(true);

		fabric.Image.fromURL(
			decodedUrl,
			(fabricImg) => {
				if (!fabricImg) {
					console.error("Failed to load image from URL:", decodedUrl);
					alert("Failed to load image. Please try another one.");
					setIsImageLoading(false);
					return;
				}

				const scale = Math.min(width / fabricImg.width, height / fabricImg.height);
				fabricImg.scaleToWidth(width * scale);
				fabricImg.scaleToHeight(height * scale);

				fabricImg.set({
					left: 0,
					top: 0,
					selectable: false,
					crossOrigin: "anonymous",
				});

				canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas), {
					scaleX: scale,
					scaleY: scale,
					left: 0,
					top: 0,
				});

				setIsImageLoading(false);
				logCanvasLayers(); // Log initial state after background image is set
			},
			{ crossOrigin: "anonymous" }
		);

		// Resize handler to adjust canvas and button-box on window resize
		const handleResize = () => {
			const { width, height } = updateCanvasSize();
			canvas.setDimensions({ width, height });
			if (buttonBoxRef.current) {
				buttonBoxRef.current.style.height = `${height}px`; // Sync height
			}
			const bgImage = canvas.backgroundImage;
			if (bgImage) {
				const scale = Math.min(width / bgImage.width, height / bgImage.height);
				bgImage.scaleToWidth(width * scale);
				bgImage.scaleToHeight(height * scale);
				canvas.renderAll();
			}
		};

		window.addEventListener("resize", handleResize);

		// Cleanup function
		return () => {
			window.removeEventListener("resize", handleResize);
			if (canvasInstanceRef.current) {
				canvasInstanceRef.current.dispose();
				canvasInstanceRef.current = null;
			}
		};
	}, [searchParams]);

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
		setCaptionText("");
	};

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
				return;
		}

		canvas.add(shape);
		canvas.setActiveObject(shape);
		canvas.renderAll();
	};

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

		activeObjects.forEach((object) => canvas.remove(object));
		canvas.discardActiveObject();
		canvas.renderAll();
	};

	const downloadImage = () => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) {
			console.error("Canvas instance not initialized");
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

	const handleCaptionSubmit = (e) => {
		e.preventDefault();
		addText();
	};

	return (
		<div className="editor-container">
			<h1>Image Editor</h1>
			<div className="editor-layout">
				<div className="canvas-container">
					<canvas ref={canvasRef} className="editor-canvas" />
					{isImageLoading && (
						<div className="canvas-loader">
							<div className="spinner"></div>
							<p>Loading image...</p>
						</div>
					)}
				</div>

				<div className="button-box" ref={buttonBoxRef}>
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

					<div className="button-row">
						<button onClick={() => addShape("triangle")}>Add Triangle</button>
						<button onClick={() => addShape("rectangle")}>Add Rectangle</button>
					</div>

					<div className="button-row">
						<button onClick={() => addShape("circle")}>Add Circle</button>
						<button onClick={() => addShape("polygon")}>Add Polygon</button>
					</div>

					<button onClick={removeSelected} className="remove-button" disabled={!hasActiveObject}>
						Remove Selected
					</button>
					<button onClick={logCanvasLayers} className="log-button">
						Log Canvas Layers
					</button>
					<button onClick={downloadImage} className="download-button">
						Download Image
					</button>
				</div>
			</div>
		</div>
	);
};

export default Editor;
