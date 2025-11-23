import React from "react";
import ReactDOM from "react-dom/client";
import { CustomUI } from ".";
import "@/assets/main.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<CustomUI />
	</React.StrictMode>,
);
