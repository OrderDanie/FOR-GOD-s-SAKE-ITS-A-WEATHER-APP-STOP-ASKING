const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDaySummary } = require('../app.js');

test('buildDaySummary returns a structured weather summary', () => {
  const result = buildDaySummary({
    tempC: 26,
    feelsLikeC: 28,
    humidity: 68,
    windKph: 18,
    rainChance: 42,
    conditions: 'Partly cloudy',
  });

  assert.equal(result.label, 'Partly cloudy');
  assert.equal(result.recommendation, 'light clothes, easy day');
  assert.equal(result.summary.includes('Looks warm and comfy outside.'), true);
  assert.equal(typeof result.score, 'number');
  assert.ok(result.score >= 0 && result.score <= 10);
});
