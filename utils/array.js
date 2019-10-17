function getSortIndexes(array) {
  let result = []
  for (let i = 0; i < array.length; i++) {
    result[i] = { index: i, value: array[i] }
  }
  result.sort((a, b) => {
    if (a.value <= b.value) return -1
    else return 1
  })
  for (let i = 0; i < result.length; i++) {
    result[i] = result[i].index
  }
  return result
}

function sortByIndexes(array, indexes) {
  let sortedArray = []
  indexes.forEach(index => {
    sortedArray.push(array[index])
  })
  return sortedArray
}

function reverseSortByIndexes(array, indexes) {
  let sortedArray = []
  indexes.forEach((index, i) => {
    sortedArray[index] = array[i]
  })
  return sortedArray
}

module.exports = {
  getSortIndexes,
  sortByIndexes,
  reverseSortByIndexes
}