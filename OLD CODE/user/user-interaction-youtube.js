let interactionData = {
  startTime: '',
  videoId: null,
  player: null,
  title: '',
};

let allowToOpenModal = false;
let youtubeInteraction = null;
let youtubeBlackListItems = null;

const toggleInteractionSelection = (state = { allowUserInteraction: false }, interactionWidgetConfig, youtubeBlackList) => {
  youtubeInteraction = interactionWidgetConfig;
  youtubeBlackListItems = youtubeBlackList;

  if (youtubeInteraction) {
    const {
      minVideoComments,
      minVideoLikes,
      minVideoViews,
      videoTimeLimit,
      tieAmountToTime,
      amountPerSecond
    } = youtubeInteraction;
    const { translation } = UserPage;

    const newText = `${parseInt(minVideoComments) !== 0 ? minVideoComments + ' ' + translation.comment + ', ' : ''}
    ${parseInt(minVideoLikes) !== 0 ? minVideoLikes + ' ' + translation.likes + ', ' : ''}
    ${parseInt(minVideoViews) !== 0 ? minVideoViews + ' ' + translation.views : ''}`;
    $("#restriction-text").text(newText);

    const durationText = `${tieAmountToTime ? translation.videoLastToAmount + ' ' + amountPerSecond + ' ' + translation.currency : videoTimeLimit + ' ' + translation.min}`;
    $("#duration-text").text(durationText);
  } else {
    $('#video-limitation').empty();
  }

  if (state.allowUserInteraction) {
    makeInteractionModal();

    $('#selectInteractionMedia').css({
      display: 'block',
      opacity: 1,
    });
  }

  if (state.allowUserInteraction) {
    allowToOpenModal = true;
  } else {
    allowToOpenModal = false;
    $('#selectInteractionMedia').css({
      opacity: 0.3,
    });
  }
};

const makeInteractionModal = () => {
  const modal = document.getElementById('mediaInteractionModal');

  $('#saveInteraction').prop('disabled', true);

  $('#selectInteractionMedia').on('click', function () {
    if (allowToOpenModal) {
      if (modal && modal.style) {
        modal.style.display = 'block';
      }

      if (interactionData.videoId) {
        $('#saveInteraction').prop('disabled', false);
        $('.media-content').show();
      } else {
        $('#saveInteraction').prop('disabled', true);
        $('.media-content').hide();
      }
    }
  })

  $('#set-start-time').on('click', function () {
    if (interactionData.player) {
      interactionData.startTime = parseInt(interactionData.player.getCurrentTime());

      let minutes = Math.floor(interactionData.startTime / 60);  
      let seconds = interactionData.startTime % 60;

      if (minutes.toString().length < 2) {
        minutes = '0' + minutes;
      }

      if (seconds.toString().length < 2) {
        seconds = '0' + seconds;
      }

      $('#seconds').val(minutes + ":" + seconds);
      $('#secondsText').text(minutes + ":" + seconds);
    }
  })

  $('#saveInteraction').on('click', function (e) {
    if (modal && modal.style) {
      modal.style.display = 'none';
    }

    interactionData.player && interactionData.player.stopVideo();
    if (interactionData.videoId) {
      $('#interactionMedia').val(interactionData.videoId);

      $('.video-not-added').css({
        display: 'none',
      });

      $('.video-added').css({
        display: 'block',
      });
    }

    if (interactionData.startTime) {
      $('#interactionMediaStartTime').val(interactionData.startTime);
    }

    if (interactionData.title) {
      $('#interactionMediaName').val(interactionData.title);
    }
  })

  $('#cancelInteraction').on('click', function () {
    interactionData.player && interactionData.player.stopVideo();
    interactionData.startTime = '';
    interactionData.videoId = null;

    $('#videoUrl').val('');
    $('#seconds').val('');
    $('#secondsText').text('00:00');

    $('#interactionMedia').val('');
    $('#interactionMediaStartTime').val('');
    $('#interactionMediaName').val('');

    $('.video-not-added').css({
      display: 'block',
    });

    $('.video-added').css({
      display: 'none',
    });

    if (modal && modal.style) {
      modal.style.display = 'none';
    }
  });
};

const setNewVideoId = async (e) => {
  if (!$('#videoUrl').val()) return;

  interactionData.videoId = await youtube_parser($('#videoUrl').val());
  interactionData.startTime = $('#seconds').val() || 0;

  if (!interactionData.videoId) {
    $('.youtube-video-requirements').addClass('error');
    return;
  }

  $('.media-content').show();
  $('#saveInteraction').prop('disabled', false);

  if (interactionData.player) {
    interactionData.startTime = 0;
    $('#seconds').val(0);

    interactionData.player.loadVideoById(interactionData.videoId);
    return;
  }

  $('.youtube-video-requirements').removeClass('error');

  $('.time-container').show();
  $('.play-button-image').hide();

  $('.media-content').append('<div id="ytplayerselectvideo"></div>');

  // Load the IFrame Player API code asynchronously.
  let tag = document.createElement('script');
  tag.src = "https://www.youtube.com/player_api";
  let firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Replace the 'ytplayerselectvideo' element with an <iframe> and
  // YouTube player after the API code downloads.

  const isMobileView = window.innerWidth > 800;

  const height = isMobileView ? '296' : '200';
  const width = isMobileView ? '420' : window.innerWidth - 70;

  window.onYouTubePlayerAPIReady = function () {
    interactionData.player = new YT.Player('ytplayerselectvideo', {
      height: height,
      width: width,
      videoId: interactionData.videoId,
      playerVars: {
        'controls': 1,// 0 hide controls
      },
    });
  }
};

const youtube_parser = async (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  let videoId = (match && match[7].length == 11) ? match[7] : false;

  if (youtubeBlackListItems.length) {
    const ifVideoForbidden = youtubeBlackListItems.find(link => link.includes(videoId));

    videoId = Boolean(ifVideoForbidden) ? false : videoId;
  }

  if (!videoId) return videoId;

  if (youtubeInteraction) {
    const {
      minVideoComments,
      minVideoLikes,
      minVideoViews
    } = youtubeInteraction;

    let response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&part=snippet&part=contentDetails&id=${videoId}&key=${UserPage.youtubeApiKey}`);
    const data = await response.json();
    const counter = data?.items[0]?.statistics || {};
    const contentDetails = data?.items[0]?.contentDetails || {};
    const snippet = data?.items[0]?.snippet;

    interactionData.title = `${snippet?.channelTitle} - ${snippet?.title}` || '';

    if (contentDetails?.contentRating?.ytRating === "ytAgeRestricted") {
      videoId = false;
    }
    if (parseInt(counter.commentCount) < parseInt(minVideoComments)) {
      videoId = false;
    }
    if (parseInt(counter.likeCount) < parseInt(minVideoLikes)) {
      videoId = false;
    }
    if (parseInt(counter.viewCount) < parseInt(minVideoViews)) {
      videoId = false;
    }

    if (!videoId) {
      $('#video-limitation').fadeTo(250, 0).fadeTo(250,1).fadeTo(250,0).fadeTo(250,1);

      $('#video-limitation').addClass('video-error');
      $('#videoUrl').addClass('video-error');
    } else {
      $('#video-limitation').removeClass('video-error');
      $('#videoUrl').removeClass('video-error');
    }
  }

  return videoId;
};
