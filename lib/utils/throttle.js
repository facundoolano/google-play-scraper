const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Throttle is a first wrapper function that sets state variables for throttled requests.
 * **/
function Throttle () {
  // Setting State
  let startedAt = null;
  let timesCalled = 0;
  let inThrottle = false;

  /**
   * Second wrapper function sets the parameters for throttling (interval and limit number of requests by interval)
   * @param {function} fn function that will be used.
   * @param {object} opts parameters interval and limit.
   * @return decorator function for @param {function} fn
   */
  return function settingOptions (fn, opts) {
    const ms = opts.interval;
    const number = opts.limit;

    /**
     * Decorator for parent settingOption @function.
     * Function is basically if else statement, that checks if the function could be executed right now or need to wait until the end of a delay.
     * For the condition, it uses interval and limit options and compares them to the state variables.
     * @return result of the executed function from parent settingOption @function
     */
    return async function returnedFunction (...args) {
      // Set Date Variable if it's Empty
      if (!startedAt) startedAt = Date.now();

      if (timesCalled < number && Date.now() - startedAt < ms) {
        // Execute Parent Function
        timesCalled++;
        const result = await fn(...args);
        return result;
      }

      if (!inThrottle) {
        inThrottle = true;
        await sleep(ms);
        // Reset Conditions After Delay
        timesCalled = 0;
        startedAt = Date.now();
        // Return Called Function
        const result = await returnedFunction(...args);
        inThrottle = false;
        return result;
      }

      // Wait Until Delay Ends
      const checkingPromise = new Promise(resolve => {
        const interval = setInterval(async () => {
          if (!inThrottle) {
            clearInterval(interval);
            const result = await returnedFunction(...args);
            // Resolve Executed Function
            return resolve(result);
          }
        }, 1);
      });
      const result = await checkingPromise;
      return result;
    };
  };
}

const throttledRequest = Throttle();
export default throttledRequest;
