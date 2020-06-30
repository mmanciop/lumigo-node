import {
  extractBodyFromEmitSocketEvent,
  extractBodyFromWriteFunc,
  isValidHttpRequestBody,
} from './httpUtils';

describe('httpUtils', () => {
  test('extractBodyFromSocketEvent -> outputData flow', () => {
    const emitArg = {
      _httpMessage: {
        _hasBody: true,
        outputData: [{ data: 'HTTP BODY1\nHTTP BODY2' }],
      },
    };

    const result = extractBodyFromEmitSocketEvent(emitArg);

    expect(result).toEqual('HTTP BODY2');
  });

  test('extractBodyFromSocketEvent -> output flow', () => {
    const emitArg = {
      _httpMessage: {
        _hasBody: true,
        output: ['HTTP BODY1\nHTTP BODY2'],
      },
    };

    const result = extractBodyFromEmitSocketEvent(emitArg);

    expect(result).toEqual('HTTP BODY2');
  });

  test('extractBodyFromSocketEvent -> not crashed on bad data', () => {
    const emitArg = {
      _httpMessage: {
        _hasBody: true,
        output: -1,
      },
    };

    const result = extractBodyFromEmitSocketEvent(emitArg);

    expect(result).toEqual(undefined);
  });

  test('extractBodyFromWriteFunc -> simple flow -> write(str)', () => {
    const firstArg = 'BODY';

    const result = extractBodyFromWriteFunc([firstArg]);

    expect(result).toEqual(firstArg);
  });

  test('extractBodyFromWriteFunc -> simple flow -> write(Buffer)', () => {
    const firstArg = Buffer.from('BODY');

    const result = extractBodyFromWriteFunc([firstArg]);

    expect(result).toEqual('BODY');
  });

  test('extractBodyFromWriteFunc -> simple flow -> write(Buffer, encoding)', () => {
    const firstArg = 'BODY';
    const secArg = 'base64';

    const result = extractBodyFromWriteFunc([firstArg, secArg]);

    expect(result).toEqual('Qk9EWQ==');
  });

  test('extractBodyFromWriteFunc -> simple flow -> write(Buffer, encoding, callback)', () => {
    const firstArg = Buffer.from('BODY');
    const secArg = 'base64';
    const thirdArg = () => {};

    const result = extractBodyFromWriteFunc([firstArg, secArg, thirdArg]);

    expect(result).toEqual('BODY');
  });

  test('extractBodyFromWriteFunc -> simple flow -> write(Buffer, callback)', () => {
    const firstArg = Buffer.from('BODY');
    const secArg = () => {};

    const result = extractBodyFromWriteFunc([firstArg, secArg]);

    expect(result).toEqual('BODY');
  });

  test('extractBodyFromWriteFunc -> simple flow -> write(str, callback)', () => {
    const firstArg = 'BODY';
    const secArg = () => {};

    const result = extractBodyFromWriteFunc([firstArg, secArg]);

    expect(result).toEqual('BODY');
  });

  test('isValidHttpRequestBody - simple flow', () => {
    expect(isValidHttpRequestBody('BODY')).toEqual(true);
    expect(isValidHttpRequestBody(Buffer.from('BODY'))).toEqual(true);
  });

  test('isValidHttpRequestBody -> empty flow', () => {
    expect(isValidHttpRequestBody()).toEqual(false);
    expect(isValidHttpRequestBody('')).toEqual(false);
    expect(isValidHttpRequestBody(0)).toEqual(false);
    expect(isValidHttpRequestBody([])).toEqual(false);
    expect(isValidHttpRequestBody({})).toEqual(false);
    expect(isValidHttpRequestBody(undefined)).toEqual(false);
    expect(isValidHttpRequestBody(null)).toEqual(false);
  });
});
