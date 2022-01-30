import { trace } from './tracer';
import { safeExecute, setSwitchOff, isValidToken } from './utils';
import * as LumigoLogger from './lumigoLogger';
import { debug } from './logger';
import { ExecutionTags } from './globals';
import startHooks from './hooks';
import { HttpSpansAgent } from './httpSpansAgent';
import * as logger from './logger';

debug('Tracer imported');

module.exports = function ({
  token,
  debug = false,
  edgeHost,
  switchOff = false,
  stepFunction = false,
}: {
  token: string;
  debug?: boolean;
  edgeHost?: string;
  switchOff?: boolean;
  stepFunction?: boolean;
}) {
  switchOff && setSwitchOff();
  let tokenToValidate = token || process.env.LUMIGO_TRACER_TOKEN;
  if (!isValidToken(tokenToValidate)) {
    logger.warnClient(`Invalid Token. Go to Lumigo Settings to get a valid token.`);
    setSwitchOff();
  }

  safeExecute(startHooks)();
  HttpSpansAgent.initAgent();

  return {
    trace: trace({
      token,
      debug,
      edgeHost,
      switchOff,
      stepFunction,
    }),
    addExecutionTag: ExecutionTags.addTag,
    info: LumigoLogger.info,
    warn: LumigoLogger.warn,
    error: LumigoLogger.error,
  };
};

Object.assign(module.exports, {
  addExecutionTag: ExecutionTags.addTag,
  info: LumigoLogger.info,
  warn: LumigoLogger.warn,
  error: LumigoLogger.error,
});

export default module.exports;
