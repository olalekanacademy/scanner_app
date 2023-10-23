export const generateUniqueId = () => {
  // Generate a unique ID using timestamp and a random number
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000);
  return `${timestamp}${randomNum}`;
};
