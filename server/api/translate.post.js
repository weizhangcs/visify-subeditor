// 导入 Google Cloud Translate v2 客户端库
import { Translate } from '@google-cloud/translate/build/src/v2/index.js';

// 创建一个翻译客户端实例
// 由于您已配置ADC，此处无需任何参数，库会自动寻找凭证。
const translate = new Translate();

export default defineEventHandler(async (event) => {
  try {
    const { text, target_lang } = await readBody(event);

    if (!text || !target_lang) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: text, target_lang',
      });
    }

    // 调用翻译API
    const [translations] = await translate.translate(text, target_lang);

    // Google API返回的是一个数组，我们取第一个结果
    const result = Array.isArray(translations) ? translations[0] : translations;

    return result;

  } catch (error) {
    console.error('Google Translate API Error:', error);
    throw createError({
      statusCode: error.code || 500,
      message: error.message || 'An error occurred during translation.',
    });
  }
});