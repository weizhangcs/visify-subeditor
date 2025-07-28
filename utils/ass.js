export const ASS_COLOR =
  /&H([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/;

export function zfill(x, size) {
  let str = String(x);
  while (str.length < size) str = '0' + str;
  return str;
}

export function alphaToNum(val) {
  return parseInt(val.match(/&H(.{2})/)[1], 16);
}

export function readColor(assColorString) {
  const _a = ASS_COLOR.exec(assColorString);
  const a = 1;
  const b = _a[2];
  const g = _a[3];
  const r = _a[4];

  return {
    a: parseInt(a, 16),
    b: parseInt(b, 16),
    g: parseInt(g, 16),
    r: parseInt(r, 16),
  };
}

export function colorToAss(color) {
  const a = 0;
  const b = color.b;
  const g = color.g;
  const r = color.r;

  return (
    '&H' +
    [a, b, g, r]
      .map(function (x) {
        return zfill(x.toString(16).toUpperCase(), 2);
      })
      .join('')
  );
}

export function colorToHtml(color) {
  const r = color.r;
  const g = color.g;
  const b = color.b;

  return (
    '#' +
    [r, g, b]
      .map(function (x) {
        return zfill(x.toString(16), 2);
      })
      .join('')
  );
}

export function getPreviewSize(fontSize) {
  const taskStore = useTaskStore();
  if (taskStore.videoHeight) {
    return Math.ceil((fontSize / 360) * taskStore.videoHeight);
  }
}

export function getBackColour(val) {
  const hex = val.match(/&H(.{2})/)[1];
  const BackColourRate = 100 - (parseInt(hex, 16) / 255) * 100;
  return `rgb(0 0 0 / ${BackColourRate}%)`;
}

export function assToCss(ass) {
  const rules = {
    Fontname: {
      name: 'fontFamily',
      callback: (val) => `"${val}"`,
    },
    Fontsize: {
      name: 'fontSize',
      callback: (val) => `${getPreviewSize(val) || val}px`,
    },
    Spacing: {
      name: 'letterSpacing',
      callback: (val) => `${getPreviewSize(val) || val}px`,
    },
    MarginV: {
      name: 'marginBottom',
      callback: (val) => {
        const taskStore = useTaskStore();
        const MarginV = getPreviewSize(val * 1.2) + taskStore.videoBottom;
        return `${MarginV || val}px`;
      },
    },
    PrimaryColour: {
      name: 'color',
      callback: (val) => colorToHtml(readColor(val)),
    },
    SecondaryColour: {
      name: 'secondaryColor',
      callback: (val) => colorToHtml(readColor(val)),
    },
    OutlineColour: {
      name: 'textShadow',
      callback: () => {
        const { BorderStyle, BackColour, Shadow } = ass;
        let shadowStyle = '';
        const hasShadow = BorderStyle === 1;
        if (hasShadow) {
          const shadowColour = getBackColour(BackColour);
          const shadowSize = getPreviewSize(Shadow);
          shadowStyle = `${shadowColour} ${shadowSize}px ${shadowSize}px 0`;
          for (let i = 1; i < shadowSize; i++) {
            shadowStyle += `,${shadowColour} ${shadowSize - i}px ${shadowSize - i}px 0`;
          }
        }
        return hasShadow ? shadowStyle : '';
      },
    },
    SecondaryOutlineColour: {
      name: 'secondaryTextShadow',
      callback(val) {
        return rules.OutlineColour.callback(val);
      },
    },
    Bold: {
      name: 'fontWeight',
      callback: (val) => {
        if (val) {
          return 'bold';
        }
        return 'normal';
      },
    },
    Italic: {
      name: 'fontStyle',
      callback: (val) => {
        if (val) {
          return 'italic';
        }
        return 'normal';
      },
    },
    BackColour: {
      name: 'backgroundColor',
      callback: (val) => {
        return ass.BorderStyle === 4 ? getBackColour(val) : '';
      },
    },
    Outline: {
      name: '--outline-size',
      callback: (val) => {
        const outlineSize = getPreviewSize(val) + 1;
        return `${outlineSize}px`;
      },
    },
  };

  return Object.keys(rules).reduce((result, key) => {
    const ruleVal = rules[key];
    const assVal = ass[key];
    if (assVal) {
      result[ruleVal.name] = ruleVal.callback(assVal);
    }
    return result;
  }, {});
}
