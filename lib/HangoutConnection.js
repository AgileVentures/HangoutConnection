function initialize() {
  if(gapi.hangout.data.getValue('updated') != 'true') {
      sendUrl(true);
      setInterval(sendUrl, 300000);
  } else {
      $('.d-status').removeClass('ok error').addClass(gapi.hangout.data.getValue('status'));
      gapi.hangout.hideApp();
  }
};

function sendUrl(notify){

  var startData = gapi.hangout.getStartData();

  try {
    startData = JSON.parse(startData);
  } catch(err) {
    callbackUrl = startData;
  }

  var topic, eventId, category, hangoutId, callbackUrl;

  if(startData.topic !== undefined) {
    topic = startData.topic;
    eventId = startData.eventId;
    category = startData.category;
    hangoutId = startData.hangoutId;
    callbackUrl = startData.callbackUrl + hangoutId;
  }

  var hangoutUrl = gapi.hangout.getHangoutUrl();
  var youTubeLiveId = gapi.hangout.onair.getYouTubeLiveId();
  var participants = gapi.hangout.getParticipants();
  var isBroadcasting = gapi.hangout.onair.isBroadcasting();


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
      participants: participants,
      isBroadcasting: isBroadcasting,
      notify: notify
    },
    statusCode: {
      200: function() {
        gapi.hangout.data.setValue('status', 'ok');
        $('.d-status').removeClass('ok error').addClass('ok');

        if (gapi.hangout.data.getValue('updated') != 'true') {
          gapi.hangout.layout.displayNotice('Connection to WebsiteOne established');
          gapi.hangout.data.setValue('updated', 'true');
        }
      },
      500: function() {
        gapi.hangout.data.setValue('status', 'error');
        $('.d-status').removeClass('ok error').addClass('error');
      }
    }
  })
}

function init() {
  // When API is ready...
  gapi.hangout.onApiReady.add(
    function(eventObj) {
    if (eventObj.isApiReady) {
      initialize();

      gapi.hangout.onParticipantsChanged.add(function(){});

      $('button#update').click(function(){
        sendUrl();
      });
      $('button#notify').click(function(){
        sendUrl(true);
      });
      $('button#hide').click(function(){
        gapi.hangout.hideApp();
      });
    }
  });
}

// Wait for gadget to load.
!function(){ gadgets.util.registerOnLoadHandler(init) }();
