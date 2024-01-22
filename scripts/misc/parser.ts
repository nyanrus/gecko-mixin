import { ChromeType } from "./objdir.js";

export function parseJarManifest(
	src: string,
	dir: "browser/chrome" | "chrome",
): ChromeType[] {
	const ret = [];
	const _src = src.replaceAll(/#.*[\s]/g, "").replaceAll(/[ ]+/g, " ");
	const lines = _src.split("\n");
	let tmp = new ChromeType(dir);
	for (const line of lines) {
		//jarname
		if (line.endsWith(":")) {
			if (tmp.jar_name !== "") {
				ret.push(tmp);
				tmp = new ChromeType(dir);
			}
			tmp.jar_name = line.replace(".jar:", "");
			continue;
		}
		//chrome
		if (line.startsWith("%")) {
			const list = line.replace("% ", "").split(" ");
			switch (list[0]) {
				case "content": {
					if (tmp.chrome.name !== "") {
						ret.push(tmp);
						const jar_name = tmp.jar_name;
						tmp = new ChromeType(dir);
						tmp.jar_name = jar_name;
					}
					tmp.chrome.type = "content";
					tmp.chrome.name = list[1];
					tmp.chrome.base_path = list[2];
					break;
				}
				case "skin": {
					if (tmp.chrome.name !== "") {
						ret.push(tmp);
						const jar_name = tmp.jar_name;
						tmp = new ChromeType(dir);
						tmp.jar_name = jar_name;
					}
					tmp.chrome.type = "skin";
					tmp.chrome.name = list[1];
					// process skinname?
					tmp.chrome.base_path = list[3];
					break;
				}
				case "override": {
					tmp.overrides.push({
						from: list[1],
						to: list[2],
					});
					break;
				}
				default: {
					console.log(list);
					throw Error(`it's not content or skin`);
				}
			}
			continue;
		}
		if (line === "") {
			continue;
		}
		//resource
		{
			let _line = line.trim();
			if (_line.startsWith("*")) {
				_line = _line.replace("* ", "");
			}
			const list = _line.split(" ");
			console.log(list);
			tmp.list.push({
				vpath: list[0],
				rpath: list[1].replaceAll(/[\(\)]/g, ""),
			});
		}
	}
	ret.push(tmp);
	return ret;
}
