import { ChangeEvent, FormEvent, useState } from 'react';
import { decodeStreamToJson, getStream } from '../utils/streams';
import { UseChatStreamChatMessage, UseChatStreamInput } from '../types';
import { getJsonObjectsFromChunks } from '../utils/json';

const BOT_ERROR_MESSAGE = 'Something went wrong fetching AI response.';

const useChatStream = (input: UseChatStreamInput) => {
  const [messages, setMessages] = useState<UseChatStreamChatMessage[]>([]);
  const [formInput, setFormInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => {
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

  const fetchAndUpdateAIResponse = async (message: string, useMetadata: boolean) => {
    const charactersPerSecond = input.options.fakeCharactersPerSecond;
    const stream = await getStream(message, input.options, input.method);
    const initialMessage = addMessage({ content: '', role: 'bot' });
    let response = '';
    let metadata = null;

    const processContent = async (content: string) => {
      if (!charactersPerSecond) {
        appendMessageToChat(content);
        response += content;
        return;
      }

      for (const char of content) {
        appendMessageToChat(char);
        response += char;

        if (charactersPerSecond > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 / charactersPerSecond));
        }
      }
    };

    for await (const chunk of decodeStreamToJson(stream)) {
      if (useMetadata) {
        const jsonObjects = getJsonObjectsFromChunks(chunk);

        for (const parsedChunk of jsonObjects) {
          if (parsedChunk.type === 'content') {
            await processContent(parsedChunk.data);
          } else if (parsedChunk.type === 'metadata') {
            metadata = parsedChunk.data;
          }
        }
      } else {
        await processContent(chunk);
      }
    }

    return { ...initialMessage, content: response, ...(useMetadata && { metadata }) };
  };

  const submitMessage = async (message: string) => resetInputAndGetResponse(message);

  const resetInputAndGetResponse = async (message?: string) => {
    setIsStreaming(true);
    const addedMessage = addMessage({ content: message ?? formInput, role: 'user' });
    await input.handlers.onMessageAdded?.(addedMessage);
    setFormInput('');

    try {
      const addedMessage = await fetchAndUpdateAIResponse(
        message ?? formInput,
        input.options.useMetadata ?? false,
      );
      await input.handlers.onMessageAdded?.(addedMessage);
    } catch {
      const addedMessage = addMessage({ content: BOT_ERROR_MESSAGE, role: 'bot' });
      await input.handlers.onMessageAdded?.(addedMessage);
    } finally {
      setIsStreaming(false);
    }
  };

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
