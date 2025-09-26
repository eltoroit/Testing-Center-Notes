/**
 * DOM Utility Functions
 * Centralized DOM manipulation and querying utilities
 */

import { APP_CONFIG } from "./constants.js";

/**
 * Get element by ID with error handling
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} - Element or null if not found
 */
export function getElementById(id) {
	const element = document.getElementById(id);
	if (!element) {
		console.warn(`Element with ID "${id}" not found`);
	}
	return element;
}

/**
 * Get element by selector with error handling
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (optional)
 * @returns {HTMLElement|null} - Element or null if not found
 */
export function querySelector(selector, parent = document) {
	const element = parent.querySelector(selector);
	if (!element) {
		console.warn(`Element with selector "${selector}" not found`);
	}
	return element;
}

/**
 * Get all elements by selector
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (optional)
 * @returns {NodeList} - NodeList of elements
 */
export function querySelectorAll(selector, parent = document) {
	return parent.querySelectorAll(selector);
}

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|HTMLElement} content - Element content
 * @returns {HTMLElement} - Created element
 */
export function createElement(tag, attributes = {}, content = "") {
	const element = document.createElement(tag);

	// Set attributes
	Object.entries(attributes).forEach(([key, value]) => {
		if (key === "className") {
			element.className = value;
		} else if (key === "innerHTML") {
			element.innerHTML = value;
		} else if (key === "textContent") {
			element.textContent = value;
		} else if (key === "dataset") {
			// Handle dataset properties
			Object.entries(value).forEach(([dataKey, dataValue]) => {
				element.dataset[dataKey] = dataValue;
			});
		} else {
			element.setAttribute(key, value);
		}
	});

	// Set content
	if (content) {
		if (typeof content === "string") {
			element.innerHTML = content;
		} else if (content instanceof HTMLElement) {
			element.appendChild(content);
		}
	}

	return element;
}

/**
 * Add event listener with error handling
 * @param {HTMLElement} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
export function addEventListener(element, event, handler, options = {}) {
	if (!element) {
		console.warn("Cannot add event listener to null element");
		return;
	}

	element.addEventListener(event, handler, options);
}

/**
 * Remove event listener
 * @param {HTMLElement} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 */
export function removeEventListener(element, event, handler) {
	if (!element) return;
	element.removeEventListener(event, handler);
}

/**
 * Toggle CSS class on element
 * @param {HTMLElement} element - Target element
 * @param {string} className - CSS class name
 * @param {boolean} force - Force add/remove (optional)
 */
export function toggleClass(element, className, force) {
	if (!element) return;
	element.classList.toggle(className, force);
}

/**
 * Add CSS class to element
 * @param {HTMLElement} element - Target element
 * @param {string} className - CSS class name
 */
export function addClass(element, className) {
	if (!element) return;
	element.classList.add(className);
}

/**
 * Remove CSS class from element
 * @param {HTMLElement} element - Target element
 * @param {string} className - CSS class name
 */
export function removeClass(element, className) {
	if (!element) return;
	element.classList.remove(className);
}

/**
 * Check if element has CSS class
 * @param {HTMLElement} element - Target element
 * @param {string} className - CSS class name
 * @returns {boolean} - True if element has class
 */
export function hasClass(element, className) {
	if (!element) return false;
	return element.classList.contains(className);
}

/**
 * Set element style
 * @param {HTMLElement} element - Target element
 * @param {string} property - CSS property
 * @param {string} value - CSS value
 */
export function setStyle(element, property, value) {
	if (!element) return;
	element.style[property] = value;
}

/**
 * Set element display style
 * @param {HTMLElement} element - Target element
 * @param {string} display - Display value ('block', 'none', 'flex', etc.)
 */
export function setDisplay(element, display) {
	if (!element) return;
	element.style.display = display;
}

/**
 * Show element (display: block)
 * @param {HTMLElement} element - Target element
 */
export function show(element) {
	setDisplay(element, "block");
}

/**
 * Hide element (display: none)
 * @param {HTMLElement} element - Target element
 */
export function hide(element) {
	setDisplay(element, "none");
}

/**
 * Set element text content
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text content
 */
export function setTextContent(element, text) {
	if (!element) return;
	element.textContent = text;
}

/**
 * Set element inner HTML
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content
 */
export function setInnerHTML(element, html) {
	if (!element) return;
	element.innerHTML = html;
}

/**
 * Get element value
 * @param {HTMLElement} element - Target element
 * @returns {string} - Element value
 */
export function getValue(element) {
	if (!element) return "";
	return element.value || "";
}

/**
 * Set element value
 * @param {HTMLElement} element - Target element
 * @param {string} value - Value to set
 */
export function setValue(element, value) {
	if (!element) return;
	element.value = value;
}

/**
 * Clear element content
 * @param {HTMLElement} element - Target element
 */
export function clearContent(element) {
	if (!element) return;
	element.innerHTML = "";
}

/**
 * Append child to parent
 * @param {HTMLElement} parent - Parent element
 * @param {HTMLElement} child - Child element
 */
export function appendChild(parent, child) {
	if (!parent || !child) return;
	parent.appendChild(child);
}

/**
 * Remove child from parent
 * @param {HTMLElement} parent - Parent element
 * @param {HTMLElement} child - Child element
 */
export function removeChild(parent, child) {
	if (!parent || !child) return;
	parent.removeChild(child);
}

/**
 * Remove element from DOM
 * @param {HTMLElement} element - Element to remove
 */
export function removeElement(element) {
	if (!element || !element.parentNode) return;
	element.parentNode.removeChild(element);
}

/**
 * Clone element
 * @param {HTMLElement} element - Element to clone
 * @param {boolean} deep - Deep clone (default: true)
 * @returns {HTMLElement} - Cloned element
 */
export function cloneElement(element, deep = true) {
	if (!element) return null;
	return element.cloneNode(deep);
}

/**
 * Get element dataset
 * @param {HTMLElement} element - Target element
 * @param {string} key - Dataset key
 * @returns {string} - Dataset value
 */
export function getDataset(element, key) {
	if (!element) return "";
	return element.dataset[key] || "";
}

/**
 * Set element dataset
 * @param {HTMLElement} element - Target element
 * @param {string} key - Dataset key
 * @param {string} value - Dataset value
 */
export function setDataset(element, key, value) {
	if (!element) return;
	element.dataset[key] = value;
}

/**
 * Focus element
 * @param {HTMLElement} element - Target element
 */
export function focus(element) {
	if (!element) return;
	element.focus();
}

/**
 * Scroll element into view
 * @param {HTMLElement} element - Target element
 * @param {Object} options - Scroll options
 */
export function scrollIntoView(element, options = {}) {
	if (!element) return;
	element.scrollIntoView(options);
}

/**
 * Get element bounding rectangle
 * @param {HTMLElement} element - Target element
 * @returns {DOMRect} - Bounding rectangle
 */
export function getBoundingRect(element) {
	if (!element) return null;
	return element.getBoundingClientRect();
}

/**
 * Check if element is visible
 * @param {HTMLElement} element - Target element
 * @returns {boolean} - True if element is visible
 */
export function isVisible(element) {
	if (!element) return false;
	const rect = getBoundingRect(element);
	return rect && rect.width > 0 && rect.height > 0;
}

/**
 * Wait for element to be available
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<HTMLElement>} - Promise that resolves with element
 */
export function waitForElement(selector, timeout = 5000) {
	return new Promise((resolve, reject) => {
		const element = querySelector(selector);
		if (element) {
			resolve(element);
			return;
		}

		const observer = new MutationObserver((mutations, obs) => {
			const element = querySelector(selector);
			if (element) {
				obs.disconnect();
				resolve(element);
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		setTimeout(() => {
			observer.disconnect();
			reject(
				new Error(`Element "${selector}" not found within ${timeout}ms`)
			);
		}, timeout);
	});
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, delay) {
	let timeoutId;
	return function (...args) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func.apply(this, args), delay);
	};
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, delay) {
	let lastCall = 0;
	return function (...args) {
		const now = Date.now();
		if (now - lastCall >= delay) {
			lastCall = now;
			return func.apply(this, args);
		}
	};
}
