import { LightningElement, api, track } from 'lwc';

export default class DataTable extends LightningElement {
    @api data = [];
    @track editedData = [];
    @track isEditing = false;
    @track editingId = null;

    connectedCallback() {
        this.editedData = this.data.map(item => ({
            ...item,
            isEditing: false
        }));
    }

    get hasData() {
        return this.editedData && this.editedData.length > 0;
    }

    handleAddRow() {
        const newId = 'new_' + Date.now();
        const newRow = {
            id: newId,
            key: '',
            value: '',
            isEditing: true
        };
        this.editedData = [...this.editedData, newRow];
        this.isEditing = true;
        this.editingId = newId;
    }

    handleDeleteRow(event) {
        const idToDelete = event.target.dataset.id;
        this.editedData = this.editedData.filter(item => item.id !== idToDelete);
        this.dispatchDataChange();
    }

    handleEdit(event) {
        const id = event.target.dataset.id;
        this.startEdit(id);
    }

    startEdit(id) {
        this.editedData = this.editedData.map(item => ({
            ...item,
            isEditing: item.id === id
        }));
        this.isEditing = true;
        this.editingId = id;
    }

    handleSave(event) {
        const id = event.target.dataset.id;
        const keyInput = this.template.querySelector(`[data-field="key"][data-id="${id}"]`);
        const valueInput = this.template.querySelector(`[data-field="value"][data-id="${id}"]`);
        
        if (keyInput && valueInput) {
            const key = keyInput.value.trim();
            const value = valueInput.value.trim();
            
            if (key && value) {
                this.editedData = this.editedData.map(item => {
                    if (item.id === id) {
                        return { ...item, key, value, isEditing: false };
                    }
                    return { ...item, isEditing: false };
                });
                
                this.isEditing = false;
                this.editingId = null;
                this.dispatchDataChange();
            }
        }
    }

    handleCancel(event) {
        const id = event.target.dataset.id;
        const originalItem = this.data.find(item => item.id === id);
        
        if (originalItem) {
            this.editedData = this.editedData.map(item => {
                if (item.id === id) {
                    return { ...originalItem, isEditing: false };
                }
                return { ...item, isEditing: false };
            });
        } else {
            // Remove new items that were cancelled
            this.editedData = this.editedData.filter(item => item.id !== id);
        }
        
        this.isEditing = false;
        this.editingId = null;
    }

    handleKeyChange(event) {
        const id = event.target.dataset.id;
        const value = event.target.value;
        
        this.editedData = this.editedData.map(item => {
            if (item.id === id) {
                return { ...item, key: value };
            }
            return item;
        });
    }

    handleValueChange(event) {
        const id = event.target.dataset.id;
        const value = event.target.value;
        
        this.editedData = this.editedData.map(item => {
            if (item.id === id) {
                return { ...item, value: value };
            }
            return item;
        });
    }

    dispatchDataChange() {
        // Convert array back to object format
        const dataObject = {};
        this.editedData.forEach(item => {
            if (item.key && item.value) {
                dataObject[item.id] = {
                    key: item.key,
                    value: item.value
                };
            }
        });
        
        const dataChangeEvent = new CustomEvent('datachange', {
            detail: dataObject
        });
        this.dispatchEvent(dataChangeEvent);
    }

    isEditingRow(id) {
        return this.isEditing && this.editingId === id;
    }
}
