# @magicul/react-chat-stream

![npm bundle size](https://img.shields.io/bundlephobia/min/@magicul/react-chat-stream)
![npm](https://img.shields.io/npm/dt/react-chat-stream)
![GitHub issues](https://img.shields.io/github/issues/XD2Sketch/react-chat-stream)
![npm](https://img.shields.io/npm/v/@magicul/react-chat-stream)
![GitHub Repo stars](https://img.shields.io/github/stars/XD2Sketch/react-chat-stream?style=social)

Introducing @magicul/react-chat-stream, a highly flexible and powerful
React hook designed to simplify the integration of your own AI-driven
chat streaming API, such as ChatGPT, in your React applications. With
this modern tool, developers can effortlessly build interactive and
dynamic chat interfaces that provide real-time response from AI
models.

## Installation

Install this package with `npm`

```bash
npm i @magicul/react-chat-stream
```

Or with `yarn`

```bash
yarn add @magicul/react-chat-stream
```

## Using your own API to stream back chat-like responses (similar to ChatGPT).

With the `useChatStream` hook, you can easily integrate your own API
to stream chat responses. Responses from your backend will appear word-by-word to give it a ChatGPT-like user experience. The following example demonstrates how to
use the hook to integrate your own API that streams back the results

```tsx
import React from 'react';
import useChatStream from '@magicul/react-chat-stream';

function App() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit
  } = useChatStream({
    options: {
      url: 'https://your-api-url',
      method: 'POST',
    },
    // This means that the user input will be sent as the body of the request with the key 'prompt'.
    method: {
      type: 'body',
      key: 'prompt',
    }
  });

  return (
    <div>
      {messages.map((message, index) => (
        <div key={message.id}>
          <p>{message.role}: {message.content}</p>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input type="text" onChange={handleInputChange}
               value={input} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
```

The `useChatStream` hook provides a variable named `messages`. This
messages variable originates from the internal state of the hook, and
it contains the chat messages that were sent and were received from
your API. These messages are delivered to your application as a
stateful array, updated in real-time as new chat messages are received
and sent. As a consumer of the hook, you can readily use the `messages`
variable in your component to display the ongoing conversation.

**Important: For this to work, your API must stream back the results
of the AI model as parts of the string you want to display.**

## API Reference

### Input:

The input of the hook is a configuration object with the following
properties:

#### options

- url: `string` - the URL of the API endpoint.
- method: `'GET' | 'POST'` - the HTTP method to use.
- query: `object (optional)` - the query parameters to send with the
  request.
- headers: `object (optional)` - the headers to include in the
  request.
- body: `object (optional)` - the body of the request.

#### method

- type: `'body' | 'query'` - where to include the user's input in the
  request.
- key: `string` - the key of the input in the request.

### Output:

The output of this hook is an object with the following properties:

- messages: `Array<ChatMessage>` - an array of chat messages. Each
  message is an object with an `id` (can be used as a key in the
  loop), `role` ('bot' or 'user') and `content` (
  the content of the message).
- input: `string` - the current user input, you can use this value as
  the form input value.
- handleInputChange: `function` - a function to handle the change
  event of the input field. Pass it to the onChange prop of your input
  field.
- handleSubmit: `function` - a function to handle the submit event of
  the form. Pass it to the onSubmit prop of your form.
- isLoading: `boolean` - a boolean indicating whether the request is
  in progress.

## Important Notes:

For those utilizing Next.js version 13 or higher as the server-side
rendering framework with React, it's crucial to incorporate the
useChatStream hook within a client component. The need for this is
driven by the hook's use of useState, which necessitates its operation
within a client component.

Transforming a regular server component into a client component is a
straightforward task. Simply add the following line at the top of your
component file:

```tsx
'use client';
```
