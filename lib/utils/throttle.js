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
    return async function returnedFunction (...args) {
      // Set Date Variable if it's Empty
      if (!startedAt) startedAt = Date.now();

      if (timesCalled < opts.limit && Date.now() - startedAt < opts.interval) {
        // Execute Parent Function
        timesCalled++;
        return await fn(...args);
      }

      if (!inThrottle) {
        inThrottle = true;
        await sleep(opts.interval);
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
      return await checkingPromise;
    };
  };
}

const throttledRequest = Throttle();
export default throttledRequest;
