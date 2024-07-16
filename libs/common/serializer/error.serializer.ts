import * as util from 'util';
import SerializedError from './serialized-error.interface';

export default function errorSerializer(
  error: Error & {
    functionName?: string;
    fileName?: string;
  },
): SerializedError {
  return {
    type: error.constructor.name,
    message: error.message,
    stack: error.stack,
    inspected: util.inspect(error, { depth: Infinity }),
    functionName: error.functionName,
    fileName: error.fileName,
  };
}
