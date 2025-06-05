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
FAILED TEST: <think>

</think>

**Analysis:**  
The test `should handle missing error object gracefully` is failing because the `errorHandler` is being called with `null` as the error argument. This causes a `TypeError` when trying to destructure `err` into `statusCode` and `message`.

**Recommended Fix:**  
Update the `errorHandler` to safely handle `null` or `undefined` error inputs by adding a guard clause or default values. For example:

```js
const errorHandler = (err, req, res, next) => {
  if (!err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      code: httpStatus.INTERNAL_SERVER_ERROR,
      message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
    });
  }

  let { statusCode, message } = err;
  // ... rest of the function
};
```

  test('should handle missing error object gracefully', () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = jest.fn();
  
    errorHandler(null, req, res, next);
  
    expect(res._getStatusCode()).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    const response = JSON.parse(res._getData());
    expect(response.code).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(response.message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
  });

*/
/*
FAILED TEST: <think>

</think>

**Analysis:**  
The test `should handle operational error in development mode` is failing because `res._getData()` returns an object that is not properly stringified, leading to a `SyntaxError` when `JSON.parse()` is called.

**Recommended Fix:**  
Ensure the response is sent as a JSON string in the `errorHandler` middleware. Update the `res.status(statusCode).send(response);` to explicitly use `JSON.stringify(response)` if the response is not being serialized correctly.

  test('should handle operational error in development mode', () => {
    const error = new ApiError(httpStatus.BAD_REQUEST, 'Invalid request', true);
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = jest.fn();
  
    config.env = 'development';
    const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
  
    errorHandler(error, req, res, next);
  
    expect(res._getStatusCode()).toBe(httpStatus.BAD_REQUEST);
    const response = JSON.parse(res._getData());
    expect(response.code).toBe(httpStatus.BAD_REQUEST);
    expect(response.message).toBe('Invalid request');
    expect(response.stack).toBeDefined();
    expect(loggerErrorSpy).toHaveBeenCalledWith(error);
  });

*/
/*
FAILED TEST: <think>

</think>

**Analysis:**
The test `should handle non-operational error in production mode` in `error.test.js` is failing due to a `SyntaxError` when trying to parse the response data as JSON. The error `[object Object]` indicates that `res._getData()` is returning a string representation of an object instead of a properly formatted JSON string.

**Recommended Fix:**
Ensure that the `res._getData()` returns a valid JSON string by verifying how the response is being sent in the `errorHandler` middleware. Confirm that the `response` object is correctly stringified before sending.

  test('should handle non-operational error in production mode', () => {
    const error = new ApiError(httpStatus.BAD_REQUEST, 'Invalid request', false);
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = jest.fn();
  
    config.env = 'production';
    const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
  
    errorHandler(error, req, res, next);
  
    expect(res._getStatusCode()).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    const response = JSON.parse(res._getData());
    expect(response.code).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(response.message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
    expect(response.stack).toBeUndefined();
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

*/

  test('should convert generic error to ApiError with INTERNAL_SERVER_ERROR status', () => {
    const error = new Error('Something went wrong');
    const next = jest.fn();
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
  
    errorConverter(error, req, res, next);
  
    const calledError = next.mock.calls[0][0];
    expect(calledError).toBeInstanceOf(ApiError);
    expect(calledError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(calledError.message).toBe('Something went wrong');
  });


  test('should convert Mongoose validation error to ApiError with BAD_REQUEST status', () => {
    const error = new mongoose.Error.ValidatorError({
      path: 'name',
      message: 'Name is required',
      type: 'required',
      value: undefined,
    });
    const next = jest.fn();
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
  
    errorConverter(error, req, res, next);
  
    const calledError = next.mock.calls[0][0];
    expect(calledError).toBeInstanceOf(ApiError);
    expect(calledError.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(calledError.message).toBe('Name is required');
  });

  });
})
