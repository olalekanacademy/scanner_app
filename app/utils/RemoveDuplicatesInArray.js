export const removeDuplicates = (arr) => {
  const uniqueObjects = {};
  const result = [];

  arr.forEach((item) => {
    const key = `${item.barcode}-${item.code}`;
    if (!uniqueObjects[key]) {
      uniqueObjects[key] = true;
      result.push(item);
    }
  });

  return result;
};
