
const privates = new WeakMap();

export default class PatternMap {

  constructor() {
    const _ = Object.create(null);
    privates.set(this, _);
  }

  set(path, value) {
    let _ = privates.get(this);
    for (const step of path) {
      if (!_.children) {
        _.children = new Map();
      }
      let child = _.children.get(step);
      if (!child) {
        child = new PatternMap();
        _.children.set(step, child);
      }
      _ = privates.get(child);
    }
    _.value = value;
    _.hasValue = true;
  }

  get(path) {
    let _ = privates.get(this);
    for (const step of path) {
      if (!_.children) {
        return undefined;
      }
      let child = _.children.get(step);
      if (!child && Number.isInteger(step) && step >= 0) {
        child = _.children.get('$index');
      }
      if (!child) {
        child = _.children.get('$key');
      }
      if (!child) {
        return undefined;
      }
      _ = privates.get(child);
    }
    return _.value;
  }
}
