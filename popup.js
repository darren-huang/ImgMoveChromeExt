// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';


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

// change color of the button?
let changeColor = document.getElementById('changeColor');
chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

// button click event
changeColor.onclick = function(element) {
	// change background color
    // let color = element.target.value;
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //   chrome.tabs.executeScript(
    //       tabs[0].id,
    //       {code: 'document.body.style.backgroundColor = "' + color + '";'});
    // });

    // attach debugger
	doInCurrentTab(inspectorSelectNode);
  };

