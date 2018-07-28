/**
 * An enum of different types of content that can be contained in sms.
 */
export enum MessageContentType {
  PlainText,
  Image,
  EmojiText,
  Video
}

/**
 * Mock-model for a single sms message in a thread
 */
export class Message {
  threadID: string;
  userID: string;
  contentType: MessageContentType;
  content: any;
  timestamp: number;
  isLocalLast: boolean;
  isNewDay: boolean;

  static make(threadID: string, userID: string, content: any): Message {
    const m1 = new Message();
    m1.threadID = threadID;
    m1.userID = userID;
    m1.content = content;
    m1.contentType = MessageContentType.PlainText;
    m1.timestamp = Date.now() - 50000000;
    return m1;
  }
}
