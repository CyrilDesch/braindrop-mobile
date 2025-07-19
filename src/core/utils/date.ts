const getElapsedTime = (startTime: number) => {
  return Math.floor((Date.now() - startTime) / 1000);
};

export { getElapsedTime };
