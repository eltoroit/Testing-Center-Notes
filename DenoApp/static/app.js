class JsonDataEditor {
	constructor() {
		this.jsonData = {
			data: {},
			conversations: {}
		};
		this.processedConversations = {};
		this.isLoading = false;
		this.editingDataId = null;
		this.editingConversationKey = null;
		this.editingMessageIndex = null;
		this.hasUnsavedChanges = false;
		this.foldedConversations = new Set(); // Track which conversations are folded
		this.currentPanel = "data"; // Track current panel (data or conversations)
		this.isInitialized = false; // Track if app has been initialized

		// Debouncing setup
		this.debounceTimeout = null;
		this.pendingConversations = new Set(); // Track which conversations have pending processing

		this.initializeEventListeners();
		this.setupBeforeUnloadWarning();
		this.showInitialState();
	}

	initializeEventListeners() {
		// Mode 1: Initial state buttons
		document
			.getElementById("fileInput")
			.addEventListener("change", (e) => this.handleFileUpload(e));

		document
			.getElementById("uploadBtn")
			.addEventListener("click", () =>
				this.handleUploadButtonClick("fileInput")
			);

		document
			.getElementById("startNewProjectBtn")
			.addEventListener("click", () => this.startNewProject());

		// Mode 2: Full app buttons (only if elements exist)
		const fileInput2 = document.getElementById("fileInput2");
		const uploadBtn2 = document.getElementById("uploadBtn2");
		const initializeProjectBtn = document.getElementById(
			"initializeProjectBtn"
		);
		const dataPanelBtn = document.getElementById("dataPanelBtn");
		const conversationsPanelBtn = document.getElementById(
			"conversationsPanelBtn"
		);
		const downloadBtn = document.getElementById("downloadBtn");

		if (fileInput2) {
			fileInput2.addEventListener("change", (e) =>
				this.handleFileUpload(e)
			);
		}
		if (uploadBtn2) {
			uploadBtn2.addEventListener("click", () =>
				this.handleUploadButtonClick("fileInput2")
			);
		}
		if (initializeProjectBtn) {
			initializeProjectBtn.addEventListener("click", () =>
				this.initializeProject()
			);
		}
		if (dataPanelBtn) {
			dataPanelBtn.addEventListener("click", () =>
				this.switchPanel("data")
			);
		}
		if (conversationsPanelBtn) {
			conversationsPanelBtn.addEventListener("click", () =>
				this.switchPanel("conversations")
			);
		}
		if (downloadBtn) {
			downloadBtn.addEventListener("click", () => this.handleDownload());
		}

		// Data table controls (only if elements exist)
		const addDataBtn = document.getElementById("addDataBtn");
		if (addDataBtn) {
			addDataBtn.addEventListener("click", () => this.addDataRow());
		}

		// Conversations controls (only if elements exist)
		const addConversationBtn =
			document.getElementById("addConversationBtn");
		if (addConversationBtn) {
			addConversationBtn.addEventListener("click", () =>
				this.addConversation()
			);
		}

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

		// Fold/Unfold all button
		const foldUnfoldAllBtn = document.getElementById("foldUnfoldAllBtn");
		if (foldUnfoldAllBtn) {
			foldUnfoldAllBtn.addEventListener("click", () =>
				this.toggleFoldAll()
			);
		}
	}

	showInitialState() {
		document.getElementById("initialState").style.display = "flex";
		document.getElementById("fullApp").style.display = "none";
		this.isInitialized = false;
	}

	showFullApp() {
		document.getElementById("initialState").style.display = "none";
		document.getElementById("fullApp").style.display = "block";
		this.isInitialized = true;
		this.switchPanel("data"); // Default to data panel
	}

	startNewProject() {
		this.jsonData = {
			data: {},
			conversations: {}
		};
		this.processedConversations = {};
		this.hasUnsavedChanges = false;
		this.showFullApp();
		this.renderAll();
		this.markAsSaved();
		this.showToast("New project created successfully!", "success");
	}

	initializeProject() {
		if (this.hasUnsavedChanges) {
			const confirmed = confirm(
				"You have unsaved changes. Are you sure you want to start a new project? " +
					"Make sure to download your current work first!"
			);
			if (!confirmed) return;
		}
		this.startNewProject();
	}

	switchPanel(panelName) {
		this.currentPanel = panelName;

		// Update button states
		const dataPanelBtn = document.getElementById("dataPanelBtn");
		const conversationsPanelBtn = document.getElementById(
			"conversationsPanelBtn"
		);

		if (dataPanelBtn && conversationsPanelBtn) {
			if (panelName === "data") {
				dataPanelBtn.classList.add("active");
				conversationsPanelBtn.classList.remove("active");
			} else {
				conversationsPanelBtn.classList.add("active");
				dataPanelBtn.classList.remove("active");
			}
		}

		// Show/hide panels
		const dataPanel = document.getElementById("dataPanel");
		const conversationsPanel =
			document.getElementById("conversationsPanel");

		if (dataPanel && conversationsPanel) {
			if (panelName === "data") {
				dataPanel.classList.add("active");
				conversationsPanel.classList.remove("active");
			} else {
				conversationsPanel.classList.add("active");
				dataPanel.classList.remove("active");
			}
		}
	}

	setupBeforeUnloadWarning() {
		window.addEventListener("beforeunload", (event) => {
			if (this.hasUnsavedChanges) {
				// Standard way to show the warning
				event.preventDefault();
				event.returnValue =
					"You have unsaved changes. Are you sure you want to leave? Make sure to download your JSON file to save your work.";
				return event.returnValue;
			}
		});
	}

	markAsChanged() {
		this.hasUnsavedChanges = true;
		this.updateDownloadButton();
	}

	markAsSaved() {
		this.hasUnsavedChanges = false;
		this.updateDownloadButton();
	}

	updateDownloadButton() {
		const downloadBtn = document.getElementById("downloadBtn");
		if (downloadBtn) {
			if (this.hasUnsavedChanges) {
				downloadBtn.classList.add("btn-danger");
				downloadBtn.classList.remove("btn-primary");
				downloadBtn.innerHTML =
					'<i class="fas fa-download"></i> Download JSON <i class="fas fa-exclamation-triangle"></i>';
				downloadBtn.title =
					"You have unsaved changes! Download to save your work.";
			} else {
				downloadBtn.classList.add("btn-primary");
				downloadBtn.classList.remove("btn-danger");
				downloadBtn.innerHTML =
					'<i class="fas fa-download"></i> Download JSON';
				downloadBtn.title = "Download JSON file";
			}
		}
	}

	handleUploadButtonClick(fileInputId) {
		// Check if there's existing data and ask for confirmation BEFORE opening file dialog
		const hasExistingData =
			Object.keys(this.jsonData.data).length > 0 ||
			Object.keys(this.jsonData.conversations).length > 0;

		if (hasExistingData) {
			const confirmed = confirm(
				"This will replace all existing data. Are you sure you want to continue?"
			);
			if (!confirmed) {
				return; // User cancelled, don't open file dialog
			}
		}

		// User confirmed or no existing data, open file dialog
		document.getElementById(fileInputId).click();
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

					// Keep conversations in object format to preserve keys
					// No conversion needed - we'll work with the object format directly

					this.jsonData = uploadedData;
					this.showFullApp();
					this.renderDataTable();
					this.renderConversations();
					this.processConversations();
					this.markAsSaved(); // Mark as saved after successful upload
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

		this.markAsSaved(); // Mark as saved after successful download
		this.showToast("File downloaded successfully", "success");
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
			this.markAsChanged(); // Mark as changed after data modification
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
			this.markAsChanged(); // Mark as changed after data deletion
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

		const isFolded = this.foldedConversations.has(conversationKey);

		const processedConversation =
			this.processedConversations[conversationKey] || [];
		const outputJson = JSON.stringify(processedConversation, null, 2);
		const hasUnresolvedFields = this.hasUnresolvedMergeFields(
			processedConversation
		);

		// Check conversation structure validation
		const structureValidation =
			this.validateConversationStructure(conversationKey);
		const hasStructureError = structureValidation.hasErrors;

		const outputClass =
			hasUnresolvedFields || hasStructureError
				? "conversation-json-error"
				: "conversation-json";

		// Check if any messages have merge field errors
		const hasMergeFieldErrors = conversation.some(
			(message) => this.validateMergeFieldsDetailed(message).hasErrors
		);

		// Determine if conversation has any errors
		const hasAnyErrors =
			hasStructureError || hasUnresolvedFields || hasMergeFieldErrors;

		const isEditingTitle = this.editingConversationKey === conversationKey;

		div.innerHTML = `
            <div class="conversation-header">
                <div class="conversation-title">
                    <button class="fold-toggle-btn" onclick="app.toggleFold('${conversationKey}')" title="${
			isFolded ? "Unfold" : "Fold"
		} conversation">
                        ${
							isFolded
								? '<i class="fa-solid fa-chevron-right"></i>'
								: '<i class="fa-solid fa-chevron-down"></i>'
						}
                    </button>
                    ${
						isEditingTitle
							? `<input type="text" value="${conversationKey}" class="conversation-title-input ${
									hasAnyErrors
										? "conversation-title-error"
										: ""
							  }" data-conversation-key="${conversationKey}">`
							: `<h3 class="conversation-title-display ${
									hasAnyErrors
										? "conversation-title-error"
										: ""
							  }" data-conversation-key="${conversationKey}">${conversationKey}</h3>`
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
            ${
				hasStructureError
					? `<div class="conversation-structure-error">${structureValidation.errorMessage}</div>`
					: ""
			}

            <div class="conversation-content" style="display: ${
				isFolded ? "none" : "block"
			}">
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

	toggleFold(conversationKey) {
		const isCurrentlyFolded = this.foldedConversations.has(conversationKey);

		if (isCurrentlyFolded) {
			this.foldedConversations.delete(conversationKey);
		} else {
			this.foldedConversations.add(conversationKey);
		}

		// Update the specific conversation element
		this.updateConversationFoldState(conversationKey);
	}

	updateConversationFoldState(conversationKey) {
		const conversationElement = document.querySelector(
			`[data-key="${conversationKey}"]`
		);
		if (!conversationElement) return;

		const isFolded = this.foldedConversations.has(conversationKey);
		const contentElement = conversationElement.querySelector(
			".conversation-content"
		);
		const foldButton =
			conversationElement.querySelector(".fold-toggle-btn");

		if (contentElement) {
			contentElement.style.display = isFolded ? "none" : "block";
		}

		if (foldButton) {
			// Update button symbol and tooltip
			foldButton.innerHTML = isFolded
				? '<i class="fa-solid fa-chevron-right"></i>'
				: '<i class="fa-solid fa-chevron-down"></i>';
			foldButton.title = `${isFolded ? "Unfold" : "Fold"} conversation`;
		}
	}

	toggleFoldAll() {
		const foldUnfoldAllBtn = document.getElementById("foldUnfoldAllBtn");
		if (!foldUnfoldAllBtn) return;

		const allConversationKeys = Object.keys(this.jsonData.conversations);
		const allFolded = allConversationKeys.every((key) =>
			this.foldedConversations.has(key)
		);

		if (allFolded) {
			// Unfold all
			this.foldedConversations.clear();
			foldUnfoldAllBtn.innerHTML =
				'<i class="fas fa-chevron-down"></i> Fold All';
		} else {
			// Fold all
			allConversationKeys.forEach((key) =>
				this.foldedConversations.add(key)
			);
			foldUnfoldAllBtn.innerHTML =
				'<i class="fas fa-chevron-up"></i> Unfold All';
		}

		// Update all conversation elements
		allConversationKeys.forEach((key) =>
			this.updateConversationFoldState(key)
		);
	}

	createMessageInput(conversationKey, messageIndex, message) {
		const role = this.getRoleForMessage(messageIndex);
		const validationResult = this.validateMergeFieldsDetailed(message);
		const hasErrors = validationResult.hasErrors;
		const errorClass = hasErrors ? "message-textarea-error" : "";
		const errorTooltip = hasErrors
			? `title="${validationResult.errorMessage}"`
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
                    <div class="message-error-text" style="display: ${
						hasErrors ? "block" : "none"
					}">${validationResult.errorMessage}</div>
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
		this.markAsChanged(); // Mark as changed after title modification
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
		this.markAsChanged(); // Mark as changed after adding conversation
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
		this.markAsChanged(); // Mark as changed after cloning conversation
		this.showToast("Conversation cloned successfully", "success");
	}

	addMessage(conversationKey) {
		this.jsonData.conversations[conversationKey].push("");
		this.renderConversations();
		this.processConversations();
		this.updateConversationErrorStates(conversationKey);
		this.markAsChanged(); // Mark as changed after adding message
	}

	deleteMessage(conversationKey, messageIndex) {
		if (confirm("Are you sure you want to delete this message?")) {
			this.jsonData.conversations[conversationKey].splice(
				messageIndex,
				1
			);
			this.renderConversations();
			this.processConversations();
			this.updateConversationErrorStates(conversationKey);
			this.markAsChanged(); // Mark as changed after deleting message
			this.showToast("Message deleted", "success");
		}
	}

	handleMessageChange(conversationKey, messageIndex, value) {
		// Save data immediately (no debouncing for data saving)
		this.jsonData.conversations[conversationKey][messageIndex] = value;
		this.markAsChanged(); // Mark as changed after message content change

		// Use debounced processing for the expensive operation
		this.debouncedProcessConversations(conversationKey);

		// Validate input immediately (no debouncing for validation)
		this.validateAndUpdateMessageInput(
			conversationKey,
			messageIndex,
			value
		);

		// Update conversation title and output colors immediately
		this.updateConversationErrorStates(conversationKey);
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

	validateMergeFieldsDetailed(message) {
		// Check if message is null, undefined, or empty
		if (!message) {
			return {
				hasErrors: true,
				errorMessage:
					"Message cannot be blank. Please enter at least one non-whitespace character."
			};
		}

		// Check if message is blank or contains only whitespace
		if (message.trim().length === 0) {
			return {
				hasErrors: true,
				errorMessage:
					"Message cannot be blank. Please enter at least one non-whitespace character."
			};
		}

		// Check if data is available for merge field validation
		if (!this.jsonData.data) {
			return { hasErrors: false, errorMessage: "" };
		}

		const availableKeys = Object.keys(this.jsonData.data);
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
				if (!availableKeys.includes(keyName)) {
					errors.push(
						`Data key "${keyName}" not found. Available keys: ${availableKeys.join(
							", "
						)}`
					);
				}

				// Check if field type is valid
				if (!["key", "value", "pair"].includes(fieldName)) {
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

	validateConversationStructure(conversationKey) {
		const conversation = this.jsonData.conversations[conversationKey];

		// Check if conversation has at least 2 messages (minimum pair)
		if (conversation.length < 2) {
			return {
				hasErrors: true,
				errorMessage:
					"Conversation must have at least 2 messages (user/agent pair)."
			};
		}

		// Check if conversation has even number of messages (pairs)
		if (conversation.length % 2 !== 0) {
			return {
				hasErrors: true,
				errorMessage:
					"Conversation must have an even number of messages (user/agent pairs)."
			};
		}

		return { hasErrors: false, errorMessage: "" };
	}

	// Test function to verify validation logic (for debugging)
	testValidation() {
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

		console.log("Testing merge field validation logic:");
		testCases.forEach((testCase, index) => {
			const result = this.validateMergeFieldsDetailed(testCase.input);
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
			// Temporarily set a test conversation
			const originalConversation =
				this.jsonData.conversations["Test Structure"];
			this.jsonData.conversations["Test Structure"] = testCase.messages;

			const result = this.validateConversationStructure("Test Structure");
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

			// Restore original conversation
			if (originalConversation) {
				this.jsonData.conversations["Test Structure"] =
					originalConversation;
			} else {
				delete this.jsonData.conversations["Test Structure"];
			}
		});
	}

	validateAndUpdateMessageInput(conversationKey, messageIndex, value) {
		const textarea = document.querySelector(
			`[data-conversation-key="${conversationKey}"][data-message-index="${messageIndex}"] .message-textarea`
		);
		const errorTextElement = document.querySelector(
			`[data-conversation-key="${conversationKey}"][data-message-index="${messageIndex}"] .message-error-text`
		);

		if (textarea) {
			const validationResult = this.validateMergeFieldsDetailed(value);
			if (validationResult.hasErrors) {
				textarea.classList.add("message-textarea-error");
				textarea.title = validationResult.errorMessage;
				if (errorTextElement) {
					errorTextElement.textContent =
						validationResult.errorMessage;
					errorTextElement.style.display = "block";
				}
			} else {
				textarea.classList.remove("message-textarea-error");
				textarea.title = "";
				if (errorTextElement) {
					errorTextElement.textContent = "";
					errorTextElement.style.display = "none";
				}
			}
		}
	}

	// Update conversation title and output colors based on current error states
	updateConversationErrorStates(conversationKey) {
		const conversation = this.jsonData.conversations[conversationKey];
		if (!conversation) return;

		// Check for merge field errors in messages
		const hasMergeFieldErrors = conversation.some(
			(message) => this.validateMergeFieldsDetailed(message).hasErrors
		);

		// Check for structure errors
		const hasStructureError =
			this.validateConversationStructure(conversationKey).hasErrors;

		// Check for unresolved merge fields in processed output
		const processedConversation =
			this.processedConversations[conversationKey] || [];
		const hasUnresolvedFields = this.hasUnresolvedMergeFields(
			processedConversation
		);

		// Determine if conversation has any errors
		const hasAnyErrors =
			hasStructureError || hasUnresolvedFields || hasMergeFieldErrors;

		// Update conversation title display
		const titleDisplayElement = document.querySelector(
			`[data-key="${conversationKey}"] .conversation-title-display`
		);
		if (titleDisplayElement) {
			if (hasAnyErrors) {
				titleDisplayElement.classList.add("conversation-title-error");
			} else {
				titleDisplayElement.classList.remove(
					"conversation-title-error"
				);
			}
		}

		// Update conversation title input (if editing)
		const titleInputElement = document.querySelector(
			`[data-key="${conversationKey}"] .conversation-title-input`
		);
		if (titleInputElement) {
			if (hasAnyErrors) {
				titleInputElement.classList.add("conversation-title-error");
			} else {
				titleInputElement.classList.remove("conversation-title-error");
			}
		}

		// Update output element classes
		const outputElement = document.querySelector(
			`[data-key="${conversationKey}"] .conversation-json, [data-key="${conversationKey}"] .conversation-json-error`
		);
		if (outputElement) {
			// Remove pending class if it exists (it will be re-added by debouncing if needed)
			outputElement.classList.remove("conversation-json-pending");

			// Set appropriate class based on errors
			if (hasAnyErrors) {
				outputElement.className = "conversation-json-error";
			} else {
				outputElement.className = "conversation-json";
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
			this.markAsChanged(); // Mark as changed after deleting conversation
			this.showToast("Conversation deleted", "success");
		}
	}

	getRoleForMessage(messageIndex) {
		return messageIndex % 2 === 0 ? "user" : "agent";
	}

	// Merge Field Processing
	processConversations() {
		this.isLoading = true;

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

			this.updateConversationOutputs();
			this.clearPendingStates();
			this.isLoading = false;
		}, 100);
	}

	// Debounced version of processConversations
	debouncedProcessConversations(conversationKey) {
		// Clear any existing timeout
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
		}

		// Add this conversation to pending set and show visual state
		this.pendingConversations.add(conversationKey);
		this.showPendingState(conversationKey);

		// Set new timeout
		this.debounceTimeout = setTimeout(() => {
			this.processConversations();
		}, 0); // 300ms debounce delay
	}

	// Show pending state for a specific conversation
	showPendingState(conversationKey) {
		const outputElement = document.querySelector(
			`[data-key="${conversationKey}"] .conversation-json, [data-key="${conversationKey}"] .conversation-json-error`
		);
		if (outputElement) {
			// Add a pending class instead of inline styles
			outputElement.classList.add("conversation-json-pending");
		}
	}

	// Clear pending states for all conversations and set final state
	clearPendingStates() {
		this.pendingConversations.forEach((conversationKey) => {
			const outputElement = document.querySelector(
				`[data-key="${conversationKey}"] .conversation-json, [data-key="${conversationKey}"] .conversation-json-error`
			);
			if (outputElement) {
				// Remove pending class
				outputElement.classList.remove("conversation-json-pending");

				// Set the correct final class based on current error state
				this.updateOutputElementClass(conversationKey, outputElement);
			}
		});
		this.pendingConversations.clear();
	}

	// Update only the output element class based on error state
	updateOutputElementClass(conversationKey, outputElement) {
		const conversation = this.jsonData.conversations[conversationKey];
		if (!conversation) return;

		// Check for merge field errors in messages
		const hasMergeFieldErrors = conversation.some(
			(message) => this.validateMergeFieldsDetailed(message).hasErrors
		);

		// Check for structure errors
		const hasStructureError =
			this.validateConversationStructure(conversationKey).hasErrors;

		// Check for unresolved merge fields in processed output
		const processedConversation =
			this.processedConversations[conversationKey] || [];
		const hasUnresolvedFields = this.hasUnresolvedMergeFields(
			processedConversation
		);

		// Determine if conversation has any errors
		const hasAnyErrors =
			hasStructureError || hasUnresolvedFields || hasMergeFieldErrors;

		// Set appropriate class based on errors
		if (hasAnyErrors) {
			outputElement.className = "conversation-json-error";
		} else {
			outputElement.className = "conversation-json";
		}
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
			const hasStructureError =
				this.validateConversationStructure(conversationKey).hasErrors;

			// Check for merge field errors in messages (including blank messages)
			const conversationMessages =
				this.jsonData.conversations[conversationKey];
			const hasMergeFieldErrors = conversationMessages.some(
				(message) => this.validateMergeFieldsDetailed(message).hasErrors
			);

			const hasAnyOutputErrors =
				hasUnresolvedFields || hasStructureError || hasMergeFieldErrors;

			const outputElement = document.querySelector(
				`[data-key="${conversationKey}"] .conversation-json, [data-key="${conversationKey}"] .conversation-json-error`
			);
			if (outputElement) {
				outputElement.textContent = outputJson;

				// Update the class and tooltip based on errors
				if (hasAnyOutputErrors) {
					outputElement.className = "conversation-json-error";
					if (hasUnresolvedFields && hasStructureError) {
						outputElement.title =
							"Contains unresolved merge fields and structure errors";
					} else if (hasUnresolvedFields) {
						outputElement.title =
							"Contains unresolved merge fields";
					} else if (hasStructureError) {
						outputElement.title = "Contains structure errors";
					}
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
				if (hasAnyOutputErrors) {
					headerElement.innerHTML = `Output (JSON) <span class="error-indicator" title="Contains errors"><i class="fas fa-exclamation-triangle"></i></span>`;
				} else {
					headerElement.innerHTML = "Output (JSON)";
				}
			}

			// Update conversation title styling based on errors
			const conversationForTitle =
				this.jsonData.conversations[conversationKey];
			const hasMergeFieldErrorsForTitle = conversationForTitle.some(
				(message) => this.validateMergeFieldsDetailed(message).hasErrors
			);
			const hasAnyErrors =
				hasStructureError ||
				hasUnresolvedFields ||
				hasMergeFieldErrorsForTitle;

			// Update conversation title display
			const titleDisplayElement = document.querySelector(
				`[data-key="${conversationKey}"] .conversation-title-display`
			);
			if (titleDisplayElement) {
				if (hasAnyErrors) {
					titleDisplayElement.classList.add(
						"conversation-title-error"
					);
				} else {
					titleDisplayElement.classList.remove(
						"conversation-title-error"
					);
				}
			}

			// Update conversation title input (if editing)
			const titleInputElement = document.querySelector(
				`[data-key="${conversationKey}"] .conversation-title-input`
			);
			if (titleInputElement) {
				if (hasAnyErrors) {
					titleInputElement.classList.add("conversation-title-error");
				} else {
					titleInputElement.classList.remove(
						"conversation-title-error"
					);
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
		// Only setup merge field generator if full app is visible
		if (this.isInitialized) {
			this.setupMergeFieldGenerator();
		}
	}
}

// Initialize the app when the page loads
let app;
document.addEventListener("DOMContentLoaded", () => {
	app = new JsonDataEditor();
});
