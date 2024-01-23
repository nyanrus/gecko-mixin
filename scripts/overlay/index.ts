import { DOMParser } from "linkedom";

import type { XMLDocument } from "../../node_modules/linkedom/types/esm/xml/document.js";
import type { Element } from "../../node_modules/linkedom/types/esm/interface/element.js";
import { getChromeRPath, getObjDirs } from "../misc/objdir.js";

import fs from "fs/promises";
import { readJarManifests } from "../misc/readJarManifest.js";

process.chdir(import.meta.dirname);

const dirs = await getObjDirs();

//* remove profile to force reload
try {
	await fs.access(`${dirs[0]}/tmp`);
	fs.rm(`${dirs[0]}/tmp`, { recursive: true });
} catch {}

const db = await readJarManifests(
	"../../gecko-dev",
	["browser/base/jar.mn"],
	true,
);

type MixinXMLDocument = XMLDocument & {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	createElementMixin: (localName: any) => Element;
};

//* browser.xhtml
{
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

	function transformBrowserXHTML(document: MixinXMLDocument) {
		const script = document.createElementMixin("script");
		script.innerHTML = `Services.scriptloader.loadSubScript("chrome://mixin/content/browser.overlay.js")`;
		document.querySelector("head").appendChild(script);
	}

	transformBrowserXHTML(document);

	fs.writeFile(rpath_browser_xhtml, document.toString());
}
