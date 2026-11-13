const assert = require('node:assert/strict');
const {test} = require('node:test');
const groups = require('../src/data/monitoringPlans.json');

// The pricing page reads row.values.startup, .scale and .enterprise with no guard.
const PLANS = ['startup', 'scale', 'enterprise'];
const rows = groups.flatMap((group) => group.rows);

test('plan matrix has 4 groups and 16 rows', () => {
  assert.equal(groups.length, 4);
  assert.equal(rows.length, 16);
});

test('every row has a value for each plan and no other key', () => {
  for (const row of rows) {
    assert.deepEqual(Object.keys(row.values).sort(), [...PLANS].sort(), row.feature);
    for (const plan of PLANS) {
      const value = row.values[plan];
      const ok = typeof value === 'boolean' || (typeof value === 'string' && value.trim() !== '');
      assert.ok(ok, `${row.feature} / ${plan}: ${JSON.stringify(value)}`);
    }
  }
});

test('feature names are unique', () => {
  const names = rows.map((row) => row.feature);
  assert.equal(new Set(names).size, names.length);
});
