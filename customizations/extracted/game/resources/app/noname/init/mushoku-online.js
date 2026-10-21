import characters from "./mushoku-characters.js";
import { characterPacks, packForCharacter } from "./mushoku-rosters.js";
import { bossCharacters } from "./mushoku-boss.js";
import { onlineModes, roomSeats, configureOnlineMenus } from "./mushoku-online-modes.js";

export function roomError(lib, config = lib.configOL) {
  if (!onlineModes.includes(config.mode)) return "当前联机支持标准身份、休闲斗地主、1对1、2对2和Boss挑战。";
  if (config.mode === "identity" && (config.identity_mode || "normal") !== "normal") return "身份联机仅支持标准身份局。";
  if (config.mode === "doudizhu" && (config.doudizhu_mode || "normal") !== "normal") return "斗地主联机仅支持休闲玩法。";
  if (config.mode === "versus" && !["1v1", "2v2"].includes(config.versus_mode || "2v2")) return "对决联机支持1对1和2对2。";
  if (config.team_mode && !["random", "free"].includes(config.team_mode)) return "请选择随机分配或自由选择阵营。";
  if (config.mode === "boss" && config.boss_character && !bossCharacters[config.boss_character]) return "请选择本版已注册的Boss。";
  const number = roomSeats(config);
  if (!Number.isInteger(number) || number < 2 || number > 8) return "房间人数须为2至8人（含AI）。";
  if (config.double_character) return "当前联机仅支持单将，确保角色不重复。";
  if (config.cardPack?.includes("jiubian")) return "标准身份联机暂不支持依赖国战接口的九变卡牌包。";
  const packs = (config.characterPack || characterPacks).filter(p => characterPacks.includes(p));
  const available = Object.keys(characters).filter(id => packs.includes(packForCharacter(id)) && !(config.banned || []).includes(id));
  const required = config.mode === "boss" ? 3 : number;
  if (available.length < required) return `需要${required}名不同角色，当前角色池仅${available.length}名。`;
  return null;
}

export function findAiSeat(game) {
  return game.players.find(player => player !== game.me && player.isIn() && (!player.ws || player.ws.closed));
}

export function installMushokuOnline(lib, game, ui, get, status) {
  // Use a distinct protocol version: vanilla clients must not inject a different roster/skill set.
  lib.versionOL = 27112101;
  game.mushokuOnlineContext = { ui, status };
  if (game.mushokuOnlineInstalled) return;
  game.mushokuOnlineInstalled = true;
  configureOnlineMenus(lib, game);
  const switchMode = game.switchMode;
  game.switchMode = function (...args) {
    // Jiubian equipment calls guozhan-only APIs absent in standard identity.
    if (lib.connectCardPack) lib.connectCardPack = lib.connectCardPack.filter(pack => pack !== "jiubian");
    return switchMode.apply(this, args);
  };
  const createServer = game.createServer;
  game.createServer = function (...args) {
    const error = roomError(lib);
    if (error) throw new Error(error);
    lib.configOL.number = roomSeats(lib.configOL);
    if (lib.configOL.mode !== "identity") lib.configOL.player_number = lib.configOL.number;
    if (lib.configOL.mode === "boss") lib.configOL.boss_character ||= "boss_mt_roxy";
    lib.configOL.characterPack = (lib.configOL.characterPack || characterPacks).filter(p => characterPacks.includes(p));
    lib.configOL.mushokuAiRoom = true;
    return createServer.apply(this, args);
  };
  const connectPlayers = ui.create.connectPlayers;
  const labelAiSeats = () => {
    if (lib.configOL.mushokuAiRoom) {
      const seats = game.connectPlayers || [];
      for (const seat of seats) if (!seat.playerid && !seat.classList?.contains("unselectable2")) seat.node.nameol.textContent = "AI（玩家加入后替换）";
    }
  };
  ui.create.connectPlayers = function (...args) {
    const result = connectPlayers.apply(this, args);
    labelAiSeats();
    return result;
  };
  if (lib.message.client?.updateWaiting) {
    const updateWaiting = lib.message.client.updateWaiting;
    lib.message.client.updateWaiting = function (...args) {
      const result = updateWaiting.apply(this, args);
      labelAiSeats();
      return result;
    };
  }
  const server = lib.message.server;
  const init = server.init;
  server.init = function (version, config, bannedInfo) {
    // Keep the original handshake, bans, reconnect and version checks before takeover.
    const valid = version === lib.versionOL && config?.nickname &&
      !(lib.node.banned || []).includes(bannedInfo) && !(lib.config.banBlacklist || []).includes(config.onlineKey) &&
      (!get.config("check_versionLocal", "connect") || config.versionLocal === lib.version) &&
      (!get.config("check_extension", "connect") || !config.extension);
    const reconnect = config?.id && lib.playerOL?.[config.id];
    if (lib.configOL.mushokuAiRoom && status.waitingForPlayer && valid && !reconnect &&
      (lib.node.clients || []).filter(client => client !== this && (client.inited || client.mushokuAccepted) && !client.closed).length >= roomSeats(lib.configOL) - 1) {
      this.send("denied", "number"); this.close(); return;
    }
    if (reconnect && reconnect.ws && !reconnect.ws.closed && reconnect.ws !== this) {
      this.send("denied", "gaming"); this.close(); return;
    }
    if (lib.configOL.mushokuAiRoom && !status.waitingForPlayer && valid && !reconnect && !status.over && game.phaseNumber > 0) {
      const seat = findAiSeat(game);
      if (seat) {
        const oldSocket = seat.ws;
        seat.ws = this; seat.isAuto = false;
        this.id = seat.playerid;
        this.nickname = get.plainText(config.nickname);
        this.avatar = config.avatar;
        this.onlineKey = config.onlineKey;
        // Reclaim the existing seat ID and preserve character, hand, HP, skills and identity.
        this.send(function (id) { game.onlineID = id; }, this.id);
        seat.nickname = this.nickname; seat.setNickname();
        game.broadcast(function (player, nickname) { player.nickname = nickname; player.setNickname(); }, seat, this.nickname);
        // The engine's reconnection snapshot is the authoritative state transfer.
        this.send("reinit", lib.configOL, get.arenaState(), game.getState ? game.getState() : {}, game.ip, null, status.onreconnect, status.cardtag, status.postReconnect);
        game.log("玩家", this.nickname, "接替AI席位");
        if (oldSocket) oldSocket.closed = true;
        return;
      }
      this.send("denied", "number"); this.close(); return;
    }
    // Original reconnect branch precedes its version checks; enforce our version first.
    if (lib.configOL.mushokuAiRoom && !valid) {
      this.send("denied", version !== lib.versionOL ? "version" : "banned"); this.close(); return;
    }
    if (valid && status.waitingForPlayer) this.mushokuAccepted = true;
    return init.call(this, version, config, bannedInfo);
  };
  const change = server.changeRoomConfig;
  server.changeRoomConfig = function (config) {
    // Native lobby keeps its existing seat nodes; changing capacity requires a new room.
    if (lib.configOL.mushokuAiRoom && ((config.mode && config.mode !== lib.configOL.mode) || roomSeats({ ...lib.configOL, ...config }) !== roomSeats(lib.configOL) || roomError(lib, { ...lib.configOL, ...config }))) return;
    return change.call(this, config);
  };
}
