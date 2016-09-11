// ensure we have a flag to use to track lock
document.addEventListener('beforeload', function() {
  if (!window.localStorage.getItem('useEncryption')) {
    window.localStorage.useEncryption = false + '';
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var link = document.getElementById('lock');

  link.checked = window.localStorage.useEncryption === 'true';
  chrome.tabs.sendMessage(tabs[0].id, {greeting: window.localStorage.useEncryption}, 
    function(response) {
      window.localStorage.useEncryption = true + '';
      console.log(response.farewell);
  });

  link.addEventListener('click', function() {
    if (document.getElementById('lock').checked) {
      document.getElementById('check').innerHTML = "checked";
      window.localStorage.useEncryption = true + '';
      
      chrome.tabs.query({active: true, currentWindow: window.localStorage.useEncryption}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "checked"}, function(response) {
          console.log(response.farewell);
        });
      });
    } else {
      document.getElementById('check').innerHTML = "unchecked";
      window.localStorage.useEncryption = false + '';

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: window.localStorage.useEncryption}, function(response) {
          console.log(response.farewell);
        });
      });
    }
  });
});