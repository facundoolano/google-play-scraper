const sleep = require('./sleep.js');

function Throttle () {
  // Setting State
  let startedAt = null;
  let timesCalled = 0;
  let inThrottle = false;

  return function settingOptions (fn, opts) {
    const ms = opts.interval;
    const number = opts.limit;

    return async function returnedFunction (...args) {
      if (!startedAt) startedAt = Date.now();

      if (timesCalled < number && Date.now() - startedAt < ms) {
        // Call Request
        timesCalled++;
        const result = await fn(...args);
        return result;
      } else {
        if (!inThrottle) {
          inThrottle = true;
          await sleep(ms);
          // Reset Conditions After Throttling
          timesCalled = 0;
          startedAt = Date.now();
          // Return Called Function
          const result = await returnedFunction(...args);
          inThrottle = false;
          return result;
        } else {
          // Wait Until Throttling ends
          const checkingPromise = new Promise(resolve => {
            const interval = setInterval(async () => {
              if (!inThrottle) {
                clearInterval(interval);
                const result = await returnedFunction(...args);
                return resolve(result);
              }
            }, 1);
          });
          const result = await checkingPromise;
          return result;
        }
      }
    };
  };
}

const throttledRequest = Throttle();
module.exports = throttledRequest;
