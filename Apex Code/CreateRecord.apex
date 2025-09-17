MessagingChannel mc = [
	SELECT Id, DeveloperName, MessageType, PlatformType, IsActive
	FROM MessagingChannel
	WHERE DeveloperName = 'ET_MIAW_Messaging_Channel'
];

MessagingEndUser meu = new MessagingEndUser();
meu.Name = 'Guest';
meu.MessagingChannelId = mc.ID;
meu.MessageType = 'EmbeddedMessaging';
meu.MessagingPlatformKey = 'TEST_PLATFORM';
insert meu;
System.debug('MessagingEndUser: ' + meu);

// // This record can not be inserted!
// // https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_conversation.htm
// // https://trailhead.salesforce.com/trailblazer-community/feed/0D5KX000000W3Xw0AK
// Conversation c = new Conversation();
// insert c;
// System.debug('Conversation: ' + c);

MessagingSession oldMS = [
	SELECT Id, Name, Status, MessagingEndUserId, ConversationId, CustomMSID__c
	FROM MessagingSession
	// Pick a "good" sample record
	// WHERE Status = 'Ended'
	// WHERE Name = 'MS-00000010'
	// I used this 'MessagingEndUserId' for manual testing, and now I can't delete the MS record!
	WHERE MessagingEndUserId != '0PAgL000002aCXlWAM'
	LIMIT 1
];

MessagingSession newMS = new MessagingSession();
newMS.MessagingChannelId = mc.ID;
newMS.MessagingEndUserId = meu.ID;
newMS.ConversationId = oldMS.ConversationId;
newMS.Status = 'Ended'; // << MUST BE ENDED SO THAT IT CAN BE DELETED!
// newMS.CustomMSID__c = <<< This will be set in the trigger;
// insert newMS; <<< Do not insert record, just return it.
// insert newMS;
