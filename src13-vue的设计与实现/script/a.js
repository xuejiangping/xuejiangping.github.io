function longestCommonPrefix(strs) {
  const a = strs[0]
  let max = ''
  const compareFn = (t) => strs.every(str => str.includes(t))
  for (let i = 0; i < a.length; i++) {
    // let item=a[0]
    for (let j = i,res = ''; compareFn(a[j]); j++) {
      res += a[j]
      if (res.length > max.length) max = res
    }

  }
  console.log('max',max)
  return max
}
// longestCommonPrefix(["reflower","flow","flight"])