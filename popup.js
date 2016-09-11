var generateKeys = function() {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "generateKeys"}, function(response) {
    console.log(response.farewell);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var link = document.getElementById('lock');

  link.checked = window.localStorage.useEncryption === 'true';
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "checked"}, function(response) {
    window.localStorage.useEncryption = true + '';
    console.log(response.farewell);
  });
  
  link.addEventListener('click', function() {
    if (document.getElementById('lock').checked) {
      document.getElementById('check').innerHTML = "checked";

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "checked"}, function(response) {
          window.localStorage.useEncryption = true + '';
          console.log(response.farewell);
        });
      });
    } else {
      document.getElementById('check').innerHTML = "unchecked";

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "unchecked"}, function(response) {
          window.localStorage.useEncryption = false + '';
          console.log(response.farewell);
        });
      });
    }
  });
});

