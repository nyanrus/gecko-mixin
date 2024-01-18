import { processAll4Test } from "xpidl2dts";

import { fileURLToPath } from "url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
process.chdir(__dirname);

processAll4Test(
	"../gecko-dev",
	[
		"xpcom",
		"netwerk",
		"dom",
		"uriloader",
		"services",
		"widget",
		"image",
		"layout",
		"js",
		"toolkit",
		"caps",
		"intl",
		"storage",
		"xpfe",
		"docshell",
		"modules/libpref",
		"tools/profiler/gecko",
	],
	"../@types/generated/firefox",
);
