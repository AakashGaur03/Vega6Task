import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

const Home = () => {
	const [query, setQuery] = useState("");
	const [images, setImages] = useState([]);
	const [isLoading, setIsLoading] = useState(false); // Add loading state
	const [error, setError] = useState(null); // Add error state
	const navigate = useNavigate();

	// Predefined Name and Email
	const name = "Your Name"; // Replace with actual name
	const email = "your.email@example.com"; // Replace with actual email

	const fetchImages = async () => {
		if (!query.trim()) {
			setError("Please enter a search term!");
			return;
		}

		setIsLoading(true); // Start loading
		setError(null); // Clear previous errors (fixed typo: setzenError -> setError)

		try {
			const response = await axios.get(
				`https://api.unsplash.com/search/photos?query=${query}&per_page=10&client_id=jke0RrBWP5B6gV9vZGrijW5XOGCMHxJNLkn9vCvB9qo`
			);
			setImages(response.data.results);

			// Check if no results were found
			if (response.data.results.length === 0) {
				setError(`No results found for "${query}"`);
			}
		} catch (error) {
			console.error("Error fetching images:", error);
			setError("Failed to fetch images. Please try again later.");
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	const goToEditor = (imageUrl) => {
		navigate(`/editor?image=${encodeURIComponent(imageUrl)}`);
	};

	return (
		<div className="home-container">
			<h1>Search Images</h1>

			{/* Display Name and Email as static text */}
			<div className="user-info">
				<div className="info-group">
					<span className="label">Name:</span>
					<span className="value">{name}</span>
				</div>
				<div className="info-group">
					<span className="label">Email:</span>
					<span className="value">{email}</span>
				</div>
			</div>

			{/* Search Bar */}
			<div className="search-bar">
				<input
					type="text"
					placeholder="Enter your search term"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<button onClick={fetchImages} disabled={isLoading}>
					{isLoading ? "Searching..." : "Search"}
				</button>
			</div>

			{/* Error Message or Loading State */}
			{error && <div className="error-message">{error}</div>}
			{isLoading && <div className="loading-message">Loading images...</div>}

			{/* Image Grid */}
			{!isLoading && !error && images.length > 0 && (
				<div className="image-grid">
					{images.map((img) => (
						<div key={img.id} className="image-card">
							<div className="image-wrapper">
								<img src={img.urls.small} alt={img.alt_description} />
							</div>
							<button onClick={() => goToEditor(img.urls.full)}>Add Captions</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Home;
