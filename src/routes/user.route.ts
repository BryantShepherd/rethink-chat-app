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

const watchedRooms: any = {};

router.get("/message/:roomId", async (req, res, next) => {
  let conn: dbConnection = await getRethinkDB();

  const roomId = req.params.roomId;
  let query: Sequence = r.table("messages").filter({ roomId });

  // Subscribe to new messages
  if (!watchedRooms[roomId]) {
    query.changes().run(conn, (err, cursor) => {
      if (err) throw err;
      cursor.each((err, row) => {
        if (row.new_val) {
          // Got a new message, send it via socket.io
          io.emit(roomId, row.new_val);
        }
      });
    });
    watchedRooms[roomId] = true;
  }

  // Get message
  const orderedQuery = query.orderBy(r.desc("ts"));

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

export default router;
