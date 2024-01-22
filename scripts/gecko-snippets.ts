import { processAll4Test } from "xpidl2dts";

process.chdir(import.meta.dirname);

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
