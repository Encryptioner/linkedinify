/**
 * Event Emitter Utility
 * Modern implementation of the Observer pattern for inter-module communication
 */

export class EventEmitter {
  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
  }

  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event handler function
   * @param {Object} options - Options object
   * @returns {EventEmitter} This instance for chaining
   */
  on(event, listener, options = {}) {
    if (typeof event !== 'string') {
      throw new TypeError('Event name must be a string');
    }
    
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);
    
    // Check max listeners limit
    if (listeners.length >= this.maxListeners) {
      console.warn(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${listeners.length + 1} ${event} listeners added.`);
    }

    // Add listener with metadata
    listeners.push({
      listener,
      once: options.once || false,
      prepend: options.prepend || false,
      context: options.context || null,
    });

    // Sort by prepend flag
    if (options.prepend) {
      listeners.sort((a, b) => (b.prepend ? 1 : 0) - (a.prepend ? 1 : 0));
    }

    return this;
  }

  /**
   * Add a one-time event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event handler function
   * @param {Object} options - Options object
   * @returns {EventEmitter} This instance for chaining
   */
  once(event, listener, options = {}) {
    return this.on(event, listener, { ...options, once: true });
  }

  /**
   * Add a listener to the beginning of the listeners array
   * @param {string} event - Event name
   * @param {Function} listener - Event handler function
   * @param {Object} options - Options object
   * @returns {EventEmitter} This instance for chaining
   */
  prependListener(event, listener, options = {}) {
    return this.on(event, listener, { ...options, prepend: true });
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event handler function to remove
   * @returns {EventEmitter} This instance for chaining
   */
  off(event, listener) {
    if (!this.events.has(event)) {
      return this;
    }

    const listeners = this.events.get(event);
    const index = listeners.findIndex(l => l.listener === listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      
      // Clean up empty event arrays
      if (listeners.length === 0) {
        this.events.delete(event);
      }
    }

    return this;
  }

  /**
   * Remove all listeners for an event, or all listeners if no event specified
   * @param {string} [event] - Event name (optional)
   * @returns {EventEmitter} This instance for chaining
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * Emit an event with optional data
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to listeners
   * @returns {boolean} True if event had listeners, false otherwise
   */
  emit(event, ...args) {
    if (!this.events.has(event)) {
      return false;
    }

    const listeners = this.events.get(event).slice(); // Copy to avoid mutation during iteration
    
    for (const listenerObj of listeners) {
      try {
        // Call listener with appropriate context
        const context = listenerObj.context || this;
        listenerObj.listener.call(context, ...args);

        // Remove one-time listeners
        if (listenerObj.once) {
          this.off(event, listenerObj.listener);
        }
      } catch (error) {
        // Emit error event instead of throwing to prevent breaking other listeners
        console.error(`Error in event listener for '${event}':`, error);
        
        // Use setTimeout to emit error asynchronously to avoid infinite loops
        setTimeout(() => {
          this.emit('error', error, { event, args });
        }, 0);
      }
    }

    return true;
  }

  /**
   * Emit an event asynchronously
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to listeners
   * @returns {Promise<boolean>} Promise resolving to true if event had listeners
   */
  async emitAsync(event, ...args) {
    if (!this.events.has(event)) {
      return false;
    }

    const listeners = this.events.get(event).slice();
    
    for (const listenerObj of listeners) {
      try {
        const context = listenerObj.context || this;
        const result = listenerObj.listener.call(context, ...args);
        
        // Handle async listeners
        if (result instanceof Promise) {
          await result;
        }

        if (listenerObj.once) {
          this.off(event, listenerObj.listener);
        }
      } catch (error) {
        console.error(`Error in async event listener for '${event}':`, error);
        this.emit('error', error, { event, args });
      }
    }

    return true;
  }

  /**
   * Get the number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }

  /**
   * Get all listeners for an event
   * @param {string} event - Event name
   * @returns {Function[]} Array of listener functions
   */
  listeners(event) {
    if (!this.events.has(event)) {
      return [];
    }
    return this.events.get(event).map(l => l.listener);
  }

  /**
   * Get all event names that have listeners
   * @returns {string[]} Array of event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Set the maximum number of listeners per event
   * @param {number} n - Maximum number of listeners
   * @returns {EventEmitter} This instance for chaining
   */
  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
      throw new TypeError('n must be a non-negative number');
    }
    this.maxListeners = n;
    return this;
  }

  /**
   * Get the maximum number of listeners per event
   * @returns {number} Maximum number of listeners
   */
  getMaxListeners() {
    return this.maxListeners;
  }

  /**
   * Create a promise that resolves when an event is emitted
   * @param {string} event - Event name
   * @param {number} timeout - Optional timeout in milliseconds
   * @returns {Promise} Promise that resolves with event data
   */
  waitFor(event, timeout) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      
      const cleanup = () => {
        this.off(event, onEvent);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };

      const onEvent = (...args) => {
        cleanup();
        resolve(args.length === 1 ? args[0] : args);
      };

      this.once(event, onEvent);

      if (timeout) {
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error(`Timeout waiting for event: ${event}`));
        }, timeout);
      }
    });
  }
}