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
}