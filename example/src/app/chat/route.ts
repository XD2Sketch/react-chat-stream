import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const prompt = searchParams.get('prompt')
  const responseText = `I don\'t know how to answer "${prompt}" yet.`;

  const response = new NextResponse(new ReadableStream({
    async start(controller) {
      let index = 0;
      const timer = setInterval(() => {
        if (index < responseText.length) {
          controller.enqueue(new TextEncoder().encode(responseText[index]));
          index++;
        } else {
          clearInterval(timer);
          controller.close();
        }
      }, 20);
    }
  }));

  response.headers.append('Content-Type', 'text/event-stream');
  response.headers.append('Cache-Control', 'no-cache');
  response.headers.append('Connection', 'keep-alive');

  return response;
}
