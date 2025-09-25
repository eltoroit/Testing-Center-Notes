import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {
	validateJsonStructure,
	generateCsvData,
	convertToCsv,
	createDownloadBlob,
	triggerDownload,
} from "c/dataTransformationUtils";

export default class JsonTestDataEditor extends LightningElement {
	// Raw data state
	@track rawData = null;

	// Transformed data state
	@track currentData = {
		data: {},
		contextVariables: {},
		tests: [],
	};

	// UI state
	@track activeTab = "data";
	@track originalFileName = "";
	@track isLoading = false;
	@track validationErrors = [];

	// Computed properties
	get showEditor() {
		return this.rawData !== null;
	}

	get hasErrors() {
		return this.validationErrors.length > 0;
	}

	get showDataTab() {
		return this.activeTab === "data";
	}

	get showContextTab() {
		return this.activeTab === "context";
	}

	get showTestsTab() {
		return this.activeTab === "tests";
	}

	get hasFile() {
		return this.originalFileName !== "";
	}

	get dataItems() {
		return Object.entries(this.currentData.data || {}).map(
			([key, value]) => ({
				key,
				value,
			})
		);
	}

	get hasDataItems() {
		return this.dataItems.length > 0;
	}

	get contextItems() {
		return Object.entries(this.currentData.contextVariables || {}).map(
			([key, value]) => ({
				key,
				value,
			})
		);
	}

	get hasContextItems() {
		return this.contextItems.length > 0;
	}

	get testItems() {
		return (this.currentData.tests || []).map((test) => ({
			...test,
			hasActions: (test.expectedActions || []).length > 0,
			hasContextVars: Object.keys(test.contextVariables || {}).length > 0,
			contextVariableEntries: Object.entries(
				test.contextVariables || {}
			).map(([key, value]) => ({
				key,
				value,
			})),
		}));
	}

	get hasTests() {
		return this.testItems.length > 0;
	}

	get csvPreviewText() {
		if (!this.currentData || !this.currentData.tests) {
			return "No data to preview";
		}

		try {
			const csvData = generateCsvData(this.currentData);
			return convertToCsv(csvData);
		} catch (error) {
			return `Error generating CSV preview: ${error.message}`;
		}
	}

	// Tab navigation computed properties
	get dataTabIndex() {
		return this.activeTab === "data" ? "0" : "-1";
	}

	get dataTabSelected() {
		return this.activeTab === "data";
	}

	get contextTabIndex() {
		return this.activeTab === "context" ? "0" : "-1";
	}

	get contextTabSelected() {
		return this.activeTab === "context";
	}

	get testsTabIndex() {
		return this.activeTab === "tests" ? "0" : "-1";
	}

	get testsTabSelected() {
		return this.activeTab === "tests";
	}

	// File handling methods
	handleFileUpload(event) {
		const file = event.target.files[0];
		if (!file) return;

		this.isLoading = true;
		this.originalFileName = file.name.replace(".json", "");

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const jsonData = JSON.parse(e.target.result);
				this.processUploadedData(jsonData);
			} catch (error) {
				this.showError("Error parsing JSON file", error.message);
				this.clearFile();
			}
			this.isLoading = false;
		};
		reader.readAsText(file);
	}

	handleFileCleared() {
		this.clearFile();
	}

	clearFile() {
		this.rawData = null;
		this.currentData = {
			data: {},
			contextVariables: {},
			tests: [],
		};
		this.originalFileName = "";
		this.validationErrors = [];
		this.activeTab = "data";

		// Clear file input
		const fileInput = this.template.querySelector("#file-input");
		if (fileInput) {
			fileInput.value = "";
		}
	}

	processUploadedData(jsonData) {
		// Validate JSON structure
		const validation = validateJsonStructure(jsonData);

		if (!validation.isValid) {
			this.validationErrors = validation.errors;
			this.showError(
				"JSON Validation Failed",
				"Please fix the validation errors before proceeding."
			);
			return;
		}

		// Clear validation errors
		this.validationErrors = [];

		// Set raw data
		this.rawData = jsonData;

		// Set current data (deep copy to avoid mutations)
		this.currentData = {
			data: { ...jsonData.data },
			contextVariables: { ...jsonData.contextVariables },
			tests: JSON.parse(JSON.stringify(jsonData.tests)),
		};

		this.showSuccess(
			"File Loaded",
			"JSON file loaded and validated successfully."
		);
	}

	// Tab handling
	handleTabClick(event) {
		event.preventDefault();
		const tab = event.currentTarget.dataset.tab;
		this.activeTab = tab;
	}

	// Data section methods
	addDataItem() {
		const newKey = `newItem${Date.now()}`;
		this.currentData = {
			...this.currentData,
			data: {
				...this.currentData.data,
				[newKey]: { key: "", value: "" },
			},
		};
	}

	updateDataItem(event) {
		const index = parseInt(event.target.dataset.index);
		const field = event.target.dataset.field;
		const value = event.target.value;

		const dataItems = this.dataItems;
		const item = dataItems[index];

		if (field === "key") {
			// Handle key change - need to update the object key
			const oldKey = item.key;
			const newKey = value;

			if (oldKey !== newKey) {
				const newData = { ...this.currentData.data };
				delete newData[oldKey];
				newData[newKey] = item.value;

				this.currentData = {
					...this.currentData,
					data: newData,
				};
			}
		} else if (field === "displayKey") {
			this.currentData = {
				...this.currentData,
				data: {
					...this.currentData.data,
					[item.key]: {
						...item.value,
						key: value,
					},
				},
			};
		} else if (field === "value") {
			this.currentData = {
				...this.currentData,
				data: {
					...this.currentData.data,
					[item.key]: {
						...item.value,
						value: value,
					},
				},
			};
		}
	}

	deleteDataItem(event) {
		const index = parseInt(event.target.dataset.index);
		const dataItems = this.dataItems;
		const item = dataItems[index];

		const newData = { ...this.currentData.data };
		delete newData[item.key];

		this.currentData = {
			...this.currentData,
			data: newData,
		};
	}

	// Context section methods
	addContextItem() {
		const newKey = `newVariable${Date.now()}`;
		this.currentData = {
			...this.currentData,
			contextVariables: {
				...this.currentData.contextVariables,
				[newKey]: "",
			},
		};
	}

	updateContextItem(event) {
		const index = parseInt(event.target.dataset.index);
		const field = event.target.dataset.field;
		const value = event.target.value;

		const contextItems = this.contextItems;
		const item = contextItems[index];

		if (field === "key") {
			// Handle key change
			const oldKey = item.key;
			const newKey = value;

			if (oldKey !== newKey) {
				const newContextVars = { ...this.currentData.contextVariables };
				delete newContextVars[oldKey];
				newContextVars[newKey] = item.value;

				this.currentData = {
					...this.currentData,
					contextVariables: newContextVars,
				};
			}
		} else if (field === "value") {
			this.currentData = {
				...this.currentData,
				contextVariables: {
					...this.currentData.contextVariables,
					[item.key]: value,
				},
			};
		}
	}

	deleteContextItem(event) {
		const index = parseInt(event.target.dataset.index);
		const contextItems = this.contextItems;
		const item = contextItems[index];

		const newContextVars = { ...this.currentData.contextVariables };
		delete newContextVars[item.key];

		this.currentData = {
			...this.currentData,
			contextVariables: newContextVars,
		};
	}

	// Test section methods
	addTest() {
		const newTest = {
			testNumber: (this.currentData.tests || []).length + 1,
			utterance: "",
			expectedTopic: "",
			expectedActions: [],
			expectedResponse: "",
			conversationHistory: [],
			contextVariables: {},
		};

		this.currentData = {
			...this.currentData,
			tests: [...(this.currentData.tests || []), newTest],
		};
	}

	updateTest(event) {
		const index = parseInt(event.target.dataset.index);
		const field = event.target.dataset.field;
		const value = event.target.value;

		const tests = [...this.currentData.tests];
		tests[index] = {
			...tests[index],
			[field]: field === "testNumber" ? parseInt(value) || 1 : value,
		};

		this.currentData = {
			...this.currentData,
			tests,
		};
	}

	deleteTest(event) {
		const index = parseInt(event.target.dataset.index);
		const tests = [...this.currentData.tests];
		tests.splice(index, 1);

		this.currentData = {
			...this.currentData,
			tests,
		};
	}

	// Action methods
	addAction(event) {
		const testIndex = parseInt(event.target.dataset.index);
		const tests = [...this.currentData.tests];
		tests[testIndex].expectedActions = [
			...(tests[testIndex].expectedActions || []),
			"",
		];

		this.currentData = {
			...this.currentData,
			tests,
		};
	}

	updateAction(event) {
		const testIndex = parseInt(event.target.dataset.testIndex);
		const actionIndex = parseInt(event.target.dataset.actionIndex);
		const value = event.target.value;

		const tests = [...this.currentData.tests];
		tests[testIndex].expectedActions[actionIndex] = value;

		this.currentData = {
			...this.currentData,
			tests,
		};
	}

	deleteAction(event) {
		const testIndex = parseInt(event.target.dataset.testIndex);
		const actionIndex = parseInt(event.target.dataset.actionIndex);

		const tests = [...this.currentData.tests];
		tests[testIndex].expectedActions.splice(actionIndex, 1);

		this.currentData = {
			...this.currentData,
			tests,
		};
	}

	// Test context variable methods
	addTestContextVar(event) {
		const testIndex = parseInt(event.target.dataset.index);
		const tests = [...this.currentData.tests];

		if (!tests[testIndex].contextVariables) {
			tests[testIndex].contextVariables = {};
		}

		// Find first available context variable from the main contextVariables section
		const availableContextVars = Object.keys(
			this.currentData.contextVariables || {}
		);
		const usedContextVars = Object.keys(tests[testIndex].contextVariables);
		const newContextVar = availableContextVars.find(
			(key) => !usedContextVars.includes(key)
		);

		if (newContextVar) {
			tests[testIndex].contextVariables[newContextVar] = "";

			this.currentData = {
				...this.currentData,
				tests,
			};
		} else {
			this.showError(
				"No Available Context Variables",
				"All context variables are already used in this test."
			);
		}
	}

	updateTestContextVar(event) {
		const testIndex = parseInt(event.target.dataset.testIndex);
		const contextKey = event.target.dataset.contextKey;
		const value = event.target.value;

		const tests = [...this.currentData.tests];
		tests[testIndex].contextVariables[contextKey] = value;

		this.currentData = {
			...this.currentData,
			tests,
		};
	}

	deleteTestContextVar(event) {
		const testIndex = parseInt(event.target.dataset.testIndex);
		const contextKey = event.target.dataset.contextKey;

		const tests = [...this.currentData.tests];
		delete tests[testIndex].contextVariables[contextKey];

		this.currentData = {
			...this.currentData,
			tests,
		};
	}

	// Export methods
	exportCsv() {
		try {
			const csvData = generateCsvData(this.currentData);
			const csvText = convertToCsv(csvData);
			const blob = createDownloadBlob(csvText, "text/csv");
			triggerDownload(blob, `${this.originalFileName || "export"}.csv`);

			this.showSuccess(
				"CSV Exported",
				"CSV file has been downloaded successfully."
			);
		} catch (error) {
			this.showError(
				"Export Failed",
				`Error exporting CSV: ${error.message}`
			);
		}
	}

	exportJson() {
		try {
			const jsonText = JSON.stringify(this.currentData, null, 2);
			const blob = createDownloadBlob(jsonText, "application/json");
			triggerDownload(blob, `${this.originalFileName || "export"}.json`);

			this.showSuccess(
				"JSON Exported",
				"JSON file has been downloaded successfully."
			);
		} catch (error) {
			this.showError(
				"Export Failed",
				`Error exporting JSON: ${error.message}`
			);
		}
	}

	// Toast notification methods
	showSuccess(title, message) {
		const evt = new ShowToastEvent({
			title: title,
			message: message,
			variant: "success",
		});
		this.dispatchEvent(evt);
	}

	showError(title, message) {
		const evt = new ShowToastEvent({
			title: title,
			message: message,
			variant: "error",
		});
		this.dispatchEvent(evt);
	}
}
