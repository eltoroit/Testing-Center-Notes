class JsonDataEditor {
	constructor() {
		this.jsonData = {
			data: {},
			conversations: {}
		};
		this.processedConversations = {};
		this.isLoading = false;
		this.showDataTable = true;
		this.showConversationsTable = true;
		this.editingDataId = null;
		this.editingConversationKey = null;
		this.editingMessageIndex = null;

		this.initializeEventListeners();
	}

	initializeEventListeners() {
		// File operations
		document
			.getElementById("fileInput")
			.addEventListener("change", (e) => this.handleFileUpload(e));
		document
			.getElementById("downloadBtn")
			.addEventListener("click", () => this.handleDownload());

		// Tab controls
		document
			.getElementById("dataTab")
			.addEventListener("click", () => this.switchTab("data"));
		document
			.getElementById("conversationsTab")
			.addEventListener("click", () => this.switchTab("conversations"));

		// Data table controls
		document
			.getElementById("addDataBtn")
			.addEventListener("click", () => this.addDataRow());

		// Conversations controls
		document
			.getElementById("addConversationBtn")
			.addEventListener("click", () => this.addConversation());

		// Merge field modal controls (only if elements exist)
		const openMergeFieldModalBtn = document.getElementById(
			"openMergeFieldModalBtn"
		);
		const openMergeFieldModalBtn2 = document.getElementById(
			"openMergeFieldModalBtn2"
		);
		const closeMergeFieldModal = document.getElementById(
			"closeMergeFieldModal"
		);
		const modalCancelBtn = document.getElementById("modalCancelBtn");

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

	handleFileUpload(event) {
		const file = event.target.files[0];
		if (file && file.type === "application/json") {
			// Check if there's existing data and ask for confirmation
			const hasExistingData =
				Object.keys(this.jsonData.data).length > 0 ||
				Object.keys(this.jsonData.conversations).length > 0;

			if (hasExistingData) {
				const confirmed = confirm(
					"This will replace all existing data. Are you sure you want to continue?"
				);
				if (!confirmed) {
					// Reset the file input so it can be used again
					event.target.value = "";
					return;
				}
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const uploadedData = JSON.parse(e.target.result);
					// Remove any existing processed data
					if (uploadedData.processedConversations) {
						delete uploadedData.processedConversations;
					}

					// Keep conversations in object format to preserve keys
					// No conversion needed - we'll work with the object format directly

					this.jsonData = uploadedData;
					this.showMainContent();
					this.renderDataTable();
					this.renderConversations();
					this.processConversations();
					this.showToast("File uploaded successfully", "success");
				} catch (error) {
					this.showToast(
						"Invalid JSON file: " + error.message,
						"error"
					);
				}
			};
			reader.readAsText(file);

			// Reset the file input so it can be used again
			event.target.value = "";
		} else {
			this.showToast("Please select a valid JSON file", "error");
			// Reset the file input
			event.target.value = "";
		}
	}

	handleDownload() {
		// Use the same keys for both conversations and processedConversations
		const dataToDownload = {
			...this.jsonData,
			processedConversations: this.processedConversations
		};

		const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
			type: "application/json"
		});

		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "data.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		this.showToast("File downloaded successfully", "success");
	}

	switchTab(tabName) {
		// Update tab buttons
		document
			.querySelectorAll(".tab-btn")
			.forEach((btn) => btn.classList.remove("active"));
		document.getElementById(tabName + "Tab").classList.add("active");

		// Update tab content
		document
			.querySelectorAll(".tab-content")
			.forEach((content) => content.classList.remove("active"));
		document.getElementById(tabName + "Section").classList.add("active");
	}

	// Data Table Methods
	renderDataTable() {
		const tbody = document.getElementById("dataTableBody");
		const noDataMessage = document.getElementById("noDataMessage");
		const dataEntries = Object.keys(this.jsonData.data);

		if (dataEntries.length === 0) {
			tbody.innerHTML = "";
			noDataMessage.style.display = "block";
			return;
		}

		noDataMessage.style.display = "none";
		tbody.innerHTML = "";

		dataEntries.forEach((key) => {
			const value = this.jsonData.data[key];
			const row = this.createDataRow(key, value);
			tbody.appendChild(row);
		});

		// Also render merge fields
		this.renderMergeFields();
	}

	renderMergeFields() {
		// This method is now just for compatibility - modal handles everything
	}

	updateDataPointSelect() {
		const dataPointSelect = document.getElementById("dataPointSelect");

		if (!dataPointSelect) {
			return;
		}

		const dataEntries = Object.keys(this.jsonData.data);

		// Clear existing options except the first one
		dataPointSelect.innerHTML =
			'<option value="">Select a data point...</option>';

		if (dataEntries.length === 0) {
			const option = document.createElement("option");
			option.value = "";
			option.textContent = "No data entries available";
			option.disabled = true;
			dataPointSelect.appendChild(option);
			return;
		}

		dataEntries.forEach((key) => {
			const value = this.jsonData.data[key];
			const option = document.createElement("option");
			option.value = key;
			option.textContent = `${key} (${value})`;
			dataPointSelect.appendChild(option);
		});
	}

	setupMergeFieldGenerator() {
		const dataPointSelect = document.getElementById("dataPointSelect");
		const mergeTypeSelect = document.getElementById("mergeTypeSelect");
		const copyBtn = document.getElementById("copyMergeFieldBtn");

		// Only add event listeners if elements exist
		if (dataPointSelect) {
			dataPointSelect.addEventListener("change", () =>
				this.updateMergeFieldPreview()
			);
		}
		if (mergeTypeSelect) {
			mergeTypeSelect.addEventListener("change", () =>
				this.updateMergeFieldPreview()
			);
		}
		if (copyBtn) {
			copyBtn.addEventListener("click", () =>
				this.copyGeneratedMergeField()
			);
		}
	}

	updateMergeFieldPreview() {
		const dataPointSelect = document.getElementById("dataPointSelect");
		const mergeTypeSelect = document.getElementById("mergeTypeSelect");
		const mergeFieldOutput = document.getElementById("mergeFieldOutput");
		const mergeFieldValue = document.getElementById("mergeFieldValue");
		const copyBtn = document.getElementById("copyMergeFieldBtn");

		// Return early if elements don't exist
		if (
			!dataPointSelect ||
			!mergeTypeSelect ||
			!mergeFieldOutput ||
			!mergeFieldValue ||
			!copyBtn
		) {
			return;
		}

		const selectedDataPoint = dataPointSelect.value;
		const selectedType = mergeTypeSelect.value;

		if (!selectedDataPoint || !selectedType) {
			mergeFieldOutput.textContent =
				"Select data point and type to generate merge field";
			mergeFieldValue.textContent = "";
			copyBtn.disabled = true;
			return;
		}

		// Generate the merge field
		const mergeField = `{!data.${selectedDataPoint}.${selectedType}}`;
		mergeFieldOutput.textContent = mergeField;

		// Show the actual value that will be resolved
		const value = this.jsonData.data[selectedDataPoint];
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

		mergeFieldValue.textContent = `Will resolve to: "${resolvedValue}"`;
		copyBtn.disabled = false;
	}

	copyGeneratedMergeField() {
		const mergeFieldOutput = document.getElementById("mergeFieldOutput");

		if (!mergeFieldOutput) {
			return;
		}

		const mergeField = mergeFieldOutput.textContent;

		if (
			mergeField &&
			mergeField !== "Select data point and type to generate merge field"
		) {
			this.copyToClipboard(mergeField);
			this.showToast(`Copied: ${mergeField}`, "success");
		}
	}

	// Modal methods
	openMergeFieldModal() {
		const modal = document.getElementById("mergeFieldModal");
		this.updateModalDataPointSelect();
		this.setupModalMergeFieldGenerator();
		modal.classList.add("show");

		// Add click-outside-to-close functionality
		modal.addEventListener("click", (e) => {
			if (e.target === modal) {
				this.closeMergeFieldModal();
			}
		});
	}

	closeMergeFieldModal() {
		const modal = document.getElementById("mergeFieldModal");
		modal.classList.remove("show");
		// Reset form
		document.getElementById("modalDataPointSelect").value = "";
		document.getElementById("modalMergeTypeSelect").value = "";
		document.getElementById("modalMergeFieldOutput").textContent =
			"Select data point and type to generate merge field";
		document.getElementById("modalMergeFieldValue").textContent = "";
		document.getElementById("modalCopyMergeFieldBtn").disabled = true;
	}

	updateModalDataPointSelect() {
		const dataPointSelect = document.getElementById("modalDataPointSelect");
		const dataEntries = Object.keys(this.jsonData.data);

		// Clear existing options except the first one
		dataPointSelect.innerHTML =
			'<option value="">Select a data point...</option>';

		if (dataEntries.length === 0) {
			const option = document.createElement("option");
			option.value = "";
			option.textContent = "No data entries available";
			option.disabled = true;
			dataPointSelect.appendChild(option);
			return;
		}

		dataEntries.forEach((key) => {
			const value = this.jsonData.data[key];
			const option = document.createElement("option");
			option.value = key;
			option.textContent = `${key} (${value})`;
			dataPointSelect.appendChild(option);
		});
	}

	setupModalMergeFieldGenerator() {
		const dataPointSelect = document.getElementById("modalDataPointSelect");
		const mergeTypeSelect = document.getElementById("modalMergeTypeSelect");
		const copyBtn = document.getElementById("modalCopyMergeFieldBtn");

		// Remove existing event listeners by cloning the elements
		const newDataPointSelect = dataPointSelect.cloneNode(true);
		const newMergeTypeSelect = mergeTypeSelect.cloneNode(true);
		dataPointSelect.parentNode.replaceChild(
			newDataPointSelect,
			dataPointSelect
		);
		mergeTypeSelect.parentNode.replaceChild(
			newMergeTypeSelect,
			mergeTypeSelect
		);

		// Add event listeners to new elements
		newDataPointSelect.addEventListener("change", () =>
			this.updateModalMergeFieldPreview()
		);
		newMergeTypeSelect.addEventListener("change", () =>
			this.updateModalMergeFieldPreview()
		);
		copyBtn.addEventListener("click", () =>
			this.copyModalGeneratedMergeField()
		);
	}

	updateModalMergeFieldPreview() {
		const dataPointSelect = document.getElementById("modalDataPointSelect");
		const mergeTypeSelect = document.getElementById("modalMergeTypeSelect");
		const mergeFieldOutput = document.getElementById(
			"modalMergeFieldOutput"
		);
		const mergeFieldValue = document.getElementById("modalMergeFieldValue");
		const copyBtn = document.getElementById("modalCopyMergeFieldBtn");

		const selectedDataPoint = dataPointSelect.value;
		const selectedType = mergeTypeSelect.value;

		if (!selectedDataPoint || !selectedType) {
			mergeFieldOutput.textContent =
				"Select data point and type to generate merge field";
			mergeFieldValue.textContent = "";
			copyBtn.disabled = true;
			return;
		}

		// Generate the merge field
		const mergeField = `{!data.${selectedDataPoint}.${selectedType}}`;
		mergeFieldOutput.textContent = mergeField;

		// Show the actual value that will be resolved
		const value = this.jsonData.data[selectedDataPoint];
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

		mergeFieldValue.textContent = `Will resolve to: "${resolvedValue}"`;
		copyBtn.disabled = false;
	}

	copyModalGeneratedMergeField() {
		const mergeFieldOutput = document.getElementById(
			"modalMergeFieldOutput"
		);
		const mergeField = mergeFieldOutput.textContent;

		if (
			mergeField &&
			mergeField !== "Select data point and type to generate merge field"
		) {
			this.copyToClipboard(mergeField);
			this.showToast(`Copied: ${mergeField}`, "success");
			this.closeMergeFieldModal();
		}
	}

	copyConversationOutput(conversationKey) {
		const processedConversation =
			this.processedConversations[conversationKey] || [];
		const outputJson = JSON.stringify(processedConversation, null, 2);

		this.copyToClipboard(outputJson);
		this.showToast(
			`Copied conversation "${conversationKey}" JSON output`,
			"success"
		);
	}

	copyToClipboard(text) {
		if (navigator.clipboard && window.isSecureContext) {
			// Use modern clipboard API
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

	createDataRow(key, value) {
		const row = document.createElement("tr");
		row.dataset.key = key;

		const isEditing = this.editingDataId === key;

		row.innerHTML = `
            <td>
                ${
					isEditing
						? `<input type="text" value="${key}" data-field="key" class="form-input">`
						: `<span>${key}</span>`
				}
            </td>
            <td>
                ${
					isEditing
						? `<input type="text" value="${value}" data-field="value" class="form-input">`
						: `<span>${value}</span>`
				}
            </td>
            <td>
                ${
					isEditing
						? `<button class="btn btn-sm btn-success" onclick="app.saveDataRow('${key}')">
                        <i class="fas fa-check"></i> Save
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="app.cancelDataEdit('${key}')">
                        <i class="fas fa-times"></i> Cancel
                    </button>`
						: `<button class="btn btn-sm btn-primary" onclick="app.editDataRow('${key}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteDataRow('${key}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>`
				}
            </td>
        `;

		return row;
	}

	addDataRow() {
		// Generate a more user-friendly key
		const timestamp = Date.now();
		const newKey = `New Entry ${timestamp}`;
		this.jsonData.data[newKey] = "";
		this.editingDataId = newKey;
		this.renderDataTable();
	}

	editDataRow(key) {
		this.editingDataId = key;
		this.renderDataTable();
	}

	saveDataRow(oldKey) {
		const row = document.querySelector(`tr[data-key="${oldKey}"]`);
		const keyInput = row.querySelector('[data-field="key"]');
		const valueInput = row.querySelector('[data-field="value"]');

		const newKey = keyInput.value.trim();
		const value = valueInput.value.trim();

		if (newKey && value) {
			// Check if key is being changed and if new key already exists
			if (newKey !== oldKey && this.jsonData.data[newKey]) {
				this.showToast(
					"Key already exists. Please choose a different key.",
					"error"
				);
				return;
			}

			// If key is being changed, we need to update the data structure
			if (newKey !== oldKey) {
				// Store the data with new key
				this.jsonData.data[newKey] = value;
				// Remove the old key
				delete this.jsonData.data[oldKey];
			} else {
				// Just update the existing entry
				this.jsonData.data[oldKey] = value;
			}

			this.editingDataId = null;
			this.renderDataTable();
			this.processConversations();
			this.showToast("Data saved successfully", "success");
		} else {
			this.showToast("Please fill in key and value", "error");
		}
	}

	cancelDataEdit(key) {
		if (key.startsWith("New Entry ")) {
			delete this.jsonData.data[key];
		}
		this.editingDataId = null;
		this.renderDataTable();
	}

	deleteDataRow(key) {
		if (confirm("Are you sure you want to delete this data entry?")) {
			delete this.jsonData.data[key];
			this.renderDataTable();
			this.processConversations();
			this.showToast("Data entry deleted", "success");
		}
	}

	// Conversations Methods
	renderConversations() {
		const container = document.getElementById("conversationsContainer");
		const noConversationsMessage = document.getElementById(
			"noConversationsMessage"
		);

		const conversationKeys = Object.keys(this.jsonData.conversations);
		if (conversationKeys.length === 0) {
			container.innerHTML = "";
			noConversationsMessage.style.display = "block";
			return;
		}

		noConversationsMessage.style.display = "none";
		container.innerHTML = "";

		conversationKeys.forEach((conversationKey) => {
			const conversation = this.jsonData.conversations[conversationKey];
			const conversationElement = this.createConversationElement(
				conversationKey,
				conversation
			);
			container.appendChild(conversationElement);
		});
	}

	createConversationElement(conversationKey, conversation) {
		const div = document.createElement("div");
		div.className = "conversation-group";
		div.dataset.key = conversationKey;

		const processedConversation =
			this.processedConversations[conversationKey] || [];
		const outputJson = JSON.stringify(processedConversation, null, 2);
		const hasUnresolvedFields = this.hasUnresolvedMergeFields(
			processedConversation
		);
		const outputClass = hasUnresolvedFields
			? "conversation-json-error"
			: "conversation-json";

		const isEditingTitle = this.editingConversationKey === conversationKey;

		div.innerHTML = `
            <div class="conversation-header">
                <div class="conversation-title">
                    ${
						isEditingTitle
							? `<input type="text" value="${conversationKey}" class="conversation-title-input" data-conversation-key="${conversationKey}">`
							: `<h3 class="conversation-title-display" data-conversation-key="${conversationKey}">${conversationKey}</h3>`
					}
                    ${
						isEditingTitle
							? `<button class="btn btn-sm btn-success" onclick="app.saveConversationTitle('${conversationKey}')">
                            <i class="fas fa-check"></i> Save
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="app.cancelConversationTitleEdit('${conversationKey}')">
                            <i class="fas fa-times"></i> Cancel
                        </button>`
							: `<button class="btn btn-sm btn-primary" onclick="app.editConversationTitle('${conversationKey}')">
                            <i class="fas fa-edit"></i> Edit Title
                        </button>`
					}
                </div>
                <div class="conversation-actions">
                    <button class="btn btn-sm btn-success" onclick="app.addMessage('${conversationKey}')">
                        <i class="fas fa-plus"></i> Add Message
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="app.cloneConversation('${conversationKey}')">
                        <i class="fas fa-copy"></i> Clone
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteConversation('${conversationKey}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>

            <div class="conversation-split">
                <div class="conversation-input">
                    <h4>Input Messages</h4>
                    <div class="messages-list">
                        ${conversation
							.map((message, messageIndex) =>
								this.createMessageInput(
									conversationKey,
									messageIndex,
									message
								)
							)
							.join("")}
                    </div>
                </div>
                <div class="conversation-output">
                    <div class="output-header">
                        <h4>Output (JSON) ${
							hasUnresolvedFields
								? '<span class="error-indicator" title="Contains unresolved merge fields"><i class="fas fa-exclamation-triangle"></i></span>'
								: ""
						}</h4>
                        <button class="btn btn-sm btn-info" onclick="app.copyConversationOutput('${conversationKey}')">
                            <i class="fas fa-copy"></i> Copy JSON
                        </button>
                    </div>
                    <div class="${outputClass}" title="${
			hasUnresolvedFields ? "Contains unresolved merge fields" : ""
		}">${outputJson}</div>
                </div>
            </div>
        `;

		// Add event listeners to message textareas
		const messageTextareas = div.querySelectorAll(".message-textarea");
		messageTextareas.forEach((textarea, messageIndex) => {
			textarea.addEventListener("input", (e) => {
				this.handleMessageChange(
					conversationKey,
					messageIndex,
					e.target.value
				);
			});

			// Validate the current content
			this.validateAndUpdateMessageInput(
				conversationKey,
				messageIndex,
				textarea.value
			);
		});

		return div;
	}

	createMessageInput(conversationKey, messageIndex, message) {
		const role = this.getRoleForMessage(messageIndex);
		const hasErrors = this.validateMergeFields(message);
		const errorClass = hasErrors ? "message-textarea-error" : "";
		const errorTooltip = hasErrors
			? 'title="Invalid merge field detected. Check that data keys match exactly (including spaces)."'
			: "";

		return `
            <div class="message-input-row" data-conversation-key="${conversationKey}" data-message-index="${messageIndex}">
                <div class="message-label">
                    <span class="role-badge role-${role}">${role}</span>
                </div>
                <div class="message-input">
                    <textarea 
                        class="message-textarea ${errorClass}" 
                        rows="2"
                        placeholder="Enter ${role} message..."
                        ${errorTooltip}
                    >${message}</textarea>
                </div>
                <div class="message-actions">
                    <button class="btn btn-sm btn-danger" onclick="app.deleteMessage('${conversationKey}', ${messageIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
	}

	// Conversation title editing methods
	editConversationTitle(conversationKey) {
		this.editingConversationKey = conversationKey;
		this.renderConversations();
	}

	saveConversationTitle(oldKey) {
		const input = document.querySelector(
			`input[data-conversation-key="${oldKey}"]`
		);
		const newKey = input.value.trim();

		if (!newKey) {
			this.showToast("Conversation title cannot be empty", "error");
			return;
		}

		if (newKey !== oldKey) {
			// Check if new key already exists
			if (this.jsonData.conversations[newKey]) {
				this.showToast(
					"Conversation title already exists. Please choose a different title.",
					"error"
				);
				return;
			}

			// Update the conversation key
			const conversation = this.jsonData.conversations[oldKey];
			const processedConversation = this.processedConversations[oldKey];

			// Remove old entries
			delete this.jsonData.conversations[oldKey];
			if (processedConversation) {
				delete this.processedConversations[oldKey];
			}

			// Add with new key
			this.jsonData.conversations[newKey] = conversation;
			if (processedConversation) {
				this.processedConversations[newKey] = processedConversation;
			}
		}

		this.editingConversationKey = null;
		this.renderConversations();
		this.showToast("Conversation title updated successfully", "success");
	}

	cancelConversationTitleEdit(conversationKey) {
		this.editingConversationKey = null;
		this.renderConversations();
	}

	addConversation() {
		const timestamp = Date.now();
		const newKey = `New Conversation ${timestamp}`;
		this.jsonData.conversations[newKey] = [];
		this.renderConversations();
		this.processConversations();
	}

	cloneConversation(conversationKey) {
		const originalConversation = [
			...this.jsonData.conversations[conversationKey]
		];
		const timestamp = Date.now();
		const newKey = `${conversationKey} (Copy ${timestamp})`;
		this.jsonData.conversations[newKey] = originalConversation;
		this.renderConversations();
		this.processConversations();
		this.showToast("Conversation cloned successfully", "success");
	}

	addMessage(conversationKey) {
		this.jsonData.conversations[conversationKey].push("");
		this.renderConversations();
		this.processConversations();
	}

	deleteMessage(conversationKey, messageIndex) {
		if (confirm("Are you sure you want to delete this message?")) {
			this.jsonData.conversations[conversationKey].splice(
				messageIndex,
				1
			);
			this.renderConversations();
			this.processConversations();
			this.showToast("Message deleted", "success");
		}
	}

	handleMessageChange(conversationKey, messageIndex, value) {
		this.jsonData.conversations[conversationKey][messageIndex] = value;
		this.processConversations();
		this.validateAndUpdateMessageInput(
			conversationKey,
			messageIndex,
			value
		);
	}

	validateMergeFields(message) {
		if (!message || !this.jsonData.data) {
			return false;
		}

		// Find all merge field patterns: {!data.KeyName.field}
		const mergeFieldPattern = /\{!data\.([^}]+)\}/g;
		let match;
		const availableKeys = Object.keys(this.jsonData.data);

		while ((match = mergeFieldPattern.exec(message)) !== null) {
			const fieldPath = match[1]; // e.g., "ClaireDufur.pair"
			const parts = fieldPath.split(".");

			if (parts.length === 2) {
				const keyName = parts[0];
				const fieldName = parts[1];

				// Check if the key exists in our data
				if (!availableKeys.includes(keyName)) {
					return true; // Found an invalid merge field
				}
			}
		}

		return false; // No errors found
	}

	validateAndUpdateMessageInput(conversationKey, messageIndex, value) {
		const textarea = document.querySelector(
			`[data-conversation-key="${conversationKey}"][data-message-index="${messageIndex}"] .message-textarea`
		);

		if (textarea) {
			const hasErrors = this.validateMergeFields(value);
			if (hasErrors) {
				textarea.classList.add("message-textarea-error");
				textarea.title =
					"Invalid merge field detected. Check that data keys match exactly (including spaces).";
			} else {
				textarea.classList.remove("message-textarea-error");
				textarea.title = "";
			}
		}
	}

	hasUnresolvedMergeFields(processedConversation) {
		if (!processedConversation || !Array.isArray(processedConversation)) {
			return false;
		}

		// Check if any message contains unresolved merge fields (still in {!data...} format)
		return processedConversation.some((message) => {
			if (message && message.message) {
				// Look for any remaining merge field patterns
				const mergeFieldPattern = /\{!data\.[^}]+\}/;
				return mergeFieldPattern.test(message.message);
			}
			return false;
		});
	}

	deleteConversation(conversationKey) {
		if (confirm("Are you sure you want to delete this conversation?")) {
			delete this.jsonData.conversations[conversationKey];
			delete this.processedConversations[conversationKey];
			this.renderConversations();
			this.processConversations();
			this.showToast("Conversation deleted", "success");
		}
	}

	getRoleForMessage(messageIndex) {
		return messageIndex % 2 === 0 ? "user" : "agent";
	}

	// Merge Field Processing
	processConversations() {
		this.isLoading = true;
		this.showLoadingSpinner();

		// Simulate processing delay for better UX
		setTimeout(() => {
			this.processedConversations = {};

			Object.keys(this.jsonData.conversations).forEach(
				(conversationKey) => {
					const conversation =
						this.jsonData.conversations[conversationKey];
					const processedConversation = [];

					conversation.forEach((message, index) => {
						const role = index % 2 === 0 ? "user" : "agent";
						const processedMessage = this.processMergeFields(
							message,
							this.jsonData.data
						);

						processedConversation.push({
							role: role,
							message: processedMessage
						});
					});

					this.processedConversations[conversationKey] =
						processedConversation;
				}
			);

			this.hideLoadingSpinner();
			this.updateConversationOutputs();
			this.isLoading = false;
		}, 100);
	}

	updateConversationOutputs() {
		// Update the JSON output for each conversation without re-rendering the entire UI
		Object.keys(this.jsonData.conversations).forEach((conversationKey) => {
			const processedConversation =
				this.processedConversations[conversationKey] || [];
			const outputJson = JSON.stringify(processedConversation, null, 2);
			const hasUnresolvedFields = this.hasUnresolvedMergeFields(
				processedConversation
			);

			const outputElement = document.querySelector(
				`[data-key="${conversationKey}"] .conversation-json, [data-key="${conversationKey}"] .conversation-json-error`
			);
			if (outputElement) {
				outputElement.textContent = outputJson;

				// Update the class and tooltip based on unresolved fields
				if (hasUnresolvedFields) {
					outputElement.className = "conversation-json-error";
					outputElement.title = "Contains unresolved merge fields";
				} else {
					outputElement.className = "conversation-json";
					outputElement.title = "";
				}
			}

			// Update the error indicator in the header
			const headerElement = document.querySelector(
				`[data-key="${conversationKey}"] .output-header h4`
			);
			if (headerElement) {
				if (hasUnresolvedFields) {
					headerElement.innerHTML = `Output (JSON) <span class="error-indicator" title="Contains unresolved merge fields"><i class="fas fa-exclamation-triangle"></i></span>`;
				} else {
					headerElement.innerHTML = "Output (JSON)";
				}
			}
		});
	}

	processMergeFields(message, data) {
		if (!message || !data) {
			return message;
		}

		let processedMessage = message;

		// Find all merge field patterns: {!data.KeyName.field}
		const mergeFieldPattern = /\{!data\.([^}]+)\}/g;
		let match;

		while ((match = mergeFieldPattern.exec(message)) !== null) {
			const fullMatch = match[0]; // e.g., {!data.PatrickGo.key}
			const fieldPath = match[1]; // e.g., PatrickGo.key

			const replacement = this.getFieldValue(fieldPath, data);
			processedMessage = processedMessage.replace(fullMatch, replacement);
		}

		return processedMessage;
	}

	getFieldValue(fieldPath, data) {
		try {
			const parts = fieldPath.split(".");
			if (parts.length !== 2) {
				return `{!data.${fieldPath}}`; // Return original if invalid format
			}

			const keyName = parts[0];
			const fieldName = parts[1];

			if (!data[keyName]) {
				return `{!data.${fieldPath}}`; // Return original if key not found
			}

			const value = data[keyName];

			if (fieldName === "key") {
				return keyName;
			} else if (fieldName === "value") {
				return value;
			} else if (fieldName === "pair") {
				return `[${keyName}]=[${value}]`;
			} else {
				return `{!data.${fieldPath}}`; // Return original if field not recognized
			}
		} catch (error) {
			return `{!data.${fieldPath}}`; // Return original if error
		}
	}

	showMainContent() {
		const mainContent = document.getElementById("mainContent");
		const downloadBtn = document.getElementById("downloadBtn");

		// Show the main content with animation
		mainContent.style.display = "block";
		setTimeout(() => {
			mainContent.classList.add("show");
			// Setup merge field generator after content is visible
			this.setupMergeFieldGenerator();
		}, 10);

		// Show the download button
		downloadBtn.style.display = "inline-flex";
	}

	showLoadingSpinner() {
		document.getElementById("loadingSpinner").classList.add("show");
	}

	hideLoadingSpinner() {
		document.getElementById("loadingSpinner").classList.remove("show");
	}

	showToast(message, type = "info") {
		const toastContainer = document.getElementById("toastContainer");
		const toast = document.createElement("div");
		toast.className = `toast toast-${type}`;

		const icon =
			type === "success"
				? "check-circle"
				: type === "error"
				? "exclamation-circle"
				: type === "warning"
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
		if (type === "error") {
			console.error(`[JSON Data Editor] ${message}`);
		} else if (type === "warning") {
			console.warn(`[JSON Data Editor] ${message}`);
		} else {
			console.log(`[JSON Data Editor] ${message}`);
		}

		// Auto remove after 5 seconds
		setTimeout(() => {
			if (toast.parentElement) {
				toast.remove();
			}
		}, 5000);
	}

	renderAll() {
		this.renderDataTable();
		this.renderConversations();
		this.processConversations();
		// Only setup merge field generator if main content is visible
		if (document.getElementById("mainContent").style.display !== "none") {
			this.setupMergeFieldGenerator();
		}
	}
}

// Initialize the app when the page loads
let app;
document.addEventListener("DOMContentLoaded", () => {
	app = new JsonDataEditor();
});
