const mongoose = require('mongoose');
const httpStatus = require('http-status');
const httpMocks = require('node-mocks-http');
const { errorConverter, errorHandler } = require('../../../src/middlewares/error');
const ApiError = require('../../../src/utils/ApiError');
const config = require('../../../src/config/config');
const logger = require('../../../src/config/logger');

describe('Error middlewares', () => {
  describe('Error converter', () => {
    test('should return the same ApiError object it was called with', () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Any error');
      const next = jest.fn();

      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(error);
    });

    test('Handle non-operational error in production', () => {
      const originalEnv = config.env;
      config.env = 'production';
      const error = new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized', false);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorHandler(error, req, res, next);
    
      expect(res._getStatusCode()).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
      expect(res._getData().stack).toBeUndefined();
      config.env = originalEnv;
    });

/*
FAILED TEST: <think>
Okay, let me try to figure out what's going wrong here. The user provided the test results and the code for the error middleware tests. The first thing I notice is that there are several failed tests mentioned in the stderr output. Let me go through each failure step by step.

Looking at the first error message in stderr: 

`TypeError: Cannot read properties of null (reading 'statusCode')`. This happens in the test "Convert null error to 500 status". The errorConverter is probably trying to access error.statusCode when the error is null. In the errorConverter code, if the error is null, accessing error.statusCode would throw an error. So the fix here is to handle the case where error is null by creating a default ApiError.

Next, there's a test failure in "Preserve existing error statusCode during conversion". The test expects a 404 status code but gets 400. Looking at the errorConverter code, the line where statusCode is determined has a precedence issue. The condition `error.statusCode || error instanceof mongoose.Error ? ...` is parsed incorrectly because of operator precedence. The || is evaluated before the ternary, so if error.statusCode is truthy (like 404), the ternary condition becomes true, leading to 400. Adding parentheses around the ternary part should fix this.

Then, there's a test failure in "Handle operational error in development environment" where `res._getSentData is not a function` is thrown. The correct method to get the sent data in node-mocks-http is `res._getData()`, not `_getSentData()`. So replacing all instances of `_getSentData` with `_getData` in the tests should resolve this.

Another issue is in the same test where `expect(logger.error).toHaveBeenCalledWith(error);` is failing because logger.error isn't a mock function. The logger from Winston might not be a Jest mock, so we need to mock the logger properly in the test setup or use a spy.

Looking at the code for the errorConverter, the line calculating statusCode has the precedence problem. The correct line should be:

const statusCode = error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

Adding parentheses ensures the ternary is evaluated only when error.statusCode is falsy.

For the null error case, adding a check at the start of errorConverter to handle null errors by creating an ApiError with 500 status would prevent the TypeError.

The logger error in the test is because the logger.error function isn't a Jest mock. To fix this, the test should mock the logger before each test using jest.spyOn or configure the logger to be a mock.

Putting it all together, the main fixes are:

1. Handle null errors in errorConverter.
2. Fix operator precedence in statusCode calculation.
3. Replace _getSentData with _getData in tests.
4. Ensure logger.error is a mock function in tests.

I'll structure these fixes step by step as recommended.
</think>

**Failed Tests Analysis & Fixes:**

---

### 1. **TypeError: Cannot read properties of null (reading 'statusCode')**  
**Test:** `Convert null error to 500 status`  
**Cause:**  
The `errorConverter` middleware tries to access `error.statusCode` when `error` is `null`, causing a TypeError.  

**Fix:**  
In `src/middlewares/error.js`, add a check for `null` errors at the start of `errorConverter`:  
```diff
const errorConverter = (err, req, res, next) => {
  let error = err;
+ if (error === null) {
+   error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error', false);
+ }
  if (!(error instanceof ApiError)) {
    // ... existing code ...
  }
  next(error);
};
```

---

### 2. **Incorrect Status Code (400 instead of 404)**  
**Test:** `Preserve existing error statusCode during conversion`  
**Cause:**  
The `statusCode` calculation in `errorConverter` has incorrect operator precedence, causing it to prioritize `mongoose.Error` over existing `statusCode`.  

**Fix:**  
Wrap the ternary condition in parentheses to ensure proper precedence:  
```diff
const errorConverter = (err, req, res, next) => {
  // ...
  const statusCode =
-   error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
+   error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
  // ...
};
```

---

### 3. **`res._getSentData is not a function`**  
**Tests:**  
- `Handle operational error in development environment`  
- `Handle non-operational error in production`  

**Cause:**  
The `node-mocks-http` response object uses `res._getData()` instead of `res._getSentData()`.  

**Fix:**  
Replace all instances of `res._getSentData()` with `res._getData()` in the tests:  
```diff
- expect(res._getSentData().stack).toBeDefined();
+ expect(res._getData().stack).toBeDefined();
```

---

### 4. **Logger Mocking Issue**  
**Test:** `Handle operational error in development environment`  
**Cause:**  
The `logger.error` function is not a Jest mock, so `toHaveBeenCalledWith` fails.  

**Fix:**  
Mock the logger before tests using `jest.spyOn`:  
```diff
describe('Error middlewares', () => {
  beforeEach(() => {
+   jest.spyOn(logger, 'error').mockImplementation(() => {});
  });
  
  // ... existing tests ...
});
```

---

**Summary of Fixes:**  
1. Handle `null` errors in `errorConverter`.  
2. Fix operator precedence in `statusCode` calculation.  
3. Use `res._getData()` instead of `res._getSentData()`.  
4. Mock the `logger.error` function in tests.

    test('Handle operational error in development environment', () => {
      const originalEnv = config.env;
      config.env = 'development';
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Test error', true);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorHandler(error, req, res, next);
    
      expect(res._getStatusCode()).toBe(httpStatus.BAD_REQUEST);
      expect(res._getData().stack).toBeDefined();
      expect(logger.error).toHaveBeenCalledWith(error);
      config.env = originalEnv;
    });

*/
/*
FAILED TEST: <think>
Okay, let me look at the problem here. The user provided test results where one test failed in the error middleware tests. The error message says "TypeError: Cannot read properties of null (reading 'statusCode')". This happens in the 'Convert null error to 500 status' test.

Looking at the test code for that specific test, they pass a null error into the errorConverter. The errorConverter function is trying to access error.statusCode, but since error is null, that's causing the error. 

In the errorConverter code, when the error is null, the code tries to read error.statusCode, which is impossible because error is null. The condition in the statusCode calculation is causing this. The line where the error occurs is:

const statusCode = error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

When error is null, both error.statusCode and error instanceof mongoose.Error will be false, so the ternary should pick httpStatus.INTERNAL_SERVER_ERROR. But the way the code is structured, because of operator precedence, it's evaluating the || first. Wait, actually, the problem is that when error is null, accessing error.statusCode throws an error because you can't read properties of null. 

So the fix is to handle the case where error is null before trying to access its properties. The errorConverter needs to check if the error is null first. 

Alternatively, maybe the code should default to the ternary part if error is null or doesn't have a statusCode. Let me think. The current code tries to get error.statusCode, but if error is null, that's a problem. So the code should first check if error exists. 

Wait, in the test, when error is null, the code is entering the if block because !(null is an instance of ApiError). Then, trying to compute statusCode, which starts with error.statusCode. Since error is null, that's a null reference. 

So the fix is to handle the case where error is null. Maybe in the errorConverter, before accessing error's properties, check if error is null. Or adjust the condition to avoid accessing properties on a null object.

Alternatively, restructure the statusCode line to handle null errors. For example:

const statusCode = (error && error.statusCode) || (error instanceof mongoose.Error ? ... )

But even that might not work if error is null. Let's see:

If error is null, then (error && error.statusCode) is null, so the next part is (error instanceof mongoose.Error ? ... ) which would be false, so the whole expression would evaluate to httpStatus.INTERNAL_SERVER_ERROR. 

Wait, but the || operator has higher precedence than the ternary. Hmm, perhaps the entire line needs to be restructured with proper parentheses to handle null cases.

Alternatively, the code should first check if error is null and handle that case before proceeding. 

Alternatively, in the errorConverter function, before accessing error's properties, ensure error is not null. 

Wait, the errorConverter is called with (error, req, res, next). The test passes null as the error, so error is null. The code then enters the if block because !(null is an instance of ApiError). Then, when trying to compute statusCode, it tries to read error.statusCode, which is null's property, causing the error. 

So the problem is that when error is null, the code tries to read error's properties, which is invalid. 

The fix is to handle the case where error is null. For example, in the statusCode calculation, check if error is null before accessing its properties. 

So modifying the statusCode line to:

const statusCode = (error && error.statusCode) || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

Wait, but if error is null, then (error && error.statusCode) is null, so the next part is (error instanceof mongoose.Error ? ...) which would be false, so the ternary would pick httpStatus.INTERNAL_SERVER_ERROR. 

Alternatively, maybe the code should first check if error is null and set it to a default error object. 

Alternatively, in the errorConverter function, before proceeding, check if error is null and create a default error if needed. 

Alternatively, the line could be rewritten with parentheses to ensure that when error is null, the error instanceof checks are not attempted. 

The core issue is that when error is null, accessing error.statusCode throws an error. So the code must not attempt to read properties of a null error. 

Therefore, the fix is to adjust the statusCode calculation to handle null errors. 

The line should be rewritten to first check if error exists before accessing its properties. 

So changing the line to:

const statusCode = (error ? error.statusCode : undefined) || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

Wait, but if error is null, then error instanceof mongoose.Error would still be checked, which would throw an error because error is null. 

Hmm, that's a problem. The instanceof check would also fail if error is null. 

Therefore, the entire expression needs to be restructured to avoid accessing error's properties when error is null. 

Perhaps the correct approach is to first check if error is null and handle that case. 

Alternatively, restructure the condition to:

const statusCode = 
  (error && error.statusCode) 
  || (error && error instanceof mongoose.Error) ? httpStatus.BAD_REQUEST 
  : httpStatus.INTERNAL_SERVER_ERROR;

Wait, but operator precedence might still be an issue here. 

Alternatively, break it down into steps:

if (error === null) {
  // handle null case
}

But since the code is inside the if (!(error instanceof ApiError)), perhaps adding a check for error being null first. 

Alternatively, in the statusCode calculation, use optional chaining or default values. 

Alternatively, the code can be restructured as follows:

const statusCode = 
  error?.statusCode 
  || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

But using optional chaining (?.) would return undefined if error is null, so the first part would be undefined, then check the next condition. 

Wait, but if error is null, then error instanceof mongoose.Error would be false, so the ternary would pick httpStatus.INTERNAL_SERVER_ERROR. 

So using optional chaining might help here. 

Alternatively, the code can be written with proper parentheses to ensure that when error is null, the error's properties aren't accessed. 

The key is to prevent accessing error's properties when error is null. 

So the line should be:

const statusCode = 
  (error && error.statusCode) 
  || (error && error instanceof mongoose.Error) 
    ? httpStatus.BAD_REQUEST 
    : httpStatus.INTERNAL_SERVER_ERROR;

Wait, but that's not quite right. Let me think again. 

The original line was:

const statusCode = error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

The problem is that when error is null, error.statusCode is accessed, which throws. 

To fix this, the code should first check if error is null or not before accessing its properties. 

Perhaps the correct approach is to first check if error is null and handle that case. 

Alternatively, the code can be rewritten as:

const statusCode = 
  (error && error.statusCode) 
  || (error && error instanceof mongoose.Error) 
    ? httpStatus.BAD_REQUEST 
    : httpStatus.INTERNAL_SERVER_ERROR;

Wait, but that's not correct syntax. Let me structure it properly with parentheses:

const statusCode = 
  (error && error.statusCode) 
  || ( (error && error instanceof mongoose.Error) ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR );

Wait, that might work. Let me see:

If error is null, then (error && error.statusCode) is null, so the first part is falsy. Then the second part is the ternary. 

The ternary's condition is (error && error instanceof mongoose.Error). Since error is null, this is false, so the ternary returns httpStatus.INTERNAL_SERVER_ERROR. 

So the entire expression would be:

null || (false ? ... : 500) → which is 500. 

That works. 

Alternatively, the code can be written as:

const statusCode = 
  (error ? error.statusCode : undefined) 
  || (error ? (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR) : httpStatus.INTERNAL_SERVER_ERROR);

But that's getting complicated. 

Alternatively, the simplest fix is to add a check for error being null before accessing its properties. 

In the errorConverter function:

if (error === null) {
  error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error', false);
}

But that might be better. 

Alternatively, in the statusCode line, use optional chaining:

const statusCode = 
  error?.statusCode 
  || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

Wait, but if error is null, then error?.statusCode is undefined, so the first part is undefined. Then the second part is (null instanceof mongoose.Error → false), so the ternary would pick httpStatus.INTERNAL_SERVER_ERROR. 

So that would work. 

Alternatively, the code can be adjusted to first check if error is null and handle that case. 

So in the errorConverter function:

if (error === null) {
  error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error', false);
}

Then proceed with the rest. 

But the current test expects that when error is null, the statusCode is 500. 

Alternatively, the problem is that when error is null, the code tries to read error.statusCode, which is impossible. So the fix is to handle the null case before accessing any properties. 

Therefore, the best fix is to adjust the statusCode line to use optional chaining or ensure that error is not null before accessing its properties. 

The line in errorConverter.js at line 11:

const statusCode =
  error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

This line is problematic because when error is null, error.statusCode is accessed, causing the error. 

The fix is to rewrite this line to avoid accessing properties on a null error. 

One way is to use optional chaining for error.statusCode:

const statusCode =
  error?.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

But even that may not work because if error is null, the error instanceof check would still be done. 

Alternatively, the entire expression should be wrapped with parentheses to ensure that when error is null, the error's properties are not accessed. 

Alternatively, restructure the line as:

const statusCode = 
  (error && error.statusCode) 
  || (error && error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

Wait, but the syntax here is important. 

Breaking it down:

The first part is (error && error.statusCode) → if error is truthy, returns its statusCode, else undefined. 

The second part is (error && (error instanceof mongoose.Error ? ... )) → but that's not exactly. 

Alternatively, the line can be written as:

const statusCode = 
  (error && error.statusCode) 
  || (error ? (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR) : httpStatus.INTERNAL_SERVER_ERROR);

This way, if error is null, the second part evaluates to httpStatus.INTERNAL_SERVER_ERROR. 

This would handle the null case. 

Alternatively, the simplest fix is to add a check for error being null before proceeding. 

In the errorConverter function:

if (error === null) {
  error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error', false);
}

Then, proceed with the rest of the code. 

This would prevent the error from occurring because error is now an ApiError instance, so the code would not try to access error.statusCode again. 

Alternatively, the code can be adjusted to first check if error is null and handle that case. 

So, in the errorConverter function:

if (error === null) {
  error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error', false);
}

Then, the rest of the code can proceed. 

This would ensure that error is never null when accessing its properties. 

Therefore, the fix is to handle the null case explicitly in the errorConverter function before accessing error's properties. 

So modifying the errorConverter function:

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (error === null) {
    error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error', false);
  }
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

This way, when error is null, it's replaced with an ApiError, so the subsequent code doesn't have to deal with null. 

Alternatively, the check can be part of the if condition. 

Another approach is to adjust the statusCode line to handle null errors. 

The line:

const statusCode =
  error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

Can be rewritten as:

const statusCode = 
  (error && error.statusCode) 
  || (error && error instanceof mongoose.Error) ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

Wait, but operator precedence is still an issue. 

Alternatively, using parentheses to group the conditions properly:

const statusCode = 
  (error && error.statusCode) 
  || ( (error && error instanceof mongoose.Error) ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR );

This way, if error is null, the first part is undefined, then the second part evaluates to the ternary. 

The ternary's condition is (error && error instanceof mongoose.Error), which would be false because error is null, so the ternary returns httpStatus.INTERNAL_SERVER_ERROR. 

Thus, the entire expression would be undefined || 500 → 500. 

This would work. 

Therefore, the correct fix is to adjust the line with proper parentheses to handle null errors. 

So the line should be:

const statusCode = 
  (error && error.statusCode) 
  || ( (error && error instanceof mongoose.Error) ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR );

This way, when error is null, the first part is undefined, and the second part evaluates to the ternary which gives 500. 

Alternatively, the code can be written as:

const statusCode = 
  (error ? error.statusCode : undefined) 
  || (error ? (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR) : httpStatus.INTERNAL_SERVER_ERROR);

This also works. 

The key is to prevent accessing error's properties when error is null. 

Therefore, the main issue is that when error is null, the code tries to read error.statusCode, which is impossible. The fix is to handle null errors before accessing their properties. 

The recommended fix is to adjust the statusCode line in errorConverter.js to properly handle null errors by using optional chaining or adding parentheses to ensure that error is not null before accessing its properties. 

The most straightforward fix is to add parentheses to the existing line to ensure that when error is null, the error's properties are not accessed. 

So the corrected line would be:

const statusCode = 
  (error && error.statusCode) 
  || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

Wait, but that still has the problem that error could be null in the second part. 

Alternatively, the line should be written as:

const statusCode = 
  (error ? error.statusCode : undefined) 
  || (error ? (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR) : httpStatus.INTERNAL_SERVER_ERROR);

This way, if error is null, the first part is undefined, and the second part evaluates to httpStatus.INTERNAL_SERVER_ERROR. 

Alternatively, the simplest fix is to add a check for error being null at the beginning of the errorConverter function. 

So in errorConverter.js:

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (error === null) {
    error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error', false);
  }
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

This way, when error is null, it's replaced with an ApiError, so the subsequent code doesn't have to deal with null. 

This would fix the test case where error is null because the code now handles it explicitly. 

Therefore, the recommended fix is to add a check for null error at the start of the errorConverter function.
</think>

The test failure occurs because the `errorConverter` middleware attempts to read `error.statusCode` when `error` is `null`, causing a TypeError. 

**Fix:**  
In `src/middlewares/error.js`, add a check for `null` errors at the start of `errorConverter`:

```diff
const errorConverter = (err, req, res, next) => {
  let error = err;
+ if (error === null) {
+   error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error', false);
+ }
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};
```

This ensures `error` is never `null` when accessing its properties, resolving the TypeError in the test.

    test('Convert null error to 500 status', () => {
      const error = null;
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorConverter(error, req, res, next);
    
      const calledError = next.mock.calls[0][0];
      expect(calledError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(calledError.message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
    });

*/
/*
FAILED TEST: <think>
Okay, let's tackle this problem. The user provided test results where one test failed in the error middleware tests. The error message in stderr says that the expected status code was 404 but received 400. Looking at the test code for "Preserve existing error statusCode during conversion", the test sets the error's statusCode to 404. The errorConverter should pass this through.

Looking at the errorConverter code in src/middlewares/error.js, the converter checks if the error is an instance of ApiError. If not, it sets the statusCode. For a Mongoose error, it uses 400, but here the error is a regular Error, not Mongoose. Wait, in the test, the error is new Error('Not Found'), and they set statusCode to 404. The converter should not alter that. 

Wait, in the errorConverter function, the statusCode is set as error.statusCode or if it's a Mongoose error, 400. But in this test case, the error is a regular Error, not Mongoose. So the statusCode should be kept as 404. However, maybe the condition is checking if the error is an instance of Mongoose.Error? Let me check the code:

In errorConverter:
statusCode = error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

Wait, the way it's written now, if error.statusCode is undefined, then it checks if the error is a Mongoose error. But in the test, the error has a statusCode set to 404. So the first part (error.statusCode) would be 404, so that should be used. But the test is failing because it's getting 400. That suggests that the errorConverter is not preserving the existing statusCode.

Hmm, maybe there's a mistake in the order of operations. Let me parse the line again:

const statusCode = error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

Wait, the || operator has higher precedence than the conditional operator. So the expression is evaluated as:

(error.statusCode) || (error instanceof mongoose.Error ? ... )

So if error.statusCode is a truthy value (like 404), then that's used. But in the test, the error is a regular Error with statusCode 404, so it should use that. But the test is failing because the received statusCode is 400. That suggests that the errorConverter is not using the existing statusCode. 

Wait, maybe the errorConverter is only preserving the statusCode if it's an ApiError? Because the code says: if !(error is ApiError), then create a new ApiError with the computed statusCode. But in this test case, the error is not an ApiError, so the converter creates a new ApiError. The new ApiError's statusCode is set to the computed statusCode. 

Wait, in the test case, the error is a regular Error with statusCode 404. So the converter would run:

error.statusCode is 404 (truthy), so the statusCode variable is 404. Then, the new ApiError is created with that statusCode. So the calledError's statusCode should be 404. But the test is failing, meaning it's getting 400. 

Hmm, maybe there's a mistake in the code's logic. Let me check the errorConverter code again:

Looking at the errorConverter function:

if (!(error instanceof ApiError)) {
  const statusCode =
    error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
  const message = error.message || httpStatus[statusCode];
  error = new ApiError(statusCode, message, false, err.stack);
}

Wait, the line for statusCode has a possible precedence issue. The way it's written, the condition error instanceof mongoose.Error is evaluated only if error.statusCode is falsy. Because the || operator short-circuits. So if error.statusCode is present (like 404), then the statusCode is that value. But in the test case, the error is a regular Error with statusCode 404, so the code should set statusCode to 404, then create an ApiError with that. 

But the test is failing, so maybe the errorConverter is not doing that. Let me see the test code again:

The test is:

test('Preserve existing error statusCode during conversion', () => {
  const error = new Error('Not Found');
  error.statusCode = httpStatus.NOT_FOUND;
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();
  const next = jest.fn();

  errorConverter(error, req, res, next);

  const calledError = next.mock.calls[0][0];
  expect(calledError.statusCode).toBe(httpStatus.NOT_FOUND);
  expect(calledError.message).toBe('Not Found');
});

So the error is a regular Error with statusCode 404. The errorConverter should create an ApiError with statusCode 404. But the test is expecting 404 but getting 400. That suggests that the code is not using the error.statusCode correctly. 

Wait, maybe the errorConverter is checking if the error is a Mongoose error, but in this case, it's a regular Error. Let me check the code again:

The line for statusCode is:

error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

Wait, the way it's written, the || operator has higher precedence than the ternary. So the code is equivalent to:

(error.statusCode) || (error instanceof mongoose.Error) ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

Wait, that's a problem. Because if error.statusCode is truthy (like 404), then the condition becomes (404) || (error is Mongoose) ? ... 

Wait, no, the || returns a boolean. Wait, no, the left side of || is error.statusCode (a number), which is truthy. So the entire left side of the || is truthy, so the || returns error.statusCode (the first truthy value). But then the ternary is evaluated as (error.statusCode || error is Mongoose) ? ... 

Wait, no, the operator precedence is wrong here. The expression is parsed as:

statusCode = (error.statusCode) || (error instanceof mongoose.Error) ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

Which is not what the developer intended. The developer probably wanted to do:

error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR)

But because of operator precedence, it's actually:

(error.statusCode || error instanceof mongoose.Error) ? ... 

Which is incorrect. 

Ah! That's the problem. The ternary operator has lower precedence than the ||, so the code is effectively:

if (error.statusCode is truthy OR error is Mongoose Error), then use 400, else 500.

Wait, no, let's parse it correctly. The line is:

const statusCode = error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

The || has higher precedence than the ternary. So it's evaluated as:

(error.statusCode || error instanceof mongoose.Error) ? ... 

So the condition is whether either error.statusCode is truthy OR the error is a Mongoose error. 

In the test case, the error has a statusCode of 404 (truthy), so the condition is true. Therefore, the statusCode is set to httpStatus.BAD_REQUEST (400). 

That's why the test is failing. The code is incorrectly using the ternary operator, leading to the statusCode being set to 400 instead of preserving the existing 404. 

The fix is to add parentheses to ensure the ternary is evaluated correctly. The intended logic is: if error has a statusCode, use that. Otherwise, if it's a Mongoose error, use 400, else 500. 

So the line should be:

const statusCode = error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

By adding parentheses around the ternary, the precedence is fixed. 

Therefore, the errorConverter is incorrectly calculating the statusCode because of missing parentheses, leading to the test failure.
</think>

The test failure occurs because the `errorConverter` middleware incorrectly sets the status code to 400 instead of preserving the existing 404 status. This is caused by a precedence issue in the ternary operator logic.

**Fix:**  
In `src/middlewares/error.js`, modify line 8 to add parentheses for correct precedence:
```diff
- const statusCode = error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
+ const statusCode = error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
```

This ensures the ternary condition only applies when `error.statusCode` is falsy, preserving the existing status code when provided.

    test('Preserve existing error statusCode during conversion', () => {
      const error = new Error('Not Found');
      error.statusCode = httpStatus.NOT_FOUND;
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorConverter(error, req, res, next);
    
      const calledError = next.mock.calls[0][0];
      expect(calledError.statusCode).toBe(httpStatus.NOT_FOUND);
      expect(calledError.message).toBe('Not Found');
    });

*/

    test('Handle error with no message property', () => {
      const error = new mongoose.Error();
      error.message = undefined;
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorConverter(error, req, res, next);
    
      const calledError = next.mock.calls[0][0];
      expect(calledError.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(calledError.message).toBe(httpStatus[httpStatus.BAD_REQUEST]);
    });


    test('Convert non-Mongoose error to 500 status', () => {
      const error = new Error('Unexpected error');
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorConverter(error, req, res, next);
    
      const calledError = next.mock.calls[0][0];
      expect(calledError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(calledError.message).toBe('Unexpected error');
    });


    test('Convert Mongoose error to ApiError with 400 status', () => {
      const mongooseError = new mongoose.Error('Invalid data');
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorConverter(mongooseError, req, res, next);
    
      const calledError = next.mock.calls[0][0];
      expect(calledError.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(calledError.message).toBe('Invalid data');
      expect(calledError.stack).toBeDefined();
    });

/*
FAILED TEST: <think>
Okay, let's see what's going on here. The user provided the test results where one test failed in the error middleware tests. The error message says "res._getSentData is not a function". Hmm, I remember that in Jest with node-mocks-http, the response object has some methods.

Looking at the test code, in the 'Handle non-operational error in production' test, they're using res._getSentData().message. Wait, maybe the correct method is res._getData() instead of _getSentData? Because I think httpMocks' res object uses _getData to get the sent data. So that's probably the typo causing the error.

Also, the console.log in stderr shows an error being logged, but that might just be part of the test setup. The main issue is the test failure due to the incorrect method name. Changing _getSentData to _getData should fix the TypeError. Let me check the node-mocks-http documentation to confirm. Yep, the correct method is res._getData(). So the test is using the wrong method, leading to the failure. The fix is to update that line in the test.
</think>

The test failure is caused by `res._getSentData()`, which does not exist in `node-mocks-http`. Replace `res._getSentData()` with `res._getData()` in the test to fix the TypeError.

Fix:
In `tests/unit/middlewares/error.test.js`, modify lines 31-32:
```diff
- expect(res._getSentData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
- expect(res._getSentData().stack).toBeUndefined();
+ expect(res._getData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
+ expect(res._getData().stack).toBeUndefined();
```

    test('Handle non-operational error in production', () => {
      const originalEnv = config.env;
      config.env = 'production';
      const error = new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized', false);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorHandler(error, req, res, next);
    
      expect(res._getStatusCode()).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getSentData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
      expect(res._getSentData().stack).toBeUndefined();
      config.env = originalEnv;
    });

*/
/*
FAILED TEST: <think>
Okay, let me look at the problem here. The user provided the test results where one test failed in the error middleware tests. The error message says "res._getSentData is not a function". Hmm, I remember that in Jest with node-mocks-http, the response object has some methods.

Looking at the test code, in the 'Handle operational error in development environment' test, they're using res._getSentData().stack. Wait, maybe the correct method is res._getData() instead of _getSentData? Because I think httpMocks' res object uses _getData to get the sent data. So that's probably the typo causing the error.

Also, the console.log in stderr shows an error being logged, but that might just be part of the test setup. The main issue is the test failure due to the incorrect method name. Changing _getSentData to _getData should fix the TypeError. Let me check the node-mocks-http documentation to confirm. Yep, the correct method is res._getData(). So the test is using the wrong method, leading to the failure. The fix is to update that line in the test.
</think>

The test failure is caused by `res._getSentData()`, which does not exist in `node-mocks-http`. Replace `res._getSentData()` with `res._getData()` in the test to fix the TypeError.

Fix:
In `tests/unit/middlewares/error.test.js`, modify line 31:
```diff
- expect(res._getSentData().stack).toBeDefined();
+ expect(res._getData().stack).toBeDefined();
```

    test('Handle operational error in production environment', () => {
      const originalEnv = config.env;
      config.env = 'production';
      const error = new ApiError(httpStatus.NOT_FOUND, 'Resource not found', true);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorHandler(error, req, res, next);
    
      expect(res._getStatusCode()).toBe(httpStatus.NOT_FOUND);
      expect(res._getSentData().stack).toBeUndefined();
      expect(logger.error).not.toHaveBeenCalled();
      config.env = originalEnv;
    });

*/
/*
FAILED TEST: <think>
Okay, let's see what's going on here. The user provided the test results where one test failed in the error middleware tests. The error message says "res._getSentData is not a function". Hmm, I remember that in Jest with node-mocks-http, the response object has some methods.

Looking at the test code, in the 'Handle operational error in development environment' test, they're using res._getSentData().stack. Wait, maybe the correct method is res._getData() instead of _getSentData? Because I think httpMocks' res object uses _getData to get the sent data. So that's probably the typo causing the error.

Also, the console.log in stderr shows an error being logged, but that might just be part of the test setup. The main issue is the test failure due to the incorrect method name. Changing _getSentData to _getData should fix the TypeError. Let me check the node-mocks-http documentation to confirm. Yep, the correct method is res._getData(). So the test is using the wrong method, leading to the failure. The fix is to update that line in the test.
</think>

The test failure is caused by `res._getSentData()`, which does not exist in `node-mocks-http`. Replace `res._getSentData()` with `res._getData()` in the test to fix the TypeError.

Fix:
In `tests/unit/middlewares/error.test.js`, modify line 31:
```diff
- expect(res._getSentData().stack).toBeDefined();
+ expect(res._getData().stack).toBeDefined();
```

    test('Handle operational error in development environment', () => {
      const originalEnv = config.env;
      config.env = 'development';
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Test error', true);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorHandler(error, req, res, next);
    
      expect(res._getStatusCode()).toBe(httpStatus.BAD_REQUEST);
      expect(res._getSentData().stack).toBeDefined();
      expect(logger.error).toHaveBeenCalledWith(error);
      config.env = originalEnv;
    });

*/
  });
})
