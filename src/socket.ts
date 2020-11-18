import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { getRethinkDB } from "./db";
import r, { Connection as dbConnection } from "rethinkdb";

interface ChatMessage {
  id?: number;
  content: string;
  ts: Date | string;
  sender: { id: number; name: string };
  roomId: string
}

let io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket: Socket) => {
  let conn = await getRethinkDB();

  socket.on("JOIN_ROOM", (roomId: string) => {
    socket.join(roomId);
  })

  socket.on("NEW_MESSAGE", (message: ChatMessage, fn) => {
    r.table("messages")
      .insert(message)
      .run(conn)
      .then(() => {
        fn(null, true);
      })
      .catch((err) => {
        fn(err, false);
      });
  });
})

export default io;
