import React from "react";
import ReactDOM from "react-dom/client";

function App(): React.ReactElement {
	return (
		<div>
			<h1>Config UI!</h1>
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
