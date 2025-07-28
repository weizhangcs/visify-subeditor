import localForage from 'localforage';

export const useLoadFonts = () => {
  const fontsLoading = ref(false);
  const fontsError = ref(null);

  const setFontFace = async (family, arrayBuffer) => {
    if (typeof arrayBuffer === 'string') {
      const fetchArrayBuffer = await (await fetch(arrayBuffer)).arrayBuffer();
      const font = new FontFace(family, fetchArrayBuffer);
      await font.load();
      document.fonts.add(font);
      return fetchArrayBuffer;
    } else {
      const font = new FontFace(family, arrayBuffer);
      await font.load();
      document.fonts.add(font);
      return arrayBuffer;
    }
  };

  const load = async (font) => {
    const config = useAppConfig();

    const fontsStorage = localForage.createInstance({
      driver: localForage.INDEXEDDB,
      name: 'aimu.app',
      storeName: 'fonts',
    });

    const path = `${config.PATH.FONTS}/${font.path}`;
    const blob = await fontsStorage.getItem(font.name);

    if (blob) {
      if (blob && blob.arrayBuffer) {
        const arrayBuffer = await blob.arrayBuffer();
        await setFontFace(font.name, arrayBuffer);
        return arrayBuffer;
      } else {
        const arrayBuffer = await setFontFace(font.name, path);
        await fontsStorage.setItem(font.name, new Blob([arrayBuffer]));
        return arrayBuffer;
      }
    } else {
      const arrayBuffer = await setFontFace(font.name, path);
      await fontsStorage.setItem(font.name, new Blob([arrayBuffer]));
      return arrayBuffer;
    }
  };

  const loadFonts = async (fontnames = []) => {
    if (import.meta.server) return [];

    fontsLoading.value = true;
    fontsError.value = null;

    try {
      const { FONTS } = useAppConfig();

      if (window.FontFace && window.indexedDB) {
        if (fontnames.length) {
          const result = [];
          for (let index = 0; index < fontnames.length; index++) {
            const fontname = fontnames[index];
            const font = FONTS.find((item) => item.name === fontname);
            if (font) {
              const buffer = await load(font);
              result.push({ buffer, ...font });
            }
          }
          return result;
        } else {
          const result = [];
          for (let index = 0; index < FONTS.length; index++) {
            try {
              const font = FONTS[index];
              const buffer = await load(font);
              result.push({ buffer, ...font });
            } catch (error) {
              console.warn('Loading Font Error', error);
            }
          }
          return result;
        }
      }
      return [];
    } catch (error) {
      fontsError.value = error;
      return [];
    } finally {
      fontsLoading.value = false;
    }
  };

  return {
    loadFonts,
    fontsLoading,
    fontsError,
  };
};
