@HangoutApplication = ->
  @initialize = =>
    if gapi.hangout.data.getValue('updated') isnt 'true'
      # gapi.hangout.onParticipantsChanged.add(->)

      $('button#update').click => @sendUrl()
      $('button#notify').click => @sendUrl(true)
      $('button#hide').click gapi.hangout.hideApp

      (new Timer).init()

      @sendUrl true
      setInterval @sendUrl, 300000
    else
      $('.d-status').removeClass('ok error').addClass(gapi.hangout.data.getValue 'status')
      # gapi.hangout.showApp()

  @init = =>
    gapi.hangout.onApiReady.add (eventObj)=>
      @initialize() if eventObj.isApiReady

  @sendUrl = (notify)=>

    startData = gapi.hangout.getStartData()

    try
      startData = JSON.parse startData
      callbackUrl = startData.callbackUrl + startData.hangoutId;
    catch err
      callbackUrl = startData;

    hangoutUrl = gapi.hangout.getHangoutUrl()
    youTubeLiveId = gapi.hangout.onair.getYouTubeLiveId()
    participants = gapi.hangout.getParticipants()
    isBroadcasting = gapi.hangout.onair.isBroadcasting()

    $.ajax {
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
        # isBroadcasting: isBroadcasting,
        notify: notify
      },
      statusCode: {
        200: ->
          gapi.hangout.data.setValue('status', 'ok')

          if (gapi.hangout.data.getValue('updated') != 'true')
            gapi.hangout.layout.displayNotice('Connection to WebsiteOne established')
            gapi.hangout.data.setValue('updated', 'true')

          $('.d-status').removeClass('ok error').addClass('ok')
        500: ->
          gapi.hangout.data.setValue('status', 'error')
          $('.d-status').removeClass('ok error').addClass('error')
        }
      }

  return true

gadgets.util.registerOnLoadHandler((new HangoutApplication()).init) if gadgets?
