import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const port = 8000;

function getContentType(filePath: string): string {
	const ext = filePath.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "html":
			return "text/html; charset=utf-8";
		case "css":
			return "text/css";
		case "js":
			return "application/javascript";
		case "json":
			return "application/json";
		case "png":
			return "image/png";
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "gif":
			return "image/gif";
		case "svg":
			return "image/svg+xml";
		default:
			return "text/plain";
	}
}

console.log(`🚀 JSON Data Editor Server starting on http://localhost:${port}`);

await serve(
	async (req) => {
		const url = new URL(req.url);

		// Serve static files from the static directory
		if (url.pathname.startsWith("/static/")) {
			const filePath = url.pathname.replace("/static/", "./static/");
			try {
				const fileContent = await Deno.readFile(filePath);
				const contentType = getContentType(filePath);
				return new Response(fileContent, {
					headers: {
						"content-type": contentType
					}
				});
			} catch (error) {
				console.log(`File not found: ${filePath}`);
				return new Response("File not found", { status: 404 });
			}
		}

		// Serve the main HTML page
		if (url.pathname === "/" || url.pathname === "/index.html") {
			const html = await Deno.readTextFile("./static/index.html");
			return new Response(html, {
				headers: {
					"content-type": "text/html; charset=utf-8"
				}
			});
		}

		// Handle API endpoints if needed in the future
		if (url.pathname === "/api/health") {
			return new Response(
				JSON.stringify({
					status: "ok",
					timestamp: new Date().toISOString()
				}),
				{
					headers: {
						"content-type": "application/json"
					}
				}
			);
		}

		// 404 for other routes
		return new Response("Not Found", { status: 404 });
	},
	{ port }
);
