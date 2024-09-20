import useChatStream from './hooks/useChatStream';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type UseChatStreamRole = 'bot' | 'user';

export type UseChatStreamChatMessage = {
  role: UseChatStreamRole;
  content: string;
  metadata?: {};
  id: string,
}

export type UseChatStreamOptions = {
  url: string;
  method: HttpMethod;
  query?: Record<string, string>;
  headers?: HeadersInit;
  body?: Record<string, string>;
  fakeCharactersPerSecond?: number;
  useMetadata?: boolean;
}

export type UseChatStreamEventHandlers = {
  onMessageAdded: (message: UseChatStreamChatMessage) => unknown | Promise<unknown>;
}

export type UseChatStreamInputMethod = {
  type: 'body' | 'query',
  key: string;
}

export type UseChatStreamInput = {
  options: UseChatStreamOptions,
  method: UseChatStreamInputMethod,
  handlers: UseChatStreamEventHandlers,
};

export type UseChatStreamResult = ReturnType<typeof useChatStream>;
