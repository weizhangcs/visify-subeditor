import clamp from 'lodash/clamp';
import DT from 'duration-time-conversion';

export class Sub {
  constructor({
    _id = '',
    start = '',
    end = '',
    mark = false,
    preset = '',
    text = '',
    text2 = '',
    startTime = null,
    endTime = null,
  }) {
    this._id = _id || generateUUID();
    this.start = start;
    this.end = end;
    this.mark = mark;
    this.preset = preset;
    const config = useAppConfig();
    const { MAX_SUB_WORD } = config.OPTION;
    this.text = text.slice(0, MAX_SUB_WORD);
    this.text2 = text2.slice(0, MAX_SUB_WORD);
    if (typeof startTime === 'number') this.startTime = startTime;
    if (typeof endTime === 'number') this.endTime = endTime;
  }

  static get tmp() {
    return new Sub({
      startTime: 0,
      endTime: 1,
      text: 'text',
    });
  }

  merge(sub) {
    this.text = this.text.trim() + '\n' + sub.text.trim();
    this.text2 = this.text2.trim() + '\n' + sub.text2.trim();
    this.start = DT.d2t(Math.min(this.startTime, sub.startTime));
    this.end = DT.d2t(Math.max(this.endTime, sub.endTime));
    return this;
  }

  get check() {
    const config = useAppConfig();
    const { MAX_SUB_WORD } = config.OPTION;
    return (
      this.startTime >= 0 &&
      this.endTime >= 0 &&
      this.startTime < this.endTime &&
      this.text.length <= MAX_SUB_WORD &&
      this.text2.length <= MAX_SUB_WORD
    );
  }

  get clone() {
    return new Sub(this);
  }

  get startTime() {
    return DT.t2d(this.start);
  }

  set startTime(time) {
    this.start = DT.d2t(clamp(time, 0, Infinity));
  }

  get endTime() {
    return DT.t2d(this.end);
  }

  set endTime(time) {
    this.end = DT.d2t(clamp(time, 0, Infinity));
  }

  get duration() {
    return parseFloat((this.endTime - this.startTime).toFixed(3));
  }
}
