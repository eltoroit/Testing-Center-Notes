# JSON Data Editor - Deno Web Application

A modern web application built with Deno for editing JSON data with merge field processing capabilities.

## Features

-   **Data Management**: Edit key-value pairs in a user-friendly table format
-   **Conversation Management**: Edit conversation arrays with automatic user/agent role assignment
-   **Merge Field Processing**: Automatic processing of merge fields in conversations
-   **File Operations**: Upload and download JSON files
-   **Real-time Preview**: See processed conversations with merge fields resolved
-   **Modern UI**: Responsive design with beautiful animations and toast notifications

## Merge Field Syntax

The application supports three types of merge fields:

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

## Installation & Setup

### Prerequisites

-   [Deno](https://deno.land/) installed on your system

### Running the Application

1. **Clone or download** the DenoApp folder to your local machine

2. **Navigate to the DenoApp directory**:

    ```bash
    cd DenoApp
    ```

3. **Start the server**:

    ```bash
    deno run --allow-read --allow-net server.ts
    ```

4. **Open your browser** and navigate to:
    ```
    http://localhost:8000
    ```

## Usage

### 1. Data Table

-   View and edit key-value pairs
-   Add new entries with the "Add New Entry" button
-   Edit existing entries inline
-   Delete entries with confirmation
-   Save/cancel editing operations

### 2. Conversations Table

-   Edit raw conversation messages (input)
-   View processed conversations with merge fields resolved (output)
-   Add/remove conversations and individual messages
-   Automatic user/agent role assignment (alternating)
-   Inline editing with save/cancel functionality

### 3. File Operations

-   **Upload**: Click "Upload JSON File" to load data from a JSON file
-   **Download**: Click "Download JSON" to export current data including processed conversations
-   **Load Sample**: Click "Load Sample Data" to load the default sample data

### 4. Toggle Controls

-   **Hide/Show Data Table**: Toggle visibility of the data editing section
-   **Hide/Show Conversations Table**: Toggle visibility of the conversations section

## Technical Details

### Architecture

-   **Backend**: Deno HTTP server serving static files
-   **Frontend**: Vanilla JavaScript with modern ES6+ features
-   **Styling**: Custom CSS with responsive design
-   **Icons**: Font Awesome for consistent iconography

### File Structure

```
DenoApp/
├── server.ts              # Deno HTTP server
├── static/
│   ├── index.html         # Main HTML page
│   ├── app.js            # Frontend JavaScript application
│   └── style.css         # CSS styling
└── README.md             # This file
```

### Key Features

-   **Real-time Processing**: Merge fields are processed automatically as you type
-   **Responsive Design**: Works on desktop, tablet, and mobile devices
-   **Toast Notifications**: User feedback for all operations
-   **Loading States**: Visual feedback during processing
-   **Error Handling**: Graceful error handling with user-friendly messages

## Development

### Adding New Features

1. **Frontend Logic**: Modify `static/app.js` for new functionality
2. **UI Changes**: Update `static/index.html` for new interface elements
3. **Styling**: Modify `static/style.css` for visual changes
4. **Server**: Update `server.ts` for new API endpoints (if needed)

### Testing

-   Open browser developer tools to see console logs
-   Test file upload/download functionality
-   Verify merge field processing with different data sets
-   Test responsive design on different screen sizes

## Browser Compatibility

-   **Chrome**: Full support
-   **Firefox**: Full support
-   **Safari**: Full support
-   **Edge**: Full support
-   **Mobile browsers**: Full responsive support

## Troubleshooting

### Common Issues

1. **Server won't start**:

    - Ensure Deno is installed: `deno --version`
    - Check if port 8000 is available
    - Verify file permissions

2. **File upload not working**:

    - Ensure the file is valid JSON
    - Check browser console for error messages
    - Verify file size is reasonable

3. **Merge fields not processing**:

    - Check that data keys exist in the data section
    - Verify merge field syntax is correct
    - Look for console errors

4. **Styling issues**:
    - Clear browser cache
    - Check if CSS file is loading properly
    - Verify Font Awesome is loading

### Debug Mode

Open browser developer tools (F12) to see:

-   Console logs for debugging
-   Network requests
-   Error messages
-   Performance metrics

## License

This application is provided as-is for educational and development purposes.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.
