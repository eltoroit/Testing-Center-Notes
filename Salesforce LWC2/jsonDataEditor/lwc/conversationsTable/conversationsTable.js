import { LightningElement, api, track } from "lwc";

export default class ConversationsTable extends LightningElement {
	@api conversations = [];
	@api processedConversations = [];
	@track editedConversations = [];
	@track isEditing = false;
	@track editingConversationIndex = null;
	@track editingMessageIndex = null;

	connectedCallback() {
		this.editedConversations = [...this.conversations];
	}

	get hasConversations() {
		return this.editedConversations && this.editedConversations.length > 0;
	}

	get conversationRows() {
		return this.editedConversations.map((conversation, index) => ({
			index: index,
			messages: conversation.map((message, messageIndex) => ({
				text: message,
				role: this.getRoleForMessage(messageIndex),
				messageIndex: messageIndex,
				isEditing: this.isEditingMessage(index, messageIndex)
			})),
			processedMessages: this.processedConversations[index] || []
		}));
	}

	handleAddConversation() {
		this.editedConversations = [...this.editedConversations, []];
	}

	handleDeleteConversation(event) {
		const index = parseInt(event.target.dataset.index);
		this.editedConversations = this.editedConversations.filter(
			(_, i) => i !== index
		);
		this.dispatchConversationsChange();
	}

	handleAddMessage(event) {
		const conversationIndex = parseInt(event.target.dataset.index);
		this.editedConversations = this.editedConversations.map(
			(conversation, index) => {
				if (index === conversationIndex) {
					return [...conversation, ""];
				}
				return conversation;
			}
		);
		this.dispatchConversationsChange();
	}

	handleDeleteMessage(event) {
		const conversationIndex = parseInt(
			event.target.dataset.conversationIndex
		);
		const messageIndex = parseInt(event.target.dataset.messageIndex);

		this.editedConversations = this.editedConversations.map(
			(conversation, index) => {
				if (index === conversationIndex) {
					return conversation.filter((_, i) => i !== messageIndex);
				}
				return conversation;
			}
		);
		this.dispatchConversationsChange();
	}

	handleEditMessage(event) {
		const conversationIndex = parseInt(
			event.target.dataset.conversationIndex
		);
		const messageIndex = parseInt(event.target.dataset.messageIndex);

		this.isEditing = true;
		this.editingConversationIndex = conversationIndex;
		this.editingMessageIndex = messageIndex;
	}

	handleSaveMessage(event) {
		const conversationIndex = parseInt(
			event.target.dataset.conversationIndex
		);
		const messageIndex = parseInt(event.target.dataset.messageIndex);
		const textarea = this.template.querySelector(
			`[data-conversation-index="${conversationIndex}"][data-message-index="${messageIndex}"]`
		);

		if (textarea) {
			const newValue = textarea.value.trim();
			if (newValue) {
				this.editedConversations = this.editedConversations.map(
					(conversation, index) => {
						if (index === conversationIndex) {
							const newConversation = [...conversation];
							newConversation[messageIndex] = newValue;
							return newConversation;
						}
						return conversation;
					}
				);

				this.isEditing = false;
				this.editingConversationIndex = null;
				this.editingMessageIndex = null;
				this.dispatchConversationsChange();
			}
		}
	}

	handleCancelEdit(event) {
		this.isEditing = false;
		this.editingConversationIndex = null;
		this.editingMessageIndex = null;
	}

	handleMessageChange(event) {
		const conversationIndex = parseInt(
			event.target.dataset.conversationIndex
		);
		const messageIndex = parseInt(event.target.dataset.messageIndex);
		const value = event.target.value;

		this.editedConversations = this.editedConversations.map(
			(conversation, index) => {
				if (index === conversationIndex) {
					const newConversation = [...conversation];
					newConversation[messageIndex] = value;
					return newConversation;
				}
				return conversation;
			}
		);
	}

	dispatchConversationsChange() {
		const conversationsChangeEvent = new CustomEvent(
			"conversationschange",
			{
				detail: this.editedConversations
			}
		);
		this.dispatchEvent(conversationsChangeEvent);
	}

	isEditingMessage(conversationIndex, messageIndex) {
		return (
			this.isEditing &&
			this.editingConversationIndex === conversationIndex &&
			this.editingMessageIndex === messageIndex
		);
	}

	getRoleForMessage(messageIndex) {
		return messageIndex % 2 === 0 ? "user" : "agent";
	}

	getRoleClass(role) {
		return role === "user" ? "user-message" : "agent-message";
	}
}
