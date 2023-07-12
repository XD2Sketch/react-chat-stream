import type {
  UseChatStreamInputMethod,
  UseChatStreamOptions
} from '../hooks/useChatStream';

const mergeInputInOptions = (input: string, options: UseChatStreamOptions, method: UseChatStreamInputMethod) => {
  options.body = options.body ?? {};
  options.query = options.query ?? {};
  (options[method.type] as Record<string, unknown>)[method.key] = input;

  return options;
};

export const getStream = async (input: string, options: UseChatStreamOptions, method: UseChatStreamInputMethod) => {
  options = mergeInputInOptions(input, options, method);

  const params = '?' + new URLSearchParams(options.query).toString();

  const response = await fetch(options.url + params, { method: options.method, headers: options.headers });

  if (!response.ok) throw new Error(response.statusText);

  return response.body;
};

export async function* decodeStreamToJson(
  data: ReadableStream<Uint8Array> | null,
) {
  if (!data) return;

  const reader = data.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    if (value) {
      try {
        yield decoder.decode(value);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
