import { Router } from "express";
import { getRethinkDB } from "../db";
import r, { Connection as dbConnection } from "rethinkdb";

const router = Router();

router.get("/", async (req, res, next) => {
  let conn: dbConnection = await getRethinkDB();

  r.table("customers")
    .limit(40)
    .run(conn)
    .then((cursor) => {
      cursor
        .toArray()
        .then((value) => {
          res.json(value);
        })
        .catch((err) => {
          next(err);
        });
    });
});

export default router;
