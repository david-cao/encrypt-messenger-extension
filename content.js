
console.log("waddup");
console.log("lock: " + window.localStorage.useEncryption);

// listen from switch
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  console.log(sender.tab ?
    "from a content script:" + sender.tab.url :
    "from the extension");
  if (msg.greeting === "true") {
    console.log("yep");
    injectme();
  } else {
    console.log("nope");
  }
  // sendResponse({farewell: "goodbye"});
});

var injectme = function() {
  var elementData = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.reactDevtoolsAgent.elementData.values(); 
  var elts = []; var done = false;
  while (!done) {
    var iter = elementData.next();
    done = iter.done;   
    elts.push(iter.value); 
  };
  var composer = elts.filter(function(elt) {return elt != null && elt.name==="MessengerComposer";})[0];
  var input = elts.filter(function(elt) {return elt != null && elt.name==="MessengerInput";})[0];

  var f = composer.publicInstance._handleMessageSend.bind(composer.publicInstance);
  composer.publicInstance._handleMessageSend = function(p, q) { 
    f(p + '- hacked!!', q);
    input.publicInstance._resetState();
  };
}

var inject = function() {
  var injectionString = '<script>(' + injectme.toString() + ')(); </script>';

  var script = document.createElement('script');
  script.textContent = injectionString;

  document.body.appendChild(script);
}