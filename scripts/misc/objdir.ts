import fg from "fast-glob";

process.chdir(import.meta.dirname);

export async function getObjDirs(): Promise<string[]> {
	return await fg("../../gecko-dev/obj*/", { onlyDirectories: true });
}

export interface IChromeType {
	jar_name: string;
	chrome: {
		type: "content" | "skin";
		name: string;
		base_path: string;
	};
	list: {
		vpath: string;
		rpath: string;
	}[];
	dir: "browser/chrome" | "chrome";
	overrides: {
		from: string;
		to: string;
	}[];
}

export class ChromeType implements IChromeType {
	jar_name: string;
	chrome: { type: "content" | "skin"; name: string; base_path: string };
	list: { vpath: string; rpath: string }[];
	dir: "browser/chrome" | "chrome";
	overrides: { from: string; to: string }[];
	constructor(dir: "browser/chrome" | "chrome") {
		this.jar_name = "";
		this.chrome = {
			type: "content",
			name: "",
			base_path: "",
		};
		this.list = [];
		this.dir = dir;
		this.overrides = [];
	}
}

export async function getChromeRPath(
	database: ChromeType[],
	chrome: `chrome://${string}`,
): Promise<string> {
	console.log(JSON.stringify(database));
	const _chrome = chrome.replace("chrome://", "");
	for (const chromeType of database) {
		for (const elem of chromeType.list) {
			if (elem.vpath.includes("browser.xhtml")) {
				console.log(elem.vpath);
				console.log(chromeType.chrome.base_path);
				console.log(
					elem.vpath.replace(
						chromeType.chrome.base_path.replace("%", ""),
						`${chromeType.chrome.name}/${chromeType.chrome.type}/`,
					),
				);
			}
			if (
				_chrome ===
				elem.vpath.replace(
					chromeType.chrome.base_path.replace("%", ""),
					`${chromeType.chrome.name}/${chromeType.chrome.type}/`,
				)
			) {
				return `${chromeType.dir}/${chromeType.jar_name}/${elem.vpath}`;
			}
		}
	}
}
