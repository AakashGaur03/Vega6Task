import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fabric } from "fabric";
import "./Editor.css";

const Editor = () => {
	const [searchParams] = useSearchParams();
	const canvasRef = useRef(null);
	const canvasInstanceRef = useRef(null);
	const [captionText, setCaptionText] = useState("");
	const [hasActiveObject, setHasActiveObject] = useState(false);
	const [isImageLoading, setIsImageLoading] = useState(true); // Add loading state for image

	useEffect(() => {
		const canvas = new fabric.Canvas(canvasRef.current, {
			width: 600,
			height: 400,
			backgroundColor: "#f0f0f0",
			selection: true,
		});
		canvasInstanceRef.current = canvas;

		canvas.on("selection:created", () => setHasActiveObject(true));
		canvas.on("selection:updated", () => setHasActiveObject(true));
		canvas.on("selection:cleared", () => setHasActiveObject(false));

		const imageUrl = searchParams.get("image");
		if (!imageUrl) {
			console.error("No image URL provided");
			setIsImageLoading(false); // Stop loading if no URL
			return;
		}

		const decodedUrl = decodeURIComponent(imageUrl);

		setIsImageLoading(true); // Start loading
		fabric.Image.fromURL(
			decodedUrl,
			(fabricImg) => {
				if (!fabricImg) {
					console.error("Failed to load image");
					alert("Failed to load image. Please try another one.");
					setIsImageLoading(false);
					return;
				}

				const scale = Math.min(600 / fabricImg.width, 400 / fabricImg.height);
				fabricImg.scaleToWidth(600 * scale);
				fabricImg.scaleToHeight(400 * scale);

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

				setIsImageLoading(false); // Stop loading once image is loaded
			},
			{ crossOrigin: "anonymous" }
		);

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
		canvas.discardActiveObject();
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

				<div className="button-box">
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

					<button onClick={downloadImage} className="download-button">
						Download Image
					</button>
				</div>
			</div>
		</div>
	);
};

export default Editor;
