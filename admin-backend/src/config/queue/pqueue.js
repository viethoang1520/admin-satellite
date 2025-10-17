let queue;

(async () => {
  const { default: PQueue } = await import('p-queue');
  queue = new PQueue({
    concurrency: 10,
    interval: 60000,
    intervalCap: 40,
    carryoverConcurrencyCount: true,
  });
})();

module.exports = () => {
  if (!queue) {
    throw new Error('Queue is not initialized yet. Please wait for initialization.');
  }
  return queue;
};