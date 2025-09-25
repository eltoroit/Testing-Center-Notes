// Global state
let currentData = null;
let originalFileName = "";

// DOM elements
const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const clearFile = document.getElementById("clearFile");
const editorSection = document.getElementById("editorSection");
const exportSection = document.getElementById("exportSection");
const previewSection = document.getElementById("previewSection");
const csvPreview = document.getElementById("csvPreview");

// Tab elements
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
	initializeEventListeners();
});

function initializeEventListeners() {
	// File upload
	fileInput.addEventListener("change", handleFileUpload);
	clearFile.addEventListener("click", clearFileData);

	// Tab switching
	tabButtons.forEach((button) => {
		button.addEventListener("click", () => switchTab(button.dataset.tab));
	});

	// Export buttons
	document.getElementById("exportCsv").addEventListener("click", exportCsv);
	document.getElementById("exportJson").addEventListener("click", exportJson);

	// Add buttons
	document
		.getElementById("addDataItem")
		.addEventListener("click", addDataItem);
	document
		.getElementById("addContextItem")
		.addEventListener("click", addContextItem);
	document.getElementById("addTest").addEventListener("click", addTest);
}

function handleFileUpload(event) {
	const file = event.target.files[0];
	if (!file) return;

	originalFileName = file.name.replace(".json", "");
	fileName.textContent = file.name;
	fileInfo.style.display = "block";

	const reader = new FileReader();
	reader.onload = function (e) {
		try {
			const jsonData = JSON.parse(e.target.result);
			currentData = jsonData;
			renderEditor();
			updateCsvPreview();
		} catch (error) {
			alert("Error parsing JSON file: " + error.message);
		}
	};
	reader.readAsText(file);
}

function clearFileData() {
	fileInput.value = "";
	fileInfo.style.display = "none";
	editorSection.style.display = "none";
	exportSection.style.display = "none";
	previewSection.style.display = "none";
	currentData = null;
	originalFileName = "";
}

function switchTab(tabName) {
	// Update tab buttons
	tabButtons.forEach((button) => {
		button.classList.toggle("active", button.dataset.tab === tabName);
	});

	// Update tab panels
	tabPanels.forEach((panel) => {
		panel.classList.toggle("active", panel.id === `${tabName}-tab`);
	});
}

function renderEditor() {
	if (!currentData) return;

	editorSection.style.display = "block";
	exportSection.style.display = "block";
	previewSection.style.display = "block";

	renderDataSection();
	renderContextSection();
	renderTestsSection();
}

function renderDataSection() {
	const container = document.getElementById("dataItems");
	container.innerHTML = "";

	if (!currentData.data) {
		currentData.data = {};
	}

	Object.entries(currentData.data).forEach(([key, value]) => {
		const item = createDataItem(key, value);
		container.appendChild(item);
	});
}

function createDataItem(key, value) {
	const div = document.createElement("div");
	div.className = "data-item";
	div.innerHTML = `
        <div class="item-header">
            <input type="text" class="key-input" value="${key}" placeholder="Key">
            <button class="delete-button" onclick="deleteDataItem(this)">🗑️</button>
        </div>
        <div class="item-content">
            <label>Key:</label>
            <input type="text" class="value-key" value="${
				value.key || ""
			}" placeholder="Display Key">
            <label>Value:</label>
            <input type="text" class="value-value" value="${
				value.value || ""
			}" placeholder="Value">
        </div>
    `;

	// Add event listeners for real-time updates
	const keyInput = div.querySelector(".key-input");
	const valueKey = div.querySelector(".value-key");
	const valueValue = div.querySelector(".value-value");

	keyInput.addEventListener("input", updateDataItem);
	valueKey.addEventListener("input", updateDataItem);
	valueValue.addEventListener("input", updateDataItem);

	return div;
}

function updateDataItem(event) {
	const item = event.target.closest(".data-item");
	const oldKey =
		item.dataset.originalKey || item.querySelector(".key-input").value;
	const newKey = item.querySelector(".key-input").value;
	const valueKey = item.querySelector(".value-key").value;
	const valueValue = item.querySelector(".value-value").value;

	// Remove old key if it changed
	if (oldKey && oldKey !== newKey) {
		delete currentData.data[oldKey];
		item.dataset.originalKey = newKey;
	}

	// Add/update new key
	currentData.data[newKey] = {
		key: valueKey,
		value: valueValue,
	};

	updateCsvPreview();
}

function deleteDataItem(button) {
	const item = button.closest(".data-item");
	const key = item.querySelector(".key-input").value;
	delete currentData.data[key];
	item.remove();
	updateCsvPreview();
}

function addDataItem() {
	const container = document.getElementById("dataItems");
	const newKey = `newItem${Date.now()}`;
	const item = createDataItem(newKey, { key: "", value: "" });
	container.appendChild(item);
}

function renderContextSection() {
	const container = document.getElementById("contextItems");
	container.innerHTML = "";

	if (!currentData.contextVariables) {
		currentData.contextVariables = {};
	}

	Object.entries(currentData.contextVariables).forEach(([key, value]) => {
		const item = createContextItem(key, value);
		container.appendChild(item);
	});
}

function createContextItem(key, value) {
	const div = document.createElement("div");
	div.className = "context-item";
	div.innerHTML = `
        <div class="item-header">
            <input type="text" class="key-input" value="${key}" placeholder="Variable Name">
            <button class="delete-button" onclick="deleteContextItem(this)">🗑️</button>
        </div>
        <div class="item-content">
            <label>Description:</label>
            <input type="text" class="value-input" value="${value}" placeholder="Variable Description">
        </div>
    `;

	const keyInput = div.querySelector(".key-input");
	const valueInput = div.querySelector(".value-input");

	keyInput.addEventListener("input", updateContextItem);
	valueInput.addEventListener("input", updateContextItem);

	return div;
}

function updateContextItem(event) {
	const item = event.target.closest(".context-item");
	const oldKey =
		item.dataset.originalKey || item.querySelector(".key-input").value;
	const newKey = item.querySelector(".key-input").value;
	const value = item.querySelector(".value-input").value;

	if (oldKey && oldKey !== newKey) {
		delete currentData.contextVariables[oldKey];
		item.dataset.originalKey = newKey;
	}

	currentData.contextVariables[newKey] = value;
	updateCsvPreview();
}

function deleteContextItem(button) {
	const item = button.closest(".context-item");
	const key = item.querySelector(".key-input").value;
	delete currentData.contextVariables[key];
	item.remove();
	updateCsvPreview();
}

function addContextItem() {
	const container = document.getElementById("contextItems");
	const newKey = `newVariable${Date.now()}`;
	const item = createContextItem(newKey, "");
	container.appendChild(item);
}

function renderTestsSection() {
	const container = document.getElementById("testItems");
	container.innerHTML = "";

	if (!currentData.tests) {
		currentData.tests = [];
	}

	currentData.tests.forEach((test, index) => {
		const item = createTestItem(test, index);
		container.appendChild(item);
	});
}

function createTestItem(test, index) {
	const div = document.createElement("div");
	div.className = "test-item";
	div.innerHTML = `
        <div class="item-header">
            <h3>Test ${test.testNumber || index + 1}</h3>
            <button class="delete-button" onclick="deleteTest(this)">🗑️</button>
        </div>
        <div class="test-content">
            <div class="form-group">
                <label>Test Number:</label>
                <input type="number" class="test-number" value="${
					test.testNumber || index + 1
				}">
            </div>
            <div class="form-group">
                <label>Utterance:</label>
                <textarea class="utterance" placeholder="User utterance">${
					test.utterance || ""
				}</textarea>
            </div>
            <div class="form-group">
                <label>Expected Topic:</label>
                <input type="text" class="expected-topic" value="${
					test.expectedTopic || ""
				}" placeholder="Expected Topic">
            </div>
            <div class="form-group">
                <label>Expected Actions:</label>
                <div class="actions-container">
                    <div class="actions-list" data-test-index="${index}"></div>
                    <button type="button" class="add-action" onclick="addAction(${index})">+ Add Action</button>
                </div>
            </div>
            <div class="form-group">
                <label>Expected Response:</label>
                <textarea class="expected-response" placeholder="Expected Response">${
					test.expectedResponse || ""
				}</textarea>
            </div>
            <div class="form-group">
                <label>Conversation History:</label>
                <div class="conversation-container">
                    <div class="conversation-list" data-test-index="${index}"></div>
                    <button type="button" class="add-conversation" onclick="addConversation(${index})">+ Add Conversation Turn</button>
                </div>
            </div>
            <div class="form-group">
                <label>Context Variables:</label>
                <div class="context-vars-container">
                    <div class="context-vars-list" data-test-index="${index}"></div>
                    <button type="button" class="add-context-var" onclick="addContextVar(${index})">+ Add Context Variable</button>
                </div>
            </div>
        </div>
    `;

	// Add event listeners
	const testNumber = div.querySelector(".test-number");
	const utterance = div.querySelector(".utterance");
	const expectedTopic = div.querySelector(".expected-topic");
	const expectedResponse = div.querySelector(".expected-response");

	testNumber.addEventListener("input", () => updateTest(index));
	utterance.addEventListener("input", () => updateTest(index));
	expectedTopic.addEventListener("input", () => updateTest(index));
	expectedResponse.addEventListener("input", () => updateTest(index));

	// Render sub-components
	renderActionsList(div, test.expectedActions || [], index);
	renderConversationList(div, test.conversationHistory || [], index);
	renderContextVarsList(div, test.contextVariables || {}, index);

	return div;
}

function renderActionsList(container, actions, testIndex) {
	const actionsList = container.querySelector(".actions-list");
	actionsList.innerHTML = "";

	actions.forEach((action, actionIndex) => {
		const actionDiv = document.createElement("div");
		actionDiv.className = "action-item";
		actionDiv.innerHTML = `
            <input type="text" value="${action}" placeholder="Action name">
            <button type="button" onclick="removeAction(${testIndex}, ${actionIndex})">🗑️</button>
        `;

		const input = actionDiv.querySelector("input");
		input.addEventListener("input", () => updateTest(testIndex));

		actionsList.appendChild(actionDiv);
	});
}

function renderConversationList(container, conversations, testIndex) {
	const conversationList = container.querySelector(".conversation-list");
	conversationList.innerHTML = "";

	conversations.forEach((conversation, convIndex) => {
		const convDiv = document.createElement("div");
		convDiv.className = "conversation-item";
		convDiv.innerHTML = `
            <div class="conversation-header">
                <select class="role-select">
                    <option value="user" ${
						conversation.role === "user" ? "selected" : ""
					}>User</option>
                    <option value="agent" ${
						conversation.role === "agent" ? "selected" : ""
					}>Agent</option>
                </select>
                <button type="button" onclick="removeConversation(${testIndex}, ${convIndex})">🗑️</button>
            </div>
            <textarea class="conversation-message" placeholder="Message">${
				conversation.message || ""
			}</textarea>
        `;

		const roleSelect = convDiv.querySelector(".role-select");
		const messageTextarea = convDiv.querySelector(".conversation-message");

		roleSelect.addEventListener("change", () => updateTest(testIndex));
		messageTextarea.addEventListener("input", () => updateTest(testIndex));

		conversationList.appendChild(convDiv);
	});
}

function renderContextVarsList(container, contextVars, testIndex) {
	const contextVarsList = container.querySelector(".context-vars-list");
	contextVarsList.innerHTML = "";

	Object.entries(contextVars).forEach(([key, value], varIndex) => {
		const varDiv = document.createElement("div");
		varDiv.className = "context-var-item";
		varDiv.innerHTML = `
            <div class="context-var-header">
                <input type="text" class="context-var-key" value="${key}" placeholder="Variable name">
                <button type="button" onclick="removeContextVar(${testIndex}, '${key}')">🗑️</button>
            </div>
            <input type="text" class="context-var-value" value="${value}" placeholder="Variable value">
        `;

		const keyInput = varDiv.querySelector(".context-var-key");
		const valueInput = varDiv.querySelector(".context-var-value");

		keyInput.addEventListener("input", () => updateTest(testIndex));
		valueInput.addEventListener("input", () => updateTest(testIndex));

		contextVarsList.appendChild(varDiv);
	});
}

function updateTest(testIndex) {
	const testItem = document.querySelectorAll(".test-item")[testIndex];
	if (!testItem) return;

	const testNumber =
		parseInt(testItem.querySelector(".test-number").value) || testIndex + 1;
	const utterance = testItem.querySelector(".utterance").value;
	const expectedTopic = testItem.querySelector(".expected-topic").value;
	const expectedResponse = testItem.querySelector(".expected-response").value;

	// Get actions
	const actions = Array.from(testItem.querySelectorAll(".action-item input"))
		.map((input) => input.value)
		.filter((v) => v);

	// Get conversations
	const conversations = Array.from(
		testItem.querySelectorAll(".conversation-item")
	)
		.map((conv) => ({
			role: conv.querySelector(".role-select").value,
			message: conv.querySelector(".conversation-message").value,
		}))
		.filter((conv) => conv.message);

	// Get context variables
	const contextVars = {};
	testItem.querySelectorAll(".context-var-item").forEach((varItem) => {
		const key = varItem.querySelector(".context-var-key").value;
		const value = varItem.querySelector(".context-var-value").value;
		if (key) contextVars[key] = value;
	});

	currentData.tests[testIndex] = {
		testNumber,
		utterance,
		expectedTopic,
		expectedActions: actions,
		expectedResponse,
		conversationHistory: conversations,
		contextVariables:
			Object.keys(contextVars).length > 0 ? contextVars : undefined,
	};

	updateCsvPreview();
}

function addAction(testIndex) {
	const testItem = document.querySelectorAll(".test-item")[testIndex];
	const actionsList = testItem.querySelector(".actions-list");

	const actionDiv = document.createElement("div");
	actionDiv.className = "action-item";
	actionDiv.innerHTML = `
        <input type="text" placeholder="Action name">
        <button type="button" onclick="removeAction(${testIndex}, ${actionsList.children.length})">🗑️</button>
    `;

	const input = actionDiv.querySelector("input");
	input.addEventListener("input", () => updateTest(testIndex));

	actionsList.appendChild(actionDiv);
}

function removeAction(testIndex, actionIndex) {
	const testItem = document.querySelectorAll(".test-item")[testIndex];
	const actionsList = testItem.querySelector(".actions-list");
	const actionItem = actionsList.children[actionIndex];
	if (actionItem) {
		actionItem.remove();
		updateTest(testIndex);
	}
}

function addConversation(testIndex) {
	const testItem = document.querySelectorAll(".test-item")[testIndex];
	const conversationList = testItem.querySelector(".conversation-list");

	const convDiv = document.createElement("div");
	convDiv.className = "conversation-item";
	convDiv.innerHTML = `
        <div class="conversation-header">
            <select class="role-select">
                <option value="user">User</option>
                <option value="agent">Agent</option>
            </select>
            <button type="button" onclick="removeConversation(${testIndex}, ${conversationList.children.length})">🗑️</button>
        </div>
        <textarea class="conversation-message" placeholder="Message"></textarea>
    `;

	const roleSelect = convDiv.querySelector(".role-select");
	const messageTextarea = convDiv.querySelector(".conversation-message");

	roleSelect.addEventListener("change", () => updateTest(testIndex));
	messageTextarea.addEventListener("input", () => updateTest(testIndex));

	conversationList.appendChild(convDiv);
}

function removeConversation(testIndex, convIndex) {
	const testItem = document.querySelectorAll(".test-item")[testIndex];
	const conversationList = testItem.querySelector(".conversation-list");
	const convItem = conversationList.children[convIndex];
	if (convItem) {
		convItem.remove();
		updateTest(testIndex);
	}
}

function addContextVar(testIndex) {
	const testItem = document.querySelectorAll(".test-item")[testIndex];
	const contextVarsList = testItem.querySelector(".context-vars-list");

	const varDiv = document.createElement("div");
	varDiv.className = "context-var-item";
	varDiv.innerHTML = `
        <div class="context-var-header">
            <input type="text" class="context-var-key" placeholder="Variable name">
            <button type="button" onclick="removeContextVar(${testIndex}, '')">🗑️</button>
        </div>
        <input type="text" class="context-var-value" placeholder="Variable value">
    `;

	const keyInput = varDiv.querySelector(".context-var-key");
	const valueInput = varDiv.querySelector(".context-var-value");

	keyInput.addEventListener("input", () => updateTest(testIndex));
	valueInput.addEventListener("input", () => updateTest(testIndex));

	contextVarsList.appendChild(varDiv);
}

function removeContextVar(testIndex, key) {
	const testItem = document.querySelectorAll(".test-item")[testIndex];
	const contextVarsList = testItem.querySelector(".context-vars-list");

	if (key) {
		// Remove by key
		const varItems = contextVarsList.querySelectorAll(".context-var-item");
		varItems.forEach((item) => {
			if (item.querySelector(".context-var-key").value === key) {
				item.remove();
			}
		});
	} else {
		// Remove last item
		const lastItem = contextVarsList.lastElementChild;
		if (lastItem) lastItem.remove();
	}

	updateTest(testIndex);
}

function addTest() {
	if (!currentData.tests) {
		currentData.tests = [];
	}

	const newTest = {
		testNumber: currentData.tests.length + 1,
		utterance: "",
		expectedTopic: "",
		expectedActions: [],
		expectedResponse: "",
		conversationHistory: [],
		contextVariables: {},
	};

	currentData.tests.push(newTest);
	renderTestsSection();
	updateCsvPreview();
}

function deleteTest(button) {
	const testItem = button.closest(".test-item");
	const testIndex = Array.from(
		document.querySelectorAll(".test-item")
	).indexOf(testItem);

	if (testIndex >= 0) {
		currentData.tests.splice(testIndex, 1);
		renderTestsSection();
		updateCsvPreview();
	}
}

// Data transformation functions
function transformText(text, data) {
	if (!text || !data) return text;

	// Replace {!data.KeyName.value} with actual value
	text = text.replace(/\{!data\.(\w+)\.value\}/g, (match, key) => {
		return data[key]?.value || match;
	});

	// Replace {!data.KeyName.key} with actual key
	text = text.replace(/\{!data\.(\w+)\.key\}/g, (match, key) => {
		return data[key]?.key || match;
	});

	// Replace {!data.KeyName.pair} with [key]=[value] format
	text = text.replace(/\{!data\.(\w+)\.pair\}/g, (match, key) => {
		const item = data[key];
		if (item) {
			return `[${item.key}]=[${item.value}]`;
		}
		return match;
	});

	return text;
}

function formatConversationHistory(conversations) {
	if (!conversations || conversations.length === 0) return "";

	const transformed = conversations.map((conv) => ({
		role: conv.role,
		message: transformText(conv.message, currentData.data),
	}));

	return JSON.stringify(transformed);
}

function updateCsvPreview() {
	if (!currentData || !currentData.tests) return;

	const csvData = generateCsvData();
	const csvText = convertToCsv(csvData);

	// Show preview
	csvPreview.innerHTML = `<pre>${csvText}</pre>`;
}

function generateCsvData() {
	const headers = [
		"Conversation History",
		"Utterance",
		"Expected Topic",
		"Expected Actions",
		"Expected Response",
		"Context Variable currentObjectApiName",
		"Context Variable currentRecordId",
	];

	const rows = currentData.tests.map((test) => {
		const conversationHistory = formatConversationHistory(
			test.conversationHistory
		);
		const utterance = transformText(test.utterance, currentData.data);
		const expectedResponse = transformText(
			test.expectedResponse,
			currentData.data
		);
		const expectedActions = JSON.stringify(test.expectedActions || []);

		const contextVars = test.contextVariables || {};
		const currentObjectApiName = transformText(
			contextVars.currentObjectApiName || "",
			currentData.data
		);
		const currentRecordId = transformText(
			contextVars.currentRecordId || "",
			currentData.data
		);

		return [
			conversationHistory,
			utterance,
			test.expectedTopic || "",
			expectedActions,
			expectedResponse,
			currentObjectApiName,
			currentRecordId,
		];
	});

	return [headers, ...rows];
}

function convertToCsv(data) {
	return data
		.map((row) =>
			row
				.map((cell) => {
					// Escape quotes and wrap in quotes if contains comma, quote, or newline
					const escaped = String(cell).replace(/"/g, '""');
					if (
						escaped.includes(",") ||
						escaped.includes('"') ||
						escaped.includes("\n")
					) {
						return `"${escaped}"`;
					}
					return escaped;
				})
				.join(",")
		)
		.join("\n");
}

function exportCsv() {
	if (!currentData) return;

	const csvData = generateCsvData();
	const csvText = convertToCsv(csvData);

	fetch("/download-csv", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			csvData: csvText,
			filename: `${originalFileName || "export"}.csv`,
		}),
	})
		.then((response) => response.blob())
		.then((blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${originalFileName || "export"}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		});
}

function exportJson() {
	if (!currentData) return;

	fetch("/download-json", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			jsonData: currentData,
			filename: `${originalFileName || "export"}.json`,
		}),
	})
		.then((response) => response.blob())
		.then((blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${originalFileName || "export"}.json`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		});
}
