import app from "./app";
import * as io from "./socket";
import http from "http";

const port = Number(process.env.PORT || 3000);
app.set("port", port);

const server = http.createServer(app);

io.listen(server);

server.listen(port, () => {
  console.log("Express server started on port: " + port);
});
