describe 'Hangout Connection App', ->
  beforeEach ->
    state = {}
    window.gadgets = { util : { registerOnLoadHandler: -> } }

    @hangout =  {
      data: {
              getValue: (key)-> state[key],
              setValue: (key, value)-> state[key] = value
            },
      hideApp: ->,
      onParticipantsChanged: { add : -> },
      onApiReady: {
        add: (callback)-> @trigger = callback,
        trigger: ''
      }
    }
    window.gapi = { hangout: @hangout }

    setFixtures sandbox({ 'class': 'd-status' })

    window.gapi.hangout.data.setValue 'updated', 'false'
    @app = new window.HangoutApplication()

  describe 'initialize', ->
    beforeEach ->
      spyOn @app, 'sendUrl'
      spyOn(gapi.hangout.onParticipantsChanged, 'add')
      @jQuerySpy = spyOn jQuery.fn, 'click'

    afterEach ->
      gapi.hangout.data.setValue 'updated', 'false'

    it 'runs sendUrl() on start if not yet updated', ->
      gapi.hangout.data.setValue 'updated', undefined
      @app.initialize()
      expect(@app.sendUrl).toHaveBeenCalledWith(true)

    it 'does not run sendUrl() on start if already updated', ->
      gapi.hangout.data.setValue 'updated', 'true'
      @app.initialize()
      expect(@app.sendUrl).not.toHaveBeenCalledWith(true)

    it 'sets refresh interval', ->
      spyOn(window, 'setInterval')
      @app.initialize()
      expect(window.setInterval).toHaveBeenCalledWith(@app.sendUrl, 300000)

  describe 'sendUrl', ->
    beforeEach ->
      spyOn jQuery, 'ajax'

      $.extend @hangout, {
        getStartData: ->
          JSON.stringify {
            title: 'Topic',
            projectId: 'project_id',
            eventId: 'event_id',
            category: 'category',
            hostId: 'host_id',
            hangoutId: 'hangout_id',
            callbackUrl: 'https://test.com/'
          },
        getHangoutUrl: -> 'https://hangouts.com/4',
        getParticipants: -> {},
        onair: {
                  getYouTubeLiveId: -> ('456IDF65'),
                  isBroadcasting: -> true
               },
        layout: { displayNotice: -> }
    }

    it 'makes request to WSO with correct params', ->
      @app.sendUrl true

      expect(jQuery.ajax).toHaveBeenCalledWith jasmine.objectContaining({
        url: 'https://test.com/hangout_id'})
      expect(jQuery.ajax).toHaveBeenCalledWith jasmine.objectContaining({
        dataType: 'text'})
      expect(jQuery.ajax).toHaveBeenCalledWith jasmine.objectContaining({
        type: 'PUT'})
      expect(jQuery.ajax).toHaveBeenCalledWith jasmine.objectContaining({
        data: {
          title: 'Topic',
          project_id: 'project_id',
          event_id: 'event_id',
          category: 'category',
          host_id: 'host_id',
          participants: {},
          hangout_url: 'https://hangouts.com/4',
          yt_video_id: '456IDF65',
          # isBroadcasting: true,
          notify: true
        }
      })

    it 'updates connection status to ok', ->
      jQuery.ajax.and.callFake (e)->
        e.statusCode['200']()

      @app.sendUrl()
      expect(gapi.hangout.data.getValue('status')).toEqual('ok')
      expect($('.d-status')).toHaveClass('ok')

    it 'disaplys notice and sets uptade flag after update', ->
      jQuery.ajax.and.callFake (e)->
        e.statusCode['200']()

      spyOn(@hangout.layout, 'displayNotice')

      @app.sendUrl()
      expect(gapi.hangout.data.getValue('updated')).toEqual('true')
      expect(@hangout.layout.displayNotice).toHaveBeenCalled()

    it 'updates connection satus to error on failure', ->
      jQuery.ajax.and.callFake (e)->
        e.statusCode['500']()

      @app.sendUrl()
      expect(gapi.hangout.data.getValue('status')).toEqual('error')
      expect($('.d-status')).toHaveClass('error')

    it 'makes request to WSO with correct params if callbackUrl in v0 format', ->

      @hangout.getStartData = -> 'https://hangouts.com/id'
      @app.sendUrl()

      expect(jQuery.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
        data: {
          title: undefined,
          project_id: undefined,
          event_id: undefined,
          category: undefined,
          host_id: undefined,
          participants: {},
          hangout_url: 'https://hangouts.com/4',
          yt_video_id: '456IDF65',
          notify: undefined
        }
      }));
