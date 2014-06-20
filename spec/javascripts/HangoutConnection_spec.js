describe('Hangout Connection App', function(){

  describe('sendUrl', function(){

    beforeEach(function(){
      spyOn(jQuery, 'ajax');

      onair = { getYouTubeLiveId: function() { return '456IDF65'; } }
      hangout =  {
        getStartData: function() { return 'http://test.com/5'; },
        getHangoutUrl: function() { return 'https://hangouts.com/4'; },
        getParticipants: function() { return {}; },
        onair: onair
      }
      gapi = { hangout: hangout }

    });

    it('makes request to WSO with correct params', function(){
      sendUrl();
      expect(jQuery.ajax).toHaveBeenCalledWith({
        url: 'https://test.com/5',
        dataType: 'text',
        type: 'PUT',
        data: {
          "hangout_url": 'https://hangouts.com/4',
          "YouTubeLiveId": '456IDF65',
          "participants": {}
        }
      });

    });

    it('registers onApiReady event', function() {

    });

  });
});
