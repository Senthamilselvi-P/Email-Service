export class StatusTracker {
    private status: Record<string, string> = {};

    updateStatus(emailId: string, status: string): void {
        this.status[emailId] = status;
    }

    getStatus(emailId: string): string | undefined {
        return this.status[emailId];
    }
}
