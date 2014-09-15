class Timer
  constructor: (@preset = 900000)->
    @timerId = 0
    @time = 0
    @countdown = false

  startTimer: =>
    @time = new Date(-1000)
    @countdown = false

    @_resetTimer()
    $('.js-timer-start').text 'Restart'

  stopTimer: =>
    clearInterval @timerId
    $('.js-timer-start').text 'Start'

  startCountdown: (event, @countdown)=>
    @time = new Date(@preset + 1000)
    @countdown = true
    @_resetTimer()

  _resetTimer: ->
    $('.timer__clock').removeClass 'timer__clock--error'
    @_updateTimer()

    clearInterval @timerId
    @timerId = setInterval @_updateTimer, 1000

  _updateTimer: =>
    sign = if @countdown then -1 else 1

    @time.setTime(@time.getTime() + 1000 * sign)
    $('.timer__clock').text @time.toTimeString().slice(0,8)

    if @time.getTime() == 0 and @countdown
      $('.timer__clock').addClass 'timer__clock--error'
      @stopTimer()

  init: ->
    $('.js-timer-start').click @startTimer
    $('.js-timer-stop').click @stopTimer
    $('.js-timer-countdown').click @startCountdown

@Timer = Timer
