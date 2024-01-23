import { DOMParser } from "linkedom";

import type { XMLDocument } from "../../node_modules/linkedom/types/esm/xml/document.js";
import type { Element } from "../../node_modules/linkedom/types/esm/interface/element.js";
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

const path_browserxhtml = await getChromeRPath(
	db,
	"chrome://browser/content/browser.xhtml",
);

const rpath_browser_xhtml = `${dirs[0]}/dist/bin/${path_browserxhtml}`;

const document = new DOMParser().parseFromString(
	(await fs.readFile(rpath_browser_xhtml)).toString(),
	"text/xml",
) as MixinXMLDocument;

Object.defineProperty(document, "createElementMixin", {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	value: (localName: any) => {
		const elem = document.createElement(localName);
		elem.dataset.geckomixin = "";
		return elem;
	},
});
for (const elem of document.querySelectorAll("[data-geckomixin]")) {
	elem.remove();
}

type MixinXMLDocument = XMLDocument & {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	createElementMixin: (localName: any) => Element;
};

function transformBrowserXHTML(document: MixinXMLDocument) {
	const script = document.createElementMixin("script");
	console.log(script);
	//script.dataset.geckomixin = "";
	script.innerHTML = `Services.scriptloader.loadSubScript("chrome://mixin/content/browser.overlay.js")`;
	document.querySelector("head").appendChild(script);
}

transformBrowserXHTML(document);

fs.writeFile(rpath_browser_xhtml, document.toString());
