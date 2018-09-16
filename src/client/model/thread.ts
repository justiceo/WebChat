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
    t.avatar = "https://randomuser.me/api/portraits/men/41.jpg";
    t.snippet = "some snippet";
    t.timestamp = Date.now() - 50000000;
    t.unreadCount = 4;
    return t;
  }

  // Copy copies over only fields that can be updated safely from one thread to another.
  static copy(from: Thread, to: Thread) {
    to.name = from.name;
    to.avatar = from.avatar;
    to.timestamp = from.timestamp;
    to.snippet = from.snippet;
    to.unreadCount = from.unreadCount;
  }

  // NB: This is a data class, only static methods allowed.
}
