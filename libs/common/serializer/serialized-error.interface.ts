export default interface SerializedError {
  type: string;
  message: string;
  stack?: string;
  inspected: string;
  functionName?: string;
  fileName?: string;
}
