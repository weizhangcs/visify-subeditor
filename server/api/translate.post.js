export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const config = useRuntimeConfig();
    const deepLApiKey = query.deepLApiKey || config.deepLApiKey;
    const deepLApiUrl = query.deepLApiUrl || config.deepLApiUrl;

    if (!deepLApiKey) {
      throw createError({
        statusCode: 500,
        message: 'DeepL API KEY is missing in .env or API options',
      });
    }

    if (!deepLApiUrl) {
      throw createError({
        statusCode: 500,
        message: 'DeepL API URL is missing in .env or API options',
      });
    }

    const body = await readBody(event);
    const { text, target_lang } = body;

    const data = await $fetch(deepLApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${deepLApiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        text: [text],
        target_lang: target_lang,
      },
    });

    return data.translations[0].text;
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal Server Error',
    });
  }
});
