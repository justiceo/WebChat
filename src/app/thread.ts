export class Thread {
  name: string;
  id: string;
  avatar: string;
  timestamp: number;
  snippet: string;
  userIDs: string[];
  unreadCount: number;

  static make(id: string, name: string, userIDs: string[]): Thread {
    const t = new Thread();
    t.id = id;
    t.name = name;
    t.userIDs = userIDs;
    t.avatar = 'https://randomuser.me/api/portraits/men/41.jpg';
    t.snippet = 'some snippet';
    t.timestamp = Date.now() - 50000000;
    t.unreadCount = 4;
    return t;
  }
}
