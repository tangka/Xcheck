// chrome.browserAction.onClicked.addListener(function() {
// 	chrome.windows.create({
// 		// Just use the full URL if you need to open an external page
// 		url: chrome.runtime.getURL("popup.html"),
// 		type: "popup",
// 		width: 550,
// 		height: 600
// 	  });
// });
import {
	ALL_URLS,
	BLOCKING,
	EMPTY_STRING,
	MILLISECONDS_PER_WEEK,
	REQUEST_HEADERS,
	RESPONSE_HEADERS,
	JSON_CONFIG,
	DISABLED,
	CLEAR_CACHE_ENABLED,
	CORS_ENABLED_STORAGE_KEY,
	VM_KEY,
	DIAMOND_KEY,
	ACTIVE_KEYS,
	USE_CHROME_STORAGE_SYNC_FN,
	GREY_ICON_PATH,
	BLUE_ICON_PATH,
	DARK_MODE_MEDIA,
} from '../check/constants';
import {
	BadgeText,
	Enabled,
	IconBackgroundColor,
} from '../check/enums';
import forward from '../check/forward';
import { ChromeStorageManager } from '../check/chrome-storage';
import { formatRules } from '../check/utils';
import Axios from "Axios";
import { message } from '_antd@3.26.20@antd';

const csmInstance = new ChromeStorageManager({
	useChromeStorageSyncFn: USE_CHROME_STORAGE_SYNC_FN,
});

let clearRunning: boolean = false;
let clearCacheEnabled: boolean = true;
let corsEnabled: boolean = true;
let parseError: boolean = false;
let jsonActiveKeys = ['0'];
let conf: StorageJSON = {
	0: {
		[VM_KEY]: [],
		[DIAMOND_KEY]: [],
	},
};

interface SingleConfig {
	[VM_KEY]: Array<[]>;
	[DIAMOND_KEY]: string[];
}

interface StorageJSON {
	0: SingleConfig;
	[key: string]: any;
}

csmInstance.get({
	[JSON_CONFIG]: {
		0: {
			[VM_KEY]: [],
			[DIAMOND_KEY]: [],
		},
	},
	[ACTIVE_KEYS]: ['0'],
}, (result: any) => {
	jsonActiveKeys = result[ACTIVE_KEYS];
	if (result && result[JSON_CONFIG]) {
		conf = result[JSON_CONFIG];
		const config = getActiveConfig(conf);
		forward[JSON_CONFIG] = { ...config };
	} else {
		forward[JSON_CONFIG] = {
			[VM_KEY]: [],
			[DIAMOND_KEY]: [],
		};
		parseError = false;
	}
});

function getActiveConfig(config: StorageJSON): object {
	const activeKeys = [...jsonActiveKeys];
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

csmInstance.get(
	{
		[DISABLED]: Enabled.YES,
		[CLEAR_CACHE_ENABLED]: Enabled.YES,
		[CORS_ENABLED_STORAGE_KEY]: Enabled.YES,
	},
	(result: any) => {
		forward[DISABLED] = result[DISABLED];
		clearCacheEnabled = result[CLEAR_CACHE_ENABLED] === Enabled.YES;
		corsEnabled = result[CORS_ENABLED_STORAGE_KEY] === Enabled.YES;
		setIcon();
	}
);


chrome.storage.onChanged.addListener((changes) => {

	if (changes[ACTIVE_KEYS]) {
		jsonActiveKeys = changes[ACTIVE_KEYS].newValue;
	}

	if (changes[JSON_CONFIG]) {
		const config = getActiveConfig(changes[JSON_CONFIG].newValue);
		forward[JSON_CONFIG] = { ...config };
	}

	if (changes[DISABLED]) {
		forward[DISABLED] = changes[DISABLED].newValue;
	}

	if (changes[CLEAR_CACHE_ENABLED]) {
		clearCacheEnabled = changes[CLEAR_CACHE_ENABLED].newValue === Enabled.YES;
	}

	if (changes[CORS_ENABLED_STORAGE_KEY]) {
		corsEnabled = changes[CORS_ENABLED_STORAGE_KEY].newValue === Enabled.YES;
	}

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
			const config = getActiveConfig(conf);
			forward[JSON_CONFIG] = { ...config };
		}
		setIcon();
	});

	checkAndChangeIcons()
});

// chrome.webRequest.onBeforeRequest.addListener(
// 	(details) => {
// 		if (forward[DISABLED] !== Enabled.NO) {
// 			if (clearCacheEnabled) {
// 				clearCache();
// 			}

// 			return forward.onBeforeRequestCallback(details);
// 		}
// 		return {};
// 	},
// 	{
// 		urls: [ALL_URLS],
// 	},
// 	[BLOCKING]
// );

// Breaking the CORS Limitation
// chrome.webRequest.onHeadersReceived.addListener(
// 	headersReceivedListener,
// 	{
// 		urls: [ALL_URLS],
// 	},
// 	[BLOCKING, RESPONSE_HEADERS]
// );

// chrome.webRequest.onBeforeSendHeaders.addListener(
// 	(details) => forward.onBeforeSendHeadersCallback(details),
// 	{ urls: [ALL_URLS] },
// 	[BLOCKING, REQUEST_HEADERS]
// );

// chrome.webRequest.onErrorOccurred.addListener(
// 	(details) => forward.onErrorOccurredCallback(details),
// 	{ urls: [ALL_URLS] },
// );

function setBadgeAndBackgroundColor(
	text: string | number,
	color: string
): void {
	const { browserAction } = chrome;
	browserAction.setBadgeText({
		text: EMPTY_STRING + text,
	});
	browserAction.setBadgeBackgroundColor({
		color,
	});
}
function setIcon(): void {
	if (parseError) {
		setBadgeAndBackgroundColor(BadgeText.ERROR, IconBackgroundColor.ERROR);
		return;
	}

	if (forward[DISABLED] !== Enabled.NO) {
		let config = formatRules(forward[JSON_CONFIG]);
		setBadgeAndBackgroundColor(
			config.length,
			IconBackgroundColor.ON
		);
		// if (config.length > 0) {
		// 	Axios.all(config.map((v: string[]) => Axios({ url: v[1] }))).catch(e => message.error(e));
		// }
	} else {
		setBadgeAndBackgroundColor(BadgeText.OFF, IconBackgroundColor.OFF);
		return;
	}
}

function checkAndChangeIcons() {
	const isDarkMode = window.matchMedia(DARK_MODE_MEDIA);
	if (isDarkMode && isDarkMode.matches) {
		chrome.browserAction.setIcon({ path: BLUE_ICON_PATH });
	} else {
		chrome.browserAction.setIcon({ path: GREY_ICON_PATH });
	}
}

// check when extension is loaded
checkAndChangeIcons();