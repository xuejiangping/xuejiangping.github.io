let a = {
  toStrFn(item) {
    let reg = /(?<=\s)\w+?(?=])/

    if (typeof item === 'number' && isNaN(item)) {
      return item.toString()
    } else {
      let res = Object.prototype.toString.call(item).match(reg)[0]
      return res ? res.toLowerCase() : ''
    }
  },
  loseloseHashCode(key) {
    console.log('key',key)
    if (typeof key === 'number') { // {1}
      return key;
    }
    const tableKey = this.toStrFn(key); // {2}
    let hash = 0; // {3}
    for (let i = 0; i < tableKey.length; i++) {
      hash += tableKey.charCodeAt(i); // {4}
    }
    return hash % 37; // {5}
  },

  hashCode(key) {
    return this.loseloseHashCode(key);
  }
}

console.log('a.hashCode()',a.hashCode('xuejiangping'))