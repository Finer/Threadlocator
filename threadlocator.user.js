// ==UserScript==
// @name		/b/ pony thread locator
// @version		0.0014
// @namespace		threadlocator
// @description		The name tells the story.
// @license		MIT; http://en.wikipedia.org/wiki/MIT_license
// @include		http://www.ponychan.net/chan/*
// @include		http://www.4chan.org/*
// @include		http://boards.4chan.org/*
// @include		https://www.4chan.org/*
// @include		https://boards.4chan.org/*
// @include		http://eris.web44.net/chan/thread/*
// @updateURL		https://raw.github.com/Finer/Threadlocator/master/threadlocator.user.js
// @run-at		document-start
// @delay		600
// ==/UserScript==



function main(text) {
	if (text == -1) {
		return;
	}
	
	if (!text) {
		getText();
		return;
	}
	
	var foundthreads = 1;
	
	//see if what we got is somewhat sane
	if (text.length < 5) {
		foundthreads = 0;
	}
	
	var list = [];
	list = parseResponse(text);
	
	//check for ID
	var id = GM_getValue("threadlocatoruserid", 0);
	if (id == 0) {
		//GM_log("Make ID");
		id = makeID();
		//GM_log("ID: " + id);
		GM_setValue("threadlocatoruserid", id);
	}
	
	/* Create html */
		
	//formulate links using http://anonym.to/?http://www.x.com/ to make it transparent
	//creating a list for links to be inserted
	var htmlblock = "";

	if (foundthreads == 1) {
		for (x in list) {
			if (x % 2 == 0) {
				htmlblock += "<a href=\"http://boards.4chan.org/b/res/" + list[x] + "\">";
				htmlblock += "http://boards.4chan.org/b/res/" + list[x];

			}
			if (x % 2 != 0) {
				htmlblock += " " + "(" + list[x] + "%)";
				htmlblock += "</a><br>";
			}
		
		}
	}
	else {
		htmlblock = "No threads found.";
	}
	

	
	//check for Rita's reply notifier
	var rr = document.getElementById("rrn_settings");
	var dialog = "";
	if (!rr) {
		dialog = document.createElement('div');
		dialog.innerHTML = '\
		<div>\
		 <span>Thread locator:</span><br>'
		 + htmlblock +
		'</div>';
		dialog.id = "threadlocator"
		GM_addStyle("\
		#threadlocator { color: inherit; text-align: left; font-size:16px; z-index:1; }\
		");
		document.body.appendChild(dialog);
	}
	else {
		//we found rita
		dialog = document.createElement('div');
		dialog.innerHTML = '\
		<div>\
		 <span>Thread locator:</span><br>'
		 + htmlblock +
		'</div>';
		dialog.id = "threadlocator"
		GM_addStyle("\
		#threadlocator { float:left; color: inherit; text-align: left; font-size:16px; z-index:1; }\
		");
		var containerd = document.createElement('div');
		containerd.id = "containerd";
		document.body.insertBefore(containerd, rr);
		containerd.appendChild(dialog);
	}
	
	addReloadButton();
	
	if (getLocation(location.href) != 0) {
		addSubmitButton();
	}
	
	
	/* End of html suff*/
	
	function parseResponse(response) {
		var list = [];
		var a = 0;
		var lastwasnumber = 0;
		//GM_log(typeof response);
		list[a] = "";
		for (x in response) {
			//GM_log(response[x]);
			if (response[x] == parseInt(response[x])) {
				list[a] = list[a] + response[x];
				lastwasnumber = 1;
				//GM_log("if loop: " + response[x])
			}
			else {
				//GM_log("else loop: " + response[x])
				if (lastwasnumber == 1) {
					a = a + 1;
					list[a] = "";
				}
				lastwasnumber = 0;
			}
		}
		/*
		for (x in list) {
			GM_log(list[x]);
		}
		*/
		return list;
	}
	
	function getLocation(loc) {
		var location = 0;
		var pattern = /http:\/\/boards.4chan.org\/b\/res\/([0-9]+)/i;
	    if (loc.match(/http:\/\/boards.4chan.org\/b\/res\//, "i")) {
			location = pattern.exec(loc)[1];
		}
		//alert(location);
		return location;
	}
	
	function makeID() {
		var randomnumber = Math.floor(Math.random()*99999999) + 1;
		if (randomnumber < 10000000) {
			randomnumber += 10000000;
		}
		//GM_log("randomnumber id = " + randomnumber);
		return randomnumber;
	}
	
	function pushMark() {
		var ok = 0;
		var data = "0";
		var threadnumber = getLocation(location.href);
		if (threadnumber != 0 && GM_getValue("threadlocatoruserid", 0) != 0) {
			data = GM_getValue("threadlocatoruserid", 0) + "&magicNumber=" + threadnumber;
		}
		var url2 = "http://eris.web44.net/chan/thread/push.php?formData=" + data;
		//GM_log(url2);
		//alert(data + "typeof: " + typeof data);
		//alert(location.href);
		//'Content-Type': 'application/x-www-form-urlencoded'
		var xmlRequestArgs = {
			method: 'GET',
			url: url2,
			headers:{'Content-type':'application/x-www-form-urlencoded'},
			onload: function(response) {
			/*
			GM_log([
			  response.status,
			  response.statusText,
			  response.readyState,
			  response.responseHeaders,
			  response.responseText,
			  response.finalUrl,
			  response.responseXML
			].join("\n"));
			*/
			;
			}	
		};
		//GM_log(data);
		GM_xmlhttpRequest(xmlRequestArgs);
		return ok;
	}
	
	function addSubmitButton() {
		var b = document.createElement('button');
		b.id = 'threadlocatorsubmitbutton';
		b.type = 'button';
		b.appendChild( document.createTextNode("Mark thread") );
		b.addEventListener('click', function () { pushMark(); }, false);
		document.getElementById('threadlocatorform').appendChild(b);
	}
	
	function addReloadButton() {
		var f = document.createElement('form');
		f.id = 'threadlocatorform';
		var a = document.createElement('button');
		a.id = 'threadlocatorreloadbutton';
		a.type = 'button';
		a.appendChild( document.createTextNode("Reload") );
		a.addEventListener('click', function () { reloadLocator(); }, false);
		f.appendChild(a);
		f.addEventListener('submit', function () { return false; }, false);
		document.getElementById('threadlocator').appendChild(f);
	}
	
	function getText() {
		GM_xmlhttpRequest({
		  method: "GET",
		  url: "http://eris.web44.net/chan/thread/list",
		  headers: {
			"Accept": "text/xml"            // If not specified, browser defaults will be used.
		  },
		  onload: function(response) {
			/*
		    GM_log([
			  response.status,
			  response.statusText,
			  response.readyState,
			  response.responseHeaders,
			  response.responseText,
			  response.finalUrl,
			  response.responseXML
			].join("\n"));
			*/
			if (response.responseText > 500) {
				alert("Error with server, please disable /b/ thread locator.");
				//throwErrorText(); //pretty html error TODO
				return -1;
			}
			main(response.responseText);
		  }
		  });
		return -1;
	}
	
	function reloadLocator() {
		var element;
		element = document.getElementById("threadlocator");
		element.parentNode.removeChild(element);
		element = document.getElementById("containerd");
		if (element) {
			element.parentNode.removeChild(element);
		}
		main();
		return;
	}
	
	return;
}

//main();
	
window.addEventListener('load', function() {main();}, true);