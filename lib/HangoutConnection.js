function sendUrl(){
  if (gapi.hangout.data.getState()['updated'] != 'true') {
    var startData = gapi.hangout.getStartData();
    var callbackUrl = startData

    var hangoutUrl = gapi.hangout.getHangoutUrl();
    var youTubeLiveId = gapi.hangout.onair.getYouTubeLiveId();
    var participants = gapi.hangout.getParticipants();

    $.ajax({
      url: callbackUrl,
      dataType: 'text',
      type: 'PUT',
      data: {
        "hangout_url": hangoutUrl,
        "YouTubeLiveId": youTubeLiveId,
        "participants": participants
      }
    })
    gapi.hangout.data.setValue('updated','true');
  }
}

function init() {
  // When API is ready...
  gapi.hangout.onApiReady.add(
    function(eventObj) {
    if (eventObj.isApiReady) {
      sendUrl();
    }
  });
}

// Wait for gadget to load.
function registerInit(){ gadgets.util.registerOnLoadHandler(init) };

registerInit();
gapi.hangout.hideApp();
