/**
 * State Manager Module
 * Handles application state management and coordination between modules
 */

import { APP_CONFIG } from "../utils/constants.js";
import { DataManager } from "./DataManager.js";
import { ValidationManager } from "./ValidationManager.js";
import { UIRenderer } from "./UIRenderer.js";
import { FileHandler } from "./FileHandler.js";
import { logger } from "../utils/Logger.js";

export class StateManager {
	constructor() {
		this.dataManager = new DataManager();
		this.validationManager = new ValidationManager();
		this.uiRenderer = new UIRenderer();
		this.fileHandler = new FileHandler();

		this.isInitialized = false;
		this.hasUnsavedChanges = false;
		this.editingDataId = null;
		this.editingConversationKey = null;

		this.setupEventListeners();
		this.setupBeforeUnloadWarning();
		this.setupGlobalClickLogging();
	}

	/**
	 * Initialize the application
	 */
	initialize() {
		this.showInitialState();
	}

	/**
	 * Setup event listeners
	 */
	setupEventListeners() {
		// Mode 1: Initial state buttons
		this.setupInitialStateListeners();

		// Mode 2: Full app buttons
		this.setupFullAppListeners();

		// Data table controls
		this.setupDataTableListeners();

		// Conversations controls
		this.setupConversationsListeners();

		// Merge field modal controls
		this.setupModalListeners();
	}

	/**
	 * Setup initial state event listeners
	 */
	setupInitialStateListeners() {
		const uploadBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.UPLOAD_BTN
		);
		const startNewProjectBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.START_NEW_PROJECT_BTN
		);

		if (uploadBtn) {
			uploadBtn.addEventListener("click", () =>
				this.handleUploadButtonClick(APP_CONFIG.ELEMENT_IDS.FILE_INPUT)
			);
		}

		if (startNewProjectBtn) {
			startNewProjectBtn.addEventListener("click", () =>
				this.startNewProject()
			);
		}
	}

	/**
	 * Setup full app event listeners
	 */
	setupFullAppListeners() {
		const uploadBtn2 = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.UPLOAD_BTN_2
		);
		const initializeProjectBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.INITIALIZE_PROJECT_BTN
		);
		const dataPanelBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.DATA_PANEL_BTN
		);
		const conversationsPanelBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.CONVERSATIONS_PANEL_BTN
		);
		const downloadBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.DOWNLOAD_BTN
		);

		if (uploadBtn2) {
			uploadBtn2.addEventListener("click", () =>
				this.handleUploadButtonClick(
					APP_CONFIG.ELEMENT_IDS.FILE_INPUT_2
				)
			);
		}

		if (initializeProjectBtn) {
			initializeProjectBtn.addEventListener("click", () =>
				this.initializeProject()
			);
		}

		if (dataPanelBtn) {
			dataPanelBtn.addEventListener("click", () =>
				this.uiRenderer.switchPanel(APP_CONFIG.CSS_CLASSES.DATA_PANEL)
			);
		}

		if (conversationsPanelBtn) {
			conversationsPanelBtn.addEventListener("click", () =>
				this.uiRenderer.switchPanel(
					APP_CONFIG.CSS_CLASSES.CONVERSATIONS_PANEL
				)
			);
		}

		if (downloadBtn) {
			downloadBtn.addEventListener("click", () => this.handleDownload());
		}
	}

	/**
	 * Setup data table event listeners
	 */
	setupDataTableListeners() {
		const addDataBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.ADD_DATA_BTN
		);

		if (addDataBtn) {
			addDataBtn.addEventListener("click", () => this.addDataRow());
		}
	}

	/**
	 * Setup conversations event listeners
	 */
	setupConversationsListeners() {
		const addConversationBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.ADD_CONVERSATION_BTN
		);
		const foldUnfoldAllBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.FOLD_UNFOLD_ALL_BTN
		);

		if (addConversationBtn) {
			addConversationBtn.addEventListener("click", () =>
				this.addConversation()
			);
		}

		if (foldUnfoldAllBtn) {
			foldUnfoldAllBtn.addEventListener("click", () =>
				this.uiRenderer.toggleFoldAll()
			);
		}
	}

	/**
	 * Setup modal event listeners
	 */
	setupModalListeners() {
		const openMergeFieldModalBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.OPEN_MERGE_FIELD_MODAL_BTN
		);
		const openMergeFieldModalBtn2 = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.OPEN_MERGE_FIELD_MODAL_BTN_2
		);
		const closeMergeFieldModal = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.CLOSE_MERGE_FIELD_MODAL
		);
		const modalCancelBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_CANCEL_BTN
		);

		if (openMergeFieldModalBtn) {
			openMergeFieldModalBtn.addEventListener("click", () =>
				this.openMergeFieldModal()
			);
		}

		if (openMergeFieldModalBtn2) {
			openMergeFieldModalBtn2.addEventListener("click", () =>
				this.openMergeFieldModal()
			);
		}

		if (closeMergeFieldModal) {
			closeMergeFieldModal.addEventListener("click", () =>
				this.closeMergeFieldModal()
			);
		}

		if (modalCancelBtn) {
			modalCancelBtn.addEventListener("click", () =>
				this.closeMergeFieldModal()
			);
		}
	}

	/**
	 * Setup before unload warning
	 */
	setupBeforeUnloadWarning() {
		window.addEventListener("beforeunload", (event) => {
			if (this.hasUnsavedChanges) {
				event.preventDefault();
				event.returnValue = APP_CONFIG.MESSAGES.UNSAVED_CHANGES_WARNING;
				return event.returnValue;
			}
		});
	}

	/**
	 * Setup global click logging to capture only interactive element clicks
	 */
	setupGlobalClickLogging() {
		document.addEventListener("click", (event) => {
			const element = event.target;

			// Only log clicks on interactive elements
			if (!this.isInteractiveElement(element)) {
				return;
			}

			const elementInfo = {
				tagName: element.tagName,
				id: element.id,
				className: element.className,
				textContent:
					element.textContent?.substring(0, 100) +
					(element.textContent?.length > 100 ? "..." : ""),
				href: element.href || null,
				type: element.type || null,
				value: element.value || null
			};

			// Get the full path to the element
			const path = [];
			let current = element;
			while (current && current !== document.body) {
				const selector = current.id
					? `#${current.id}`
					: current.className
					? `.${current.className.split(" ")[0]}`
					: current.tagName.toLowerCase();
				path.unshift(selector);
				current = current.parentElement;
			}

			logger.domEvent("click", element, {
				elementPath: path.join(" > "),
				coordinates: { x: event.clientX, y: event.clientY },
				timestamp: event.timeStamp
			});
		});

		// Also log form input changes
		document.addEventListener("input", (event) => {
			const element = event.target;
			if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
				logger.domEvent("input", element, {
					value: element.value,
					field: element.dataset.field || null
				});
			}
		});

		// Log form submissions
		document.addEventListener("submit", (event) => {
			logger.domEvent("submit", event.target, {
				action: event.target.action || null,
				method: event.target.method || null
			});
		});

		logger.debug("Global click logging initialized");
	}

	/**
	 * Check if an element is interactive (should be logged)
	 * @param {HTMLElement} element - Element to check
	 * @returns {boolean} - True if element is interactive
	 */
	isInteractiveElement(element) {
		// Interactive HTML elements
		const interactiveTags = [
			"BUTTON",
			"A",
			"INPUT",
			"SELECT",
			"TEXTAREA",
			"LABEL",
			"SUMMARY",
			"DETAILS",
			"MENU",
			"MENUITEM"
		];

		// Check if element has an interactive tag
		if (interactiveTags.includes(element.tagName)) {
			return true;
		}

		// Check if element has interactive attributes
		if (
			element.hasAttribute("onclick") ||
			element.hasAttribute("onmousedown") ||
			element.hasAttribute("onmouseup") ||
			(element.hasAttribute("role") &&
				["button", "link", "menuitem", "tab"].includes(
					element.getAttribute("role")
				))
		) {
			return true;
		}

		// Check if element has interactive classes (common patterns)
		const interactiveClasses = [
			"btn",
			"button",
			"clickable",
			"link",
			"menu-item",
			"tab",
			"nav-item",
			"dropdown",
			"toggle",
			"switch",
			"checkbox",
			"radio"
		];

		const className = element.className.toLowerCase();
		if (interactiveClasses.some((cls) => className.includes(cls))) {
			return true;
		}

		// Check if element has cursor pointer style
		const computedStyle = window.getComputedStyle(element);
		if (computedStyle.cursor === "pointer") {
			return true;
		}

		// Check if element is focusable
		if (element.tabIndex >= 0) {
			return true;
		}

		return false;
	}

	/**
	 * Show initial state
	 */
	showInitialState() {
		this.uiRenderer.showInitialState();
		this.isInitialized = false;
	}

	/**
	 * Show full app
	 */
	showFullApp() {
		this.uiRenderer.showFullApp();
		this.isInitialized = true;
		this.renderAll();
	}

	/**
	 * Start new project
	 */
	startNewProject() {
		logger.userAction("Start New Project", { action: "startNewProject" });

		this.dataManager.reset();
		this.validationManager.updateDataKeys([]);
		this.hasUnsavedChanges = false;
		this.showFullApp();
		this.markAsSaved();

		logger.info("New project created successfully");
		this.showToast(
			APP_CONFIG.MESSAGES.NEW_PROJECT_CREATED,
			APP_CONFIG.TOAST_TYPES.SUCCESS
		);
	}

	/**
	 * Initialize project (with confirmation if unsaved changes)
	 */
	initializeProject() {
		if (this.hasUnsavedChanges) {
			const confirmed = confirm(APP_CONFIG.MESSAGES.UNSAVED_CHANGES);
			if (!confirmed) return;
		}
		this.startNewProject();
	}

	/**
	 * Handle upload button click
	 * @param {string} fileInputId - File input ID
	 */
	handleUploadButtonClick(fileInputId) {
		const hasExistingData = this.dataManager.hasAnyData();
		this.fileHandler.handleUploadButtonClick(fileInputId, () => {
			if (hasExistingData) {
				return confirm(APP_CONFIG.MESSAGES.REPLACE_DATA);
			}
			return true;
		});
	}

	/**
	 * Handle file upload
	 * @param {Event} event - File upload event
	 */
	handleFileUpload(event) {
		this.fileHandler.handleFileUpload(
			event,
			(data) => {
				this.dataManager.initialize(data);
				this.validationManager.updateDataKeys(
					this.dataManager.getDataKeys()
				);
				this.showFullApp();
				this.markAsSaved();
				this.showToast(
					APP_CONFIG.MESSAGES.FILE_UPLOADED,
					APP_CONFIG.TOAST_TYPES.SUCCESS
				);
			},
			(error) => {
				this.showToast(error, APP_CONFIG.TOAST_TYPES.ERROR);
			}
		);
	}

	/**
	 * Handle download
	 */
	handleDownload() {
		const dataToDownload = this.dataManager.getDataForDownload();
		const success = this.fileHandler.handleDownload(dataToDownload);

		if (success) {
			this.markAsSaved();
			this.showToast(
				APP_CONFIG.MESSAGES.FILE_DOWNLOADED,
				APP_CONFIG.TOAST_TYPES.SUCCESS
			);
		} else {
			this.showToast(
				"Error downloading file",
				APP_CONFIG.TOAST_TYPES.ERROR
			);
		}
	}

	// Data Operations

	/**
	 * Add data row
	 */
	addDataRow() {
		logger.userAction("Add Data Row", { action: "addDataRow" });

		const timestamp = Date.now();
		const newKey = `New Entry ${timestamp}`;
		logger.debug("Creating new data entry", { newKey, timestamp });

		const success = this.dataManager.addDataEntry(newKey, "");
		logger.methodCall(
			"dataManager.addDataEntry",
			{ key: newKey, value: "" },
			success
		);

		if (success) {
			this.editingDataId = newKey;
			logger.uiState("DataTable", "editing", {
				editingDataId: this.editingDataId
			});
			this.renderDataTable();
			this.markAsChanged();
			logger.info("New data row added successfully", { newKey });
		} else {
			logger.error("Failed to add new data row", { newKey });
		}
	}

	/**
	 * Edit data row
	 * @param {string} key - Data key
	 */
	editDataRow(key) {
		logger.userAction("Edit Data Row", { action: "editDataRow", key });
		this.editingDataId = key;
		logger.uiState("DataTable", "editing", {
			editingDataId: this.editingDataId
		});
		this.renderDataTable();
	}

	/**
	 * Save data row
	 * @param {string} oldKey - Old data key
	 */
	saveDataRow(oldKey) {
		logger.userAction("Save Data Row", { action: "saveDataRow", oldKey });

		const row = document.querySelector(`tr[data-key="${oldKey}"]`);
		logger.debug("Looking for data row", { oldKey, rowFound: !!row });

		if (!row) {
			logger.error("Data row not found", { oldKey });
			return;
		}

		const keyInput = row.querySelector('[data-field="key"]');
		const valueInput = row.querySelector('[data-field="value"]');
		logger.debug("Found input elements", {
			keyInputFound: !!keyInput,
			valueInputFound: !!valueInput
		});

		if (!keyInput || !valueInput) {
			logger.error("Missing input elements", {
				keyInput: !!keyInput,
				valueInput: !!valueInput
			});
			return;
		}

		const newKey = keyInput.value.trim();
		const value = valueInput.value.trim();
		logger.debug("Extracted form values", { newKey, value, oldKey });

		if (!newKey || !value) {
			logger.warn("Empty key or value provided", { newKey, value });
			this.showToast(
				APP_CONFIG.MESSAGES.FILL_KEY_VALUE,
				APP_CONFIG.TOAST_TYPES.ERROR
			);
			return;
		}

		logger.dataChange("update", "dataEntry", { oldKey, newKey, value });
		const success = this.dataManager.updateDataEntry(oldKey, newKey, value);
		logger.methodCall(
			"dataManager.updateDataEntry",
			{ oldKey, newKey, value },
			success
		);

		if (success) {
			this.editingDataId = null;
			logger.uiState("DataTable", "viewing", { editingDataId: null });
			this.validationManager.updateDataKeys(
				this.dataManager.getDataKeys()
			);
			this.renderDataTable();
			this.renderConversations();
			this.markAsChanged();
			logger.info("Data row saved successfully", {
				oldKey,
				newKey,
				value
			});
			this.showToast(
				APP_CONFIG.MESSAGES.DATA_SAVED,
				APP_CONFIG.TOAST_TYPES.SUCCESS
			);
		} else {
			logger.error("Failed to save data row", { oldKey, newKey, value });
			this.showToast(
				APP_CONFIG.MESSAGES.KEY_EXISTS,
				APP_CONFIG.TOAST_TYPES.ERROR
			);
		}
	}

	/**
	 * Cancel data edit
	 * @param {string} key - Data key
	 */
	cancelDataEdit(key) {
		if (key.startsWith("New Entry ")) {
			this.dataManager.deleteDataEntry(key);
		}
		this.editingDataId = null;
		this.renderDataTable();
	}

	/**
	 * Delete data row
	 * @param {string} key - Data key
	 */
	deleteDataRow(key) {
		if (confirm(APP_CONFIG.MESSAGES.DELETE_DATA)) {
			this.dataManager.deleteDataEntry(key);
			this.validationManager.updateDataKeys(
				this.dataManager.getDataKeys()
			);
			this.renderDataTable();
			this.renderConversations();
			this.markAsChanged();
			this.showToast(
				APP_CONFIG.MESSAGES.DATA_DELETED,
				APP_CONFIG.TOAST_TYPES.SUCCESS
			);
		}
	}

	// Conversation Operations

	/**
	 * Add conversation
	 */
	addConversation() {
		const timestamp = Date.now();
		const newKey = `New Conversation ${timestamp}`;
		this.dataManager.addConversation(newKey, []);
		this.renderConversations();
		this.markAsChanged();
	}

	/**
	 * Edit conversation title
	 * @param {string} conversationKey - Conversation key
	 */
	editConversationTitle(conversationKey) {
		this.editingConversationKey = conversationKey;
		this.renderConversations();
	}

	/**
	 * Save conversation title
	 * @param {string} oldKey - Old conversation key
	 */
	saveConversationTitle(oldKey) {
		const input = document.querySelector(
			`input[data-conversation-key="${oldKey}"]`
		);
		if (!input) return;

		const newKey = input.value.trim();
		if (!newKey) {
			this.showToast(
				APP_CONFIG.MESSAGES.TITLE_EMPTY,
				APP_CONFIG.TOAST_TYPES.ERROR
			);
			return;
		}

		const success = this.dataManager.updateConversationKey(oldKey, newKey);
		if (success) {
			this.editingConversationKey = null;
			this.renderConversations();
			this.markAsChanged();
			this.showToast(
				APP_CONFIG.MESSAGES.TITLE_UPDATED,
				APP_CONFIG.TOAST_TYPES.SUCCESS
			);
		} else {
			this.showToast(
				APP_CONFIG.MESSAGES.TITLE_EXISTS,
				APP_CONFIG.TOAST_TYPES.ERROR
			);
		}
	}

	/**
	 * Cancel conversation title edit
	 * @param {string} conversationKey - Conversation key
	 */
	cancelConversationTitleEdit(conversationKey) {
		this.editingConversationKey = null;
		this.renderConversations();
	}

	/**
	 * Clone conversation
	 * @param {string} conversationKey - Conversation key
	 */
	cloneConversation(conversationKey) {
		const timestamp = Date.now();
		const newKey = `${conversationKey} (Copy ${timestamp})`;
		this.dataManager.cloneConversation(conversationKey, newKey);
		this.renderConversations();
		this.markAsChanged();
		this.showToast(
			APP_CONFIG.MESSAGES.CONVERSATION_CLONED,
			APP_CONFIG.TOAST_TYPES.SUCCESS
		);
	}

	/**
	 * Delete conversation
	 * @param {string} conversationKey - Conversation key
	 */
	deleteConversation(conversationKey) {
		if (confirm(APP_CONFIG.MESSAGES.DELETE_CONVERSATION)) {
			this.dataManager.deleteConversation(conversationKey);
			this.renderConversations();
			this.markAsChanged();
			this.showToast(
				APP_CONFIG.MESSAGES.CONVERSATION_DELETED,
				APP_CONFIG.TOAST_TYPES.SUCCESS
			);
		}
	}

	/**
	 * Add message to conversation
	 * @param {string} conversationKey - Conversation key
	 */
	addMessage(conversationKey) {
		this.dataManager.addMessage(conversationKey, "");
		this.renderConversations();
		this.markAsChanged();
	}

	/**
	 * Delete message from conversation
	 * @param {string} conversationKey - Conversation key
	 * @param {number} messageIndex - Message index
	 */
	deleteMessage(conversationKey, messageIndex) {
		if (confirm(APP_CONFIG.MESSAGES.DELETE_MESSAGE)) {
			this.dataManager.deleteMessage(conversationKey, messageIndex);
			this.renderConversations();
			this.markAsChanged();
			this.showToast(
				APP_CONFIG.MESSAGES.MESSAGE_DELETED,
				APP_CONFIG.TOAST_TYPES.SUCCESS
			);
		}
	}

	/**
	 * Handle message change
	 * @param {string} conversationKey - Conversation key
	 * @param {number} messageIndex - Message index
	 * @param {string} value - New message value
	 */
	handleMessageChange(conversationKey, messageIndex, value) {
		this.dataManager.updateMessage(conversationKey, messageIndex, value);
		this.markAsChanged();
		this.renderConversations();
	}

	/**
	 * Handle message change without re-rendering the input (for real-time updates)
	 * @param {string} conversationKey - Conversation key
	 * @param {number} messageIndex - Message index
	 * @param {string} value - New message value
	 */
	handleMessageChangeSilent(conversationKey, messageIndex, value) {
		this.dataManager.updateMessage(conversationKey, messageIndex, value);
		this.markAsChanged();
		// Only re-render the output, not the entire conversation
		this.renderConversationOutput(conversationKey);
	}

	/**
	 * Toggle conversation fold
	 * @param {string} conversationKey - Conversation key
	 */
	toggleFold(conversationKey) {
		this.uiRenderer.toggleFold(conversationKey);
	}

	// Merge Field Modal Operations

	/**
	 * Open merge field modal
	 */
	openMergeFieldModal() {
		const modal = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MERGE_FIELD_MODAL
		);
		if (!modal) return;

		this.uiRenderer.updateModalDataPointSelect(
			this.dataManager.getDataEntries()
		);
		this.setupModalMergeFieldGenerator();
		modal.classList.add(APP_CONFIG.CSS_CLASSES.MODAL_SHOW);

		// Add click-outside-to-close functionality
		modal.addEventListener("click", (e) => {
			if (e.target === modal) {
				this.closeMergeFieldModal();
			}
		});
	}

	/**
	 * Close merge field modal
	 */
	closeMergeFieldModal() {
		const modal = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MERGE_FIELD_MODAL
		);
		if (!modal) return;

		modal.classList.remove(APP_CONFIG.CSS_CLASSES.MODAL_SHOW);
		this.resetModalForm();
	}

	/**
	 * Setup modal merge field generator
	 */
	setupModalMergeFieldGenerator() {
		const dataPointSelect = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_DATA_POINT_SELECT
		);
		const mergeTypeSelect = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_MERGE_TYPE_SELECT
		);
		const copyBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_COPY_MERGE_FIELD_BTN
		);

		if (dataPointSelect) {
			dataPointSelect.addEventListener("change", () =>
				this.updateModalMergeFieldPreview()
			);
		}

		if (mergeTypeSelect) {
			mergeTypeSelect.addEventListener("change", () =>
				this.updateModalMergeFieldPreview()
			);
		}

		if (copyBtn) {
			copyBtn.addEventListener("click", () =>
				this.copyModalGeneratedMergeField()
			);
		}
	}

	/**
	 * Update modal merge field preview
	 */
	updateModalMergeFieldPreview() {
		const dataPointSelect = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_DATA_POINT_SELECT
		);
		const mergeTypeSelect = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_MERGE_TYPE_SELECT
		);
		const mergeFieldOutput = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_MERGE_FIELD_OUTPUT
		);
		const mergeFieldValue = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_MERGE_FIELD_VALUE
		);
		const copyBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_COPY_MERGE_FIELD_BTN
		);

		if (
			!dataPointSelect ||
			!mergeTypeSelect ||
			!mergeFieldOutput ||
			!copyBtn
		)
			return;

		const selectedDataPoint = dataPointSelect.value;
		const selectedType = mergeTypeSelect.value;

		if (!selectedDataPoint || !selectedType) {
			mergeFieldOutput.textContent =
				"Select data point and type to generate merge field";
			if (mergeFieldValue) mergeFieldValue.textContent = "";
			copyBtn.disabled = true;
			return;
		}

		// Generate the merge field
		const mergeField = `{!data.${selectedDataPoint}.${selectedType}}`;
		mergeFieldOutput.textContent = mergeField;

		// Show the actual value that will be resolved
		const value = this.dataManager.getDataEntry(selectedDataPoint);
		let resolvedValue = "";

		switch (selectedType) {
			case "key":
				resolvedValue = selectedDataPoint;
				break;
			case "value":
				resolvedValue = value;
				break;
			case "pair":
				resolvedValue = `[${selectedDataPoint}]=[${value}]`;
				break;
		}

		if (mergeFieldValue) {
			mergeFieldValue.textContent = `Will resolve to: "${resolvedValue}"`;
		}
		copyBtn.disabled = false;
	}

	/**
	 * Copy modal generated merge field
	 */
	copyModalGeneratedMergeField() {
		const mergeFieldOutput = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_MERGE_FIELD_OUTPUT
		);
		if (!mergeFieldOutput) return;

		const mergeField = mergeFieldOutput.textContent;
		if (
			mergeField &&
			mergeField !== "Select data point and type to generate merge field"
		) {
			this.copyToClipboard(mergeField);
			this.showToast(
				APP_CONFIG.MESSAGES.MERGE_FIELD_COPIED,
				APP_CONFIG.TOAST_TYPES.SUCCESS
			);
			this.closeMergeFieldModal();
		}
	}

	/**
	 * Reset modal form
	 */
	resetModalForm() {
		const dataPointSelect = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_DATA_POINT_SELECT
		);
		const mergeTypeSelect = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_MERGE_TYPE_SELECT
		);
		const mergeFieldOutput = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_MERGE_FIELD_OUTPUT
		);
		const mergeFieldValue = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_MERGE_FIELD_VALUE
		);
		const copyBtn = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_COPY_MERGE_FIELD_BTN
		);

		if (dataPointSelect) dataPointSelect.value = "";
		if (mergeTypeSelect) mergeTypeSelect.value = "";
		if (mergeFieldOutput)
			mergeFieldOutput.textContent =
				"Select data point and type to generate merge field";
		if (mergeFieldValue) mergeFieldValue.textContent = "";
		if (copyBtn) copyBtn.disabled = true;
	}

	/**
	 * Copy conversation output
	 * @param {string} conversationKey - Conversation key
	 */
	copyConversationOutput(conversationKey) {
		const processedConversation =
			this.dataManager.getProcessedConversation(conversationKey);
		const outputJson = JSON.stringify(processedConversation, null, 2);
		this.copyToClipboard(outputJson);
		this.showToast(
			`Copied conversation "${conversationKey}" JSON output`,
			APP_CONFIG.TOAST_TYPES.SUCCESS
		);
	}

	/**
	 * Copy to clipboard
	 * @param {string} text - Text to copy
	 */
	copyToClipboard(text) {
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(text);
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
			document.execCommand("copy");
			textArea.remove();
		}
	}

	// State Management

	/**
	 * Mark as changed
	 */
	markAsChanged() {
		this.hasUnsavedChanges = true;
		this.uiRenderer.updateDownloadButton(true);
	}

	/**
	 * Mark as saved
	 */
	markAsSaved() {
		this.hasUnsavedChanges = false;
		this.uiRenderer.updateDownloadButton(false);
	}

	// Rendering

	/**
	 * Render all UI components
	 */
	renderAll() {
		this.renderDataTable();
		this.renderConversations();
	}

	/**
	 * Render data table
	 */
	renderDataTable() {
		const dataEntries = this.dataManager.getDataEntries();
		logger.debug("Rendering data table", {
			dataEntriesCount: Object.keys(dataEntries).length,
			editingDataId: this.editingDataId,
			dataEntries: dataEntries
		});
		this.uiRenderer.renderDataTable(dataEntries, this.editingDataId);
	}

	/**
	 * Render conversations
	 */
	renderConversations() {
		const conversations = this.dataManager.getConversations();
		const processedConversations =
			this.dataManager.getProcessedConversations();
		this.uiRenderer.renderConversations(
			conversations,
			processedConversations,
			this.editingConversationKey,
			this.validationManager
		);
	}

	/**
	 * Render only the output for a specific conversation (without re-rendering inputs)
	 * @param {string} conversationKey - Conversation key
	 */
	renderConversationOutput(conversationKey) {
		const conversation = this.dataManager.getConversation(conversationKey);
		const processedConversation =
			this.dataManager.getProcessedConversation(conversationKey);
		if (!conversation || !processedConversation) {
			logger.warn(
				"Conversation or processed conversation not found for output render",
				{ conversationKey }
			);
			return;
		}

		logger.debug("Rendering conversation output only", { conversationKey });
		this.uiRenderer.renderConversationOutput(
			conversationKey,
			processedConversation
		);
	}

	// Toast Notifications

	/**
	 * Show toast notification
	 * @param {string} message - Toast message
	 * @param {string} type - Toast type
	 */
	showToast(message, type = APP_CONFIG.TOAST_TYPES.INFO) {
		const toastContainer = document.getElementById(
			APP_CONFIG.ELEMENT_IDS.TOAST_CONTAINER
		);
		if (!toastContainer) return;

		const toast = document.createElement("div");
		toast.className = `toast toast-${type}`;

		const icon =
			type === APP_CONFIG.TOAST_TYPES.SUCCESS
				? "check-circle"
				: type === APP_CONFIG.TOAST_TYPES.ERROR
				? "exclamation-circle"
				: type === APP_CONFIG.TOAST_TYPES.WARNING
				? "exclamation-triangle"
				: "info-circle";

		toast.innerHTML = `
			<i class="fas fa-${icon}"></i>
			<span>${message}</span>
			<button class="toast-close" onclick="this.parentElement.remove()">
				<i class="fas fa-times"></i>
			</button>
		`;

		toastContainer.appendChild(toast);

		// Log to console for debugging
		if (type === APP_CONFIG.TOAST_TYPES.ERROR) {
			console.error(`[JSON Data Editor] ${message}`);
		} else if (type === APP_CONFIG.TOAST_TYPES.WARNING) {
			console.warn(`[JSON Data Editor] ${message}`);
		} else {
			console.log(`[JSON Data Editor] ${message}`);
		}

		// Auto remove after configured duration
		setTimeout(() => {
			if (toast.parentElement) {
				toast.remove();
			}
		}, APP_CONFIG.TOAST_DURATION);
	}
}
