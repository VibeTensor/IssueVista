# Keyboard Shortcuts Reference

This guide documents all keyboard shortcuts available in IssueVista for efficient navigation and interaction.

## Overview

IssueVista is designed with keyboard accessibility in mind. All interactive elements can be accessed and controlled using keyboard shortcuts, making the application fully usable without a mouse.

## Global Shortcuts

These shortcuts work throughout the application regardless of which component is focused.

| Shortcut      | Action                 | Description                                                                                                     |
| ------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Esc`         | Close modal/popup/menu | Closes any open overlay, modal dialog, dropdown menu, or popup. Works from anywhere when an overlay is visible. |
| `Tab`         | Move focus forward     | Moves keyboard focus to the next interactive element in the tab order.                                          |
| `Shift + Tab` | Move focus backward    | Moves keyboard focus to the previous interactive element in the tab order.                                      |
| `Enter`       | Activate element       | Activates buttons, links, and other interactive elements when focused.                                          |
| `Space`       | Toggle/Activate        | Toggles checkboxes, buttons, and selectable items when focused.                                                 |

## Search Form Shortcuts

The search form is the primary way to find GitHub issues. These shortcuts help you search efficiently.

| Shortcut      | Action         | Description                                                                                 |
| ------------- | -------------- | ------------------------------------------------------------------------------------------- |
| `Enter`       | Submit search  | Executes the search with the current repository URL. Works when the input field is focused. |
| `Tab`         | Next field     | Moves focus from the URL input to the token input and then to the search button.            |
| `Shift + Tab` | Previous field | Moves focus backward through the form fields.                                               |

### Tips for Search Form

1. After entering a repository URL, press `Enter` to immediately start searching
2. Use `Tab` to quickly move between the URL field and the optional token field
3. The search button can be activated with either `Enter` or `Space` when focused

## Search History Dropdown

When the search history dropdown is open, you can navigate through your previous searches using the keyboard.

| Shortcut     | Action         | Description                                                                    |
| ------------ | -------------- | ------------------------------------------------------------------------------ |
| `Arrow Down` | Next item      | Highlights the next search history entry in the list.                          |
| `Arrow Up`   | Previous item  | Highlights the previous search history entry in the list.                      |
| `Enter`      | Select item    | Selects the currently highlighted history item and populates the search field. |
| `Esc`        | Close dropdown | Closes the search history dropdown without making a selection.                 |

### How Search History Works

- Your recent searches are automatically saved to browser local storage
- Up to 10 recent searches are stored
- Click on the search input or press `Arrow Down` when focused to open the history
- Navigate with arrow keys and press `Enter` to reuse a previous search

## Export Menu Shortcuts

The export menu allows you to download your search results in different formats.

| Shortcut     | Action          | Description                                              |
| ------------ | --------------- | -------------------------------------------------------- |
| `Enter`      | Open menu       | Opens the export menu when the export button is focused. |
| `Space`      | Open menu       | Alternative way to open the export menu.                 |
| `Arrow Down` | Next option     | Moves highlight to the next export format option.        |
| `Arrow Up`   | Previous option | Moves highlight to the previous export format option.    |
| `Enter`      | Select format   | Exports results in the currently highlighted format.     |
| `Esc`        | Close menu      | Closes the export menu without exporting.                |

### Available Export Formats

- JSON: Machine-readable format for programmatic use
- CSV: Spreadsheet-compatible format for data analysis
- Markdown: Formatted text for documentation

## Theme Selector Shortcuts

The theme selector allows you to customize the appearance of IssueVista.

| Shortcut      | Action         | Description                                                      |
| ------------- | -------------- | ---------------------------------------------------------------- |
| `Enter`       | Open selector  | Opens the theme selector panel when the theme button is focused. |
| `Arrow Right` | Next theme     | Moves to the next theme option in the horizontal direction.      |
| `Arrow Left`  | Previous theme | Moves to the previous theme option in the horizontal direction.  |
| `Arrow Down`  | Next row       | Moves to the theme option in the row below.                      |
| `Arrow Up`    | Previous row   | Moves to the theme option in the row above.                      |
| `Enter`       | Apply theme    | Applies the currently highlighted theme and closes the selector. |
| `Esc`         | Close selector | Closes the theme selector without changing the theme.            |

### Available Themes

IssueVista offers multiple color themes to suit your preferences and reduce eye strain. Use the arrow keys to browse through available options and press Enter to apply your selection.

## Filter Builder Shortcuts

The filter builder helps you refine your search results with specific criteria.

| Shortcut | Action           | Description                                                           |
| -------- | ---------------- | --------------------------------------------------------------------- |
| `Tab`    | Navigate filters | Moves between filter type selector, value input, and action buttons.  |
| `Enter`  | Apply filter     | Applies the current filter when the value input is focused and valid. |
| `Esc`    | Cancel filter    | Cancels the current filter operation and closes the filter input.     |

### Filter Types

- Label: Filter by issue labels (bug, enhancement, documentation, etc.)
- Language: Filter by programming language
- State: Filter by issue state (open, closed)
- Author: Filter by issue author

## Language Chips Shortcuts

Language filter chips allow you to quickly filter results by programming language.

| Shortcut | Action           | Description                                               |
| -------- | ---------------- | --------------------------------------------------------- |
| `Tab`    | Navigate chips   | Moves focus between language chip buttons.                |
| `Space`  | Toggle selection | Toggles the selection state of the focused language chip. |
| `Enter`  | Toggle selection | Alternative way to toggle language chip selection.        |

### Using Language Filters

1. Tab to the language chips section
2. Use Tab to move between individual language chips
3. Press Space or Enter to select or deselect a language
4. Multiple languages can be selected simultaneously

## Modal Dialog Shortcuts

Modal dialogs are used for help information, confirmations, and other focused interactions.

| Shortcut      | Action           | Description                                                                  |
| ------------- | ---------------- | ---------------------------------------------------------------------------- |
| `Esc`         | Close modal      | Closes the modal dialog and returns focus to the triggering element.         |
| `Tab`         | Next element     | Cycles through focusable elements within the modal. Focus is trapped inside. |
| `Shift + Tab` | Previous element | Cycles backward through focusable elements within the modal.                 |
| `Enter`       | Confirm action   | Activates the primary action button (like "Got it!" or "Confirm").           |

### Focus Trapping

When a modal is open, keyboard focus is trapped within the modal. This means:

- Pressing Tab will cycle through modal elements only
- Focus cannot escape to elements behind the modal
- This follows accessibility best practices for modal dialogs

## Context Menu Shortcuts

Context menus appear for additional actions on specific elements.

| Shortcut     | Action        | Description                                        |
| ------------ | ------------- | -------------------------------------------------- |
| `Arrow Down` | Next item     | Highlights the next menu item.                     |
| `Arrow Up`   | Previous item | Highlights the previous menu item.                 |
| `Enter`      | Select item   | Activates the currently highlighted menu item.     |
| `Esc`        | Close menu    | Closes the context menu without selecting an item. |

## Issue Card Shortcuts

Each issue card in the results list supports keyboard interaction.

| Shortcut | Action          | Description                                                               |
| -------- | --------------- | ------------------------------------------------------------------------- |
| `Tab`    | Focus card      | Moves focus to the issue card or its interactive elements.                |
| `Enter`  | View issue      | Opens the issue on GitHub in a new tab when the "View" button is focused. |
| `Space`  | Activate action | Activates any focused button on the issue card.                           |

## Accessibility Features

### Focus Indicators

All interactive elements display visible focus indicators when navigated to via keyboard. These indicators:

- Use a consistent teal/cyan color scheme
- Provide sufficient contrast for visibility
- Help users track their current position

### Screen Reader Support

IssueVista includes ARIA labels and roles to support screen reader users:

- All buttons have descriptive aria-labels
- Modal dialogs have proper aria-modal and aria-labelledby attributes
- Live regions announce dynamic content changes
- Images include alt text descriptions

### Reduced Motion

Users who prefer reduced motion will experience:

- Minimal animations
- Instant transitions where possible
- Respect for prefers-reduced-motion media query

## Browser Shortcuts

Standard browser shortcuts also work within IssueVista:

| Shortcut            | Action       | Description                                          |
| ------------------- | ------------ | ---------------------------------------------------- |
| `Ctrl + F`          | Find on page | Opens browser find dialog to search within the page. |
| `Ctrl + R`          | Refresh      | Reloads the page.                                    |
| `F5`                | Refresh      | Alternative way to reload the page.                  |
| `Ctrl + +`          | Zoom in      | Increases page zoom level.                           |
| `Ctrl + -`          | Zoom out     | Decreases page zoom level.                           |
| `Ctrl + 0`          | Reset zoom   | Resets page zoom to 100%.                            |
| `Ctrl + D`          | Bookmark     | Bookmarks the current page.                          |
| `Alt + Left Arrow`  | Go back      | Navigates to the previous page in history.           |
| `Alt + Right Arrow` | Go forward   | Navigates to the next page in history.               |

## Tips for Efficient Navigation

### General Tips

1. Use `Tab` to quickly move through the interface without using a mouse
2. Press `Esc` to quickly close any open popup, modal, or menu
3. Use `Enter` to activate buttons and submit forms
4. Arrow keys work within dropdowns, menus, and selectors

### Search Workflow

1. Focus the repository URL input (usually the first focusable element)
2. Type or paste a GitHub repository URL
3. Press `Enter` to immediately start searching
4. Use `Tab` to reach filter options if needed
5. Press `Tab` to navigate through results

### Filtering Results

1. Tab to the filter section
2. Use arrow keys to select filter types
3. Enter filter values and press `Enter` to apply
4. Use language chips to quickly filter by programming language
5. Press `Esc` to cancel any filter in progress

### Exporting Results

1. Tab to the export button
2. Press `Enter` or `Space` to open the export menu
3. Use `Arrow Down` and `Arrow Up` to select format
4. Press `Enter` to download in the selected format

## Troubleshooting

### Focus Not Visible

If you cannot see the focus indicator:

1. Check if your browser has custom focus styles
2. Ensure you are using a supported browser (Chrome, Firefox, Safari, Edge)
3. Try disabling browser extensions that might interfere

### Shortcuts Not Working

If keyboard shortcuts are not responding:

1. Ensure the correct element is focused
2. Check if a modal or popup is blocking interaction
3. Press `Esc` to close any overlays
4. Refresh the page if issues persist

### Screen Reader Issues

If you experience screen reader problems:

1. Ensure your screen reader is up to date
2. Try a different screen reader or browser combination
3. Report issues on the IssueVista GitHub repository

## Summary

IssueVista provides comprehensive keyboard support to ensure all users can efficiently navigate and use the application. Key points to remember:

- `Tab` and `Shift+Tab` for navigation
- `Enter` and `Space` for activation
- `Arrow` keys for menu and selector navigation
- `Esc` to close overlays and cancel operations

For additional help or to report accessibility issues, please visit our GitHub repository.
