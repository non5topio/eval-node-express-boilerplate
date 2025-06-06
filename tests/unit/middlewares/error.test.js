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
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `next` has already been declared outside of any function or block scope, causing a conflict.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.

    const next = jest.fn();
    
    errorConverter(null, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(next.mock.calls[0][0].message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `next` and `error` have already been declared outside of any function or block scope, causing a conflict. Additionally, there is an issue with the `expect(res._getJSONData().message).toBe('Operational error');` line, where `res._getJSONData()` is not returning a JSON object as expected.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.
2. **Correct the Expectation**: Ensure that `res._getJSONData()` returns a valid JSON object before accessing its properties.

    config.env = 'development';
    const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
    const res = httpMocks.createResponse();
    
    errorHandler(err, httpMocks.createRequest(), res, jest.fn());
    
    expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(res._getJSONData().message).toBe('Operational error');
    expect(res._getJSONData().stack).toBe(err.stack);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `next` and `error` have already been declared outside of any function or block scope, causing a conflict. Additionally, there is an issue with the `expect(res._getJSONData().message).toBe('Operational error');` line, where `res._getJSONData()` is not returning a JSON object as expected.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.
2. **Correct the Expectation**: Ensure that `res._getJSONData()` returns a valid JSON object before accessing its properties.

Here is the corrected version of the test file:

```javascript
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

    test('should convert a generic error to an ApiError with INTERNAL_SERVER_ERROR status', () => {
      const error = new Error('Generic error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(next.mock.calls[0][0].message).toBe('Generic error');
    });

    test('should convert a mongoose error to an ApiError with BAD_REQUEST status', () => {
      const error = new mongoose.Error('Mongoose error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(next.mock.calls[0][0].message).toBe('Mongoose error');
    });
  });

  describe('Error handler', () => {
    test('should handle ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Non-operational error', false);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData().message).toBe('Internal Server Error');
      expect(res._getJSONData().stack).toBeUndefined();
    });

    test('should handle operational ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBeUndefined();
    });

    test('should handle ApiError in development', () => {
      config.env = 'development';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBe(err.stack);
    });
  });
});
```

    config.env = 'production';
    const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
    const res = httpMocks.createResponse();
    
    errorHandler(err, httpMocks.createRequest(), res, jest.fn());
    
    expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(res._getJSONData().message).toBe('Operational error');
    expect(res._getJSONData().stack).toBeUndefined();

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `next` and `error` have already been declared outside of any function or block scope, causing a conflict. Additionally, there is an issue with the `expect(res._getJSONData().message).toBe('Internal Server Error');` line, where `res._getJSONData()` is not returning a JSON object as expected.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.
2. **Correct the Expectation**: Ensure that `res._getJSONData()` returns a valid JSON object before accessing its properties.

Here is the corrected version of the test file:

```javascript
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

    test('should convert a generic error to an ApiError with INTERNAL_SERVER_ERROR status', () => {
      const error = new Error('Generic error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(next.mock.calls[0][0].message).toBe('Generic error');
    });

    test('should convert a mongoose error to an ApiError with BAD_REQUEST status', () => {
      const error = new mongoose.Error('Mongoose error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(next.mock.calls[0][0].message).toBe('Mongoose error');
    });
  });

  describe('Error handler', () => {
    test('should handle ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Non-operational error', false);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData().message).toBe('Internal Server Error');
      expect(res._getJSONData().stack).toBeUndefined();
    });

    test('should handle operational ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBeUndefined();
    });

    test('should handle ApiError in development', () => {
      config.env = 'development';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBe(err.stack);
    });
  });
});
```

    config.env = 'production';
    const err = new ApiError(httpStatus.BAD_REQUEST, 'Non-operational error', false);
    const res = httpMocks.createResponse();
    
    errorHandler(err, httpMocks.createRequest(), res, jest.fn());
    
    expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(res._getJSONData().message).toBe('Internal Server Error');
    expect(res._getJSONData().stack).toBeUndefined();

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `next` has already been declared outside of any function or block scope, causing a conflict.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.

    const next = jest.fn();
    
    errorConverter(null, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(next.mock.calls[0][0].message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared outside of any function or block scope, causing a conflict.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.

Here is the corrected version of the test file:

```javascript
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

    test('should convert a generic error to an ApiError with INTERNAL_SERVER_ERROR status', () => {
      const error = new Error('Generic error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(next.mock.calls[0][0].message).toBe('Generic error');
    });

    test('should convert a mongoose error to an ApiError with BAD_REQUEST status', () => {
      const error = new mongoose.Error('Mongoose error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(next.mock.calls[0][0].message).toBe('Mongoose error');
    });
  });

  describe('Error handler', () => {
    test('should handle ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Non-operational error', false);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData().message).toBe('Internal Server Error');
      expect(res._getJSONData().stack).toBeUndefined();
    });

    test('should handle operational ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBeUndefined();
    });

    test('should handle ApiError in development', () => {
      config.env = 'development';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBe(err.stack);
    });
  });
});
```

    const error = new Error('Generic error');
    const next = jest.fn();
    
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(next.mock.calls[0][0].message).toBe('Generic error');

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared outside of any function or block scope, causing a conflict.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.

    const error = new mongoose.Error('Mongoose error');
    const next = jest.fn();
    
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(next.mock.calls[0][0].message).toBe('Mongoose error');

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `next` and `error` have already been declared outside of any function or block scope, causing a conflict. Additionally, there is an issue with the `expect(res._getJSONData().message).toBe('Operational error');` line, where `res._getJSONData()` is not returning a JSON object as expected.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.
2. **Correct the Expectation**: Ensure that `res._getJSONData()` returns a valid JSON object before accessing its properties.

Here is the corrected version of the test file:

```javascript
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

    test('should convert a generic error to an ApiError with INTERNAL_SERVER_ERROR status', () => {
      const error = new Error('Generic error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(next.mock.calls[0][0].message).toBe('Generic error');
    });

    test('should convert a mongoose error to an ApiError with BAD_REQUEST status', () => {
      const error = new mongoose.Error('Mongoose error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(next.mock.calls[0][0].message).toBe('Mongoose error');
    });
  });

  describe('Error handler', () => {
    test('should handle ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Non-operational error', false);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData().message).toBe('Internal Server Error');
      expect(res._getJSONData().stack).toBeUndefined();
    });

    test('should handle operational ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBeUndefined();
    });

    test('should handle ApiError in development', () => {
      config.env = 'development';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBe(err.stack);
    });
  });
});
```

    config.env = 'development';
    const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
    const res = httpMocks.createResponse();
    
    errorHandler(err, httpMocks.createRequest(), res, jest.fn());
    
    expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(res._getJSONData().message).toBe('Operational error');
    expect(res._getJSONData().stack).toBe(err.stack);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `next` and `error` have already been declared outside of any function or block scope, causing a conflict. Additionally, there is an issue with the `expect(res._getJSONData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);` line, where `httpStatus[httpStatus.INTERNAL_SERVER_ERROR]` returns a status code name (e.g., "INTERNAL_SERVER_ERROR") instead of the status code number.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.
2. **Correct the Expectation**: Change the expectation to compare the status code number instead of the status code name.

Here is the corrected version of the test file:

```javascript
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

    test('should convert a generic error to an ApiError with INTERNAL_SERVER_ERROR status', () => {
      const error = new Error('Generic error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(next.mock.calls[0][0].message).toBe('Generic error');
    });

    test('should convert a mongoose error to an ApiError with BAD_REQUEST status', () => {
      const error = new mongoose.Error('Mongoose error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(next.mock.calls[0][0].message).toBe('Mongoose error');
    });
  });

  describe('Error handler', () => {
    test('should handle ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Non-operational error', false);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData().message).toBe('Internal Server Error');
      expect(res._getJSONData().stack).toBeUndefined();
    });

    test('should handle operational ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBeUndefined();
    });
  });
});
```

    config.env = 'production';
    const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
    const res = httpMocks.createResponse();
    
    errorHandler(err, httpMocks.createRequest(), res, jest.fn());
    
    expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(res._getJSONData().message).toBe('Operational error');
    expect(res._getJSONData().stack).toBeUndefined();

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `next` and `error` have already been declared outside of any function or block scope, causing a conflict. Additionally, there is an issue with the `expect(res._getJSONData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);` line, where `httpStatus[httpStatus.INTERNAL_SERVER_ERROR]` returns a status code name (e.g., "INTERNAL_SERVER_ERROR") instead of the status code number.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.
2. **Correct the Expectation**: Change the expectation to compare the status code number instead of the status code name.

Here is the corrected version of the test file:

```javascript
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

    test('should convert a generic error to an ApiError with INTERNAL_SERVER_ERROR status', () => {
      const error = new Error('Generic error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(next.mock.calls[0][0].message).toBe('Generic error');
    });

    test('should convert a mongoose error to an ApiError with BAD_REQUEST status', () => {
      const error = new mongoose.Error('Mongoose error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(next.mock.calls[0][0].message).toBe('Mongoose error');
    });
  });

  describe('Error handler', () => {
    test('should handle ApiError in production', () => {
      config.env = 'production';
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Non-operational error', false);
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData().message).toBe('Internal Server Error');
      expect(res._getJSONData().stack).toBeUndefined();
    });
  });
});
```

    config.env = 'production';
    const err = new ApiError(httpStatus.BAD_REQUEST, 'Non-operational error', false);
    const res = httpMocks.createResponse();
    
    errorHandler(err, httpMocks.createRequest(), res, jest.fn());
    
    expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(res._getJSONData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
    expect(res._getJSONData().stack).toBeUndefined();

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `next` has already been declared. This is because multiple `const next` declarations exist outside of any function or block scope, causing a conflict.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.
2. **Remove Duplicate Declarations**: Ensure that each `const next` declaration is unique within its scope.

    const next = jest.fn();
    
    errorConverter(null, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(next.mock.calls[0][0].message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared. This is because multiple `const error` declarations exist outside of any function or block scope, causing a conflict.

### Recommended Fixes
1. **Encapsulate Test Cases**: Wrap each test case in its own `test` block to ensure that variable declarations do not conflict.
2. **Remove Duplicate Declarations**: Ensure that each `const error` declaration is unique within its scope.

Here is the corrected version of the test file:

```javascript
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

    test('should convert a generic error to an ApiError with INTERNAL_SERVER_ERROR status', () => {
      const error = new Error('Generic error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(next.mock.calls[0][0].message).toBe('Generic error');
    });

    test('should convert a mongoose error to an ApiError with BAD_REQUEST status', () => {
      const error = new mongoose.Error('Mongoose error');
      const next = jest.fn();
      
      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(next.mock.calls[0][0].message).toBe('Mongoose error');
    });
  });
});
```

    const error = new Error('Generic error');
    const next = jest.fn();
    
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(next.mock.calls[0][0].message).toBe('Generic error');

*/

    const error = new mongoose.Error('Mongoose error');
    const next = jest.fn();
    
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(next.mock.calls[0][0].message).toBe('Mongoose error');

  });
})
