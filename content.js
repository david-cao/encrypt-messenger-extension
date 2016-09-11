console.log("waddup");
console.log("lock: " + window.localStorage.useEncryption);

// listen from switch
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  console.log(sender.tab ?
    "from a content script:" + sender.tab.url :
    "from the extension");
  if (msg.greeting === "checked") {
    console.log("yep");
    inject();
  } else {
    console.log("nope");
  }
});

var injectme = function() {
  console.log(__REACT_DEVTOOLS_GLOBAL_HOOK__);
  console.log(__REACT_DEVTOOLS_GLOBAL_HOOK__.reactDevtoolsAgent);
  var elementData = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.reactDevtoolsAgent.elementData.values(); 
  var elts = []; var done = false;
  while (!done) {
    var iter = elementData.next();
    done = iter.done;   
    elts.push(iter.value); 
  };

  window.composer = elts.filter(function(elt) {return elt != null && elt.name==="MessengerComposer";})[0];
  window.input = elts.filter(function(elt) {return elt != null && elt.name==="MessengerInput";})[0];
  window.userfbid = window.composer.props.viewer;
  window.friendfbid = window.composer.props.threadFBID;

  var f = composer.publicInstance._handleMessageSend.bind(composer.publicInstance);
  composer.publicInstance._handleMessageSend = function(p, q) { 
    f(p + '- hacked!!', q);
    input.publicInstance._resetState();
  };

  var config = {attributes: true, subtree: true};
  var target = document.getElementsByClassName('_48e9').item(0);
  var observer = new MutationObserver(function(muts) {
    muts.forEach(function(mut) {
      if (mut.attributeName == 'aria-relevant') {
        console.log(mut);
      }
    });
  });
  console.log(target);

  observer.observe(target, config);
}

var inject = function() {
  var injectionString = '(' + injectme.toString() + ')();';

  var script = document.createElement('script');
  script.textContent = injectionString;

  document.body.appendChild(script);
}

window.onload = function() {
  console.log("loading shit");
  inject();
}