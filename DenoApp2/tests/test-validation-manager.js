/**
 * ValidationManager Tests
 * Tests for the ValidationManager module
 */

import { ValidationManager } from "../static/modules/ValidationManager.js";

// Test ValidationManager functionality
testFramework.test(
	"ValidationManager - Initialize with empty data keys",
	() => {
		const validationManager = new ValidationManager();

		// Test with no data keys
		const result = validationManager.validateMergeFields(
			"Hello {!data.testKey.value}"
		);
		assertTrue(
			result.hasErrors,
			"Should have errors when data key not found"
		);
	}
);

testFramework.test("ValidationManager - Update data keys", () => {
	const validationManager = new ValidationManager();
	validationManager.updateDataKeys(["testKey1", "testKey2"]);

	const result = validationManager.validateMergeFields(
		"Hello {!data.testKey1.value}"
	);
	assertFalse(result.hasErrors, "Should not have errors with valid data key");
});

testFramework.test("ValidationManager - Validate empty message", () => {
	const validationManager = new ValidationManager();
	const result1 = validationManager.validateMergeFields("");
	const result2 = validationManager.validateMergeFields("   ");

	assertTrue(result1.hasErrors, "Should have errors for empty message");
	assertTrue(
		result2.hasErrors,
		"Should have errors for whitespace-only message"
	);
});

testFramework.test("ValidationManager - Validate valid merge field", () => {
	const validationManager = new ValidationManager();
	validationManager.updateDataKeys(["testKey"]);

	const result = validationManager.validateMergeFields(
		"Hello {!data.testKey.value}"
	);
	assertFalse(
		result.hasErrors,
		"Should not have errors for valid merge field"
	);
});

testFramework.test(
	"ValidationManager - Validate invalid merge field format",
	() => {
		const validationManager = new ValidationManager();
		validationManager.updateDataKeys(["testKey"]);

		const testCases = [
			"Hello {data.testKey.value}", // Missing !
			"Hello !data.testKey.value}", // Missing opening brace
			"Hello {!data.testKey.value", // Missing closing brace
			"Hello data.testKey.value", // No braces
			"Hello {!data.testKey.invalid}" // Invalid field type
		];

		testCases.forEach((testCase, index) => {
			const result = validationManager.validateMergeFields(testCase);
			assertTrue(
				result.hasErrors,
				`Test case ${index + 1} should have errors`
			);
		});
	}
);

testFramework.test("ValidationManager - Validate non-existent data key", () => {
	const validationManager = new ValidationManager();
	validationManager.updateDataKeys(["existingKey"]);

	const result = validationManager.validateMergeFields(
		"Hello {!data.nonExistentKey.value}"
	);
	assertTrue(
		result.hasErrors,
		"Should have errors for non-existent data key"
	);
});

testFramework.test("ValidationManager - Validate invalid field type", () => {
	const validationManager = new ValidationManager();
	validationManager.updateDataKeys(["testKey"]);

	const result = validationManager.validateMergeFields(
		"Hello {!data.testKey.invalid}"
	);
	assertTrue(result.hasErrors, "Should have errors for invalid field type");
});

testFramework.test(
	"ValidationManager - Validate conversation structure - valid",
	() => {
		const validationManager = new ValidationManager();

		const validConversations = [
			["user1", "agent1"], // 2 messages
			["user1", "agent1", "user2", "agent2"], // 4 messages
			["user1", "agent1", "user2", "agent2", "user3", "agent3"] // 6 messages
		];

		validConversations.forEach((conversation, index) => {
			const result =
				validationManager.validateConversationStructure(conversation);
			assertFalse(
				result.hasErrors,
				`Valid conversation ${index + 1} should not have errors`
			);
		});
	}
);

testFramework.test(
	"ValidationManager - Validate conversation structure - invalid",
	() => {
		const validationManager = new ValidationManager();

		const invalidConversations = [
			[], // 0 messages
			["user1"], // 1 message (odd)
			["user1", "agent1", "user2"] // 3 messages (odd)
		];

		invalidConversations.forEach((conversation, index) => {
			const result =
				validationManager.validateConversationStructure(conversation);
			assertTrue(
				result.hasErrors,
				`Invalid conversation ${index + 1} should have errors`
			);
		});
	}
);

testFramework.test("ValidationManager - Validate data entry", () => {
	const validationManager = new ValidationManager();

	const result1 = validationManager.validateDataEntry("testKey", "testValue");
	assertFalse(
		result1.hasErrors,
		"Should not have errors for valid data entry"
	);

	const result2 = validationManager.validateDataEntry("", "testValue");
	assertTrue(result2.hasErrors, "Should have errors for empty key");

	const result3 = validationManager.validateDataEntry("testKey", "");
	assertTrue(result3.hasErrors, "Should have errors for empty value");
});

testFramework.test("ValidationManager - Validate conversation title", () => {
	const validationManager = new ValidationManager();

	const result1 = validationManager.validateConversationTitle("Valid Title");
	assertFalse(result1.hasErrors, "Should not have errors for valid title");

	const result2 = validationManager.validateConversationTitle("");
	assertTrue(result2.hasErrors, "Should have errors for empty title");

	const result3 = validationManager.validateConversationTitle("   ");
	assertTrue(
		result3.hasErrors,
		"Should have errors for whitespace-only title"
	);
});

testFramework.test("ValidationManager - Check merge field errors", () => {
	const validationManager = new ValidationManager();
	validationManager.updateDataKeys(["testKey"]);

	const conversation1 = ["Hello {!data.testKey.value}", "Response"];
	const conversation2 = ["Hello {!data.invalidKey.value}", "Response"];

	assertFalse(
		validationManager.hasMergeFieldErrors(conversation1),
		"Should not have merge field errors"
	);
	assertTrue(
		validationManager.hasMergeFieldErrors(conversation2),
		"Should have merge field errors"
	);
});

testFramework.test("ValidationManager - Check structure errors", () => {
	const validationManager = new ValidationManager();

	const conversation1 = ["user1", "agent1"];
	const conversation2 = ["user1", "agent1", "user2"];

	assertFalse(
		validationManager.hasStructureErrors(conversation1),
		"Should not have structure errors"
	);
	assertTrue(
		validationManager.hasStructureErrors(conversation2),
		"Should have structure errors"
	);
});

testFramework.test("ValidationManager - Check any errors", () => {
	const validationManager = new ValidationManager();
	validationManager.updateDataKeys(["testKey"]);

	const conversation1 = ["Hello {!data.testKey.value}", "Response"];
	const conversation2 = ["Hello {!data.invalidKey.value}", "Response"];
	const conversation3 = ["user1", "agent1", "user2"];

	assertFalse(
		validationManager.hasAnyErrors(conversation1),
		"Should not have any errors"
	);
	assertTrue(
		validationManager.hasAnyErrors(conversation2),
		"Should have merge field errors"
	);
	assertTrue(
		validationManager.hasAnyErrors(conversation3),
		"Should have structure errors"
	);
});

testFramework.test("ValidationManager - Validate merge field syntax", () => {
	const validationManager = new ValidationManager();

	const validFields = [
		"{!data.testKey.key}",
		"{!data.testKey.value}",
		"{!data.testKey.pair}"
	];

	const invalidFields = [
		"{data.testKey.value}", // Missing !
		"!data.testKey.value}", // Missing opening brace
		"{!data.testKey.value", // Missing closing brace
		"{!data.testKey.invalid}", // Invalid field type
		"data.testKey.value" // No braces
	];

	validFields.forEach((field, index) => {
		const result = validationManager.validateMergeFieldSyntax(field);
		assertFalse(
			result.hasErrors,
			`Valid field ${index + 1} should not have errors`
		);
	});

	invalidFields.forEach((field, index) => {
		const result = validationManager.validateMergeFieldSyntax(field);
		assertTrue(
			result.hasErrors,
			`Invalid field ${index + 1} should have errors`
		);
	});
});

testFramework.test("ValidationManager - Get all validation errors", () => {
	const validationManager = new ValidationManager();
	validationManager.updateDataKeys(["testKey"]);

	const conversation = [
		"Hello {!data.invalidKey.value}", // Invalid key
		"   ", // Empty message
		"Valid message"
	];

	const errors = validationManager.getAllValidationErrors(
		"testConv",
		conversation
	);
	assertTrue(errors.length > 0, "Should have validation errors");
});
