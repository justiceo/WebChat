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
  id: string;
  threadID: string;
  userID: string;
  contentType: MessageContentType;
  content: any;
  timestamp: number;

  // True if the message after this one is by a different user.
  isLocalLast: boolean;

  // True if the message before this one was sent/recieved yesterday.
  isNewDay: boolean;

  static make(threadID: string, userID: string, content: any): Message {
    const m1 = new Message();
    m1.threadID = threadID;
    m1.userID = userID;
    m1.content = content;
    m1.contentType = MessageContentType.PlainText;
    m1.timestamp = Date.now();
    return m1;
  }
}
