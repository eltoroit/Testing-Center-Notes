/**
 * Test Helper Functions
 * Simple testing utilities for the modernized application
 */

// Simple test framework
class TestFramework {
	constructor() {
		this.tests = [];
		this.passed = 0;
		this.failed = 0;
	}

	test(name, testFunction) {
		this.tests.push({ name, testFunction });
	}

	async run() {
		console.log("🧪 Running Tests...\n");

		for (const test of this.tests) {
			try {
				await test.testFunction();
				console.log(`✅ ${test.name}`);
				this.passed++;
			} catch (error) {
				console.log(`❌ ${test.name}: ${error.message}`);
				this.failed++;
			}
		}

		console.log(
			`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`
		);
		return this.failed === 0;
	}

	assert(condition, message) {
		if (!condition) {
			throw new Error(message || "Assertion failed");
		}
	}

	assertEqual(actual, expected, message) {
		if (actual !== expected) {
			throw new Error(
				message || `Expected ${expected}, but got ${actual}`
			);
		}
	}

	assertTrue(condition, message) {
		this.assert(condition === true, message || "Expected true");
	}

	assertFalse(condition, message) {
		this.assert(condition === false, message || "Expected false");
	}

	assertThrows(fn, message) {
		try {
			fn();
			throw new Error(message || "Expected function to throw");
		} catch (error) {
			// Expected behavior
		}
	}
}

// Global test instance
window.testFramework = new TestFramework();

// Helper functions for testing
window.assert = (condition, message) =>
	testFramework.assert(condition, message);
window.assertEqual = (actual, expected, message) =>
	testFramework.assertEqual(actual, expected, message);
window.assertTrue = (condition, message) =>
	testFramework.assertTrue(condition, message);
window.assertFalse = (condition, message) =>
	testFramework.assertFalse(condition, message);
window.assertThrows = (fn, message) => testFramework.assertThrows(fn, message);

// Test data generators
window.createTestData = () => ({
	data: {
		"Test Key 1": "Test Value 1",
		"Test Key 2": "Test Value 2"
	},
	conversations: {
		"Test Conversation": [
			"Hello, this is a test message",
			"This is a response message"
		]
	}
});

window.createTestConversation = () => [
	"User message 1",
	"Agent response 1",
	"User message 2",
	"Agent response 2"
];

// Mock DOM elements for testing
window.createMockElement = (tag = "div", attributes = {}) => {
	const element = document.createElement(tag);
	Object.assign(element, attributes);
	return element;
};

// Mock file for testing
window.createMockFile = (
	content = '{"data": {}, "conversations": {}}',
	name = "test.json"
) => {
	const blob = new Blob([content], { type: "application/json" });
	return new File([blob], name, { type: "application/json" });
};

// Export for module usage
export { TestFramework };
