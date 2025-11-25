import React from "react";
import ReactDOM from "react-dom/client";
import { CustomUI } from ".";
import "@/assets/main.css";
import { TooltipProvider } from "@/components/ui/tooltip";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<TooltipProvider>
			<CustomUI />
		</TooltipProvider>
	</React.StrictMode>,
);
