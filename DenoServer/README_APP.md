# JSON Test Data Editor

A Deno web application for editing JSON test data files and exporting them to CSV format.

## Features

-   **File Upload**: Upload JSON files (stored in frontend, not server)
-   **Dynamic Data Processing**: Handles any JSON structure matching the specified format
-   **Editable UI**: Edit data, contextVariables, and tests sections
-   **Complex Test Editing**: Dynamic conversation history management
-   **CSV Export**: Proper formatting for arrays and conversation history
-   **JSON Export**: Download edited data as JSON

## Data Transformations

The app automatically transforms text patterns:

-   `{!data.PatrickGo.value}` → `"003Nu00000FHNFjIAP"`
-   `{!data.PatrickGo.key}` → `"Patrick Go"`
-   `{!data.PatrickGo.pair}` → `[Patrick Go]=[003Nu00000FHNFjIAP]`

## CSV Output Format

The CSV includes these columns:

-   Conversation History (JSON format)
-   Utterance
-   Expected Topic
-   Expected Actions (JSON array format)
-   Expected Response
-   Context Variable currentObjectApiName
-   Context Variable currentRecordId

## Running the Application

1. Make sure you have Deno installed
2. Run the server:
    ```bash
    deno run --allow-net --allow-read server.ts
    ```
3. Open your browser to `http://localhost:8000`
4. Upload your JSON file and start editing!

## Usage

1. **Upload**: Click "Upload JSON File" and select your data.json file
2. **Edit**: Use the tabs to edit different sections:
    - **Data**: Edit key-value pairs for data transformation
    - **Context Variables**: Edit context variable descriptions
    - **Tests**: Edit test cases with conversation history, actions, etc.
3. **Export**: Download as CSV or JSON using the export buttons
4. **Preview**: See the CSV output in real-time as you edit

## File Structure

-   `server.ts` - Deno server with static file serving and download endpoints
-   `index.html` - Main HTML interface
-   `script.js` - Frontend JavaScript with all editing logic
-   `style.css` - Modern, responsive CSS styling

The app processes files entirely in the frontend - no data is stored on the server.
