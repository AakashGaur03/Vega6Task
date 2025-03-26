import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

// Home component: Displays a search interface for Unsplash images and user info
const Home = () => {
	// State for managing search query, image results, loading status, and errors
	const [query, setQuery] = useState(""); // User's search input
	const [images, setImages] = useState([]); // Array of fetched image data
	const [isLoading, setIsLoading] = useState(false); // Loading state for API requests
	const [error, setError] = useState(null); // Error message for failed requests or empty input
	const navigate = useNavigate(); // Hook for programmatic navigation

	// Static user info (replace with dynamic data in a real app)
	const name = "Your Name";
	const email = "your.email@example.com";

	// Fetches images from Unsplash API based on the search query
	const fetchImages = async () => {
		if (!query.trim()) {
			setError("Please enter a search term!");
			return;
		}

		setIsLoading(true); // Indicate loading has started
		setError(null); // Clear previous errors

		try {
			// Make API request to Unsplash with query and API key
			const response = await axios.get(
				`https://api.unsplash.com/search/photos?query=${query}&per_page=10&client_id=jke0RrBWP5B6gV9vZGrijW5XOGCMHxJNLkn9vCvB9qo`
			);
			setImages(response.data.results); // Store fetched images

			// Handle case where no images are found
			if (response.data.results.length === 0) {
				setError(`No results found for "${query}"`);
			}
		} catch (error) {
			console.error("Error fetching images:", error); // Log error for debugging
			setError("Failed to fetch images. Please try again later.");
		} finally {
			setIsLoading(false); // Reset loading state
		}
	};

	// Navigates to the editor page with the selected image URL
	const goToEditor = (imageUrl) => {
		navigate(`/editor?image=${encodeURIComponent(imageUrl)}`);
	};

	// Handles form submission to trigger image search
	const handleSubmit = (e) => {
		e.preventDefault(); // Prevent page reload
		fetchImages();
	};

	// Render the UI with search bar, user info, and image grid
	return (
		<div className="home-container">
			<h1>Search Images</h1>

			{/* User info display */}
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

			{/* Search form */}
			<form className="search-bar" onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Enter your search term"
					value={query}
					onChange={(e) => setQuery(e.target.value)} // Update query state on input change
				/>
				<button type="submit" disabled={isLoading}>
					{isLoading ? "Searching..." : "Search"} {/* Dynamic button text */}
				</button>
			</form>

			{/* Display error or loading messages */}
			{error && <div className="error-message">{error}</div>}
			{isLoading && <div className="loading-message">Loading images...</div>}

			{/* Render image grid if results exist */}
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
