# Image Caption App

## 🛠️ Setup Instructions

Follow these steps to set up and run the project locally:

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/) (Comes with Node.js)
- [Unsplash API Access Key](https://unsplash.com/developers) (Required for fetching images)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/AakashGaur03/Vega6Task.git
   ```

2. Navigate to the project directory:

   ```sh
   cd image-caption-app
   ```

3. Install dependencies:

   ```sh
   npm install
   ```

4. Set up environment variables:

   Create a `.env` file in the root directory and add your **Unsplash API Access Key**:

   ```sh
   VITE_USER_NAME=name
   VITE_USER_EMAIL=email
   VITE_UNSPLASH_API_URL=unsplash_url
   VITE_UNSPLASH_ACCESS_KEY=your_unsplash_api_key
   ```

5. Start the development server:

   ```sh
   npm run dev
   ```

6. Open your browser and visit:

   ```
   http://localhost:5173
   ```

### Build for Production

To create an optimized production build:

```sh
npm run build
```

This will generate the output in the `dist/` folder.

### Preview Production Build

To preview the production build locally:

```sh
npm run preview
```

## 🎨 Functionalities

### Home Page

- Enter a search query to fetch images via an API call.
- If no image is found, a message is displayed.
- Clicking on "Add Caption" redirects to the editor.
- A loader appears until the image is fully loaded.

### Editor Page

- The canvas loads the selected image from the URL.
- Users can add a caption to the image.
- The "Add" button is enabled only when text is present.
- Options to add the following shapes:
  - Triangle
  - Circle
  - Rectangle
  - Polygon
- Each shape and text are **resizable and draggable**.
- A **Remove button** is available to delete single or multiple texts or shapes.
- **Log Canvas Layer Feature**:
  - Logs all canvas layers and their attributes (image, shapes, text) in an array format for debugging and transparency.
- A **Download button** to download the canvas with the edited image, text, or any created shapes.

### Responsiveness

- The app is fully responsive.
- Ensure to refresh the page when testing responsiveness for accurate results.

## 🔗 Live Demo

## Check out the live application: [Vega6 Task](https://vega6-task.vercel.app/)
