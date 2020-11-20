// public/js/app.js

// Create random username
let username = Math.random().toString(36).substring(2, 8);
let userId = "";

// Setup socket.io
var socket = io("http://localhost:3001");

const ConversationItem = Vue.component("conversation-item", {
  template: `
  <v-list-item link @click="onClick" class="py-0">
    <v-list-item-avatar v-if="avatarUrl">
      <v-img :src="avatarUrl"></v-img>
    </v-list-item-avatar>
    <v-list-item-icon v-else>
      <v-icon color="primary">{{ iconName || "mdi-account" }}</v-icon>
    </v-list-item-icon>
    <v-list-item-title>{{ convoName }}</v-list-item-title>
  </v-list-item>
  `,
  props: {
    avatarUrl: {
      type: String,
    },
    convoName: {
      type: String,
      required: true,
    },
    iconName: {
      type: String,
    },
    room: {
      type: Object
    }
  },
  methods: {
    onClick() {
      this.$router.push({ name: "message", params: {roomId: this.room.id} });
    }
  }
});

const MessageItem = Vue.component("message-item", {
  template: `
  <div class="d-flex pa-2">
    <v-avatar class="align-self-end" v-if="!isMine">
      <v-img src="https://randomuser.me/api/portraits/women/27.jpg" alt="avatar"></v-img>
    </v-avatar>
    <div class="d-flex flex-column width-100 ml-2">
      <h4 v-if="!isMine">{{ message.sender.name }}</h4>
      <div :class="messageItemBodyClass">
        <p class="mb-0">{{ message.content }}</p>
        <span id="message-item-body-timestamp">{{ message.ts }}</span>
      </div>
    </div>
  </div>`,
  props: {
    message: {
      type: Object,
      required: true,
    },
    isMine: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      messageItemBodyClass: [
        "message-item-body",
        "pa-3",
        "rounded-t-lg",
        this.isMine ? "rounded-l-lg" : "rounded-r-lg",
        "message-item",
        this.isMine ? "is-mine" : "",
      ],
    };
  },
});

const MessageListDate = Vue.component("message-list-date", {
  props: {
    date: {
      type: String,
      required: true,
    },
  },
  template: `
  <div id="message-list-date" class="pa-0 my-2">
    <span class="pa-2 ma-0">October 20, 2020</span>
  </div>`,
});

const MessageTextBox = Vue.component("message-text-box", {
  template: `
  <div id="container" class="pa-3">
    <v-textarea
      v-model="newMessage"
      solo
      flat
      name="message-text-box"
      placeholder="Send a message..."
      class="width-100"
      id="message-text-box-input"
      rows="2"
      no-resize
      background-color="#f5f5f5"
      @keydown.enter.exact.prevent="onSend"
    ></v-textarea>
    <div id="message-text-box-menu" class="d-flex">
      <v-btn icon tile color="primary">
        <v-icon>mdi-file</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="onSend">Send</v-btn>
    </div>
  </div>`,
  data() {
    return {
      newMessage: "",
    };
  },
  methods: {
    onSend() {
      this.$emit("submit", this.newMessage);
      this.newMessage = "";
    },
  },
});

const MessageScreen = Vue.component("message-screen", {
  template: `
  <v-container fluid class="d-flex pa-0">
    <div class="fit-v-viewport pr-1 col-3" id="conversation-list">
      <v-list v-for="convo in roomList" :key="convo.id">
        <conversation-item :convoName="convo.name" :avatarUrl="convo.avatarUrl" :room="convo" />
      </v-list>
    </div>
    <div class="d-flex flex-column width-100 fit-v-viewport">
      <div id="conversation-app-bar" class="pa-5 d-flex align-center justify-space-between">
        <h3>Chat App</h3>
        <v-btn icon>
          <v-icon>mdi-alert-circle-outline</v-icon>
        </v-btn>
      </div>
      <div id="message-list-item" class="fill-height">
        <message-item :isMine="isMyMsg(message.sender.id)" v-for="message in currentRoomMessage" :key="message.id" :message="message" />
      </div>
      <message-text-box @submit="onSendMessage" />
    </div>
  </v-container>`,
  watch: {
    $route: "fetchMessages",
    currentRoomMessages: "scrollToEnd",
  },
  methods: {
    fetchRooms() {
      return fetch("http://localhost:3000/api/users/rooms")
        .then((res) => res.json())
        .then((data) => {
          this.roomList = data;
        });
    },
    fetchMessages() {
      let roomId = this.$route.params.roomId;
      this.currentConvo = this.roomList.find((r) => r.id === roomId);
      // console.log(this.currentRoomMessage);
      if (!roomId) return;

      return new Promise((resolve, reject) => {
        if (this.messageList[roomId]) {
          resolve(this.messageList[roomId]);
        }

        fetch(`http://localhost:3000/api/users/message/${roomId}`)
          .then((res) => res.json())
          .then((data) => {
            // this.messageList[roomId] = data;
            Vue.set(this.messageList, roomId, data);
          })
          .then(() => {
            socket.emit("JOIN_ROOM", roomId);
            resolve(this.messageList[roomId]);
          })
          .catch(reject);
      });
    },
    onSendMessage(message) {
      socket.emit(
        "NEW_MESSAGE",
        {
          content: message,
          ts: new Date(),
          senderId: userId,
          roomId: this.$route.params.roomId,
        },
        (err, success) => {
          if (err) {
            console.error(err);
          }
          console.log(success);
        }
      );
    },
    isMyMsg(senderId) {
      return senderId === userId;
    },
    scrollToEnd() {
      this.$nextTick(() => {
        const container = this.$el.querySelector("#message-list-item");
        container.scrollTop = container.scrollHeight;
      });
    },
  },
  computed: {
    currentRoomMessage() {
      return this.messageList[this.currentConvo.id];
    },

  },
  created() {
    this.fetchRooms().then(() => this.fetchMessages());
    socket.on("NEW_MESSAGE", (message) => {
      this.messageList[message.roomId].push(message);
    });
  },
  data() {
    return {
      messageList: {},
      roomList: [],
      currentConvo: {},
    };
  },
});

// Main view
const MainView = Vue.component("main-view", {
  data() {
    return {
      room: "lobby",
      user: username,
    };
  },
  methods: {
    gotoRoom() {
      username = this.user;
      fetch("http://localhost:3000/api/users", {
        method: "post",
        body: JSON.stringify({ name: this.user }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          let generated_key = data[0];
          userId = generated_key;
          this.$router.push({
            name: "message",
            params: { roomId: "2601d45e-623f-402a-b7d9-1774816fb297" },
          });
        })
        .catch(console.error);
    },
  },
  template: `
<div class="main">
    <form class="main" v-on:submit.prevent="gotoRoom">
    <label>Username: <input v-model="user" type="text" /></label>
    <label>Room: <input v-model="room" type="text" /></label>
    <button>Join</button>
    </form>
</div>
    `,
});

// Setup routes
const router = new VueRouter({
  routes: [
    { path: "/", component: MainView },
    { path: "/message/:roomId", name: "message", component: MessageScreen },
  ],
});

// Mount Vue app
var app = new Vue({
  router,
  vuetify: new Vuetify(),
}).$mount("#app");
