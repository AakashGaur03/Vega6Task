import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const Editor = () => {
	const [searchParams] = useSearchParams();
	const canvasRef = useRef(null);
	const fabricRef = useRef(null);
	const canvasInstanceRef = useRef(null); // Holds fabric.Canvas instance

	useEffect(() => {
		// Dynamically import fabric.js
		import("fabric").then((fabricModule) => {
			const fabric = fabricModule.default || fabricModule;
			fabricRef.current = fabric;

			// Prevent multiple canvas initialization
			if (canvasInstanceRef.current) {
				console.log("🧹 Disposing existing canvas instance.");
				canvasInstanceRef.current.dispose();
			}

			// Initialize canvas
			console.log("🖌️ Initializing canvas...");
			const newCanvas = new fabric.Canvas(canvasRef.current, {
				width: 600,
				height: 400,
				backgroundColor: "#fff",
			});
			canvasInstanceRef.current = newCanvas;

			// Load Image from URL
			const imageUrl = searchParams.get("image");

			if (!imageUrl) {
				console.error("❌ No image URL found in search parameters.");
				return;
			}

			const decodedUrl = decodeURIComponent(imageUrl);
			console.log("🔍 Decoded Image URL:", decodedUrl);

			fabric.Image.fromURL(
				decodedUrl,
				(img) => {
					if (!img) {
						console.error("❌ Fabric failed to load image.");
						return;
					}
					console.log("✅ Image loaded successfully.");

					img.set({ crossOrigin: "anonymous" }); // Set crossOrigin directly on the image
					img.scaleToWidth(600);
					img.scaleToHeight(400);

					canvasInstanceRef.current.setBackgroundImage(
						img,
						canvasInstanceRef.current.renderAll.bind(canvasInstanceRef.current)
					);
				},
				{
					crossOrigin: "anonymous", // Fix cross-origin issues
				}
			);
		});

		// Cleanup function
		return () => {
			if (canvasInstanceRef.current) {
				console.log("🧹 Cleaning up canvas.");
				canvasInstanceRef.current.dispose();
				canvasInstanceRef.current = null;
			}
		};
	}, [searchParams]);

	const addText = () => {
		const fabric = fabricRef.current;
		const canvas = canvasInstanceRef.current;
		if (!canvas || !fabric) return;

		const text = new fabric.Textbox("Your Caption", {
			left: 50,
			top: 50,
			fill: "#000",
			fontSize: 20,
			editable: true,
		});
		canvas.add(text);
		canvas.renderAll();
	};

	const addShape = (shapeType) => {
		const fabric = fabricRef.current;
		const canvas = canvasInstanceRef.current;
		if (!canvas || !fabric) return;

		let shape;
		switch (shapeType) {
			case "circle":
				shape = new fabric.Circle({ radius: 30, fill: "red", left: 50, top: 50 });
				break;
			case "rectangle":
				shape = new fabric.Rect({ width: 80, height: 50, fill: "blue", left: 50, top: 50 });
				break;
			case "triangle":
				shape = new fabric.Triangle({ width: 80, height: 60, fill: "green", left: 50, top: 50 });
				break;
			default:
				return;
		}
		canvas.add(shape);
		canvas.renderAll();
	};

	const downloadImage = () => {
		const canvas = canvasInstanceRef.current;
		if (!canvas) return;
		const dataURL = canvas.toDataURL({ format: "png" });
		const link = document.createElement("a");
		link.href = dataURL;
		link.download = "edited-image.png";
		link.click();
	};

	return (
		<div className="editor-container">
			<h1>Image Editor</h1>
			<canvas ref={canvasRef} className="canvas"></canvas>
			<div className="toolbar">
				<button onClick={addText}>Add Text</button>
				<button onClick={() => addShape("circle")}>Add Circle</button>
				<button onClick={() => addShape("rectangle")}>Add Rectangle</button>
				<button onClick={() => addShape("triangle")}>Add Triangle</button>
				<button onClick={downloadImage}>Download Image</button>
			</div>
		</div>
	);
};

export default Editor;
