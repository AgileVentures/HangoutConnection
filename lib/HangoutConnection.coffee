@HangoutApplication = ->
  @initialize = =>
    if gapi.hangout.data.getValue('updated') isnt 'true'
      # gapi.hangout.onParticipantsChanged.add(->)

      $('button#update').click => @sendUrl()
      $('button#notify').click => @sendUrl true
      $('button#hide').click gapi.hangout.hideApp

      (new window.Timer).init()

      @sendUrl true
      setInterval @sendUrl, 300000
    else
      $('.controls__status').removeClass('controls__status--ok controls__status--error').addClass "controls__status--#{gapi.hangout.data.getValue 'status'}"
      # gapi.hangout.showApp()

  @init = =>
    gapi.hangout.onApiReady.add (eventObj)=>
      @initialize() if eventObj.isApiReady

  @sendUrl = (notify)=>

    startData = gapi.hangout.getStartData()

    try
      startData = JSON.parse startData
      callbackUrl = startData.callbackUrl + startData.hangoutId
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
      data:
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
      success: ->
        gapi.hangout.data.setValue('status', 'ok')

        if gapi.hangout.data.getValue('updated') != 'true'
          gapi.hangout.layout.displayNotice 'Connection to WebsiteOne established'
          gapi.hangout.data.setValue 'updated', 'true'

        $('.controls__status').removeClass('controls__status--error').addClass 'controls__status--ok'
      error: ->
        gapi.hangout.data.setValue 'status', 'error'
        $('.controls__status').removeClass('controls__status--ok controls__status--error').addClass 'controls__status--error'
      }

  return true

gadgets.util.registerOnLoadHandler((new HangoutApplication()).init) if gadgets?
