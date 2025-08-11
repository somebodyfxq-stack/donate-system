/*global $, JS */
/*jshint strict: false*/
/*jslint browser: true*/
/*jslint unparam: true*/


const UserPage = window.UserPage || {};

(function (me) {

    const module = {

        // defaults
        status: '',
        systems: {
            fondy: {
                enabled: false,
                minAmount: 5,
                maxAmount: 3000,
                amountButtons: [],
                amountInternationalButtons: [],
                allowPayFee: false,
                feeDivider: 0.916
            },
			whitepay: {
				enabled: true,
				minAmount: 6,
				maxAmount: 10000
			},
            mono: {
                enabled: false,
                minAmount: 10,
                maxAmount: 29999,
                amountInternationalButtons: [],
                amountButtons: []
            },
			wfpb: {
				enabled: false,
				minAmount: 5,
				maxAmount: 90000
			},
			cardpay: {
				enabled: false,
				minAmount: 50,
				maxAmount: 29000
			},
			trustyeu: {
				enabled: false,
				minAmount: 1,
				maxAmount: 1000
			},
			donatello: {
				enabled: false,
				minAmount: 10,
				maxAmount: 29000,
                amountInternationalButtons: [],
                amountButtons: []
			}
        },

        isNoServiceFee: false,

        currency: {
            UAH: '₴',
            USD: '$',
            EUR: '€',
			USDT: '$T'
        },

        currencyRate: 42,

        amountButtons: [],
        amountInternationalButtons: [],
        commentOptionally: false,
        isPaymentThanks: false,
        translation: {},

        isAuthenticated: false,

        userDescriptionFontStyle: {},
        userPageFontStyle: {},
        youtubeApiKey: '',
        TENOR_API_KEY: '',
        isRestrictedCountry: false,

        modalCreated: false,

        // dom components
        clientName: null,
        goals: [],
        amount: null,
        message: null,
        form: null,

        tiers: [],
        posts: [],
        buttonColor: '',
        buttonTextColor: '',

        singlePost: false,
        nickname: '',

        presetAmount: null,
        buttonColor: '',
        alertsLimitation: [],
        currencies: [],
        allowUserSelectMedia: [],
        allowInteraction: [],
        allowModal: false,
        currentMediaWidget: {},
        interactionWidgets: [],
        allowVoiceRecord: [],
        allowUserSelectTTS: [],
        youtubeBlackList: [],
        goals: [],

        accentOnSubscription: false,

        selectedCurrency: 'UAH',
        donateButton: null,
        selectedMediaListId: '',
        selectionInteractionId: '',
        showDisclaimer: false,
		hideOneTimeDonationForm: false,

        init: function (config) {
            me.status = config.status || 'none';
            me.systems = config.systems || me.systems;

            me.currencies = config.currencies || me.currencies;
            me.buttonColor = config.buttonColor || me.buttonColor;
            me.amountInternationalButtons = config.amountInternationalButtons || me.amountInternationalButtons;

            me.isNoServiceFee = config.isNoServiceFee || me.isNoServiceFee;
            me.amountButtons = config.amountButtons || me.amountButtons;
            me.commentOptionally = config.commentOptionally || me.commentOptionally;
            me.isPaymentThanks = config.isPaymentThanks || me.isPaymentThanks;

            me.accentOnSubscription = config.accentOnSubscription || me.accentOnSubscription;

            me.goals = config.goals || me.goals;

            me.tiers = config.tiers || me.tiers;
            me.posts = config.posts || me.posts;
            me.buttonColor = config.buttonColor || me.buttonColor;
            me.buttonTextColor = config.buttonTextColor || me.buttonTextColor;

            me.singlePost = config.singlePost || me.singlePost;
            me.nickname = config.nickname || me.nickname;

            me.isAuthenticated = config.isAuthenticated || me.isAuthenticated;

            me.showDisclaimer = config.showDisclaimer || me.showDisclaimer;
            me.userDescriptionFontStyle = config.userDescriptionFontStyle;
            me.userPageFontStyle = config.userPageFontStyle;
            me.translation = config.translation;
            me.youtubeApiKey = config.youtubeApiKey;
            me.TENOR_API_KEY = config.TENOR_API_KEY;
            me.isRestrictedCountry = config.isRestrictedCountry || me.isRestrictedCountry;
			me.hideOneTimeDonationForm = config.hideOneTimeDonationForm || me.hideOneTimeDonationForm;

			me.showSubscriptionWithAnyAmount = config.showSubscriptionWithAnyAmount || me.showSubscriptionWithAnyAmount;

            me.clientName = $('input#clientName');
            me.amount = $('input#amount');
            me.message = $('textarea#message');
            me.form = $('#donateForm');
			me.formAnyAmountTier = $('#subscriptionWithAnyAmountTier');
			me.formAnyAmount = $('#subscriptionWithAnyAmount');
            me.presetAmount = $('.preset-amount');
            me.videoInteractionInput = $('#try-video');
            me.donateButton = $('#donate');

            $(document).ready(function () {
                me.checkRedirection();
                me.setSystems();
                me.checkCountry();
                me.getUserInteractions();
                me.initEvents();
                me.setProperTab();
                me.renderOptionalPendingNote();
                me.makeFontStyling();
                me.changeCurrency();
                me.setFieldsFromUrlParams();
                me.initPollSubmission();
                me.checkPost();
                me.setTierClassName();
				me.checkPostDescriptionHeight();
            });

            if (me.systems.fondy.allowPayFee) {
                $('#allowPayFeeCheck').prop('checked', true);
                me.togglePayFee();
            }

			if (me.hideOneTimeDonationForm) {
				$('#donateForm').addClass('d-none');
				$('#regularSubscriptionContainer').addClass('d-block');
                $('#oneTimeDonation').addClass('d-none');
            } else {
				$('#donateForm').addClass('d-block');
				$('#regularSubscriptionContainer').addClass('d-none');
                $('#oneTimeDonation').addClass('d-block');
            }

			if (me.showSubscriptionWithAnyAmount) {
				me.tiers.unshift({_id: '1'});
			}
        },

        initEvents: function () {
            // On tab click
            $('.nav-link').on('click', me.onTabChange);

            // Set goal
            $('.goal-buttons .btn').on('click', me.onSelectChange);

            // Set language
            $('#languageSwitcher').change(me.onLanguageChange);

            // Set system
            $('.systems .btn').on('click', me.toggleSystem);

            // Set amount
            me.presetAmount.on('click', me.setAmount);
            me.videoInteractionInput.on('click', setNewVideoId);

            // Change currency
            $('.currency').on('click', me.changeCurrency);

            // Form validation
            me.clientName.on('keypress', me.validateClientName);
            me.amount.on('keypress', me.validateAmount);
            me.amount.change(me.setCommentLimit);

            // Form submit
            me.form.on('submit', me.onFormSubmit);
            me.formAnyAmount.on('submit', function (e) {me.onAnyAmountFormSubmit(e, '')});
            me.formAnyAmountTier.on('submit', function (e) {me.onAnyAmountFormSubmit(e, 'Tier')});

            // $('#lightTheme').on('click', me.lightThemeSwitcher);
            // $('#darkTheme').on('click', me.darkThemeSwitcher);

            // Payment thanks view
            $('.payment-thanks-proceed').on('click', me.paymentThanksProceed);

            // Demo alert
            $('.sidebar').on('click', '.pending-alert', me.onPendingClick);

            // if (me.isPaymentThanks) {
            // setTimeout(() => {
            //     me.paymentThanksProceed();
            // }, 6000);
            // }

            // Allow pay fees
            $('#allowPayFeeCheck').on('change', me.togglePayFee);
            $('#amount').on('input', me.countAmountWithFee);

            $('.share-container').on('click', me.onShareClick);

            // subscription
            $('.button-subscribe').on('click', me.onSubscribeButtonClick);
            $('.subscription-button').find(':radio').on('change', me.onSubscriptionClick);
            $('.previous-level-button').on('click', function (e) { me.onTierChange(e, 'prev') });
            $('.next-level-button').on('click', function (e) { me.onTierChange(e, 'next') });
            $('#showAllTiers').click(me.onShowAllTiersClick);
            $('.support-button').click(function(e){
                e.preventDefault();
                if (me.singlePost) {
                    window.location = `${window.location.origin}/${me.nickname}`;
                } else {
                    $('#nav-profile-tab').tab('show');
                }
            });
            $('.like-container').on('click', me.onLikeClick);

			$('.show-more-button-container').on('click', me.togglePostDescription);
        },

		setTierClassName: function () {
			const isLargeImage = me.tiers.find(tier => tier.largeImage === true);
			const isLimitedSubscribers = me.tiers.find(tier => tier.isLimitedSubscribers === true);
            const isImage = me.tiers.find(tier => tier.image);

            let minHeight = 570;

            if (isLimitedSubscribers) {minHeight += 20}
            if (isLargeImage) {minHeight += 60}

            if (!me.showSubscriptionWithAnyAmount && !isImage) {minHeight -= 120}

            $('.subscription-levels').css({
                'height': minHeight + 'px',
                'min-height': minHeight + 'px',
            });

            $('.subscription-levels-description p').each(p => {
                const el = $('.subscription-levels-description p')[p];
                if (el.clientHeight < el.scrollHeight) {
                    $(el).parent().siblings('.read-more-wrapper').show();
                }
            })

			$('.subscription-levels-wrapper .subscription-levels').css({
                'interpolate-size': 'allow-keywords',
            });
		},

        checkRedirection: function () {
            const path = window.localStorage.getItem('redirectionToNews');

            if (path) {
                window.localStorage.removeItem('redirectionToNews');
                window.location.href = path;
            }
        },

        checkPost: async function () {
            if (me.singlePost) {
                const { id, seen, viewerId, postAvailable } = me.posts[0];
                if (id && seen && viewerId && postAvailable) {
                    setTimeout(() => {
                        me.setPostAsSeen({ id, seen, viewerId });
                    }, 3000);
                }
            } else {
				me.launchObserver();
            }
        },

		launchObserver: function () {
			const observer = new IntersectionObserver(me.handleIntersection, { threshold: 0.75, delay: 5000});

			me.posts.forEach(post => {
				const postsElement = document.querySelector(`[postId="${post.id}"] .post-visibility-anchor`);
				if (postsElement) {
					observer.observe(postsElement);
				}
			});
		},

		handleIntersection: function (entries) {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const postId = $(entry.target).parent().attr('postId');
					const filteredPost = me.posts.filter(post => post.id === postId)
					const { id, seen, viewerId, postAvailable } = filteredPost[0];

					if (id && seen && viewerId && postAvailable) {
						console.log(`Post with id ${postId} is intersecting!`);
						me.setPostAsSeen({ id, seen, viewerId });
					}
				}
			});
		},

        setPostAsSeen: async function ({ id, seen, viewerId }) {
            if (!seen.find((seenId) => seenId === viewerId)) {
                // TODO add user id to seen array to avoid calling API one more time
                $.ajax({
                    url: `/post/seen/${id}`,
                    method: 'GET',
                });
            }
        },

        onShareClick: async function () {
            const postUrl = `https://${window.location.host}${$(this).attr( "data-url")}`;
            me.copyText(postUrl);

            const shareData = {
                // title: "MDN",
                // text: "Learn web development on MDN!",
                url: postUrl,
            };

            if (window.navigator.share && window.navigator.canShare(shareData)) {
                try {
                    await window.navigator.share(shareData);
                } catch (err) {
                    console.log(err)
                }
            }

            me.showNotification('Скопійовано');
        },

        copyText(text) {
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        },

        checkUserTC: function (that) {
			const termsCheckbox = that.closest('.subscription-with-terms-wrapper').find('.terms-subscription');

            if (termsCheckbox && termsCheckbox.prop('checked') == false) {
				console.log('Terms not accepted');
				me.showNotification(me.translation.acceptTermsMessage);
				return false;
			}

			return true;
        },

        checkUserSession: function (tierId, tierData) {
			if (!me.isAuthenticated) {
                window.localStorage.setItem('redirectionFrom', window.location.href);
                window.localStorage.setItem('desiredTierId', tierId);
                tierData && window.localStorage.setItem('desiredTierData', JSON.stringify(tierData));
                window.localStorage.setItem('noUserSession', 'noUserSession');
                window.location.href = `${window.location.origin}/login`;
                return false;
            }

            return true;
        },

        onSubscribeButtonClick: function (e) {
            const subscribeBtn = $(this);
            const tierId = subscribeBtn.attr('buttonId');

            if (!me.checkUserTC($(this))) return;
            if (!me.checkUserSession(tierId)) return;

            me.processSubscribe(subscribeBtn, tierId, null, 'subscriptionMain', {});
        },

        onShowAllTiersClick: function (e) {
            e.preventDefault();
            const userName = window.location.pathname.split('/')?.[1] || '';

            history.pushState({}, null, `/${userName}/tiers`);
            $('#nav-contact-tab').tab('show');
        },

        onTabChange: function (e) {
            const tabId = e.currentTarget.id;
            const userName = window.location.pathname.split('/')?.[1] || '';

            if (!userName) return;

            switch (tabId) {
                case 'nav-home-tab':
                    history.pushState({}, null, `/${userName}/about`);
                    break;
                case 'nav-profile-tab':
                    // if accentOnSubscription we need to set system and currency again
                    if (me.accentOnSubscription) {
                        me.setSystems();
                        me.changeCurrency();
                    }
                    history.pushState({}, null, `/${userName}`);
                    break;
                case 'nav-contact-tab':
                    // set again if user lands on a different tab to calculate again
                    me.setTierClassName();
                    history.pushState({}, null, `/${userName}/tiers`);
                    break;
                case 'nav-news-feed-tab':
                    me.checkPostDescriptionHeight();
                    history.pushState({}, null, `/${userName}/news`);
                    break;
                default:
            }
        },

        setProperTab: function () {
            const tab = window.location.pathname.split('/')?.[2] || '';

            switch (tab) {
                case 'about':
                    $('#nav-home-tab').tab('show');
                    break;
                case 'subscription':
                    $('#nav-news-feed-tab').tab('show');
                    break;
                case 'tiers':
                case 'subscribe':
                    $('#nav-contact-tab').tab('show');
                    break;
                case 'news':
                    $('#nav-news-feed-tab').tab('show');
                    break;
                default:
            }
        },

        initPollSubmission: function (e) {
            me.posts.forEach(post => {
                if (post.postType === 'poll') {
                    const postId = post.id;
                    $(`[formId=${postId}]`).on('submit', function(e){
                        e.preventDefault();
                        const checkedValue = $(`input[name=${postId}]:checked`).val() || false;
                        const voteState = $(`#voteButton${postId}`).attr('name');

                        $.ajax({
                            url: `/poll?postId=${postId}&checkedValue=${checkedValue}&voteState=${voteState}`,
                            method: 'GET',
                            success: function (resp) {
                                if (resp.success) {
                                    const {pollOptions, optionMap, votes, reVote, userOptionSelected} = resp.data;

                                    $(`#poll-container${postId}`).empty();

                                    let progress = '';
                                    pollOptions.forEach((poll, i) => {
                                        if (voteState === 'vote') {
                                            let width = 0;
                                            let counter = 0;

                                            if (optionMap[poll]) {
                                                counter = optionMap[poll]?.length;
                                                width = optionMap[poll]?.length * 100 / votes;
                                            }

                                            progress += `
                                                <div class="progress mb-2">
                                                    <div class="progress-bar" role="progressbar"
														style="width: ${width.toFixed()}%" aria-valuenow="${width.toFixed()}"
														aria-valuemin="0" aria-valuemax="100"
													>
														<div class='poll-options'>
															<div>
																${poll}
																${userOptionSelected === poll ? '<i class="fa-solid fa-check item-selected-icon ms-1"></i>' : ''}
															</div>
															<div>
																(${counter}) ${width.toFixed()}%
															</div>
														</div>
													</div>
                                                </div>`
                                        } else {
                                            progress += `
                                                <div class="form-check pb-2">
                                                    <input class="form-check-input" type="radio" name="${postId}" id="${poll}${i}" value="${poll}" required>
                                                    <label class="form-check-label" for="${poll}${i}">
                                                        ${poll}
                                                    </label>
                                                </div>
                                            `
                                        }
                                    })

                                    if (reVote) {
                                        $(`#voteButton${postId}`).attr('name', voteState === 'vote' ? 'reVote':'vote');
                                        $(`#voteButton${postId}`)[0].innerText = voteState === 'vote' ? 'Переголосувати':'Голосувати';
                                    } else {
                                        $(`#voteButton${postId}`).hide();
                                    }

                                    $(`#voted${postId}`).children()[0].innerText = votes;

                                    $(`#poll-container${postId}`).append(progress);
                                }
                            }
                        });
                    });
                }
            })
        },

        isInternationalCurrency: function () {
            const system = me.getSystem();

            const systems = ['fondy', 'wfpb', 'whitepay', 'trustyeu', 'donatello'];

            return (systems.includes(system)) && me.selectedCurrency !== 'UAH';
        },

        onSubscriptionClick: function (e) {
            $('.subscription-button').removeClass('active-subscription-button')

            if (e.target.value === 'one-time') {
                $('#regularSubscriptionContainer').addClass('d-none').removeClass('d-block');
                $('#oneTimeDonation').removeClass('d-none').addClass('d-block');
            } else {
                $('#regularSubscriptionContainer').removeClass('d-none').addClass('d-block');
                $('#oneTimeDonation').addClass('d-none').removeClass('d-block');
            }

            $(e.target).closest('.subscription-button').addClass('active-subscription-button');
            $('.subscription-button').removeAttr('style');
            $('.subscription-button.active-subscription-button').css({
                backgroundColor: me.buttonColor,
                borderColor: me.buttonColor,
                color: me.buttonTextColor,
            })
        },

        getNextTier: function (currentIndex, step) {
            if (step === 'next') {
                if (currentIndex === me.tiers.length-1) {
                    return me.tiers[0]._id;
                } else {
                    return me.tiers[currentIndex+1]._id;
                }
            }

            if (step === 'prev') {
                if (currentIndex === 0) {
                    return me.tiers[me.tiers.length-1]._id;
                } else {
                    return me.tiers[currentIndex-1]._id;
                }
            }

            return 0;
        },

        onLikeClick: function (e) {
            const postId = this.id;
            const likeStatus = $(this).hasClass("liked") ? 'dislike' : 'like';
            const currentPost = me.posts.find(post => post.id === postId);

            if (!currentPost.postAvailable) return;

            $.ajax({
                url: '/likes/' + postId + '/' + likeStatus,
                method: 'GET',
                success: function (resp) {
                    if (resp.success) {
                        if (likeStatus === 'like') {
                            $(`#${postId}`).addClass('liked');
                            let counter = $(`#${postId} span`)[0].innerText;
                            counter = !counter || isNaN(counter) ? 0 : counter;
                            $(`#${postId} span`)[0].innerText = parseInt(counter) + 1;
                        } else {
                            $(`#${postId}`).removeClass('liked');
                            let counter = $(`#${postId} span`)[0].innerText;
                            counter = !counter || isNaN(counter) ? 0 : counter;
                            $(`#${postId} span`)[0].innerText = parseInt(counter) - 1;
                        }
                    }
                }
            });
        },

		checkPostDescriptionHeight: function () {
			const posts = $('.news-feed-card');

			posts.each(function () {
				const postContainer = $(this);
				const description = postContainer.find('.post-description');
				const buttonContainer = postContainer.find('.show-more-button-container');

				if (description[0].scrollHeight > 450) {
					buttonContainer.show();
				} else {
					buttonContainer.hide();
				}
			});
		},

		togglePostDescription: function () {
			const postContainer = $(this).closest('.news-feed-card');
			const description = postContainer.find('.post-description');

			if (description.hasClass('expanded')) {
				description.removeClass('expanded');
				$(this).html(`<span class="me-1">Читати повністю</span><i class="fa-solid fa-chevron-down"></i>`);
			} else {
				description.addClass('expanded');
				$(this).html(`<span class="me-1">Згорнути</span><i class="fa-solid fa-chevron-up"></i>`);
			}
		},

        onTierChange: function (e, step) {
            let currentId = $(e.target).parent()?.[0].id;

            if (!currentId) {
                currentId = $(e.target).parent()?.parent()?.[0].id;
            }

            if (!currentId) return;

            $('.subscription-level-container').addClass('d-none');

            const currentIndex = me.tiers.findIndex(tier => tier._id === currentId);

            const nextTier = me.getNextTier(currentIndex, step);
            $(`#${nextTier}`).addClass('d-flex').removeClass('d-none');
        },

		// countEnabledSystems: function () {
		// 	let enabled = 0;

		// 	if (me.systems.fondy.enabled === true) enabled++;
		// 	if (me.systems.whitepay.enabled === true) enabled++;
		// 	if (me.systems.mono.enabled === true) enabled++;

		// 	return enabled;
		// },

        setSystems: function () {
			if (me.systems.donatello.enabled) {
				me.form.find('#payment-method-wrapper-donatello').show();
			}

			if (me.systems.wfpb.enabled) {
				me.form.find('#payment-method-wrapper-wfpb').show();
			}

			if (me.systems.mono.enabled) {
				me.form.find('#payment-method-wrapper-mono').show();
			}

			if (me.systems.whitepay.enabled) {
				me.form.find('#payment-method-wrapper-whitepay').show();
			}

			if (me.systems.fondy.enabled) {
				me.form.find('#payment-method-wrapper-fondy').show();
			}

			if (me.systems.cardpay.enabled) {
				me.form.find('#payment-method-wrapper-cardpay').show();
			}

			if (me.systems.trustyeu.enabled) {
				me.form.find('#payment-method-wrapper-trustyeu').show();
			}

            if (me.systems.fondy.enabled === true) {
                me.toggleAllowPayFeeOption(true);
            }

            if (me.systems.mono.enabled) {
                $('button[data-id="mono"]').show(); // old page version (v1)
            }

			me.form.find('.systems').show();
			me.form.find('.systems .payment-method-input:visible:first').prop('checked', true);
			me.form.find('.systems .payment-method-input:visible:first').closest('.payment-method-button').addClass('active-payment-method-button');

			const system = me.getSystem();
			me.form.find('input[name="system"]').val(system);
            me.toggleIsNoServiceFeeOption();
            me.buildAmountHelp();
			console.log(`Default system: ${system}`);
        },

        getSystem: function () {
            return me.form.find('.systems .payment-method-input:checked').val() || 'whitepay';
        },

        setSystem: function (system) {
            me.form.find('input[name="system"]').val(system);
        },

		toggleForm: function (system) {
			if (system === 'trustyeu') {
				me.form.find('[name="currency"]').hide();
				me.form.find('#currency-trustyeu').show();
				me.form.find('#currency-whitepay').hide();
				me.form.find('#currency-uah').hide();
				me.selectedCurrency = 'EUR';
			} else if (system === 'whitepay') {
				me.form.find('[name="currency"]').hide();
				me.form.find('#currency-trustyeu').hide();
				me.form.find('#currency-whitepay').show();
				me.form.find('#currency-uah').hide();
				me.selectedCurrency = 'USDT';
            } else if (system === 'mono' || system === 'cardpay') {
                me.form.find('[name="currency"]').hide();
				me.form.find('#currency-trustyeu').hide();
				me.form.find('#currency-whitepay').hide();
				me.form.find('#currency-uah').show();
				me.selectedCurrency = 'UAH';
			} else {
				me.form.find('[name="currency"]').show();
				me.form.find('#currency-trustyeu').hide();
				me.form.find('#currency-whitepay').hide();
				me.form.find('#currency-uah').hide();
				// me.selectedCurrency = 'UAH';
			}
		},

        toggleSystem: function (system) {
            system = $(this).attr('data-id') || system;

            if (system) {
                me.setSystem(system);
                me.form.find('.systems .btn').removeClass('active');
                $(this).addClass('active');

                $('.active-payment-method-button').removeClass('active-payment-method-button');
                $(this).parent().parent().addClass('active-payment-method-button');

                me.toggleForm(system);

                const currencyToSet = {
                    mono: 'UAH',
                    whitepay: 'USDT',
                };

				me.changeCurrency(currencyToSet[system] || '');

                me.toggleAllowPayFeeOption(system === 'fondy');
                me.toggleIsNoServiceFeeOption();
                me.buildAmountHelp();

				console.log(`System: ${system}`);
            }
        },

        toggleAllowPayFeeOption: function (show) {
            if (me.systems.fondy.allowPayFee) {
                me.form.find('.allowPayFee').toggle(show);
            }
        },

        toggleIsNoServiceFeeOption: function () {
            if (me.isNoServiceFee) {
                me.form.find('.isNoServiceFee').show();
            } else {
                me.form.find('.isNoServiceFee').hide();
            }
        },

        buildAmountHelp: function () {
            const currentSystem = me.getSystem();

			if (currentSystem === 'whitepay') {
				$('#minAmount').text(me.systems.whitepay.minAmount);
				$('#maxAmount').text(me.systems.whitepay.maxAmount);
				$("#currencySign").text(CURRENCY[me.selectedCurrency]);
				$("#totalCurrencySign").text(CURRENCY[me.selectedCurrency]);
				$('.amountHelp').show();

			} else {
				const isInternational = me.isInternationalCurrency() ? 'International' : '';

				$('#minAmount').text(me.systems[currentSystem]?.['minAmount'+[isInternational]]);
				$('#maxAmount').text(me.systems[currentSystem]?.['maxAmount'+[isInternational]]);

				$('.amountHelp').show();
				me.countAmountWithFee();
			}
        },

        initModal: function () {
            if (me.modalCreated) return;

            const modal = document.getElementById('mediaModal');

            $('#add-gif-btn').on('click', (e) => {
                $('.add-gif-container').toggleClass('d-none')
                $('.add-gif-icon-down').toggleClass('d-none')
                $('.add-gif-icon-up').toggleClass('d-none')
                e.preventDefault()
            })

            $('#add-sound-btn').on('click', (e) => {
                $('.add-sound-container').toggleClass('d-block')
                $('.add-sound-icon-down').toggleClass('d-none')
                $('.add-sound-icon-up').toggleClass('d-none')
                e.preventDefault()
            })

            $('#selectMediaButton').on('click', function () {
                if (me.allowModal && modal && modal.style) {
                    modal.style.display = 'block';
                }
            })
            $('#save').on('click', function () {
                if (modal && modal.style) {
                    modal.style.display = 'none';
                }

                if ($('#sound').val() || $('#image').val()) {
                    $('.media-not-added').css({
                        display: 'none',
                    });

                    $('.media-added').css({
                        display: 'block',
                    });
                } else {
                    $('.media-not-added').css({
                        display: 'block',
                    });

                    $('.media-added').css({
                        display: 'none',
                    });
                }
            })
            $('#cancel').on('click', function () {
                if (modal && modal.style) {
                    modal.style.display = 'none';
                }

                $('.selected-sound').removeClass('selected-sound');
                $('.selected-image').removeClass('selected-image');

                $('#sound').val('');
                $('#image').val('');

                $('.media-not-added').css({
                    display: 'block',
                });

                $('.media-added').css({
                    display: 'none',
                });
            })

            me.modalCreated = true;
        },

        checkCountry: function () {
            if (me.isRestrictedCountry) {
                // Disable donate button and show alert if the client is from restricted country
                me.donateButton.attr('disabled', 'disabled');

                $('.donation-button').after(`<div class="ms-2 mt-2">
                    <i class="fas fa-warning me-1" style="color: #856404"></i>
                    <small class="text-muted">${me.translation.restrictedCountryDisclaimer}.</small>
                </div>`);
            }
        },

        isCurrencyAllowed: function (currency) {
            const paymentSystem = me.getSystem();

            const currencyToUpperCase = currency.toUpperCase();

            if (paymentSystem === 'mono' && currencyToUpperCase !== Currency.UAH) {
                return false;
            }

            if (paymentSystem === 'whitepay' && currencyToUpperCase !== Currency.USDT) {
                return false;
            }

            if (paymentSystem === 'trustyeu' && currencyToUpperCase !== Currency.EUR) {
                return false;
            }

            if (currency && currency !== '' && me.currencies.split(', ').includes(currencyToUpperCase)) {
                return true;
            }

            return false;
        },

        getAllowedCurrency: function (currency, paymentSystem) {
            const systemCurrency = {
				donatello: me.currencies.split(', '),
                fondy: me.currencies.split(', '),
                mono: [Currency.UAH],
                whitepay: [Currency.USDT],
				wfpb: me.currencies.split(', '),
				trustyeu: [Currency.EUR]
            };

            const isCurrencyAvailable = systemCurrency[paymentSystem] ? systemCurrency[paymentSystem].find(curr => curr === currency) === currency : false;

			return isCurrencyAvailable ? currency : (systemCurrency[paymentSystem] ? systemCurrency[paymentSystem][0] : Currency.UAH);
        },

        setFieldsFromUrlParams: function () {
            let pathnames = window.location.pathname.split('/');
            let goalNameOldFashion = pathnames[pathnames.length - 1];

            const urlParams = new URLSearchParams(window.location.search);
            const clientName = urlParams.get('c');
            const message = urlParams.get('m');
            const currency = urlParams.get('t');
            const paymentSystem = urlParams.get('p');
            const goalName = urlParams.get('g');
            let amount = urlParams.get('a');

            if (paymentSystem) {
                let disableField = false;
                switch (paymentSystem) {
                    case 'fondy':
                        if (me.systems.fondy.enabled) {
                            disableField = true;
                            $("#paymentMethodFondy").click();
                        }
                        break;
                    case 'whitepay':
                        if (me.systems.whitepay.enabled) {
                            disableField = true;
                            $("#paymentMethodWhitepay").click();
                        }
                        break;
                    case 'mono':
                        if (me.systems.mono.enabled) {
                            disableField = true;
                            $("#paymentMethodMono").click();
                        }
                        break;
                    case 'wfp':
                        if (me.systems.wfpb.enabled) {
                            disableField = true;
                            $("#paymentMethodWfpb").click();
                        }
                        break;
                    default:
                        // do nothing
                }

                if (disableField) {
                    $("#paymentMethodFondy").attr("disabled", true);
                    $("#paymentMethodWhitepay").attr("disabled", true);
                    $("#paymentMethodMono").attr("disabled", true);
                    $("#paymentMethodWfpb").attr("disabled", true);
                }
            }

            if (clientName && clientName.length <= 150) {
                $('#clientName').val(clientName).attr('disabled', 'disabled');
            }

            if (currency && me.isCurrencyAllowed(currency)) {
                const currencyToUpperCase = currency.toUpperCase();

                me.changeCurrency(currencyToUpperCase);
                $('#currency').val(currencyToUpperCase);
                $('[name="currency"]').attr('disabled', 'disabled');
            }

            if (amount && amount !== '') {
                amount = !isNaN(amount) ? parseInt(amount, 10) : me.systems.fondy.minAmount;
                me.setAmount({target: {innerText: amount}});

                $('#amount').attr('disabled', 'disabled');
                $('[name="currency"]').attr('disabled', 'disabled');
                $('.preset-amount').addClass('disabled');
            }

            if (me.goals.length === 0) {
                $('.goal-dropdown').remove();
            } else {
                let goalIndex = me.goals.findIndex(g => (goalName || goalNameOldFashion) === g.widgetConfig.urlName);
                goalIndex = goalIndex === -1 ? 0 : goalIndex;

                $(`#${me.goals[goalIndex]._id}-goal`).click();

                if (goalName && goalIndex !== -1) {
                    $('.goal-input').attr("disabled", true);
                }

                me.buildCurrentGoal(me.goals[goalIndex]);
            }

            if (message && message.length <= 500) {
                $('#message').val(message).attr('disabled', 'disabled');
            }
        },

        makeModal: function (modalData) {
            me.initModal();

            if (modalData.tenorAnimationAllowed) {
                $('#search-gif-tenor-container').show();
			    TenorGifAnimations(modalData, me);
            } else {
                $('#search-gif-tenor-container').hide();
            }

            let pathnames = window.location.pathname.split('/');
            const url = pathnames[1];
            let search = '';

            if (modalData.mediaListId) {
                search = '?mediaListId=' + modalData.mediaListId;
            }

            $.ajax({
                url: '/' + url + '/media' + search,
                method: 'GET',
                success: function (resp) {
                    if (resp.success) {
                        //clear all items
                        $('.animations').empty();
                        $('.sounds').empty();

                        resp.media?.video?.forEach(s => {
                            $('.animations').append(`
                                <div class="col-lg-4 col-sm-4 col-6 mb-0 nopad text-center imageMedia"
                                    src="${s.url || s.path}"
                                    id="${s._id || s.id}"
                                >
                                    <div class="position-relative">
                                        <label class="image-checkbox">
                                        <video width="100%" height="auto" controls>
                                            <source class="videoMedia" src="${s.url}" />
                                        </video>
                                        <input name="image" value="${s.name}" type="checkbox">
                                        <i class="fa fa-check d-none"></i>
                                        </label>
                                    </div>
                                </div>
                            `);
                        });
                        resp.media?.animations?.forEach(s => {
                            $('.animations').append(`
                                <div class="col-lg-4 col-sm-4 col-6 mb-0 nopad text-center imageMedia image-input"
                                    src="${s.url || s.path}"
                                    id="${s._id || s.id}"
                                >
                                    <div class="position-relative">
                                        <label class="image-checkbox">
                                        <img src="${s.url || s.path}" class="w-100 shadow-1-strong " alt="">
                                        <input name="image" value="${s.name}" type="checkbox">
                                        <i class="fa fa-check d-none"></i>
                                        </label>
                                    </div>
                                </div>
                            `);
                        });
                        resp.media?.sounds?.forEach(s => {
                            $('.sounds').append(`
                                <div class="col-lg-6 position-relative soundMedia"
                                    id="${s._id || s.id}" src="${s.url || s.path}"
                                >
                                    <span class="sound-label">${s.name}</span>
                                    <label class="audio-checkbox">
                                        <audio controls>
                                            <source src="${s.url || s.path}" type="audio/mpeg">
                                            Your browser does not support the audio element.
                                        </audio>
                                        <input name="sound" value="${s.name}" type="checkbox">
                                        <i class="fa fa-check"></i>
                                    </label>
                                </div>
                            `);
                        });

                        $('.imageMedia').on('click', me.onImageClick);
                        $('.soundMedia').on('click', me.onSoundClick);
                    } else {
                        me.showNotification(resp.message || 'Щось пішло не так');
                    }
                }
            });
        },

        makeFontStyling: function () {
            if (me.userDescriptionFontStyle && Object.keys(me.userDescriptionFontStyle).length > 0) {
                const descr = me.userDescriptionFontStyle;

                $('.user-description').css({
                    'fontFamily': descr.fontFamily && FONTS[descr.fontFamily].id,
                    'fontSize': descr.fontSize + 'px',
                    'letterSpacing': descr.letterSpacing + 'px',
                    'wordSpacing': descr.wordSpacing + 'px',
                    'fontWeight': !descr.isBold ? 100 : 'bold',
                    'fontStyle': !descr.isItalic ? 'normal' : 'italic',
                    'text-decoration': !descr.isUnderlined ? '' : 'underline',
                    'textShadow': descr.colorShadow && `rgba(${descr.colorShadow?.r},
                            ${descr.colorShadow?.g},
                            ${descr.colorShadow?.b},
                            ${descr.colorShadow?.a}) 0px 0px
                            ${descr.colorShadowWidth}px`,
                    'color': descr.color && `rgba(${descr.color?.r},
                            ${descr.color?.g},
                            ${descr.color?.b},
                            ${descr.color?.a})`
                });
            }

            if (me.userPageFontStyle && Object.keys(me.userPageFontStyle).length > 0) {
                const userDescr = me.userPageFontStyle;

                $('.pageTextAll-fontSize').css({
                    'fontSize': userDescr.fontSize + 'px',
                });


                userDescr.fontFamily && $('.pageTextAll-font').css({
                    'fontFamily': FONTS[userDescr.fontFamily].id,
                });

                $('.pageTextAll-color').css({
                    'color': `rgba( ${userDescr.color?.r},
                        ${userDescr.color?.g},
                        ${userDescr.color?.b},
                        ${userDescr.color?.a})`
                });

                $('.pageTextAll-all').css({
                    'letterSpacing': userDescr.letterSpacing + 'px',
                    'wordSpacing': userDescr.wordSpacing + 'px',
                    'fontWeight': !userDescr.isBold ? 100 : 'bold',
                    'fontStyle': !userDescr.isItalic ? 'normal' : 'italic',
                    'text-decoration': !userDescr.isUnderlined ? '' : 'underline',
                    'textShadow': userDescr.colorShadow && `rgba(${userDescr.colorShadow?.r},
                        ${userDescr.colorShadow?.g},
                        ${userDescr.colorShadow?.b},
                        ${userDescr.colorShadow?.a}) 0px 0px
                        ${userDescr.colorShadowWidth}px`,
                });
            }
        },

        renderOptionalPendingNote: function () {
            if (me.status === 'pending') {
                $('.sidebar').append('<div class="pending-alert mt-2 mb-2"><i class="fas fa-pause-circle me-2"></i></strong>Призупинено</div>');
            }
        },


        /**
         * Goals
         *
         */
        getUserInteractions: function () {
            let pathnames = window.location.pathname.split('/');
            const url = pathnames[1];

            $.ajax({
                url: '/' + url + '/goals',
                method: 'GET',
                success: function (resp) {
                    if (resp.success) {
                        me.alertsLimitation = resp.alertsLimitation;
                        me.allowUserSelectMedia = resp.allowUserSelectMedia;
                        me.allowInteraction = resp.allowInteraction;
                        me.interactionWidgets = resp.interactionWidgets;
                        me.allowVoiceRecord = resp.allowVoiceRecord;
                        me.allowUserSelectTTS = resp.allowUserSelectTTS;
                        me.youtubeBlackList = resp.youtubeBlackList;

                        const isInternational = me.isInternationalCurrency() ? 'International' : '';
                        me.setCommentLimit(me[`amount${isInternational}Buttons`][1]);

                        me.setupTooltip();

                        me.setAdditionalButtons();
                    } else {
                        me.showNotification(resp.message || 'Щось пішло не так');
                    }
                }
            });
        },

        setAdditionalButtons: function () {
            const value = $('#amount').val();
            const amount = parseInt(value);

            const isInternational = me.isInternationalCurrency();

            const getAmount = (amount) => {
                amount = parseInt(amount / (isInternational ? me.currencyRate : 1)) || 1;
                return amount;
            };

            let selectionMedia = me.allowUserSelectMedia.find(a => a.isSpecificAmount && getAmount(a.specificAmount) === amount);
            if (!selectionMedia) {
                selectionMedia = me.allowUserSelectMedia.find(a => getAmount(a.minAmount) <= amount && getAmount(a.maxAmount) >= amount);
            }

            let selectionInteraction = me.allowInteraction.find(a => a.isSpecificAmount && getAmount(a.specificAmount) === amount);
            if (!selectionInteraction) {
                selectionInteraction = me.allowInteraction.find(a => getAmount(a.minAmount) <= amount && getAmount(a.maxAmount) >= amount);
            }

            let allowUserSelectTTS = me.allowUserSelectTTS.find(a => a.isSpecificAmount && getAmount(a.specificAmount) === amount);
            if (!allowUserSelectTTS) {
                allowUserSelectTTS = me.allowUserSelectTTS.find(a => getAmount(a.minAmount) <= amount && getAmount(a.maxAmount) >= amount);
            }

            let allowVoiceRecord = me.allowVoiceRecord.find(a => a.isSpecificAmount && getAmount(a.specificAmount) === amount);
            if (!allowVoiceRecord) {
                allowVoiceRecord = me.allowVoiceRecord.find(a => getAmount(a.minAmount) <= amount && getAmount(a.maxAmount) >= amount);
            }

            if (me.allowUserSelectMedia.length > 0) {
                $('#selectMediaButton').parent().show();
                $('#selectMediaButton').show();
                $('#selectMediaButton').parent().css({
                    display: 'block',
                    opacity: 1,
                });
            } else {
                $('#selectMediaButton').parent().hide();
                $('#selectMediaButton').hide();
            }

            if (me.allowInteraction.length > 0) {
                $('#selectInteractionMedia').prop('disabled', false);
                $('#selectInteractionMedia').css({
                    display: 'block',
                    opacity: 1,
                });
            }

            if (me.allowUserSelectTTS.length > 0) {
                $('#selectTTS').prop('disabled', false);
                $('#selectTTS').css({
                    display: 'block',
                    opacity: 1,
                });
            }

            if (!allowUserSelectTTS) {
                $('#selectTTS').prop('disabled', true);
                $('#selectTTS').css({
                    opacity: 0.3,
                });
                me.clearVoiceTTSSelection();
            }

            if (me.allowVoiceRecord.length > 0) {
                $('#recordVoice').prop('disabled', false);
                $('#recordVoice').css({
                    display: 'block',
                    opacity: 1,
                });
            }

            if (!allowVoiceRecord) {
                $('#recordVoice').prop('disabled', true);
                $('#recordVoice').css({
                    opacity: 0.3,
                });
                me.clearVoiceRecordSelection();
            }

            if (me.selectedMediaListId !== selectionMedia?.mediaListId || selectionMedia?.mediaListId === undefined) {
                me.selectedMediaListId = selectionMedia?.mediaListId;

                me.clearMediaSelection();
                me.toggleMediaSelection(selectionMedia);
            }

            const item = selectionInteraction && me.interactionWidgets.find(i => i._id === selectionInteraction.interactionId);

            if (me.selectionInteractionId !== selectionInteraction?.interactionId && selectionInteraction?.interactionId) {
                me.selectionInteractionId = selectionInteraction?.interactionId;

                me.clearYoutubeSelection();
                toggleInteractionSelection(selectionInteraction, item?.widgetConfig, me.youtubeBlackList);
            }

            if (!selectionInteraction?.interactionId) {
                $('#selectInteractionMedia').prop('disabled', true);
                $('#selectInteractionMedia').css({
                    opacity: 0.3,
                });
            }
        },

        setupTooltip: function () {
            let title = '';
            const curr = CURRENCY[me.selectedCurrency];

            const isInternational = me.isInternationalCurrency();
            const mediaSelection = me.translation.mediaSelection;
            const {from, to} = me.translation;

            const getAmount = (amount) => {
                amount = parseInt(amount / (isInternational ? me.currencyRate : 1)) || 1;
                return amount;
            };

            me.allowUserSelectMedia?.map((media, i) => {
                if (media.isSpecificAmount) {
                    title += `${i === 0 ? mediaSelection : ''} ${getAmount(media.specificAmount)} ${curr} </br>`
                } else {
                    title += `${i === 0 ? mediaSelection : ''} ${from} ${getAmount(media.minAmount)} ${to} ${getAmount(media.maxAmount)} ${curr} </br>`
                }
            });

            $('[data-toggle="tooltip"]').tooltip('dispose');
            title && $('[data-toggle="tooltip"]').tooltip({
                title: title
            });

            title = '';

            me.allowInteraction?.map((media, i) => {
                if (media.isSpecificAmount) {
                    title += `${i === 0 ? mediaSelection : ''} ${getAmount(media.specificAmount)} ${curr} </br>`
                } else {
                    title += `${i === 0 ? mediaSelection : ''} ${from} ${getAmount(media.minAmount)} ${to} ${getAmount(media.maxAmount)} ${curr} </br>`
                }
            });

            $('[data-toggle="tooltip-interaction"]').tooltip('dispose');
            title && $('[data-toggle="tooltip-interaction"]').tooltip({
                title: title
            });

            title = '';

            me.allowVoiceRecord?.map((media, i) => {
                if (media.isSpecificAmount) {
                    title += `${i === 0 ? me.translation.mediaSelection : ''} ${getAmount(media.specificAmount)} ${curr} </br>`
                } else {
                    title += `${i === 0 ? me.translation.mediaSelection : ''} ${me.translation.from} ${getAmount(media.minAmount)} ${me.translation.to} ${getAmount(media.maxAmount)} ${curr} </br>`
                }
            });

            $('[data-toggle="tooltip-interaction-record"]').tooltip('dispose');
            $('[data-toggle="tooltip-interaction-record"]').tooltip({
                title: title
            });

            title = '';

            me.allowUserSelectTTS?.map((media, i) => {
                if (media.isSpecificAmount) {
                    title += `${i === 0 ? me.translation.mediaSelection : ''} ${getAmount(media.specificAmount)} ${curr} </br>`
                } else {
                    title += `${i === 0 ? me.translation.mediaSelection : ''} ${me.translation.from} ${getAmount(media.minAmount)} ${me.translation.to} ${getAmount(media.maxAmount)} ${curr} </br>`
                }
            });

            $('[data-toggle="tooltip-select-TTS"]').tooltip('dispose');
            $('[data-toggle="tooltip-select-TTS"]').tooltip({
                title: title
            });
        },

        toggleMediaSelection: function (state = {allowUserSelectMedia: false}) {
            if (state.allowUserSelectMedia) {
                me.makeModal(state);

                me.allowModal = true;

                $('#selectMediaButton').parent().css({
                    display: 'block',
                    opacity: 1,
                });
            }

            if (state.allowUserSelectMedia) {
                $('#selectMediaButton').prop('disabled', false);
            } else {
                me.allowModal = false;
                $('#selectMediaButton').prop('disabled', true);
                $('#selectMediaButton').parent().css({
                    opacity: 0.3,
                });
            }
        },

        buildCurrentGoal: function (goal) {
            if (!goal.widgetConfig?.showOnDonationPage) {
                $('.goal-container').hide();
                return
            }

            $('.goal-container').show();

            const {widgetConfig} = goal;
            const width = me.getPercentage(widgetConfig);
            const {widgetCurrency} = widgetConfig;
            let widgetName = widgetConfig.widgetName.replace('{percentage}', '');
            widgetName = widgetName.replace('{end}', '');
            widgetName = widgetName.replace('{start}', '');

            $('.progress-bar-donation').css({
                width: `${width}%`,
            });

            $('.emoji-wrapper').animate({
                left: `${width > 90 ? 94 : width}%`,
            });

            $('.emoji-wrapper .emoji').html(width >= 100 ? '🎉' : '😺');

            let widgetLabel = widgetConfig.widgetLabel || widgetName;
            if (width >= 100 && widgetConfig.widgetCompletedText) {
                widgetLabel = widgetConfig.widgetCompletedText;
            }

            const gotAmountNumber = parseInt(widgetConfig.donatedAmount || 0) + parseInt(widgetConfig.startAmount)
			const currencySign = widgetCurrency ? me.currency[widgetCurrency] : '₴';

            if (widgetConfig.hideMinMaxNumbersDonatePage) {
                $('.got-goal').css({
                    display: 'none'
                });
                $('.left-goal').css({
                    display: 'none'
                });
            } else {
                $('.got-goal').text(parseInt(gotAmountNumber).toLocaleString('UA-ua') + currencySign);
                $('.left-goal').text(parseInt(widgetConfig.goalAmount).toLocaleString('UA-ua') + currencySign);
                $('.got-goal').css({
                    display: 'block'
                });
                $('.left-goal').css({
                    display: 'block'
                });
            }

            $('.goal-label').text(widgetLabel);

			const widgetDescription = widgetConfig.widgetDescription;
			const isWidgetDescription = Boolean(widgetDescription);

			if (isWidgetDescription) {
				$('.goal-description').html(widgetDescription);
			} else {
				$('.goal-description').empty();
			}
        },

        buildGradient: function (data, percentageWidth) {
            let gradientParts = [];
            let gradientPersentage = {
                small: ['0%', '100%'],
                big: ['0%', '50%', '100%']
            };
            let gradientSize = data.gradientColors.length === 3 ? 'big' : 'small';

            data.gradientColors.map((c, i) => {
                gradientParts.push(`rgba(${c.r}, ${c.g}, ${c.b}) ${gradientPersentage[gradientSize][i]}`);
            });

            $('.body-goal .left').css({
                'background': `linear-gradient(${data.gradientAngle || 90}deg, ${gradientParts.join()})`,
                'width': data.outerGradient ? `${percentageWidth}%` : '100%',
            });

            if (data.gradientAnimation !== 'none') {
                $('.left').addClass('gradient-animation');
            } else {
                $('.left').removeClass('gradient-animation');
            }
        },

        getPercentage: function (item) {
            const {startAmount, donatedAmount, goalAmount} = item;
            const percentage = (parseInt(startAmount || 0, 10) + parseInt(donatedAmount || 0, 10)) * 100 / parseInt(goalAmount || 1, 10);

            let percent = (isNaN(percentage) ? '0' : Math.round(percentage));

            if (percent > 100) {
                return 100;
            } else {
                return percent;
            }
        },

        onSelectChange: function () {
			const val = this.value;

			$('.active-goal-method-button').removeClass('active-goal-method-button');
			$(this).closest('.goal-buttons').addClass('active-goal-method-button');

			me.buildCurrentGoal(me.goals.find(g => g._id === val));
        },

        onLanguageChange: function () {
            const val = this.value;
            document.cookie = `lng=${val}; path=/`;

            window.location.reload();
        },

        onSoundClick: function (e) {
            e && e.preventDefault();

            if ($(this).hasClass('selected-sound')) {
                $(this).removeClass('selected-sound');
                $('#sound').val('');
            } else {
                $('.selected-sound').removeClass('selected-sound');
                $(this).addClass('selected-sound');
                $('#sound').val($(this).attr('src'));
                $('#save').prop('disabled', false);
            }
        },

        onImageClick: function (e) {
            e && e.preventDefault();

            if ($(this).hasClass('selected-image')) {
                $(this).removeClass('selected-image');
                $('#image').val('');
            } else {
                $('.selected-image').removeClass('selected-image');
                $(this).addClass('selected-image');

                if ($(this).hasClass('image-input')) {
                    $('#image').val($(this).attr('src'));
                } else {
                    $('#video').val($(this).attr('src'));
                }
                $('#save').prop('disabled', false);
            }
        },

        changeCurrency: function (currency) {
            const system = me.getSystem();
            const selectedCurrency = this.value || currency || me.currencies.split(',')[0];
            me.selectedCurrency = me.getAllowedCurrency(selectedCurrency, system);
            me.toggleForm(system);

            $('.currency.selected').removeClass('selected');
            $(`.currency[value=${me.selectedCurrency}]`).addClass('selected');

            $('#currency').val(me.selectedCurrency);

            const buttons = {
                UAH: me.amountButtons,
                USD: me.amountInternationalButtons,
                EUR: me.amountInternationalButtons,
                USDT: me.amountInternationalButtons,
            }

            $('.preset-amount-buttons').empty();

            buttons[me.selectedCurrency].forEach((a, i) => {
                $('.preset-amount-buttons').append(
                    `<button type="button"
                        class="btn font-blue preset-amount ${i === 1 ? 'active-button' : ''}"
                        style="color: ${me.buttonColor}">
                        ${a}
                    </button>`
                );
            })

            me.presetAmount = $('.preset-amount');
            me.presetAmount.on('click', me.setAmount);

            const isInternational = me.isInternationalCurrency() ? 'International' : '';

            const amountToSet = buttons[me.selectedCurrency][1] ||
                buttons[me.selectedCurrency][0] ||
                me.systems[system]['minAmount'+[isInternational]];

            me.setAmount({target: {innerText: amountToSet}});

            $("#currencySign").text(CURRENCY[me.selectedCurrency]);
            $("#totalCurrencySign").text(CURRENCY[me.selectedCurrency]);
            me.buildAmountHelp();
            me.setupTooltip();
        },

        /**
         * Pay fee
         *
         */
        togglePayFee: function (e) {
            $('#amountWithFeeText').toggle();
            me.countAmountWithFee();
        },

        countAmountWithFee: function () {
            if (me.getSystem() === 'fondy' && me.systems.fondy.allowPayFee && $('#allowPayFeeCheck').is(':checked')) {
                const value = $('#amount').val();
                let amount = !isNaN(value) ? parseInt(value, 10) : null;

                const isInternational = me.isInternationalCurrency() ? 'International' : '';

                if (amount < me.systems.fondy['minAmount'+[isInternational]]) {
                    amount = me.systems.fondy['minAmount'+[isInternational]];
                } else if (amount > me.systems.fondy['maxAmount'+[isInternational]]) {
                    amount = me.systems.fondy['maxAmount'+[isInternational]];
                }

                const fee = Math.round(((amount / me.systems.fondy.feeDivider) - amount) * 100) / 100;
                const amountWithFee = !isNaN(fee) ? (amount + fee).toFixed(2) : value;

                console.log(`amount: ${amount}, fee: ${fee}, amountWithFee: ${amountWithFee}, isNoServiceFee: ${me.isNoServiceFee}`);

                $('#amountWithFee').text(amountWithFee);
            }
        },

        setCommentLimit: function (val) {
            let value = this.value || val;

            const currentAmountInUAH = getAmountInUAH(value, me.selectedCurrency);
            const limit = me.alertsLimitation.find(a => parseInt(a.minAmount) <= parseInt(currentAmountInUAH) && parseInt(a.maxAmount) >= parseInt(currentAmountInUAH));

            $('textarea#message').attr('maxlength', (parseInt(limit?.textLimit) || 500));
            $('.max-message-help').text(me.translation.symbolAmount + ' - ' + (parseInt(limit?.textLimit) || 500));

            if (limit?.textLimit) {
                $('.max-message-help-span').show();
            } else {
                $('.max-message-help-span').hide();
            }

            me.setAdditionalButtons();
        },

        onPendingClick: function () {
            me.showNotification(`Профіль призупинено. Сторінка працює у демо-режимі.`);
        },

        // lightThemeSwitcher: function () {
        //     $('#darkTheme').removeClass('active');
        //     $('body.dark').removeClass('dark');

        //     $('#lightTheme').addClass('active');

        //     localStorage.setItem('donatello-theme', 'light');
        // },

        // darkThemeSwitcher: function () {
        //     $('#lightTheme').removeClass('active');
        //     $('body').addClass('dark');

        //     $('#darkTheme').addClass('active');

        //     localStorage.setItem('donatello-theme', 'dark');
        // },

        clearVoiceRecordSelection: function () {
            $('#uploadedVoice').val('');

            $('.voice-not-added').css({
                display: 'block',
            });
            $('.voice-added').css({
                display: 'none',
            });
        },

        clearVoiceTTSSelection: function () {
            $('#selectedTTS').val('');

            $('.tts-not-added').css({
                display: 'block',
            });
            $('.tts-added').css({
                display: 'none',
            });
        },

        clearMediaSelection: function () {
            $('.selected-sound').removeClass('selected-sound');
            $('.selected-image').removeClass('selected-image');

            $('#sound').val('');
            $('#image').val('');

            $('.media-not-added').css({
                display: 'block',
            });

            $('.media-added').css({
                display: 'none',
            });
        },

        clearYoutubeSelection: function () {
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
            interactionData.startTime = '';
            interactionData.videoId = null;
        },

        setAmount: function (e) {
            $('input#amount').val(e.target.innerText);

            if ($(this).hasClass('preset-amount')) {
                $('.active-button').removeClass('active-button');
                $(this).addClass('active-button');
            }

            me.setCommentLimit(e.target.innerText);
            me.countAmountWithFee();
        },

        validateClientName: function (e) {
            if (e.target.value.length > 20) {
                e.preventDefault();
            }
        },

        validateAmount: function (e) {
            if (e.shiftKey) {
                e.preventDefault();
            } else {
                const nKeyCode = e.which;
                // Ignore Backspace and Tab keys
                if (nKeyCode === 0 || nKeyCode === 8 || nKeyCode === 9) {
                    return;
                }
                if (nKeyCode < 95) {
                    if (nKeyCode < 48 || nKeyCode > 57)
                        e.preventDefault();
                } else {
                    if (nKeyCode < 96 || nKeyCode > 105)
                        e.preventDefault();
                }
            }
        },

        processSubscriptionAnyAmount: function (pagePrefix, subscribeBtn) {
            const anyAmount = $(`#anyAmount${pagePrefix}`).val();
            const anyCurrency = $(`#currencyAnyAmount${pagePrefix}`).val();
            const messageAnyAmount = $(`#messageAnyAmount${pagePrefix}`).val();
            let amount = anyAmount;

            if (anyCurrency !== CURRENCY.UAH) {
                amount = getAmountInUAH(anyAmount, anyCurrency);
            }

            let index = me.tiers.findIndex((tier) => getAmountInUAH(tier.price, tier.currency) === amount);
            if (index === -1) {
                index = me.tiers.findIndex((tier) => getAmountInUAH(tier.price, tier.currency) > amount);

                index = index === -1 ? me.tiers.length - 1 : index - 1;
            }

            const tierId = me.tiers[index]._id || me.tiers[1]._id || '';

            if (!tierId) {
                me.showNotification(me.translation.unknownSubscription);
                return;
            }

            const tierData = {amount: anyAmount, currency: anyCurrency, message: messageAnyAmount};

            if (!me.checkUserTC($(this))) return;
            if (!me.checkUserSession(tierId, tierData)) return;

            me.processSubscribe(subscribeBtn, tierId, null, 'subscriptionMain', tierData);
        },

        onAnyAmountFormSubmit: function (e, pagePrefix) {
            e.preventDefault();

            const subscribeBtn = $('.subscribe-any-amount-button');
            subscribeBtn.attr('disabled', true);

            const form = me.validateAnyAmountForm(pagePrefix);

            if (form.isValid) {
                if (me.status === 'pending') {
                    me.showNotification('Сторінка працює у демо-режимі');
                } else {
                    subscribeBtn.attr('disabled', true);
                    me.processSubscriptionAnyAmount(pagePrefix, subscribeBtn);
                }
            } else {
                me.showFormErrors(form);
                subscribeBtn.prop('disabled', false);
            }
        },

        onFormSubmit: function (e) {
            e.preventDefault();

            me.donateButton.prop('disabled', true);

            const form = me.validateForm();

			if (!form.isValid) {
				me.showFormErrors(form);
				me.donateButton.prop('disabled', false);
				return;
			}

			if (me.status === 'pending') {
				me.showNotification('Сторінка працює у демо-режимі');
				return;
			}

			$('#submit-button').prop('disabled', true);
			me.processForm();
        },

        showNotification: function (title) {
            $('.top-right').notify({
                type: 'warning',
                fadeOut: {enabled: true, delay: 30000},
                message: {text: title}
            }).show();
        },

        processSubscribe: function (subscribeBtn, tierId, subscriptionId, orderType, additionalData) {
            subscribeBtn.attr('disabled', true);
            const data = {
                tierId: tierId,
                ...(subscriptionId && { subscriptionId: subscriptionId }),
                orderType: orderType,
                ...additionalData
            };

            $.ajax({
                url: '/user/subscription',
                method: 'POST',
                data: data,
                success: function (resp) {
                    if (resp.success) {
                        console.log(`process subscribe`, resp);
                        subscribeBtn.attr('disabled', false);
                        me.buildFormAndSubmit(resp.system || 'donatello', resp.data);
                    } else {
						console.log(`Process subscribe failed. ${resp.message}`);
                        me.showNotification(resp.message || 'Щось пішло не так');
                    }
                }
            });
        },

		processBilling: function (billingBtn, clientBillId) {
			billingBtn.attr('disabled', true);

			$.ajax({
				url: '/user/billing/process/' + clientBillId,
				method: 'POST',
				success: function (resp) {
					if (!resp.success) {
                        console.log(`Process bill failed. ${resp.message}`);
                        me.showErrorAndGoBack(resp);
                        return;
                    }

                    console.log(resp.data);
                    billingBtn.attr('disabled', false);

                    const system = resp.options ? resp.options.system : null;

                    if (['wfpb', 'fondy'].indexOf(system) !== -1) {
						me.buildFormAndSubmit(system, resp.data);
                    } else if (system === 'liqpay') {
                        me.buildLiqpayForm(resp.data);
                    } else {
                        console.log(`Process bill failed. Unknown payment system`);
                        me.showErrorAndGoBack({message: `Невірні налаштування`});
                    }
                }
            });
        },

        showErrorAndGoBack: function (resp) {
            me.showNotification(resp && resp.message ? resp.message : 'Щось пішло не так');

            setTimeout(function () {
                if (window.history) {
                    window.history.back();
                }
            }, 3000);
        },

        processForm: function () {
            const pathnames = window.location.pathname.split('/');
            const url = pathnames[1];

            const disabledFields = me.form.find(':disabled').removeAttr('disabled');
            const formData = me.form.serialize();
            disabledFields.attr('disabled', 'disabled');
            // console.log('formData', formData);

            $.ajax({
                url: '/' + url,
                method: 'POST',
                data: formData,
                success: function (resp) {
                    $('#submit-button').prop('disabled', false);

                    if (resp.success) {
                        const system = me.getSystem();
						console.log(system, resp.data);

                        if (system === 'liqpay') {
                            me.buildLiqpayForm(resp.data);
                        } else if (system === 'mono') {
                            me.buildMonoOrder(resp.data);
                        } else if (system === 'whitepay') {
							me.buildWhitepayOrder(resp.data);
						} else if (['donatello', 'fondy', 'wfpb', 'cardpay', 'trustyeu'].indexOf(system) !== -1) {
							me.buildFormAndSubmit(system, resp.data);
						}
                    } else {
                        me.showNotification(resp.message || 'Щось пішло не так');
                    }
                },
                error: function (error) {
                    $('#submit-button').prop('disabled', false);
                }
            });
        },

        buildLiqpayForm: function (data) {
            const formTpl = '<form id="liqpay-form" method="{method}" action="{action}" accept-charset="{acceptCharset}" style="display:none">' +
                '<input type="hidden" name="data" value="{data}" />' +
                '<input type="hidden" name="signature" value="{signature}" />' +
                '</form>';
            const form = me.compileTemplate(formTpl, data);

            $('body').append(form);
            $('#liqpay-form').submit();
        },

        buildFormAndSubmit: function (system, params) {
            const formTpl = `<form id="${system}-form" method="{method}" action="{action}" accept-charset="{acceptCharset}" style="display:none">{inputs}</form>`;
            let inputs = '';

            for (let key in params.data) {
                if (params.data.hasOwnProperty(key)) {
                    inputs += '<input type="text" name="' + key + '" value="' + params.data[key] + '">';
                }
            }

            params.inputs = inputs;

            const form = me.compileTemplate(formTpl, params);

            console.log(params);
            console.log(form);

            $('body').append(form);
            $('#' + system + '-form').submit();
        },

        buildMonoOrder: function (data) {
            console.log(data);

            if (!data || !data.pubOrderId || !data.jarId) {
                me.showNotification('Щось пішло не так');
                console.log('Invalid params for mono');
                return;
            }

            const jarId = data.jarId;
            const amount = data.amount;
            const messageText = me.message.val() || '';
            const message = messageText.length > 40 ? messageText.slice(0, 40) + '...' : messageText;
            const text = message + ' (' + data.pubOrderId + ')';

            window.location.href = 'https://send.monobank.ua/' + jarId + '?a=' + amount + '&t=' + text;
        },

		buildWhitepayOrder: function (data) {
            const url = data.action;

            if (!me.isValidUrl(url)) {
                console.log('Invalid url: ' + url);
                return;
            }

			window.location.href = url;
		},

        urlValidationRegexp: new RegExp(/^(http|https):\/\/[^ "]+$/),

        isValidUrl: function (value) {
            if (!value) {
                return false;
            }

            if (value.indexOf('/dev/payment') === 0) {
                return true;
            }

            return me.urlValidationRegexp.test(value);
        },

        validateAnyAmountForm: function (pagePrefix) {
            $(`#anyAmount${pagePrefix}`).val($(`#anyAmount${pagePrefix}`).val().trim());
            $(`#messageAnyAmount${pagePrefix}`).val($(`#messageAnyAmount${pagePrefix}`).val().trim());

            const anyCurrency = $(`#currencyAnyAmount${pagePrefix}`).val();

            const form = {isValid: true, errors: []};

            const amount = parseInt($(`#anyAmount${pagePrefix}`).val());
            const firstTier = me.tiers[1];

            const system = me.getSystem();
            const isInternational = anyCurrency != 'UAH' ? 'International' : '';
            const maxAmount = me.systems[system] && me.systems[system]['maxAmount'+[isInternational]];
            const minAmount = getAmountInUAH(firstTier.price, firstTier.currency);
            const currentAmountInUAH = anyCurrency === CURRENCY.UAH ? anyCurrency : getAmountInUAH(amount, anyCurrency);

            if (isNaN(currentAmountInUAH) || currentAmountInUAH < minAmount || amount > maxAmount || minAmount > maxAmount) {
                console.log('Amount is not valid');
                form.errors.push('amount');
                me.showNotification(`Сума повинна бути більшою ${minAmount} ${firstTier.currency}`);
            }

            if (form.errors.length) {
                form.isValid = false;
            }

            return form;
        },

        validateForm: function () {
            // Trim leading and trailing spaces
            me.clientName.val(me.clientName.val().trim());
            me.message.val(me.message.val().trim());

            const form = {isValid: true, errors: []};

            if (me.clientName.val() === '' || me.clientName.val().length > 21) {
                console.log('Client name is empty or too long');
                form.errors.push('clientName');
            }

            const amount = parseInt(me.amount.val());
            const system = me.getSystem();
            const isInternational = me.isInternationalCurrency() ? 'International' : '';
            const minAmount = me.systems[system] ? me.systems[system]['minAmount'+[isInternational]] : me.systems.fondy.minAmount;
            const maxAmount = me.systems[system] ? me.systems[system]['maxAmount'+[isInternational]] : me.systems.fondy.maxAmount;

            if (isNaN(amount) || amount < minAmount || amount > maxAmount || minAmount > maxAmount) {
                console.log('Amount is not valid');
                form.errors.push('amount');
            }

            if (!me.commentOptionally && me.message.val() === '') {
                console.log('Message is empty');
                form.errors.push('message');
            }

            if ($('#terms').prop('checked') == false) {
                console.log('Terms not accepted');
                form.errors.push('terms');
            }

            if (form.errors.length) {
                form.isValid = false;
            }

            return form;
        },

        showFormErrors: function (form) {
            let help = null;
            let i = 0;

            for (i; i < form.errors.length; i++) {
                // console.log(form.errors[i]);
                help = $('.' + form.errors[i] + 'Help');

                if (help) {
                    me.shakeElement(help, {cls: 'form-error', clsDelay: 20});
                }
            }
        },

        paymentThanksProceed: function () {
            $('.payment-thanks-view').remove();
            $('.mainNavBar').show();
            $('.donate-view').show();

            me.setSystems();
            me.changeCurrency();

            if (UserFeed) {
                UserFeed.isPaymentThanks = false;
                // with a new design there is no comment section
                // UserFeed.fetchData();
            }
        },


        /**
         * shakeElement : simple element animation
         *
         * @param  {$object} el       element
         * @param  {object} params    custom params
         */
        shakeElement: function (el, params) {
            var time = 200,
                cls = '',
                clsDelay = 4;

            if (params) {
                time = params.time || time;
                cls = params.cls || cls;
                clsDelay = params.clsDelay || clsDelay;
            }

            if (el) {
                el.addClass(cls);
                el.fadeOut(time).fadeIn(time).fadeOut(time).fadeIn(time);
                setTimeout(function () {
                    el.removeClass(cls);
                }, time * clsDelay);
            }

            return el;
        },


        /**
         * compileTemplate : replacing {keys} by values in html template
         *
         * @param  {string}  tpl        html template with {keys} for values
         * @param  {object}  data       keys and values
         * @param  {boolean} [hideKeys=false]   hide not parsed {keys}
         * @param  {boolean} [hideTpl=false]    hide template on undefined data
         *
         * @return {string}             compiled html
         */
        compileTemplate: function (tpl, data, hideKeys, hideTpl) {
            var result = '',
                i = null,
                len = null,

                compileKeys = function (html, item, parentKey) {
                    var htmlKey, key;
                    for (key in item) {
                        if (item.hasOwnProperty(key)) {
                            if (typeof item[key] === 'object') { // recurse nested objects
                                html = compileKeys(html, item[key], key);
                            } else {
                                htmlKey = '{' + (parentKey ? parentKey + '.' : '') + key + '}';
                                html = html.replace(new RegExp(htmlKey, 'g'), item[key] ? String(item[key]) : '');
                            }
                        }
                    }
                    return html;
                },

                compileItem = function (html, item) {
                    html = compileKeys(html, item);
                    if (hideKeys) {
                        html = html.replace(/data-value="\{+/g, 'data-value="__'); // preserve data-value attribute
                        html = html.replace(/\{+.*?\}+/g, ''); // clean all {keys} left in html string
                        html = html.replace(/data-value="__+/g, 'data-value="{'); // restore data-value attribute
                    }
                    return html;
                };

            if ($.isPlainObject(data)) { // compile one item
                result = compileItem(tpl, data);

            } else if ($.isArray(data)) { // compile array of items
                for (i = 0, len = data.length; i < len; i++) {
                    result += compileItem(tpl, data[i]);
                }

            } else if (data === undefined) {
                return hideTpl ? '' : tpl;
            }

            return result;
        }
    };

    $.extend(me, module);


}(UserPage));
