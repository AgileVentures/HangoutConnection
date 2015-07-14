class HangoutApplication
  constructor: ->
    gapi.hangout.onApiReady.add (eventObj)=>
      if eventObj.isApiReady
        @initialize()
        gapi.hangout.onair.onBroadcastingChanged.add @changeHoaStatus

  initialize: =>
    if gapi.hangout.data.getValue('updated') isnt 'true'

      $('button#update').click => @sendUrl()
      $('button#notify').click => @sendUrl true
      $('button#hide').click gapi.hangout.hideApp

      (new window.Timer).init()

      @hoa_status = 'started'
      @sendUrl true
      @interval = setInterval @sendUrl, 120000
    else
      $('.controls__status')
        .removeClass('controls__status--ok controls__status--error')
        .addClass("controls__status--#{gapi.hangout.data.getValue 'status'}")

  changeHoaStatus: (e) =>
    prev_hoa_status = @hoa_status

    @hoa_status = if e.isBroadcasting and prev_hoa_status is 'started'
      'broadcasting'
    else if not e.isBroadcasting and prev_hoa_status is 'broadcasting'
      'finished'
    else
      prev_hoa_status

    if prev_hoa_status isnt @hoa_status
      @sendUrl()
      clearInterval(@interval) if @hoa_status == 'finished'

  sendUrl: (notify)=>
    startData = JSON.parse gapi.hangout.getStartData()

    # callbackUrl = startData.callbackUrl + startData.hangoutId
    callbackUrl =  'https://websiteone-production.herokuapp.com/hangouts/' + startData.hangoutId
    hangoutUrl = gapi.hangout.getHangoutUrl()
    youTubeLiveId = gapi.hangout.onair.getYouTubeLiveId()
    participants = gapi.hangout.getParticipants()
    isBroadcasting = gapi.hangout.onair.isBroadcasting()
    hoa_status = @hoa_status

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
        hoa_status: hoa_status,
        notify: notify
      success: ->
        gapi.hangout.data.setValue('status', 'ok')

        if gapi.hangout.data.getValue('updated') != 'true'
          gapi.hangout.layout.displayNotice 'Connection to WebsiteOne established'
          gapi.hangout.data.setValue 'updated', 'true'

        $('.controls__status')
          .removeClass('controls__status--error')
          .addClass('controls__status--ok')
      error: ->
        gapi.hangout.data.setValue 'status', 'error'
        $('.controls__status')
          .removeClass('controls__status--ok controls__status--error')
          .addClass('controls__status--error')
      }

root = exports ? window
root.HangoutApplication = HangoutApplication

gadgets.util.registerOnLoadHandler((new HangoutApplication())) if gadgets?
