import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import { once } from "node:events";
import characters from "../apps/core/noname/init/mushoku-characters.js";
import { parseSakuraAddress, getOnlineRestriction, onlineConfigFromMenu, onlineProtocol, getPeerRestriction } from "../apps/core/noname/init/mushoku-online.js";
import { getMushokuRestriction, prepareMushokuMode } from "../apps/core/noname/init/mushoku-compatibility.js";

const lib = () => ({ character: { ...characters }, connectBanned: [] });
const room = changes => ({ mode: "identity", identity_mode: "normal", player_number: "8", characterPack: ["mushoku"], banned: [], mushokuProtocol: onlineProtocol, ...changes });

test("Sakura TCP addresses retain explicit ports and always use plain WebSocket", () => {
 for (const input of ["frp.example.com:23456", "ws://frp.example.com:23456/", "  frp.example.com:23456 "]) assert.equal(parseSakuraAddress(input).url, "ws://frp.example.com:23456/");
 assert.equal(parseSakuraAddress("127.0.0.1:8080").url, "ws://127.0.0.1:8080/");
 assert.equal(parseSakuraAddress("[::1]:8080").url, "ws://[::1]:8080/");
 assert.equal(parseSakuraAddress("frp.example.com:80").url, "ws://frp.example.com/");
 for (const input of ["", "example.com", "wss://example.com:443", "https://example.com:123", "example.com:0", "example.com:65536", "example.com:123/path", "example.com:123?x=1", "user:pass@example.com:123", "foo bar:123"]) assert.throws(() => parseSakuraAddress(input), input);
});

test("online capacity applies to all room counts, double generals, bans and packs", () => {
 for (let count = 2; count <= 8; count++) for (const double of [false, true]) assert.equal(!!getOnlineRestriction(room({ number: count, double_character: double }), lib()), count * (double ? 2 : 1) > 8);
 assert.match(getOnlineRestriction(room({ banned: ["mt_roxy"] }), lib()), /7/);
 assert.ok(getOnlineRestriction(room({ characterPack: ["standard", "mushoku"] }), lib()));
 for (const mode of ["guozhan", "versus", "doudizhu"]) assert.ok(getOnlineRestriction(room({ mode }), lib()));
 assert.ok(getOnlineRestriction(room({ identity_mode: "purple" }), lib()));
 assert.ok(getOnlineRestriction(room({ double_character: true, number: 4, choice_zhu: 1 }), lib()));
 assert.ok(getPeerRestriction({}));
 assert.equal(getPeerRestriction({ mushokuProtocol: onlineProtocol }), null);
});

test("async mode switches validate online settings rather than offline settings", () => {
 const library = { ...lib(), config: { mode: "connect", connect_identity_banned: [], connect_characters: [] }, connectCharacterPack: ["mushoku"], mode: { identity: { connect: { connect_player_number: {}, connect_identity_mode: {} } } } };
 const get = { config: key => ({ connect_player_number: "8", connect_identity_mode: "normal", player_number: "10" })[key] };
 assert.equal(getOnlineRestriction(onlineConfigFromMenu(library, get, "identity"), library), null);
 assert.equal(getMushokuRestriction(library, get, "identity"), null);
 const start = () => {};
 assert.equal(prepareMushokuMode({ name: "identity", start }, library, get).start, start);
 library.configOL = room({ number: 8, double_character: true });
 assert.ok(getMushokuRestriction(library, get, "identity"));
});

test("source server and handshake work through a real local TCP relay; old peers rejected before reconnect", { timeout: 10000 }, async () => {
 const require = createRequire(new URL("../apps/core/package.json", import.meta.url));
 const { WebSocket, WebSocketServer } = require("ws");
 const gameSource = await readFile(new URL("../apps/core/noname/game/index.js", import.meta.url), "utf8");
 const librarySource = await readFile(new URL("../apps/core/noname/library/index.js", import.meta.url), "utf8");
 const createBody = gameSource.slice(gameSource.indexOf("\tcreateServer() {"), gameSource.indexOf("\n\t/**", gameSource.indexOf("\tcreateServer() {")));
 const initStart = librarySource.indexOf("\t\t\tinit(version, config, banned_info) {");
 const initBody = librarySource.slice(initStart, librarySource.indexOf("\n\t\t\t/**", initStart));
 const library = { ...lib(), node: {}, config: { sakura_public_address: "test.example:23456" }, configOL: room({ number: 2 }) };
 const status = { waitingForPlayer: true };
 const game = { connectPlayers: [{ classList: { contains: () => false } }, { classList: { contains: () => false }, initOL() {} }] };
 game.me = game.connectPlayers[0];
 library.versionOL = 27;
 const init = Function("lib", "game", "_status", "get", "getPeerRestriction", "getOnlineRestriction", `return ({${initBody}}).init`)(library, game, status, { config: () => false }, getPeerRestriction, getOnlineRestriction);
 const allSockets = [];
 library.init = { connection(ws) {
  const client = { id: "2", send: (...args) => ws.send(JSON.stringify(args)) };
  library.node.clients.push(client);
  ws.on("message", data => { const [type, ...args] = JSON.parse(data); if (type === "init") init.apply(client, args); });
  ws.send(JSON.stringify(["opened"]));
 } };
 const makeServer = Function("lib", "game", "ui", "require", "alert", `return ({${createBody}}).createServer`)(library, game, { create: { roomInfo() {}, chat() {} } }, () => ({ Server: class extends WebSocketServer { constructor(options) { assert.equal(options.host, "127.0.0.1"); assert.equal(options.port, 8080); super({ ...options, port: 0 }); } } }), message => assert.fail(message));
 makeServer();
 const server = game.sakuraServer;
 library.node.clients.remove = client => { const index = library.node.clients.indexOf(client); if (index >= 0) library.node.clients.splice(index, 1); };
 await once(server, "listening");
 const relay = net.createServer(socket => {
  const upstream = net.connect(server.address().port, "127.0.0.1");
  allSockets.push(socket, upstream);
  socket.pipe(upstream).pipe(socket);
  socket.on("error", () => upstream.destroy()); upstream.on("error", () => socket.destroy());
 });
 relay.listen(0, "127.0.0.1");
 await once(relay, "listening");
 try {
  for (const compatible of [false, true]) {
   const ws = new WebSocket(`ws://127.0.0.1:${relay.address().port}`);
   allSockets.push(ws);
   const opened = await once(ws, "message");
   assert.deepEqual(JSON.parse(opened[0]), ["opened"]);
   const reply = once(ws, "message");
   ws.send(JSON.stringify(["init", 27, { id: compatible ? undefined : "existing-player", onlineKey: "test", nickname: "测试", mushokuProtocol: compatible ? onlineProtocol : undefined }, "test"]));
   const [data] = await reply;
   const message = JSON.parse(data);
   assert.equal(message[0], compatible ? "init" : "denied");
   if (compatible) assert.equal(message[2].mushokuProtocol, onlineProtocol);
   ws.terminate();
  }
 } finally {
  for (const socket of allSockets) socket.terminate ? socket.terminate() : socket.destroy();
  for (const client of server.clients) client.terminate();
  await Promise.all([new Promise(resolve => server.close(resolve)), new Promise(resolve => relay.close(resolve))]);
 }
});
