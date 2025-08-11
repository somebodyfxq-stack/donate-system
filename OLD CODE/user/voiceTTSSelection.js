/*global $, JS */
/*jshint strict: false*/
/*jslint browser: true*/
/*jslint unparam: true*/


const VoiceTTSSelection = window.VoiceTTSSelection || {};

(function (me) {
	const module = {
		audio: null,
		init: function (config) {
			me.TTSDropdownOptions = config.TTSDropdownOptions || [];

			me.initEvents();
		},

		initEvents: function () {
			$('#voice-search').on('input', me.onSearch);
			$('.play-voice-btn').on('click', me.onPlayClick);
			$('#saveTTSInteraction').on('click', me.onSaveClick);
			$('#cancelTTSInteraction').on('click', me.onCancelClick);
		},

		onSearch: function () {
			const expression = $(this).val().toLowerCase();

			$('.voice-option').each(function () {
				const text = $(this).text().toLowerCase();

				$(this).toggle(text.includes(expression));
			});
		},

		onPlayClick: function (e) {
			e.preventDefault();
			me.audio && me.audio.pause();

			const selectedTTS = $(this).data('voice');
			const url = `/voices/${selectedTTS}.mp3`;

			me.audio = new Audio(url);
			me.audio.play();
		},

		onCancelClick: function (e) {
			e.preventDefault();
			me.audio && me.audio.pause();

			$('input[name="voiceTTS"]').prop('checked', false);

			$('#selectedTTS').val('');

			$('.tts-added').css({
				display: 'none',
			});

			$('.tts-not-added').css({
				display: 'block',
			});
		},

		onSaveClick: function (e) {
			e.preventDefault();
			me.audio && me.audio.pause();

			const selectedTTS = $('input[name="voiceTTS"]:checked').val();
			$('#selectedTTS').val(selectedTTS);

			$('.tts-added').css({
				display: 'block',
			});

			$('.tts-not-added').css({
				display: 'none',
			});
		},
	};

	$.extend(me, module);

}(VoiceTTSSelection));
