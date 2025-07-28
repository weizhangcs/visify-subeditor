import cloneDeep from 'lodash/cloneDeep';

export const ASS_KEYS = [
  'Name',
  'Fontname',
  'Fontsize',
  'PrimaryColour',
  'SecondaryColour',
  'OutlineColour',
  'BackColour',
  'Bold',
  'Italic',
  'Underline',
  'StrikeOut',
  'ScaleX',
  'ScaleY',
  'Spacing',
  'Angle',
  'BorderStyle',
  'Outline',
  'Shadow',
  'Alignment',
  'MarginL',
  'MarginR',
  'MarginV',
  'Encoding',
];

export function toSubTime(str) {
  let n = [];
  let sx = '';
  let x = str.split(/[:.]/).map((x) => Number(x));
  x = str.split(/[:.]/).map((x) => Number(x));
  x[3] = '0.' + ('00' + x[3]).slice(-3);
  sx = (x[0] * 60 * 60 + x[1] * 60 + x[2] + Number(x[3])).toFixed(2);
  sx = sx.toString().split('.');
  n.unshift(sx[1]);
  sx = Number(sx[0]);
  n.unshift(('0' + (sx % 60).toString()).slice(-2));
  n.unshift(('0' + (Math.floor(sx / 60) % 60).toString()).slice(-2));
  n.unshift((Math.floor(sx / 3600) % 60).toString());
  return n.slice(0, 3).join(':') + '.' + n[3];
}

export function sub2ass(task) {
  const { subtitle, style, presets = [] } = cloneDeep(task);

  return `
[Script Info]
; // 此字幕由爱幕生成
Synch Point:1
ScriptType:v4.00+
Collisions:Normal

[V4+ Styles]
Format: ${ASS_KEYS.join(', ')}
Style: ${ASS_KEYS.map((key) => style[key]).join(', ')}
${presets.map((preset) => `Style: ${ASS_KEYS.map((key) => preset[key]).join(', ')}`).join('\n')}

[Events]
Format: Layer, Start, End, Style, Actor, MarginL, MarginR, MarginV, Effect, Text
${subtitle
    .map((item) => {
      // 新增：直接从新数据模型获取数据
      const speaker = (item.speaker || '').trim();
      const dialogueText = (item.text || '').trim();

      const start = toSubTime(item.start);
      const end = toSubTime(item.end);
      const assText = dialogueText.replace(/\r?\n/g, '\\N');
      const preset = item.preset || 'Default';
      return `Dialogue: 0,${start},${end},${preset},${speaker},0000,0000,0000,,${assText}`;
    })
    .join('\n')}
    `.trim();
}

export function ass2vtt(ass) {
  const re_ass = new RegExp(
    'Dialogue:\\s\\d,' +
      '(\\d+:\\d\\d:\\d\\d.\\d\\d),' +
      '(\\d+:\\d\\d:\\d\\d.\\d\\d),' +
      '([^,]*),' +
      '([^,]*),' +
      '(?:[^,]*,){4}' +
      '([\\s\\S]*)$',
    'i',
  );

  function fixTime(time = '') {
    return time
      .split(/[:.]/)
      .map((item, index, arr) => {
        if (index === arr.length - 1) {
          if (item.length === 1) {
            return '.' + item + '00';
          } else if (item.length === 2) {
            return '.' + item + '0';
          }
        } else {
          if (item.length === 1) {
            return (index === 0 ? '0' : ':0') + item;
          }
        }

        return index === 0
          ? item
          : index === arr.length - 1
            ? '.' + item
            : ':' + item;
      })
      .join('');
  }

  return (
    'WEBVTT\n\n' +
    ass
      .split(/\r?\n/)
      .map((line) => {
        const m = line.match(re_ass);
        if (!m) return null;
        return {
          start: fixTime(m[1].trim()),
          end: fixTime(m[2].trim()),
          text: m[5]
            .replace(/{[\s\S]*?}/g, '')
            .replace(/(\\N)/g, '\n')
            .trim()
            .split(/\r?\n/)
            .map((item) => item.trim())
            .join('\n'),
        };
      })
      .filter((line) => line)
      .map((line, index) => {
        if (line) {
          return (
            index +
            1 +
            '\n' +
            line.start +
            ' --> ' +
            line.end +
            '\n' +
            line.text
          );
        } else {
          return '';
        }
      })
      .filter((line) => line.trim())
      .join('\n\n')
  );
}

export function fixSrt(srt) {
  return srt.replace(/(\d\d:\d\d:\d\d)[,.](\d+)/g, (_, $1, $2) => {
    let ms = $2.slice(0, 3);
    if ($2.length === 1) {
      ms = $2 + '00';
    }
    if ($2.length === 2) {
      ms = $2 + '0';
    }
    return `${$1},${ms}`;
  });
}

export function srt2vtt(srt) {
  return 'WEBVTT \r\n\r\n'.concat(
    fixSrt(srt)
      .replace(/\{\\([ibu])\}/g, '</$1>')
      .replace(/\{\\([ibu])1\}/g, '<$1>')
      .replace(/\{([ibu])\}/g, '<$1>')
      .replace(/\{\/([ibu])\}/g, '</$1>')
      .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2')
      .replace(/{[\s\S]*?}/g, '')
      .concat('\r\n\r\n'),
  );
}

export function fixSub(subs = []) {
  const result = [];

  for (let index = 0; index < subs.length; index++) {
    const sub = subs[index];

    if (sub.startTime >= sub.endTime) {
      continue;
    }

    if (index === 0) {
      result.push(sub);
      continue;
    }

    const prev = result[result.length - 1];
    const subTime = sub.endTime - sub.startTime;
    const prevDiff = sub.startTime - prev.endTime;

    if (prevDiff < 0) {
      if (prevDiff >= -0.5 && subTime >= 1) {
        sub.startTime = prev.endTime;
      } else {
        prev.merge(sub);
        continue;
      }
    }

    result.push(sub);
  }

  return result;
}

export function url2sub(url) {
  return new Promise((resolve) => {
    const $video = document.createElement('video');
    const $track = document.createElement('track');
    $track.default = true;
    $track.kind = 'metadata';
    $video.appendChild($track);
    $track.onerror = () => resolve([]);
    $track.onload = () => {
      resolve(
        fixSub(
          Array.from($track.track.cues)
            .map((item) => {
              const startTime = item.startTime;
              const endTime = item.endTime;
              const text = item.text;
              return new Sub({ startTime, endTime, text });
            })
            .filter((item) => item.check),
        ),
      );
    };
    $track.src = url;
  });
}

export function vtt2url(vtt) {
  return URL.createObjectURL(
    new Blob([vtt], {
      type: 'text/vtt',
    }),
  );
}

export function file2sub(file) {
  return new Promise((resolve) => {
    async function handle(result) {
      const ext = getFileFormat(file.name);
      if (ext === 'json') {
        try {
          const sub = JSON.parse(result)
            .map((item) => new Sub(item))
            .filter((item) => item.check);
          resolve(sub);
        } catch {
          resolve([]);
        }
      } else {
        const text = result.replace(/{[\s\S]*?}/g, '');
        switch (ext) {
          case 'vtt': {
            const url = vtt2url(text);
            const sub = await url2sub(url);
            resolve(sub);
            break;
          }
          case 'ass': {
            const vtt = ass2vtt(text);
            const url = vtt2url(vtt);
            const sub = await url2sub(url);
            resolve(sub);
            break;
          }
          case 'srt': {
            const vtt = srt2vtt(text);
            const url = vtt2url(vtt);
            const sub = await url2sub(url);
            resolve(sub);
            break;
          }
          default:
            resolve([]);
            break;
        }
      }
    }

    let tryGB2312 = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result.includes('��') && !tryGB2312) {
        tryGB2312 = true;
        reader.readAsText(file, 'GB2312');
      } else {
        handle(reader.result);
      }
    };

    reader.readAsText(file);
  });
}

export function sub2vtt(sub, mode) {
  return (
    'WEBVTT\n\n' +
    sub
      .map((item, index) => {
        const text =
          mode === 2
            ? item.text
            : mode === 3
              ? item.text2
              : item.text + '\n' + item.text2;
        return index + 1 + '\n' + item.start + ' --> ' + item.end + '\n' + text;
      })
      .join('\n\n')
  );
}

export function sub2srt(sub, mode) {
  return sub
    .map((item, index) => {
      const text =
        mode === 2
          ? item.text
          : mode === 3
            ? item.text2
            : item.text + '\n' + item.text2;
      return `${index + 1}\n${item.start.replace('.', ',')} --> ${item.end.replace('.', ',')}\n${text}`;
    })
    .join('\n\n');
}

export function sub2txt(sub, mode) {
  return sub
    .map((item) => {
      const text =
        mode === 2
          ? item.text
          : mode === 3
            ? item.text2
            : item.text + '\n' + item.text2;
      return text;
    })
    .join('\n\n');
}
