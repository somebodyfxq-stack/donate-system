/*global $, JS */
/*jshint strict: false*/
/*jslint browser: true*/
/*jslint unparam: true*/


const VoiceRecorder = window.VoiceRecorder || {};

(function (me) {
    const module = {
        blob: null,
        init: function (config) {
            $(document).ready(function () {
                me.initEvents();
            });
        },

        toggleItems: function () {
            $('#record').hide();
            $('#stop').show();
            $('#restart').hide();
            $('.record-info').show();
            $('.record').hide();
        },

        initEvents: function () {
            $('#recordVoice').on('click', me.onVoiceRecordInitiate);
            $('#saveVoiceRecord').on('click', me.onSaveRecord);

            $('#saveVoiceRecord').prop('disabled', true);
        },

        onSaveRecord: function () {
            if (!me.blob) return;

            $('.upload-in-progress').css({
                display: 'block',
            });
            $('.voice-not-added').css({
                display: 'none',
            });
            $('.voice-added').css({
                display: 'none',
            });

            const formData = new FormData();
            const nickname = window.location.pathname.split('/')[1];
            const fileName = nickname + Date.now();
            formData.append("fileToUpload", me.blob, fileName);
            formData.append("recordType", 'voiceRecord');
            formData.append("nickname", nickname);

            const req = new XMLHttpRequest();
            req.open('POST', '/upload/file');
            req.send(formData);

            req.onload = function () {
                let text = 'Ой, щось пішло не так.';
                if (this.status >= 200 && this.status < 300) {
                    const response = JSON.parse(this.response);
                    text = 'Аудіо завантажене';
                    
                    $('#uploadedVoice').val(response.url);

                    $('.upload-in-progress').css({
                        display: 'none',
                    });
                    $('.voice-added').css({
                        display: 'block',
                    });
                }

                $('.top-right').notify({
                    type: 'warning',
                    fadeOut: {enabled: true, delay: 3000},
                    message: {text}
                }).show();
            };
        },

        onVoiceRecordInitiate: function () {
            const display = document.querySelector('.record');

            const State = ['Initial', 'Record', 'Download'];
            let audioURL = $('#uploadedVoice').val();
            let stateIndex = audioURL ? 2 : 0;
            let mediaRecorder;
            let chunks = [];
            let seconds = 0;
            let timer = null;

            // mediaRecorder setup for audio
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                console.log('mediaDevices supported..')

                navigator.mediaDevices.getUserMedia({
                    audio: true
                }).then(stream => {
                    mediaRecorder = new MediaRecorder(stream)

                    mediaRecorder.ondataavailable = (e) => {
                        chunks.push(e.data)
                    }

                    mediaRecorder.onstop = (data) => {
                        me.blob = new Blob(chunks, { 'type': data.currentTarget?.mimeType || 'audio/ogg; codecs=opus' });
                        chunks = [];
                        audioURL = window.URL.createObjectURL(me.blob);
                        if(document.querySelector('audio')) {
                            document.querySelector('audio').src = audioURL;
                        }
                    }
                }).catch(error => {
                    console.log('Following error has occured : ', error);
                })
            } else {
                stateIndex = ''
                application(stateIndex)
            }

            const clearDisplay = () => {
                display.textContent = ''
            }

            const record = () => {
                stateIndex = 1;
                mediaRecorder.start();
                application(stateIndex);
                $('#saveVoiceRecord').prop('disabled', true);

                timer = setInterval(() => {
                    seconds = seconds + 1;
                    let text = seconds;

                    if (seconds < 10) {
                        text = '0' + text;
                    }

                    $('#record-timer').text(`00:${text}`);

                    if (seconds === 30) {
                        stopRecording(false);
                        clearTimeout(timer);
                        return
                    }
                }, 1000);
            }

            const stopRecording = (isCancel) => {
                $('#record').hide();
                $('#stop').hide();
                $('#restart').show();
                $('.record-info').hide();
                $('.record').show();

                clearTimeout(timer);
                seconds = 0;

                stateIndex = 2;
                mediaRecorder.stop();
                application(stateIndex);
                $('#saveVoiceRecord').prop('disabled', isCancel);
            }

            // const downloadAudio = () => {
            //     const downloadLink = document.createElement('a')
            //     downloadLink.href = audioURL
            //     downloadLink.setAttribute('download', 'audio')
            //     downloadLink.click()
            // }

            const addMessage = (text) => {
                const msg = document.createElement('p');
                msg.textContent = text;
                display.append(msg);
            }

            const addAudio = () => {
                // TODO remove setTimeout; issue is that mediaRecorder.onstop runs after addAudio;
                setTimeout(() => {
                    clearDisplay();

                    const audio = document.createElement('audio');
                    audio.controls = true;
                    audio.src = audioURL;
                    display.append(audio);
                }, 500)
            }

            const application = (index) => {
                switch (State[index]) {
                    case 'Initial':
                        clearDisplay();
                        break;

                    case 'Record':
                        clearDisplay();
                        break

                    case 'Download':
                        clearDisplay()
                        addAudio();
                        break

                    default:
                        clearDisplay();
                        addMessage('Your browser does not support mediaDevices')
                        break;
                }
            }

            $('#record').on('click', () => {
                me.toggleItems();
                record();
            });
            
            $('#restart').on('click', () => {
                me.toggleItems();
                record();
            });

            $('#stop').on('click', () => {
                stopRecording(false);
            });

            $('#cancelVoiceRecord').on('click', () => {
                $('#uploadedVoice').val('');

                stopRecording(true);
                clearDisplay();
    
                $('#record').show();
                $('#restart').hide();
    
                $('.voice-not-added').css({
                    display: 'block',
                });
                // upload-in-progress
                $('.voice-added').css({
                    display: 'none',
                });
    
                clearTimeout(timer);
                seconds = 0;
            });

            application(stateIndex)
        }
    };

    $.extend(me, module);

}(VoiceRecorder));
