let player = null;
let timeout = null;
let clientName = '';

const textStyling = (id, fontStyle) => {
  $(id).css({
    'fontFamily': FONTS[fontStyle.fontFamily].id,
    'letterSpacing': fontStyle.letterSpacing + 'px',
    'wordSpacing': fontStyle.wordSpacing + 'px',
    'fontWeight': !fontStyle.isBold ? 100 : 'bold',
    'fontStyle': !fontStyle.isItalic ? 'normal' : 'italic',
    'text-decoration': !fontStyle.isUnderlined ? '' : 'underline',
    'fontSize': fontStyle.fontSize+'px',
    'textShadow': `rgba( ${fontStyle.colorShadow.r},
        ${fontStyle.colorShadow.g},
        ${fontStyle.colorShadow.b},
        ${fontStyle.colorShadow.a}) 0px 0px ${fontStyle.colorShadowWidth}px`,
    'color': `rgba( ${fontStyle.color.r},
        ${fontStyle.color.g},
        ${fontStyle.color.b},
        ${fontStyle.color.a})`
  });
}

const setupMediaWidget = (widgetConfig, data, resetAllAfterInteraction, socket, userId) => {
  clientName = data.clientName;

  const clearAll = () => {
    clearTimeout(timeout);
    timeout = null;
    
    player && player.stopVideo();
    $('.interaction').addClass('hidden');

    resetAllAfterInteraction();
  };

  socket.on([userId], message => {
    if (userId === message.userId) {

      if ( message.youtubeVideo && message.toggleVideoVisibility ) {
        $('.interaction').toggle();
      }

      if ( message.youtubeVideo && message.play && !message.pause ) {
        player && player.playVideo();
      }

      if ( message.youtubeVideo && !message.play && message.pause ) {
        player && player.pauseVideo();
      }

      if ( message.youtubeVideo && message.playerDataOnSeek ) {
        player && player.seekTo(message.playerDataOnSeek.startTime, true)
      }

      if ( message.youtubeVideo && message.volumeHasChanged ) {
        if (message.volume === 0) {
          player && player.mute();
        } else {
          player && player.unMute && player.unMute()
          player && player.setVolume && player.setVolume(message.volume);
        }
      }
    }
  })

  const setWidget = () => {
    const startTime = data.interactionMediaStartTime || 0;
    const videoURL = data.interactionMedia;
    const volume = widgetConfig.volume;
    const amount = getAmountInUAH(data.amount, data.currency);
    let autoplay = false;
    let amountPerSecond = null;
    let timer = null;

    if (widgetConfig.tieAmountToTime) {
      amountPerSecond = widgetConfig.amountPerSecond || 1;
      timer = amount / amountPerSecond * 1000;
    } else {
      timer = widgetConfig.videoTimeLimit * 1000 * 60;
    }

    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    autoplay = widgetConfig.autoStartVideo ? 1 : 0;

    const onPlayerReady = (event) => {
      event.target.setVolume(volume * 10);
    }

    const onPlayerStateChange = (event) => {
      if (event.data === 0) {
        //on end
        socket.emit('message', {
          userId,
          youtubeVideo: true,
          play: false,
          pause: true,
          end: true,
        });

        clearAll();
      }

      if (event.data === 1) {
        //on play
        if (widgetConfig.showVideoTitle && widgetConfig.videoTitleFont) {
          const title = player.getVideoData().title;
          const videoTitleFont = widgetConfig.videoTitleFont;

          textStyling('#ytplayer-title', videoTitleFont)
          $('#ytplayer-title').html(title);
        }

        if (widgetConfig.showDonatorName && widgetConfig.donatorNameFont) {
          const donatorNameFont = widgetConfig.donatorNameFont;

          textStyling('#donator-name', donatorNameFont)
          $('#donator-name').html(clientName);
        }
      }

      if (event.data === 2) {
        //on pause
      }
    }

    if (player) {
      player.setVolume(volume * 10);
      player.loadVideoById(videoURL, startTime);
    } else {
      window.onYouTubePlayerAPIReady = function () {
        player = new YT.Player('ytplayer', {
          height: '360',
          width: '640',
          videoId: videoURL,
          playerVars: {
            'autoplay': autoplay,
            'controls': 1,// 0 hide controls
            'start': startTime
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }
    };

    socket.emit('message', {
      userId,
      youtubeVideo: true,
      playerData: {
        videoURL: videoURL,
        startTime: startTime,
        volume: volume,
      }
    });

    timeout = setTimeout(() => {
      clearAll()
    }, timer)
  }

  setWidget();
}