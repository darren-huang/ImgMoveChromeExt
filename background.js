function detach_if_possible() {
	console.log("trying_to_detach");
	chrome.storage.sync.get(['valid_id','tab_id'], function(data) {
		if (data.valid_id) {
			chrome.debugger.detach({tabId: data.tab_id});
			chrome.storage.sync.set({valid_id: false, tab_id: null});
		}
	});
}

function debuggerCallback(source, method, params) {
	// console.log(method) // print method name
	if (method == "Overlay.inspectNodeRequested") {
		// console.log("inside selection");
		chrome.debugger.detach(source);
		chrome.storage.sync.set({valid_id: false, tab_id: null});
	}
}

function setCommands(givenTabId){
	// Escape from inspection mode.
	chrome.commands.onCommand.addListener(function (command) {
	    if (command == "exit_inspection_mode") {
	        console.log("exit_inspection_mode");
	        detach_if_possible();
	    }
	});
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757', valid_id: false, tab_id: null}, function() {
      	console.log("The color is green.");
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
		  			pageUrl: {hostContains: '.readonepiece.'}, }) ],
		    actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
    });
  });

chrome.tabs.onActivated.addListener(function(activeInfo) {
	detach_if_possible();
});

chrome.debugger.onEvent.addListener(debuggerCallback)
setCommands();