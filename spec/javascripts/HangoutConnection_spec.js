describe('Hangout Connection App', function(){

  beforeEach(function(){
    var state = {};
    hangout =  {
      data: {
        getState: function() { return state; },
        setValue: function(key, value) { state[key] = value; }
      },
      hideApp: function() {}
    };
    gapi = { hangout: hangout };

    setFixtures(sandbox({ 'class': 'd-status' }));
  });

  describe('initialize', function() {
    afterEach(function() {
      gapi.hangout.data.setValue('updated','false');
    });

    it('runs only once', function() {
      spyOn(window,'sendUrl');
      initialize();
      initialize();

      expect(window.sendUrl).toHaveBeenCalledWith(true);
      expect(window.sendUrl.calls.count()).toEqual(1);
    });

    it('runs sendUrl() every 10 seconds', function() {
      jasmine.clock().install();
      spyOn(window,'sendUrl');
      initialize();

      jasmine.clock().tick(10001);
      jasmine.clock().tick(10001);
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
          onair: { getYouTubeLiveId: function() { return '456IDF65' } },
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
          notify: true
        }
      }));

    });

    it('updates connection satus to ok', function(){
      jQuery.ajax.and.callFake(function(e) {
        e.statusCode['200']();
      });

      sendUrl();
      expect(gapi.hangout.data.getState()['status']).toEqual('ok');
      expect($('.d-status')).toHaveClass('ok');
    });

    it('updates connection satus to error', function(){
      jQuery.ajax.and.callFake(function(e) {
        e.statusCode['500']();
      });

      sendUrl();
      expect(gapi.hangout.data.getState()['status']).toEqual('error');
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
          notify: undefined
        }
      }));

    });

  });
});
