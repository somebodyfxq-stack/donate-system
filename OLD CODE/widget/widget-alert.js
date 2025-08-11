/*global $, io, helpers, WidgetConfig*/
/*jshint strict: false*/
/*jslint browser: true*/
/*jslint unparam: true*/

'use strict';

const Widget = window.Widget || {};

(function (me) {

    let HEAD_FONT_FAMILY = null;
    let BODY_FONT_FAMILY = null;
    let WidgetConfig = null;
    let WidgetConfigAll = null;
    let headerFont = null;
    let bodyFont = null;
    let highlightedUserName = null;
    let highlightedAmount = null;
    let highlightDonaterAndAmount = false;
    let alreadyPlayed = false;
    let recordedVoiceAlreadyPlayed = false;

    let LIST_OF_DONATES = [];
    let uniqID = Date.now();

    let animations = null;
    let speechText = null;
    let audio = null;
    let voiceRecord = null;

    let headerText = '';
    let bodyText = '';
    let el = 0;
    let timeIsUp = false;
    let timeout = null;
    let requestTimeout = null;
    let videoTimeout = null;
    let lastDonate = {};
    let socket = null;
    let WIDGET_TOKEN = "";
    let donateExists = false;
    let CUSTOM = {};
    let lastWidget = null;
    let justStarted = false;
    const isPreview = window.location.pathname.indexOf('/preview') !== -1;
    const loudness = {
        1: 0.003,
        2: 0.009,
        3: 0.06,
        4: 0.07,
        5: 0.09,
        6: 0.2,
        7: 0.4,
        8: 0.6,
        9: 0.8,
        10: 1,
    };

    const module = {

        init: function (config) {
            WidgetConfigAll = config;
            WidgetConfig = config;

            me.setToken();
            me.setListenerForLocalStorage();
            me.checkForTestDonate();
            me.getDonationWidgetData();
            me.initSocket();
        },

        setToken: function () {
            WIDGET_TOKEN = window.location.pathname.split('token/')[1];
            WIDGET_TOKEN = WIDGET_TOKEN.replace('/', '');
        },

        checkForTestDonate: function () {
            let donate = localStorage.getItem('WidgetDonate');

            if (donate) {
                try {
                    WidgetConfigAll = JSON.parse(localStorage.getItem('WidgetConfigAll'));
                    donate = JSON.parse(donate);

                    localStorage.removeItem('WidgetConfigAll');
                    localStorage.removeItem('WidgetDonate');

                    me.setWidget(donate);
                } catch(err) {
                    console.log(err);
                }
            }
        },

        setListenerForLocalStorage: function () {
            if (isPreview) {
                window.addEventListener('storage', function (e) {
                    me.cancelAll();
                    me.getDonationWidgetData();
                });
            }
        },

        initSocket: function () {
            socket = helpers.buildSocket();

            if (socket) {
                // Listen websocket event as userId
                socket.on([userId], message => {
					if (message.sharedFromWidget && message.data && message.uniqID !== uniqID) {
						if (((message.data && message.data.isSubscription) && (WidgetConfigAll.widgetFor === 'subscription')) ||
							((message.data && !message.data.isSubscription) && (WidgetConfigAll.widgetFor === 'donate'))) {
							if (!message.data) {
								message.data = {};
							}
							message.data.fromSocket = true;
							LIST_OF_DONATES.push(message.data);
							return;
						}
					}

                    if (userId === message.userId) {
                        if (message.skipMessage) {
                            console.log('Socket: skip message immediately');
                            if (message.testPreview) {
                                localStorage.setItem('WidgetConfigAll', JSON.stringify(message.widget))
                                localStorage.setItem('WidgetDonate', JSON.stringify(message.donate))
                            }

                            window.location.reload();
                        }

                        if (message.widgetState === 2) {
                            console.log('interaction widget has ended');

                            me.resetAllAfterInteraction();
                        }
                    }
                });
            }
        },

        setTimerToCheckNewDonate: function (milliseconds) {
            // in case error need to check new donate
            timeout = setTimeout(() => {
                clearTimeout(timeout);
                console.log(`${milliseconds} OR 120 sec`);
                me.getDonationWidgetData();
            }, milliseconds || 120000);
        },

        getPreviewData: function () {
            //preview purpose
            WidgetConfig = JSON.parse(localStorage.getItem('widgetAlert'));
            WidgetConfig.timeLength = 100000;
            WidgetConfig.isReadingText = false;
            WidgetConfig.readingHeaderText = false;

            headerFont = WidgetConfig.headerFont ? WidgetConfig.headerFont : WidgetConfig.font;
            bodyFont = WidgetConfig.bodyFont ? WidgetConfig.bodyFont : WidgetConfig.font;

            highlightedUserName = WidgetConfig.highlightedUserName || null;
            highlightedAmount = WidgetConfig.highlightedAmount || null;

            highlightDonaterAndAmount = WidgetConfig.highlightDonaterAndAmount;

            animations = WidgetConfig.animationSettings;

            animations = []
            animations.push(WidgetConfig.animationSettings[0]);
            animations[0].selectedSoundPath = '';

            if (FONTS[headerFont.fontFamily]) {
                HEAD_FONT_FAMILY = FONTS[headerFont.fontFamily].id;
            }

            if (FONTS[bodyFont.fontFamily]) {
                BODY_FONT_FAMILY = FONTS[bodyFont.fontFamily].id;
            }

            const testData = {
                amount: "100",
                clientName: "Користувач",
                currency: "UAH",
                message: "Тестове повідомлення",
                source: "manual"
            };
            me.donationWidget(testData);
        },

        setWidget: function (data) {
            const correctAmount = parseInt(getAmountInUAH(data.amount, data.currency));
            const lastWidgetConfig = WidgetConfigAll.widgetsConfig[WidgetConfigAll.widgetsConfig.length - 1];
            let rangeWidget = WidgetConfigAll.widgetsConfig.find(widget => widget.isSpecificAmount && parseInt(widget.specificAmount) === correctAmount);

            if (!rangeWidget) {
                rangeWidget = WidgetConfigAll.widgetsConfig.find(widget => !widget.isSpecificAmount && (parseInt(widget.minAmount) <= correctAmount && correctAmount <= parseInt(widget.maxAmount)));
            }

            // if there is no correct widget config - it must be smaller or greater donate amount.
            if (!rangeWidget) {
                rangeWidget = WidgetConfigAll.widgetsConfig.find(widget => !widget.isSpecificAmount && (parseInt(widget.minAmount || 5) > correctAmount));
            }

            if (!rangeWidget) {
                rangeWidget = WidgetConfigAll.widgetsConfig.findLast(widget => !widget.isSpecificAmount && (parseInt(widget.maxAmount) < correctAmount));
            }

            WidgetConfig = rangeWidget || lastWidgetConfig;

            lastWidget = WidgetConfig.interactionWidgetId ? WidgetConfig : null;
            lastDonate = data;

            CUSTOM = {
                video: data.video,
                image: data.image,
                sound: data.sound,
            };

            alreadyPlayed = false;
            recordedVoiceAlreadyPlayed = false

            requestTimeout = parseInt(WidgetConfig.timeLength) * 1000;

            headerFont = WidgetConfig.headerFont ? WidgetConfig.headerFont : WidgetConfig.font;
            bodyFont = WidgetConfig.bodyFont ? WidgetConfig.bodyFont : WidgetConfig.font;
            highlightedUserName = WidgetConfig.highlightedUserName || null;
            highlightedAmount = WidgetConfig.highlightedAmount || null;
            highlightDonaterAndAmount = WidgetConfig.highlightDonaterAndAmount;

            animations = WidgetConfig.animationSettings;

            if (FONTS[headerFont.fontFamily]) {
                HEAD_FONT_FAMILY = FONTS[headerFont.fontFamily].id;
            }

            if (FONTS[bodyFont.fontFamily]) {
                BODY_FONT_FAMILY = FONTS[bodyFont.fontFamily].id;
            }

            me.donationWidget(data);

            const fadeOutAnimationExists = WidgetConfig.fadeOutAnimation && WidgetConfig.fadeOutAnimation !== 'none';
            const fadeOutAnimationDuration = fadeOutAnimationExists ? WidgetConfig.fadeOutAnimationDuration || 2.5 : 0;

            const animationTimeout = requestTimeout !== 0 ? requestTimeout - (fadeOutAnimationDuration * 1000) : 60000 - (fadeOutAnimationDuration * 1000)
            // Animation fadeout
            setTimeout(() => {
                if (fadeOutAnimationExists) {
                    // sometime animation for video-player stuck
                    $('#video-player').add("#image").add(".headerText").add(".bodyText").removeClass(`animate__${WidgetConfig.showUpAnimation}`);
                    $('.headerText').removeClass(`animate__animated animate__${WidgetConfig.headerFont.fontAnimation} ${WidgetConfig.headerFont.infiniteAnimation ? 'infinite-animation' : ''}`);
                    $('.bodyText').removeClass(`animate__animated animate__${WidgetConfig.bodyFont.fontAnimation} ${WidgetConfig.bodyFont.infiniteAnimation ? 'infinite-animation' : ''}`);
                    $('#video-player').add("#image").removeClass(`animate__animated animate__${WidgetConfig.imageAnimation} ${WidgetConfig.infiniteImageAnimation ? 'infinite-animation' : ''}`);
                    //
                    setTimeout(() => {
                        const animationDuration = `${fadeOutAnimationDuration}s`;

                        $('#video-player').add("#image").add(".headerText").add(".bodyText").css({
                            "animation-duration": animationDuration
                        });
                        $('#video-player').add("#image").add(".headerText").add(".bodyText").addClass(
                            `animate__animated animate__${WidgetConfig.fadeOutAnimation}`
                        );
                    }, 10)
                }
            // same time but subtract time for animation
            }, animationTimeout)

            setTimeout(() => {
                console.log('timeIsUp');
                timeIsUp = true;

                me.cancelAll();
                if (WidgetConfig.stopSoundWithAlert && !alreadyPlayed) {
                    audio && audio.pause();
                    audio && audio.onended();
                }
            }, requestTimeout !== 0 ? requestTimeout : 60000);
        },

        getWidgetData: function () {
            let href = window.location.href.split('?');

            const widgetUrl = `${href[0]}/info?widgetFor=${WidgetConfigAll.widgetFor || 'donate'}`;

            if (WidgetConfigAll.widgetStatus === 'paused') {
                $('body').append('<div>Віджет не активний. Для активації перейдіть у відповідний розділ на сайті та активуйте його.</div>');
                return
            }

            if (LIST_OF_DONATES.length) {
                const newList = [...LIST_OF_DONATES];
                LIST_OF_DONATES.shift();

                me.setWidget(newList[0]);
                return
            }

            $.ajax({
                url: widgetUrl,
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                success: function (data) {
                    if (data.message.indexOf('Немає нових повідомлень') === -1) {
                        me.donateExists = true;
                        socket.emit('message', {
                            userId,
                            sharedFromWidget: true,
                            data,
                            uniqID
                        });

                        me.setWidget(data);
                    } else {
                        me.donateExists = false;
                        lastWidget = null;
                        if (!justStarted) {
                            justStarted = true;

                            setTimeout(() => {
                                justStarted = false;

                                console.log('10 sec, Немає нових повідомлень');
                                clearTimeout(timeout);
                                me.getDonationWidgetData();
                            }, 15000);
                        }
                    }
                },
                error: function (err) {
                    lastWidget = false;
                    setTimeout(() => {
                        clearTimeout(timeout);
                        me.getDonationWidgetData();
                    }, 15000);
                }
            });
        },

        checkForInteractionWidget: function () {
            const config = InteractionWidgetsConfig.find(int => int._id === WidgetConfig.interactionWidgetId);
            const amount = parseInt(getAmountInUAH(lastDonate.amount, lastDonate.currency));

            let isAmountCorrectForInteraction = false;

            // verify if amount is correct to show the interaction video.
            if (WidgetConfig.isSpecificAmount) {
                if (parseInt(WidgetConfig.specificAmount) === amount) {
                    isAmountCorrectForInteraction = true;
                }
            } else {
                if (parseInt(WidgetConfig.minAmount) <= amount && amount <= parseInt(WidgetConfig.maxAmount)) {
                    isAmountCorrectForInteraction = true;
                }
            }

            if (config && lastDonate.interactionMedia && isAmountCorrectForInteraction) {
                if (config.widgetConfig) {
                    if (!lastDonate.fromSocket) {
                        socket.emit('message', {
                            userId,
                            interactionWidget: true,
                            lastDonate,
                            widgetState: 1,
                            interactionWidgetId: WidgetConfig.interactionWidgetId
                        });
                    }

                    if (config.widgetConfig.showDonateImmediately) {
                        me.resetAllAfterInteraction();
                    } else {
                        clearTimeout(timeout);
                        me.setTimerToCheckNewDonate(1000 * 60 * 21);// 21 minutes limit
                    }
                }
            } else {
                me.getWidgetData();
            }
        },

        resetAllAfterInteraction: function () {
            clearTimeout(timeout);
            lastWidget = null;

            setTimeout(() => {
                me.getDonationWidgetData();
            }, 3000)
        },

        getDonationWidgetData: function () {
            me.setTimerToCheckNewDonate();

            if (isPreview) {
                me.getPreviewData();
            } else {
                if (lastWidget && lastWidget.interactionWidgetId && lastDonate && lastDonate.interactionMedia) {
                    me.checkForInteractionWidget();
                } else {
                    me.getWidgetData();
                }
            }
        },

        clearUI: function (ms) {
            //WidgetConfig.stopWidgetImmediately
            if (!timeIsUp) {
                setTimeout(() => {
                    me.clearUI(ms);
                }, 2000);

                return
            }

            if (me.donateExists) {
				const random = Math.random() * 100;

                // WHEEL OF FORTUNE
                socket && socket.emit('message', {
                    userId,
                    lastDonate,
                    wheelOfFortune: true,
                    random
                });
            }

            timeIsUp = false;

            clearTimeout(timeout);

            if (!isPreview) {
                setTimeout(() => {
                    speechText && speechText.pause();
                    audio && audio.pause();
                    voiceRecord && voiceRecord.pause();

                    me.cancelAll();
                    me.getDonationWidgetData();
                }, ms);
            }
        },

        checkForVoiceDonate: function () {
            if (!WidgetConfig.allowVoiceRecord) {
                me.clearUI(3000);
                return
            }
            
            if (!lastDonate.uploadedVoice) {
                me.clearUI(3000);
                return
            }

            recordedVoiceAlreadyPlayed = true;

            voiceRecord = new Audio();
            voiceRecord.src = lastDonate.uploadedVoice;

            let voiceRecordVolume = loudness[parseInt(WidgetConfig.loudness, 10)];

            if (WidgetConfig.isTextVolumeSeparated) {
                voiceRecordVolume = loudness[parseInt(WidgetConfig.textLoudness || voiceRecordVolume, 10)];
            }

            voiceRecord.volume = voiceRecordVolume;

            voiceRecord.load();

            if (voiceRecord) {
                let promise = voiceRecord && voiceRecord.play();
                if (promise !== undefined) {
                    promise.then(_ => {
                        // Autoplay started!
                    }).catch(error => {
                        // Autoplay was prevented.
                        me.clearUI(3000);
                    });
                }
            } else {
                console.log('no voiceRecord');
                me.clearUI(3000);
            }

            voiceRecord.onended = () => {
                console.log('voiceRecord.onended');
                me.clearUI(3000);
            };
        },

        setAnimation: function () {
            const showUpAnimation = WidgetConfig.showUpAnimation && WidgetConfig.showUpAnimation !== 'none';
            const headerFontAnimation = WidgetConfig.headerFont.fontAnimation && WidgetConfig.headerFont.fontAnimation !== 'none';
            const bodyFontAnimation = WidgetConfig.bodyFont.fontAnimation && WidgetConfig.bodyFont.fontAnimation !== 'none';
            const imageAnimation = WidgetConfig.imageAnimation && WidgetConfig.imageAnimation !== 'none';

            if (showUpAnimation) {
                const animationDuration = `${WidgetConfig.showUpAnimationDuration || 2.5}s`;

                $('#video-player').add("#image").add(".headerText").add(".bodyText").css({
                    "animation-duration": animationDuration
                });
                $('#video-player').add("#image").add(".headerText").add(".bodyText").addClass(
                    `animate__animated animate__${WidgetConfig.showUpAnimation}`
                );
            }

            if (headerFontAnimation || bodyFontAnimation || imageAnimation) {
                const showUpAnimationDuration = showUpAnimation ? (WidgetConfig.showUpAnimationDuration || 2.5) * 1000 : 0;

                setTimeout(() => {
                    $('#video-player').add("#image").add(".headerText").add(".bodyText").removeClass(
                        `animate__animated animate__${WidgetConfig.showUpAnimation}`
                    );

                    if (headerFontAnimation) {
                        $(".headerText").css({
                            "animation-duration": `${WidgetConfig.headerFont.fontAnimationDuration || 2.5}s`
                        });
                        $('.headerText').addClass(`animate__animated animate__${WidgetConfig.headerFont.fontAnimation} ${WidgetConfig.headerFont.infiniteAnimation ? 'infinite-animation' : ''}`);
                    }

                    if (bodyFontAnimation) {
                        $(".bodyText").css({
                            "animation-duration": `${WidgetConfig.bodyFont.fontAnimationDuration || 2.5}s`
                        });
                        $('.bodyText').addClass(`animate__animated animate__${WidgetConfig.bodyFont.fontAnimation} ${WidgetConfig.bodyFont.infiniteAnimation ? 'infinite-animation' : ''}`);
                    }

                    if (imageAnimation) {
                        $('#video-player').add("#image").css({
                            "animation-duration": `${WidgetConfig.imageAnimationDuration || 2.5}s`
                        });
                        $('#video-player').add("#image").addClass(`animate__animated animate__${WidgetConfig.imageAnimation} ${WidgetConfig.infiniteImageAnimation ? 'infinite-animation' : ''}`);
                    }
                }, showUpAnimationDuration);
            }
        },

        donationWidget: function (data) {
            me.getAnimationElement(); // should be called before animation el checked

            let $block = $('.block');
            let isVideo = CUSTOM.video || animations[el].fileType && animations[el].fileType.indexOf('video') >= 0;

            let mediaBlock = isVideo ?
                `<video width="100%" height="100%" id="video-player" autoplay>
                    <source class="videoMedia" src="" />
                </video>`
                :
                '<img class="animation" id="image" src=""/>';

            if (WidgetConfig.customWidgetUi) {
                let { headerHeight, headerLeft, headerTop, headerWidth, imageHeight, imageLeft, imageTop, imageZIndex, headerZIndex, textZIndex } = WidgetConfig.customWidgetUi;
                let { imageWidth, mainHeight, mainWidth, textHeight, textLeft, textTop, textWidth } = WidgetConfig.customWidgetUi;

                me.mainStyles = {
                    height: mainHeight + 'px',
                    width: mainWidth + 'px',
                    position: 'absolute',
                    overflow: 'hidden',
                    textAlign: 'center'
                };

                let headerStyles = {
                    height: headerHeight + 'px',
                    width: headerWidth + 'px',
                    top: headerTop + 'px',
                    left: headerLeft + 'px',
                    position: 'absolute',
                    zIndex: headerZIndex
                };

                let imageStyles = {
                    height: imageHeight + 'px',
                    width: imageWidth + 'px',
                    top: imageTop + 'px',
                    left: imageLeft + 'px',
                    position: 'absolute',
                    zIndex: imageZIndex,
                    overflow: 'hidden',
                    textAlign: "initial"
                };

                let textStyles = {
                    height: textHeight + 'px',
                    width: textWidth + 'px',
                    top: textTop + 'px',
                    left: textLeft + 'px',
                    position: 'absolute',
                    zIndex: textZIndex
                };

                $block.append(`
                    <div class="remove-container" style="display: 'flex'">
                        <div id='main-widget-container' class='main-widget-container' >
                          <div class="img-container center-image">
                            ${mediaBlock}
                          </div>
                          <div class="headerText"></div>
                          <div class="bodyText"></div>
                        </div>
                    </div>
                `);

                $('.main-widget-container').css(me.mainStyles);
                $('.img-container').css(imageStyles);
                $('.animation').css({ height: "100%", width: "100%", objectFit: "contain" });
                $('.headerText').css(headerStyles);
                $('.bodyText').css(textStyles);

            } else {
                $block.append(`
                    <span class="remove-container">
                        <div class="img">
                            <div class="img-container image-temp-size text-center" id="text-center">
                                ${mediaBlock}
                            </div>
                        </div>
                        <div id="text" class="text">
                            <div class="text-container">
                                <div id="message" class="message">
                                    <div class="text-center">
                                        <div id="headerText" class="headerText"/>
                                    </div>
                                    </br>
                                    <div id="bodyText" class="bodyText"/>
                                </div>
                            </div>
                        </div>
                    </span>`
                );
            }

            let $img = $('.img');
            let $text = $('.text');
            let $headerText = $('.headerText');
            let $bodyText = $('.bodyText');

            switch (WidgetConfig.viewType) {
                case 'topBottom':
                    $img.addClass('mx-auto');
                    $text.addClass('mx-auto');
                    $text.css({ 'maxWidth': '100%' });
                    break;
                case 'bottomTop':
                    $block.addClass('flex');
                    $img.addClass('bottom mx-auto');
                    $text.addClass('top mx-auto');
                    $text.css({ 'maxWidth': '100%' });
                    break;
                case 'rightLeft':
                    $img.addClass('right');
                    $text.addClass('left');
                    $text.css({ 'maxWidth': '50%' });
                    break;
                case 'leftRight':
                    $img.addClass('left');
                    $text.addClass('right');
                    $text.css({ 'maxWidth': '50%' });
                    break;
                case 'center':
                    $img.addClass('center');
                    $text.addClass('center');
                    $text.css({ 'maxWidth': '50%' });
                    break;
                default:
                    $img.addClass('mx-auto');
                    $text.addClass('mx-auto');
                    $text.css({ 'maxWidth': '50%' });
            }

            const clientName = `<span class="highlightedUserName">${data.clientName}</span>`;
            headerText = WidgetConfig.textToShow.replace('{user}', clientName);

            const amount = `<span class="highlightedAmount">${data.amount}</span>`;
            const currency = `<span class="highlightedAmount">${CURRENCY[data.currency]}</span>`;
            headerText = headerText.replace('{amount}', amount);
            headerText = headerText.replace('{currency}', currency);
            headerText = headerText.replace('{tier}', `${data.tierName} (x${data.subscriptionSuccessCount})` || '');

			function transformText(message, textTransform) {
				if (!textTransform || textTransform === 'none') {
					return message;
				}

				return message[`to${textTransform}Case`]();
			}

            bodyText = transformText(data.message, WidgetConfig.textTransform);

            function playText(msg) {
                const linkReg = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g);
                msg = msg && msg.replace(linkReg, "");// remove url from tts
                msg = msg && msg.replace(/\*\*\*/g, '');// remove *** from tts
                msg = msg && msg.replace(/<span class="highlightedUserName">/g, '');
                msg = msg && msg.replace(/<\/span>/g, '');
                msg = msg && msg.replace(/<span class="highlightedAmount">/g, '');

                alreadyPlayed = true;

                let url = `/widget/tts?fileName=${WIDGET_TOKEN}&q=${encodeURIComponent(msg)}&language=${lastDonate.selectedTTS || WidgetConfig.languageTTS}&isTestMessage=${lastDonate.isTestMessage || ''}`;

                $.ajax({
                    url: url,
                    type: 'GET',
                    contentType: 'application/json; charset=UTF-8',
                    success: function (data) {
                        const ttsFileUrl = window.location.origin + data.url + '?timestamp=' + Date.now();

                        speechText = new Audio();
                        speechText.src = ttsFileUrl;

                        let speechTextVolume = loudness[parseInt(WidgetConfig.loudness, 10)];

                        if (WidgetConfig.isTextVolumeSeparated) {
                            speechTextVolume = loudness[parseInt(WidgetConfig.textLoudness || speechTextVolume, 10)];
                        }

                        speechText.volume = speechTextVolume;

                        speechText.load();

                        if (speechText) {
                            let promise = speechText && speechText.play();
                            if (promise !== undefined) {
                                promise.then(_ => {
                                    // Autoplay started!
                                }).catch(error => {
                                    // Autoplay was prevented.
                                    me.checkForVoiceDonate();
                                });
                            }
                        } else {
                            console.log('no speechText');
                            me.checkForVoiceDonate();
                        }

                        speechText.onended = () => {
                            console.log('speechText.onended');
                            me.checkForVoiceDonate();
                        };
                    },
                    error: function (err) {
                        console.log('error in speechText request');
                        me.checkForVoiceDonate();
                    }
                });
            }

            function onAudioEnded() {
                let msg = '';
                if (WidgetConfig.readingHeaderText) {
                    msg = headerText;
                }

                if (WidgetConfig.isReadingText && !lastDonate.uploadedVoice && data.message) {
                    msg = msg + ' ' + data.message;
                }

                if (!WidgetConfigAll.readAllText) {
                    msg = msg.substring(0, 270)
                }

                if (msg !== '') {
                    playText(msg);
                } else if (lastDonate.uploadedVoice && !recordedVoiceAlreadyPlayed) {
                    me.checkForVoiceDonate();
                } else {
                    me.clearUI(3000);
                }
            }

            function nextStep() {
                if (videoTimeout) {
                    clearTimeout(videoTimeout);
                }

                if ($('#video-player') && $('#video-player')[0]) {
                    $('#video-player')[0].removeEventListener('ended', nextStep, false);
                }

                const src = CUSTOM.sound || animations[el].selectedSoundPath;

                audio = src && new Audio(src);
                if (audio) {
                    //volume starts at 0.0 - 1.0
                    audio.volume = loudness[parseInt(WidgetConfig.loudness, 10)];

                    let promise = audio && audio.play();
                    if (promise !== undefined) {
                        promise.then(_ => {
                            // Autoplay started!
                        }).catch(error => {
                            // Autoplay was prevented.
                            onAudioEnded();
                        });
                    }
                } else {
                    onAudioEnded();
                }
                if (audio) {
                    audio.onended = () => {
                        onAudioEnded();
                    };
                }
            }

            if (isVideo) {
                // video check should be first
                // need it for video and don't need ot create audio.
                if ($('#video-player') && $('#video-player')[0]) {
                    const video = $('#video-player')[0];
                    video.volume = loudness[parseInt(WidgetConfig.loudness, 10)];
                    video.addEventListener('ended', nextStep, false);
                    // in case video is too long
                    videoTimeout = setTimeout(() => {
                        nextStep();
                    }, requestTimeout)
                }
            } else if (CUSTOM.sound || animations[el].selectedSoundPath) {
                nextStep();
            } else {
                onAudioEnded()
            }

            let headerFontGradient = {};

            if (headerFont.gradient) {
                const o = headerFont.gradientOne || {};
                const t = headerFont.gradientTwo || {};

                headerFontGradient = {
                    backgroundImage: `linear-gradient(${headerFont.gradientAngle}deg, rgba(${o.r}, ${o.g}, ${o.b}) 0%, rgba(${t.r}, ${t.g}, ${t.b}) 100%)`,
                    backgroundSize: '100%',
                    '-webkit-background-clip': 'text',
                    'MozBackgroundClip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                    'WebkitBackgroundClip': 'transparent',
                }
            }

            $headerText.css({
                'fontFamily': HEAD_FONT_FAMILY,
                'fontSize': headerFont.fontSize + 'px',
                'letterSpacing': headerFont.letterSpacing + 'px',
                'wordSpacing': headerFont.wordSpacing + 'px',
                'fontWeight': !headerFont.isBold ? 100 : 'bold',
                'fontStyle': !headerFont.isItalic ? 'normal' : 'italic',
                'text-decoration': !headerFont.isUnderlined ? '' : 'underline',
                'text-align': headerFont.textAlign || 'center',
                'color': `rgba( ${headerFont.color.r},
                                        ${headerFont.color.g},
                                        ${headerFont.color.b},
                                        ${headerFont.color.a})`,
                ...headerFontGradient,
                ...(headerFont.stroke !== '0' && headerFont.colorStroke && {
                    backgroundColor: `rgba(${headerFont.colorStroke.r},${headerFont.colorStroke.g},${headerFont.colorStroke.b},${headerFont.colorStroke.a})`,
                    'WebkitTextStroke': `${headerFont.stroke}px transparent`,
                    '-webkit-background-clip': `text`,
                })
            });

            if (!headerFont.gradient) {
                $headerText.css({
                    'textShadow': `rgba(${headerFont.colorShadow.r},${headerFont.colorShadow.g},${headerFont.colorShadow.b},${headerFont.colorShadow.a}) 0px 0px ${headerFont.colorShadowWidth}px`,
                });
            }

            let bodyTextGradient = {};

            if (bodyFont.gradient) {
                const go = bodyFont.gradientOne || {};
                const gt = bodyFont.gradientTwo || {};

                bodyTextGradient = {
                    backgroundImage: `linear-gradient(${bodyFont.gradientAngle}deg, rgba(${go.r}, ${go.g}, ${go.b}) 0%, rgba(${gt.r}, ${gt.g}, ${gt.b}) 100%)`,
                    backgroundSize: '100%',
                    '-webkit-background-clip': 'text',
                    'MozBackgroundClip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                    'WebkitBackgroundClip': 'transparent',
                }
            }

            $bodyText.css({
                'fontFamily': BODY_FONT_FAMILY,
                'fontSize': bodyFont.fontSize + 'px',
                'letterSpacing': bodyFont.letterSpacing + 'px',
                'wordSpacing': bodyFont.wordSpacing + 'px',
                'fontWeight': !bodyFont.isBold ? 100 : 'bold',
                'fontStyle': !bodyFont.isItalic ? 'normal' : 'italic',
                'text-decoration': !bodyFont.isUnderlined ? '' : 'underline',
                'text-align': bodyFont.textAlign || 'center',
                'color': `rgba( ${bodyFont.color.r},
                                        ${bodyFont.color.g},
                                        ${bodyFont.color.b},
                                        ${bodyFont.color.a})`,
                ...bodyTextGradient,
                ...(bodyFont.stroke !== '0' && bodyFont.colorStroke && {
                    backgroundColor: `rgba(${bodyFont.colorStroke.r},${bodyFont.colorStroke.g},${bodyFont.colorStroke.b},${bodyFont.colorStroke.a})`,
                    'WebkitTextStroke': `${bodyFont.stroke}px transparent`,
                    '-webkit-background-clip': `text`,
                })
            });

            if (!bodyFont.gradient) {
                $bodyText.css({
                    'textShadow': `rgba(${bodyFont.colorShadow.r},${bodyFont.colorShadow.g},${bodyFont.colorShadow.b},${bodyFont.colorShadow.a}) 0px 0px ${bodyFont.colorShadowWidth}px`,
                });
            }

            $('.headerText').html(headerText);
            $('.bodyText').html(bodyText);

            me.setAnimation();

            if (isVideo) {
                $('.videoMedia').attr('src', CUSTOM.video || animations[el].selectedAnimationPath);
            } else {
                const srcImage = CUSTOM.image || animations[el].selectedAnimationPath;
                if (srcImage) {
                    $('.animation').attr('src', srcImage);
                } else {
                    $('.animation').hide();
                }
            }

            $block.removeClass('hidden');

            if (WidgetConfig.viewType === 'center') {
                setTimeout(function () {
                    $('.text-container').css({
                        width: $('.animation')[0].clientWidth,
                        height: $('.animation')[0].clientHeight,
                        display: 'flex',
                        'flex-direction': 'column',
                        'justify-content': 'center',
                        'align-items': 'center',
                    });
                }, 200);
            }

            // should be here
            if (highlightDonaterAndAmount && highlightedUserName) {
                let highlightedUserNameTextGradient = {};

                if (highlightedUserName.gradient) {
                    const go = highlightedUserName.gradientOne || {};
                    const gt = highlightedUserName.gradientTwo || {};

                    highlightedUserNameTextGradient = {
                        backgroundImage: `linear-gradient(${highlightedUserName.gradientAngle}deg, rgba(${go.r}, ${go.g}, ${go.b}) 0%, rgba(${gt.r}, ${gt.g}, ${gt.b}) 100%)`,
                        backgroundSize: '100%',
                        '-webkit-background-clip': 'text',
                        'MozBackgroundClip': 'text',
                        '-webkit-text-fill-color': 'transparent',
                        'WebkitBackgroundClip': 'transparent',
                    }
                }

                $('.highlightedUserName').css({
                    'fontFamily': highlightedUserName.fontFamily ? FONTS[highlightedUserName.fontFamily].id : '',
                    'fontSize': highlightedUserName.fontSize + 'px',
                    'letterSpacing': highlightedUserName.letterSpacing + 'px',
                    'wordSpacing': highlightedUserName.wordSpacing + 'px',
                    'fontWeight': !highlightedUserName.isBold ? 100 : 'bold',
                    'fontStyle': !highlightedUserName.isItalic ? 'normal' : 'italic',
                    'text-decoration': !highlightedUserName.isUnderlined ? '' : 'underline',
                    ...(highlightedUserName.color  ? {'color': `rgba( ${highlightedUserName.color.r},
                        ${highlightedUserName.color.g},
                        ${highlightedUserName.color.b},
                        ${highlightedUserName.color.a})`} : {})
                    ,
                    ...highlightedUserNameTextGradient,
                    ...(highlightedUserName.stroke !== '0' && highlightedUserName.colorStroke && {
                        backgroundColor: `rgba(${highlightedUserName.colorStroke.r},${highlightedUserName.colorStroke.g},${highlightedUserName.colorStroke.b},${highlightedUserName.colorStroke.a})`,
                        'WebkitTextStroke': `${highlightedUserName.stroke}px transparent`,
                        '-webkit-background-clip': `text`,
                    })
                });

                if (!highlightedUserName.gradient && highlightedUserName.colorShadow) {
                    $('.highlightedUserName').css({
                        'textShadow': `rgba(${highlightedUserName.colorShadow.r},${highlightedUserName.colorShadow.g},${highlightedUserName.colorShadow.b},${highlightedUserName.colorShadow.a}) 0px 0px ${highlightedUserName.colorShadowWidth}px`,
                    });
                }
            }

            // should be here
            if (highlightDonaterAndAmount && highlightedAmount) {
                let highlightedAmountTextGradient = {};

                if (highlightedAmount.gradient) {
                    const go = highlightedAmount.gradientOne || {};
                    const gt = highlightedAmount.gradientTwo || {};

                    highlightedAmountTextGradient = {
                        backgroundImage: `linear-gradient(${highlightedAmount.gradientAngle}deg, rgba(${go.r}, ${go.g}, ${go.b}) 0%, rgba(${gt.r}, ${gt.g}, ${gt.b}) 100%)`,
                        backgroundSize: '100%',
                        '-webkit-background-clip': 'text',
                        'MozBackgroundClip': 'text',
                        '-webkit-text-fill-color': 'transparent',
                        'WebkitBackgroundClip': 'transparent',
                    }
                }

                $('.highlightedAmount').css({
                    'fontFamily': highlightedAmount.fontFamily ? FONTS[highlightedAmount.fontFamily].id : '',
                    'fontSize': highlightedAmount.fontSize + 'px',
                    'letterSpacing': highlightedAmount.letterSpacing + 'px',
                    'wordSpacing': highlightedAmount.wordSpacing + 'px',
                    'fontWeight': !highlightedAmount.isBold ? 100 : 'bold',
                    'fontStyle': !highlightedAmount.isItalic ? 'normal' : 'italic',
                    'text-decoration': !highlightedAmount.isUnderlined ? '' : 'underline',
                    ...(highlightedAmount.color  ? {'color': `rgba( ${highlightedAmount.color.r},
                        ${highlightedAmount.color.g},
                        ${highlightedAmount.color.b},
                        ${highlightedAmount.color.a})`} : {})
                    ,
                    ...highlightedAmountTextGradient,
                    ...(highlightedAmount.stroke !== '0' && highlightedAmount.colorStroke && {
                        backgroundColor: `rgba(${highlightedAmount.colorStroke.r},${highlightedAmount.colorStroke.g},${highlightedAmount.colorStroke.b},${highlightedAmount.colorStroke.a})`,
                        'WebkitTextStroke': `${highlightedAmount.stroke}px transparent`,
                        '-webkit-background-clip': `text`,
                    })
                });

                if (!highlightedAmount.gradient && highlightedAmount.colorShadow) {
                    $('.highlightedAmount').css({
                        'textShadow': `rgba(${highlightedAmount.colorShadow.r},${highlightedAmount.colorShadow.g},${highlightedAmount.colorShadow.b},${highlightedAmount.colorShadow.a}) 0px 0px ${highlightedAmount.colorShadowWidth}px`,
                    });
                }
            }
        },

        getAnimationElement: function () {
            if (WidgetConfig.isRandom) {
                el = Math.floor(Math.random() * animations.length);
            } else {
                if (el < animations.length - 1) {
                    el += 1;
                } else {
                    el = 0;
                }
            }
        },

        cancelAll: function () {
            $('.remove-container').remove();
            $('.block').addClass('hidden');
        }
    };

    $.extend(me, module);

}(Widget));
