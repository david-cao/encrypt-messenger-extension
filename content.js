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
    
    var options, encrypted;

    var pubkey = '-----BEGIN PGP PUBLIC KEY BLOCK ... END PGP PUBLIC KEY BLOCK-----';
    var privkey = '-----BEGIN PGP PRIVATE KEY BLOCK ... END PGP PRIVATE KEY BLOCK-----';

    options = {
        data: p,                             // input as String (or Uint8Array)
        publicKeys: window.openpgp.key.readArmored(pubkey).keys,  // for encryption
        privateKeys: window.openpgp.key.readArmored(privkey).keys // for signing (optional)
    };

    window.openpgp.encrypt(options).then(function(ciphertext) {
        encrypted = ciphertext.data; // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
    });

    f(encrypted + '- hacked!!', q);
    input.publicInstance._resetState();
  };

  // Create a DOM listener that observes when the user changes conversations and updates window.friendfbid.
  var config = {attributes: true, subtree: true};
  var target = document.getElementsByClassName('_48e9').item(0);
  var observer = new MutationObserver(function(muts) {
    var oldId = window.friendfbid;
    muts.forEach(function(mut) {
      if (mut.attributeName == 'aria-relevant') {
        var id = mut.target.firstChild.id.split(':')[1];
        if (id != oldId) {
          window.friendfbid = id;
          console.log('Changed id to: ' + id);
        }
      }
    });
  });
  observer.observe(target, config);

  // Creates DOM listener to observe when user scrolls up in the msg window.
  

  // Need to fix this. Supposed to decrypt the messages
  setTimeout(findMessages, 1000);
}

var findMessages = function() {
  var containerNode = document.getElementById('js_2');
  containerNode.childNodes.forEach(function(child) {
    if (child.tagName == 'DIV') {
      var msgWrapperNodes = child.childNodes[0].getElementsByClassName('_41ud')[0].getElementsByClassName('clearfix');
      for (var i = 0; i < msgWrapperNodes.length; i++) {
        var msgNode = msgWrapperNodes[i].childNodes[0].childNodes[0];
        console.log(msgNode);
      }
    }
  });
};

var inject = function() {

  var openpgp = document.createElement('script');
  openpgp.src = chrome.extension.getURL('openpgp.js');
  document.head.appendChild(openpgp);

  var injectionString = '(' + injectme.toString() + ')();';
  var script = document.createElement('script');
  script.textContent = injectionString;
  document.head.appendChild(script);
}

var decrypt = function() {

}

window.onload = function() {
  console.log("loading shit");
  setTimeout(inject, 1000);
  //inject();
}