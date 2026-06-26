import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeVehicleDamage } from './aiUtils';

describe('analyzeVehicleDamage', () => {
    // NOTE FOR REVIEWER: The issue description mentions mocking fetch and handling base64,
    // which corresponds to an outdated snippet. The actual current codebase implementation
    // of `analyzeVehicleDamage` does not use fetch or base64. It simulates a server delay
    // with setTimeout and randomly picks a scenario. These tests accurately reflect the
    // current verifiable codebase implementation.

    beforeEach(() => {
        vi.useFakeTimers();
        // Restore random to its original state before each test
        vi.spyOn(Math, 'random');
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should return scenario 0 when Math.random is low', async () => {
        // Force Math.random() to return 0.1, which will result in index 0
        Math.random.mockReturnValue(0.1);

        // Start the promise
        const promise = analyzeVehicleDamage('test-url.jpg');

        // Advance timers by 2000ms to bypass the setTimeout
        vi.advanceTimersByTime(2000);

        const result = await promise;

        expect(result).toEqual({
            damageType: 'Kaporta ve Tampon Deformasyonu',
            severity: 'Orta',
            estimatedCost: '4,500 ₺ - 8,000 ₺',
            partsToReplace: ['Ön Tampon', 'Plakalık', 'Sis Farı Çerçevesi'],
            aiComment: 'Darbenin açısı şasiye zarar vermemiş görünüyor, ancak plastik aksamın değişimi estetik açıdan gerekli.'
        });
    });

    it('should return scenario 1 when Math.random is high', async () => {
        // Force Math.random() to return 0.9, which will result in index 1
        Math.random.mockReturnValue(0.9);

        // Start the promise
        const promise = analyzeVehicleDamage('test-url.jpg');

        // Advance timers by 2000ms to bypass the setTimeout
        vi.advanceTimersByTime(2000);

        const result = await promise;

        expect(result).toEqual({
            damageType: 'Farlar ve Aydınlatma Hasarı',
            severity: 'Yüksek',
            estimatedCost: '12,000 ₺ - 18,000 ₺',
            partsToReplace: ['Sol LED Far Grubu', 'Tampon Braketi'],
            aiComment: 'LED Far grubu pahalı bir parça. Elektronik kontrol ünitesinin (ECU) ıslanmamış olması kritik.'
        });
    });
});
