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
	if (node.localName == "img" && node.attributes.indexOf("sidebysided") < 0) { //cannot be sidebysided
		// printObj(node);

		//get src
		var srcMinOne = node.attributes.indexOf("src");
		var srcVal = node.attributes[srcMinOne + 1];
		var newSrc = editStr(srcVal);
		
		//get match, make clone, get match container
		var container = document.querySelector(".pages.text-center");
		var match = container.querySelectorAll('[src="' + srcVal + '"]:not([sidebysided])')[0];
		var match_cont = match.parentElement;
		var clone = match.cloneNode(true);

		//Remove Non Clone of cloned page
		var temp_cont = document.querySelector(".pages.text-center");
		var rmv_match = temp_cont.querySelectorAll('[src="' + newSrc + '"]:not([sidebysided])')[0];
		if (rmv_match) {
			rmv_match.remove();

			//add child
			match_cont.appendChild(clone);

			//edit elements
			match.setAttribute("src", newSrc);
			match.setAttribute("sidebysided", true);
			clone.setAttribute("sidebysided", true);
			//put elements side-by-side
			match_cont.setAttribute("style", "display: flex; flex-shrink: 0; flex-grow: 0; align-items: center; justify-content: center");
			match.setAttribute("style", "flex: 50%; padding: 0px; align-self: center");
			clone.setAttribute("style", "flex: 50%; padding: 0px; align-self: center");
		} else {
			console.log("page to clone doesn't exist");
		}
	} else {
		console.log("invalid selection");
	}
}

function document_unfiddle(node){
	if (node.localName == "img" && node.attributes.indexOf("sidebysided") >= 0) { // must be sidedbysided
		// printObj(node);

		//get src
		var srcMinOne = node.attributes.indexOf("src");
		var srcVal = node.attributes[srcMinOne + 1];
		
		//get match, get match container, get match container clone
		var container = document.querySelector(".pages.text-center");
		var match = container.querySelectorAll('[src="' + srcVal + '"][sidebysided]')[0]; // must be sidedbysided
		var match_cont = match.parentElement;
		var match_cont_clone = match_cont.cloneNode(true);

		//insert
		match_cont.after(match_cont_clone);

		//find child nodes
		var images1 = match_cont.querySelectorAll("img");
		var images2 = match_cont_clone.querySelectorAll("img");

		// //edit containers
		
		match_cont.removeAttribute("style");
		match_cont_clone.removeAttribute("style");
		//edit nodes
		images1[1].removeAttribute("style");
		images1[1].removeAttribute("sidebysided");
		images2[0].removeAttribute("style");
		images2[0].removeAttribute("sidebysided");
		images1[0].remove();
		images2[1].remove();
	} else {
		console.log("invalid undo selection");
	}
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    console.log("msg.command = ", msg.command);
    if (msg.node.hasOwnProperty('backendNodeId')) {
        if (msg.command == "dup") { 
        	document_fiddle(msg.node); // modify the document
        } else if (msg.command == "undo") {
    		document_unfiddle(msg.node);
        }
    }
});