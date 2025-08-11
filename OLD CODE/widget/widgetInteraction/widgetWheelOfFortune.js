/*global $, JS */
/*jshint strict: false*/
/*jslint browser: true*/
/*jslint unparam: true*/


const WheelOfFortune = window.WheelOfFortune || {};

(function (me) {
	const module = {
		widgetConfig: {},
		socket: {},
		userId: '',
		currentWidgetId: '',
		labelText: 'GO!',
		totalAmount: 0,

		init: function (config) {
			const { WidgetConfig, socket, userId, currentWidgetId } = config;

			me.widgetConfig = WidgetConfig;
			me.socket = socket;
			me.userId = userId;
			me.currentWidgetId = currentWidgetId;
			me.sectorWon = null;
			me.sectorMap = [];
			me.random = 0;

			$(document).ready(function () {
				me.initEvents();
			});
		},

		initEvents: function () {
			me.getTotalAmount();
			me.setupSocket();
			me.convertNumbersToPercentages();
			me.addUI();
			me.setupWheelOfFortuneWidget();
		},

		getTotalAmount: function () {
			let wheelDonatelloAmount = window.localStorage.getItem('wheelDonatelloAmount');

			me.totalAmount = wheelDonatelloAmount ? parseInt(wheelDonatelloAmount) : 0;;
		},

		addUI: function () {
			$(".interaction").empty();

			$(".interaction").append(`
					<div class="wheel-of-fortune-header"></div>
					<div id="wheelOfFortune" class="wheel-of-fortune-container">
						<canvas id="wheel" width="300" height="300"></canvas>
						<div id="spin">${me.labelText}</div>
					</div>
			`);

			if (me.widgetConfig.startFromAmount) {
				const header = me.widgetConfig.fontCounter;

				$(".wheel-of-fortune-header").css({
					'paddingTop': '30px',
					'fontFamily': FONTS[header.fontFamily].id,
					'fontSize': header.fontSize + 'px',
					'letterSpacing': header.letterSpacing + 'px',
					'wordSpacing': header.wordSpacing + 'px',
					'fontWeight': !header.isBold ? 100 : 'bold',
					'fontStyle': !header.isItalic ? 'normal' : 'italic',
					'text-decoration': !header.isUnderlined ? '' : 'underline',
					'textShadow': `rgba( ${header.colorShadow.r},
									${header.colorShadow.g},
									${header.colorShadow.b},
									${header.colorShadow.a}) 0px 0px ${header.colorShadowWidth}px`,
					'color': `rgba( ${header.color.r},
							${header.color.g},
							${header.color.b},
							${header.color.a})`,
					...(header.stroke !== '0' && header.colorStroke && {
						backgroundColor: `rgba(${header.colorStroke.r},${header.colorStroke.g},${header.colorStroke.b},${header.colorStroke.a})`,
						'WebkitTextStroke': `${header.stroke}px transparent`,
						'-webkit-background-clip': `text`,
					})
				});

				if (header.textAnimation === "always") {
					me.setAnimation("infinite");
				}
				me.setTextToDisplay();

				$('#wheelOfFortune').addClass('hidden');
				$('.interaction').removeClass('hidden');
			}
		},

		setAnimation: function (animationIterationCount) {
			const header = me.widgetConfig.fontCounter;

			$(".wheel-of-fortune-header").css({
				"animation-duration": `${header.fontAnimationDuration || 2.5}s`,
				"animationIterationCount": animationIterationCount,
			});

			$(".wheel-of-fortune-header").addClass(`animate__animated animate__${header.fontAnimation}`);
		},

		setTextToDisplay: function () {
			$(".wheel-of-fortune-header").text('');

			let text = me.widgetConfig.textToDisplay.replace(/{amount}/g, me.widgetConfig.amount);
			text = text.replace(/{got}/g, me.totalAmount);
			text = text.replace(/{currency}/g, me.widgetConfig.currency || CURRENCY.UAH);

			if (me.widgetConfig.startFromAmount) {
				$(".wheel-of-fortune-header").text(text);
			}
		},

		setupSocket: function () {
			if (me.socket) {
				me.socket.on([me.userId], message => {
					if (me.userId === message.userId) {
						if (message.skipMessage) {
							window.location.reload();
						}

						if (message.wheelOfFortune) {
							if (message.actionType === 'FIX_GOT_AMOUNT') {
								me.totalAmount = parseInt(message.gotAmount) || 0;

								window.localStorage.setItem('wheelDonatelloAmount', me.totalAmount);
								me.setTextToDisplay();

								return
							}

							let range = false;
							const amount = getAmountInUAH(message.lastDonate.amount, message.lastDonate.currency);

							if (me.widgetConfig.startFromAmount) {
								me.totalAmount += amount;

								if (me.totalAmount >= me.widgetConfig.amount) {
									range = true;
									me.totalAmount = me.totalAmount - me.widgetConfig.amount;
								}

								window.localStorage.setItem('wheelDonatelloAmount', me.totalAmount);

								me.setTextToDisplay();
							} else {
								range = me.widgetConfig.amounts.find(a => a.isSpecificAmount && parseInt(a.specificAmount) === amount);
								if (!range) {
									range = me.widgetConfig.amounts.find(a => !a.isSpecificAmount && parseInt(a.minAmount) <= amount && parseInt(a.maxAmount) >= amount);
								}
							}

							if (message.testWheelOfFortune) {
								range = true;
							}

							if (range) {
								let wheelOfFortune = window.localStorage.getItem('wheelDonatello');
								wheelOfFortune = wheelOfFortune ? JSON.parse(wheelOfFortune) : [];
								wheelOfFortune.push(wheelOfFortune.length);

								me.random = message.random;

								const header = me.widgetConfig.fontCounter;
								if (header.textAnimation === "onDonate") {
									$(".wheel-of-fortune-header").removeClass(`animate__animated animate__${header.fontAnimation}`);

									setTimeout(() => {
										me.setAnimation(3);
									}, 500)
								}

								window.localStorage.setItem('wheelDonatello', JSON.stringify(wheelOfFortune));
							}
						}
					}
				})
			}
		},

		convertNumbersToPercentages: function () {
			let total = 0;
			let min = 0;
			me.widgetConfig.sectorsOfWheel.forEach((sector, i) => {
				total += parseInt(sector.percentage);
			})

			me.widgetConfig.sectorsOfWheel.forEach((sector) => {
				const max = parseFloat(parseFloat(sector.percentage * 100 / total + min).toFixed(2));
				me.sectorMap.push({
					min: min,
					max: max
				})

				min = max;
			})
		},

		setupWheelOfFortuneWidget: function () {
			const sectors = me.widgetConfig.sectorsOfWheel;
			let isReadyToRead = false;
			let isReadyToSpin = true;

			// Generate random float in range min-max:
			const rand = (m, M) => Math.random() * (M - m) + m;
			// Fix negative modulo stackoverflow.com/a/71167019/383904
			const mod = (n, m) => (n % m + m) % m;

			const tot = sectors.length;
			const elSpin = document.querySelector("#spin");
			const elWheel = document.querySelector("#wheel");
			const ctx = elWheel.getContext`2d`;
			const dia = 300;

			ctx.canvas.width = dia;
			ctx.canvas.height = dia;

			const rad = dia / 2;
			const PI = Math.PI;
			const TAU = 2 * PI;
			const arc = TAU / tot;
			const angOffset = TAU * 0.75; // needle is north

			let sectorIndex = 0; // Current sector index
			let oldAng = 0;
			let ang = 0; // Angle rotation in radians

			let spinAnimation = null;
			let animationFrameId;

			//* Get index of current sector */
			const getIndex = (ang) => Math.floor(tot - mod(ang, TAU) / TAU * tot) % tot;

			//* Draw sectors and prizes texts to canvas */
			const drawSector = (sector, i) => {
				const ang = arc * i;
				ctx.save();
				// COLOR
				ctx.beginPath();
				ctx.fillStyle = sector.color;
				ctx.moveTo(rad, rad);
				ctx.arc(rad, rad, rad, ang, ang + arc);
				ctx.lineTo(rad, rad);
				ctx.fill();
				// TEXT
				ctx.translate(rad, rad);
				ctx.rotate(ang + arc / 2);
				ctx.textAlign = "right";
				ctx.fillStyle = "#fff";
				ctx.font = `bold ${12 * arc}px sans-serif`;

				const text = sector.label.split(' ');
				text.forEach((text, i) => {
					const number = 12 * arc;
					ctx.fillText(text, rad - 20, number * i + 1);
				})

				ctx.restore();
			};

			const update = () => {
				const currentProgress = spinAnimation && spinAnimation.effect.getComputedTiming().progress || 0;

				const angDiff = ang - oldAng;
				const angCurr = angDiff * currentProgress;
				const angAbs = mod(oldAng + angCurr, TAU);

				const sectorIndexNew = getIndex(angAbs);
				if (sectorIndex !== sectorIndexNew) {
					// Sector changed! Make a tick sound
				}
				sectorIndex = sectorIndexNew;
				elSpin.textContent = sectors[sectorIndex].label;
				elSpin.style.background = sectors[sectorIndex].color;
			};

			const spin = (index, duration) => {
				// Remove this line if your slices (sectors)
				// are painted anti-clockwise
				index = tot - index;
				// Absolute current angle (without turns)
				oldAng = ang;
				const angAbs = mod(ang, TAU);
				// Absolute new angle
				let angNew = arc * index;
				// (backtrack a bit to not end on the exact edge)
				angNew -= rand(0, arc);
				// Fix negative angles
				angNew = mod(angNew, TAU);
				// Get the angle difference
				const angDiff = mod(angNew - angAbs, TAU);
				// Add N full revolutions
				const rev = TAU * Math.floor(rand(2, 4));
				ang += angDiff + rev;

				spinAnimation = elWheel.animate([{ transform: `rotate(${ang + angOffset}rad)`, }], {
					duration: duration || rand(3000, 5000) * rev * 0.1,
					easing: "cubic-bezier(0.2, 0, 0.1, 1)",
					fill: "forwards"
				});

				spinAnimation.addEventListener("finish", () => {
					spinAnimation = null;
					cancelAnimationFrame(animationFrameId);
					// elSpin.textContent = me.labelText;

					isReadyToRead && readText();
				}, { once: true });
			};

			const engine = () => {
				update();
				animationFrameId = requestAnimationFrame(engine)
			};

			elSpin.addEventListener("click", () => {
				if (spinAnimation) return; // Already animating

				letsGo();
			});

			const setSectorWon = () => {
				me.sectorMap.forEach((sector, i) => {
					if (sector.min < me.random && me.random < sector.max) {
						me.sectorWon = i;
					}
				})

				console.log('sector won:' + (1 + me.sectorWon));
			}

			setInterval(() => {
				let wheelOfFortune = window.localStorage.getItem('wheelDonatello');
				let wheelOfFortunes = wheelOfFortune ? JSON.parse(wheelOfFortune) : [];

				if (!spinAnimation && isReadyToSpin && wheelOfFortunes.length > 0) {
					isReadyToSpin = false;
					$('.interaction').removeClass('hidden');
					$('#wheelOfFortune').removeClass('hidden');

					wheelOfFortunes.splice(0, 1);

					window.localStorage.setItem('wheelDonatello', JSON.stringify(wheelOfFortunes));

					letsGo();
				}
			}, 3000);

			const hideContainer = (milliseconds) => {
				setTimeout(() => {
					isReadyToSpin = true;
					isReadyToRead = true;
					$('#wheelOfFortune').addClass('hidden');
				}, milliseconds);
			};

			const readText = () => {
				const winningSector = sectors[me.sectorWon];

				const text = me.widgetConfig.textToShow.replace('{winner}', winningSector.label);
				let token = me.currentWidgetId;

				let url = `/widget/tts?fileName=${token}&q=${encodeURIComponent(text)}`;

				if (me.widgetConfig.readText) {
					$.ajax({
						url: url,
						type: 'GET',
						contentType: 'application/json; charset=UTF-8',
						success: function (data) {
							const ttsFileUrl = window.location.origin + data.url + '?timestamp=' + Date.now();

							let speechText = new Audio();
							speechText.src = ttsFileUrl;

							speechText.load();

							if (speechText) {
								let promise = speechText && speechText.play();
								if (promise !== undefined) {
									promise.then(_ => {
										// Autoplay started!
									}).catch(error => {
										// Autoplay was prevented.
										hideContainer(3000);
									});
								}
							} else {
								console.log('no speechText');
								hideContainer(3000);
							}

							speechText.onended = () => {
								console.log('speechText.onended');
								hideContainer(0);
							};
						},
						error: function (err) {
							console.log('error in speechText request');
							hideContainer(3000);
						}
					});
				} else {
					hideContainer(3000);
				}
			};

			const letsGo = () => {
				setSectorWon();

				engine(); // Start engine!
				isReadyToRead = true;

				me.setTextToDisplay();

				// DO THE TRICK
				const serverIndex = + me.sectorWon;
				spin(serverIndex);
			}

			// INIT!
			sectors.forEach(drawSector);
			update();
			// spin(0, 0);
			// letsGo()
		},
	};

	$.extend(me, module);

}(WheelOfFortune));
