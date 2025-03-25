import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
	const [query, setQuery] = useState("");
	const [images, setImages] = useState([]);
	const navigate = useNavigate();

	const fetchImages = async () => {
		if (!query.trim()) return alert("Enter a search term!");

		try {
			const response = await axios.get(
				`https://api.unsplash.com/search/photos?query=${query}&per_page=10&client_id=jke0RrBWP5B6gV9vZGrijW5XOGCMHxJNLkn9vCvB9qo`
			);
			setImages(response.data.results);
		} catch (error) {
			console.error("Error fetching images:", error);
			alert("Failed to fetch images");
		}
	};

	const goToEditor = (imageUrl) => {
		navigate(`/editor?image=${encodeURIComponent(imageUrl)}`);
	};

	return (
		<div className="home-container">
			<h1>Search Images</h1>
			<div className="search-bar">
				<input
					type="text"
					placeholder="Search for images..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<button onClick={fetchImages}>Search</button>
			</div>

			<div className="image-grid">
				{images.map((img) => (
					<div key={img.id} className="image-card">
						<img src={img.urls.small} alt={img.alt_description} />
						<button onClick={() => goToEditor(img.urls.full)}>Add Captions</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default Home;
