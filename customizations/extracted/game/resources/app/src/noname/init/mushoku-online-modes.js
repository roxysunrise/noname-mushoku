import characters from "./mushoku-characters.js";
import { characterPacks, packForCharacter } from "./mushoku-rosters.js";
import { bossCharacters, bossTranslate } from "./mushoku-boss.js";

export const onlineModes = ["identity", "doudizhu", "versus", "boss"];
export function roomSeats(config) {
  if (config.mode === "doudizhu") return 3;
  if (config.mode === "versus" || config.mode === "boss") return 4;
  return Number(config.player_number || config.number || 8);
}
export function availableCharacters(config) {
  const packs = config.characterPack || characterPacks;
  return Object.keys(characters).filter(id => packs.includes(packForCharacter(id)) && !(config.banned || []).includes(id));
}
// Every seat owns a nonempty, disjoint candidate pool, including AI fallback choices.
export function allocateChoices(ids, seatIds, random = Math.random) {
  const pool = [...ids];
  if (pool.length < seatIds.length) throw new Error("可用角色不足，无法分配不重复的候选角色。");
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const result = {};
  seatIds.forEach((id, i) => { result[id] = pool.splice(0, Math.min(5, Math.floor(pool.length / (seatIds.length - i)))); });
  return result;
}

export function configureOnlineMenus(lib, game) {
  if (!lib.mode) return;
  const ddz = lib.mode.doudizhu?.connect;
  if (ddz) {
    ddz.connect_doudizhu_mode.item = { normal: "休闲斗地主" };
    ddz.connect_doudizhu_mode.init = "normal";
    ddz.connect_double_character.init = false;
    game.saveConfig("connect_doudizhu_mode", "normal", "doudizhu");
    game.saveConfig("connect_double_character", false, "doudizhu");
  }
  const vs = lib.mode.versus?.connect;
  if (vs) {
    vs.connect_versus_mode.item = { "2v2": "2对2" };
    vs.connect_versus_mode.init = "2v2";
    game.saveConfig("connect_versus_mode", "2v2", "versus");
  }
  if (lib.mode.boss) lib.mode.boss.connect = {
    connect_boss_character: {
      name: "挑战Boss", init: "boss_mt_roxy", frequent: true,
      item: Object.fromEntries(Object.keys(bossCharacters).map(id => [id, bossTranslate[id]])),
    },
  };
}

export function prepareOnlineMode(mode, lib, get, game) {
  if (!onlineModes.includes(mode.name) || mode.name === "identity" || !game.mushokuOnlineContext) return mode;
  const { ui, status: _status } = game.mushokuOnlineContext;
  const modeName = mode.name;
  const result = { ...mode, game: { ...mode.game } };
  const state = () => Object.fromEntries([...game.players, ...game.dead].map(p => [p.playerid, { identity: p.identity, side: p.side, boss: p === game.boss }]));
  result.game.getState = state;
  result.game.updateState = function (snapshot) {
    for (const id in snapshot) {
      const p = lib.playerOL[id];
      if (!p) continue;
      Object.assign(p, { side: snapshot[id].side, identity: snapshot[id].identity, identityShown: true });
      if (snapshot[id].boss) { game.boss = p; game.zhu = p; }
      else if (p.identity === "zhu") game.zhu = p;
      if (lib.configOL.mode === "versus") {
        p.node.identity.firstChild.textContent = p.side === game.me.side ? "友" : "敌";
        p.node.identity.dataset.color = `${p.side}zhu`;
      } else p.setIdentity(p.identity);
    }
  };
  result.game.chooseCharacterOL = function () {
    const next = game.createEvent("chooseCharacterOL");
    next.setContent(async () => {
      let boss;
      const players = game.players;
      if (modeName === "boss") {
        boss = players.find(p => p !== game.me && (!p.ws || p.ws.closed));
        if (!boss) throw new Error("Boss挑战须保留一个AI席位。");
        const bossName = lib.configOL.boss_character || "boss_mt_roxy";
        boss.init(bossName);
        game.boss = game.zhu = boss;
        for (const p of players) { p.side = p === boss; p.identity = p === boss ? "zhu" : "fan"; }
      } else if (modeName === "doudizhu") {
        const landlord = players[Math.floor(Math.random() * players.length)];
        game.zhu = landlord;
        for (const p of players) { p.identity = p === landlord ? "zhu" : "fan"; p.side = p === landlord; }
      } else {
        const offset = Math.random() < 0.5;
        players.forEach((p, i) => { p.side = (i % 2 === 0) === offset; p.identity = p.side ? "zhu" : "fan"; });
        _status.firstAct = players[Math.floor(Math.random() * players.length)];
      }
      const selecting = players.filter(p => p !== boss);
      const pools = allocateChoices(availableCharacters(lib.configOL), selecting.map(p => p.playerid));
      game.broadcastAll((snapshot, bossName) => {
        for (const id in snapshot) {
          const p = lib.playerOL[id];
          p.side = snapshot[id].side; p.identity = snapshot[id].identity; p.identityShown = true; p.ai.shown = 1;
          if (snapshot[id].boss) {
            if (!p.name) p.init(bossName);
            game.boss = game.zhu = p;
          } else if (lib.configOL.mode === "doudizhu" && p.identity === "zhu") game.zhu = p;
          if (lib.configOL.mode === "versus") {
            p.node.identity.firstChild.textContent = p.side === game.me.side ? "友" : "敌";
            p.node.identity.dataset.color = `${p.side}zhu`;
          } else p.setIdentity(p.identity);
        }
        ui.arena.classList.add("choose-character");
      }, state(), boss?.name);
      const choices = selecting.map(p => [p, { createDialog: ["选择角色", [pools[p.playerid], "characterx"]], selectButton: 1, forced: true }]);
      const selected = await game.me.chooseButtonOL(choices).forResult();
      const names = {};
      for (const p of selecting) {
        const choice = selected?.[p.playerid]?.links?.[0];
        names[p.playerid] = pools[p.playerid].includes(choice) ? choice : pools[p.playerid][0];
      }
      game.broadcastAll((names) => {
        for (const id in names) if (!lib.playerOL[id].name) lib.playerOL[id].init(names[id]);
        ui.arena.classList.remove("choose-character");
      }, names);
      if (modeName === "doudizhu" && !game.zhu.isInitFilter("noZhuHp")) {
        game.broadcastAll(zhu => { zhu.maxHp++; zhu.hp++; zhu.update(); }, game.zhu);
      }
      _status.characterlist = availableCharacters(lib.configOL).filter(id => !Object.values(names).includes(id));
      game.syncState();
    });
    return next;
  };
  if (modeName === "boss") {
    Object.assign(lib.character, bossCharacters);
    result.start = [
      async () => { game.waitForPlayer(); },
      async () => { game.randomMapOL(); },
      async event => {
        game.syncState();
        await event.trigger("gameStart");
        game.gameDraw(game.boss, 4);
        game.phaseLoop(game.boss);
      },
    ];
    result.game.getRoomInfo = intro => intro.add('<div class="text chat">三名挑战者合作对抗AI Boss；不足人数由AI补位。</div>');
    result.game.checkOnlineResult = player => !!game.boss && (player.side ? game.boss.isAlive() : !game.boss.isAlive());
    result.game.checkResult = () => {
      if (!game.boss.isAlive() || !game.hasPlayer(p => !p.side)) game.over(!game.boss.isAlive());
    };
    result.element = { ...mode.element, player: { ...mode.element?.player, dieAfter() { game.checkResult(); } } };
  }
  return result;
}
