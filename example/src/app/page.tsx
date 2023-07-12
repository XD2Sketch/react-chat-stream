'use client';

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
      url: 'http://localhost:3000/chat',
      method: 'GET',
    },
    method: {
      type: 'query',
      key: 'prompt',
    }
  });

  return (
    <div className="flex flex-col h-screen p-5 bg-gray-50">
      <div className="flex flex-col flex-grow overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}
               className={`p-3 rounded-lg max-w-lg ${message.role === 'bot' ? 'bg-blue-300' : 'bg-green-300 ml-auto'}`}>
            <p className="text-white">{message.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input type="text" onChange={handleInputChange}
               value={input}
               placeholder="Ask me anything..."
               className="flex-grow rounded-l-lg p-2 focus:outline-none" />
        <button type="submit" className="bg-blue-500 text-white p-2 px-4 rounded-r-lg">Send</button>
      </form>
    </div>
  );
}

export default App;
