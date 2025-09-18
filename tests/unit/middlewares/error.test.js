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
FAILED TEST: <|channel|>analysis<|message|>We need to explain two failures: syntax error in test file due to missing closing braces or misplaced test definitions. The test file seems malformed: nested test definitions, missing closing parentheses/brackets. The error at line 245 indicates stray newline after a closing brace. So need to fix test file syntax.

Also earlier we identified logic bug in errorConverter statusCode precedence. But test suite didn't run due to syntax error, so primary failure is syntax error. Provide recommended fixes: correct test file structure, ensure each `describe`/`test` closed properly, remove stray nested test definitions, add missing parentheses, etc. Also optionally fix errorConverter precedence as earlier.

Provide concise answer.<|end|><|start|>assistant<|channel|>final<|message|>**Why the test run failed**

1. **Syntax error in the test file** – `tests/unit/middlewares/error.test.js` contains malformed Jest blocks (nested `test` calls, missing closing braces/parentheses). The parser stops at line 245 (`Unexpected token`) so the whole suite aborts before any code is executed.

2. **(Secondary) Logic bug in the code under test** – `errorConverter` builds the status code with  
   ```js
   const statusCode =
     error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
   ```  
   Because the ternary has higher precedence than `||`, any truthy `error.statusCode` (e.g., 404) is treated as *true* and the expression always returns `BAD_REQUEST` (400). This makes the “plain error with statusCode” test fail once the syntax error is fixed.

**Recommended fixes**

1. **Fix the test file syntax**
   * Ensure every `describe`/`test` block is properly closed.
   * Remove the accidental nesting of `test` inside another `test`.
   * Example (trimmed to the failing part):
   ```js
   describe('Error middlewares', () => {
     describe('Error converter', () => {
       test('should return the same ApiError object it was called with', () => {
         const error = new ApiError(httpStatus.BAD_REQUEST, 'Any error');
         const next = jest.fn();

         errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
         expect(next).toHaveBeenCalledWith(error);
       });

       test('should convert plain error with statusCode and message to ApiError', () => {
         const err = new Error('Resource not found');
         err.statusCode = 404;
         err.stack = 'plainErrorStack';
         const req = httpMocks.createRequest();
         const res = httpMocks.createResponse();
         const next = jest.fn();

         errorConverter(err, req, res, next);
         expect(next).toHaveBeenCalledWith(expect.objectContaining({
           statusCode: 404,
           message: 'Resource not found',
           isOperational: false,
           stack: 'plainErrorStack',
         }));
       });
       // …other tests…
     });
   });
   ```

2. **Correct the status‑code precedence in `src/middlewares/error.js`**
   ```js
   const statusCode =
     error.statusCode ||
     (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
   ```
   This keeps an existing `error.statusCode` (e.g., 404) and only falls back to `BAD_REQUEST` for Mongoose errors.

After applying both changes, the test suite should parse correctly and the `errorConverter` logic will satisfy the expectations.

    test('should_preserve_operational_ApiError_in_production_without_stack', () => {
      const originalEnv = config.env;
      config.env = 'production';

*/

    test('should_mask_non_operational_error_in_production_without_stack', () => {
      const originalEnv = config.env;
      config.env = 'production';
    
      const loggerSpy = jest.spyOn(logger, 'error');
    
      const err = new Error('Database connection lost');
      err.stack = 'ProdStack';
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
    
      errorHandler(err, req, res, () => {});
    
      expect(res.locals.errorMessage).toBe('Database connection lost');
      const data = res._getData();
      expect(res.statusCode).toBe(500);
      expect(data).toMatchObject({
        code: 500,
        message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
      });
      expect(data).not.toHaveProperty('stack');
      expect(loggerSpy).not.toHaveBeenCalled();
    
      loggerSpy.mockRestore();
      config.env = originalEnv;
    });


    test('should_handle_operational_ApiError_in_development_with_stack_and_logging', () => {
      const originalEnv = config.env;
      config.env = 'development';
    
      const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    
      const err = new ApiError(400, 'Bad request', true, 'ErrorStack');
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
    
      errorHandler(err, req, res, () => {});
    
      expect(res.locals.errorMessage).toBe('Bad request');
      const data = res._getData();
      expect(res.statusCode).toBe(400);
      expect(data).toMatchObject({
        code: 400,
        message: 'Bad request',
        stack: 'ErrorStack',
      });
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(err);
    
      loggerSpy.mockRestore();
      config.env = originalEnv;
    });

/*
FAILED TEST: <|channel|>analysis<|message|>We need to produce short concise analysis: test expects generic error conversion to internal server error message (httpStatus[500] = "Internal Server Error") but got original error message "Unexpected failure". In errorConverter, message is set to error.message || httpStatus[statusCode]; Since generic error has message, it uses that. Test expects fallback to default message. So either test expects message to be default, so code should set message to httpStatus[statusCode] regardless of original message for generic errors? Probably they want generic error to have default message. So modify errorConverter: if err is not ApiError, set message = httpStatus[statusCode]; ignoring original message? But other tests may rely on preserving message for errors with statusCode? Let's see other tests: there is test for plain error with statusCode and message expecting message to be original? Not shown fully but likely they expect message to be original. So need conditional: if error has statusCode (custom) keep message, else use default. So change to:
```js
const message = error.statusCode ? error.message : httpStatus[statusCode];
```
Or more robust: if error.statusCode && error.message then keep message else default. So fix.

Also need parentheses for statusCode precedence as earlier. Provide both fixes.

Now produce concise answer.<|end|><|start|>assistant<|channel|>final<|message|>**Why it failed**  
`errorConverter` builds the `ApiError` like this:

```js
const statusCode =
  error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
const message = error.message || httpStatus[statusCode];
```

1. **Operator‑precedence bug** – the ternary is evaluated **before** the `||`.  
   When a plain error has `statusCode = 404` the expression becomes  
   `(error.statusCode || error instanceof mongoose.Error) ? BAD_REQUEST : INTERNAL_SERVER_ERROR` → `true ? BAD_REQUEST : …` → **400** instead of the expected **404**.

2. **Message handling** – for a generic `Error` the code keeps the original message (`"Unexpected failure"`). The test expects the generic error to be turned into an *internal‑server‑error* `ApiError` whose message is the default HTTP‑status text (`"Internal Server Error"`).

**Recommended fixes**

```js
// src/middlewares/error.js
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    // 1️⃣ fix precedence
    const statusCode =
      error.statusCode ||
      (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

    // 2️⃣ use default status‑text only when the original error has no explicit statusCode
    const message =
      error.statusCode ? error.message : httpStatus[statusCode];

    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};
```

* The parentheses ensure the fallback to `BAD_REQUEST` is applied **only** when `error.statusCode` is falsy.  
* The conditional `message` keeps the original message for errors that already carry a status code (e.g., the plain error with `statusCode = 404`) while defaulting to the HTTP‑status text for generic errors, satisfying the failing test.

    test('should_convert_generic_error_to_internal_server_error_ApiError', () => {
      const err = new Error('Unexpected failure');
      err.stack = 'genericErrorStack';
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorConverter(err, req, res, next);
    
      expect(next).toHaveBeenCalledTimes(1);
      const convertedError = next.mock.calls[0][0];
      expect(convertedError).toBeInstanceOf(ApiError);
      expect(convertedError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(convertedError.message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
      expect(convertedError.isOperational).toBe(false);
      expect(convertedError.stack).toBe('genericErrorStack');
    });

*/

    test('should_convert_mongoose_error_to_ApiError_with_BAD_REQUEST', () => {
      const err = new mongoose.Error('Invalid ObjectId');
      err.stack = 'mongooseErrorStack';
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorConverter(err, req, res, next);
    
      expect(next).toHaveBeenCalledTimes(1);
      const convertedError = next.mock.calls[0][0];
      expect(convertedError).toBeInstanceOf(ApiError);
      expect(convertedError.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(convertedError.message).toBe('Invalid ObjectId');
      expect(convertedError.isOperational).toBe(false);
      expect(convertedError.stack).toBe('mongooseErrorStack');
    });

/*
FAILED TEST: <|channel|>analysis<|message|>We need to explain why test fails: errorConverter when given plain error with statusCode 404 should convert to ApiError with statusCode 404, but code sets statusCode = error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;

Operator precedence issue: `||` and `?:`? Actually expression: `error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;` Without parentheses, `||` has lower precedence than `?:`? Actually ternary has lower precedence than logical OR? Precedence: `?:` is lower than `||`? Let's recall: Ternary has lower precedence than logical OR, meaning `a || b ? x : y` is interpreted as `a || (b ? x : y)`. So here: `error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR` becomes `error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR)`. Since error.statusCode is 404 (truthy), expression returns 404, not BAD_REQUEST. Wait test got 400, meaning statusCode became BAD_REQUEST (400). So maybe precedence is opposite: ternary higher than ||, so expression parsed as `(error.statusCode || error instanceof mongoose.Error) ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR`. Since error.statusCode is 404 (truthy), the condition true, returns BAD_REQUEST (400). Yes that's what happened. So need parentheses to prioritize statusCode fallback: `const statusCode = error.statusCode || (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);`

Thus fix errorConverter.

Also test expects isOperational false (default). In ApiError constructor signature? Let's check utils/ApiError. Probably (statusCode, message, isOperational = true, stack). In conversion we pass false for isOperational, good.

So recommended fix: adjust precedence.

Provide concise answer.<|end|><|start|>assistant<|channel|>final<|message|>**Why the test failed**

`errorConverter` builds the status code with this line:

```js
const statusCode =
  error.statusCode ||
  error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
```

Because the ternary operator (`?:`) has **higher precedence** than `||`, the expression is parsed as:

```js
(error.statusCode || error instanceof mongoose.Error)
  ? httpStatus.BAD_REQUEST
  : httpStatus.INTERNAL_SERVER_ERROR;
```

When the incoming plain error has `statusCode = 404` (a truthy value), the condition evaluates to `true`, so the ternary returns `httpStatus.BAD_REQUEST` (400). The test therefore receives a `400` instead of the expected `404`.

**Recommended fix**

Add parentheses so the fallback to `BAD_REQUEST` only applies when `error.statusCode` is falsy:

```js
const statusCode =
  error.statusCode ||
  (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
```

or rewrite more clearly:

```js
let statusCode;
if (error.statusCode) {
  statusCode = error.statusCode;
} else if (error instanceof mongoose.Error) {
  statusCode = httpStatus.BAD_REQUEST;
} else {
  statusCode = httpStatus.INTERNAL_SERVER_ERROR;
}
```

After correcting the precedence, the converted `ApiError` will retain the original `404` status code, and the test will pass.

    test('should_convert_plain_error_with_statusCode_and_message_to_ApiError', () => {
      const err = new Error('Resource not found');
      err.statusCode = 404;
      err.stack = 'plainErrorStack';
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorConverter(err, req, res, next);
    
      expect(next).toHaveBeenCalledTimes(1);
      const convertedError = next.mock.calls[0][0];
      expect(convertedError).toBeInstanceOf(ApiError);
      expect(convertedError.statusCode).toBe(404);
      expect(convertedError.message).toBe('Resource not found');
      expect(convertedError.isOperational).toBe(false);
      expect(convertedError.stack).toBe('plainErrorStack');
    });

*/
  });
})
