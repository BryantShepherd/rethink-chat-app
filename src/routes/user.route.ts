import { Router } from "express";
import { getRethinkDB } from "../db";
import r, {
  Connection as dbConnection,
  ReqlError,
  Sequence,
  Cursor,
} from "rethinkdb";

const router = Router();

router.get("/message/:roomId", async (req, res, next) => {
  let conn: dbConnection = await getRethinkDB();

  const roomId = req.params.roomId;
  let query: Sequence = r.table("messages").filter({ roomId });

  // Subscribe to changes

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
