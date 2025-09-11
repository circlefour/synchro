function avgChaos(deviceChaos) {
  const chaos = Array.from(deviceChaos.values());
  return chaos.length ? chaos.reduce((a, b) => a + b, 0) / chaos.length : 0;
}
module.exports = { avgChaos };
