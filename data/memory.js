class Memory {
  constructor() {
    this.userName = Storage.load('userName', '');
    this.context = Storage.load('context', {});
  }
  setUserName(name) {
    this.userName = name;
    Storage.save('userName', name);
  }
  updateContext(key, value) {
    this.context[key] = value;
    Storage.save('context', this.context);
  }
  getContext(key) {
    return this.context[key];
  }
}
