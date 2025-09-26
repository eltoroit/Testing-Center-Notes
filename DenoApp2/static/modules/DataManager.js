/**
 * Data Manager Module
 * Handles all data operations including CRUD operations for data entries and conversations
 */

import { APP_CONFIG, DEFAULT_DATA_STRUCTURE } from "../utils/constants.js";
import {
	generateUniqueKey,
	isEmpty,
	isNotEmpty,
	sanitizeString,
	deepClone,
	processMergeFields,
	hasUnresolvedMergeFields
} from "../utils/helpers.js";
import { logger } from "../utils/Logger.js";

export class DataManager {
	constructor() {
		this.data = deepClone(DEFAULT_DATA_STRUCTURE);
		this.processedConversations = {};
	}

	/**
	 * Initialize data manager with provided data
	 * @param {Object} data - Initial data structure
	 */
	initialize(data) {
		this.data = deepClone(data || DEFAULT_DATA_STRUCTURE);
		this.processedConversations = {};
		this.processAllConversations();
	}

	/**
	 * Get current data structure
	 * @returns {Object} - Current data
	 */
	getData() {
		return deepClone(this.data);
	}

	/**
	 * Get data entries
	 * @returns {Object} - Data entries
	 */
	getDataEntries() {
		return { ...this.data.data };
	}

	/**
	 * Get conversations
	 * @returns {Object} - Conversations
	 */
	getConversations() {
		return { ...this.data.conversations };
	}

	/**
	 * Get processed conversations
	 * @returns {Object} - Processed conversations
	 */
	getProcessedConversations() {
		return { ...this.processedConversations };
	}

	/**
	 * Check if data has any entries
	 * @returns {boolean} - True if has data entries
	 */
	hasDataEntries() {
		return Object.keys(this.data.data).length > 0;
	}

	/**
	 * Check if has any conversations
	 * @returns {boolean} - True if has conversations
	 */
	hasConversations() {
		return Object.keys(this.data.conversations).length > 0;
	}

	/**
	 * Check if has any data (entries or conversations)
	 * @returns {boolean} - True if has any data
	 */
	hasAnyData() {
		return this.hasDataEntries() || this.hasConversations();
	}

	// Data Entry Operations

	/**
	 * Add new data entry
	 * @param {string} key - Data key
	 * @param {string} value - Data value
	 * @returns {boolean} - Success status
	 */
	addDataEntry(key, value) {
		logger.debug("DataManager.addDataEntry called", { key, value });

		const sanitizedKey = sanitizeString(key);
		const sanitizedValue = sanitizeString(value);
		logger.debug("Sanitized values", { sanitizedKey, sanitizedValue });

		if (isEmpty(sanitizedKey)) {
			logger.warn("Empty key provided to addDataEntry", {
				key,
				sanitizedKey
			});
			return false;
		}

		if (this.data.data[sanitizedKey]) {
			logger.warn("Key already exists", {
				key: sanitizedKey,
				existingValue: this.data.data[sanitizedKey]
			});
			return false; // Key already exists
		}

		this.data.data[sanitizedKey] = sanitizedValue;
		logger.dataChange("add", "dataEntry", {
			key: sanitizedKey,
			value: sanitizedValue
		});
		this.processAllConversations();

		logger.info("Data entry added successfully", {
			key: sanitizedKey,
			value: sanitizedValue,
			totalEntries: Object.keys(this.data.data).length
		});
		return true;
	}

	/**
	 * Update existing data entry
	 * @param {string} oldKey - Old data key
	 * @param {string} newKey - New data key
	 * @param {string} value - Data value
	 * @returns {boolean} - Success status
	 */
	updateDataEntry(oldKey, newKey, value) {
		logger.debug("DataManager.updateDataEntry called", {
			oldKey,
			newKey,
			value
		});

		const sanitizedNewKey = sanitizeString(newKey);
		const sanitizedValue = sanitizeString(value);
		logger.debug("Sanitized values", { sanitizedNewKey, sanitizedValue });

		if (isEmpty(sanitizedNewKey) || isEmpty(sanitizedValue)) {
			logger.warn("Empty key or value provided to updateDataEntry", {
				sanitizedNewKey,
				sanitizedValue,
				isEmptyKey: isEmpty(sanitizedNewKey),
				isEmptyValue: isEmpty(sanitizedValue)
			});
			return false;
		}

		// Check if new key already exists (and it's different from old key)
		if (sanitizedNewKey !== oldKey && this.data.data[sanitizedNewKey]) {
			logger.warn("New key already exists", {
				oldKey,
				newKey: sanitizedNewKey,
				existingValue: this.data.data[sanitizedNewKey]
			});
			return false; // New key already exists
		}

		// If key is changing, remove old entry
		if (sanitizedNewKey !== oldKey) {
			logger.debug("Key is changing, removing old entry", {
				oldKey,
				newKey: sanitizedNewKey
			});
			delete this.data.data[oldKey];
		}

		this.data.data[sanitizedNewKey] = sanitizedValue;
		logger.dataChange("update", "dataEntry", {
			oldKey,
			newKey: sanitizedNewKey,
			value: sanitizedValue
		});
		this.processAllConversations();

		logger.info("Data entry updated successfully", {
			oldKey,
			newKey: sanitizedNewKey,
			value: sanitizedValue,
			totalEntries: Object.keys(this.data.data).length
		});
		return true;
	}

	/**
	 * Delete data entry
	 * @param {string} key - Data key to delete
	 * @returns {boolean} - Success status
	 */
	deleteDataEntry(key) {
		if (!this.data.data[key]) {
			return false;
		}

		delete this.data.data[key];
		this.processAllConversations();
		return true;
	}

	/**
	 * Get data entry value
	 * @param {string} key - Data key
	 * @returns {string} - Data value or empty string
	 */
	getDataEntry(key) {
		return this.data.data[key] || "";
	}

	/**
	 * Check if data key exists
	 * @param {string} key - Data key
	 * @returns {boolean} - True if key exists
	 */
	hasDataKey(key) {
		return key in this.data.data;
	}

	/**
	 * Get all data keys
	 * @returns {Array<string>} - Array of data keys
	 */
	getDataKeys() {
		return Object.keys(this.data.data);
	}

	// Conversation Operations

	/**
	 * Add new conversation
	 * @param {string} key - Conversation key
	 * @param {Array} messages - Initial messages (optional)
	 * @returns {boolean} - Success status
	 */
	addConversation(key, messages = []) {
		const sanitizedKey = sanitizeString(key);

		if (isEmpty(sanitizedKey)) {
			return false;
		}

		if (this.data.conversations[sanitizedKey]) {
			return false; // Key already exists
		}

		this.data.conversations[sanitizedKey] = Array.isArray(messages)
			? [...messages]
			: [];
		this.processConversation(sanitizedKey);
		return true;
	}

	/**
	 * Update conversation key
	 * @param {string} oldKey - Old conversation key
	 * @param {string} newKey - New conversation key
	 * @returns {boolean} - Success status
	 */
	updateConversationKey(oldKey, newKey) {
		const sanitizedNewKey = sanitizeString(newKey);

		if (isEmpty(sanitizedNewKey)) {
			return false;
		}

		if (!this.data.conversations[oldKey]) {
			return false; // Old key doesn't exist
		}

		if (
			sanitizedNewKey !== oldKey &&
			this.data.conversations[sanitizedNewKey]
		) {
			return false; // New key already exists
		}

		// Move conversation data
		const conversation = this.data.conversations[oldKey];
		const processedConversation = this.processedConversations[oldKey];

		delete this.data.conversations[oldKey];
		if (processedConversation) {
			delete this.processedConversations[oldKey];
		}

		this.data.conversations[sanitizedNewKey] = conversation;
		if (processedConversation) {
			this.processedConversations[sanitizedNewKey] =
				processedConversation;
		}

		return true;
	}

	/**
	 * Delete conversation
	 * @param {string} key - Conversation key to delete
	 * @returns {boolean} - Success status
	 */
	deleteConversation(key) {
		if (!this.data.conversations[key]) {
			return false;
		}

		delete this.data.conversations[key];
		delete this.processedConversations[key];
		return true;
	}

	/**
	 * Get conversation
	 * @param {string} key - Conversation key
	 * @returns {Array} - Conversation messages or empty array
	 */
	getConversation(key) {
		return this.data.conversations[key]
			? [...this.data.conversations[key]]
			: [];
	}

	/**
	 * Get processed conversation
	 * @param {string} key - Conversation key
	 * @returns {Array} - Processed conversation or empty array
	 */
	getProcessedConversation(key) {
		return this.processedConversations[key]
			? [...this.processedConversations[key]]
			: [];
	}

	/**
	 * Check if conversation exists
	 * @param {string} key - Conversation key
	 * @returns {boolean} - True if conversation exists
	 */
	hasConversation(key) {
		return key in this.data.conversations;
	}

	/**
	 * Get all conversation keys
	 * @returns {Array<string>} - Array of conversation keys
	 */
	getConversationKeys() {
		return Object.keys(this.data.conversations);
	}

	/**
	 * Clone conversation
	 * @param {string} sourceKey - Source conversation key
	 * @param {string} newKey - New conversation key
	 * @returns {boolean} - Success status
	 */
	cloneConversation(sourceKey, newKey) {
		if (!this.data.conversations[sourceKey]) {
			return false;
		}

		const originalConversation = [...this.data.conversations[sourceKey]];
		const originalProcessed = this.processedConversations[sourceKey]
			? [...this.processedConversations[sourceKey]]
			: null;

		this.data.conversations[newKey] = originalConversation;
		if (originalProcessed) {
			this.processedConversations[newKey] = originalProcessed;
		} else {
			this.processConversation(newKey);
		}

		return true;
	}

	// Message Operations

	/**
	 * Add message to conversation
	 * @param {string} conversationKey - Conversation key
	 * @param {string} message - Message content
	 * @returns {boolean} - Success status
	 */
	addMessage(conversationKey, message = "") {
		if (!this.data.conversations[conversationKey]) {
			return false;
		}

		this.data.conversations[conversationKey].push(message);
		this.processConversation(conversationKey);
		return true;
	}

	/**
	 * Update message in conversation
	 * @param {string} conversationKey - Conversation key
	 * @param {number} messageIndex - Message index
	 * @param {string} message - New message content
	 * @returns {boolean} - Success status
	 */
	updateMessage(conversationKey, messageIndex, message) {
		if (
			!this.data.conversations[conversationKey] ||
			messageIndex < 0 ||
			messageIndex >= this.data.conversations[conversationKey].length
		) {
			return false;
		}

		this.data.conversations[conversationKey][messageIndex] = message;
		this.processConversation(conversationKey);
		return true;
	}

	/**
	 * Delete message from conversation
	 * @param {string} conversationKey - Conversation key
	 * @param {number} messageIndex - Message index
	 * @returns {boolean} - Success status
	 */
	deleteMessage(conversationKey, messageIndex) {
		if (
			!this.data.conversations[conversationKey] ||
			messageIndex < 0 ||
			messageIndex >= this.data.conversations[conversationKey].length
		) {
			return false;
		}

		this.data.conversations[conversationKey].splice(messageIndex, 1);
		this.processConversation(conversationKey);
		return true;
	}

	/**
	 * Get message from conversation
	 * @param {string} conversationKey - Conversation key
	 * @param {number} messageIndex - Message index
	 * @returns {string} - Message content or empty string
	 */
	getMessage(conversationKey, messageIndex) {
		if (
			!this.data.conversations[conversationKey] ||
			messageIndex < 0 ||
			messageIndex >= this.data.conversations[conversationKey].length
		) {
			return "";
		}

		return this.data.conversations[conversationKey][messageIndex] || "";
	}

	// Merge Field Processing

	/**
	 * Process all conversations
	 */
	processAllConversations() {
		this.processedConversations = {};

		Object.keys(this.data.conversations).forEach((conversationKey) => {
			this.processConversation(conversationKey);
		});
	}

	/**
	 * Process single conversation
	 * @param {string} conversationKey - Conversation key
	 */
	processConversation(conversationKey) {
		if (!this.data.conversations[conversationKey]) {
			return;
		}

		const conversation = this.data.conversations[conversationKey];
		const processedConversation = [];

		conversation.forEach((message, index) => {
			const role =
				index % 2 === 0
					? APP_CONFIG.ROLES.USER
					: APP_CONFIG.ROLES.AGENT;
			const processedMessage = processMergeFields(
				message,
				this.data.data
			);

			processedConversation.push({
				role: role,
				message: processedMessage
			});
		});

		this.processedConversations[conversationKey] = processedConversation;
	}

	/**
	 * Check if processed conversation has unresolved merge fields
	 * @param {string} conversationKey - Conversation key
	 * @returns {boolean} - True if has unresolved merge fields
	 */
	hasUnresolvedMergeFields(conversationKey) {
		const processedConversation =
			this.processedConversations[conversationKey];
		if (!processedConversation || !Array.isArray(processedConversation)) {
			return false;
		}

		return processedConversation.some((message) => {
			if (message && message.message) {
				return hasUnresolvedMergeFields(message.message);
			}
			return false;
		});
	}

	/**
	 * Get data for download (includes processed conversations)
	 * @returns {Object} - Data structure for download
	 */
	getDataForDownload() {
		return {
			...this.data,
			processedConversations: this.processedConversations
		};
	}

	/**
	 * Reset data to default state
	 */
	reset() {
		this.data = deepClone(DEFAULT_DATA_STRUCTURE);
		this.processedConversations = {};
	}

	/**
	 * Get statistics about current data
	 * @returns {Object} - Data statistics
	 */
	getStatistics() {
		const dataKeys = Object.keys(this.data.data);
		const conversationKeys = Object.keys(this.data.conversations);

		let totalMessages = 0;
		let totalProcessedMessages = 0;

		conversationKeys.forEach((key) => {
			const conversation = this.data.conversations[key];
			const processedConversation = this.processedConversations[key];

			if (conversation) {
				totalMessages += conversation.length;
			}

			if (processedConversation) {
				totalProcessedMessages += processedConversation.length;
			}
		});

		return {
			dataEntries: dataKeys.length,
			conversations: conversationKeys.length,
			totalMessages: totalMessages,
			totalProcessedMessages: totalProcessedMessages,
			hasData: this.hasAnyData()
		};
	}
}
