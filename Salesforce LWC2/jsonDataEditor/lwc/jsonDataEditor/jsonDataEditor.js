import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import processJsonData from '@salesforce/apex/JsonDataController.processJsonData';
import saveJsonData from '@salesforce/apex/JsonDataController.saveJsonData';

export default class JsonDataEditor extends LightningElement {
    @track jsonData = {
        data: {},
        conversations: []
    };
    @track processedConversations = [];
    @track isLoading = false;
    @track showDataTable = true;
    @track showConversationsTable = true;

    connectedCallback() {
        this.loadSampleData();
    }

    loadSampleData() {
        // Load the sample data from your data.json file
        this.jsonData = {
            data: {
                "PatrickGo": {
                    "key": "Patrick Go",
                    "value": "003Nu00000FHNFjIAP"
                },
                "YourMainLab": {
                    "key": "Your Main Lab",
                    "value": "001Nu00000F9fL4IAJ"
                },
                "Task": {
                    "key": "Task",
                    "value": "00TNq00000E9c63MAB"
                },
                "ClaireDufur": {
                    "key": "Claire Dufur",
                    "value": "0031T00004UOefRQAT"
                },
                "SanfordHealth": {
                    "key": "Sanford Health",
                    "value": "0013800001PW36AAAT"
                },
                "Webcast": {
                    "key": "Webcast",
                    "value": "00UNq000008fBqvMAE"
                }
            },
            conversations: [
                [
                    "Find {!data.PatrickGo.key} from {!data.YourMainLab.key} account",
                    "{!data.PatrickGo.pair} is associated with {!data.YourMainLab.pair}"
                ],
                [
                    "Find {!data.ClaireDufur.key} from {!data.SanfordHealth.key} account",
                    "{!data.ClaireDufur.pair} is associated with {!data.SanfordHealth.pair}"
                ],
                [
                    "Create a Webcast meeting from 2pm tomorrow for an hour with {!data.ClaireDufur.key} at {!data.SanfordHealth.key}",
                    "{!data.Webcast.pair}"
                ],
                [
                    "Find {!data.PatrickGo.key} from {!data.YourMainLab.key} account",
                    "{!data.PatrickGo.pair} is associated with {!data.YourMainLab.pair}",
                    "Find {!data.ClaireDufur.key} from {!data.SanfordHealth.key} account",
                    "{!data.ClaireDufur.pair} is associated with {!data.SanfordHealth.pair}",
                    "Create a Webcast meeting from 2pm tomorrow for an hour with {!data.ClaireDufur.key} at {!data.SanfordHealth.key}",
                    "{!data.Webcast.pair}"
                ]
            ]
        };
        this.processConversations();
    }

    handleDataChange(event) {
        this.jsonData.data = event.detail;
        this.processConversations();
    }

    handleConversationsChange(event) {
        this.jsonData.conversations = event.detail;
        this.processConversations();
    }

    async processConversations() {
        this.isLoading = true;
        try {
            const result = await processJsonData({ 
                jsonData: JSON.stringify(this.jsonData) 
            });
            this.processedConversations = JSON.parse(result);
        } catch (error) {
            this.showToast('Error', 'Failed to process conversations: ' + error.body.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const uploadedData = JSON.parse(e.target.result);
                    // Remove any existing processed data
                    if (uploadedData.processedConversations) {
                        delete uploadedData.processedConversations;
                    }
                    this.jsonData = uploadedData;
                    this.processConversations();
                    this.showToast('Success', 'File uploaded successfully', 'success');
                } catch (error) {
                    this.showToast('Error', 'Invalid JSON file: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        } else {
            this.showToast('Error', 'Please select a valid JSON file', 'error');
        }
    }

    handleDownload() {
        const dataToDownload = {
            ...this.jsonData,
            processedConversations: this.processedConversations
        };
        
        const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Success', 'File downloaded successfully', 'success');
    }

    toggleDataTable() {
        this.showDataTable = !this.showDataTable;
    }

    toggleConversationsTable() {
        this.showConversationsTable = !this.showConversationsTable;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    get dataEntries() {
        return Object.keys(this.jsonData.data).map(key => ({
            id: key,
            key: this.jsonData.data[key].key,
            value: this.jsonData.data[key].value
        }));
    }

    get hasData() {
        return Object.keys(this.jsonData.data).length > 0;
    }

    get hasConversations() {
        return this.jsonData.conversations.length > 0;
    }

    get dataTableToggleLabel() {
        return this.showDataTable ? 'Hide Data Table' : 'Show Data Table';
    }

    get conversationsTableToggleLabel() {
        return this.showConversationsTable ? 'Hide Conversations Table' : 'Show Conversations Table';
    }
}
