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

  var callbackUrl;
  var startData = gapi.hangout.getStartData();

  try {
    startData = JSON.parse(startData);
    callbackUrl = startData.callbackUrl + startData.hangoutId;
  } catch(err) {
    callbackUrl = startData;
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
      title: startData.title,
      project_id: startData.projectId,
      event_id: startData.eventId,
      category: startData.category,
      host_id: startData.hostId,
      participants: participants,
      hangout_url: hangoutUrl,
      yt_video_id: youTubeLiveId,
      // isBroadcasting: isBroadcasting,
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
