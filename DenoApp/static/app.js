class JsonDataEditor {
	constructor() {
		this.jsonData = {
			data: {},
			conversations: []
		};
		this.processedConversations = [];
		this.isLoading = false;
		this.showDataTable = true;
		this.showConversationsTable = true;
		this.editingDataId = null;
		this.editingConversationIndex = null;
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
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const uploadedData = JSON.parse(e.target.result);
					// Remove any existing processed data
					if (uploadedData.processedConversations) {
						delete uploadedData.processedConversations;
					}
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
		} else {
			this.showToast("Please select a valid JSON file", "error");
		}
	}

	handleDownload() {
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

		dataEntries.forEach((id) => {
			const data = this.jsonData.data[id];
			const row = this.createDataRow(id, data);
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

		dataEntries.forEach((id) => {
			const data = this.jsonData.data[id];
			const option = document.createElement("option");
			option.value = id;
			option.textContent = `${data.key} (${id})`;
			dataPointSelect.appendChild(option);
		});
	}

	setupMergeFieldGenerator() {
		const dataPointSelect = document.getElementById("dataPointSelect");
		const mergeTypeSelect = document.getElementById("mergeTypeSelect");
		const copyBtn = document.getElementById("copyMergeFieldBtn");

		// Add event listeners
		dataPointSelect.addEventListener("change", () =>
			this.updateMergeFieldPreview()
		);
		mergeTypeSelect.addEventListener("change", () =>
			this.updateMergeFieldPreview()
		);
		copyBtn.addEventListener("click", () => this.copyGeneratedMergeField());
	}

	updateMergeFieldPreview() {
		const dataPointSelect = document.getElementById("dataPointSelect");
		const mergeTypeSelect = document.getElementById("mergeTypeSelect");
		const mergeFieldOutput = document.getElementById("mergeFieldOutput");
		const mergeFieldValue = document.getElementById("mergeFieldValue");
		const copyBtn = document.getElementById("copyMergeFieldBtn");

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
		const data = this.jsonData.data[selectedDataPoint];
		let resolvedValue = "";

		switch (selectedType) {
			case "key":
				resolvedValue = data.key;
				break;
			case "value":
				resolvedValue = data.value;
				break;
			case "pair":
				resolvedValue = `[${data.key}]=[${data.value}]`;
				break;
		}

		mergeFieldValue.textContent = `Will resolve to: "${resolvedValue}"`;
		copyBtn.disabled = false;
	}

	copyGeneratedMergeField() {
		const mergeFieldOutput = document.getElementById("mergeFieldOutput");
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

		dataEntries.forEach((id) => {
			const data = this.jsonData.data[id];
			const option = document.createElement("option");
			option.value = id;
			option.textContent = `${data.key} (${id})`;
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
		const data = this.jsonData.data[selectedDataPoint];
		let resolvedValue = "";

		switch (selectedType) {
			case "key":
				resolvedValue = data.key;
				break;
			case "value":
				resolvedValue = data.value;
				break;
			case "pair":
				resolvedValue = `[${data.key}]=[${data.value}]`;
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

	createDataRow(id, data) {
		const row = document.createElement("tr");
		row.dataset.id = id;

		const isEditing = this.editingDataId === id;

		row.innerHTML = `
            <td>
                ${
					isEditing
						? `<input type="text" value="${id}" data-field="id" class="form-input">`
						: `<span>${id}</span>`
				}
            </td>
            <td>
                ${
					isEditing
						? `<input type="text" value="${data.key}" data-field="key" class="form-input">`
						: `<span>${data.key}</span>`
				}
            </td>
            <td>
                ${
					isEditing
						? `<input type="text" value="${data.value}" data-field="value" class="form-input">`
						: `<span>${data.value}</span>`
				}
            </td>
            <td>
                ${
					isEditing
						? `<button class="btn btn-sm btn-success" onclick="app.saveDataRow('${id}')">
                        <i class="fas fa-check"></i> Save
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="app.cancelDataEdit('${id}')">
                        <i class="fas fa-times"></i> Cancel
                    </button>`
						: `<button class="btn btn-sm btn-primary" onclick="app.editDataRow('${id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteDataRow('${id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>`
				}
            </td>
        `;

		return row;
	}

	addDataRow() {
		// Generate a more user-friendly ID
		const timestamp = Date.now();
		const newId = `entry_${timestamp}`;
		this.jsonData.data[newId] = { key: "", value: "" };
		this.editingDataId = newId;
		this.renderDataTable();
	}

	editDataRow(id) {
		this.editingDataId = id;
		this.renderDataTable();
	}

	saveDataRow(id) {
		const row = document.querySelector(`tr[data-id="${id}"]`);
		const idInput = row.querySelector('[data-field="id"]');
		const keyInput = row.querySelector('[data-field="key"]');
		const valueInput = row.querySelector('[data-field="value"]');

		const newId = idInput.value.trim();
		const key = keyInput.value.trim();
		const value = valueInput.value.trim();

		if (newId && key && value) {
			// Check if ID is being changed and if new ID already exists
			if (newId !== id && this.jsonData.data[newId]) {
				this.showToast(
					"ID already exists. Please choose a different ID.",
					"error"
				);
				return;
			}

			// If ID is being changed, we need to update the data structure
			if (newId !== id) {
				// Store the data with new ID
				this.jsonData.data[newId] = { key, value };
				// Remove the old ID
				delete this.jsonData.data[id];
			} else {
				// Just update the existing entry
				this.jsonData.data[id] = { key, value };
			}

			this.editingDataId = null;
			this.renderDataTable();
			this.processConversations();
			this.showToast("Data saved successfully", "success");
		} else {
			this.showToast("Please fill in ID, key, and value", "error");
		}
	}

	cancelDataEdit(id) {
		if (id.startsWith("entry_")) {
			delete this.jsonData.data[id];
		}
		this.editingDataId = null;
		this.renderDataTable();
	}

	deleteDataRow(id) {
		if (confirm("Are you sure you want to delete this data entry?")) {
			delete this.jsonData.data[id];
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

		if (this.jsonData.conversations.length === 0) {
			container.innerHTML = "";
			noConversationsMessage.style.display = "block";
			return;
		}

		noConversationsMessage.style.display = "none";
		container.innerHTML = "";

		this.jsonData.conversations.forEach((conversation, index) => {
			const conversationElement = this.createConversationElement(
				index,
				conversation
			);
			container.appendChild(conversationElement);
		});
	}

	createConversationElement(index, conversation) {
		const div = document.createElement("div");
		div.className = "conversation-group";
		div.dataset.index = index;

		const processedConversation = this.processedConversations[index] || [];
		const outputJson = JSON.stringify(processedConversation, null, 2);

		div.innerHTML = `
            <div class="conversation-header">
                <h3>Conversation ${index + 1}</h3>
                <div class="conversation-actions">
                    <button class="btn btn-sm btn-success" onclick="app.addMessage(${index})">
                        <i class="fas fa-plus"></i> Add Message
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="app.cloneConversation(${index})">
                        <i class="fas fa-copy"></i> Clone
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteConversation(${index})">
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
									index,
									messageIndex,
									message
								)
							)
							.join("")}
                    </div>
                </div>
                <div class="conversation-output">
                    <h4>Output (JSON)</h4>
                    <div class="conversation-json">${outputJson}</div>
                </div>
            </div>
        `;

		// Add event listeners to message textareas
		const messageTextareas = div.querySelectorAll(".message-textarea");
		messageTextareas.forEach((textarea, messageIndex) => {
			textarea.addEventListener("input", (e) => {
				this.handleMessageChange(index, messageIndex, e.target.value);
			});
		});

		return div;
	}

	createMessageInput(conversationIndex, messageIndex, message) {
		const role = this.getRoleForMessage(messageIndex);
		return `
            <div class="message-input-row" data-conversation-index="${conversationIndex}" data-message-index="${messageIndex}">
                <div class="message-label">
                    <span class="role-badge role-${role}">${role}</span>
                </div>
                <div class="message-input">
                    <textarea 
                        class="message-textarea" 
                        rows="2"
                        placeholder="Enter ${role} message..."
                    >${message}</textarea>
                </div>
                <div class="message-actions">
                    <button class="btn btn-sm btn-danger" onclick="app.deleteMessage(${conversationIndex}, ${messageIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
	}

	addConversation() {
		this.jsonData.conversations.push([]);
		this.renderConversations();
		this.processConversations();
	}

	cloneConversation(index) {
		const originalConversation = [...this.jsonData.conversations[index]];
		this.jsonData.conversations.push(originalConversation);
		this.renderConversations();
		this.processConversations();
		this.showToast("Conversation cloned successfully", "success");
	}

	addMessage(conversationIndex) {
		this.jsonData.conversations[conversationIndex].push("");
		this.renderConversations();
		this.processConversations();
	}

	deleteMessage(conversationIndex, messageIndex) {
		if (confirm("Are you sure you want to delete this message?")) {
			this.jsonData.conversations[conversationIndex].splice(
				messageIndex,
				1
			);
			this.renderConversations();
			this.processConversations();
			this.showToast("Message deleted", "success");
		}
	}

	handleMessageChange(conversationIndex, messageIndex, value) {
		this.jsonData.conversations[conversationIndex][messageIndex] = value;
		this.processConversations();
	}

	deleteConversation(index) {
		if (confirm("Are you sure you want to delete this conversation?")) {
			this.jsonData.conversations.splice(index, 1);
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
			this.processedConversations = [];

			this.jsonData.conversations.forEach((conversation) => {
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

				this.processedConversations.push(processedConversation);
			});

			this.hideLoadingSpinner();
			this.updateConversationOutputs();
			this.isLoading = false;
		}, 100);
	}

	updateConversationOutputs() {
		// Update the JSON output for each conversation without re-rendering the entire UI
		this.jsonData.conversations.forEach((conversation, index) => {
			const processedConversation =
				this.processedConversations[index] || [];
			const outputJson = JSON.stringify(processedConversation, null, 2);

			const outputElement = document.querySelector(
				`[data-index="${index}"] .conversation-json`
			);
			if (outputElement) {
				outputElement.textContent = outputJson;
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

			const keyData = data[keyName];

			if (fieldName === "key") {
				return keyData.key;
			} else if (fieldName === "value") {
				return keyData.value;
			} else if (fieldName === "pair") {
				return `[${keyData.key}]=[${keyData.value}]`;
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
