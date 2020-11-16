import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { getRethinkDB } from "./db";

export function listen(httpServer: HttpServer) {
  let io = new Server(httpServer);

  io.on("connection", async (socket: Socket) => {
    let conn = await getRethinkDB();
  })
}
