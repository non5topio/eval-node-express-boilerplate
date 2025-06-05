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
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared outside of a test block, causing a conflict. Additionally, there is an issue with the `expect` statement where `res._getJSONData().message` is being compared to `httpStatus[httpStatus.INTERNAL_SERVER_ERROR]`, which is incorrect.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.
2. Correct the `expect` statement to compare `res._getJSONData().message` to the correct expected message.

    const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
    config.env = 'development';
    const res = httpMocks.createResponse();
    
    errorHandler(err, httpMocks.createRequest(), res, jest.fn());
    
    expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(res._getJSONData().message).toBe('Operational error');
    expect(res._getJSONData().stack).toBe(err.stack);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared outside of a test block, causing a conflict. Additionally, there is an issue with the `expect` statement where `res._getJSONData().message` is being compared to `httpStatus[httpStatus.INTERNAL_SERVER_ERROR]`, which is incorrect.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.
2. Correct the `expect` statement to compare `res._getJSONData().message` to the correct expected message.

Here is the corrected test file:

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
    test('should handle operational error in development', () => {
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      config.env = 'development';
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBe(err.stack);
    });

    test('should handle operational error in production', () => {
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', false);
      config.env = 'production';
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData().message).toBe('Internal Server Error');
      expect(res._getJSONData().stack).toBeUndefined();
    });
  });
});
```

    const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', false);
    config.env = 'production';
    const res = httpMocks.createResponse();
    
    errorHandler(err, httpMocks.createRequest(), res, jest.fn());
    
    expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(res._getJSONData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
    expect(res._getJSONData().stack).toBeUndefined();

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared. This is because the `error` variable is being redeclared outside of a test block, causing a conflict.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.

    const error = undefined;
    const next = jest.fn();
    
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(next.mock.calls[0][0].message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared. This is because the `error` variable is being redeclared outside of a test block, causing a conflict.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.

Here is the corrected test file:

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
    test('should handle operational error in development', () => {
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      config.env = 'development';
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBe(err.stack);
    });

    test('should handle operational error in production', () => {
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', false);
      config.env = 'production';
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
      expect(res._getJSONData().stack).toBeUndefined();
    });
  });
});
```

    const error = null;
    const next = jest.fn();
    
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(next.mock.calls[0][0].message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared. This is because the `error` variable is being redeclared outside of a test block, causing a conflict.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.

    const error = new Error('Generic error');
    const next = jest.fn();
    
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(next.mock.calls[0][0].message).toBe('Generic error');

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared. This is because the `error` variable is being redeclared outside of a test block, causing a conflict.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.

    const error = new mongoose.Error('Mongoose error');
    const next = jest.fn();
    
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(next.mock.calls[0][0].message).toBe('Mongoose error');

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared. This is because the `error` variable is being redeclared outside of a test block, causing a conflict. Additionally, there is an issue with the `expect` statement where `res._getJSONData().message` is being compared to `httpStatus[httpStatus.INTERNAL_SERVER_ERROR]`, which is incorrect.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.
2. Correct the `expect` statement to compare `res._getJSONData().message` to the correct expected message.

Here is the corrected test file:

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
    test('should handle operational error in development', () => {
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
      config.env = 'development';
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res._getJSONData().message).toBe('Operational error');
      expect(res._getJSONData().stack).toBe(err.stack);
    });

    test('should handle operational error in production', () => {
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', false);
      config.env = 'production';
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
      expect(res._getJSONData().stack).toBeUndefined();
    });
  });
});
```

    const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', true);
    config.env = 'development';
    const res = httpMocks.createResponse();
    
    errorHandler(err, httpMocks.createRequest(), res, jest.fn());
    
    expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(res._getJSONData().message).toBe('Operational error');
    expect(res._getJSONData().stack).toBe(err.stack);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared. This is because the `error` variable is being redeclared outside of a test block, causing a conflict. Additionally, there is an issue with the `expect` statement where `res._getJSONData().message` is being compared to `httpStatus[httpStatus.INTERNAL_SERVER_ERROR]`, which is incorrect.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.
2. Correct the `expect` statement to compare `res._getJSONData().message` to the correct expected message.

Here is the corrected test file:

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
    test('should handle operational error in production', () => {
      const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', false);
      config.env = 'production';
      const res = httpMocks.createResponse();
      
      errorHandler(err, httpMocks.createRequest(), res, jest.fn());
      
      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res._getJSONData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
      expect(res._getJSONData().stack).toBeUndefined();
    });
  });
});
```

    const err = new ApiError(httpStatus.BAD_REQUEST, 'Operational error', false);
    config.env = 'production';
    const res = httpMocks.createResponse();
    
    errorHandler(err, httpMocks.createRequest(), res, jest.fn());
    
    expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(res._getJSONData().message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
    expect(res._getJSONData().stack).toBeUndefined();

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared. This is because the `error` variable is being redeclared outside of a test block, causing a conflict.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.

Here is the corrected test file:

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

    const error = undefined;
    const next = jest.fn();
    
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(next.mock.calls[0][0].message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared. This is because the `error` variable is being redeclared outside of a test block, causing a conflict.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.

    const error = null;
    const next = jest.fn();
    
    errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(next.mock.calls[0][0].message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);

*/
/*
FAILED TEST: ### Analysis
The test run failed due to a `SyntaxError` in `tests/unit/middlewares/error.test.js`. The error message indicates that the identifier `error` has already been declared. This is because the `error` variable is being redeclared outside of a test block, causing a conflict.

### Recommended Fixes
1. Move the declaration of the `error` variable inside each test block to avoid redeclaration conflicts.

Here is the corrected test file:

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
