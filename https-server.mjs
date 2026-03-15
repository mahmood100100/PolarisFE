import fs from "fs";
import https from "https";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./localhost-key.pem"),
  cert: fs.readFileSync("./localhost.pem"),
};

const port = 3001;

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      handle(req, res);
    })
    .listen(port, () => {
      console.log(`> Ready on https://localhost:${port}`);
    });
});