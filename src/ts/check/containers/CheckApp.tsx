import React, { useState, useEffect } from 'react';
import { Switch, Icon, Checkbox, Input, Popconfirm, message, Button } from 'antd';
import {
	ANYTHING,
	FORMAT_DOCUMENT_CMD,
	KEY_CODE_S,
	KEY_DOWN,
	LANGUAGE_JSON,
	MONACO_CONTRIBUTION_PATH,
	MONACO_VS_PATH,
	PLATFORM_MAC,
	RULE,
	RULE_COMPLETION,
	POPUP_HTML_PATH,
	DEFAULT_DUP_DATA,
	JSON_CONFIG,
	HELP_URL,
  } from '../constants';
  import { Enabled } from '../enums';
  import {
	getConfig,
	saveConfig,
	setChecked,
	getChecked,
	openLink,
	getEditingConfigKey,
	setEditingConfigKey,
	setConfigItems,
	getConfigItems,
	removeUnusedItems,
	getFormatConfig,
	getActiveKeys,
  } from '../chrome-storage';
  import { getEditorConfig } from '../editor-config';
  import { formatRules } from '../utils';
  import axios from "axios";
let editor: any;

const CheckDiamond: React.FC<any> = () => {
	const [items, setItems] = useState<any[]>([]);
	const [editingKey, setEditingKeys] = useState('0');
	const [newItem, setNewItem] = useState('');
	const [checked, setCheckeds] = useState<boolean>(true);
	useEffect(() => {
		const fetchData = async () => {
			const editChecked: boolean = (await getChecked()) !== Enabled.NO;
			setCheckeds(editChecked);
			window.require.config({ paths: { vs: MONACO_VS_PATH } });
			const editingConfigKey: string = await getEditingConfigKey();
			setEditingKeys(editingConfigKey);
			const config: any = await getConfig(editingConfigKey);
			const _items: any[] = Array.from(await getConfigItems());
			setItems(_items);
			await removeUnusedItems();

			let monacoReady: boolean = true;

			window.require([MONACO_CONTRIBUTION_PATH], () => {
			  editor = window.monaco.editor.create(
				document.getElementById('xswitch-container'),
				getEditorConfig(config)
			  );
			  saveConfig(editor.getValue(), editingConfigKey);
		
			  window.monaco.languages.registerCompletionItemProvider(LANGUAGE_JSON, {
				provideCompletionItems: () => {
				  const textArr: any[] = [];
				  chrome.extension
					.getBackgroundPage()!
					._forward.urls.forEach((item: any) => {
					  if (item) {
						textArr.push({
						  label: item,
						  kind: window.monaco.languages.CompletionItemKind.Text,
						});
					  }
					});
		
				  const extraItems = [
					{
					  label: RULE,
					  kind: window.monaco.languages.CompletionItemKind.Method,
					  insertText: {
						value: RULE_COMPLETION,
					  },
					},
				  ];
				  return [...textArr, ...extraItems];
				},
			  });
		
			  editor.onDidChangeModelContent( async () => {
				const _editingConfigKey: string = await getEditingConfigKey();
				saveConfig(editor.getValue(), _editingConfigKey);
			  });
		
			  editor.onDidScrollChange(() => {
				if (monacoReady) {
				  editor.trigger(ANYTHING, FORMAT_DOCUMENT_CMD);
				  monacoReady = false;
				}
			  });
			});
			function preventSave() {
				document.addEventListener(
				  KEY_DOWN,
				  (e) => {
					const controlKeyDown = navigator.platform.match(PLATFORM_MAC)
					  ? e.metaKey
					  : e.ctrlKey;
					if (e.keyCode === KEY_CODE_S && controlKeyDown) {
					  e.preventDefault();
					}
				  },
				  false
				);
			}
			preventSave();
		};
	 
		fetchData();
	}, []);

	const setEditorValue = (value: string) => {
		editor.setValue(value);
	}

	const setEditingKeyHandler = async (id: string) => {
		setEditingKeys(id);
		setEditingConfigKey(id);
		const config: any = await getConfig(id);
		setEditorValue(config || DEFAULT_DUP_DATA);
	}
	
	const setEditingKey = async (id: string) => {
		await setEditingKeyHandler(id);
	}

	const setActive = (id: string) => {
		const _items = items.map(v=>{
			if (v.id ===id) {
				v.active = !v.active;
			}
			return v;
		});
		setItems(_items);
		setConfigItems(_items);
	}
	const remove = async (id: string) => {
		const _items = items.filter(v=>v.id!==id);
		setEditingKeys('0');
		await setEditingKeyHandler('0');
		setItems(_items);
		setConfigItems(_items);
	}
	const add = async () => {
		if (newItem.trim() === '') {
			message.error('Rule name should not be an empty string!');
			return;
		}
		const id = '' + new Date().getTime();
		let _items = items;
		_items.push({
			id,
			name: newItem,
			active: true,
		});
		setItems(_items);
		setConfigItems(_items);
		setEditingKeys(id);
		setEditingConfigKey(id);
		await setEditingKeyHandler(id);
		setNewItem('');
	}
	const toggleButton = () => {
		const _checked = !checked;
		setChecked(_checked);
    	setCheckeds(_checked);
	}

	const openNewTab = () => {
		openLink(POPUP_HTML_PATH, true);
	}

	const openReadme = () => {
		openLink(HELP_URL);
	}
	
	const toCheck = async () => {
		const activeKeys = await getActiveKeys();
		const _config = await getFormatConfig(activeKeys);
		let config = formatRules(_config);
		if (config.length > 0) {
			axios.all(config.map((v: any) => axios({ url: v.url }).then(
				() => {
					message.success('SUCCESS DIAMOND IS ' + v.key);
				}
			).catch(() => {
				message.error('ERROR DIAMOND IS '+ v.key);
				message.error('ERROR URL IS '+ v.url);
			})));
		}
	}

	return (
		<>
			<div className="xswitch-wrapper">
				<div className="xswitch-left-area" >
					<ul className="xswitch-tabs">
						{items.map(item=>{
							return <li key={item.id} onClick={()=>{setEditingKey(item.id)}} className={item.id === editingKey ? 'editing' : '' } >
							<Checkbox checked={item.active} onChange={()=>{setActive(item.id)}} disabled={item.id === '0'}/><span className="label">&nbsp;{item.name}</span>
							<Popconfirm
								title={"Are you sure to delete?"}
								onConfirm={()=>{remove(item.id)}}
							>
							<Icon
								className="delete-icon"
								type="delete"
								theme="outlined"
								style={{color: '#f5222d'}}
							/>
							</Popconfirm>
						</li>
						})}
					</ul>
					<div className="xswitch-new-item-container">
						<Input
							size="small"
							autoComplete="off"
							placeholder="Add a rule"
							className="new-item"
							value={newItem}
							onChange={(e:any) => {setNewItem(e.target.value)}}
							onPressEnter={add}
						/>
						<Icon className="confirm-button" type="edit" theme="twoTone" onClick={add}/>
						<Button style={{marginTop: '10px'}} onClick={toCheck}>TO CHECK</Button>
					</div>
				</div>
				<div className="xswitch-container" id="xswitch-container"></div>
			</div>
			<div className="toolbar-area">
				<Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} checked={checked} onChange={toggleButton}/>
				<a className="new-tab-control" title="Open in new tab" href="javascript:;" onClick={openNewTab}>
					<Icon type="code" theme="twoTone" style={{ fontSize: '22px'}}/>
				</a>
				<a className="open-readme" title="Open help page" href="javascript:;" onClick={openReadme}>
					<Icon type="question-circle" theme="twoTone" style={{ fontSize: '22px'}}/>
				</a>
			</div>
		</>
	)
};
export default CheckDiamond;