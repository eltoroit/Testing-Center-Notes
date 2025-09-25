@isTest
public with sharing class JsonDataControllerTest {
	@isTest
	static void testProcessJsonData() {
		// Test data
		Map<String, Object> testData = new Map<String, Object>();
		Map<String, Object> patrickGo = new Map<String, Object>();
		patrickGo.put('key', 'Patrick Go');
		patrickGo.put('value', '003Nu00000FHNFjIAP');
		testData.put('PatrickGo', patrickGo);

		Map<String, Object> yourMainLab = new Map<String, Object>();
		yourMainLab.put('key', 'Your Main Lab');
		yourMainLab.put('value', '001Nu00000F9fL4IAJ');
		testData.put('YourMainLab', yourMainLab);

		List<Object> conversation = new List<Object>();
		conversation.add(
			'Find {!data.PatrickGo.key} from {!data.YourMainLab.key} account'
		);
		conversation.add(
			'{!data.PatrickGo.pair} is associated with {!data.YourMainLab.pair}'
		);

		List<Object> conversations = new List<Object>();
		conversations.add(conversation);

		Map<String, Object> jsonData = new Map<String, Object>();
		jsonData.put('data', testData);
		jsonData.put('conversations', conversations);

		String jsonString = JSON.serialize(jsonData);

		Test.startTest();
		String result = JsonDataController.processJsonData(jsonString);
		Test.stopTest();

		// Verify the result
		System.assertNotEquals(null, result, 'Result should not be null');

		List<Object> processedConversations = (List<Object>) JSON.deserializeUntyped(
			result
		);
		System.assertEquals(
			1,
			processedConversations.size(),
			'Should have one processed conversation'
		);

		List<Object> firstConversation = (List<Object>) processedConversations[0];
		System.assertEquals(
			2,
			firstConversation.size(),
			'Should have two messages in conversation'
		);

		Map<String, Object> firstMessage = (Map<String, Object>) firstConversation[0];
		System.assertEquals(
			'user',
			firstMessage.get('role'),
			'First message should be user role'
		);
		System.assertEquals(
			'Find Patrick Go from Your Main Lab account',
			firstMessage.get('message'),
			'User message should be processed correctly'
		);

		Map<String, Object> secondMessage = (Map<String, Object>) firstConversation[1];
		System.assertEquals(
			'agent',
			secondMessage.get('role'),
			'Second message should be agent role'
		);
		System.assertEquals(
			'[Patrick Go]=[003Nu00000FHNFjIAP] is associated with [Your Main Lab]=[001Nu00000F9fL4IAJ]',
			secondMessage.get('message'),
			'Agent message should be processed correctly'
		);
	}

	@isTest
	static void testProcessJsonDataWithInvalidData() {
		String invalidJson = '{"invalid": "data"}';

		Test.startTest();
		try {
			JsonDataController.processJsonData(invalidJson);
			System.assert(false, 'Should have thrown an exception');
		} catch (AuraHandledException e) {
			System.assert(
				e.getMessage().contains('Error processing JSON data'),
				'Should throw appropriate error message'
			);
		}
		Test.stopTest();
	}

	@isTest
	static void testSaveJsonData() {
		String testJson = '{"test": "data"}';

		Test.startTest();
		String result = JsonDataController.saveJsonData(testJson);
		Test.stopTest();

		System.assertEquals(
			'Data saved successfully',
			result,
			'Should return success message'
		);
	}

	@isTest
	static void testMergeFieldProcessing() {
		// This is a white-box test for the private method functionality
		// Testing through the public processJsonData method

		Map<String, Object> testData = new Map<String, Object>();
		Map<String, Object> webcast = new Map<String, Object>();
		webcast.put('key', 'Webcast');
		webcast.put('value', '00UNq000008fBqvMAE');
		testData.put('Webcast', webcast);

		List<Object> conversation = new List<Object>();
		conversation.add('Test {!data.Webcast.key} functionality');
		conversation.add('Value: {!data.Webcast.value}');
		conversation.add('Pair: {!data.Webcast.pair}');

		List<Object> conversations = new List<Object>();
		conversations.add(conversation);

		Map<String, Object> jsonData = new Map<String, Object>();
		jsonData.put('data', testData);
		jsonData.put('conversations', conversations);

		String jsonString = JSON.serialize(jsonData);

		Test.startTest();
		String result = JsonDataController.processJsonData(jsonString);
		Test.stopTest();

		List<Object> processedConversations = (List<Object>) JSON.deserializeUntyped(
			result
		);
		List<Object> firstConversation = (List<Object>) processedConversations[0];

		Map<String, Object> firstMessage = (Map<String, Object>) firstConversation[0];
		System.assertEquals(
			'Test Webcast functionality',
			firstMessage.get('message'),
			'Key replacement should work'
		);

		Map<String, Object> secondMessage = (Map<String, Object>) firstConversation[1];
		System.assertEquals(
			'Value: 00UNq000008fBqvMAE',
			secondMessage.get('message'),
			'Value replacement should work'
		);

		Map<String, Object> thirdMessage = (Map<String, Object>) firstConversation[2];
		System.assertEquals(
			'Pair: [Webcast]=[00UNq000008fBqvMAE]',
			thirdMessage.get('message'),
			'Pair replacement should work'
		);
	}
}
