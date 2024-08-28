export interface IEmailProvider {
    send(email: string): Promise<void>;
}
