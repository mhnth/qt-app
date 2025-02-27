import {
  DICT_URL,
  GITHUB_DICT_HOST,
  GITHUB_DICT_TOKEN,
} from '@/lib/server/env-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const [res_1, res_2, res_3, res_4, res_x] = await Promise.all([
      await fetch(`${DICT_URL}/names.txt`),
      await fetch(`${DICT_URL}/names_spec.txt`),
      await fetch(`${DICT_URL}/vp_names.txt`),
      await fetch(`${DICT_URL}/vp_names_spec.txt`),
      await fetch(`${DICT_URL}/names_x.txt`),
    ]);

    if (!res_1.ok || !res_2.ok || !res_3.ok || !res_4.ok || !res_x.ok) {
      throw new Error('Failed to fetch data from the third-party API');
    }

    const textData =
      (await res_1.text()) +
      '\n' +
      (await res_2.text()) +
      '\n' +
      (await res_3.text()) +
      '\n' +
      (await res_4.text()) +
      '\n' +
      (await res_x.text());

    return new Response(textData, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.log('ERR fetch data name:', error);

    return new Response('Error fetching data from dict ', {
      status: 500,
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { novelId: string } },
) {
  const { filename, contents } = await req.json();

  // const user = getSeverUser();

  // const fileName = user?.role === 'admin' ? filename : 'UserDict';

  const fileName = 'names_x.txt';

  try {
    await updateFileOnGitHub(fileName, `${contents}\n`);
  } catch (error) {
    console.log(error);
  }

  return NextResponse.json({});
}

async function getFileSHA(filename: string) {
  const response = await fetch(
    `${GITHUB_DICT_HOST}/${DICT_URL?.replace('https://', '')}/contents/${filename}`,
    {
      headers: {
        Authorization: `token ${GITHUB_DICT_TOKEN}`,
      },
    },
  );

  const data = await response.json();
  return data;
}

async function updateFileOnGitHub(filename: string, newContent: string) {
  // Get file info, includes content and SHA
  const fileInfo = await getFileSHA(filename);

  // decode current content from Base64
  // const currentContent = atob(fileInfo.content);
  const currentContent = Buffer.from(fileInfo.content, 'base64').toString(
    'utf-8',
  );

  // Add new content
  const updatedContent = currentContent + newContent;

  // encode new content Base64
  const encodedContent = Buffer.from(updatedContent, 'utf-8').toString(
    'base64',
  );

  // update on github
  const response = await fetch(
    `${GITHUB_DICT_HOST}/${DICT_URL?.replace('https://', '')}/contents/${filename}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_DICT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Appended new content to file',
        content: encodedContent,
        sha: fileInfo.sha,
        branch: 'main',
      }),
    },
  );

  const result = await response.json();
}
