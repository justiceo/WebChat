export class Thread {
  name: string;
  id: string;
  avatar: string;
  timestamp: number;
  snippet: string;
  userIds: string[];
  isUnread: boolean;

  static make(id: string, name: string, userIds: string[]): Thread {
    const t = new Thread();
    t.id = id;
    t.name = name;
    t.userIds = userIds;
    t.avatar = 'https://randomuser.me/api/portraits/men/41.jpg';
    t.snippet = 'some snippet';
    t.timestamp = Date.now() - 50000000;
    return t;
  }
}
