console.log('Initializing Encrypted Messenger');
window.localStorage.setItem('encrypted-messenger-id', chrome.runtime.id);
console.log(window.localStorage.getItem('encrypted-messenger-id'));

// listen from switch
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  console.log(msg);
  if (msg.greeting === 'generateKeys') {
    var options = {
        userIds: [{ name:'Jon Smith', email:'jon@example.com' }], // multiple user IDs
        numBits: 2048                                            // RSA key size
    };

    openpgp.generateKey(options).then(function(key) {
        var privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
        var pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
        window.localStorage.setItem('privateKey', privkey);
        sendResponse({pub: pubkey});
    });
  }
  return true;
});

var injectme = function() {
  var getPubKey = function(fbid) {
    console.log('getting pub key');
    chrome.runtime.sendMessage(window.localStorage.getItem('encrypted-messenger-id'), {greeting: "fbid", fbid: fbid}, function(response) {
      console.log(response);
      console.log(response.pubkey);
      window.pubkey = response.pubkey;
    });
  }

  // console.log(__REACT_DEVTOOLS_GLOBAL_HOOK__);
  // console.log(__REACT_DEVTOOLS_GLOBAL_HOOK__.reactDevtoolsAgent);
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
  getPubKey(window.friendfbid);

  var f = window.composer.publicInstance._handleMessageSend.bind(window.composer.publicInstance);
  window.composer.publicInstance._handleMessageSend = function(p, q) {
    
    var options, encrypted;

    var pubkey = window.pubkey;

    options = {
        data: p,                             // input as String (or Uint8Array)
        publicKeys: [window.openpgp.key.readArmored(pubkey).keys[0], window.openpgp.key.readArmored(window.localStorage.getItem('privateKey')).keys[0]],  // for encryption
    };

    window.openpgp.encrypt(options).then(function(ciphertext) {
        encrypted = ciphertext.data; // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
        f(encrypted, q);
        window.input.publicInstance._resetState();
    });
  };

  // Creates DOM listener to observe when the user changes conversations and updates window.friendfbid.
  var config = {attributes: true, subtree: true};
  var target = document.getElementsByClassName('_48e9').item(0);
  var conversationObserver = new MutationObserver(function(muts) {
    var oldId = window.friendfbid;
    muts.forEach(function(mut) {
      if (mut.attributeName == 'aria-relevant') {
        var id = mut.target.firstChild.id.split(':')[1];
        if (id != oldId) {
          window.friendfbid = id;
          getPubKey(window.friendfbid);
          console.log('Changed id to: ' + id);
          // Must decrypt new messages
          setTimeout(setUpDecryption, 1000);
        }
      }
    });
  });
  conversationObserver.observe(target, config);

  // Creates DOM listener to observe when user scrolls up in the msg window.
  var attachMsgObserver = function() {
    var target = document.getElementsByClassName('__i_')[0];
    var config = {attributes: true, subtree: true};
    var msgObserver = new MutationObserver(function(muts) {
      console.log(muts);
      // This is ratchet. Prevents callback from firing if time bubble appears on user messages
      if (muts[0].attributeName == 'id' || muts[0].attributeName == 'class') {
        // Don't call setUpDecryption bc that creates a new listener too
        findMessages();
      }
    });
    msgObserver.observe(target, config);
  };

  // Grabs msg text and decrypts it
  var findMessages = function() {
    var containerNode = document.getElementsByClassName('__i_')[0];
    containerNode.childNodes.forEach(function(child) {
      if (child.tagName == 'DIV' && child.id.length > 0) {
        child.childNodes.forEach(function(c) {
          if (c.tagName == 'DIV') {
            var msgWrapperNodes = c.childNodes[0].getElementsByClassName('_41ud')[0].getElementsByClassName('clearfix');
            for (var i = 0; i < msgWrapperNodes.length; i++) {
              var msgNode = msgWrapperNodes[i].childNodes[0].childNodes[0];
              msgNode.innerHTML = decrypt(msgNode.innerHTML, msgNode);
            }
          }
        });
      }
    });
  };

  var decrypt = function(c, node) {
    var begin = "-----BEGIN PGP MESSAGE-----";
    if (c.indexOf(begin) != 0) {
      return c;
    }
    window.test = c;
    var privkey = window.localStorage.getItem('privateKey');

    options = {
      message: window.openpgp.message.readArmored(c),     // parse armored message
      privateKey: window.openpgp.key.readArmored(privkey).keys[0] // for decryption
    };

    window.openpgp.decrypt(options).then(function(plaintext) {
      node.innerHTML = plaintext.data;
    });
  }

  var setUpDecryption = function() {
    attachMsgObserver();
    findMessages();
  };

  var repeater = function() {
    console.log('ayo');
    findMessages();
    setTimeout(repeater, 1500);
  }

  setTimeout(function() {
    setUpDecryption();
    // repeater(); 
  }, 1000);
}

var inject = function() {

  var openpgpscript = document.createElement('script');
  openpgpscript.src = chrome.extension.getURL('openpgp.js');
  document.head.appendChild(openpgpscript);

  var injectionString = '(' + injectme.toString() + ')();';
  var script = document.createElement('script');
  script.textContent = injectionString;
  document.head.appendChild(script);
}

window.onload = function() {
  setTimeout(inject, 1000);
  //inject();
}
