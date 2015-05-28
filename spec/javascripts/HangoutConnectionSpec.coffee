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
      onParticipantsChanged: { add: -> },
      onApiReady: { add: (callback) -> callback({isApiReady: true}) },
      getStartData: ->
        JSON.stringify {
          title: 'Topic',
          projectId: 'project_id',
          eventId: 'event_id',
          category: 'category',
          hostId: 'host_id',
          hangoutId: 'hangout_id',
          callbackUrl: '//test.com/'
        },
      getHangoutUrl: -> 'https://hangouts.com/4',
      getParticipants: -> {},
      onair: {
        onBroadcastingChanged: { add: -> },
        getYouTubeLiveId: -> ('456IDF65'),
        isBroadcasting: -> true
      },
      layout: { displayNotice: -> }
    }
    window.gapi = { hangout: @hangout }

    setFixtures sandbox({ 'class': 'controls__status' })

    window.gapi.hangout.data.setValue 'updated', 'false'

  describe 'constructor', ->
    it 'add callback on constructor', ->
      spyOn(gapi.hangout.onApiReady, 'add')
      new HangoutApplication()
      expect(gapi.hangout.onApiReady.add).toHaveBeenCalled()

  describe 'initialize', ->
    beforeEach ->
      @app = new HangoutApplication()
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
      expect(window.setInterval).toHaveBeenCalledWith(@app.sendUrl, 120000)

    it 'sets hoa_status to "started"', ->
      gapi.hangout.data.setValue 'updated', undefined
      @app.initialize()
      expect(@app.hoa_status).toEqual('started')

  describe 'changeHoaStatus', ->
    beforeEach ->
      spyOn jQuery, 'ajax'
      @app = new HangoutApplication()

    it "sendUrl first time with hoa status of 'started' and notify true", ->
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
          hoa_status: 'started',
          notify: true
        }
      })

    it "change from 'started' to 'broadcasting' if 'broadcasting'", ->
      @app.changeHoaStatus(isBroadcasting: true)
      expect(@app.hoa_status).toEqual('broadcasting')
      expect(jQuery.ajax).toHaveBeenCalled()

    it "change from 'broadcasting' to 'finish' if end 'broadcasting'", ->
      @app.changeHoaStatus(isBroadcasting: true)
      @app.changeHoaStatus(isBroadcasting: false)
      expect(@app.hoa_status).toEqual('finished')
      expect(jQuery.ajax).toHaveBeenCalled()

  describe 'sendUrl', ->
    beforeEach ->
      @app = new HangoutApplication()
      @app.hoa_status = 'any hoa_status'
      spyOn jQuery, 'ajax'

    it 'makes request to WSO with correct params', ->
      @app.sendUrl true

      expect(jQuery.ajax).toHaveBeenCalledWith jasmine.objectContaining({
        url: '//test.com/hangout_id'})
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
          hoa_status: 'any hoa_status',
          notify: true
        }
      })

    it 'updates connection status to ok', ->
      jQuery.ajax.and.callFake (e)->
        e.success()

      @app.sendUrl()
      expect(gapi.hangout.data.getValue('status')).toEqual('ok')
      expect($('.controls__status')).toHaveClass('controls__status--ok')

    it 'displays notice and sets uptade flag after update', ->
      jQuery.ajax.and.callFake (e)->
        e.success()

      spyOn(@hangout.layout, 'displayNotice')

      @app.sendUrl()
      expect(gapi.hangout.data.getValue('updated')).toEqual('true')
      expect(@hangout.layout.displayNotice).toHaveBeenCalled()

    it 'updates connection satus to error on failure', ->
      jQuery.ajax.and.callFake (e)->
        e.error()

      @app.sendUrl()
      expect(gapi.hangout.data.getValue('status')).toEqual('error')
      expect($('.controls__status')).toHaveClass('controls__status--error')
