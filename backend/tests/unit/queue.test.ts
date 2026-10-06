/**
 * tests/unit/queue.test.ts
 *
 * Unit tests for QueueLess queue logic:
 *  1. Token Label Generation (prefix + zero-padded 3-digit number)
 *  2. Queue ETA & Position Calculation
 *  3. Queue State Machine Transitions (Valid vs Invalid transitions)
 */

describe('QueueLess Queue Logic & State Machine', () => {
  // 1. Token Label Generation
  describe('Token Label Generator', () => {
    function generateTokenLabel(providerName: string, tokenNumber: number): string {
      const prefix = providerName.trim().charAt(0).toUpperCase() || 'Q';
      return `${prefix}-${tokenNumber.toString().padStart(3, '0')}`;
    }

    test('generates formatted token for single digit (e.g. D-001)', () => {
      expect(generateTokenLabel('Dr. Smith Healthcare Clinic', 1)).toBe('D-001');
    });

    test('generates formatted token for double digit (e.g. C-015)', () => {
      expect(generateTokenLabel('City Apex Bank', 15)).toBe('C-015');
    });

    test('generates formatted token for triple digit (e.g. M-104)', () => {
      expect(generateTokenLabel('Metropolitan DMV', 104)).toBe('M-104');
    });

    test('falls back to Q prefix if name is empty', () => {
      expect(generateTokenLabel('', 7)).toBe('Q-007');
    });
  });

  // 2. Position & ETA Calculation
  describe('Position & ETA Calculation', () => {
    function calculatePositionAndEta(waitingAhead: number, avgServiceDurationMin: number) {
      const position = waitingAhead + 1;
      const etaMinutes = position * (avgServiceDurationMin || 15);
      return { position, etaMinutes };
    }

    test('calculates correct position and ETA for first in line', () => {
      const result = calculatePositionAndEta(0, 15);
      expect(result.position).toBe(1);
      expect(result.etaMinutes).toBe(15);
    });

    test('calculates correct position and ETA for multiple waiting attendees', () => {
      const result = calculatePositionAndEta(4, 20); // 4 ahead -> position 5
      expect(result.position).toBe(5);
      expect(result.etaMinutes).toBe(100);
    });

    test('uses fallback 15 mins if avg service duration is 0 or undefined', () => {
      const result = calculatePositionAndEta(2, 0);
      expect(result.position).toBe(3);
      expect(result.etaMinutes).toBe(45);
    });
  });

  // 3. Queue State Machine Validations
  describe('Queue State Machine Transitions', () => {
    type QueueStatus = 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'SKIPPED' | 'NO_SHOW' | 'CANCELLED';

    const VALID_TRANSITIONS: Record<QueueStatus, QueueStatus[]> = {
      WAITING: ['CALLED', 'CANCELLED'],
      CALLED: ['IN_SERVICE', 'SKIPPED', 'NO_SHOW'],
      IN_SERVICE: ['COMPLETED'],
      SKIPPED: ['WAITING', 'NO_SHOW'],
      COMPLETED: [],
      NO_SHOW: [],
      CANCELLED: [],
    };

    function isValidTransition(from: QueueStatus, to: QueueStatus): boolean {
      return VALID_TRANSITIONS[from]?.includes(to) ?? false;
    }

    test('allows WAITING -> CALLED', () => {
      expect(isValidTransition('WAITING', 'CALLED')).toBe(true);
    });

    test('allows CALLED -> IN_SERVICE and CALLED -> SKIPPED', () => {
      expect(isValidTransition('CALLED', 'IN_SERVICE')).toBe(true);
      expect(isValidTransition('CALLED', 'SKIPPED')).toBe(true);
    });

    test('allows IN_SERVICE -> COMPLETED', () => {
      expect(isValidTransition('IN_SERVICE', 'COMPLETED')).toBe(true);
    });

    test('allows SKIPPED -> WAITING (requeue)', () => {
      expect(isValidTransition('SKIPPED', 'WAITING')).toBe(true);
    });

    test('rejects illegal transition: WAITING directly to COMPLETED', () => {
      expect(isValidTransition('WAITING', 'COMPLETED')).toBe(false);
    });

    test('rejects illegal transition: COMPLETED to WAITING', () => {
      expect(isValidTransition('COMPLETED', 'WAITING')).toBe(false);
    });
  });
});
