describe('Hangout Connection App', function(){

  describe('sendUrl', function(){

    beforeEach(function(){
      spyOn(jQuery, 'ajax');

      hangout =  {
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
          data: {
                  getState: function() { return { updated: false } },
                  setValue: function(key, value) { return { updated: false } }
                }
        };
      gapi = { hangout: hangout };

    });

    it('makes request to WSO with correct params', function(){
      sendUrl();
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
          participants: {}
        }
      });

    });

    it('registers onApiReady event', function() {

    });

  });
});
