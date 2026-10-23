import characters from "./mushoku-characters.js";
import { characterPacks, packForCharacter } from "./mushoku-rosters.js";
import { bossCharacters, bossTranslate, resolveBossCharacter } from "./mushoku-boss.js";

export const onlineModes = ["identity", "doudizhu", "versus", "boss"];
export function roomSeats(config) {
  if (config.mode === "doudizhu") return 3;
  if (config.mode === "versus") return config.versus_mode === "1v1" ? 2 : 4;
  if (config.mode === "boss") return 4;
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

// Shuffle claimants before honoring preferences: neither host nor seat order wins a tie.
export function allocateRoles(seatIds, slots, preferences = {}, random = Math.random) {
  if (seatIds.length !== slots.length || new Set(seatIds).size !== seatIds.length) throw new Error("席位与阵营人数不匹配。");
  const shuffle = list => {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };
  const remaining = shuffle([...slots]), order = shuffle([...seatIds]), assigned = {};
  for (const id of order) {
    const index = remaining.indexOf(preferences[id]);
    if (index >= 0) assigned[id] = remaining.splice(index, 1)[0];
  }
  for (const id of order) if (!(id in assigned)) assigned[id] = remaining.pop();
  return assigned;
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
    vs.connect_versus_mode.item = { "1v1": "1对1（单将对决）", "2v2": "2对2" };
    vs.connect_versus_mode.init = "2v2";
    const saved = lib.config?.mode_config?.versus?.connect_versus_mode;
    if (!["1v1", "2v2"].includes(saved)) game.saveConfig("connect_versus_mode", "2v2", "versus");
    vs.update = (config, map) => {
      for (const key of ["connect_choice_num", "connect_replace_number"]) map[key]?.hide();
      for (const key of ["connect_replace_handcard", "connect_olfeiyang_four"]) {
        if (config.connect_versus_mode === "2v2") map[key]?.show();
        else map[key]?.hide();
      }
    };
  }
  if (lib.mode.boss) lib.mode.boss.connect = {
    connect_boss_character: {
      name: "挑战Boss", init: "random", frequent: true,
      item: { random: "随机Boss", ...Object.fromEntries(Object.keys(bossCharacters).map(id => [id, bossTranslate[id]])) },
    },
  };
  for (const name of onlineModes) if (lib.mode[name]?.connect) {
    lib.mode[name].connect.connect_team_mode = {
      name: "阵营分配", init: "random", frequent: true,
      item: { random: "随机分配", free: "自由选择" },
      intro: "自由选择时先选择身份或队伍，人数超额则随机抽签，其余席位自动补齐；随机模式中真人也可能成为Boss。",
    };
  }
}

export function prepareOnlineMode(mode, lib, get, game) {
  if (!onlineModes.includes(mode.name) || !game?.mushokuOnlineContext) return mode;
  const { ui, status: _status } = game.mushokuOnlineContext;
  const modeName = mode.name;
  const result = { ...mode, game: { ...mode.game } };
  const chooseRoles = async slots => {
    const preferences = {};
    if (lib.configOL.team_mode === "free") {
      const labels = modeName === "identity" ? { zhu: "主公", zhong: "忠臣", fan: "反贼", nei: "内奸", commoner: "平民" }
        : modeName === "boss" ? { zhu: "Boss", fan: "挑战者" }
        : modeName === "doudizhu" ? { zhu: "地主", fan: "农民" } : { zhu: "甲队", fan: "乙队" };
      const options = [["random", "随机"], ...[...new Set(slots)].map(role => [role, `${labels[role] || role}（${slots.filter(s => s === role).length}人）`])];
      const humans = game.players.filter(p => p === game.me || p.isOnline());
      const choices = humans.map(p => [p, { createDialog: ["选择阵营（超额随机抽签，空缺自动补位）", [options, "textbutton"]], selectButton: 1, forced: true }]);
      const selected = await game.me.chooseButtonOL(choices).forResult();
      for (const p of humans) preferences[p.playerid] = selected?.[p.playerid]?.links?.[0];
    }
    return allocateRoles(game.players.map(p => p.playerid), slots, preferences);
  };
  // Native identity selection retains its private role messages, special identities and lord rules.
  if (modeName === "identity") {
    result.game.chooseMushokuRoles = chooseRoles;
    return result;
  }
  const state = () => Object.fromEntries([...game.players, ...game.dead].map(p => [p.playerid, { identity: p.identity, side: p.side, boss: p === game.boss }]));
  result.game.getState = state;
  result.game.updateState = function (snapshot) {
    for (const id in snapshot) if (lib.playerOL[id]) Object.assign(lib.playerOL[id], { side: snapshot[id].side, identity: snapshot[id].identity, identityShown: true });
    for (const id in snapshot) {
      const p = lib.playerOL[id];
      if (!p) continue;
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
      const slots = modeName === "versus" ? players.map((p, i) => i < players.length / 2 ? "zhu" : "fan") : players.map((p, i) => i === 0 ? "zhu" : "fan");
      const roles = await chooseRoles(slots);
      for (const p of players) { p.identity = roles[p.playerid]; p.side = p.identity === "zhu"; }
      if (modeName === "boss") {
        boss = players.find(p => p.side);
        const bossName = resolveBossCharacter(lib.configOL);
        boss.init(bossName);
        game.boss = game.zhu = boss;
      } else if (modeName === "doudizhu") {
        game.zhu = players.find(p => p.side);
      } else {
        _status.firstAct = players[Math.floor(Math.random() * players.length)];
      }
      const selecting = players.filter(p => p !== boss);
      const pools = allocateChoices(availableCharacters(lib.configOL), selecting.map(p => p.playerid));
      game.broadcastAll((snapshot, bossName) => {
        for (const id in snapshot) {
          const p = lib.playerOL[id];
          p.side = snapshot[id].side; p.identity = snapshot[id].identity; p.identityShown = true; p.ai.shown = 1;
        }
        for (const id in snapshot) {
          const p = lib.playerOL[id];
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
  if (modeName === "boss" || modeName === "versus") {
    if (modeName === "boss") Object.assign(lib.character, bossCharacters);
    result.start = [
      async () => { game.waitForPlayer(); },
      async () => { game.randomMapOL(); },
      async event => {
        game.syncState();
        await event.trigger("gameStart");
        let first = modeName === "boss" ? game.boss : _status.firstAct;
        if (modeName === "versus") {
          _status.first_less = true;
          if (lib.configOL.versus_mode !== "1v1" && first.next.side === first.side) first = first.next;
          _status.firstAct = first;
          if (lib.configOL.versus_mode === "2v2") {
            if (lib.configOL.olfeiyang_four) first.previousSeat.addSkill("olfeiyang");
            game.addGlobalSkill("versus_viewHandcard");
          }
        }
        game.gameDraw(first, p => modeName === "versus" && lib.configOL.versus_mode === "2v2" && lib.configOL.replace_handcard && p === first.previousSeat ? 5 : 4);
        game.phaseLoop(first);
      },
    ];
    result.game.getRoomInfo = intro => intro.add(`<div class="text chat">${modeName === "boss" ? "一名Boss对抗三名挑战者，真人可以担任Boss" : lib.configOL.versus_mode === "1v1" ? "1对1单将对决，无替补" : "2对2团队对决"}；${lib.configOL.team_mode === "free" ? "自由选择阵营" : "随机分配阵营"}；不足人数由AI补位。</div>`);
    result.game.checkOnlineResult = player => modeName === "boss" ? !!game.boss && (player.side ? game.boss.isAlive() : !game.boss.isAlive()) : game.hasPlayer(p => p.side === player.side);
    result.game.checkResult = () => {
      if (modeName === "boss") {
        if (!game.boss.isAlive() || !game.hasPlayer(p => !p.side)) game.over(game.me.side === game.boss.isAlive());
      } else if (!game.hasPlayer(p => p.side) || !game.hasPlayer(p => !p.side)) game.over(game.hasPlayer(p => p.side === game.me.side));
    };
    result.element = { ...mode.element, player: { ...mode.element?.player, dieAfter() { game.checkResult(); } } };
  }
  return result;
}
