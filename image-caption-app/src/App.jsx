import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles.css";
import Home from "./component/Home";
import Editor from "./component/Editor";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/editor" element={<Editor />} />
		</Routes>
	);
}

export default App;
