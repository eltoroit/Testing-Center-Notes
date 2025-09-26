# Modernized JSON Data Editor v2.0

A modernized, modular version of the ELTOROit Agentforce Testing Center Helper application with improved architecture, better code organization, and enhanced maintainability.

## 🚀 Features

### Core Functionality (Preserved from v1.0)

-   **Two-mode UI**: Initial state → full application
-   **File Operations**: Upload/download JSON files with confirmation
-   **Data Management**: Inline editing of data entries with validation
-   **Conversation Management**: Add/edit/delete/clone conversations
-   **Merge Field Processing**: Real-time processing of `{!data.key.field}` syntax
-   **Validation System**: Comprehensive validation with error highlighting
-   **Color Feedback**: Yellow (pending), red (errors), green (success)
-   **UI Features**: Foldable conversation cards, merge field generator modal
-   **User Experience**: Copy-to-clipboard, unsaved changes warning, toast notifications
-   **Responsive Design**: Works on desktop and mobile devices

### New Architecture Improvements

-   **ES6 Modules**: Clean import/export structure
-   **Modular Design**: Separated concerns into focused modules
-   **Validation Logic**: Extracted into dedicated ValidationManager
-   **DOM Utilities**: Centralized DOM manipulation functions
-   **Constants Management**: Centralized configuration and magic numbers
-   **CSS Custom Properties**: Consistent theming and maintainable styles
-   **Testing Framework**: Built-in testing utilities and test cases
-   **Error Handling**: Comprehensive error handling and user feedback

## 📁 Project Structure

```
DenoApp2/
├── static/
│   ├── index.html              # Optimized HTML structure
│   ├── style.css               # CSS with custom properties
│   ├── app.js                  # Main application entry point
│   ├── modules/                # Core application modules
│   │   ├── DataManager.js      # Data operations and CRUD
│   │   ├── ValidationManager.js # Validation logic
│   │   ├── UIRenderer.js       # DOM manipulation and rendering
│   │   ├── FileHandler.js      # File upload/download operations
│   │   └── StateManager.js     # Application state coordination
│   ├── utils/                  # Utility functions
│   │   ├── constants.js        # Application constants and configuration
│   │   ├── DOM.js              # DOM manipulation utilities
│   │   └── helpers.js          # General helper functions
│   └── components/             # UI components (future expansion)
├── tests/                      # Testing framework and test cases
│   ├── test-helpers.js         # Testing utilities
│   ├── test-data-manager.js    # DataManager tests
│   ├── test-validation-manager.js # ValidationManager tests
│   └── test-runner.html        # Test runner interface
├── server.js                   # Deno server (port 8001)
└── README.md                   # This file
```

## 🛠️ Installation & Setup

### Prerequisites

-   [Deno](https://deno.land/) installed on your system

### Running the Application

1. **Navigate to the DenoApp2 directory:**

    ```bash
    cd DenoApp2
    ```

2. **Start the server:**

    ```bash
    deno run --allow-read --allow-net server.js
    ```

3. **Open your browser:**
    ```
    http://localhost:8001
    ```

### Running Tests

1. **Open the test runner:**

    ```
    http://localhost:8001/tests/test-runner.html
    ```

2. **Or run tests programmatically:**
    ```javascript
    // In browser console
    testFramework.run();
    ```

## 🏗️ Architecture Overview

### Module Responsibilities

#### DataManager

-   Manages all data operations (CRUD for data entries and conversations)
-   Handles merge field processing
-   Maintains data integrity and consistency
-   Provides data statistics and validation

#### ValidationManager

-   Validates merge field syntax and data references
-   Checks conversation structure (even number of messages)
-   Validates data entries and conversation titles
-   Provides detailed error messages and validation results

#### UIRenderer

-   Handles all DOM manipulation and rendering
-   Manages UI state (panels, folds, editing modes)
-   Creates and updates UI elements
-   Handles responsive design and animations

#### FileHandler

-   Manages file upload and download operations
-   Validates file types and data structure
-   Handles drag-and-drop functionality
-   Provides file information and utilities

#### StateManager

-   Coordinates between all modules
-   Manages application state and user interactions
-   Handles event listeners and user actions
-   Provides the main application interface

### Key Design Patterns

-   **Module Pattern**: Each module has a specific responsibility
-   **Observer Pattern**: State changes trigger UI updates
-   **Factory Pattern**: UI elements are created through factory methods
-   **Strategy Pattern**: Different validation strategies for different data types

## 🎨 CSS Custom Properties

The application uses CSS custom properties for consistent theming:

```css
:root {
	--color-primary: #007bff;
	--color-success: #28a745;
	--color-danger: #dc3545;
	--spacing-md: 12px;
	--border-radius-lg: 8px;
	--transition-fast: 0.2s ease;
	/* ... and many more */
}
```

## 🧪 Testing

### Test Framework

-   Simple, lightweight testing framework included
-   No external dependencies
-   Runs in browser environment
-   Provides assertions and test utilities

### Running Tests

```javascript
// Run all tests
testFramework.run();

// Individual assertions
assert(true, "This should pass");
assertEqual(actual, expected, "Values should match");
assertTrue(condition, "Condition should be true");
```

### Test Coverage

-   **DataManager**: CRUD operations, merge field processing, data validation
-   **ValidationManager**: Merge field validation, conversation structure, error handling
-   **Utilities**: Helper functions, DOM operations, data processing

## 🔧 Configuration

### Constants

All configuration is centralized in `utils/constants.js`:

```javascript
export const APP_CONFIG = {
	APP_NAME: "ELTOROit Agentforce Testing Center Helper",
	APP_VERSION: "2.0.0",
	TOAST_DURATION: 5000,
	MIN_CONVERSATION_MESSAGES: 2
	// ... more configuration
};
```

### Customization

-   **Colors**: Modify CSS custom properties in `style.css`
-   **Messages**: Update message constants in `constants.js`
-   **Validation**: Adjust validation rules in `ValidationManager.js`
-   **UI**: Customize rendering logic in `UIRenderer.js`

## 🚀 Performance Improvements

### Optimizations Made

-   **Removed Debouncing**: As per requirements, direct processing instead of debounced operations
-   **Modular Loading**: ES6 modules enable better code splitting
-   **Efficient DOM Updates**: Targeted updates instead of full re-renders
-   **CSS Custom Properties**: Faster style calculations and consistent theming
-   **Optimized Event Handling**: Centralized event management

### Memory Management

-   Proper cleanup of event listeners
-   Efficient data cloning and copying
-   Minimal DOM manipulation
-   Garbage collection friendly patterns

## 🔄 Migration from v1.0

### Breaking Changes

-   **Module Structure**: Code is now organized into modules
-   **Global Variables**: Reduced global scope, better encapsulation
-   **Event Handling**: Centralized event management
-   **CSS Classes**: Some class names may have changed

### Compatibility

-   **Data Format**: Fully compatible with v1.0 data format
-   **Features**: All v1.0 features preserved and enhanced
-   **Browser Support**: Modern browsers with ES6 module support

## 🐛 Troubleshooting

### Common Issues

1. **Module Import Errors**

    - Ensure you're running on a local server (not file://)
    - Check that all module paths are correct

2. **File Upload Issues**

    - Verify file is valid JSON format
    - Check browser console for error messages

3. **Validation Errors**
    - Ensure merge field syntax is correct: `{!data.key.field}`
    - Check that data keys exist before referencing them

### Debug Mode

Enable debug logging by opening browser console. All major operations are logged with appropriate log levels.

## 📝 Development Guidelines

### Code Style

-   Use ES6+ features (modules, arrow functions, destructuring)
-   Follow consistent naming conventions
-   Add JSDoc comments for all public methods
-   Use meaningful variable and function names

### Adding New Features

1. Create new module in `modules/` directory
2. Add constants to `utils/constants.js`
3. Update `StateManager.js` to coordinate new functionality
4. Add tests in `tests/` directory
5. Update documentation

### Testing New Code

1. Write tests for new functionality
2. Run test suite to ensure no regressions
3. Test in multiple browsers
4. Verify responsive design on mobile devices

## 📄 License

This project is part of the ELTOROit Agentforce Testing Center Helper application.

## 🤝 Contributing

When contributing to this project:

1. Follow the established architecture patterns
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure backward compatibility with data format
5. Test across different browsers and devices

---

**Version**: 2.0.0  
**Last Updated**: 2025-01-17  
**Architecture**: Modern ES6 Modules with Deno Server
