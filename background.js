chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "fbid")
      sendResponse({farewell: "goodbye"});
  });


 chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.greeting == "fbid") {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", 'https://encrypted-messenger.me/get/' + request.fbid, false); // false for synchronous request
    xmlHttp.send( null );
    var pubkey = xmlHttp.responseText;
    console.log(request.fbid);
    console.log(pubkey);
    sendResponse({pubkey: pubkey});
  }
  return true;
});


// var callback = function(details) {
//   for (var i = 0; i < details.responseHeaders.length; i++) {
//     console.log(details.responseHeaders[i]);
//     if ('content-security-policy' === details.responseHeaders[i].name.toLowerCase()) {
//       details.responseHeaders[i].value = '';
//     }
//   }
//   return {
//     responseHeaders: details.responseHeaders
//   };
// };

// var filter = {
//   urls: ["*://*/*"],
//   types: ["main_frame", "sub_frame"]
// };

// chrome.webRequest.onHeadersReceived.addListener(callback, filter, ["blocking", "responseHeaders"]);