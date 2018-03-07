/**
 * An enum of different types of content that can be contained in sms.
 */
export enum SmsContentType {
    PlainText,
    Image,
    EmojiText,
    Video
}

/**
 * Mock-model for a single sms message in a thread
 */
export class SmsMessage {
    threadID: string;
    userID: string;
    contentType: SmsContentType;
    content: any;
    timestamp: number;
    isLocalLast: boolean;
    isNewDay: boolean;

    static make(threadID: string, userID: string, content: any): SmsMessage {
        const m1 = new SmsMessage();
        m1.threadID = threadID;
        m1.userID = userID;
        m1.content = content;
        m1.contentType = SmsContentType.PlainText;
        m1.timestamp = Date.now() - 50000000;
        return m1;
    }
}
