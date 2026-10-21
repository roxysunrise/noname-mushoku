/** Touch-friendly preferences; deliberately independent of game/event state. */
export function installMobileAccessibility({ lib, game, ui, get }) {
	if (ui.openDisplaySettings) return;
	const sheet = document.createElement("link");
	sheet.rel = "stylesheet";
	sheet.href = `${lib.assetURL || ""}layout/default/accessibility.css`;
	document.head.appendChild(sheet);
	const valid = (value, fallback = 100) => {
		const number = Number.parseInt(value);
		return Number.isFinite(number) ? Math.max(60, Math.min(140, number)) : fallback;
	};
	const resize = () => {
		ui.updatez();
		ui.update?.();
		for (const callback of lib.onresize || []) if (typeof callback === "function") callback();
	};
	const apply = () => {
		document.documentElement.style.setProperty("--character-size", valid(lib.config.character_size) / 100);
		document.documentElement.dataset.compactCharacters = valid(lib.config.character_size) !== 100 ? "true" : "false";
		document.documentElement.style.setProperty("--handcard-size", valid(lib.config.handcard_size) / 100);
		document.documentElement.dataset.compactHandcards = valid(lib.config.handcard_size) !== 100 ? "true" : "false";
	};
	apply();
	let activePanel;
	function panel(title) {
		activePanel?._close();
		const overlay = document.createElement("div");
		overlay.className = "accessibility-overlay";
		const box = document.createElement("section");
		box.className = "accessibility-panel";
		box.setAttribute("role", "dialog");
		box.setAttribute("aria-modal", "true");
		box.setAttribute("aria-label", title);
		const heading = document.createElement("h2"); heading.textContent = title; box.append(heading);
		const close = () => { overlay._cleanup?.(); overlay.remove(); if (activePanel === overlay) activePanel = undefined; document.removeEventListener("keydown", escape); };
		const escape = event => { if (event.key === "Escape") { event.stopPropagation(); close(); } };
		document.addEventListener("keydown", escape);
		const addButton = (label, action, parent = box) => {
			const button = document.createElement("button"); button.type = "button"; button.textContent = label;
			button.addEventListener("click", event => { event.stopPropagation(); action(); }); parent.append(button); return button;
		};
		addButton("关闭", close).className = "accessibility-close";
		overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
		for (const name of ["click", "touchstart", "touchend", "pointerdown", "pointerup"]) box.addEventListener(name, event => event.stopPropagation());
		overlay._close = close;
		overlay.append(box); document.documentElement.append(overlay); activePanel = overlay;
		return { overlay, box, close, addButton };
	}
	ui.editConnectNickname = () => {
		const { box, close, addButton } = panel("修改联机昵称");
		const input = document.createElement("input"); input.type = "text"; input.maxLength = 12;
			input.value = get.connectNickname(); input.setAttribute("aria-label", "联机昵称，最多12字"); box.append(input);
		const message = document.createElement("p"); message.textContent = "最多12字；新昵称将在下次加入房间时使用。"; box.append(message);
		const save = () => {
			const name = input.value.trim().slice(0, 12);
			if (!name || get.is.banWords(name)) { message.textContent = "请输入有效的昵称。"; input.focus(); return; }
			game.saveConfig("connect_nickname", name); game.saveConfig("connect_nickname", name, "connect");
			for (const element of document.querySelectorAll("[data-edit-nickname]")) element.textContent = name;
			close();
		};
		addButton("保存昵称", save); addButton("取消", close);
		input.addEventListener("keydown", event => { if (event.key === "Enter" && !event.isComposing) save(); });
		input.focus(); input.select();
	};
	ui.openBackgroundSettings = () => {
		const { box, close, addButton } = panel("选择游戏背景");
		const grid = document.createElement("div"); grid.className = "accessibility-backgrounds"; box.append(grid);
		const config = lib.configMenu.appearence.config.image_background;
		const entries = { default: "默认背景", ...config.item };
		for (const [key, label] of Object.entries(entries)) {
			const button = addButton(get.plainText(label || key), () => {
				game.saveConfig("image_background_random", false); config.onclick.call(button, key); close();
			}, grid);
			button.classList.toggle("selected", key === lib.config.image_background);
			button.setAttribute("aria-pressed", String(key === lib.config.image_background));
			// Imported backgrounds may live in IndexedDB; the existing loader owns those URLs.
			if (key !== "default" && !/^(custom|cdv)_/.test(key)) {
				button.style.backgroundImage = `linear-gradient(transparent,rgba(0,0,0,.8)),url("${lib.assetURL || ""}image/background/${key}.jpg")`;
			}
			if (key.startsWith("custom_")) game.getDB?.("image", key, blob => {
				if (!blob || !button.isConnected) return;
				const url = URL.createObjectURL(blob); button.style.backgroundImage = `linear-gradient(transparent,rgba(0,0,0,.8)),url("${url}")`;
				const prior = box.parentNode._cleanup; box.parentNode._cleanup = () => { prior?.(); URL.revokeObjectURL(url); };
			});
		}
	};
	ui.openDisplaySettings = () => {
		const { overlay, box, close, addButton } = panel("显示与操作");
		addButton("修改联机昵称", ui.editConnectNickname);
		addButton("选择游戏背景", ui.openBackgroundSettings);
		const addRange = (label, value, min, max, onInput) => {
			const row = document.createElement("label"); row.className = "accessibility-range";
			const caption = document.createElement("span"); caption.textContent = label;
			const output = document.createElement("output"); output.textContent = `${value}%`;
			const input = document.createElement("input"); input.type = "range"; input.min = min; input.max = max; input.step = 5; input.value = value;
			input.setAttribute("aria-label", label); input.addEventListener("input", () => { output.textContent = `${input.value}%`; onInput(Number(input.value)); });
			row.append(caption, output, input); box.append(row); return input;
		};
		const originalZoom = Number.parseInt(lib.config.ui_zoom) || 100;
		let previewZoom = originalZoom, rollback;
		const setZoom = value => { game.documentZoom = (game.deviceZoom || 1) * value / 100; resize(); };
		const zoom = addRange("整体界面（含手牌）", originalZoom, 50, 150, value => {
			previewZoom = value; setZoom(value); clearTimeout(rollback);
			status.textContent = "预览中，10秒后恢复；点击保留缩放保存。";
			rollback = setTimeout(() => { previewZoom = Number.parseInt(lib.config.ui_zoom) || 100; zoom.value = previewZoom; zoom.dispatchEvent(new Event("change")); zoom.previousElementSibling.textContent = `${previewZoom}%`; setZoom(previewZoom); status.textContent = "已恢复已保存的缩放。"; }, 10000);
		});
		const status = document.createElement("p"); status.setAttribute("aria-live", "polite"); box.append(status);
		overlay._cleanup = () => { clearTimeout(rollback); setZoom(Number.parseInt(lib.config.ui_zoom) || 100); };
		addButton("保留缩放", () => { clearTimeout(rollback); game.saveConfig("ui_zoom", `${previewZoom}%`); status.textContent = "缩放已保存。"; });
		const presets = document.createElement("div"); box.append(presets);
		for (const value of [70,85,100,115]) addButton(`${value}%`, () => { zoom.value=value; zoom.dispatchEvent(new Event("input")); },presets);
		addRange("选将与武将卡尺寸", valid(lib.config.character_size), 60, 140, value => { game.saveConfig("character_size", value); apply(); resize(); });
		addRange("手牌尺寸", valid(lib.config.handcard_size), 60, 140, value => { game.saveConfig("handcard_size", value); apply(); resize(); ui.updatehl?.(); });
		const note = document.createElement("p"); note.textContent = "可先将整体界面调到85%，再单独调整武将卡。手机保持横屏，顶部与屏幕边缘为系统操作留出安全区。"; box.append(note);
		addButton("手机紧凑", () => { clearTimeout(rollback); game.saveConfig("ui_zoom", "85%"); game.saveConfig("character_size", 80); game.saveConfig("handcard_size", 85); apply(); setZoom(85); close(); ui.openDisplaySettings(); });
		addButton("恢复默认尺寸", () => { clearTimeout(rollback); game.saveConfig("ui_zoom", "100%"); game.saveConfig("character_size", 100); game.saveConfig("handcard_size", 100); apply(); setZoom(100); close(); ui.openDisplaySettings(); });
	};
	ui.create.system("显示", ui.openDisplaySettings);
}
