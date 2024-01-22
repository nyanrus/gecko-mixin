import { DOMParser, HTMLScriptElement } from "linkedom";
import { ChromeType, getChromeRPath, getObjDirs } from "../misc/objdir.js";
import { parseJarManifest } from "../misc/parser.js";

import fs from "fs/promises";

process.chdir(import.meta.dirname);

const dirs = await getObjDirs();

async function readJarManifests(
	root: string,
	paths: string[],
): Promise<ChromeType[]> {
	const ret = [];
	for (const path of paths) {
		const rpath = `${root}/${path}`;
		console.log(rpath);
		const file = await fs.readFile(rpath);
		ret.push(...parseJarManifest(file.toString(), "browser/chrome"));
	}
	return ret;
}

const db = await readJarManifests("../../gecko-dev", ["browser/base/jar.mn"]);

try {
	await fs.access(`${dirs[0]}/tmp`);
	fs.rm(`${dirs[0]}/tmp`, { recursive: true });
} catch {}

// console.log(
// 	"result: " +
// 		JSON.stringify(
// 			,
// 		),
// );

const path_browserxhtml = await getChromeRPath(
	db,
	"chrome://browser/content/browser.xhtml",
);

const rpath_browser_xhtml = `${dirs[0]}/dist/bin/${path_browserxhtml}`;

const document = new DOMParser().parseFromString(
	(await fs.readFile(rpath_browser_xhtml)).toString(),
	"text/xml",
);

for (const elem of document.querySelectorAll("[data-geckomixin]")) {
	elem.remove();
}

const script = document.createElement("script");
script.innerHTML = `Services.scriptloader.loadSubScript("chrome://mixin/content/browser.overlay.js")`;
script.dataset.geckomixin = "";

document.querySelector("head").appendChild(script);

// const div = document.createElement("html:div");
// div.textContent = "I'm fine";
// div.dataset.geckomixin = "";

// //https://stackoverflow.com/a/23047888/22665207
// document
// 	.querySelector("html\\:body")
// 	.insertBefore(div, document.querySelector("#a11y-announcement"));

// const title = document.createElement("title");
// title.dataset.geckomixin = "";
// title.textContent = "HALLO";

// document.querySelector("head").appendChild(title);

//console.log(document.querySelector("head").querySelector("[data-geckomixin]"));

//console.log(dom.serialize());
fs.writeFile(rpath_browser_xhtml, document.toString());
