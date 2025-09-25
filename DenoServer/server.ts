import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { extname } from "https://deno.land/std@0.208.0/path/mod.ts";

const PORT = 8000;

async function handleRequest(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const path = url.pathname;

	// Serve static files
	if (path === "/" || path === "/index.html") {
		const file = await Deno.readFile("./index.html");
		return new Response(file, {
			headers: { "Content-Type": "text/html" },
		});
	}

	if (path === "/style.css") {
		const file = await Deno.readFile("./style.css");
		return new Response(file, {
			headers: { "Content-Type": "text/css" },
		});
	}

	if (path === "/script.js") {
		const file = await Deno.readFile("./script.js");
		return new Response(file, {
			headers: { "Content-Type": "application/javascript" },
		});
	}

	// Handle CSV download endpoint
	if (path === "/download-csv" && request.method === "POST") {
		try {
			const { csvData, filename } = await request.json();
			const headers = new Headers({
				"Content-Type": "text/csv",
				"Content-Disposition": `attachment; filename="${
					filename || "export.csv"
				}"`,
			});
			return new Response(csvData, { headers });
		} catch (error) {
			return new Response("Error generating CSV", { status: 500 });
		}
	}

	// Handle JSON download endpoint
	if (path === "/download-json" && request.method === "POST") {
		try {
			const { jsonData, filename } = await request.json();
			const headers = new Headers({
				"Content-Type": "application/json",
				"Content-Disposition": `attachment; filename="${
					filename || "export.json"
				}"`,
			});
			return new Response(JSON.stringify(jsonData, null, 2), { headers });
		} catch (error) {
			return new Response("Error generating JSON", { status: 500 });
		}
	}

	return new Response("Not Found", { status: 404 });
}

console.log(`Server running at http://localhost:${PORT}`);
serve(handleRequest, { port: PORT });
