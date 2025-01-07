import epub from 'epub-gen';

export async function POST(req: Request) {
  const { text } = await req.json();
}
