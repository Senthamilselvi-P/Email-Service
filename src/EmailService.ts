import { IEmailProvider } from './EmailProvider';
import { MockEmailProvider1 } from './MockEmailProvider1';
import { MockEmailProvider2 } from './MockEmailProvider2';
import { Queue } from './Queue';
import { Logger } from './Logger';
import { StatusTracker } from './StatusTracker';

export class EmailService {
    private provider1 = new MockEmailProvider1();
    private provider2 = new MockEmailProvider2();
    private queue = new Queue<string>();
    private statusTracker = new StatusTracker();
    private sentEmails = new Set<string>();
    private timerId?: NodeJS.Timeout;

    constructor() {
        this.timerId = setInterval(() => this.processQueue(), 1000);
    }

    public stopProcessing(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }

    private async sendEmailWithRetry(email: string, provider: IEmailProvider, retries: number = 3): Promise<void> {
        for (let i = 0; i < retries; i++) {
            try {
                await provider.send(email);
                this.statusTracker.updateStatus(email, 'Sent');
                return;
            } catch (error) {
                // Type assertion to ensure 'error' is treated as an Error object
                if (error instanceof Error) {
                    Logger.log(`Retry ${i + 1}: ${error.message}`);
                } else {
                    Logger.log(`Retry ${i + 1}: Unknown error occurred`);
                }
                await this.exponentialBackoff(i + 1);
            }
        }
        throw new Error('Failed to send email after retries');
    }

    private async exponentialBackoff(retryCount: number): Promise<void> {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    private async processQueue(): Promise<void> {
        if (this.queue.isEmpty()) return;
        const email = this.queue.dequeue();
        if (!email) return;

        if (this.sentEmails.has(email)) {
            Logger.log(`Email ${email} already sent.`);
            return;
        }

        try {
            await this.sendEmailWithRetry(email, this.provider1);
        } catch (error) {
            // Ensure 'error' is treated as an Error object
            if (error instanceof Error) {
                Logger.log(`Provider1 failed, switching to Provider2: ${error.message}`);
            } else {
                Logger.log(`Provider1 failed, switching to Provider2: Unknown error occurred`);
            }
            try {
                await this.sendEmailWithRetry(email, this.provider2);
            } catch (fallbackError) {
                // Ensure 'fallbackError' is treated as an Error object
                if (fallbackError instanceof Error) {
                    Logger.log(`Provider2 also failed: ${fallbackError.message}`);
                } else {
                    Logger.log(`Provider2 also failed: Unknown error occurred`);
                }
                this.statusTracker.updateStatus(email, 'Failed');
            }
        }

        this.sentEmails.add(email);
    }

    public sendEmail(email: string): void {
        if (this.sentEmails.has(email)) {
            Logger.log(`Email ${email} is already in the queue.`);
            return;
        }

        this.queue.enqueue(email);
        this.statusTracker.updateStatus(email, 'Queued');
    }
}
