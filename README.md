# @magicul/react-chat-stream

![npm bundle size](https://img.shields.io/bundlephobia/min/@magicul/react-chat-stream)
![npm](https://img.shields.io/npm/dt/@magicul/react-chat-stream)
![GitHub issues](https://img.shields.io/github/issues/XD2Sketch/react-chat-stream)
![npm](https://img.shields.io/npm/v/@magicul/react-chat-stream)
![GitHub Repo stars](https://img.shields.io/github/stars/XD2Sketch/react-chat-stream?style=social)

Introducing @magicul/react-chat-stream: A React hook designed to simplify integrating
chat streams returned by your backend. Let messages appear word-by-word similar to ChatGPT.

## What's this package about?

Are you building a ChatGPT-like chat interface? Then most likely you'll want to integrate a chat that has the messages appear word-by-word, similar to ChatGPT. Vercel recently released the [Vercel AI SDK](https://vercel.com/blog/introducing-the-vercel-ai-sdk#streaming-first-ui-helpers) which adds _Streaming First UI Helper_, but what if you want to integrate your own backend? This package solves exactly that pain point. We've abstracted the logic into a React Hook to take care of handling everything for you.

## How does it work?
![react-chat-stream-demo-long](https://github.com/XD2Sketch/react-chat-stream/assets/5519740/178abe91-e30c-4f33-82cd-64dd66809377)

If you're backend returns `text/event-stream` then you can use this package. This package does not "fake" this response by imitating the word-by-word appearance. It will literally take the responses from your backend as them come in through the stream. The hook provides a `messages` object which will change so you can display it as the result gets delivered.

## Installation

Install this package with `npm`

```bash
npm i @magicul/react-chat-stream
```

Or with `yarn`

```bash
yarn add @magicul/react-chat-stream
```

## Stream chat-like messages from your backend to your React app (similar to ChatGPT).

With the `useChatStream` hook, you can easily integrate your own API
to stream chat responses (`text/event-stream`). Responses from your backend will appear
word-by-word to give it a ChatGPT-like user experience. The following
example demonstrates how to use the hook to integrate your own API
that streams the results.

_Please note_: Your API has to return `text/event-stream`.

```tsx
import React from 'react';
import useChatStream from '@magicul/react-chat-stream';

function App() {
  const { messages, input, handleInputChange, handleSubmit } = useChatStream({
    options: {
      url: 'https://your-api-url',
      method: 'POST',
    },
    // This means that the user input will be sent as the body of the request with the key 'prompt'.
    method: {
      type: 'body',
      key: 'prompt',
    },
  });

  return (
    <div>
      {messages.map((message, index) => (
        <div key={message.id}>
          <p>
            {message.role}: {message.content}
          </p>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input type="text" onChange={handleInputChange} value={input} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
```

The `useChatStream` hook provides a variable named `messages`. This
`messages` variable comes from the internal state of the hook. It contains the chat message reply received from
your API. Messages are updated in real-time as the stream continues to receive messages. The `messages` variable will change and will get
appended with new messages received from your backend.

**Important: For this to work, your API must stream back the results
of the AI model as parts of the string you want to display.**

## Endpoint Requirements

The API endpoint you provide to the hook must be able to handle the
following:

- Accept a request with a JSON body or a request with a query string
  for the prompt.
- Respond with a `event/text-stream` event stream which contains the
  responses you would like to display.

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

## Examples

If you want to see a working example, check out the [example](./example)
folder for an example on how to use this package.

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
