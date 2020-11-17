// public/js/app.js

// Create random username
let username = Math.random().toString(36).substring(2, 8);

// Setup socket.io
var socket = io("http://localhost:3001");

const ConversationItem = Vue.component("conversation-item", {
  template: `
  <v-list-item link class="py-0">
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
  },
});

const MessageItem = Vue.component("message-item", {
  template: `
  <div class="d-flex pa-2">
    <v-avatar class="align-self-end">
      <v-img src="https://randomuser.me/api/portraits/women/27.jpg" alt="avatar"></v-img>
    </v-avatar>
    <div class="d-flex flex-column width-100 ml-2">
      <h4>{{ message.sender.name }}</h4>
      <div class="message-item-body pa-3 rounded-t-lg rounded-r-lg message-item">
        <p class="mb-0">{{ message.message.richText || message.message.text }}</p>
        <span id="message-item-body-timestamp">{{ message.createdAt }}</span>
      </div>
    </div>
  </div>`,
  props: {
    message: {
      type: Object,
      required: true,
    },
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
      <v-list v-for="convo in []" :key="convo.id">
        <conversation-item :convoName="convo.conversation_name" :avatarUrl="convo.avatarUrl" />
      </v-list>
    </div>
    <div class="d-flex flex-column width-100 fit-v-viewport">
      <div id="conversation-app-bar" class="pa-5 d-flex align-center justify-space-between">
        <h3>Annie Edison</h3>
        <v-btn icon>
          <v-icon>mdi-alert-circle-outline</v-icon>
        </v-btn>
      </div>
      <div id="message-list-item" class="fill-height">
        <message-list-date date="October 20, 2020" />
        <message-item v-for="message in messageList" :key="message.id" :message="message" />
      </div>
      <message-text-box @submit="onSendMessage" />
    </div>
  </v-container>`,
  watch: {
    $route: "fetchData",
  },
  methods: {
    fetchData() {},
    onSendMessage() {},
  },
  created() {
    this.fetchData();
  },
  data() {
    return {
      messageList: [
        {
          id: 1,
          sender: {
            id: 1,
            name: "Annie Edison",
          },
          conversationId: 1,
          message: {
            richText: "Hello from the other side.",
            text: "Hello from the other side.",
          },
          createdAt: "10:12 AM",
        },
        {
          id: 2,
          sender: {
            id: 1,
            name: "Annie Edison",
          },
          conversationId: 1,
          message: {
            richText:
              "Will justice philosophy madness passion victorious justice depths aversion abstract selfish enlightenment hatred. Truth ascetic salvation value victorious merciful marvelous truth holiest value hatred derive. Holiest transvaluation derive self hope evil fearful ideal merciful. Strong ultimate disgust christianity zarathustra christian disgust inexpedient inexpedient. Overcome enlightenment sea sexuality fearful depths hope pious eternal-return salvation.",
            text:
              "Will justice philosophy madness passion victorious justice depths aversion abstract selfish enlightenment hatred. Truth ascetic salvation value victorious merciful marvelous truth holiest value hatred derive. Holiest transvaluation derive self hope evil fearful ideal merciful. Strong ultimate disgust christianity zarathustra christian disgust inexpedient inexpedient. Overcome enlightenment sea sexuality fearful depths hope pious eternal-return salvation.",
          },
          createdAt: "10:18 AM",
        },
        {
          id: 3,
          sender: {
            id: 1,
            name: "Annie Edison",
          },
          conversationId: 1,
          message: {
            richText:
              "Someone like you. Someone who'll rattle the cages. Does it come in black?",
            text:
              "Someone like you. Someone who'll rattle the cages. Does it come in black?",
          },
          createdAt: "10:18 AM",
        },
        {
          id: 4,
          sender: {
            id: 1,
            name: "Annie Edison",
          },
          conversationId: 1,
          message: {
            richText:
              " Swear to me! My anger outweights my guilt. It's not who I am underneath but what I do that defines me. I can't do that as Bruce Wayne... as a man. I'm flesh and blood. I can be ignored, destroyed. But as a symbol, I can be incorruptible, I can be everlasting.",
            text:
              " Swear to me! My anger outweights my guilt. It's not who I am underneath but what I do that defines me. I can't do that as Bruce Wayne... as a man. I'm flesh and blood. I can be ignored, destroyed. But as a symbol, I can be incorruptible, I can be everlasting.",
          },
          createdAt: "10:18 AM",
        },
        {
          id: 5,
          sender: {
            id: 1,
            name: "Annie Edison",
          },
          conversationId: 1,
          message: {
            richText:
              " Does it come in black? This isn't a car. Well, you see... I'm buying this hotel and setting some new rules about the pool area.",
            text:
              " Does it come in black? This isn't a car. Well, you see... I'm buying this hotel and setting some new rules about the pool area. ",
          },
          createdAt: "10:18 AM",
        },
      ],
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
      this.$router.push({ name: "room", params: { roomId: this.room } });
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

// Room view, holds a ChatRoom component
const RoomView = Vue.component("room-view", {
  template: `<chat-room :roomId="$route.params.roomId"/>`,
});

// ChatRoom component
const ChatRoom = Vue.component("chat-room", {
  props: ["roomId"],
  data() {
    return {
      chats: [],
      message: "",
      username: username,
      handle: null,
    };
  },
  async created() {
    // const url = new URL(
    //   document.location.protocol +
    //     "//" +
    //     document.location.host +
    //     "/chats/" +
    //     this.roomId
    // );
    // const chatsResp = await fetch(url);
    // const { data, handle } = await chatsResp.json();
    // this.chats = data;
    // this.handle = handle;
    // socket.on(this.handle, (msg) => {
    //   this.chats.unshift(msg);
    // });
  },
  beforeDestroy() {
    // socket.off(this.handle);
  },
  methods: {
    sendMessage() {
      socket.emit("chats", {
        msg: this.message,
        user: this.username,
        roomId: this.roomId,
      });
      this.message = "";
    },
  },
  template: `
<div class="chatroom">
    <ul id="chatlog">
        <li v-for="chat in chats">
            <span class="timestamp">
                {{ new Date(chat.ts).toLocaleString(undefined, {dateStyle: 'short', timeStyle: 'short'}) }}
            </span>
            <span class="user">{{ chat.user }}:</span>
            <span class="msg">{{ chat.msg }}</span>
        </li>
    </ul>
    <label id="username">Username:
        {{ username }}
    </label>
    <form v-on:submit.prevent="sendMessage">
        <input v-model="message" autocomplete="off" />
        <button>Send</button>
    </form>
</div>
    `,
});

// Setup routes
const router = new VueRouter({
  routes: [
    { path: "/", component: MessageScreen },
    { path: "/:roomId", name: "room", component: RoomView },
    { path: "/message", name: "message", component: MessageScreen },
  ],
});

// Mount Vue app
var app = new Vue({
  router,
  vuetify: new Vuetify(),
}).$mount("#app");
