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

    test('should convert an Error to ApiError and preserve its status and message', () => {
      const error = new Error('Any error');
      error.statusCode = httpStatus.BAD_REQUEST;
      const next = jest.fn();

      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: error.statusCode,
          message: error.message,
          isOperational: false,
        })
      );
    });

    test('should convert an Error without status to ApiError with status 500', () => {
      const error = new Error('Any error');
      const next = jest.fn();

      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          isOperational: false,
        })
      );
    });

    test('should convert an Error without message to ApiError with default message of that http status', () => {
      const error = new Error();
      error.statusCode = httpStatus.BAD_REQUEST;
      const next = jest.fn();

      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: error.statusCode,
          message: httpStatus[error.statusCode],
          isOperational: false,
        })
      );
    });

    test('should convert a Mongoose error to ApiError with status 400 and preserve its message', () => {
      const error = new mongoose.Error('Any mongoose error');
      const next = jest.fn();

      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.BAD_REQUEST,
          message: error.message,
          isOperational: false,
        })
      );
    });

    test('should convert any other object to ApiError with status 500 and its message', () => {
      const error = {};
      const next = jest.fn();

      errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
          isOperational: false,
        })
      );
    });
  });

  describe('Error handler', () => {
    beforeEach(() => {
      jest.spyOn(logger, 'error').mockImplementation(() => {});
    });

    test('should send proper error response and put the error message in res.locals', () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Any error');
      const res = httpMocks.createResponse();
      const sendSpy = jest.spyOn(res, 'send');

      errorHandler(error, httpMocks.createRequest(), res);

      expect(sendSpy).toHaveBeenCalledWith(expect.objectContaining({ code: error.statusCode, message: error.message }));
      expect(res.locals.errorMessage).toBe(error.message);
    });

    test('should put the error stack in the response if in development mode', () => {
      config.env = 'development';
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Any error');
      const res = httpMocks.createResponse();
      const sendSpy = jest.spyOn(res, 'send');

      errorHandler(error, httpMocks.createRequest(), res);

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({ code: error.statusCode, message: error.message, stack: error.stack })
      );
      config.env = process.env.NODE_ENV;
    });

    test('should send internal server error status and message if in production mode and error is not operational', () => {
      config.env = 'production';
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Any error', false);
      const res = httpMocks.createResponse();
      const sendSpy = jest.spyOn(res, 'send');

      errorHandler(error, httpMocks.createRequest(), res);

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
        })
      );
      expect(res.locals.errorMessage).toBe(error.message);
      config.env = process.env.NODE_ENV;
    });

    test('should preserve original error status and message if in production mode and error is operational', () => {
      config.env = 'production';
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Any error');
      const res = httpMocks.createResponse();
      const sendSpy = jest.spyOn(res, 'send');

      errorHandler(error, httpMocks.createRequest(), res);

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: error.statusCode,
          message: error.message,
        })
      );
      config.env = process.env.NODE_ENV;
    });

    // test('should handle error objects with circular references without throwing exceptions', () => {
    //   const error = new Error('Circular error');
    //   error.statusCode = httpStatus.BAD_REQUEST;
    //   error.self = error; // Creating a circular reference
    //   const req = httpMocks.createRequest();
    //   const res = httpMocks.createResponse();
    //   const next = jest.fn();
    
    //   expect(() => {
    //     errorConverter(error, req, res, next);
    //   }).not.toThrow();
    
    //   expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //   const convertedError = next.mock.calls[0][0];
    //   expect(convertedError.statusCode).toBe(httpStatus.BAD_REQUEST);
    //   expect(convertedError.message).toBe(error.message);
    // });


    // test('should not expose stack trace in production environment for non-operational errors', () => {
    //   config.env = 'production';
    //   const error = new ApiError(httpStatus.BAD_REQUEST, 'Any error', false);
    //   const req = httpMocks.createRequest();
    //   const res = httpMocks.createResponse();
    //   const sendSpy = jest.spyOn(res, 'send');
    
    //   errorHandler(error, req, res);
    
    //   expect(sendSpy).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       code: httpStatus.INTERNAL_SERVER_ERROR,
    //       message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
    //     })
    //   );
    //   expect(res.locals.errorMessage).toBe(error.message);
    //   expect(res._getData()).not.toHaveProperty('stack');
    //   config.env = process.env.NODE_ENV;
    // });

    // test('should not expose sensitive information in production environment in errorHandler', () => {
    //   const sensitiveMessage = "Sensitive data: user password 12345";
    //   const error = new ApiError(httpStatus.BAD_REQUEST, sensitiveMessage, false);
    //   const req = httpMocks.createRequest();
    //   const res = httpMocks.createResponse();
    //   const sendSpy = jest.spyOn(res, 'send');
    
    //   config.env = 'production';
    
    //   errorHandler(error, req, res);
    
    //   expect(sendSpy).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       code: httpStatus.INTERNAL_SERVER_ERROR,
    //       message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
    //     })
    //   );
    //   expect(res.locals.errorMessage).toBe(sensitiveMessage);
    //   expect(res._getData()).not.toHaveProperty('stack');
    
    //   // Reset environment
    //   config.env = process.env.NODE_ENV;
    // });


    // test('should handle errors with deeply nested properties in errorConverter', () => {
    //   const deepNestedError = new Error('Deep nested error');
    //   let current = deepNestedError;
    //   for (let i = 0; i < 15; i++) {
    //     current.nested = { level: i };
    //     current = current.nested;
    //   }
    //   const req = httpMocks.createRequest();
    //   const res = httpMocks.createResponse();
    //   const next = jest.fn();
    
    //   errorConverter(deepNestedError, req, res, next);
    
    //   expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //   const convertedError = next.mock.calls[0][0];
    //   expect(convertedError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    //   expect(convertedError.message).toBe(deepNestedError.message);
    //   expect(convertedError.isOperational).toBe(false);
    // });


    // test('should send raw XSS payload in error message and highlight need for sanitization in errorHandler', () => {
    //   const xssMessage = "<script>alert('XSS')</script>";
    //   const error = new ApiError(httpStatus.BAD_REQUEST, xssMessage);
    //   const req = httpMocks.createRequest();
    //   const res = httpMocks.createResponse();
    //   const sendSpy = jest.spyOn(res, 'send');
    
    //   // Set environment to development
    //   config.env = 'development';
    
    //   errorHandler(error, req, res);
    
    //   expect(sendSpy).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       code: error.statusCode,
    //       message: error.message,
    //       stack: error.stack,
    //     })
    //   );
    //   // Note: This test highlights that raw messages are sent and suggests sanitization is needed.
    //   // Ensure that in real applications, messages are properly sanitized to prevent XSS.
    // });


    test('should call logger.error in development mode', () => {
      const originalEnv = config.env;
      config.env = 'development';
      
      const loggerSpy = jest.spyOn(logger, 'error');
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Test error');
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      
      errorHandler(error, req, res);
      
      expect(loggerSpy).toHaveBeenCalledWith(error);
      
      // Restore original environment
      config.env = originalEnv;
    });


    test('should not expose sensitive information in production environment', () => {
      const originalEnv = config.env;
      config.env = 'production';
      
      const sensitiveMessage = "Sensitive data: user password 12345";
      const error = new ApiError(httpStatus.BAD_REQUEST, sensitiveMessage, false);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const sendSpy = jest.spyOn(res, 'send');
    
      errorHandler(error, req, res);
    
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
        })
      );
      expect(res.locals.errorMessage).toBe(sensitiveMessage);
      expect(res._getData()).not.toHaveProperty('stack');
      
      // Restore original environment
      config.env = originalEnv;
    });


    test('should send raw XSS payload in error message and highlight need for sanitization', () => {
      const originalEnv = config.env;
      config.env = 'development';
      
      const xssMessage = "<script>alert('XSS')</script>";
      const error = new ApiError(httpStatus.BAD_REQUEST, xssMessage);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const sendSpy = jest.spyOn(res, 'send');
    
      errorHandler(error, req, res);
    
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: error.statusCode,
          message: error.message,
          stack: error.stack,
        })
      );
      expect(res.locals.errorMessage).toBe(xssMessage);
      
      // Restore original environment
      config.env = originalEnv;
    });


    test('should preserve error status and message in unrecognized environment in errorHandler', () => {
      const originalEnv = config.env;
      config.env = 'staging'; // Unrecognized environment
      
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Bad Request');
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const sendSpy = jest.spyOn(res, 'send');
    
      errorHandler(error, req, res);
    
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: error.statusCode,
          message: error.message,
        })
      );
      expect(res.locals.errorMessage).toBe(error.message);
      expect(res._getData()).not.toHaveProperty('stack');
      
      // Restore original environment
      config.env = originalEnv;
    });


    test('should convert non-object errors to ApiError in errorConverter', () => {
      const testCases = [
        { error: 404, expectedMessage: httpStatus[httpStatus.INTERNAL_SERVER_ERROR] },
        { error: "Error message", expectedMessage: httpStatus[httpStatus.INTERNAL_SERVER_ERROR] }
      ];
      
      testCases.forEach(({ error, expectedMessage }) => {
        const req = httpMocks.createRequest();
        const res = httpMocks.createResponse();
        const next = jest.fn();
        
        errorConverter(error, req, res, next);
        
        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        const convertedError = next.mock.calls[0][0];
        expect(convertedError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
        expect(convertedError.message).toBe(expectedMessage);
        expect(convertedError.isOperational).toBe(false);
        
        next.mockClear();
      });
    });


    test('should handle error objects with circular references without throwing exceptions', () => {
      const error = new Error('Circular error');
      error.statusCode = httpStatus.BAD_REQUEST;
      error.self = error; // Creating a circular reference
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      expect(() => {
        errorConverter(error, req, res, next);
      }).not.toThrow();
    
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const convertedError = next.mock.calls[0][0];
      expect(convertedError.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(convertedError.message).toBe(error.message);
    });


    test('should not expose sensitive information in production environment', () => {
      const originalEnv = config.env;
      config.env = 'production';
      
      const sensitiveMessage = "Sensitive data: user password 12345";
      const error = new ApiError(httpStatus.BAD_REQUEST, sensitiveMessage, false);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const sendSpy = jest.spyOn(res, 'send');
    
      errorHandler(error, req, res);
    
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
        })
      );
      expect(res.locals.errorMessage).toBe(sensitiveMessage);
      expect(res._getData()).not.toHaveProperty('stack');
      
      // Restore original environment
      config.env = originalEnv;
    });


    test('should send raw XSS payload in error message and highlight need for sanitization', () => {
      const originalEnv = config.env;
      config.env = 'development';
      
      const xssMessage = "<script>alert('XSS')</script>";
      const error = new ApiError(httpStatus.BAD_REQUEST, xssMessage);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const sendSpy = jest.spyOn(res, 'send');
    
      errorHandler(error, req, res);
    
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: error.statusCode,
          message: error.message,
          stack: error.stack,
        })
      );
      expect(res.locals.errorMessage).toBe(xssMessage);
      
      // Restore original environment
      config.env = originalEnv;
    });


    test('should preserve error status and message in unrecognized environment in errorHandler', () => {
      const originalEnv = config.env;
      config.env = 'staging'; // Unrecognized environment
      
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Bad Request');
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const sendSpy = jest.spyOn(res, 'send');
    
      errorHandler(error, req, res);
    
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: error.statusCode,
          message: error.message,
        })
      );
      expect(res.locals.errorMessage).toBe(error.message);
      expect(res._getData()).not.toHaveProperty('stack');
      
      // Restore original environment
      config.env = originalEnv;
    });


    test('should handle errors with deeply nested properties in errorConverter', () => {
      const deepNestedError = new Error('Deep nested error');
      let current = deepNestedError;
      for (let i = 0; i < 15; i++) {
        current.nested = { level: i };
        current = current.nested;
      }
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      errorConverter(deepNestedError, req, res, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const convertedError = next.mock.calls[0][0];
      expect(convertedError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(convertedError.message).toBe(deepNestedError.message);
      expect(convertedError.isOperational).toBe(false);
    });


    test('should handle error objects with circular references without throwing exceptions', () => {
      const error = new Error('Circular error');
      error.statusCode = httpStatus.BAD_REQUEST;
      error.self = error; // Creating a circular reference
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();
    
      expect(() => {
        errorConverter(error, req, res, next);
      }).not.toThrow();
    
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const convertedError = next.mock.calls[0][0];
      expect(convertedError.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(convertedError.message).toBe(error.message);
    });


    // test('should preserve error status and message in unrecognized environment in errorHandler', () => {
    //   const error = new ApiError(httpStatus.BAD_REQUEST, 'Bad Request');
    //   const req = httpMocks.createRequest();
    //   const res = httpMocks.createResponse();
    //   const sendSpy = jest.spyOn(res, 'send');
    
    //   // Set environment to unrecognized value
    //   config.env = 'staging';
    
    //   errorHandler(error, req, res);
    
    //   expect(sendSpy).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       code: error.statusCode,
    //       message: error.message,
    //     })
    //   );
    //   expect(res.locals.errorMessage).toBe(error.message);
    //   expect(res._getData()).not.toHaveProperty('stack');
    // });


    // test('should convert number error to ApiError with statusCode 500 in errorConverter', () => {
    //   const error = 404;
    //   const req = httpMocks.createRequest();
    //   const res = httpMocks.createResponse();
    //   const next = jest.fn();
    
    //   errorConverter(error, req, res, next);
    
    //   expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //   const convertedError = next.mock.calls[0][0];
    //   expect(convertedError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    //   expect(convertedError.message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
    //   expect(convertedError.isOperational).toBe(false);
    // });


    // test('should convert string error to ApiError with statusCode 500 in errorConverter', () => {
    //   const error = "Simple error string";
    //   const req = httpMocks.createRequest();
    //   const res = httpMocks.createResponse();
    //   const next = jest.fn();
    
    //   errorConverter(error, req, res, next);
    
    //   expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    //   const convertedError = next.mock.calls[0][0];
    //   expect(convertedError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    //   expect(convertedError.message).toBe(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
    //   expect(convertedError.isOperational).toBe(false);
    // });
  });
});
