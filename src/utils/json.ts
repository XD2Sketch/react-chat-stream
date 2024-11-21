export const extractJsons = (chunk: string) => {
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
