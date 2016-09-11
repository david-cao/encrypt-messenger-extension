// chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     if (msg.greeting == "checked") {
//         chrome.tabs.executeScript(null, {file: "content.js"});
//         sendResponse({farewell: "goodbye"});
//     }

// });

// chrome.runtime.onConnect.addListener(function(port) {
//     port.onMessage.addListener(function(msg, sender, sendResponse) {
//         console.log(sender.tab ?
//                     "from a content script:" + sender.tab.url :
//                     "from the extension");
//         if (msg.greeting == "checked") {
//             chrome.tabs.executeScript(null, {file: "content.js"});
//             sendResponse({farewell: "goodbye"});
//         }

//     });
// });