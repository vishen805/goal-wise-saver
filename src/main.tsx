import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { syncFromSqlServer } from '@/lib/storage';

const renderApp = () => {
	createRoot(document.getElementById("root")!).render(<App />);
};

// Try to sync from local SQL server (Node server must be running at http://localhost:4000)
(async () => {
	try {
		// Non-blocking: attempt sync but don't prevent app from rendering if it takes long
		const syncPromise = syncFromSqlServer('http://localhost:4000');
		// render immediately
		renderApp();
		// log result later
		const ok = await syncPromise;
		if (ok) console.info('Synced data from SQL server');
	} catch (e) {
		renderApp();
	}
})();
