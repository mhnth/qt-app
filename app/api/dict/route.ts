export const dynamic = 'force-static';

import { getAllWords } from '@/lib/server/services';

export async function GET() {
  console.log('get api');

  const data = await getAllWords();

  return Response.json({ data });
}
