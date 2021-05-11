import {
	JSONC_CONFIG,
	JSON_CONFIG,
	DISABLED,
	CLEAR_CACHE_ENABLED,
	CORS_ENABLED_STORAGE_KEY,
	TAB_LIST,
	EDITING_CONFIG_KEY,
	ACTIVE_KEYS,
	USE_CHROME_STORAGE_SYNC_FN,
	SYNC_STORAGE_DATA_HAS_BEEN_MIGARATED_TO_LOCAL,
	VM_KEY,
	DIAMOND_KEY,
} from './constants';
import { JSONC2JSON, JSON_Parse } from './utils';
import { Enabled } from './enums';

interface ConfigStorage {
	[JSONC_CONFIG]: object;
}
interface OptionsStorage {
	[CLEAR_CACHE_ENABLED]: string;
	[CORS_ENABLED_STORAGE_KEY]: string;
}

interface ChromeStorageManagerProps {
	useChromeStorageSyncFn: boolean;
}
interface SingleConfig {
	[VM_KEY]: Array<[]>;
	[DIAMOND_KEY]: string[];
}

interface StorageJSON {
	0: SingleConfig;
	[key: string]: any;
}
let conf: StorageJSON = {
	0: {
		[VM_KEY]: [],
		[DIAMOND_KEY]: [],
	},
};


export class ChromeStorageManager {
	private storageFn: any;

	constructor(props: ChromeStorageManagerProps) {
		/** 
		**  More details: https://developer.chrome.com/extensions/storage
		**
		**  Property limit between storage.sync and storage.local in QUOTA_BYTES: 
		**  QUOTA_BYTES_PER_ITEM prop in storage.sync is 8,192 and
		**  QUOTA_BYTES prop in storage.sync is 102,400,
		**  which indicates the maximum total amount (in bytes) of data that can be stored in sync storage.sync.
		**  Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError.  
		**
		**  QUOTA_BYTES prop in storage.local is 5,242,880, 
		**  which indicates the maximum amount (in bytes) of data that can be stored in local storage, 
		**  as measured by the JSON stringification of every value plus every key's length.
		*/
		this.storageFn = props.useChromeStorageSyncFn ? window.chrome.storage.sync : window.chrome.storage.local;
	}

	get(keyOrObj: any, callback: Function = (args: any): any => { }) {
		this.storageFn.get(keyOrObj, callback);
	}

	set(obj: any, callback: Function = (args: any): any => { }) {
		this.storageFn.set(obj, callback);
	}
}

const csmInstance = new ChromeStorageManager({
	useChromeStorageSyncFn: USE_CHROME_STORAGE_SYNC_FN, // we can also make this option configurable
});

/**
 * 兼容chrome.storage.sync 历史数据的逻辑
 */
function checkAndSyncHistorialSyncStorageDataToLocal() {
	const historyStorageKeyOrObj = {
		[JSONC_CONFIG]: {
			0: '',
		},
		[JSON_CONFIG]: {},
		[TAB_LIST]: [{
			id: '0',
			name: 'Current',
			active: true,
		}],
		[ACTIVE_KEYS]: ['0'],
	};
	const migaratedFlag = {
		[SYNC_STORAGE_DATA_HAS_BEEN_MIGARATED_TO_LOCAL]: {
			migarated: false,
		},
	};

	// Code below is only for migaration testing
	// 
	// csmInstance.set({
	//   [SYNC_STORAGE_DATA_HAS_BEEN_MIGARATED_TO_LOCAL]: {
	//     migarated: false,
	//   },
	// });

	csmInstance.get(migaratedFlag, (result: any) => {
		if (!result[SYNC_STORAGE_DATA_HAS_BEEN_MIGARATED_TO_LOCAL].migarated) {
			chrome.storage.sync.get(historyStorageKeyOrObj, (hisData: any) => {
				const stash: any = {
					[JSONC_CONFIG]: {},
					[JSON_CONFIG]: {},
				};
				hisData[TAB_LIST].forEach((tab: any) => {
					stash[JSONC_CONFIG][tab.id] = hisData[JSONC_CONFIG][tab.id];
					stash[JSON_CONFIG][tab.id] = hisData[JSON_CONFIG][tab.id];
				})

				csmInstance.set({
					[SYNC_STORAGE_DATA_HAS_BEEN_MIGARATED_TO_LOCAL]: {
						migarated: true,
					},
					...hisData,
					...stash,
				});
			})
		} else {
			console.log('SYNC_STORAGE_DATA_HAS_BEEN_MIGARATED_TO_LOCAL');
		}
	})
}

checkAndSyncHistorialSyncStorageDataToLocal();

function getActiveConfig(config: StorageJSON,activeKeys: []): object {
	// const activeKeys = ['0'];
	const json = config['0'];
	activeKeys.forEach((key: string) => {
		if (config[key] && key !== '0') {
			if (config[key][VM_KEY]) {
				if (!json[VM_KEY]) {
					json[VM_KEY] = [];
				}
				json[VM_KEY] = [...json[VM_KEY], ...config[key][VM_KEY]];
			}

			if (config[key][DIAMOND_KEY]) {
				if (!json[DIAMOND_KEY]) {
					json[DIAMOND_KEY] = [];
				}
				json[DIAMOND_KEY] = [...json[DIAMOND_KEY], ...config[key][DIAMOND_KEY]];
			}
		}
	});
	return json;
}

export function getConfig(editingConfigKey: string): Promise<ConfigStorage> {
	return new Promise((resolve) => {
		csmInstance.get({
			[JSONC_CONFIG]: {
				0: '',
			},
		}, (result: any) => {
			if (typeof result[JSONC_CONFIG] === 'string') {
				return resolve(result[JSONC_CONFIG]);
			}
			resolve(result[JSONC_CONFIG][editingConfigKey]);
		});
	});
}

export function getFormatConfig(activeKeys: []): Promise<any>{
	return new Promise((resolve) => {
		csmInstance.get({
			[JSON_CONFIG]: {
				0: {
					[VM_KEY]: [],
					[DIAMOND_KEY]: [],
				},
			},
		}, (result: any) => {
			if (result && result[JSON_CONFIG]) {
				conf = result[JSON_CONFIG];
				const config = getActiveConfig(conf,activeKeys);
				resolve({ ...config });
			}
		});
	}
};

export function getActiveKeys(): Promise<any> {
	return new Promise((resolve) => {
		csmInstance.get(
			{
				[ACTIVE_KEYS]: ['0'],
			}, (result: any) => {
				resolve(result[ACTIVE_KEYS]);
			});
	});
}

export function setActiveKeys(keys?: string[]): Promise<object> | void {
	return new Promise((resolve) => {
		csmInstance.set(
			{
				[ACTIVE_KEYS]: keys,
			},
			resolve
		);
	});
}

export function getConfigItems(): Promise<any> {
	return new Promise((resolve) => {
		csmInstance.get(
			{
				[TAB_LIST]: [{
					id: '0',
					name: 'Current',
					active: true,
				}],
			}, (result: any) => {
				resolve(result[TAB_LIST]);
			});
	});
}

export function setConfigItems(items?: any): Promise<object> | void {
	return new Promise((resolve) => {
		csmInstance.set(
			{
				[TAB_LIST]: items.slice(),
				[ACTIVE_KEYS]: items.map((item: any) => {
					if (item.active) {
						return item.id;
					}
				}),
			},
			resolve
		);
	});
}

export function getEditingConfigKey(): Promise<string> {
	return new Promise((resolve) => {
		csmInstance.get(
			{
				[EDITING_CONFIG_KEY]: '0',
			}, (result: any) => {
				resolve(result[EDITING_CONFIG_KEY]);
			});
	});
}

export function setEditingConfigKey(key: string): Promise<object> | void {
	return new Promise((resolve) => {
		csmInstance.set(
			{
				[EDITING_CONFIG_KEY]: key,
			},
			resolve
		);
	});
}

export function saveConfig(jsonc: string, editingConfigKey: string): Promise<any> | void {
	const json = JSONC2JSON(jsonc);

	return new Promise((resolve) => {
		csmInstance.get({
			[JSONC_CONFIG]: {},
			[JSON_CONFIG]: {},
		}, (result: any) => {
			// migrate
			if (typeof result[JSONC_CONFIG] === 'string') {
				result[JSONC_CONFIG] = {};
				result[JSON_CONFIG] = {};
			}

			result[JSONC_CONFIG][editingConfigKey] = jsonc;

			JSON_Parse(json, (error, parsedJSON) => {
				if (!error) {
					result[JSON_CONFIG][editingConfigKey] = parsedJSON;
					return;
				}
				result[JSON_CONFIG][editingConfigKey] = '';
			});

			csmInstance.set(
				result,
				resolve
			);
		});
	});
}

export function getChecked(): Promise<string> {
	return new Promise((resolve) => {
		csmInstance.get(DISABLED, (result: any) => {
			resolve(result[DISABLED]);
		});
	});
}

export function setChecked(checked?: boolean): Promise<object> | void {
	return new Promise((resolve) => {
		csmInstance.set(
			{
				[DISABLED]: checked ? Enabled.YES : Enabled.NO,
			},
			resolve
		);
	});
}

export function getOptions(): Promise<OptionsStorage> {
	return new Promise((resolve) => {
		csmInstance.get(
			{
				[CLEAR_CACHE_ENABLED]: Enabled.YES,
				[CORS_ENABLED_STORAGE_KEY]: Enabled.YES,
			},
			(result: any) => {
				resolve({
					[CLEAR_CACHE_ENABLED]: result.clearCacheEnabled,
					[CORS_ENABLED_STORAGE_KEY]: result.corsEnabled,
				});
			}
		);
	});
}

export function setOptions(options: any): Promise<OptionsStorage> | void {
	return new Promise((resolve) => {
		csmInstance.set(
			{
				clearCacheEnabled: options.clearCacheEnabled
					? Enabled.YES
					: Enabled.NO,
				corsEnabled: options.corsEnabled ? Enabled.YES : Enabled.NO,
			},
			resolve
		);
	});
}

export function openLink(url: string, isInner: boolean = false): void {
	chrome.tabs.create(
		{ url: isInner ? chrome.extension.getURL(url) : url },
		(tab) => {
			// Tab opened.
		}
	);
}



export function removeUnusedItems() {
	csmInstance.get({
		[JSONC_CONFIG]: {},
		[JSON_CONFIG]: {},
		[TAB_LIST]: [{
			id: '0',
			name: 'Current',
			active: true,
		}],
	}, (result: any) => {
		let stash: any = {
			[JSONC_CONFIG]: {},
			[JSON_CONFIG]: {},
		};
		result[TAB_LIST].forEach((tab: any) => {
			stash[JSONC_CONFIG][tab.id] = result[JSONC_CONFIG][tab.id];
			stash[JSON_CONFIG][tab.id] = result[JSON_CONFIG][tab.id];
		})
		csmInstance.set(
			stash,
			() => { }
		);
	});
}
