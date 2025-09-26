/**
 * File Handler Module
 * Handles file upload and download operations
 */

import { APP_CONFIG } from "../utils/constants.js";
import { getElementById, setValue } from "../utils/DOM.js";
import { safeJSONParse, createBlob, downloadBlob } from "../utils/helpers.js";

export class FileHandler {
	constructor() {
		this.setupFileInputs();
	}

	/**
	 * Setup file input elements
	 */
	setupFileInputs() {
		const fileInput = getElementById(APP_CONFIG.ELEMENT_IDS.FILE_INPUT);
		const fileInput2 = getElementById(APP_CONFIG.ELEMENT_IDS.FILE_INPUT_2);

		if (fileInput) {
			fileInput.addEventListener("change", (e) =>
				this.handleFileUpload(e)
			);
		}

		if (fileInput2) {
			fileInput2.addEventListener("change", (e) =>
				this.handleFileUpload(e)
			);
		}
	}

	/**
	 * Handle file upload button click
	 * @param {string} fileInputId - File input element ID
	 * @param {Function} onConfirm - Callback when user confirms upload
	 */
	handleUploadButtonClick(fileInputId, onConfirm) {
		const fileInput = getElementById(fileInputId);
		if (!fileInput) return;

		// Check if there's existing data and ask for confirmation
		if (onConfirm && !onConfirm()) {
			return; // User cancelled, don't open file dialog
		}

		// User confirmed or no existing data, open file dialog
		fileInput.click();
	}

	/**
	 * Handle file upload
	 * @param {Event} event - File input change event
	 * @param {Function} onSuccess - Success callback
	 * @param {Function} onError - Error callback
	 */
	handleFileUpload(event, onSuccess, onError) {
		const file = event.target.files[0];
		if (!file) return;

		// Validate file type
		if (!this.isValidFileType(file)) {
			const errorMessage = APP_CONFIG.MESSAGES.FILE_NOT_SELECTED;
			if (onError) onError(errorMessage);
			this.resetFileInput(event.target);
			return;
		}

		// Read file content
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const uploadedData = safeJSONParse(e.target.result);
				if (!uploadedData) {
					throw new Error("Invalid JSON format");
				}

				// Remove any existing processed data from uploaded file
				if (uploadedData.processedConversations) {
					delete uploadedData.processedConversations;
				}

				// Validate data structure
				if (!this.isValidDataStructure(uploadedData)) {
					throw new Error("Invalid data structure");
				}

				if (onSuccess) onSuccess(uploadedData);
				this.resetFileInput(event.target);
			} catch (error) {
				const errorMessage = `${APP_CONFIG.MESSAGES.INVALID_JSON}: ${error.message}`;
				if (onError) onError(errorMessage);
				this.resetFileInput(event.target);
			}
		};

		reader.onerror = () => {
			const errorMessage = "Error reading file";
			if (onError) onError(errorMessage);
			this.resetFileInput(event.target);
		};

		reader.readAsText(file);
	}

	/**
	 * Handle file download
	 * @param {Object} data - Data to download
	 * @param {string} filename - Filename for download (optional)
	 */
	handleDownload(data, filename = APP_CONFIG.DEFAULT_FILENAME) {
		try {
			const blob = createBlob(data);
			downloadBlob(blob, filename);
			return true;
		} catch (error) {
			console.error("Error downloading file:", error);
			return false;
		}
	}

	/**
	 * Validate file type
	 * @param {File} file - File to validate
	 * @returns {boolean} - True if valid file type
	 */
	isValidFileType(file) {
		if (!file) return false;

		// Check file extension
		const fileName = file.name.toLowerCase();
		const hasValidExtension = APP_CONFIG.SUPPORTED_FILE_TYPES.some((ext) =>
			fileName.endsWith(ext)
		);

		// Check MIME type
		const hasValidMimeType =
			file.type === "application/json" || file.type === "";

		return hasValidExtension && hasValidMimeType;
	}

	/**
	 * Validate data structure
	 * @param {Object} data - Data to validate
	 * @returns {boolean} - True if valid data structure
	 */
	isValidDataStructure(data) {
		if (!data || typeof data !== "object") {
			return false;
		}

		// Check if data has required structure
		const hasDataProperty = data.hasOwnProperty("data");
		const hasConversationsProperty = data.hasOwnProperty("conversations");

		if (!hasDataProperty || !hasConversationsProperty) {
			return false;
		}

		// Validate data property
		if (data.data && typeof data.data !== "object") {
			return false;
		}

		// Validate conversations property
		if (data.conversations && typeof data.conversations !== "object") {
			return false;
		}

		// Validate conversation arrays
		if (data.conversations) {
			for (const [key, conversation] of Object.entries(
				data.conversations
			)) {
				if (!Array.isArray(conversation)) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Reset file input
	 * @param {HTMLInputElement} fileInput - File input element
	 */
	resetFileInput(fileInput) {
		if (fileInput) {
			setValue(fileInput, "");
		}
	}

	/**
	 * Get file info
	 * @param {File} file - File to get info for
	 * @returns {Object} - File information
	 */
	getFileInfo(file) {
		if (!file) return null;

		return {
			name: file.name,
			size: file.size,
			type: file.type,
			lastModified: file.lastModified,
			sizeFormatted: this.formatFileSize(file.size)
		};
	}

	/**
	 * Format file size
	 * @param {number} bytes - File size in bytes
	 * @returns {string} - Formatted file size
	 */
	formatFileSize(bytes) {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}

	/**
	 * Validate file size
	 * @param {File} file - File to validate
	 * @param {number} maxSizeMB - Maximum size in MB
	 * @returns {boolean} - True if file size is valid
	 */
	isValidFileSize(file, maxSizeMB = 10) {
		if (!file) return false;

		const maxSizeBytes = maxSizeMB * 1024 * 1024;
		return file.size <= maxSizeBytes;
	}

	/**
	 * Create file from data
	 * @param {Object} data - Data to create file from
	 * @param {string} filename - Filename
	 * @param {string} mimeType - MIME type
	 * @returns {File} - Created file
	 */
	createFileFromData(data, filename, mimeType = "application/json") {
		try {
			const jsonString = JSON.stringify(data, null, 2);
			const blob = new Blob([jsonString], { type: mimeType });
			return new File([blob], filename, { type: mimeType });
		} catch (error) {
			console.error("Error creating file from data:", error);
			return null;
		}
	}

	/**
	 * Read file as text
	 * @param {File} file - File to read
	 * @returns {Promise<string>} - Promise that resolves with file content
	 */
	readFileAsText(file) {
		return new Promise((resolve, reject) => {
			if (!file) {
				reject(new Error("No file provided"));
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = () => reject(new Error("Error reading file"));
			reader.readAsText(file);
		});
	}

	/**
	 * Read file as JSON
	 * @param {File} file - File to read
	 * @returns {Promise<Object>} - Promise that resolves with parsed JSON
	 */
	readFileAsJSON(file) {
		return new Promise((resolve, reject) => {
			this.readFileAsText(file)
				.then((text) => {
					try {
						const data = JSON.parse(text);
						resolve(data);
					} catch (error) {
						reject(new Error(`Invalid JSON: ${error.message}`));
					}
				})
				.catch(reject);
		});
	}

	/**
	 * Check if browser supports file operations
	 * @returns {Object} - Support status for different file operations
	 */
	checkFileSupport() {
		return {
			fileAPI: !!(window.File && window.FileReader),
			blob: !!window.Blob,
			download: !!(document.createElement("a").download !== undefined),
			dragAndDrop: !!(window.File && window.FileList)
		};
	}

	/**
	 * Setup drag and drop functionality
	 * @param {HTMLElement} element - Element to setup drag and drop on
	 * @param {Function} onDrop - Callback when file is dropped
	 * @param {Function} onError - Error callback
	 */
	setupDragAndDrop(element, onDrop, onError) {
		if (!element) return;

		// Prevent default drag behaviors
		["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
			element.addEventListener(eventName, (e) => {
				e.preventDefault();
				e.stopPropagation();
			});
		});

		// Highlight drop area when item is dragged over it
		["dragenter", "dragover"].forEach((eventName) => {
			element.addEventListener(eventName, () => {
				element.classList.add("drag-over");
			});
		});

		["dragleave", "drop"].forEach((eventName) => {
			element.addEventListener(eventName, () => {
				element.classList.remove("drag-over");
			});
		});

		// Handle dropped files
		element.addEventListener("drop", (e) => {
			const files = e.dataTransfer.files;
			if (files.length > 0) {
				const file = files[0];
				if (this.isValidFileType(file)) {
					// Create a fake event object to reuse existing upload logic
					const fakeEvent = {
						target: { files: [file] }
					};
					this.handleFileUpload(fakeEvent, onDrop, onError);
				} else {
					if (onError) onError(APP_CONFIG.MESSAGES.FILE_NOT_SELECTED);
				}
			}
		});
	}

	/**
	 * Remove drag and drop functionality
	 * @param {HTMLElement} element - Element to remove drag and drop from
	 */
	removeDragAndDrop(element) {
		if (!element) return;

		const events = ["dragenter", "dragover", "dragleave", "drop"];
		events.forEach((eventName) => {
			element.removeEventListener(eventName, (e) => {
				e.preventDefault();
				e.stopPropagation();
			});
		});
	}
}
