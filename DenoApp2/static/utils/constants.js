/**
 * Application Constants
 * Centralized configuration and magic numbers
 */

export const APP_CONFIG = {
	// Application metadata
	APP_NAME: "ELTOROit Agentforce Testing Center Helper",
	APP_VERSION: "2.0.0",
	APP_DESCRIPTION: "Conversation History Editor",

	// File handling
	SUPPORTED_FILE_TYPES: [".json"],
	DEFAULT_FILENAME: "data.json",

	// UI Configuration
	TOAST_DURATION: 5000, // 5 seconds
	DEBOUNCE_DELAY: 300, // 300ms (removed as per requirements)
	ANIMATION_DURATION: 300, // 300ms

	// Logging Configuration
	LOGGING: {
		ENABLED: true,
		DEFAULT_LEVEL: "DEBUG", // DEBUG, INFO, WARN, ERROR, FATAL
		MAX_HISTORY: 1000,
		TOGGLE_SHORTCUT: "Ctrl+Shift+L"
	},

	// Validation
	MIN_CONVERSATION_MESSAGES: 2,
	VALID_MERGE_FIELD_TYPES: ["key", "value", "pair"],
	MERGE_FIELD_PATTERN: /^\{!data\.([^.]+)\.([^}]+)\}$/,

	// CSS Classes
	CSS_CLASSES: {
		// States
		ACTIVE: "active",
		ERROR: "error",
		SUCCESS: "success",
		PENDING: "pending",
		FOLDED: "folded",

		// UI Elements
		MODAL_SHOW: "show",
		MESSAGE_ERROR: "message-textarea-error",
		CONVERSATION_ERROR: "conversation-title-error",
		JSON_ERROR: "conversation-json-error",
		JSON_PENDING: "conversation-json-pending",

		// Panels
		DATA_PANEL: "data",
		CONVERSATIONS_PANEL: "conversations"
	},

	// Element IDs
	ELEMENT_IDS: {
		// Main containers
		INITIAL_STATE: "initialState",
		FULL_APP: "fullApp",
		DATA_PANEL: "dataPanel",
		CONVERSATIONS_PANEL: "conversationsPanel",

		// File inputs
		FILE_INPUT: "fileInput",
		FILE_INPUT_2: "fileInput2",

		// Buttons
		UPLOAD_BTN: "uploadBtn",
		UPLOAD_BTN_2: "uploadBtn2",
		START_NEW_PROJECT_BTN: "startNewProjectBtn",
		INITIALIZE_PROJECT_BTN: "initializeProjectBtn",
		DOWNLOAD_BTN: "downloadBtn",
		DATA_PANEL_BTN: "dataPanelBtn",
		CONVERSATIONS_PANEL_BTN: "conversationsPanelBtn",

		// Data table
		DATA_TABLE_BODY: "dataTableBody",
		NO_DATA_MESSAGE: "noDataMessage",
		ADD_DATA_BTN: "addDataBtn",

		// Conversations
		CONVERSATIONS_CONTAINER: "conversationsContainer",
		NO_CONVERSATIONS_MESSAGE: "noConversationsMessage",
		ADD_CONVERSATION_BTN: "addConversationBtn",
		FOLD_UNFOLD_ALL_BTN: "foldUnfoldAllBtn",

		// Modal
		MERGE_FIELD_MODAL: "mergeFieldModal",
		OPEN_MERGE_FIELD_MODAL_BTN: "openMergeFieldModalBtn",
		OPEN_MERGE_FIELD_MODAL_BTN_2: "openMergeFieldModalBtn2",
		CLOSE_MERGE_FIELD_MODAL: "closeMergeFieldModal",
		MODAL_CANCEL_BTN: "modalCancelBtn",
		MODAL_DATA_POINT_SELECT: "modalDataPointSelect",
		MODAL_MERGE_TYPE_SELECT: "modalMergeTypeSelect",
		MODAL_MERGE_FIELD_OUTPUT: "modalMergeFieldOutput",
		MODAL_MERGE_FIELD_VALUE: "modalMergeFieldValue",
		MODAL_COPY_MERGE_FIELD_BTN: "modalCopyMergeFieldBtn",

		// Toast
		TOAST_CONTAINER: "toastContainer"
	},

	// Messages
	MESSAGES: {
		// Success messages
		FILE_UPLOADED: "File uploaded successfully",
		FILE_DOWNLOADED: "File downloaded successfully",
		DATA_SAVED: "Data saved successfully",
		DATA_DELETED: "Data entry deleted",
		CONVERSATION_ADDED: "Conversation added successfully",
		CONVERSATION_CLONED: "Conversation cloned successfully",
		CONVERSATION_DELETED: "Conversation deleted",
		MESSAGE_DELETED: "Message deleted",
		TITLE_UPDATED: "Conversation title updated successfully",
		NEW_PROJECT_CREATED: "New project created successfully",
		MERGE_FIELD_COPIED: "Merge field copied to clipboard",

		// Error messages
		INVALID_JSON: "Invalid JSON file",
		FILE_NOT_SELECTED: "Please select a valid JSON file",
		KEY_EXISTS: "Key already exists. Please choose a different key.",
		TITLE_EXISTS:
			"Conversation title already exists. Please choose a different title.",
		TITLE_EMPTY: "Conversation title cannot be empty",
		FILL_KEY_VALUE: "Please fill in key and value",
		MESSAGE_BLANK:
			"Message cannot be blank. Please enter at least one non-whitespace character.",
		INVALID_MERGE_FIELD:
			"Invalid merge field format. Use {!data.key.field} format.",
		MISSING_EXCLAMATION:
			"Missing '!' in merge field. Use {!data.key.field} format.",
		MISSING_OPENING_BRACE:
			"Missing opening brace '{'. Use {!data.key.field} format.",
		MISSING_CLOSING_BRACE:
			"Missing closing brace '}'. Use {!data.key.field} format.",
		INVALID_FIELD_TYPE:
			'Invalid field type. Use "key", "value", or "pair".',
		DATA_KEY_NOT_FOUND: "Data key not found",
		CONVERSATION_TOO_SHORT:
			"Conversation must have at least 2 messages (user/agent pair).",
		CONVERSATION_ODD_MESSAGES:
			"Conversation must have an even number of messages (user/agent pairs).",

		// Confirmation messages
		REPLACE_DATA:
			"This will replace all existing data. Are you sure you want to continue?",
		UNSAVED_CHANGES:
			"You have unsaved changes. Are you sure you want to start a new project? Make sure to download your current work first!",
		DELETE_DATA: "Are you sure you want to delete this data entry?",
		DELETE_CONVERSATION:
			"Are you sure you want to delete this conversation?",
		DELETE_MESSAGE: "Are you sure you want to delete this message?",

		// Warning messages
		UNSAVED_CHANGES_WARNING:
			"You have unsaved changes. Are you sure you want to leave? Make sure to download your JSON file to save your work."
	},

	// Toast types
	TOAST_TYPES: {
		SUCCESS: "success",
		ERROR: "error",
		WARNING: "warning",
		INFO: "info"
	},

	// Role types
	ROLES: {
		USER: "user",
		AGENT: "agent"
	},

	// Merge field types
	MERGE_FIELD_TYPES: {
		KEY: "key",
		VALUE: "value",
		PAIR: "pair"
	}
};

export const DEFAULT_DATA_STRUCTURE = {
	data: {
		sample: "123"
	},
	conversations: {}
};

export const EMPTY_STATE_MESSAGES = {
	NO_DATA: "No data entries found. Add some data to get started.",
	NO_CONVERSATIONS:
		"No conversations found. Add some conversations to get started."
};
