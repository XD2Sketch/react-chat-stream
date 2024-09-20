export const extractJsonFromEnd = (chunk: string) => {
  const chunkTrimmed = chunk.trim();

  const jsonObjectRegex = /({[^]*})\s*$/;
  const match = chunkTrimmed.match(jsonObjectRegex);

  if (!match) {
    return null;
  }

  const jsonStr = match[1];
  try {
    const parsedData = JSON.parse(jsonStr);
    if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) {
      return parsedData;
    }
  } catch {}

  return null;
};
