/**
 * Comprehensive Logging System
 * Provides structured logging with levels and easy toggle functionality
 */

export const LOG_LEVELS = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3,
	FATAL: 4
};

export const LOG_LEVEL_NAMES = {
	[LOG_LEVELS.DEBUG]: "DEBUG",
	[LOG_LEVELS.INFO]: "INFO",
	[LOG_LEVELS.WARN]: "WARN",
	[LOG_LEVELS.ERROR]: "ERROR",
	[LOG_LEVELS.FATAL]: "FATAL"
};

export const LOG_COLORS = {
	[LOG_LEVELS.DEBUG]: "#888888",
	[LOG_LEVELS.INFO]: "#0066cc",
	[LOG_LEVELS.WARN]: "#ff8800",
	[LOG_LEVELS.ERROR]: "#cc0000",
	[LOG_LEVELS.FATAL]: "#880000"
};

class Logger {
	constructor() {
		this.currentLevel = LOG_LEVELS.DEBUG; // Default to DEBUG for development
		this.enabled = true;
		this.logHistory = [];
		this.maxHistorySize = 1000; // Keep last 1000 log entries
		this.startTime = Date.now();

		// Make logger globally available for debugging
		window.logger = this;

		// Add keyboard shortcut to toggle logging
		document.addEventListener("keydown", (e) => {
			if (e.ctrlKey && e.shiftKey && e.key === "L") {
				this.toggleLogging();
			}
		});

		this.info("Logger initialized", {
			level: LOG_LEVEL_NAMES[this.currentLevel],
			enabled: this.enabled,
			shortcut: "Ctrl+Shift+L to toggle"
		});
	}

	/**
	 * Set the minimum log level
	 * @param {number} level - Log level from LOG_LEVELS
	 */
	setLevel(level) {
		this.currentLevel = level;
		this.info("Log level changed", {
			newLevel: LOG_LEVEL_NAMES[level]
		});
	}

	/**
	 * Enable or disable logging
	 * @param {boolean} enabled - Whether logging is enabled
	 */
	setEnabled(enabled) {
		this.enabled = enabled;
		if (enabled) {
			this.info("Logging enabled");
		} else {
			console.log("Logging disabled");
		}
	}

	/**
	 * Toggle logging on/off
	 */
	toggleLogging() {
		this.setEnabled(!this.enabled);
	}

	/**
	 * Get current timestamp relative to app start
	 * @returns {string} - Formatted timestamp
	 */
	getTimestamp() {
		const elapsed = Date.now() - this.startTime;
		return `+${elapsed}ms`;
	}

	/**
	 * Format log entry
	 * @param {string} level - Log level name
	 * @param {string} message - Log message
	 * @param {Object} data - Additional data
	 * @returns {Object} - Formatted log entry
	 */
	formatLogEntry(level, message, data = null) {
		const timestamp = this.getTimestamp();
		const entry = {
			timestamp,
			level,
			message,
			data,
			time: new Date().toISOString()
		};

		// Add to history
		this.logHistory.push(entry);
		if (this.logHistory.length > this.maxHistorySize) {
			this.logHistory.shift();
		}

		return entry;
	}

	/**
	 * Core logging method
	 * @param {number} level - Log level
	 * @param {string} message - Log message
	 * @param {Object} data - Additional data
	 */
	log(level, message, data = null) {
		if (!this.enabled || level < this.currentLevel) {
			return;
		}

		const levelName = LOG_LEVEL_NAMES[level];
		const entry = this.formatLogEntry(levelName, message, data);

		// Console output with styling
		const style = `color: ${LOG_COLORS[level]}; font-weight: bold;`;
		const prefix = `[${entry.timestamp}] [${levelName}]`;

		if (data) {
			console.log(`%c${prefix} ${message}`, style, data);
		} else {
			console.log(`%c${prefix} ${message}`, style);
		}
	}

	/**
	 * Debug level logging
	 * @param {string} message - Log message
	 * @param {Object} data - Additional data
	 */
	debug(message, data = null) {
		this.log(LOG_LEVELS.DEBUG, message, data);
	}

	/**
	 * Info level logging
	 * @param {string} message - Log message
	 * @param {Object} data - Additional data
	 */
	info(message, data = null) {
		this.log(LOG_LEVELS.INFO, message, data);
	}

	/**
	 * Warning level logging
	 * @param {string} message - Log message
	 * @param {Object} data - Additional data
	 */
	warn(message, data = null) {
		this.log(LOG_LEVELS.WARN, message, data);
	}

	/**
	 * Error level logging
	 * @param {string} message - Log message
	 * @param {Object} data - Additional data
	 */
	error(message, data = null) {
		this.log(LOG_LEVELS.ERROR, message, data);
	}

	/**
	 * Fatal level logging
	 * @param {string} message - Log message
	 * @param {Object} data - Additional data
	 */
	fatal(message, data = null) {
		this.log(LOG_LEVELS.FATAL, message, data);
	}

	/**
	 * Log user interactions (clicks, form submissions, etc.)
	 * @param {string} action - Action description
	 * @param {Object} details - Action details
	 */
	userAction(action, details = {}) {
		this.info(`USER ACTION: ${action}`, {
			...details,
			type: "user_interaction"
		});
	}

	/**
	 * Log DOM events
	 * @param {string} eventType - Event type (click, change, etc.)
	 * @param {HTMLElement} element - Target element
	 * @param {Object} eventData - Additional event data
	 */
	domEvent(eventType, element, eventData = {}) {
		const elementInfo = {
			tagName: element.tagName,
			id: element.id,
			className: element.className,
			textContent:
				element.textContent?.substring(0, 50) +
				(element.textContent?.length > 50 ? "..." : "")
		};

		this.debug(`DOM EVENT: ${eventType}`, {
			element: elementInfo,
			...eventData,
			type: "dom_event"
		});
	}

	/**
	 * Log method calls
	 * @param {string} methodName - Method name
	 * @param {Object} params - Method parameters
	 * @param {Object} result - Method result (optional)
	 */
	methodCall(methodName, params = {}, result = null) {
		const logData = {
			method: methodName,
			params,
			type: "method_call"
		};

		if (result !== null) {
			logData.result = result;
		}

		this.debug(`METHOD CALL: ${methodName}`, logData);
	}

	/**
	 * Log data changes
	 * @param {string} operation - Operation type (add, update, delete)
	 * @param {string} dataType - Type of data being changed
	 * @param {Object} details - Change details
	 */
	dataChange(operation, dataType, details = {}) {
		this.info(`DATA CHANGE: ${operation.toUpperCase()} ${dataType}`, {
			operation,
			dataType,
			...details,
			type: "data_change"
		});
	}

	/**
	 * Log UI state changes
	 * @param {string} component - UI component name
	 * @param {string} state - New state
	 * @param {Object} details - State details
	 */
	uiState(component, state, details = {}) {
		this.debug(`UI STATE: ${component} -> ${state}`, {
			component,
			state,
			...details,
			type: "ui_state"
		});
	}

	/**
	 * Get log history
	 * @param {number} count - Number of recent entries to return
	 * @returns {Array} - Array of log entries
	 */
	getHistory(count = 50) {
		return this.logHistory.slice(-count);
	}

	/**
	 * Export log history as JSON
	 * @returns {string} - JSON string of log history
	 */
	exportLogs() {
		return JSON.stringify(this.logHistory, null, 2);
	}

	/**
	 * Clear log history
	 */
	clearHistory() {
		this.logHistory = [];
		this.info("Log history cleared");
	}

	/**
	 * Get logging statistics
	 * @returns {Object} - Logging statistics
	 */
	getStats() {
		const stats = {
			totalLogs: this.logHistory.length,
			byLevel: {},
			byType: {},
			uptime: Date.now() - this.startTime
		};

		// Count by level
		Object.values(LOG_LEVEL_NAMES).forEach((level) => {
			stats.byLevel[level] = 0;
		});

		// Count by type
		this.logHistory.forEach((entry) => {
			stats.byLevel[entry.level]++;
			if (entry.data?.type) {
				stats.byType[entry.data.type] =
					(stats.byType[entry.data.type] || 0) + 1;
			}
		});

		return stats;
	}
}

// Create and export singleton instance
export const logger = new Logger();

// Export the class for testing
export { Logger };
