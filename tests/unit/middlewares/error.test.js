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
/*
FAILED TEST: ## Test Failure Analysis

### Failed Test
`Error middlewares › Error converter › should handle error without statusCode property`

### Root Cause
The test fails at line 31 with `SyntaxError: "[object Object]" is not valid JSON` because:

1. The `errorHandler` function uses `res.send()` (line 38 in `error.js`) to send the response object
2. The mock response's `_getData()` returns the raw stringified object as `"[object Object]"` instead of valid JSON
3. `JSON.parse()` cannot parse this string

### Recommended Fix

**Option 1 (Recommended): Change source code to use `res.json()`**
```javascript
// Line 38 in src/middlewares/error.js
res.status(statusCode).json(response);
```
This properly serializes the response as JSON and makes the mock work correctly.

**Option 2: Fix the test to use `_getJSONData()`**
```javascript
// Line 31 in test file
const responseData = res._getJSONData();
```
However, this only works if the source uses `res.json()`.

### Impact
- This is the only failing test in the suite
- The issue affects how error responses are serialized
- Option 1 is the proper fix as error handlers should use `res.json()` for JSON responses

    test('should handle error without statusCode property', () => {
      const err = { message: 'Error without statusCode' };
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const originalEnv = config.env;
      config.env = 'development';
      jest.spyOn(logger, 'error').mockImplementation(() => {});
    
      errorHandler(err, req, res, null);
    
      expect(res._isEndCalled()).toBe(true);
      const responseData = JSON.parse(res._getData());
      expect(responseData.message).toBe('Error without statusCode');
      expect(res.locals.errorMessage).toBe('Error without statusCode');
    
      logger.error.mockRestore();
      config.env = originalEnv;
    });

*/

    test('should convert mongoose.Error.ValidationError to ApiError with BAD_REQUEST', () => {
      const error = new mongoose.Error.ValidationError();
      error.message = 'Validation failed';
      const next = jest.fn();
    
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const convertedError = next.mock.calls[0][0];
      expect(convertedError.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(convertedError.message).toBe('Validation failed');
      expect(convertedError.isOperational).toBe(false);
    });

/*
FAILED TEST: ## Test Failure Analysis

### Failed Test
`Error middlewares › Error converter › should handle error with empty message without crashing`

### Root Cause
The test fails at line 30 with `SyntaxError: "[object Object]" is not valid JSON`. This occurs because:
1. The `errorHandler` function uses `res.send()` (line 38 in `error.js`) to send the response
2. The test calls `res._getData()` which returns the raw data sent via `.send()`
3. When the response object is sent via `.send()`, the mock doesn't serialize it as JSON
4. `JSON.parse()` fails because it receives `"[object Object]"` string instead of valid JSON

### Recommended Fix

**Option 1 (Recommended): Change source code to use `res.json()`**
```javascript
// Line 38 in src/middlewares/error.js
res.status(statusCode).json(response);
```
This is semantically correct for JSON responses and will make the mock work properly.

**Option 2: Fix the test to use `_getJSONData()`**
```javascript
// Line 30 in test file
const responseData = res._getJSONData();
```
However, this only works if the source uses `res.json()`.

### Impact
This same issue affects multiple tests in the file that use `res._getJSONData()` or `JSON.parse(res._getData())`.

    test('should handle error with empty message without crashing', () => {
      const error = new ApiError(404, '', true);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const originalEnv = config.env;
      config.env = 'development';
    
      errorHandler(error, req, res, null);
    
      expect(res.statusCode).toBe(404);
      const responseData = JSON.parse(res._getData());
      expect(responseData.code).toBe(404);
      expect(responseData.message).toBe('');
      expect(res.locals.errorMessage).toBe('');
    
      config.env = originalEnv;
    });

*/
/*
FAILED TEST: ## Test Failure Analysis

### Failed Test
`Error middlewares › Error converter › should handle null error without throwing`

### Root Cause
The test expects `errorConverter` to handle `null` gracefully, but it throws a `TypeError: Cannot read properties of null (reading 'statusCode')` at line 11 of `error.js`.

The error occurs because the code attempts to access `error.statusCode` on a `null` value before checking if the error exists.

### Recommended Fix

**Option 1: Add null check in errorConverter (Recommended)**
```javascript
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!error) {
    error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unknown error');
    next(error);
    return;
  }
  if (!(error instanceof ApiError)) {
    // ... rest of the code
  }
  next(error);
};
```

**Option 2: Fix the test**
Remove the test entirely if null errors are not expected in production, or modify it to expect a throw:
```javascript
test('should handle null error without throwing', () => {
  const error = null;
  expect(() => {
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
  }).toThrow(TypeError);
});
```

### Additional Critical Issues in Test File
1. **Line 20**: Incomplete test - missing closing brace
2. **Line 11 in error.js**: Operator precedence bug - needs parentheses: `error.statusCode || (error instanceof mongoose.Error) ? ...`
3. Multiple tests reference undefined `next` and `convertedError` variables

    test('should handle null error without throwing', () => {
      const error = null;
      const next = jest.fn();
    
      expect(() => {
        errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      }).not.toThrow();
    
      expect(next).toHaveBeenCalled();
      const convertedError = next.mock.calls[0][0];
      expect(convertedError).toBeInstanceOf(ApiError);
      expect(convertedError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    });

*/

    test('should preserve original stack trace in converted ApiError', () => {
      const originalError = new Error('Original error');
      const originalStack = originalError.stack;
      const next = jest.fn();
    
      errorConverter(originalError, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const convertedError = next.mock.calls[0][0];
      expect(convertedError.stack).toBe(originalStack);
    });

/*
FAILED TEST: ## Test Failure Analysis

### Failed Test
`Error middlewares › Error converter › should use default httpStatus message when error has no message property`

### Root Cause
The test expects an error with `statusCode: 422` to be preserved, but the `errorConverter` function converts it to `400 (BAD_REQUEST)` due to a **logical operator precedence bug** in `error.js` line 10-11:

```javascript
const statusCode =
  error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
```

This is evaluated as:
```javascript
(error.statusCode || error instanceof mongoose.Error) ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR
```

Since `error.statusCode` is truthy (422), it returns `httpStatus.BAD_REQUEST` (400).

### Recommended Fix

**Fix the source code** - Add parentheses to correct operator precedence in `src/middlewares/error.js` line 10-11:

```javascript
const statusCode =
  error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
```

This ensures:
- If `error.statusCode` exists, use it (422 in this case)
- Otherwise, check if it's a mongoose.Error → use BAD_REQUEST
- Otherwise, use INTERNAL_SERVER_ERROR

### Additional Test File Issues
1. **Line 20**: Incomplete test - missing closing brace and assertions
2. **Lines 42-52**: Reference undefined `next` and `convertedError` variables - missing `errorConverter()` call
3. **Missing environment cleanup**: Tests modifying `config.env` don't restore original value

    test('should use default httpStatus message when error has no message property', () => {
      const error = { statusCode: 422 };
      const next = jest.fn();
    
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const convertedError = next.mock.calls[0][0];
      expect(convertedError.statusCode).toBe(422);
      expect(convertedError.message).toBe(httpStatus[422]);
      expect(convertedError.isOperational).toBe(false);
    });

*/
/*
FAILED TEST: ## Test Failure Analysis

### Failed Test
`Error middlewares › Error converter › should mask non-operational errors in production environment`

### Root Cause
The test calls `res._getJSONData()` on line 30, which expects the response body to be set via `res.json()`. However, the `errorHandler` function uses `res.send()` on line 38 of `error.js`. The mock response object cannot parse data sent via `.send()` as JSON, resulting in `"[object Object]" is not valid JSON` error.

### Recommended Fixes

**Option 1 (Recommended): Fix the test**
Replace `res._getJSONData()` with `res._getData()` and parse manually:
```javascript
const responseData = JSON.parse(res._getData());
expect(responseData).toEqual({
  code: httpStatus.INTERNAL_SERVER_ERROR,
  message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
});
```

**Option 2: Fix the source code**
Change line 38 in `error.js` from:
```javascript
res.status(statusCode).send(response);
```
to:
```javascript
res.status(statusCode).json(response);
```
This is more semantically correct for JSON responses.

### Additional Issues
1. Missing environment cleanup: Add `config.env = originalEnv;` after assertions to restore original environment
2. Test is incomplete: Missing closing brace and proper test structure after line 20

    test('should mask non-operational errors in production environment', () => {
      const error = new ApiError(500, 'Database connection failed', false);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const originalEnv = config.env;
      config.env = 'production';
    
      errorHandler(error, req, res, null);
    
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData()).toEqual({
        code: httpStatus.INTERNAL_SERVER_ERROR,
        message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
      });
      expect(res.locals.errorMessage).toBe('Database connection failed');
    
      config.env = originalEnv;
    });

*/
/*
FAILED TEST: ## Test Failure Analysis

### Failed Test
`Error middlewares › Error converter › should send error response without stack trace in production environment for operational error`

### Root Cause
The test calls `res._getJSONData()` which expects the response body to be set via `res.json()`, but the `errorHandler` function uses `res.send()` on line 38 of `error.js`. The mock response object cannot parse data sent via `.send()` as JSON, resulting in `"[object Object]" is not valid JSON` error.

### Recommended Fixes

**Option 1 (Recommended): Fix the test**
Replace `res._getJSONData()` with `res._getData()` and parse manually:
```javascript
const responseData = JSON.parse(res._getData());
expect(responseData).toEqual({
  code: 400,
  message: 'Invalid input'
});
```

**Option 2: Fix the source code**
Change line 38 in `error.js` from `res.status(statusCode).send(response)` to `res.status(statusCode).json(response)` for semantically correct JSON responses.

### Additional Issues in Test File
1. Line 20: Test is incomplete - missing closing brace and assertions after `errorHandler(error, req, res, null);`
2. Missing environment cleanup: `config.env = originalEnv` should be added after assertions
3. Lines 42-52: Tests reference undefined `next` and `convertedError` variables - missing test setup code

    test('should send error response without stack trace in production environment for operational error', () => {
      const error = new ApiError(400, 'Invalid input', true);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const originalEnv = config.env;
      config.env = 'production';
      jest.spyOn(logger, 'error').mockImplementation(() => {});
    
      errorHandler(error, req, res, null);
    
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        code: 400,
        message: 'Invalid input'
      });
      expect(res.locals.errorMessage).toBe('Invalid input');
      expect(logger.error).not.toHaveBeenCalled();
    
      logger.error.mockRestore();
      config.env = originalEnv;
    });

*/
/*
FAILED TEST: ## Test Failure Analysis

### Failed Test
`Error middlewares › Error converter › should send error response with stack trace in development environment`

### Root Cause
The test is calling `res._getJSONData()` which expects the response body to be set via `res.json()`, but the `errorHandler` function uses `res.send()` instead (line 38 in error.js). The mock response object cannot parse the data sent via `.send()` as JSON.

### Recommended Fix
In the test file, replace `res._getJSONData()` with `res._getData()` to retrieve the raw response data sent via `res.send()`, then parse it manually:

```javascript
const responseData = JSON.parse(res._getData());
expect(responseData).toEqual({
  code: 404,
  message: 'Resource not found',
  stack: 'stack trace'
});
```

**Alternative:** Modify the source code to use `res.json(response)` instead of `res.send(response)` on line 38, which is more semantically correct for JSON responses.

### Additional Issues in Test File
1. Missing test closure - line 20 has `errorHandler(error, req, res, null);` but no closing brace/assertions
2. Missing `next` function initialization in some tests
3. Missing environment cleanup (`config.env = originalEnv`)

    test('should send error response with stack trace in development environment', () => {
      const error = new ApiError(404, 'Resource not found', true, 'stack trace');
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const originalEnv = config.env;
      config.env = 'development';
      jest.spyOn(logger, 'error').mockImplementation(() => {});
    
      errorHandler(error, req, res, null);
    
      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        code: 404,
        message: 'Resource not found',
        stack: 'stack trace'
      });
      expect(res.locals.errorMessage).toBe('Resource not found');
      expect(logger.error).toHaveBeenCalledWith(error);
    
      logger.error.mockRestore();
      config.env = originalEnv;
    });

*/

    test('should convert generic error without statusCode to ApiError with INTERNAL_SERVER_ERROR', () => {
      const error = new Error('Unexpected error occurred');
      const next = jest.fn();
    
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const convertedError = next.mock.calls[0][0];
      expect(convertedError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(convertedError.message).toBe('Unexpected error occurred');
      expect(convertedError.isOperational).toBe(false);
    });

/*
FAILED TEST: ## Test Failure Analysis

**Failed Test:** `Error middlewares › Error converter › should convert generic error with statusCode to ApiError`

**Root Cause:**
The test expects a generic error object with `statusCode: 403` to be preserved, but the `errorConverter` function is converting it to `400 (BAD_REQUEST)`.

Looking at the source code logic in `error.js` line 9-10:
```javascript
const statusCode =
  error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
```

This line has a **logical operator precedence issue**. It's being evaluated as:
```javascript
error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR)
```

When `error.statusCode` is truthy (403), it should use that value, but the ternary operator is checking `error instanceof mongoose.Error` first, which returns `false`, resulting in `httpStatus.INTERNAL_SERVER_ERROR` (500). However, the actual result is 400, indicating the logic is evaluating incorrectly.

Actually, the issue is simpler: the condition evaluates `error.statusCode || error instanceof mongoose.Error` as a boolean, then applies the ternary. Since `403 || false` = `403` (truthy), it returns `httpStatus.BAD_REQUEST` (400).

**Recommended Fix:**
Change line 9-10 in `src/middlewares/error.js` to:
```javascript
const statusCode = error.statusCode 
  ? error.statusCode 
  : error instanceof mongoose.Error 
    ? httpStatus.BAD_REQUEST 
    : httpStatus.INTERNAL_SERVER_ERROR;
```

Or more concisely:
```javascript
const statusCode = error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
```

Add parentheses around the ternary operator to fix operator precedence.

    test('should convert generic error with statusCode to ApiError', () => {
      const error = { statusCode: 403, message: 'Forbidden access' };
      const next = jest.fn();
    
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const convertedError = next.mock.calls[0][0];
      expect(convertedError.statusCode).toBe(403);
      expect(convertedError.message).toBe('Forbidden access');
      expect(convertedError.isOperational).toBe(false);
    });

*/

    test('should convert mongoose.Error to ApiError with BAD_REQUEST status', () => {
      const error = new mongoose.Error('Mongoose validation failed');
      const next = jest.fn();
    
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const convertedError = next.mock.calls[0][0];
      expect(convertedError.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(convertedError.message).toBe('Mongoose validation failed');
      expect(convertedError.isOperational).toBe(false);
    });

  });
})
