import { DICT_URL } from '@/lib/server/env-server';

export async function GET() {
  try {
    const response = await fetch(`${DICT_URL}/Names.txt`);

    if (!response.ok) {
      throw new Error('Failed to fetch data from the third-party API');
    }

    const textData = await response.text();

    return new Response(textData, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    return new Response('Error fetching data from dict ', {
      status: 500,
    });
  }
}
