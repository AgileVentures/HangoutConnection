describe('Hangout Connection App', function(){

  beforeEach(function(){
    var state = {};
    hangout =  {
      data: {
        getValue: function(key) { return state[key]; },
        setValue: function(key, value) { state[key] = value; }
      },
      hideApp: function() {}
    };
    gapi = { hangout: hangout };

    setFixtures(sandbox({ 'class': 'd-status' }));
    gapi.hangout.data.setValue('updated', 'false');
  });

  describe('initialize', function() {
    afterEach(function() {
      gapi.hangout.data.setValue('updated','false');
    });

    it('runs sendUrl() on start if not yet updated', function() {
      gapi.hangout.data.setValue('updated', undefined);
      spyOn(window,'sendUrl');

      initialize();
      expect(window.sendUrl).toHaveBeenCalledWith(true);
    });

    it('does not run sendUrl() on start if already updated', function() {
      gapi.hangout.data.setValue('updated', 'true');
      spyOn(window,'sendUrl');

      initialize();
      expect(window.sendUrl).not.toHaveBeenCalledWith(true);
    });

    it('runs sendUrl() every 5 minutes', function() {
      jasmine.clock().install();
      spyOn(window,'sendUrl');
      initialize();

      jasmine.clock().tick(300001);
      jasmine.clock().tick(300001);
      expect(window.sendUrl.calls.count()).toEqual(3);

      jasmine.clock().uninstall();
    });

  });

  describe('sendUrl', function(){

    beforeEach(function(){
      spyOn(jQuery, 'ajax');

      $.extend(hangout, {
        getStartData: function() {
          return JSON.stringify({
              topic: 'Topic',
              eventId: 'event_id',
              category: 'category',
              hangoutId: 'hangout_id',
              callbackUrl: 'https://test.com/'})},
          getHangoutUrl: function() { return 'https://hangouts.com/4' },
          getParticipants: function () { return {} },
          onair: { getYouTubeLiveId: function() { return '456IDF65' },
                   isBroadcasting: function() { return true; }
                 },
          layout: { displayNotice: function() {} }
        });

    });

    it('makes request to WSO with correct params', function(){
      sendUrl(true);

      expect(jQuery.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
        url: 'https://test.com/hangout_id'}));
      expect(jQuery.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
        dataType: 'text'}));
      expect(jQuery.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
        type: 'PUT'}));
      expect(jQuery.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
        data: {
          topic: 'Topic',
          event_id: 'event_id',
          category: 'category',
          hangout_url: 'https://hangouts.com/4',
          YouTubeLiveId: '456IDF65',
          participants: {},
          isBroadcasting: true,
          notify: true
        }
      }));

    });

    it('updates connection status to ok', function(){
      jQuery.ajax.and.callFake(function(e) {
        e.statusCode['200']();
      });

      sendUrl();
      expect(gapi.hangout.data.getValue('status')).toEqual('ok');
      expect($('.d-status')).toHaveClass('ok');
    });

    it('disaplys notice and sets uptade flag after update', function(){
      jQuery.ajax.and.callFake(function(e) {
        e.statusCode['200']();
      });
      spyOn(hangout.layout, 'displayNotice');

      sendUrl();
      expect(gapi.hangout.data.getValue('updated')).toEqual('true');
      expect(hangout.layout.displayNotice).toHaveBeenCalled();
    });

    it('updates connection satus to error', function(){
      jQuery.ajax.and.callFake(function(e) {
        e.statusCode['500']();
      });

      sendUrl();
      expect(gapi.hangout.data.getValue('status')).toEqual('error');
      expect($('.d-status')).toHaveClass('error');
    });

    it('makes request to WSO with correct params if callbackUrl in v0 format', function(){

      hangout.getStartData = function() { return 'https://hangouts.com/id'; };
      sendUrl();

      expect(jQuery.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
        data: {
          topic: undefined,
          event_id: undefined,
          category: undefined,
          hangout_url: 'https://hangouts.com/4',
          YouTubeLiveId: '456IDF65',
          participants: {},
          isBroadcasting: true,
          notify: undefined
        }
      }));

    });

  });
});
