import {
  DICT_URL,
  GITHUB_DICT_HOST,
  GITHUB_DICT_TOKEN,
} from '@/lib/server/env-server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const { contents } = await req.json();

  const fileName = 'unused.txt';

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
