# JSON Test Data Editor - Salesforce LWC

A Lightning Web Component for editing JSON test data files and exporting them to CSV format.

## Features

-   **File Upload**: Upload JSON files directly in the browser
-   **Data Validation**: Comprehensive JSON structure validation with error reporting
-   **Editable UI**: Edit data, context variables, and tests with a user-friendly interface
-   **Dynamic CSV Export**: CSV columns are dynamically generated based on context variables
-   **Real-time Preview**: See CSV output as you edit
-   **Error Handling**: Toast notifications and inline error messages
-   **Lightning Design System**: Native Salesforce styling

## Components

### `jsonTestDataEditor`

The main container component that handles:

-   File upload and validation
-   Tab navigation between data sections
-   Data editing (data, context variables, tests)
-   CSV and JSON export
-   Error handling and user feedback

### `dataTransformationUtils`

A utility module containing:

-   JSON structure validation
-   Data transformation functions (e.g., `{!data.PatrickGo.pair}` → `[Patrick Go]=[003Nu00000FHNFjIAP]`)
-   CSV generation with dynamic columns
-   File download utilities

## Data Structure

The component expects JSON files with this structure:

```json
{
	"data": {
		"PatrickGo": {
			"key": "Patrick Go",
			"value": "003Nu00000FHNFjIAP"
		}
	},
	"contextVariables": {
		"currentObjectApiName": "Contact",
		"currentRecordId": "{!data.PatrickGo.value}"
	},
	"tests": [
		{
			"testNumber": 1,
			"utterance": "Find {!data.PatrickGo.key} from {!data.YourMainLab.key} account",
			"expectedTopic": "Contact_Management",
			"expectedActions": ["ExtractFieldsAndValuesFromUserInput"],
			"expectedResponse": "The call has been successfully logged.",
			"conversationHistory": [
				"Find {!data.PatrickGo.key} from {!data.YourMainLab.key} account",
				"{!data.PatrickGo.pair} is associated with {!data.YourMainLab.pair}"
			],
			"contextVariables": {
				"currentObjectApiName": "Contact",
				"currentRecordId": "{!data.PatrickGo.value}"
			}
		}
	]
}
```

## Data Transformations

The component automatically transforms these patterns:

-   `{!data.PatrickGo.value}` → `"003Nu00000FHNFjIAP"`
-   `{!data.PatrickGo.key}` → `"Patrick Go"`
-   `{!data.PatrickGo.pair}` → `[Patrick Go]=[003Nu00000FHNFjIAP]`

## CSV Output

The CSV includes these columns:

-   **Fixed columns**: Conversation History, Utterance, Expected Topic, Expected Actions, Expected Response
-   **Dynamic columns**: One column per context variable defined in the `contextVariables` section

## Installation

1. Deploy the components to your Salesforce org
2. Add the `jsonTestDataEditor` component to a Lightning page
3. Upload your JSON file and start editing!

## Validation Rules

The component validates:

-   Required top-level properties (data, contextVariables, tests)
-   Data structure for each section
-   Context variables used in tests must be defined in the main contextVariables section
-   Proper data types for all fields

## Error Handling

-   **JSON Structure Validation**: Comprehensive validation with detailed error messages
-   **Toast Notifications**: Success and error messages for user actions
-   **Inline Error Display**: Validation errors shown directly in the UI
-   **Graceful Degradation**: Component continues to work even with validation errors

## Future Enhancements

-   Performance optimizations for large datasets
-   Enhanced accessibility features
-   Salesforce file storage integration
-   Data persistence and version history
-   Configurable column mapping
-   Unit test coverage
