import { stripJsonComments } from './strip-json-comments';
import { REG, EMPTY_STRING } from './constants';

export function JSONC2JSON(jsonc: string): string {
	return stripJsonComments(jsonc)
		.replace(REG.WHITESPACE, EMPTY_STRING)
		.replace(REG.TRIM_JSON, ($0, $1, $2) => $2);
}

export function JSON_Parse(json: string, cb: (error: object | boolean, json?: object) => void): void {
	try {
		cb(false, JSON.parse(json));
	} catch (e) {
		cb(e);
	}
}

interface IFowardConfig {
	diamond?: any;
	path?: any;
}

export const formatRules = (config: IFowardConfig): string[][] | [] => {
	const defaultPath = {
		"cg-buyer-workbench": "https://g.alicdn.com/platform/cg-buyer-workbench/!cg-buyer-workbench!/app.min.js",
		"cg-supplier-workbench": "https://g.alicdn.com/platform/cg-supplier-workbench/!cg-supplier-workbench!/app.min.js",
		"mcms": "https://lang.alicdn.com/mcms/cg-aecp/!mcms!/cg-aecp_zh-cn.json",
		"rhino-config.po-rhino-app-version": "https://g.alicdn.com/hr-rhino/publish/cgPo/!rhino-config.po-rhino-app-version!/poCreateList.json",
		"rhino-config.pr-rhino-app-version": "https://g.alicdn.com/hr-rhino/publish/cgPr/!rhino-config.pr-rhino-app-version!/prQuery.json",
		"rhino-config.rt-rhino-app-version": "https://g.alicdn.com/hr-rhino/publish/cgRcv/!rhino-config.rt-rhino-app-version!/faList.json",
		"rhino-config.sourcing-rhino-app-version": "https://g.alicdn.com/hr-rhino/publish/cgSr/!rhino-config.sourcing-rhino-app-version!/QuotationTemplateFilterList.json",
		"rhino-config.cgStructure-rhino-app-version": "https://g.alicdn.com/hr-rhino/publish/cgStructure/!rhino-config.cgStructure-rhino-app-version!/PO.json",
		"legaoApps.procurement_contract.appVersion": "https://dev.g.alicdn.com/hr-rhino/publish/LEGAO-procurement_contract/!legaoApps.procurement_contract.appVersion!/myContract.json"
	};
	const defaultDiamond = {
		
	};
	let ___diamond = {};
	console.log(config);
	if (config.diamond.hasOwnProperty("0")) {
		for (let diamondKey in config.diamond) {
			for (let _diamondKey in config.diamond[diamondKey]) {
				___diamond[_diamondKey] = config.diamond[diamondKey][_diamondKey];
			}
		}
	} else {
		___diamond = config.diamond;
	}
	let ___path = {};
	if (config.path.hasOwnProperty("0")) {
		for (let pathKey in config.path) {
			for (let _pathKey in config.path[pathKey]) {
				___path[_pathKey] = config.path[pathKey][_pathKey];
			}
		}
	} else {
		___path = config.path;
	}
	const path = { ...defaultPath, ...___path };
	const diamond = { ...defaultDiamond, ...___diamond };
	let arr = [];
	for (let pathKey in path) {
		if (!~pathKey.indexOf(".")) {
			if (diamond.hasOwnProperty(pathKey)) {
				// arr.push([
				// 	path[pathKey].split("!" + pathKey + "!").join('(.*)'),
				// 	path[pathKey].split("!" + pathKey + "!").join(diamond[pathKey])
				// ]);
				arr.push({
					key: pathKey,
					url: path[pathKey].split("!" + pathKey + "!").join(diamond[pathKey]),
				})
			}
		} else {
			if (diamond.hasOwnProperty(pathKey)) {
				const splitKey = pathKey.split(".");
				let __diamond = diamond;
				for (let item of splitKey) {
					__diamond = __diamond[item];
					if (typeof __diamond === 'string' ) {
						break;
					}
				}
				// arr.push([
				// 	path[pathKey].split("!" + pathKey + "!").join('(.*)'),
				// 	path[pathKey].split("!" + pathKey + "!").join(__diamond)
				// ]);
				arr.push({
					key: pathKey,
					url: path[pathKey].split("!" + pathKey + "!").join(diamond[pathKey]),
				})
			}
		}
	}
	console.log(arr);
	return arr;
};
