export const REG = {
  TRIM_JSON: /(,+)([^a-z0-9["])/gi,
  CHROME_EXTENSION: /^chrome-extension:\/\//i,
  // support [ ] ( ) \ * ^ $
  FORWARD: /\\|\[|]|\(|\)|\*|\$|\^/i,
  WHITESPACE: /\s+/g,
  X_HEADER: /^x-/,
};

export const ALL_URLS = '<all_urls>';
export const BLOCKING = 'blocking';
export const REQUEST_HEADERS = 'requestHeaders';
export const RESPONSE_HEADERS = 'responseHeaders';
export const DEFAULT_CREDENTIALS_RESPONSE_HEADERS =
  'Content-Type, access-control-allow-headers, Authorization, X-Requested-With, X-Referer';
export const CORS = {
  METHODS: 'access-control-allow-methods',
  CREDENTIALS: 'access-control-allow-credentials',
  ORIGIN: 'access-control-allow-origin',
  HEADERS: 'access-control-allow-headers',
};
export const ACCESS_CONTROL_REQUEST_HEADERS = 'access-control-request-headers';
export const DEFAULT_CORS_ORIGIN = '*';
export const DEFAULT_CORS_METHODS = '*';
export const DEFAULT_CORS_CREDENTIALS = 'true';
export const ORIGIN = 'origin';
/**
 * Disabled storage key
 */
export const DISABLED = 'disabled';
/**
 * pure JSON storage key
 */
export const JSON_CONFIG = 'config';
/**
 * JSON with comments storage key
 */
export const JSONC_CONFIG = 'config_for_shown';

export const EDITING_CONFIG_KEY = 'config_editing_key';
export const TAB_LIST = 'tab_list';
export const ACTIVE_KEYS = 'active_keys';
export const CLEAR_CACHE_ENABLED = 'clearCacheEnabled';
export const DIAMOND_KEY = 'diamond';
export const CORS_ENABLED_STORAGE_KEY = 'corsEnabled';
export const VM_KEY = 'path';
export const MILLISECONDS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;
export const RULE = 'rule';
export const LANGUAGE_JSON = 'json';
export const CHANGE = 'change';
export const DOM_CONTENT_LOADED = 'DOMContentLoaded';
export const SWITCH_DOM_ID = 'J_Switch';
export const SWITCH_INNER_DOM_ID = 'J_SwitchInner';
export const SWITCH_AREA_DOM_ID = 'J_SwitchArea';
export const NEW_TAB_DOM_ID = 'J_OpenInNewTab';
export const OPEN_README_DOM_ID = 'J_OpenReadme';
export const CONTAINER_DOM_ID = 'J_Container';
export const STATUS_DOM_ID = 'J_Status';
export const CLEAR_CACHE_ENABLED_DOM_ID = 'J_ClearCacheEnabled';
export const CORS_ENABLED_DOM_ID = 'J_CorsEnabled';
export const SWITCH_CHECKED_CLASSNAME = 'ant-switch-checked';
export const POPUP_HTML_PATH = 'check.html';
export const MONACO_VS_PATH = './lib/monaco-editor/min/vs';
export const MONACO_CONTRIBUTION_PATH = 'vs/language/json/monaco.contribution';
export const HELP_URL = 'https://yuque.alibaba-inc.com/wb-qsh847037/tdkbnf/ou2z5u';
export const DEFAULT_FONT_FAMILY = 'Menlo, Monaco, "Courier New", monospace';
export const PLATFORM_MAC = 'Mac';
export const OPTIONS_SAVED = 'Options saved.';
export const EMPTY_STRING = '';
export const KEY_DOWN = 'keydown';
export const CLICK = 'click';
export const ANYTHING = 'anyString';
export const FORMAT_DOCUMENT_CMD = 'editor.action.formatDocument';
export const KEY_CODE_S = 83;
export const SHOW_FOLDING_CONTROLS = 'always';
export const OPACITY_VISIBLE = '1';
export const NULL_STRING = 'null';
export const RULE_COMPLETION = `[
  "\${1:from}",
  "\${1:to}",
],`;

export const DEFAULT_DATA = `{
	"diamond": {
		"domain": "dev.g.alicdn.com",
		"legaoDomain": "g.alicdn.com",
		"buyer-workbench-site-name_zh-cn": "采购平台",
		"buyer-workbench-site-name_en-us": "Procurement platform",
		"iconfont": "font_687582_sob2d5pnr7s",
		"react": "16.13.1",
		"cg-global": "1.1.4",
		"cg-react": "0.8.83",
		"cg-buyer-workbench": "2.5.6",
		"pur-smart-sourcing": "1.0.12",
		"mcmsCgFe": "0.0.76",
		"pur-production": "0.2.11",
		"project-channel": "1.0.18",
		"pur-quote-tpl": "1.1.0",
		"cg-buyer-workbench-extension": "1.0.29",
		"mcms": "0.0.86",
		"mcmsDomain": "lang.alicdn.com/mcms",
	}
}
`;

export const DEFAULT_DUP_DATA = `{
	"path": {
		"cg-supplier-workbench": "https://g.alicdn.com/platform/cg-supplier-workbench/!cg-supplier-workbench!/app.min.js"
	},
	"diamond": {
		"cg-supplier-workbench": "1.0.0"
	}
  }
  
`;

// false: 使用chrome.storage.sync.get/set
// true:  使用chrome.storage.local.get/set
export const USE_CHROME_STORAGE_SYNC_FN = false;

/**
 * check if old config rules saving by chrome.storage.sync.set function have been migarated
 */
export const SYNC_STORAGE_DATA_HAS_BEEN_MIGARATED_TO_LOCAL = 'sync_storage_data_has_been_migarated_to_local';

export const BLUE_ICON_PATH = 'images/blue_128.png';
export const GREY_ICON_PATH = 'images/grey_128.png';
export const DARK_MODE_MEDIA = '(prefers-color-scheme: dark)';
