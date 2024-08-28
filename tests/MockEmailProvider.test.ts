import { MockEmailProvider1 } from '../src/MockEmailProvider1';
import { MockEmailProvider2 } from '../src/MockEmailProvider2';

describe('MockEmailProviders', () => {
    let provider1: MockEmailProvider1;
    let provider2: MockEmailProvider2;

    beforeEach(() => {
        provider1 = new MockEmailProvider1();
        provider2 = new MockEmailProvider2();
    });

    it('should fail sending email with MockEmailProvider1', async () => {
        const email = 'test@example.com';
        await expect(provider1.send(email)).rejects.toThrow('MockEmailProvider1: Failed to send email.');
    });

    it('should succeed sending email with MockEmailProvider2', async () => {
        const email = 'test@example.com';
        await expect(provider2.send(email)).resolves.toBeUndefined();
    });
});
