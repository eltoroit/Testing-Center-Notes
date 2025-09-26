/**
 * Helper Utility Functions
 * General purpose utility functions for the application
 */

import { APP_CONFIG } from "./constants.js";

/**
 * Generate a unique timestamp-based key
 * @param {string} prefix - Key prefix
 * @returns {string} - Unique key
 */
export function generateUniqueKey(prefix = "") {
	const timestamp = Date.now();
	return prefix ? `${prefix} ${timestamp}` : `item_${timestamp}`;
}

/**
 * Validate if a value is empty (null, undefined, empty string, or whitespace only)
 * @param {any} value - Value to validate
 * @returns {boolean} - True if value is empty
 */
export function isEmpty(value) {
	return (
		value == null ||
		(typeof value === "string" && value.trim().length === 0)
	);
}

/**
 * Validate if a value is not empty
 * @param {any} value - Value to validate
 * @returns {boolean} - True if value is not empty
 */
export function isNotEmpty(value) {
	return !isEmpty(value);
}

/**
 * Sanitize string by trimming whitespace
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(str) {
	return typeof str === "string" ? str.trim() : "";
}

/**
 * Check if string contains only whitespace
 * @param {string} str - String to check
 * @returns {boolean} - True if string is only whitespace
 */
export function isWhitespaceOnly(str) {
	return typeof str === "string" && str.trim().length === 0;
}

/**
 * Get role for message based on index (user/agent pattern)
 * @param {number} messageIndex - Message index
 * @returns {string} - Role ('user' or 'agent')
 */
export function getRoleForMessage(messageIndex) {
	return messageIndex % 2 === 0
		? APP_CONFIG.ROLES.USER
		: APP_CONFIG.ROLES.AGENT;
}

/**
 * Check if conversation has even number of messages
 * @param {Array} conversation - Conversation array
 * @returns {boolean} - True if even number of messages
 */
export function hasEvenMessageCount(conversation) {
	return Array.isArray(conversation) && conversation.length % 2 === 0;
}

/**
 * Check if conversation has minimum required messages
 * @param {Array} conversation - Conversation array
 * @returns {boolean} - True if has minimum messages
 */
export function hasMinimumMessages(conversation) {
	return (
		Array.isArray(conversation) &&
		conversation.length >= APP_CONFIG.MIN_CONVERSATION_MESSAGES
	);
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} - Cloned object
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime());
	}

	if (obj instanceof Array) {
		return obj.map((item) => deepClone(item));
	}

	if (typeof obj === "object") {
		const cloned = {};
		Object.keys(obj).forEach((key) => {
			cloned[key] = deepClone(obj[key]);
		});
		return cloned;
	}

	return obj;
}

/**
 * Merge two objects deeply
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} - Merged object
 */
export function deepMerge(target, source) {
	const result = deepClone(target);

	Object.keys(source).forEach((key) => {
		if (
			source[key] &&
			typeof source[key] === "object" &&
			!Array.isArray(source[key])
		) {
			result[key] = deepMerge(result[key] || {}, source[key]);
		} else {
			result[key] = source[key];
		}
	});

	return result;
}

/**
 * Check if two objects are deeply equal
 * @param {any} a - First object
 * @param {any} b - Second object
 * @returns {boolean} - True if objects are equal
 */
export function deepEqual(a, b) {
	if (a === b) return true;

	if (a == null || b == null) return false;

	if (typeof a !== typeof b) return false;

	if (typeof a !== "object") return false;

	if (Array.isArray(a) !== Array.isArray(b)) return false;

	if (Array.isArray(a)) {
		if (a.length !== b.length) return false;
		return a.every((item, index) => deepEqual(item, b[index]));
	}

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) return false;

	return keysA.every((key) => deepEqual(a[key], b[key]));
}

/**
 * Format JSON string with proper indentation
 * @param {any} data - Data to format
 * @param {number} indent - Indentation spaces (default: 2)
 * @returns {string} - Formatted JSON string
 */
export function formatJSON(data, indent = 2) {
	try {
		return JSON.stringify(data, null, indent);
	} catch (error) {
		console.error("Error formatting JSON:", error);
		return String(data);
	}
}

/**
 * Parse JSON string safely
 * @param {string} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} - Parsed object or default value
 */
export function safeJSONParse(jsonString, defaultValue = null) {
	try {
		return JSON.parse(jsonString);
	} catch (error) {
		console.error("Error parsing JSON:", error);
		return defaultValue;
	}
}

/**
 * Create a blob from data
 * @param {any} data - Data to create blob from
 * @param {string} type - MIME type (default: 'application/json')
 * @returns {Blob} - Created blob
 */
export function createBlob(data, type = "application/json") {
	const jsonString = formatJSON(data);
	return new Blob([jsonString], { type });
}

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
export function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Promise that resolves to success status
 */
export async function copyToClipboard(text) {
	try {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
			return true;
		} else {
			// Fallback for older browsers
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.position = "fixed";
			textArea.style.left = "-999999px";
			textArea.style.top = "-999999px";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			const success = document.execCommand("copy");
			textArea.remove();
			return success;
		}
	} catch (error) {
		console.error("Error copying to clipboard:", error);
		return false;
	}
}

/**
 * Generate merge field string
 * @param {string} dataKey - Data key
 * @param {string} fieldType - Field type (key, value, pair)
 * @returns {string} - Generated merge field
 */
export function generateMergeField(dataKey, fieldType) {
	return `{!data.${dataKey}.${fieldType}}`;
}

/**
 * Extract merge field components
 * @param {string} mergeField - Merge field string
 * @returns {Object|null} - Object with dataKey and fieldType, or null if invalid
 */
export function extractMergeFieldComponents(mergeField) {
	const match = mergeField.match(APP_CONFIG.MERGE_FIELD_PATTERN);
	if (match) {
		return {
			dataKey: match[1],
			fieldType: match[2]
		};
	}
	return null;
}

/**
 * Check if string is a valid merge field
 * @param {string} str - String to check
 * @returns {boolean} - True if valid merge field
 */
export function isValidMergeField(str) {
	return APP_CONFIG.MERGE_FIELD_PATTERN.test(str);
}

/**
 * Get field value from data object
 * @param {string} dataKey - Data key
 * @param {string} fieldType - Field type
 * @param {Object} data - Data object
 * @returns {string} - Field value
 */
export function getFieldValue(dataKey, fieldType, data) {
	if (!data || !data[dataKey]) {
		return `{!data.${dataKey}.${fieldType}}`;
	}

	const value = data[dataKey];

	switch (fieldType) {
		case APP_CONFIG.MERGE_FIELD_TYPES.KEY:
			return dataKey;
		case APP_CONFIG.MERGE_FIELD_TYPES.VALUE:
			return value;
		case APP_CONFIG.MERGE_FIELD_TYPES.PAIR:
			return `[${dataKey}]=[${value}]`;
		default:
			return `{!data.${dataKey}.${fieldType}}`;
	}
}

/**
 * Process merge fields in text
 * @param {string} text - Text containing merge fields
 * @param {Object} data - Data object for replacement
 * @returns {string} - Processed text
 */
export function processMergeFields(text, data) {
	if (!text || !data) {
		return text;
	}

	let processedText = text;
	const mergeFieldPattern = /\{!data\.([^}]+)\}/g;
	let match;

	while ((match = mergeFieldPattern.exec(text)) !== null) {
		const fullMatch = match[0];
		const fieldPath = match[1];
		const parts = fieldPath.split(".");

		if (parts.length === 2) {
			const [dataKey, fieldType] = parts;
			const replacement = getFieldValue(dataKey, fieldType, data);
			processedText = processedText.replace(fullMatch, replacement);
		}
	}

	return processedText;
}

/**
 * Check if text contains unresolved merge fields
 * @param {string} text - Text to check
 * @returns {boolean} - True if contains unresolved merge fields
 */
export function hasUnresolvedMergeFields(text) {
	if (!text) return false;
	const mergeFieldPattern = /\{!data\.[^}]+\}/;
	return mergeFieldPattern.test(text);
}

/**
 * Debounce function (removed as per requirements, but kept for compatibility)
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Function that executes immediately
 */
export function debounce(func, delay) {
	// As per requirements, debouncing is removed - just execute immediately
	return function (...args) {
		return func.apply(this, args);
	};
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, delay) {
	let lastCall = 0;
	return function (...args) {
		const now = Date.now();
		if (now - lastCall >= delay) {
			lastCall = now;
			return func.apply(this, args);
		}
	};
}

/**
 * Create a promise that resolves after a delay
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise} - Promise that resolves after delay
 */
export function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} func - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with function result
 */
export async function retry(func, maxRetries = 3, baseDelay = 1000) {
	let lastError;

	for (let i = 0; i <= maxRetries; i++) {
		try {
			return await func();
		} catch (error) {
			lastError = error;
			if (i < maxRetries) {
				const delay = baseDelay * Math.pow(2, i);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError;
}

/**
 * Check if browser supports required features
 * @returns {Object} - Object with feature support status
 */
export function checkBrowserSupport() {
	return {
		clipboard: !!(navigator.clipboard && window.isSecureContext),
		fileAPI: !!(window.File && window.FileReader),
		localStorage: typeof Storage !== "undefined",
		fetch: typeof fetch !== "undefined",
		promises: typeof Promise !== "undefined"
	};
}
