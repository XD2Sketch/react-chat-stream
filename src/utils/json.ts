/**
 * Extracts JSON objects from a string containing one or more dumps of JSON objects.
 *
 * This function is used to parse the stream only when the `useMetadata` option is enabled.
 * Then, this hook expects to receive JSON dumps instead of plain text. These JSON dumps are of
 * the following format:
 *
 * - For content to be used in the chat:
 * ```json
 * {
 *   "type": "content",
 *   "data": "Hello, world!"
 * }
 * ```
 *
 * - For metadata:
 * ```json
 * {
 *   "type": "metadata",
 *   "data": {
 *     "key": "value",
 *     "key2": "value2",
 *     ...
 *   }
 * }
 * ```
 *
 * @param chunk - The string containing one or more JSON object dumps.
 * @returns An array of parsed JSON objects.
 *
 * @example
 * ```typescript
 * const chunk = '{"type": "content", "data": "Hello, world!"}{"type": "metadata", "data": {"key": "value"}}';
 * const jsonObjects = getJsonObjectsFromChunks(chunk);
 * console.log(jsonObjects);
 * // Output: [
 * //   { type: 'content', data: 'Hello, world!' },
 * //   { type: 'metadata', data: { key: 'value' } }
 * // ]
 * ```
 */
export const getJsonObjectsFromChunks = (chunk: string) => {
  const jsonObjects = [];
  const braceStack = [];
  let currentJsonStart = null;

  for (let i = 0; i < chunk.length; i++) {
    const char = chunk[i];

    if (char === '{') {
      if (braceStack.length === 0) {
        currentJsonStart = i;
      }
      braceStack.push('{');
    } else if (char === '}') {
      braceStack.pop();
      if (braceStack.length === 0 && currentJsonStart !== null) {
        const potentialJson = chunk.substring(currentJsonStart, i + 1);
        try {
          const parsedJson = JSON.parse(potentialJson);
          jsonObjects.push(parsedJson);
        } catch {}
        currentJsonStart = null;
      }
    }
  }

  return jsonObjects;
};
