
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
composer.publicInstance._handleMessageSend = function(p, q) { f(p + '- hacked!!', q); input.publicInstance._resetState(); };

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    renderStatus('Performing Google Image search for ' + url);

    getImageUrl(url, function(imageUrl, width, height) {

      renderStatus('Search term: ' + url + '\n' +
          'Google image search result: ' + imageUrl);
      var imageResult = document.getElementById('image-result');
      // Explicitly set the width/height to minimize the number of reflows. For
      // a single image, this does not matter, but if you're going to embed
      // multiple external images in your page, then the absence of width/height
      // attributes causes the popup to resize multiple times.
      imageResult.width = width;
      imageResult.height = height;
      imageResult.src = imageUrl;
      imageResult.hidden = false;

    }, function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
  });
});
