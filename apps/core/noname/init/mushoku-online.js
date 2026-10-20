import characters from "./mushoku-characters.js";

export const onlineProtocol = "mushoku-eight-sakura-2";
export const sakuraLocalPort = 8080;

/** A plain TCP tunnel carries ws, not TLS. Never infer wss from an old lobby setting. */
export function parseSakuraAddress(value) {
 const input = String(value ?? "").trim();
 if (!input || /\s/.test(input)) throw new Error("请填写 Sakura Frp 日志中的节点域名:远程端口。");
 if (/^[a-z]+:\/\//i.test(input) && !input.startsWith("ws://")) throw new Error("请使用 TCP 隧道地址（节点域名:远程端口或 ws://），不支持 HTTP、UDP 或 TLS 隧道。");
 let url;
 try { url = new URL(input.startsWith("ws://") ? input : `ws://${input}`); }
 catch { throw new Error("联机地址格式错误，请填写节点域名:远程端口。"); }
 // URL normalizes the explicit default port 80 to an empty string.
 const authority = input.replace(/^ws:\/\//, "").replace(/\/$/, "");
 const port = authority.match(/:(\d+)$/)?.[1];
 if (!port || Number(port) < 1 || Number(port) > 65535 || !url.hostname || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("请填写完整的节点域名:远程端口，不要添加路径或账号信息。");
 return { url: url.href, address: `${url.hostname}:${Number(port)}` };
}

/** Run without room-dependent characterDisabled filters: this also validates pre-room settings. */
export function getOnlineRestriction(config, lib) {
 if (!config || config.mode !== "identity" || (config.identity_mode || "normal") !== "normal") return "Sakura Frp 联机目前仅开放标准身份局。";
 const count = Number(config.number ?? config.player_number);
 if (!Number.isInteger(count) || count < 2 || count > 8) return "联机身份局仅支持 2 至 8 人，禁止角色重复。";
 if (!Array.isArray(config.characterPack) || config.characterPack.length !== 1 || config.characterPack[0] !== "mushoku") return "联机必须且只能启用无职转生角色包。";
 if (!Array.isArray(config.banned)) return "联机禁将配置尚未初始化。";
 const available = Object.keys(characters).filter(id => lib.character[id] && !config.banned.includes(id) && !(lib.connectBanned || []).includes(id)
  && !(lib.config?.forbidai || []).includes(id) && !lib.character[id].isAiForbidden
  && (!config.double_character || !(lib.config?.forbiddouble || []).includes(id))
  && (!lib.characterFilter?.[id] || lib.characterFilter[id](config.mode))).length;
 const needed = count * (config.double_character ? 2 : 1);
 if (needed > available) return `禁止角色重复：房间需要 ${needed} 名角色，当前只有 ${available} 名可用。请减少人数、关闭双将或解除禁将。`;
 // The upstream simultaneous allocation needs at least selectButton candidates per seat.
 for (const role of ["zhu", "zhong", "fan", "nei", "commoner"]) {
  if (Number(config[`choice_${role}`] ?? 3) < (config.double_character ? 2 : 1)) return "选将候选数不能少于每人所需的武将数。";
 }
 return null;
}

export function onlineConfigFromMenu(lib, get, mode) {
 const config = { mode };
 for (const key of Object.keys(lib.mode[mode]?.connect || {})) if (key.startsWith("connect_")) config[key.slice(8)] = get.config(key, mode);
 config.characterPack = (lib.connectCharacterPack || []).filter(pack => !(lib.config.connect_characters || []).includes(pack));
 config.banned = lib.config[`connect_${mode}_banned`] || [];
 return config;
}

export function getPeerRestriction(config) {
 return config?.mushokuProtocol === onlineProtocol ? null : "加入失败：请双方使用相同版本的八角色 Sakura 联机版。";
}
