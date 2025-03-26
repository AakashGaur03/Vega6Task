import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { fabric } from "fabric";

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
			case "circle":
				shape = new fabric.Circle({
					radius: 30,
					fill: "red",
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
			case "triangle":
				shape = new fabric.Triangle({
					width: 80,
					height: 60,
					fill: "green",
					left: 50,
					top: 50,
				});
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
		<div style={{ padding: "20px" }}>
			<h1>Image Editor</h1>
			<div style={{ marginBottom: "20px" }}>
				<canvas ref={canvasRef} style={{ border: "1px solid #ccc" }} />
			</div>
			<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
				<button onClick={addText} style={{ padding: "8px 16px", cursor: "pointer" }}>
					Add Text
				</button>
				<button onClick={() => addShape("circle")} style={{ padding: "8px 16px", cursor: "pointer" }}>
					Add Circle
				</button>
				<button onClick={() => addShape("rectangle")} style={{ padding: "8px 16px", cursor: "pointer" }}>
					Add Rectangle
				</button>
				<button onClick={() => addShape("triangle")} style={{ padding: "8px 16px", cursor: "pointer" }}>
					Add Triangle
				</button>
				<button onClick={downloadImage} style={{ padding: "8px 16px", cursor: "pointer" }}>
					Download
				</button>
			</div>
		</div>
	);
};

export default Editor;
