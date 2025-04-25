import React from "react";
import ReactDOM from "react-dom/client";

function App(): React.ReactElement {
	// TODO: Rename to config UI
	return (
		<div>
			<h1>Options UI!</h1>
		</div>
	);
}

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
