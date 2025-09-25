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
		this.renderAll();
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
					this.renderAll();
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
	}

	createDataRow(id, data) {
		const row = document.createElement("tr");
		row.dataset.id = id;

		const isEditing = this.editingDataId === id;

		row.innerHTML = `
            <td>${id}</td>
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
		const newId = "new_" + Date.now();
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
		const keyInput = row.querySelector('[data-field="key"]');
		const valueInput = row.querySelector('[data-field="value"]');

		const key = keyInput.value.trim();
		const value = valueInput.value.trim();

		if (key && value) {
			this.jsonData.data[id] = { key, value };
			this.editingDataId = null;
			this.renderDataTable();
			this.processConversations();
			this.showToast("Data saved successfully", "success");
		} else {
			this.showToast("Please fill in both key and value", "error");
		}
	}

	cancelDataEdit(id) {
		if (id.startsWith("new_")) {
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

	showLoadingSpinner() {
		document.getElementById("loadingSpinner").style.display = "flex";
	}

	hideLoadingSpinner() {
		document.getElementById("loadingSpinner").style.display = "none";
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
	}
}

// Initialize the app when the page loads
let app;
document.addEventListener("DOMContentLoaded", () => {
	app = new JsonDataEditor();
});
