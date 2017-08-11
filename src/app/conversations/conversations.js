export class ConversationsCtrl {
  constructor() {
    this.conversations = [
      {
        id: "1",
        name: "Johnny Depp",
        time: "2:10 PM",
        body: "Hello dear,what are you doing today, just checking",
        avatarUrl: "https://s13.postimg.org/ih41k9tqr/img1.jpg"
      },
      {
        id: "2",
        isActive: true,
        name: "Jason Mars",
        time: "9:00 PM",
        body: "when the going gets hard, the hard gets going",
        avatarUrl: "https://s3.postimg.org/yf86x7z1r/img2.jpg"
      },
      {
        id: "3",
        name: "Gloria Houston",
        time: "2:10 AM",
        body: "Hello dear,what are you to",
        avatarUrl: "https://s3.postimg.org/h9q4sm433/img3.jpg"
      },
      {
        id: "4",
        name: "Drake Mantis",
        time: "3:14 PM",
        body: "It’s not that bad",
        avatarUrl: "https://s3.postimg.org/quect8isv/img4.jpg"
      },
      {
        id: "5",
        name: "The Weekend",
        time: "2:10 PM",
        body: "Hello dear,what are you to",
        avatarUrl: "https://s16.postimg.org/ete1l89z5/img5.jpg"
      },
      {
        id: "6",
        name: "Charlie Johnson",
        time: "3:34 PM",
        body: "Wasup for the third time like is",
        avatarUrl: "https://s30.postimg.org/kwi7e42rh/img6.jpg"
      },
      {
        id: "1",
        name: "Johnny Depp",
        time: "2:10 PM",
        body: "Hello dear,what are you to",
        avatarUrl: "https://s13.postimg.org/ih41k9tqr/img1.jpg"
      },
      {
        id: "2",
        name: "Jason Mars",
        time: "9:00 PM",
        body: "Hello dear,what are you to",
        avatarUrl: "https://s3.postimg.org/yf86x7z1r/img2.jpg"
      },
      {
        id: "3",
        name: "Gloria Houston",
        time: "2:10 AM",
        body: "Hello dear,what are you to",
        avatarUrl: "https://s3.postimg.org/h9q4sm433/img3.jpg"
      },
      {
        id: "4",
        name: "Drake Mantis",
        time: "3:14 PM",
        body: "It’s not that bad",
        avatarUrl: "https://s3.postimg.org/quect8isv/img4.jpg"
      },
      {
        id: "5",
        name: "The Weekend",
        time: "2:10 PM",
        body: "Hello dear,what are you to",
        avatarUrl: "https://s16.postimg.org/ete1l89z5/img5.jpg"
      },
    ]
  }
}

let Conversations = {
  templateUrl: 'app/conversations/conversations-bootstrap.html',
  controller: ConversationsCtrl
}

export default Conversations;