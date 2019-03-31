function editStr(str) {
	var pre = str.substring(0, str.length-7);
	var intStr = str.substring(str.length-7, str.length-4);
	var suf = str.substring(str.length-4, str.length);
	var newIntStr = (parseInt(intStr) + 1).toString().padStart(intStr.length, "0");
	return pre + newIntStr + suf;
}

function printObj(obj) {
	var propValue;
	for(var propName in obj) {
	    propValue = obj[propName];
	    console.log(propName, propValue);
	}
}

function document_fiddle(node){
	if (node.localName == "img" && node.attributes.indexOf("sidebysided") < 0) {
		// printObj(node);

		//get src
		var srcMinOne = node.attributes.indexOf("src");
		var srcVal = node.attributes[srcMinOne + 1];
		
		//get match, make clone, get match container & add child
		var container = document.querySelector(".pages.text-center");
		var match = container.querySelectorAll('[src="' + srcVal + '"]:not([sidebysided])')[0];
		var match_cont = match.parentElement;
		var clone = match.cloneNode(true);
		match_cont.appendChild(clone);

		//edit elements
		var newStr = editStr(match.getAttribute("src"));
		match.setAttribute("src", newStr);
		match.setAttribute("sidebysided", true);
		clone.setAttribute("sidebysided", true);
		//put elements side-by-side
		match_cont.setAttribute("style", "display: flex; flex-shrink: 0; flex-grow: 0; align-items: center; justify-content: center");
		match.setAttribute("style", "flex: 50%; padding: 0px; align-self: center");
		clone.setAttribute("style", "flex: 50%; padding: 0px; align-self: center");

		console.log("width", "" + match_cont.getAttribute("width"));
		console.log("width-max", "" + match_cont.getAttribute("width-max"));
	} else {
		console.log("invalid selection");
	}
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.hasOwnProperty('backendNodeId')) {
        document_fiddle(msg); // modify the document
    }
});