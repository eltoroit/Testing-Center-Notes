I need help refactoring a Deno web application. We have a working version in `DenoApp/` and want to create a modernized version in `DenoApp2/` with better architecture.

TYhe Deno server is only to serve the files, no logic should be handled there. There is also no storage, other than downloading the files, so no LocalStorage, Cookies, ...

CURRENT WORKING FEATURES (all must be preserved):

-   Two-mode UI (initial state → full app)
-   File upload/download with confirmation
-   Data table with inline editing
-   Conversation management (add/edit/delete/clone)
-   Merge field processing ({!data.key.field})
-   Real-time validation with error highlighting
-   Color feedback system (yellow pending, red errors, green success)
-   Foldable conversation cards
-   Merge field generator modal
-   Copy-to-clipboard functionality
-   Unsaved changes warning
-   Toast notifications
-   Responsive design
-   Conversation structure validation (even number of messages)
-   Merge field validation (syntax, data keys, field types)
-   Blank message validation
-   Conversation title editing
-   Sticky navigation and headers
-   Button groups (file operations vs panel navigation)
-   Error state synchronization (title ↔ output colors)

ARCHITECTURE GOALS:

-   ES6 modules with import/export
-   Split monolithic class into focused modules
-   Extract validation logic into separate class
-   Create utility functions for DOM operations
-   Add constants file for magic numbers
-   Split large methods into smaller functions
-   Create CSS custom properties for consistent theming
-   Add JS testing framework
-   Test each module as we build it
-   Optimize HTML, CSS, and JavaScript

NEW STRUCTURE:
DenoApp2/
├── static/
│ ├── index.html (optimized)
│ ├── style.css (with CSS custom properties)
│ ├── app.js (main entry point)
│ ├── modules/
│ │ ├── DataManager.js
│ │ ├── UIRenderer.js
│ │ ├── ValidationManager.js
│ │ ├── FileHandler.js
│ │ └── StateManager.js
│ ├── utils/
│ │ ├── DOM.js
│ │ ├── constants.js
│ │ └── helpers.js
│ └── components/
│ ├── ConversationCard.js
│ ├── DataTable.js
│ └── MergeFieldModal.js
├── tests/ (for JS testing)
└── server.js

IMPLEMENTATION ORDER:

1. Create DenoApp2 directory structure
2. Constants & Utils foundation
3. DataManager
4. ValidationManager
5. UIRenderer
6. FileHandler
7. StateManager
8. Main App orchestration
9. Testing setup
10. CSS optimization

IMPORTANT: Remove debouncing - it's no longer needed since we removed the spinner. Just direct processing.

Please start by creating the DenoApp2 directory structure and begin with the constants/utils foundation.
