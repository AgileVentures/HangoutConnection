describe('Hangout Connection App', function(){

  beforeEach(function(){
    var state = {};
    hangout =  {
      data: {
        getState: function() { return state; },
        setValue: function(key, value) { state[key] = value; }
      }
    };
    gapi = { hangout: hangout };

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

      expect(jQuery.ajax).toHaveBeenCalledWith({
        url: 'https://test.com/hangout_id',
        dataType: 'text',
        type: 'PUT',
        data: {
          topic: 'Topic',
          event_id: 'event_id',
          category: 'category',
          hangout_url: 'https://hangouts.com/4',
          YouTubeLiveId: '456IDF65',
          participants: {},
          notify: true
        }
      });

    });

    it('makes request to WSO with correct params if callbackUrl in v0 format', function(){

      hangout.getStartData = function() { return 'https://hangouts.com/id'; };
      sendUrl();

      expect(jQuery.ajax).toHaveBeenCalledWith({
        url: 'https://hangouts.com/id',
        dataType: 'text',
        type: 'PUT',
        data: {
          topic: undefined,
          event_id: undefined,
          category: undefined,
          hangout_url: 'https://hangouts.com/4',
          YouTubeLiveId: '456IDF65',
          participants: {},
          notify: undefined
        }
      });

    });

  });
});
