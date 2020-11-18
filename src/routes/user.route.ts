import { Router } from "express";
import { getRethinkDB } from "../db";
import io from "../socket";
import r, {
  Connection as dbConnection,
  ReqlError,
  Sequence,
  Cursor,
} from "rethinkdb";

const router = Router();

const watchedRooms: { [roomId: string]: boolean } = {};

router.get("/message/:roomId", async (req, res, next) => {
  let conn: dbConnection = await getRethinkDB();

  const roomId = req.params.roomId as string;
  // @ts-ignore
  let query = r.table("messages").getAll(roomId, { index: "roomId" });

  // TODO: Add .map() operation to fetch sender info.

  // Subscribe to new messages
  if (!watchedRooms[roomId]) {
    query.changes().run(conn, (err, cursor) => {
      if (err) throw err;
      cursor.each(async (err, row) => {
        if (row.new_val) {
          // Got a new message, send it via socket.io
          let newMessage = row.new_val;
          newMessage["sender"] = (await r
            .table("users")
            .get(newMessage["senderId"]).run(conn));
          io.to(roomId).emit("NEW_MESSAGE", newMessage);
        }
      });
    });
    watchedRooms[roomId] = true;
  }

  // Get message
  const orderedQuery = query
    .merge((msg: any) => ({ sender: r.table("users").get(msg("senderId")) }))
    .without("senderId")
    .orderBy(r.desc("ts"));

  orderedQuery
    .run(conn)
    .then(async (cursor: Cursor) => {
      let messages: any[] = await cursor.toArray();

      res.json(messages);
    })
    .catch((err: Error) => {
      next(err);
    });
});

router.get("/rooms", async (req, res, next) => {
  let conn: dbConnection = await getRethinkDB();

  r.table("rooms")
    .run(conn)
    .then(async (cursor) => {
      let rooms: any[] = await cursor.toArray();

      res.json(rooms);
    })
    .catch(next);
});

interface User {
  id?: string;
  name: string;
  avatarUrl?: string;
}

router.post("/", async (req, res, next) => {
  let conn: dbConnection = await getRethinkDB();

  let user = req.body as User;

  r.table("users")
    .insert(user)
    .run(conn)
    .then((cursor) => {
      res.json(cursor.generated_keys);
    })
    .catch(next);
});

export default router;
