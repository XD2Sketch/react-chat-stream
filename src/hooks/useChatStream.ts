import { ChangeEvent, FormEvent, useState } from 'react';
import { decodeStreamToJson, getStream } from '../utils/streams';
import { UseChatStreamChatMessage, UseChatStreamInput } from '../types';
import { extractJsons } from '../utils/json';

const BOT_ERROR_MESSAGE = 'Something went wrong fetching AI response.';

const useChatStream = (input: UseChatStreamInput) => {
  const [messages, setMessages] = useState<UseChatStreamChatMessage[]>([]);
  const [formInput, setFormInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
    setFormInput(e.target.value);
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    await resetInputAndGetResponse();
  };

  const addMessage = (message: Omit<UseChatStreamChatMessage, 'id'>) => {
    const messageWithId = { ...message, id: crypto.randomUUID() as string };
    setMessages(messages => [...messages, messageWithId]);

    return messageWithId;
  };

  const appendMessageToChat = (message: string) => {
    setMessages(messages => {
      const latestMessage = messages[messages.length - 1];

      return [
        ...messages.slice(0, -1),
        { ...latestMessage, content: latestMessage.content + message },
      ];
    });
  };

  const fetchAndUpdateAIResponse = async (message: string) => {
    const charactersPerSecond = input.options.fakeCharactersPerSecond;
    const stream = await getStream(message, input.options, input.method);
    const initialMessage = addMessage({ content: '', role: 'bot' });
    let response = '';

    for await (const chunk of decodeStreamToJson(stream)) {
      if (!charactersPerSecond) {
        appendMessageToChat(chunk);
        response += chunk;
        continue;
      }

      // Stream characters one by one based on the characters per second that is set.
      for (const char of chunk) {
        appendMessageToChat(char);
        response += char;

        if (charactersPerSecond > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 / charactersPerSecond));
        }
      }
    }

    return { ...initialMessage, content: response };
  };

  const fetchAndUpdateAIResponseWithMetadata = async (message: string) => {
    const charactersPerSecond = input.options.fakeCharactersPerSecond;
    const stream = await getStream(message, input.options, input.method);
    const initialMessage = addMessage({ content: '', role: 'bot' });
    let response = '';
    let metadata = null;

    for await (const chunk of decodeStreamToJson(stream)) {
      const jsonObjects = extractJsons(chunk);

      for (const parsedChunk of jsonObjects) {
        if (parsedChunk.type === 'content') {
          const content = parsedChunk.data;

          if (!charactersPerSecond) {
            appendMessageToChat(content);
            response += content;
            continue;
          }

          for (const char of content) {
            appendMessageToChat(char);
            response += char;

            if (charactersPerSecond > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000 / charactersPerSecond));
            }
          }
        } else if (parsedChunk.type === 'metadata') {
          metadata = parsedChunk.data;
        }
      }
    }

    return { ...initialMessage, content: response, metadata };
  };

  const submitMessage = async (message: string) => resetInputAndGetResponse(message);

  const resetInputAndGetResponse = async (message?: string) => {
    setIsStreaming(true);
    const addedMessage = addMessage({ content: message ?? formInput, role: 'user' });
    await input.handlers.onMessageAdded?.(addedMessage);
    setFormInput('');

    try {
      if (input.options.useMetadata) {
        const addedMessage = await fetchAndUpdateAIResponseWithMetadata(message ?? formInput);
        await input.handlers.onMessageAdded?.(addedMessage);
      } else {
        const addedMessage = await fetchAndUpdateAIResponse(message ?? formInput);
        await input.handlers.onMessageAdded?.(addedMessage);
      }
    } catch {
      const addedMessage = addMessage({ content: BOT_ERROR_MESSAGE, role: 'bot' });
      await input.handlers.onMessageAdded?.(addedMessage);
    } finally {
      setIsStreaming(false);
    }
  }

  return {
    messages,
    setMessages,
    input: formInput,
    setInput: setFormInput,
    handleInputChange,
    handleSubmit,
    submitMessage,
    isStreaming,
  };
};

export default useChatStream;
