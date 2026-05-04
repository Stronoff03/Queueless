const {
  buildEtaConfig,
  equivalentUnits,
  estimateServiceRange,
  estimateQueueWaitRange,
  formatEtaRangeLabel,
} = require('../utils/eta');

describe('ETA Utility — Unit Tests', () => {

  describe('buildEtaConfig()', () => {
    test('returns a valid config object for a 5-minute average service time', () => {
      const config = buildEtaConfig(300);
      expect(config.prepMinutes).toBeGreaterThan(0);
      expect(config.unitMinutes).toBeGreaterThan(0);
      expect(config.sigma).toBe(0.42);
    });
  });

  describe('equivalentUnits()', () => {
    test('returns item count when itemCount is provided', () => {
      const units = equivalentUnits({ itemCount: 3 });
      expect(units).toBe(3);
    });

    test('converts duration in minutes to equivalent service units', () => {
      const units = equivalentUnits({ durationMinutes: 10 });
      expect(units).toBeGreaterThan(0);
    });

    test('returns 1 as default when no valid input is given', () => {
      const units = equivalentUnits({});
      expect(units).toBe(1);
    });
  });

  describe('estimateServiceRange()', () => {
    test('returns a valid min/max range for a single service unit', () => {
      const range = estimateServiceRange(2);
      expect(range.minMinutes).toBeGreaterThan(0);
      expect(range.maxMinutes).toBeGreaterThanOrEqual(range.minMinutes);
    });
  });

  describe('estimateQueueWaitRange()', () => {
    test('accumulates wait time for multiple queue entries', () => {
      const entries = [
        { item_count: 1 },
        { product_duration_minutes: 5 },
      ];
      const range = estimateQueueWaitRange(entries);
      expect(range.minMinutes).toBeGreaterThan(0);
      expect(range.maxMinutes).toBeGreaterThanOrEqual(range.minMinutes);
    });

    test('returns zero wait time for an empty queue', () => {
      const range = estimateQueueWaitRange([]);
      expect(range.minMinutes).toBe(0);
      expect(range.maxMinutes).toBe(0);
    });
  });

  describe('formatEtaRangeLabel()', () => {
    test('returns "<1 min" when both min and max are zero', () => {
      expect(formatEtaRangeLabel(0, 0)).toBe('<1 min');
    });

    test('returns a range label when min is 0 and max is positive', () => {
      expect(formatEtaRangeLabel(0, 5)).toBe('1 - 5 min');
    });

    test('returns a single value label when min equals max', () => {
      expect(formatEtaRangeLabel(5, 5)).toBe('5 min');
    });

    test('returns a range label when min and max differ', () => {
      expect(formatEtaRangeLabel(5, 10)).toBe('5 - 10 min');
    });
  });

});
