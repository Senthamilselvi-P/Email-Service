import { IEmailProvider } from './EmailProvider';

export class MockEmailProvider1 implements IEmailProvider {
    async send(email: string): Promise<void> {
        // Simulate failure
        throw new Error('MockEmailProvider1: Failed to send email.');
    }
};
