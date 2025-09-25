/**
 * Utility functions for data transformation and validation
 */

/**
 * Validates the JSON structure for required fields
 * @param {Object} data - The JSON data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateJsonStructure(data) {
	const errors = [];

	if (!data) {
		errors.push("Data is required");
		return { isValid: false, errors };
	}

	// Check required top-level properties
	if (!data.data || typeof data.data !== "object") {
		errors.push("Data section is required and must be an object");
	}

	if (!data.contextVariables || typeof data.contextVariables !== "object") {
		errors.push(
			"Context variables section is required and must be an object"
		);
	}

	if (!data.tests || !Array.isArray(data.tests)) {
		errors.push("Tests section is required and must be an array");
	}

	// Validate data section structure
	if (data.data) {
		Object.entries(data.data).forEach(([key, value]) => {
			if (!value || typeof value !== "object") {
				errors.push(`Data item '${key}' must be an object`);
			} else {
				if (typeof value.key !== "string") {
					errors.push(
						`Data item '${key}' must have a 'key' property (string)`
					);
				}
				if (typeof value.value !== "string") {
					errors.push(
						`Data item '${key}' must have a 'value' property (string)`
					);
				}
			}
		});
	}

	// Validate context variables section
	if (data.contextVariables) {
		Object.entries(data.contextVariables).forEach(([key, value]) => {
			if (typeof value !== "string") {
				errors.push(`Context variable '${key}' must be a string`);
			}
		});
	}

	// Validate tests section
	if (data.tests) {
		data.tests.forEach((test, index) => {
			if (!test || typeof test !== "object") {
				errors.push(`Test ${index + 1} must be an object`);
				return;
			}

			// Required test properties
			if (typeof test.testNumber !== "number") {
				errors.push(
					`Test ${
						index + 1
					} must have a 'testNumber' property (number)`
				);
			}

			if (typeof test.utterance !== "string") {
				errors.push(
					`Test ${
						index + 1
					} must have an 'utterance' property (string)`
				);
			}

			if (typeof test.expectedTopic !== "string") {
				errors.push(
					`Test ${
						index + 1
					} must have an 'expectedTopic' property (string)`
				);
			}

			if (!Array.isArray(test.expectedActions)) {
				errors.push(
					`Test ${
						index + 1
					} must have an 'expectedActions' property (array)`
				);
			}

			if (typeof test.expectedResponse !== "string") {
				errors.push(
					`Test ${
						index + 1
					} must have an 'expectedResponse' property (string)`
				);
			}

			// Optional but validated properties
			if (
				test.conversationHistory &&
				!Array.isArray(test.conversationHistory)
			) {
				errors.push(
					`Test ${index + 1} conversationHistory must be an array`
				);
			}

			if (
				test.contextVariables &&
				typeof test.contextVariables !== "object"
			) {
				errors.push(
					`Test ${index + 1} contextVariables must be an object`
				);
			}

			// Validate context variables in tests are defined in main contextVariables section
			if (test.contextVariables && data.contextVariables) {
				Object.keys(test.contextVariables).forEach((contextKey) => {
					if (!data.contextVariables.hasOwnProperty(contextKey)) {
						errors.push(
							`Test ${
								index + 1
							} uses context variable '${contextKey}' which is not defined in the contextVariables section`
						);
					}
				});
			}
		});
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Transforms text by replacing data placeholders with actual values
 * @param {string} text - The text to transform
 * @param {Object} data - The data object containing key-value pairs
 * @returns {string} - The transformed text
 */
export function transformText(text, data) {
	if (!text || !data) return text;

	// Replace {!data.KeyName.value} with actual value
	text = text.replace(/\{!data\.(\w+)\.value\}/g, (match, key) => {
		return data[key]?.value || match;
	});

	// Replace {!data.KeyName.key} with actual key
	text = text.replace(/\{!data\.(\w+)\.key\}/g, (match, key) => {
		return data[key]?.key || match;
	});

	// Replace {!data.KeyName.pair} with [key]=[value] format
	text = text.replace(/\{!data\.(\w+)\.pair\}/g, (match, key) => {
		const item = data[key];
		if (item) {
			return `[${item.key}]=[${item.value}]`;
		}
		return match;
	});

	return text;
}

/**
 * Formats conversation history for CSV output
 * @param {Array} conversations - Array of conversation objects or strings
 * @param {Object} data - The data object for transformations
 * @returns {string} - JSON string of formatted conversation history
 */
export function formatConversationHistory(conversations, data) {
	if (!conversations || conversations.length === 0) return "";

	const transformed = conversations.map((conv, index) => {
		// Handle both formats: string (original) or object (new)
		if (typeof conv === "string") {
			// Original format: alternate between user and agent
			// First message is user, second is agent, etc.
			const role = index % 2 === 0 ? "user" : "agent";
			return {
				role: role,
				message: transformText(conv, data),
			};
		} else {
			// New format: object with role and message
			return {
				role: conv.role,
				message: transformText(conv.message, data),
			};
		}
	});

	return JSON.stringify(transformed);
}

/**
 * Generates CSV data with dynamic columns based on context variables
 * @param {Object} currentData - The current data object
 * @returns {Array} - Array of arrays representing CSV rows
 */
export function generateCsvData(currentData) {
	if (!currentData || !currentData.tests) return [];

	// Get all unique context variables from the contextVariables section
	const contextVariableNames = Object.keys(
		currentData.contextVariables || {}
	);

	// Create headers - fixed columns + dynamic context variable columns
	const headers = [
		"Conversation History",
		"Utterance",
		"Expected Topic",
		"Expected Actions",
		"Expected Response",
		...contextVariableNames.map((name) => `Context Variable ${name}`),
	];

	// Generate rows
	const rows = currentData.tests.map((test) => {
		const conversationHistory = formatConversationHistory(
			test.conversationHistory,
			currentData.data
		);
		const utterance = transformText(test.utterance, currentData.data);
		const expectedResponse = transformText(
			test.expectedResponse,
			currentData.data
		);
		const expectedActions = JSON.stringify(test.expectedActions || []);

		// Get context variables for this test
		const contextVars = test.contextVariables || {};

		// Create row with fixed columns + dynamic context variable columns
		const row = [
			conversationHistory,
			utterance,
			test.expectedTopic || "",
			expectedActions,
			expectedResponse,
			...contextVariableNames.map((name) =>
				transformText(contextVars[name] || "", currentData.data)
			),
		];

		return row;
	});

	return [headers, ...rows];
}

/**
 * Converts data array to CSV string
 * @param {Array} data - Array of arrays representing CSV data
 * @returns {string} - CSV string
 */
export function convertToCsv(data) {
	return data
		.map((row) =>
			row
				.map((cell) => {
					// Escape quotes and wrap in quotes if contains comma, quote, or newline
					const escaped = String(cell).replace(/"/g, '""');
					if (
						escaped.includes(",") ||
						escaped.includes('"') ||
						escaped.includes("\n")
					) {
						return `"${escaped}"`;
					}
					return escaped;
				})
				.join(",")
		)
		.join("\n");
}

/**
 * Creates a blob for file download
 * @param {string} content - The file content
 * @param {string} mimeType - The MIME type
 * @returns {Blob} - The blob object
 */
export function createDownloadBlob(content, mimeType) {
	return new Blob([content], { type: mimeType });
}

/**
 * Triggers a file download
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename
 */
export function triggerDownload(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	URL.revokeObjectURL(url);
	document.body.removeChild(a);
}
