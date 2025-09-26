/**
 * Validation Manager Module
 * Handles all validation logic for merge fields, conversation structure, and data integrity
 */

import { APP_CONFIG } from "../utils/constants.js";
import {
	isEmpty,
	isWhitespaceOnly,
	hasMinimumMessages,
	hasEvenMessageCount
} from "../utils/helpers.js";

export class ValidationManager {
	constructor() {
		this.dataKeys = [];
	}

	/**
	 * Update available data keys for validation
	 * @param {Array<string>} keys - Array of data keys
	 */
	updateDataKeys(keys) {
		this.dataKeys = [...keys];
	}

	/**
	 * Validate merge fields in a message
	 * @param {string} message - Message to validate
	 * @returns {Object} - Validation result with hasErrors and errorMessage
	 */
	validateMergeFields(message) {
		// Check if message is null, undefined, or empty
		if (isEmpty(message)) {
			return {
				hasErrors: true,
				errorMessage: APP_CONFIG.MESSAGES.MESSAGE_BLANK
			};
		}

		// Check if message is blank or contains only whitespace
		if (isWhitespaceOnly(message)) {
			return {
				hasErrors: true,
				errorMessage: APP_CONFIG.MESSAGES.MESSAGE_BLANK
			};
		}

		// // Check if data is available for merge field validation
		// if (!this.dataKeys || this.dataKeys.length === 0) {
		// 	return { hasErrors: false, errorMessage: "" };
		// }

		const errors = [];

		// First, find all potential merge field patterns (anything with braces)
		const allBracePatterns = /\{[^}]*\}/g;
		let braceMatch;
		const foundPatterns = [];

		while ((braceMatch = allBracePatterns.exec(message)) !== null) {
			foundPatterns.push(braceMatch[0]);
		}

		// Check each found pattern
		foundPatterns.forEach((pattern) => {
			// Check for valid format: {!data.key.field}
			const validPattern = /^\{!data\.([^.]+)\.([^}]+)\}$/;
			const validMatch = pattern.match(validPattern);

			if (validMatch) {
				// Valid format, check if key and field are valid
				const keyName = validMatch[1];
				const fieldName = validMatch[2];

				// Check if the key exists in our data
				if (this.dataKeys.length === 0) {
					errors.push(
						`No data available. Please add some data to get started.`
					);
				} else {
					if (!this.dataKeys.includes(keyName)) {
						errors.push(
							`Data key "${keyName}" not found. Available keys: ${this.dataKeys.join(
								", "
							)}`
						);
					}
				}

				// Check if field type is valid
				if (!APP_CONFIG.VALID_MERGE_FIELD_TYPES.includes(fieldName)) {
					errors.push(
						`Invalid field type "${fieldName}". Use "key", "value", or "pair".`
					);
				}
			} else {
				// Invalid format, determine what's wrong
				if (pattern.startsWith("{!data.")) {
					// Starts correctly but has issues
					if (!pattern.includes(".")) {
						errors.push(
							`Invalid merge field format "${pattern}". Use {!data.key.field} format.`
						);
					} else if (!pattern.endsWith("}")) {
						errors.push(
							`Missing closing brace '}'. Use {!data.key.field} format.`
						);
					} else {
						errors.push(
							`Invalid merge field format "${pattern}". Use {!data.key.field} format.`
						);
					}
				} else if (pattern.startsWith("{data.")) {
					// Missing exclamation mark
					errors.push(
						`Missing '!' in merge field. Use {!data.key.field} format.`
					);
				} else if (
					pattern.includes("!data.") &&
					!pattern.startsWith("{")
				) {
					// Missing opening brace
					errors.push(
						`Missing opening brace '{'. Use {!data.key.field} format.`
					);
				} else if (pattern.includes("data.")) {
					// Has data but wrong format
					errors.push(
						`Invalid merge field format "${pattern}". Use {!data.key.field} format.`
					);
				} else {
					// Other invalid merge field
					errors.push(
						`Invalid merge field "${pattern}". Use {!data.key.field} format.`
					);
				}
			}
		});

		// Check for unbalanced braces - simple and reliable
		const openBraces = (message.match(/\{/g) || []).length;
		const closeBraces = (message.match(/\}/g) || []).length;
		if (openBraces !== closeBraces) {
			if (openBraces > closeBraces) {
				errors.push(
					"Missing closing brace '}'. Use {!data.key.field} format."
				);
			} else {
				errors.push(
					"Missing opening brace '{'. Use {!data.key.field} format."
				);
			}
		}

		// Now check for patterns without braces that look like merge fields
		// Check for missing opening brace: !data.key.field} (but not {!data.key.field})
		if (
			/!data\.[^}]*\}/.test(message) &&
			!/\{!data\.[^}]*\}/.test(message)
		) {
			errors.push(
				"Missing opening brace '{'. Use {!data.key.field} format."
			);
		}

		// Check for wrong format: data.key.field (no braces, no exclamation)
		// This is tricky because we need to avoid matching "data" in regular text
		// Let's check for patterns that look like merge fields but are missing braces
		const dataFieldPattern = /data\.[^}]*\}/g;
		let dataMatch;
		while ((dataMatch = dataFieldPattern.exec(message)) !== null) {
			const match = dataMatch[0];
			// Only flag if it's not part of a valid merge field
			if (
				!message.includes(`{!${match}`) &&
				!message.includes(`{${match}`)
			) {
				errors.push(
					"Invalid merge field format. Use {!data.key.field} format."
				);
				break; // Only show one error per message
			}
		}

		// Check for wrong format: data.key.field (no braces at all, at end of line)
		const dataFieldEndPattern = /data\.[^}]*$/g;
		let dataEndMatch;
		while ((dataEndMatch = dataFieldEndPattern.exec(message)) !== null) {
			const match = dataEndMatch[0];
			// Only flag if it's not part of a valid merge field and looks like a merge field
			if (
				!message.includes(`{!${match}`) &&
				!message.includes(`{${match}`) &&
				match.includes(".") &&
				(match.includes("key") ||
					match.includes("value") ||
					match.includes("pair"))
			) {
				errors.push(
					"Invalid merge field format. Use {!data.key.field} format."
				);
				break; // Only show one error per message
			}
		}

		return {
			hasErrors: errors.length > 0,
			errorMessage: errors.length > 0 ? errors[0] : "" // Show first error
		};
	}

	/**
	 * Validate conversation structure
	 * @param {Array} conversation - Conversation array
	 * @returns {Object} - Validation result with hasErrors and errorMessage
	 */
	validateConversationStructure(conversation) {
		// Check if conversation has at least 2 messages (minimum pair)
		if (!hasMinimumMessages(conversation)) {
			return {
				hasErrors: true,
				errorMessage: APP_CONFIG.MESSAGES.CONVERSATION_TOO_SHORT
			};
		}

		// Check if conversation has even number of messages (pairs)
		if (!hasEvenMessageCount(conversation)) {
			return {
				hasErrors: true,
				errorMessage: APP_CONFIG.MESSAGES.CONVERSATION_ODD_MESSAGES
			};
		}

		return { hasErrors: false, errorMessage: "" };
	}

	/**
	 * Validate data entry
	 * @param {string} key - Data key
	 * @param {string} value - Data value
	 * @returns {Object} - Validation result with hasErrors and errorMessage
	 */
	validateDataEntry(key, value) {
		const errors = [];

		if (isEmpty(key)) {
			errors.push("Data key cannot be empty");
		}

		if (isEmpty(value)) {
			errors.push("Data value cannot be empty");
		}

		return {
			hasErrors: errors.length > 0,
			errorMessage: errors.length > 0 ? errors[0] : ""
		};
	}

	/**
	 * Validate conversation title
	 * @param {string} title - Conversation title
	 * @returns {Object} - Validation result with hasErrors and errorMessage
	 */
	validateConversationTitle(title) {
		if (isEmpty(title)) {
			return {
				hasErrors: true,
				errorMessage: APP_CONFIG.MESSAGES.TITLE_EMPTY
			};
		}

		return { hasErrors: false, errorMessage: "" };
	}

	/**
	 * Check if conversation has any validation errors
	 * @param {string} conversationKey - Conversation key
	 * @param {Array} conversation - Conversation messages
	 * @returns {Object} - Validation result with hasErrors and errorMessage
	 */
	validateConversation(conversationKey, conversation) {
		const errors = [];

		// Check structure
		const structureValidation =
			this.validateConversationStructure(conversation);
		if (structureValidation.hasErrors) {
			errors.push(structureValidation.errorMessage);
		}

		// Check individual messages
		conversation.forEach((message, index) => {
			const messageValidation = this.validateMergeFields(message);
			if (messageValidation.hasErrors) {
				errors.push(
					`Message ${index + 1}: ${messageValidation.errorMessage}`
				);
			}
		});

		return {
			hasErrors: errors.length > 0,
			errorMessage: errors.length > 0 ? errors[0] : ""
		};
	}

	/**
	 * Check if conversation has merge field errors
	 * @param {Array} conversation - Conversation messages
	 * @returns {boolean} - True if has merge field errors
	 */
	hasMergeFieldErrors(conversation) {
		return conversation.some(
			(message) =>
				this.validateMergeFields(message.message || message).hasErrors
		);
	}

	/**
	 * Check if conversation has structure errors
	 * @param {Array} conversation - Conversation messages
	 * @returns {boolean} - True if has structure errors
	 */
	hasStructureErrors(conversation) {
		return this.validateConversationStructure(conversation).hasErrors;
	}

	/**
	 * Check if conversation has any errors
	 * @param {Array} conversation - Conversation messages
	 * @returns {boolean} - True if has any errors
	 */
	hasAnyErrors(conversation) {
		return (
			this.hasStructureErrors(conversation) ||
			this.hasMergeFieldErrors(conversation)
		);
	}

	/**
	 * Get all validation errors for a conversation
	 * @param {string} conversationKey - Conversation key
	 * @param {Array} conversation - Conversation messages
	 * @returns {Array<string>} - Array of error messages
	 */
	getAllValidationErrors(conversationKey, conversation) {
		const errors = [];

		// Check structure
		const structureValidation =
			this.validateConversationStructure(conversation);
		if (structureValidation.hasErrors) {
			errors.push(structureValidation.errorMessage);
		}

		// Check individual messages
		conversation.forEach((message, index) => {
			const messageValidation = this.validateMergeFields(message);
			if (messageValidation.hasErrors) {
				errors.push(
					`Message ${index + 1}: ${messageValidation.errorMessage}`
				);
			}
		});

		return errors;
	}

	/**
	 * Validate merge field syntax only (without checking data keys)
	 * @param {string} mergeField - Merge field string
	 * @returns {Object} - Validation result with hasErrors and errorMessage
	 */
	validateMergeFieldSyntax(mergeField) {
		if (!mergeField) {
			return {
				hasErrors: true,
				errorMessage: "Merge field cannot be empty"
			};
		}

		// Check for valid format: {!data.key.field}
		const validPattern = /^\{!data\.([^.]+)\.([^}]+)\}$/;
		const validMatch = mergeField.match(validPattern);

		if (validMatch) {
			const fieldName = validMatch[2];
			// Check if field type is valid
			if (!APP_CONFIG.VALID_MERGE_FIELD_TYPES.includes(fieldName)) {
				return {
					hasErrors: true,
					errorMessage: `Invalid field type "${fieldName}". Use "key", "value", or "pair".`
				};
			}
			return { hasErrors: false, errorMessage: "" };
		}

		// Determine what's wrong with the format
		if (mergeField.startsWith("{!data.")) {
			if (!mergeField.includes(".")) {
				return {
					hasErrors: true,
					errorMessage: `Invalid merge field format "${mergeField}". Use {!data.key.field} format.`
				};
			} else if (!mergeField.endsWith("}")) {
				return {
					hasErrors: true,
					errorMessage:
						"Missing closing brace '}'. Use {!data.key.field} format."
				};
			} else {
				return {
					hasErrors: true,
					errorMessage: `Invalid merge field format "${mergeField}". Use {!data.key.field} format.`
				};
			}
		} else if (mergeField.startsWith("{data.")) {
			return {
				hasErrors: true,
				errorMessage:
					"Missing '!' in merge field. Use {!data.key.field} format."
			};
		} else if (
			mergeField.includes("!data.") &&
			!mergeField.startsWith("{")
		) {
			return {
				hasErrors: true,
				errorMessage:
					"Missing opening brace '{'. Use {!data.key.field} format."
			};
		} else if (mergeField.includes("data.")) {
			return {
				hasErrors: true,
				errorMessage: `Invalid merge field format "${mergeField}". Use {!data.key.field} format.`
			};
		} else {
			return {
				hasErrors: true,
				errorMessage: `Invalid merge field "${mergeField}". Use {!data.key.field} format.`
			};
		}
	}

	/**
	 * Test validation logic (for debugging)
	 * @param {Object} testData - Test data object
	 */
	testValidation(testData = {}) {
		console.log("Testing merge field validation logic:");

		const testCases = [
			{ input: "{!data.Patrick Go.key}", shouldHaveError: false },
			{ input: "{data.Patrick Go.key}", shouldHaveError: true },
			{ input: "!data.Patrick Go.key}", shouldHaveError: true },
			{ input: "{!data.Patrick Go.key", shouldHaveError: true },
			{ input: "data.Patrick Go.key", shouldHaveError: true },
			{ input: "{!data.NonExistentKey.key}", shouldHaveError: true },
			{ input: "{!data.Patrick Go.invalid}", shouldHaveError: true },
			{ input: "{{!data.Patrick Go.key}", shouldHaveError: true }, // Extra opening brace
			{ input: "{!data.Patrick Go.key}}", shouldHaveError: true } // Extra closing brace
		];

		// Update data keys for testing
		this.updateDataKeys(["Patrick Go"]);

		testCases.forEach((testCase, index) => {
			const result = this.validateMergeFields(testCase.input);
			const passed = result.hasErrors === testCase.shouldHaveError;
			console.log(
				`Test ${index + 1}: ${passed ? "PASS" : "FAIL"} - "${
					testCase.input
				}" - Expected error: ${testCase.shouldHaveError}, Got error: ${
					result.hasErrors
				}`
			);
			if (!passed) {
				console.log(`  Error message: ${result.errorMessage}`);
			}
		});

		console.log("\nTesting conversation structure validation:");
		const structureTestCases = [
			{
				messages: [],
				shouldHaveError: false,
				description: "Empty conversation"
			},
			{
				messages: ["User message"],
				shouldHaveError: true,
				description: "1 message (odd)"
			},
			{
				messages: ["User message", "Agent message"],
				shouldHaveError: false,
				description: "2 messages (even)"
			},
			{
				messages: ["User", "Agent", "User"],
				shouldHaveError: true,
				description: "3 messages (odd)"
			},
			{
				messages: ["User", "Agent", "User", "Agent"],
				shouldHaveError: false,
				description: "4 messages (even)"
			}
		];

		structureTestCases.forEach((testCase, index) => {
			const result = this.validateConversationStructure(
				testCase.messages
			);
			const passed = result.hasErrors === testCase.shouldHaveError;
			console.log(
				`Structure Test ${index + 1}: ${passed ? "PASS" : "FAIL"} - ${
					testCase.description
				} (${testCase.messages.length} messages) - Expected error: ${
					testCase.shouldHaveError
				}, Got error: ${result.hasErrors}`
			);
			if (!passed) {
				console.log(`  Error message: ${result.errorMessage}`);
			}
		});
	}
}
