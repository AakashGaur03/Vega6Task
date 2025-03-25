import axios from "axios";

const UNSPLASH_ACCESS_KEY = "YOUR_ACCESS_KEY"; // Replace with your actual Unsplash Access Key
const BASE_URL = "https://api.unsplash.com";

// Function to search photos
export const searchPhotos = async (query, page = 1, perPage = 10) => {
	try {
		const response = await axios.get(`${BASE_URL}/search/photos`, {
			params: { query, page, per_page: perPage },
			headers: {
				Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
			},
		});
		return response.data.results; // Return the photos array
	} catch (error) {
		console.error("Error fetching photos from Unsplash:", error);
		return [];
	}
};
