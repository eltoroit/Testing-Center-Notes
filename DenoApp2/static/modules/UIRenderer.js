/**
 * UI Renderer Module
 * Handles all DOM manipulation and rendering operations
 */

import { APP_CONFIG } from "../utils/constants.js";
import {
	getElementById,
	querySelector,
	querySelectorAll,
	createElement,
	setDisplay,
	show,
	hide,
	setTextContent,
	setInnerHTML,
	clearContent,
	appendChild,
	addClass,
	removeClass,
	hasClass,
	toggleClass
} from "../utils/DOM.js";
import { getRoleForMessage, formatJSON } from "../utils/helpers.js";
import { logger } from "../utils/Logger.js";

export class UIRenderer {
	constructor() {
		this.foldedConversations = new Set();
		this.currentPanel = APP_CONFIG.CSS_CLASSES.DATA_PANEL;
	}

	/**
	 * Show initial state (empty state)
	 */
	showInitialState() {
		const initialState = getElementById(
			APP_CONFIG.ELEMENT_IDS.INITIAL_STATE
		);
		const fullApp = getElementById(APP_CONFIG.ELEMENT_IDS.FULL_APP);

		if (initialState) setDisplay(initialState, "flex");
		if (fullApp) setDisplay(fullApp, "none");
	}

	/**
	 * Show full application
	 */
	showFullApp() {
		const initialState = getElementById(
			APP_CONFIG.ELEMENT_IDS.INITIAL_STATE
		);
		const fullApp = getElementById(APP_CONFIG.ELEMENT_IDS.FULL_APP);

		if (initialState) setDisplay(initialState, "none");
		if (fullApp) setDisplay(fullApp, "block");

		this.switchPanel(this.currentPanel);
	}

	/**
	 * Switch between panels
	 * @param {string} panelName - Panel name ('data' or 'conversations')
	 */
	switchPanel(panelName) {
		this.currentPanel = panelName;

		// Update button states
		const dataPanelBtn = getElementById(
			APP_CONFIG.ELEMENT_IDS.DATA_PANEL_BTN
		);
		const conversationsPanelBtn = getElementById(
			APP_CONFIG.ELEMENT_IDS.CONVERSATIONS_PANEL_BTN
		);

		if (dataPanelBtn && conversationsPanelBtn) {
			if (panelName === APP_CONFIG.CSS_CLASSES.DATA_PANEL) {
				addClass(dataPanelBtn, APP_CONFIG.CSS_CLASSES.ACTIVE);
				removeClass(
					conversationsPanelBtn,
					APP_CONFIG.CSS_CLASSES.ACTIVE
				);
			} else {
				addClass(conversationsPanelBtn, APP_CONFIG.CSS_CLASSES.ACTIVE);
				removeClass(dataPanelBtn, APP_CONFIG.CSS_CLASSES.ACTIVE);
			}
		}

		// Show/hide panels
		const dataPanel = getElementById(APP_CONFIG.ELEMENT_IDS.DATA_PANEL);
		const conversationsPanel = getElementById(
			APP_CONFIG.ELEMENT_IDS.CONVERSATIONS_PANEL
		);

		if (dataPanel && conversationsPanel) {
			if (panelName === APP_CONFIG.CSS_CLASSES.DATA_PANEL) {
				addClass(dataPanel, APP_CONFIG.CSS_CLASSES.ACTIVE);
				removeClass(conversationsPanel, APP_CONFIG.CSS_CLASSES.ACTIVE);
			} else {
				addClass(conversationsPanel, APP_CONFIG.CSS_CLASSES.ACTIVE);
				removeClass(dataPanel, APP_CONFIG.CSS_CLASSES.ACTIVE);
			}
		}
	}

	/**
	 * Render data table
	 * @param {Object} dataEntries - Data entries object
	 * @param {string} editingDataId - Currently editing data ID
	 */
	renderDataTable(dataEntries, editingDataId = null) {
		logger.debug("UIRenderer.renderDataTable called", {
			dataEntriesCount: Object.keys(dataEntries).length,
			editingDataId,
			dataEntries
		});

		const tbody = getElementById(APP_CONFIG.ELEMENT_IDS.DATA_TABLE_BODY);
		const noDataMessage = getElementById(
			APP_CONFIG.ELEMENT_IDS.NO_DATA_MESSAGE
		);
		const dataKeys = Object.keys(dataEntries);

		logger.debug("DOM elements found", {
			tbodyFound: !!tbody,
			noDataMessageFound: !!noDataMessage,
			dataKeysCount: dataKeys.length
		});

		if (dataKeys.length === 0) {
			logger.debug("No data entries, showing empty state");
			if (tbody) clearContent(tbody);
			if (noDataMessage) show(noDataMessage);
			return;
		}

		logger.debug("Rendering data entries", { dataKeys });
		if (noDataMessage) hide(noDataMessage);
		if (tbody) clearContent(tbody);

		dataKeys.forEach((key) => {
			const value = dataEntries[key];
			const isEditing = editingDataId === key;
			logger.debug("Creating data row", { key, value, isEditing });
			const row = this.createDataRow(key, value, isEditing);
			if (tbody) appendChild(tbody, row);
		});

		logger.info("Data table rendered successfully", {
			rowsRendered: dataKeys.length,
			editingDataId
		});
	}

	/**
	 * Create data table row
	 * @param {string} key - Data key
	 * @param {string} value - Data value
	 * @param {boolean} isEditing - Whether row is in editing mode
	 * @returns {HTMLElement} - Table row element
	 */
	createDataRow(key, value, isEditing = false) {
		const row = createElement("tr", { dataset: { key } });

		const keyCell = createElement("td");
		const valueCell = createElement("td");
		const actionsCell = createElement("td");

		if (isEditing) {
			const keyInput = createElement("input", {
				type: "text",
				value: key,
				dataset: { field: "key" },
				className: "form-input"
			});

			const valueInput = createElement("input", {
				type: "text",
				value: value,
				dataset: { field: "value" },
				className: "form-input"
			});

			appendChild(keyCell, keyInput);
			appendChild(valueCell, valueInput);

			const saveBtn = createElement("button", {
				className: "btn btn-sm btn-success",
				innerHTML: '<i class="fas fa-check"></i> Save'
			});
			saveBtn.addEventListener("click", () => {
				if (window.app) {
					window.app.saveDataRow(key);
				}
			});

			const cancelBtn = createElement("button", {
				className: "btn btn-sm btn-secondary",
				innerHTML: '<i class="fas fa-times"></i> Cancel'
			});
			cancelBtn.addEventListener("click", () => {
				if (window.app) {
					window.app.cancelDataEdit(key);
				}
			});

			appendChild(actionsCell, saveBtn);
			appendChild(actionsCell, cancelBtn);
		} else {
			appendChild(keyCell, createElement("span", { textContent: key }));
			appendChild(
				valueCell,
				createElement("span", { textContent: value })
			);

			const editBtn = createElement("button", {
				className: "btn btn-sm btn-primary",
				innerHTML: '<i class="fas fa-edit"></i> Edit'
			});
			editBtn.addEventListener("click", () => {
				if (window.app) {
					window.app.editDataRow(key);
				}
			});

			const deleteBtn = createElement("button", {
				className: "btn btn-sm btn-danger",
				innerHTML: '<i class="fas fa-trash"></i> Delete'
			});
			deleteBtn.addEventListener("click", () => {
				if (window.app) {
					window.app.deleteDataRow(key);
				}
			});

			appendChild(actionsCell, editBtn);
			appendChild(actionsCell, deleteBtn);
		}

		appendChild(row, keyCell);
		appendChild(row, valueCell);
		appendChild(row, actionsCell);

		return row;
	}

	/**
	 * Render conversations
	 * @param {Object} conversations - Conversations object
	 * @param {Object} processedConversations - Processed conversations object
	 * @param {string} editingConversationKey - Currently editing conversation key
	 * @param {ValidationManager} validationManager - Validation manager instance
	 */
	renderConversations(
		conversations,
		processedConversations,
		editingConversationKey = null,
		validationManager
	) {
		const container = getElementById(
			APP_CONFIG.ELEMENT_IDS.CONVERSATIONS_CONTAINER
		);
		const noConversationsMessage = getElementById(
			APP_CONFIG.ELEMENT_IDS.NO_CONVERSATIONS_MESSAGE
		);

		const conversationKeys = Object.keys(conversations);

		if (conversationKeys.length === 0) {
			if (container) clearContent(container);
			if (noConversationsMessage) show(noConversationsMessage);
			return;
		}

		if (noConversationsMessage) hide(noConversationsMessage);
		if (container) clearContent(container);

		conversationKeys.forEach((conversationKey) => {
			const conversation = conversations[conversationKey];
			const conversationElement = this.createConversationElement(
				conversationKey,
				conversation,
				processedConversations[conversationKey] || [],
				editingConversationKey === conversationKey,
				validationManager
			);
			if (container) appendChild(container, conversationElement);
		});
	}

	/**
	 * Create conversation element
	 * @param {string} conversationKey - Conversation key
	 * @param {Array} conversation - Conversation messages
	 * @param {Array} processedConversation - Processed conversation
	 * @param {boolean} isEditingTitle - Whether title is being edited
	 * @param {ValidationManager} validationManager - Validation manager instance
	 * @returns {HTMLElement} - Conversation element
	 */
	createConversationElement(
		conversationKey,
		conversation,
		processedConversation,
		isEditingTitle,
		validationManager
	) {
		const div = createElement("div", {
			className: "conversation-group",
			dataset: { key: conversationKey }
		});

		const isFolded = this.foldedConversations.has(conversationKey);
		const outputJson = formatJSON(processedConversation);

		// Check for validation errors
		const structureValidation =
			validationManager.validateConversationStructure(conversation);
		const hasStructureError = structureValidation.hasErrors;
		const hasMergeFieldErrors =
			validationManager.hasMergeFieldErrors(conversation);
		const hasUnresolvedFields = this.hasUnresolvedMergeFields(
			processedConversation
		);
		const hasAnyErrors =
			hasStructureError || hasUnresolvedFields || hasMergeFieldErrors;

		const outputClass = hasAnyErrors
			? APP_CONFIG.CSS_CLASSES.JSON_ERROR
			: "conversation-json";

		// Create conversation header
		const header = this.createConversationHeader(
			conversationKey,
			isEditingTitle,
			hasAnyErrors,
			isFolded
		);

		// Create conversation content
		const content = this.createConversationContent(
			conversationKey,
			conversation,
			outputJson,
			outputClass,
			hasUnresolvedFields,
			hasStructureError,
			structureValidation.errorMessage,
			isFolded,
			validationManager
		);

		appendChild(div, header);
		appendChild(div, content);

		return div;
	}

	/**
	 * Create conversation header
	 * @param {string} conversationKey - Conversation key
	 * @param {boolean} isEditingTitle - Whether title is being edited
	 * @param {boolean} hasAnyErrors - Whether conversation has errors
	 * @param {boolean} isFolded - Whether conversation is folded
	 * @returns {HTMLElement} - Header element
	 */
	createConversationHeader(
		conversationKey,
		isEditingTitle,
		hasAnyErrors,
		isFolded
	) {
		const header = createElement("div", {
			className: "conversation-header"
		});

		const titleSection = createElement("div", {
			className: "conversation-title"
		});

		// Fold toggle button
		const foldBtn = createElement("button", {
			className: "fold-toggle-btn",
			innerHTML: isFolded
				? '<i class="fa-solid fa-chevron-right"></i>'
				: '<i class="fa-solid fa-chevron-down"></i>',
			title: `${isFolded ? "Unfold" : "Fold"} conversation`,
			onclick: `app.toggleFold('${conversationKey}')`
		});

		appendChild(titleSection, foldBtn);

		// Title display or input
		if (isEditingTitle) {
			const titleInput = createElement("input", {
				type: "text",
				value: conversationKey,
				className: `conversation-title-input ${
					hasAnyErrors
						? APP_CONFIG.CSS_CLASSES.CONVERSATION_ERROR
						: ""
				}`,
				dataset: { conversationKey }
			});

			const saveBtn = createElement("button", {
				className: "btn btn-sm btn-success",
				innerHTML: '<i class="fas fa-check"></i> Save',
				onclick: `app.saveConversationTitle('${conversationKey}')`
			});

			const cancelBtn = createElement("button", {
				className: "btn btn-sm btn-secondary",
				innerHTML: '<i class="fas fa-times"></i> Cancel',
				onclick: `app.cancelConversationTitleEdit('${conversationKey}')`
			});

			appendChild(titleSection, titleInput);
			appendChild(titleSection, saveBtn);
			appendChild(titleSection, cancelBtn);
		} else {
			const titleDisplay = createElement("h3", {
				className: `conversation-title-display ${
					hasAnyErrors
						? APP_CONFIG.CSS_CLASSES.CONVERSATION_ERROR
						: ""
				}`,
				textContent: conversationKey,
				dataset: { conversationKey }
			});

			const editBtn = createElement("button", {
				className: "btn btn-sm btn-primary",
				innerHTML: '<i class="fas fa-edit"></i> Edit Title',
				onclick: `app.editConversationTitle('${conversationKey}')`
			});

			appendChild(titleSection, titleDisplay);
			appendChild(titleSection, editBtn);
		}

		// Actions section
		const actionsSection = createElement("div", {
			className: "conversation-actions"
		});

		const addMessageBtn = createElement("button", {
			className: "btn btn-sm btn-success",
			innerHTML: '<i class="fas fa-plus"></i> Add Message',
			onclick: `app.addMessage('${conversationKey}')`
		});

		const cloneBtn = createElement("button", {
			className: "btn btn-sm btn-primary",
			innerHTML: '<i class="fas fa-copy"></i> Clone',
			onclick: `app.cloneConversation('${conversationKey}')`
		});

		const deleteBtn = createElement("button", {
			className: "btn btn-sm btn-danger",
			innerHTML: '<i class="fas fa-trash"></i> Delete',
			onclick: `app.deleteConversation('${conversationKey}')`
		});

		appendChild(actionsSection, addMessageBtn);
		appendChild(actionsSection, cloneBtn);
		appendChild(actionsSection, deleteBtn);

		appendChild(header, titleSection);
		appendChild(header, actionsSection);

		return header;
	}

	/**
	 * Create conversation content
	 * @param {string} conversationKey - Conversation key
	 * @param {Array} conversation - Conversation messages
	 * @param {string} outputJson - Formatted JSON output
	 * @param {string} outputClass - CSS class for output
	 * @param {boolean} hasUnresolvedFields - Whether has unresolved merge fields
	 * @param {boolean} hasStructureError - Whether has structure errors
	 * @param {string} structureErrorMessage - Structure error message
	 * @param {boolean} isFolded - Whether conversation is folded
	 * @param {ValidationManager} validationManager - Validation manager instance
	 * @returns {HTMLElement} - Content element
	 */
	createConversationContent(
		conversationKey,
		conversation,
		outputJson,
		outputClass,
		hasUnresolvedFields,
		hasStructureError,
		structureErrorMessage,
		isFolded,
		validationManager
	) {
		const content = createElement("div", {
			className: "conversation-content",
			style: { display: isFolded ? "none" : "block" }
		});

		// Structure error message
		if (hasStructureError) {
			const errorDiv = createElement("div", {
				className: "conversation-structure-error",
				textContent: structureErrorMessage
			});
			appendChild(content, errorDiv);
		}

		// Conversation split layout
		const split = createElement("div", { className: "conversation-split" });

		// Input section
		const inputSection = createElement("div", {
			className: "conversation-input"
		});

		const inputHeader = createElement("h4", {
			textContent: "Input Messages"
		});
		appendChild(inputSection, inputHeader);

		const messagesList = createElement("div", {
			className: "messages-list"
		});

		conversation.forEach((message, messageIndex) => {
			const messageElement = this.createMessageInput(
				conversationKey,
				messageIndex,
				message,
				validationManager
			);
			appendChild(messagesList, messageElement);
		});

		appendChild(inputSection, messagesList);

		// Output section
		const outputSection = createElement("div", {
			className: "conversation-output"
		});

		const outputHeader = createElement("div", {
			className: "output-header"
		});

		const outputTitle = createElement("h4", {
			innerHTML: `Output (JSON) ${
				hasUnresolvedFields
					? '<span class="error-indicator" title="Contains unresolved merge fields"><i class="fas fa-exclamation-triangle"></i></span>'
					: ""
			}`
		});

		const copyBtn = createElement("button", {
			className: "btn btn-sm btn-info",
			innerHTML: '<i class="fas fa-copy"></i> Copy JSON',
			onclick: `app.copyConversationOutput('${conversationKey}')`
		});

		appendChild(outputHeader, outputTitle);
		appendChild(outputHeader, copyBtn);
		appendChild(outputSection, outputHeader);

		const outputDiv = createElement("div", {
			className: outputClass,
			textContent: outputJson,
			title: hasUnresolvedFields ? "Contains unresolved merge fields" : ""
		});

		appendChild(outputSection, outputDiv);

		appendChild(split, inputSection);
		appendChild(split, outputSection);
		appendChild(content, split);

		return content;
	}

	/**
	 * Create message input element
	 * @param {string} conversationKey - Conversation key
	 * @param {number} messageIndex - Message index
	 * @param {string} message - Message content
	 * @param {ValidationManager} validationManager - Validation manager instance
	 * @returns {HTMLElement} - Message input element
	 */
	createMessageInput(
		conversationKey,
		messageIndex,
		message,
		validationManager
	) {
		const role = getRoleForMessage(messageIndex);
		const validationResult = validationManager.validateMergeFields(message);
		const hasErrors = validationResult.hasErrors;
		const errorClass = hasErrors
			? APP_CONFIG.CSS_CLASSES.MESSAGE_ERROR
			: "";
		const errorTooltip = hasErrors
			? `title="${validationResult.errorMessage}"`
			: "";

		const row = createElement("div", {
			className: "message-input-row",
			dataset: { conversationKey, messageIndex }
		});

		const labelDiv = createElement("div", { className: "message-label" });
		const roleBadge = createElement("span", {
			className: `role-badge role-${role}`,
			textContent: role
		});
		appendChild(labelDiv, roleBadge);

		const inputDiv = createElement("div", { className: "message-input" });
		const textarea = createElement("textarea", {
			className: `message-textarea ${errorClass}`,
			rows: "2",
			placeholder: `Enter ${role} message...`,
			textContent: message,
			...errorTooltip
		});

		const errorText = createElement("div", {
			className: "message-error-text",
			textContent: validationResult.errorMessage,
			style: { display: hasErrors ? "block" : "none" }
		});

		appendChild(inputDiv, textarea);
		appendChild(inputDiv, errorText);

		const actionsDiv = createElement("div", {
			className: "message-actions"
		});
		const deleteBtn = createElement("button", {
			className: "btn btn-sm btn-danger",
			innerHTML: '<i class="fas fa-trash"></i>',
			onclick: `app.deleteMessage('${conversationKey}', ${messageIndex})`
		});
		appendChild(actionsDiv, deleteBtn);

		appendChild(row, labelDiv);
		appendChild(row, inputDiv);
		appendChild(row, actionsDiv);

		return row;
	}

	/**
	 * Toggle conversation fold state
	 * @param {string} conversationKey - Conversation key
	 */
	toggleFold(conversationKey) {
		const isCurrentlyFolded = this.foldedConversations.has(conversationKey);

		if (isCurrentlyFolded) {
			this.foldedConversations.delete(conversationKey);
		} else {
			this.foldedConversations.add(conversationKey);
		}

		this.updateConversationFoldState(conversationKey);
	}

	/**
	 * Update conversation fold state
	 * @param {string} conversationKey - Conversation key
	 */
	updateConversationFoldState(conversationKey) {
		const conversationElement = querySelector(
			`[data-key="${conversationKey}"]`
		);
		if (!conversationElement) return;

		const isFolded = this.foldedConversations.has(conversationKey);
		const contentElement = querySelector(
			".conversation-content",
			conversationElement
		);
		const foldButton = querySelector(
			".fold-toggle-btn",
			conversationElement
		);

		if (contentElement) {
			setDisplay(contentElement, isFolded ? "none" : "block");
		}

		if (foldButton) {
			setInnerHTML(
				foldButton,
				isFolded
					? '<i class="fa-solid fa-chevron-right"></i>'
					: '<i class="fa-solid fa-chevron-down"></i>'
			);
			foldButton.title = `${isFolded ? "Unfold" : "Fold"} conversation`;
		}
	}

	/**
	 * Toggle fold all conversations
	 */
	toggleFoldAll() {
		const foldUnfoldAllBtn = getElementById(
			APP_CONFIG.ELEMENT_IDS.FOLD_UNFOLD_ALL_BTN
		);
		if (!foldUnfoldAllBtn) return;

		const allConversationKeys = querySelectorAll("[data-key]").length;
		const allFolded =
			Array.from(this.foldedConversations).length === allConversationKeys;

		if (allFolded) {
			// Unfold all
			this.foldedConversations.clear();
			setInnerHTML(
				foldUnfoldAllBtn,
				'<i class="fas fa-chevron-down"></i> Fold All'
			);
		} else {
			// Fold all
			const conversationElements = querySelectorAll("[data-key]");
			conversationElements.forEach((element) => {
				const key = element.dataset.key;
				if (key) this.foldedConversations.add(key);
			});
			setInnerHTML(
				foldUnfoldAllBtn,
				'<i class="fas fa-chevron-up"></i> Unfold All'
			);
		}

		// Update all conversation elements
		Array.from(this.foldedConversations).forEach((key) =>
			this.updateConversationFoldState(key)
		);
	}

	/**
	 * Update conversation error states
	 * @param {string} conversationKey - Conversation key
	 * @param {boolean} hasAnyErrors - Whether conversation has errors
	 */
	updateConversationErrorStates(conversationKey, hasAnyErrors) {
		// Update conversation title display
		const titleDisplayElement = querySelector(
			`[data-key="${conversationKey}"] .conversation-title-display`
		);
		if (titleDisplayElement) {
			toggleClass(
				titleDisplayElement,
				APP_CONFIG.CSS_CLASSES.CONVERSATION_ERROR,
				hasAnyErrors
			);
		}

		// Update conversation title input (if editing)
		const titleInputElement = querySelector(
			`[data-key="${conversationKey}"] .conversation-title-input`
		);
		if (titleInputElement) {
			toggleClass(
				titleInputElement,
				APP_CONFIG.CSS_CLASSES.CONVERSATION_ERROR,
				hasAnyErrors
			);
		}

		// Update output element classes
		const outputElement = querySelector(
			`[data-key="${conversationKey}"] .conversation-json, [data-key="${conversationKey}"] .conversation-json-error`
		);
		if (outputElement) {
			removeClass(outputElement, APP_CONFIG.CSS_CLASSES.JSON_PENDING);

			if (hasAnyErrors) {
				outputElement.className = APP_CONFIG.CSS_CLASSES.JSON_ERROR;
			} else {
				outputElement.className = "conversation-json";
			}
		}
	}

	/**
	 * Update download button state
	 * @param {boolean} hasUnsavedChanges - Whether there are unsaved changes
	 */
	updateDownloadButton(hasUnsavedChanges) {
		const downloadBtn = getElementById(APP_CONFIG.ELEMENT_IDS.DOWNLOAD_BTN);
		if (!downloadBtn) return;

		if (hasUnsavedChanges) {
			addClass(downloadBtn, "btn-danger");
			removeClass(downloadBtn, "btn-primary");
			setInnerHTML(
				downloadBtn,
				'<i class="fas fa-download"></i> Download JSON <i class="fas fa-exclamation-triangle"></i>'
			);
			downloadBtn.title =
				"You have unsaved changes! Download to save your work.";
		} else {
			addClass(downloadBtn, "btn-primary");
			removeClass(downloadBtn, "btn-danger");
			setInnerHTML(
				downloadBtn,
				'<i class="fas fa-download"></i> Download JSON'
			);
			downloadBtn.title = "Download JSON file";
		}
	}

	/**
	 * Check if processed conversation has unresolved merge fields
	 * @param {Array} processedConversation - Processed conversation
	 * @returns {boolean} - True if has unresolved merge fields
	 */
	hasUnresolvedMergeFields(processedConversation) {
		if (!processedConversation || !Array.isArray(processedConversation)) {
			return false;
		}

		return processedConversation.some((message) => {
			if (message && message.message) {
				const mergeFieldPattern = /\{!data\.[^}]+\}/;
				return mergeFieldPattern.test(message.message);
			}
			return false;
		});
	}

	/**
	 * Update modal data point select
	 * @param {Object} dataEntries - Data entries
	 */
	updateModalDataPointSelect(dataEntries) {
		const dataPointSelect = getElementById(
			APP_CONFIG.ELEMENT_IDS.MODAL_DATA_POINT_SELECT
		);
		if (!dataPointSelect) return;

		const dataKeys = Object.keys(dataEntries);

		// Clear existing options except the first one
		setInnerHTML(
			dataPointSelect,
			'<option value="">Select a data point...</option>'
		);

		if (dataKeys.length === 0) {
			const option = createElement("option", {
				value: "",
				textContent: "No data entries available",
				disabled: true
			});
			appendChild(dataPointSelect, option);
			return;
		}

		dataKeys.forEach((key) => {
			const value = dataEntries[key];
			const option = createElement("option", {
				value: key,
				textContent: `${key} (${value})`
			});
			appendChild(dataPointSelect, option);
		});
	}
}
