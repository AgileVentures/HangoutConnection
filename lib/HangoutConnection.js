function sendUrl(){
  if (gapi.hangout.data.getState()['updated'] != 'true') {

    var startData = gapi.hangout.getStartData();

    try {
      startData = JSON.parse(startData);
    } catch(err) {
      callbackUrl = startData;
    }

    var topic, eventId, hangoutId, callbackUrl;

    if(startData.topic !== undefined) {
      var topic = startData.topic,
          eventId = startData.eventId,
          category = startData.category,
          hangoutId = startData.hangoutId,
          callbackUrl = startData.callbackUrl + hangoutId;
    }

    var hangoutUrl = gapi.hangout.getHangoutUrl();
    var youTubeLiveId = gapi.hangout.onair.getYouTubeLiveId();
    var participants = gapi.hangout.getParticipants();

    $.ajax({
      url: callbackUrl,
      dataType: 'text',
      type: 'PUT',
      data: {
        topic: topic,
        event_id: eventId,
        category: category,
        hangout_url: hangoutUrl,
        YouTubeLiveId: youTubeLiveId,
        participants: participants
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
      $("#btn").click(function() {
        console.log(gapi.hangout.getTopic());
      });
      sendUrl();
    }
  });
}

// Wait for gadget to load.
function registerInit(){ gadgets.util.registerOnLoadHandler(init) };

registerInit();
gapi.hangout.hideApp();
