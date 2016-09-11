var generateKeys = function() {
  console.log("clicked");
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {greeting: "generateKeys"}, function(res) {
      document.getElementById('info').hidden = false;
      // document.getElementById('scroll').hidden = false;
      // document.getElementById('publickey').value = res.pub;
      // document.getElementById('publickey').select();
      copyTextToClipboard(res.pub);
      window.localStorage.setItem('haskeypair', 'true');

      gen.disabled = true;
      gen.innerHTML = "Key pair exists!";
    });
  });
}

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent';

  textArea.value = text;

  document.body.appendChild(textArea);

  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
}


document.addEventListener('DOMContentLoaded', function() {
  var gen = document.getElementById('generate');

  gen.addEventListener('click', generateKeys);

  // a tags will open in new tab
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    (function () {
      var ln = links[i];
      var location = ln.href;
      ln.onclick = function () {
        chrome.tabs.create({active: true, url: location});
      };
    })();
  }

  if (window.localStorage.getItem('haskeypair') === 'true') {
    gen.disabled = true;
    gen.innerHTML = "Key pair exists!";
  }

  // link.checked = window.localStorage.useEncryption === 'true';
  // chrome.tabs.sendMessage(tabs[0].id, {greeting: "checked"}, function(response) {
  //   window.localStorage.useEncryption = true + '';
  //   console.log(response.farewell);
  // });
  
  // link.addEventListener('click', function() {
  //   if (document.getElementById('lock').checked) {
  //     document.getElementById('check').innerHTML = "checked";

  //     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //       chrome.tabs.sendMessage(tabs[0].id, {greeting: "checked"}, function(response) {
  //         window.localStorage.useEncryption = true + '';
  //         console.log(response.farewell);
  //       });
  //     });
  //   } else {
  //     document.getElementById('check').innerHTML = "unchecked";

  //     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //       chrome.tabs.sendMessage(tabs[0].id, {greeting: "unchecked"}, function(response) {
  //         window.localStorage.useEncryption = false + '';
  //         console.log(response.farewell);
  //       });
  //     });
  //   }
  // });
});

