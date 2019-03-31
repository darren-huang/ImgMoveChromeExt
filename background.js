const url_substring = '.readonepiece.';

const HIGHLIGHT_COLOR = {
  r: 95,
  g: 208,
  b: 255,
  a: 0.5
};

function doInCurrentTab(tabCallback) {
    chrome.tabs.query(
        { currentWindow: true, active: true },
        function (tabArray) { tabCallback(tabArray[0]); }
    );
}

function setOverlay(givenTabId){
	// go to overlay view mode?
    chrome.debugger.sendCommand({tabId: givenTabId}, "Overlay.setInspectMode", 
									{mode: "searchForNode",
									highlightConfig: {
										contentColor: HIGHLIGHT_COLOR,
										showInfo: true
							        }})
}

function set_global_tab_id(new_tab_id) {
	chrome.storage.sync.set({valid_id: true, tab_id: new_tab_id});
}

function inspectorSelectNode(tab) {
	console.log("trying_to_attach");
	chrome.storage.sync.get(['valid_id','tab_id'], function(data) {
		if (!data.valid_id) {
			//debugging attach, enable the events
			chrome.debugger.attach({tabId: tab.id}, "1.2");
			set_global_tab_id(tab.id);
			chrome.debugger.sendCommand({tabId: tab.id}, "Log.enable");
			chrome.debugger.sendCommand({tabId: tab.id}, "DOM.enable");
			chrome.debugger.sendCommand({tabId: tab.id}, "Overlay.enable");

			setOverlay(tab.id);
		}
	});
}

function detach_if_possible() {
	console.log("trying_to_detach");
	chrome.storage.sync.get(['valid_id','tab_id'], function(data) {
		if (data.valid_id) {
			chrome.debugger.detach({tabId: data.tab_id});
			chrome.storage.sync.set({valid_id: false, tab_id: null});
		}
	});
}
/////////////////////////////above just copied from popup.js///////////////////////////////////////

var signal = "dup"// either "undo" or "dup"

//Send Message to content.js
function sendSignalToTab(toSendNode) {
	chrome.storage.sync.get(['valid_id','tab_id'], function(data) {
		if (data.valid_id) {
			chrome.tabs.sendMessage(data.tab_id, {node: toSendNode, command: signal});
		}
	});
}

//Get Node Selection
function debuggerCallback(source, method, params) {
	if (method == "Overlay.inspectNodeRequested") {
		var backId = params.backendNodeId;
		chrome.debugger.sendCommand(source, "DOM.describeNode", {backendNodeId: backId}, 
		function(result) {
			sendSignalToTab(result.node); // send message to content.js
			chrome.debugger.detach(source);
			chrome.storage.sync.set({valid_id: false, tab_id: null});
		});
	}
}

//Set Commands
function setCommands(givenTabId){
	// Escape from inspection mode.
	chrome.commands.onCommand.addListener(function (command) {
	    if (command == "exit_inspection_mode") {
	        detach_if_possible();
	    } else if (command == "enter_inspection_mode") {
	    	signal = "dup";
	    	doInCurrentTab(function(tab) {
	    		if (tab.url.includes(url_substring)) { inspectorSelectNode(tab) };
	    	});
	    } else if (command == "enter_undo_mode") {
	    	signal = "undo";
	    	doInCurrentTab(function(tab) {
	    		if (tab.url.includes(url_substring)) { inspectorSelectNode(tab) };
	    	});
	    }
	});
}

//Init variables and Page Actions
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757', valid_id: false, tab_id: null});
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
		  			pageUrl: {hostContains: url_substring}, }) ],
		    actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
    });
  });

//Setup tab switching
chrome.tabs.onActivated.addListener(function(activeInfo) {
	detach_if_possible();
});

//Call functions
chrome.debugger.onEvent.addListener(debuggerCallback)
setCommands();