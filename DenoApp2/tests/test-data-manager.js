/**
 * DataManager Tests
 * Tests for the DataManager module
 */

import { DataManager } from "../static/modules/DataManager.js";

// Test DataManager functionality
testFramework.test("DataManager - Initialize with default data", () => {
	const dataManager = new DataManager();
	const data = dataManager.getData();

	assertTrue(data.hasOwnProperty("data"), "Should have data property");
	assertTrue(
		data.hasOwnProperty("conversations"),
		"Should have conversations property"
	);
	assertEqual(
		Object.keys(data.data).length,
		0,
		"Data should be empty initially"
	);
	assertEqual(
		Object.keys(data.conversations).length,
		0,
		"Conversations should be empty initially"
	);
});

testFramework.test("DataManager - Add data entry", () => {
	const dataManager = new DataManager();
	const success = dataManager.addDataEntry("testKey", "testValue");

	assertTrue(success, "Should successfully add data entry");
	assertTrue(dataManager.hasDataKey("testKey"), "Should have the added key");
	assertEqual(
		dataManager.getDataEntry("testKey"),
		"testValue",
		"Should return correct value"
	);
});

testFramework.test("DataManager - Add data entry with empty values", () => {
	const dataManager = new DataManager();
	const success1 = dataManager.addDataEntry("", "testValue");
	const success2 = dataManager.addDataEntry("testKey", "");

	assertFalse(success1, "Should fail with empty key");
	assertFalse(success2, "Should fail with empty value");
});

testFramework.test("DataManager - Add duplicate data entry", () => {
	const dataManager = new DataManager();
	dataManager.addDataEntry("testKey", "testValue");
	const success = dataManager.addDataEntry("testKey", "anotherValue");

	assertFalse(success, "Should fail to add duplicate key");
});

testFramework.test("DataManager - Update data entry", () => {
	const dataManager = new DataManager();
	dataManager.addDataEntry("testKey", "testValue");
	const success = dataManager.updateDataEntry(
		"testKey",
		"testKey",
		"updatedValue"
	);

	assertTrue(success, "Should successfully update data entry");
	assertEqual(
		dataManager.getDataEntry("testKey"),
		"updatedValue",
		"Should return updated value"
	);
});

testFramework.test("DataManager - Update data entry with new key", () => {
	const dataManager = new DataManager();
	dataManager.addDataEntry("oldKey", "testValue");
	const success = dataManager.updateDataEntry(
		"oldKey",
		"newKey",
		"testValue"
	);

	assertTrue(success, "Should successfully update with new key");
	assertFalse(dataManager.hasDataKey("oldKey"), "Should not have old key");
	assertTrue(dataManager.hasDataKey("newKey"), "Should have new key");
});

testFramework.test("DataManager - Delete data entry", () => {
	const dataManager = new DataManager();
	dataManager.addDataEntry("testKey", "testValue");
	const success = dataManager.deleteDataEntry("testKey");

	assertTrue(success, "Should successfully delete data entry");
	assertFalse(
		dataManager.hasDataKey("testKey"),
		"Should not have deleted key"
	);
});

testFramework.test("DataManager - Add conversation", () => {
	const dataManager = new DataManager();
	const success = dataManager.addConversation("testConv", [
		"message1",
		"message2"
	]);

	assertTrue(success, "Should successfully add conversation");
	assertTrue(
		dataManager.hasConversation("testConv"),
		"Should have the added conversation"
	);
	assertEqual(
		dataManager.getConversation("testConv").length,
		2,
		"Should have correct number of messages"
	);
});

testFramework.test("DataManager - Add conversation with empty key", () => {
	const dataManager = new DataManager();
	const success = dataManager.addConversation("", ["message1"]);

	assertFalse(success, "Should fail with empty conversation key");
});

testFramework.test("DataManager - Add duplicate conversation", () => {
	const dataManager = new DataManager();
	dataManager.addConversation("testConv", ["message1"]);
	const success = dataManager.addConversation("testConv", ["message2"]);

	assertFalse(success, "Should fail to add duplicate conversation");
});

testFramework.test("DataManager - Update conversation key", () => {
	const dataManager = new DataManager();
	dataManager.addConversation("oldKey", ["message1"]);
	const success = dataManager.updateConversationKey("oldKey", "newKey");

	assertTrue(success, "Should successfully update conversation key");
	assertFalse(
		dataManager.hasConversation("oldKey"),
		"Should not have old key"
	);
	assertTrue(dataManager.hasConversation("newKey"), "Should have new key");
});

testFramework.test("DataManager - Delete conversation", () => {
	const dataManager = new DataManager();
	dataManager.addConversation("testConv", ["message1"]);
	const success = dataManager.deleteConversation("testConv");

	assertTrue(success, "Should successfully delete conversation");
	assertFalse(
		dataManager.hasConversation("testConv"),
		"Should not have deleted conversation"
	);
});

testFramework.test("DataManager - Add message to conversation", () => {
	const dataManager = new DataManager();
	dataManager.addConversation("testConv", ["message1"]);
	const success = dataManager.addMessage("testConv", "message2");

	assertTrue(success, "Should successfully add message");
	assertEqual(
		dataManager.getConversation("testConv").length,
		2,
		"Should have correct number of messages"
	);
});

testFramework.test("DataManager - Update message in conversation", () => {
	const dataManager = new DataManager();
	dataManager.addConversation("testConv", ["message1", "message2"]);
	const success = dataManager.updateMessage("testConv", 0, "updatedMessage");

	assertTrue(success, "Should successfully update message");
	assertEqual(
		dataManager.getMessage("testConv", 0),
		"updatedMessage",
		"Should return updated message"
	);
});

testFramework.test("DataManager - Delete message from conversation", () => {
	const dataManager = new DataManager();
	dataManager.addConversation("testConv", ["message1", "message2"]);
	const success = dataManager.deleteMessage("testConv", 0);

	assertTrue(success, "Should successfully delete message");
	assertEqual(
		dataManager.getConversation("testConv").length,
		1,
		"Should have correct number of messages"
	);
});

testFramework.test("DataManager - Clone conversation", () => {
	const dataManager = new DataManager();
	dataManager.addConversation("original", ["message1", "message2"]);
	const success = dataManager.cloneConversation("original", "clone");

	assertTrue(success, "Should successfully clone conversation");
	assertTrue(
		dataManager.hasConversation("clone"),
		"Should have cloned conversation"
	);
	assertEqual(
		dataManager.getConversation("clone").length,
		2,
		"Should have same number of messages"
	);
});

testFramework.test(
	"DataManager - Process conversations with merge fields",
	() => {
		const dataManager = new DataManager();
		dataManager.addDataEntry("testKey", "testValue");
		dataManager.addConversation("testConv", [
			"Hello {!data.testKey.value}",
			"Response"
		]);

		const processed = dataManager.getProcessedConversation("testConv");
		assertEqual(processed.length, 2, "Should have processed messages");
		assertEqual(
			processed[0].message,
			"Hello testValue",
			"Should process merge fields"
		);
		assertEqual(
			processed[1].message,
			"Response",
			"Should keep non-merge field messages"
		);
	}
);

testFramework.test("DataManager - Get statistics", () => {
	const dataManager = new DataManager();
	dataManager.addDataEntry("key1", "value1");
	dataManager.addDataEntry("key2", "value2");
	dataManager.addConversation("conv1", ["msg1", "msg2"]);
	dataManager.addConversation("conv2", ["msg1", "msg2", "msg3", "msg4"]);

	const stats = dataManager.getStatistics();
	assertEqual(stats.dataEntries, 2, "Should have correct data entries count");
	assertEqual(
		stats.conversations,
		2,
		"Should have correct conversations count"
	);
	assertEqual(
		stats.totalMessages,
		6,
		"Should have correct total messages count"
	);
	assertTrue(stats.hasData, "Should indicate has data");
});

testFramework.test("DataManager - Reset data", () => {
	const dataManager = new DataManager();
	dataManager.addDataEntry("testKey", "testValue");
	dataManager.addConversation("testConv", ["message1"]);

	dataManager.reset();

	assertFalse(
		dataManager.hasDataEntries(),
		"Should not have data entries after reset"
	);
	assertFalse(
		dataManager.hasConversations(),
		"Should not have conversations after reset"
	);
	assertFalse(
		dataManager.hasAnyData(),
		"Should not have any data after reset"
	);
});
