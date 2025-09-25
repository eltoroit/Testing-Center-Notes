# JSON Data Editor - Salesforce LWC

A Lightning Web Component for editing JSON data with merge field processing capabilities.

## Features

-   **Data Management**: Edit key-value pairs in a user-friendly table format
-   **Conversation Management**: Edit conversation arrays with automatic user/agent role assignment
-   **Merge Field Processing**: Automatic processing of merge fields in conversations
-   **File Operations**: Upload and download JSON files
-   **Real-time Preview**: See processed conversations with merge fields resolved

## Merge Field Syntax

The component supports three types of merge fields:

-   `{!data.KeyName.key}` - Returns the display name
-   `{!data.KeyName.value}` - Returns the ID value
-   `{!data.KeyName.pair}` - Returns formatted pair: `[Display Name]=[ID Value]`

## Data Structure

### Input JSON Format

```json
{
	"data": {
		"KeyName": {
			"key": "Display Name",
			"value": "ID_VALUE"
		}
	},
	"conversations": [
		[
			"User message with {!data.KeyName.key}",
			"Agent response with {!data.KeyName.pair}"
		]
	]
}
```

### Processed Output Format

```json
[
	[
		{ "role": "user", "message": "User message with Display Name" },
		{
			"role": "agent",
			"message": "Agent response with [Display Name]=[ID_VALUE]"
		}
	]
]
```

## Installation

1. Deploy the following components to your Salesforce org:

    - `jsonDataEditor` (main LWC component)
    - `dataTable` (child component for data editing)
    - `conversationsTable` (child component for conversation editing)
    - `JsonDataController` (Apex controller)

2. Add the component to any Lightning page:
    - App Builder
    - Record Page
    - Home Page
    - Community Page

## Component Structure

```
jsonDataEditor/
├── lwc/
│   ├── jsonDataEditor/          # Main component
│   ├── dataTable/               # Data editing table
│   └── conversationsTable/      # Conversation editing table
└── classes/
    └── JsonDataController.cls   # Apex controller for processing
```

## Usage

### 1. Data Table

-   View and edit key-value pairs
-   Add new entries
-   Delete existing entries
-   Inline editing with save/cancel options

### 2. Conversations Table

-   Edit raw conversation messages (input)
-   View processed conversations with merge fields resolved (output)
-   Add/remove conversations and messages
-   Automatic user/agent role assignment (alternating)

### 3. File Operations

-   **Upload**: Select a JSON file to load data
-   **Download**: Export current data including processed conversations

## Example Workflow

1. **Load Data**: Upload your JSON file or use the default sample data
2. **Edit Data**: Modify key-value pairs in the data table
3. **Edit Conversations**: Add or modify conversation messages
4. **Preview**: View processed conversations with merge fields resolved
5. **Export**: Download the complete JSON with processed data

## Technical Details

-   **API Version**: 58.0
-   **Apex Methods**:
    -   `processJsonData()` - Processes merge fields and formats conversations
    -   `saveJsonData()` - Saves data (placeholder for custom implementation)
-   **Responsive Design**: Mobile-friendly interface
-   **Error Handling**: Graceful error handling with toast notifications

## Customization

### Adding New Merge Field Types

Modify the `getFieldValue()` method in `JsonDataController.cls` to support additional field types.

### Styling

Each component includes custom CSS for modern UI styling. Modify the CSS files to match your org's branding.

### Storage

The current implementation processes data in memory. To persist data, implement custom storage logic in the `saveJsonData()` Apex method.

## Troubleshooting

### Common Issues

1. **File Upload Errors**: Ensure the uploaded file is valid JSON
2. **Merge Field Not Processing**: Check that the data key exists and field type is valid
3. **Template Errors**: Verify that all merge field references use correct syntax

### Debug Mode

Enable debug mode in Developer Console to see detailed error messages and processing logs.

## License

This component is provided as-is for educational and development purposes.
