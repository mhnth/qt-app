import { DICT_URL } from '@/lib/server/env-server';

export async function GET() {
  try {
    const [res_1, res_2] = await Promise.all([
      await fetch(`${DICT_URL}/VP.txt`),
      await fetch(`${DICT_URL}/VP2.txt`),
    ]);

    if (!res_1.ok || !res_2.ok) {
      throw new Error('Failed to fetch data from the third-party API');
    }

    const textData = (await res_1.text()) + '\n' + (await res_2.text());

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
