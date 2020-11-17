import r, { ConnectionOptions, Connection } from "rethinkdb";

let rdbConn:Connection;
const rdbConnect = async function () {
  try {
    const connOptions: ConnectionOptions = {
      host: "localhost",
      port: 28015,
      db: "chats",
    };
    const conn = await r.connect(connOptions);

    // Handle close
    conn.on("close", function (e: Error) {
      console.log("RDB connection closed: ", e);
    });

    console.log("Connected to RethinkDB");
    rdbConn = conn;
    return conn;
  } catch (err) {
    throw err;
  }
};

export const getRethinkDB = async function () {
  if (rdbConn != null) {
    return rdbConn;
  }
  return await rdbConnect();
};
