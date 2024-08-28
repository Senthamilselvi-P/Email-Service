import { IEmailProvider } from './EmailProvider';

export class MockEmailProvider2 implements IEmailProvider {
    async send(email: string): Promise<void> {
        // Simulate success
        return;
    }
}
