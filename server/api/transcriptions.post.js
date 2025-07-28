import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';
import { splitSegments } from '~/utils/transcription';

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

async function fetchTranscription({ url, token, formData }) {
  const response = await axios.request({
    method: 'post',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: 'Bearer ' + token,
      ...formData.getHeaders(),
    },
    data: formData,
  });
  return response.data;
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const config = useRuntimeConfig();
    const openaiApiKey = query.openaiApiKey || config.openaiApiKey;
    const openaiApiUrl = query.openaiApiUrl || config.openaiApiUrl;

    if (!openaiApiKey) {
      throw createError({
        statusCode: 500,
        message: 'OpenAI API KEY is missing in .env or API options',
      });
    }

    if (!openaiApiUrl) {
      throw createError({
        statusCode: 500,
        message: 'OpenAI API URL is missing in .env or API options',
      });
    }

    const formData = await readMultipartFormData(event);

    if (!formData || !formData[0]) {
      throw createError({
        statusCode: 400,
        message: `Audio file is required`,
      });
    }

    const file = formData[0];
    const openaiFormData = new FormData();
    const audioStream = bufferToStream(file.data);
    openaiFormData.append('file', audioStream, {
      filename: file.filename || 'audio.mp3',
      contentType: file.type || 'audio/mp3',
    });
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('response_format', 'verbose_json');

    const result = await fetchTranscription({
      url: openaiApiUrl,
      token: openaiApiKey,
      formData: openaiFormData,
    });

    return splitSegments(result);
  } catch (error) {
    console.error(error);

    const message =
      error.response?.data?.error?.message ||
      error.message ||
      `Internal Server Error`;

    throw createError({
      statusCode: error.statusCode || 500,
      message: message,
    });
  }
});
