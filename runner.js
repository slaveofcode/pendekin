"use strict";

const cluster = require("cluster");
const server = require("./server");

if (cluster.isMaster && process.env.NODE_ENV === "production") {
  console.log("Server is active. Forking workers now.");
  const cpuCount = require("os").cpus().length;
  for (let i = 0; i < cpuCount; i++) {
    console.log("Starting worker...");
    cluster.fork();
  }
  cluster.on("exit", worker => {
    console.error(`Worker ${worker.id} has died! Creating a new one.`);
    cluster.fork();
  });
} else {
  server.listen(process.env.SERVER_PORT, function() {
    console.log(
      `${server.name} listening at ${server.url} [worker id: ${cluster.worker
        .id}, port: ${process.env.SERVER_PORT}]`
    );
  });
}
