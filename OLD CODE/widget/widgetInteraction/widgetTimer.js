const TIMER = {
  TIME: '1',
  DONATE_AMOUNT: '2',
};

const setupTimer = (widgetConfig, socket, userId) => {
  console.time();

  const {
    fontCounter,
    tieAmountToTime,
    timer,
    initialTime,
    donateAmountToMinutes,
    timeReduction2x,
    timeReduction4x
  } = widgetConfig;

  const amountPerSecond = tieAmountToTime ? widgetConfig.amountPerSecond : 1;

  const {
    fontFamily,
    fontSize,
    letterSpacing,
    wordSpacing,
    isBold,
    isItalic,
    isUnderlined,
    colorShadow,
    colorShadowWidth,
    fontAnimation,
    textAnimation,
    color
  } = fontCounter;

  let timeForTimer = initialTime;
  let interval = null;
  let time = 0;
  let amount = 0;

  configTimer = () => {
    if (timer === TIMER.TIME) {
      startTimer();
    }
    if (timer === TIMER.DONATE_AMOUNT) {
      startDonateTimer();
    }
  };

  const startTimer = () => {
    interval = setInterval(myTimer, 1000);
  };

  const startDonateTimer = () => {
    interval = setInterval(myDonateTimer, 1000);
  };

  const myDonateTimer = () => {
    amount = amount - amountPerSecond;

    if (amount <= 0) {
      amount = '0';
      stopMyTimer();
    }

    $('.timer-container').text(amount);
  };

  const myTimer = () => {
    time = time < 0 ? 0 : time;

    const days = Math.floor((time * 1000) / (1000 * 60 * 60 * 24));
    const hours = Math.floor(((time * 1000) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor(((time * 1000) % (1000 * 60 * 60)) / (1000 * 60));
    const second = Math.floor(((time * 1000) % (1000 * 60)) / 1000);

    const daysToShow = days ? days > 9 ? days : '0' + days + ':' : '';
    const hoursToShow = hours > 9 ? hours : '0' + hours;
    const minutesToShow = minutes > 9 ? minutes : '0' + minutes;
    const secondToShow = second > 9 ? second : '0' + second;

    let timestamp = `${daysToShow}${hoursToShow}:${minutesToShow}:${secondToShow}`;

    time = time - 1;

    if (time === 0) {
      timestamp = '00:00:00';

      stopMyTimer();
    }

    $('.timer-container').text(timestamp);
  };

  stopMyTimer = () => {
    clearInterval(interval);
    console.log('stopMyTimer');
    $('.main-container').remove();

    console.timeEnd();
  };

  $('.main-container').append(`
    <div class="timer-container"></div>`
  );

  $('.timer-container').css({
    'fontFamily': FONTS[fontFamily].id,
    'fontSize': fontSize + 'px',
    'letterSpacing': letterSpacing + 'px',
    'wordSpacing': wordSpacing + 'px',
    'fontWeight': !isBold ? 100 : 'bold',
    'fontStyle': !isItalic ? 'normal' : 'italic',
    'text-decoration': !isUnderlined ? '' : 'underline',
    'textShadow': `rgba(${colorShadow.r},${colorShadow.g},${colorShadow.b},${colorShadow.a}) 0px 0px ${colorShadowWidth}px`,
    'color': `rgba( ${color.r}, ${color.g}, ${color.b}, ${color.a})`,
    "margin-bottom": '60px'
  });

  $('.timer-container').addClass(`animate__animated animate__${fontAnimation} ${textAnimation === 'always' ? 'infinite-animation' : ''}`);

  if (socket) {
    socket.on([userId], message => {
      if (userId === message.userId && message.updateTimeWidget && !message.isDecrement) {

        const timeToAdd = ((parseInt(message.amount) / amountPerSecond) * (donateAmountToMinutes ? 60 : 1));
        let newTime = timeToAdd;

        const maxTime4x = timeReduction4x * (donateAmountToMinutes ? 60 : 1);
        const is4xApplicable = maxTime4x <= timeToAdd + parseInt(time);
        let is4xUsed = false;

        if (timeReduction4x && is4xApplicable) {
          is4xUsed = true
          newTime = timeToAdd / 4;
        }

        const maxTime2x = timeReduction2x * (donateAmountToMinutes ? 60 : 1);
        const is2xApplicable = maxTime2x <= timeToAdd + parseInt(time);

        if (timeReduction2x && is2xApplicable && !is4xUsed) {
          newTime = timeToAdd / 2;
        }

        time = parseInt(time) + parseInt(newTime);

        if (textAnimation === "onDonate") {
          $('.timer-container').removeClass(`animate__animated animate__${fontAnimation}`);
          setTimeout(() => {
            $('.timer-container').addClass(`animate__animated animate__${fontAnimation}`);
          }, 500)
        }

        clearInterval(interval);

        configTimer();
      }
    })
  }

  $(".interaction").removeClass('hidden');

  time = parseInt(timeForTimer) * (donateAmountToMinutes ? 60 : 1);
  amount = parseInt(timeForTimer);
  
  configTimer();
};