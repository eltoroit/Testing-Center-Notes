/**
 * Main Application Entry Point
 * Orchestrates all modules and provides global app instance
 */

import { StateManager } from "./modules/StateManager.js";
import { APP_CONFIG } from "./utils/constants.js";
import { logger, LOG_LEVELS } from "./utils/Logger.js";

// Global app instance
let app;

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
	try {
		// Initialize logger
		logger.setEnabled(APP_CONFIG.LOGGING.ENABLED);
		logger.setLevel(LOG_LEVELS[APP_CONFIG.LOGGING.DEFAULT_LEVEL]);
		logger.info("Application starting", {
			name: APP_CONFIG.APP_NAME,
			version: APP_CONFIG.APP_VERSION
		});

		// Create and initialize the state manager
		app = new StateManager();
		app.initialize();

		// Make app globally available for inline event handlers
		window.app = app;

		// Log successful initialization
		logger.info("Application initialized successfully", {
			appName: APP_CONFIG.APP_NAME,
			version: APP_CONFIG.APP_VERSION
		});
	} catch (error) {
		logger.fatal("Failed to initialize application", {
			error: error.message,
			stack: error.stack
		});

		// Show error message to user
		const errorMessage =
			"Failed to initialize application. Please refresh the page.";
		alert(errorMessage);
	}
});

/**
 * Handle unhandled errors
 */
window.addEventListener("error", (event) => {
	logger.error("Unhandled error", {
		error: event.error?.message,
		stack: event.error?.stack,
		filename: event.filename,
		lineno: event.lineno,
		colno: event.colno
	});

	// Show user-friendly error message
	if (app && app.showToast) {
		app.showToast(
			"An unexpected error occurred. Please try again.",
			APP_CONFIG.TOAST_TYPES.ERROR
		);
	}
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener("unhandledrejection", (event) => {
	logger.error("Unhandled promise rejection", {
		reason: event.reason?.message || event.reason,
		stack: event.reason?.stack
	});

	// Show user-friendly error message
	if (app && app.showToast) {
		app.showToast(
			"An unexpected error occurred. Please try again.",
			APP_CONFIG.TOAST_TYPES.ERROR
		);
	}
});

// Export for testing purposes
export { app };
