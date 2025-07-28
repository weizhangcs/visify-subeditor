export default defineEventHandler(async (event) => {
  const { title, message } = await readBody(event);
  const t = encodeURIComponent(title);
  const m = encodeURIComponent(message);
  const BAIR_KEY = 'CWAWrgxapf4inejiSAaX4o';
  const data = await $fetch(`https://api.day.app/${BAIR_KEY}/${t}/${m}`);
  return data;
});
