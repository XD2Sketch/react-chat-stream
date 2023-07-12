import { ChangeEvent, FormEvent, useState } from 'react';
import { decodeStreamToJson, getStream } from '../utils/streams';
import { v4 as uuidv4 } from 'uuid';

const BOT_ERROR_MESSAGE = 'Something went wrong fetching AI response.';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ChatMessage = {
  role: 'bot' | 'user';
  content: string;
  id: string;
}

type UseChatStreamResult = {
  messages: ChatMessage[];
  input: string;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export type UseChatStreamOptions = {
  url: string;
  method: HttpMethod;
  query?: Record<string, string>;
  headers?: HeadersInit;
  body?: Record<string, string>;
}

export type UseChatStreamInputMethod = {
  type: 'body' | 'query',
  key: string;
}

type UseChatStreamInput = {
  options: UseChatStreamOptions,
  method: UseChatStreamInputMethod,
};

const useChatStream = (input: UseChatStreamInput): UseChatStreamResult => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const addMessageToChat = (message: string, role: ChatMessage['role'] = 'user') => {
    setMessages(messages => [...messages, { role, content: message, id: uuidv4() }]);
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

  const fetchAndUpdateAIResponse = async () => {
    const stream = await getStream(message, input.options, input.method);
    if (!stream) throw new Error();

    addMessageToChat('', 'bot');

    for await (const message of decodeStreamToJson(stream)) {
      appendMessageToChat(message);
    }
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e?.preventDefault();
    addMessageToChat(message);
    setMessage('');

    try {
      await fetchAndUpdateAIResponse();
    } catch {
      addMessageToChat(BOT_ERROR_MESSAGE, 'bot');
    }

    setIsLoading(false);
  };

  return {
    messages,
    input: message,
    handleInputChange,
    handleSubmit,
    isLoading,
  };
};

export default useChatStream;
