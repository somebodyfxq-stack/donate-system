import React from 'react';
import widgetEnum from '../../enums/widgetEnum';
import helpers from '../../utils/helpers';
import QRCode from './QRCode';
import '../../css/goal-widget-v7.css';

const FONTS = widgetEnum.FONTS;
const widgetCurrencies = widgetEnum.CURRENCIES;

export const ProgressBarWidget = ({ widget, nickname }) => {
	const { progressBarSettings, widgetGoal } = widget;
	const {
		colorBackground,
		textWidgetNameAndGoal,
		textGotAmount,
		colorLabel,
		gradientAngle,
		gradientColors,
		progressBarColor,
		gradientAnimation,
		turnOffProgressBarShadow,
		qrCode,
		borderRadius,
		gotAmountBorderRadius
	} = progressBarSettings;

	let label = widget.widgetName;
	let donatedAmount = parseInt(widget.donatedAmount) + parseInt(widget.startAmount) || '1345';
	const goalAmount = widget.goalAmount;
	let percentage = (donatedAmount * 100) / goalAmount;

	if (widget.widgetCompletedText && goalAmount < donatedAmount) {
		label = widget.widgetCompletedText;
	}

	if (!widget.keepCountingPercentage && goalAmount < donatedAmount) {
		percentage = 100;
	}

	let progressBarWidth = percentage;

	if (percentage > 100) {
		progressBarWidth = 100;
	}

	let number = percentage % 1 ? 2 : 0;

	label = label.replace('{percentage}', percentage.toFixed(number) + '%');
	label = label.replace('{start}', donatedAmount);
	label = label.replace('{end}', goalAmount);
	label = label.replace(/{currency}/g, helpers.getCurrencySign(widget.widgetCurrency || 'UAH'));

	if (!widget.keepCounting && goalAmount < donatedAmount) {
		donatedAmount = goalAmount;
	}

	const textGotAmountStyles = {
		'color': `rgb(${textGotAmount.color.r} ${textGotAmount.color.g} ${textGotAmount.color.b} / ${textGotAmount.color.a})`,
		'fontFamily': FONTS[textGotAmount.fontFamily].id,
		'letterSpacing': textGotAmount.letterSpacing + 'px',
		'wordSpacing': textGotAmount.wordSpacing + 'px',
		'fontWeight': !textGotAmount.isBold ? 100 : 'bold',
		'fontStyle': !textGotAmount.isItalic ? 'normal' : 'italic',
		'textDecoration': !textGotAmount.isUnderlined ? '' : 'underline',
		'textShadow': `rgba(
				${textGotAmount.colorShadow.r},
				${textGotAmount.colorShadow.g},
				${textGotAmount.colorShadow.b},
				${textGotAmount.colorShadow.a}
			) 0px 0px ${textGotAmount.colorShadowWidth}px`,
		...(textGotAmount.stroke !== '0' && textGotAmount.colorStroke && {
			backgroundColor: `rgba(${textGotAmount.colorStroke.r},${textGotAmount.colorStroke.g},${textGotAmount.colorStroke.b},${textGotAmount.colorStroke.a})`,
			'WebkitTextStroke': `${textGotAmount.stroke}px transparent`,
			'-webkit-background-clip': `text`,
		})
	};

	const textWidgetNameAndGoalStyles = {
		'color': `rgb(${textWidgetNameAndGoal.color.r} ${textWidgetNameAndGoal.color.g} ${textWidgetNameAndGoal.color.b} / ${textWidgetNameAndGoal.color.a})`,
		'fontFamily': FONTS[textWidgetNameAndGoal.fontFamily].id,
		'letterSpacing': textWidgetNameAndGoal.letterSpacing + 'px',
		'wordSpacing': textWidgetNameAndGoal.wordSpacing + 'px',
		'fontWeight': !textWidgetNameAndGoal.isBold ? 100 : 'bold',
		'fontStyle': !textWidgetNameAndGoal.isItalic ? 'normal' : 'italic',
		'textDecoration': !textWidgetNameAndGoal.isUnderlined ? '' : 'underline',
		'textShadow': `${textWidgetNameAndGoal.colorShadow} 0px 0px ${textWidgetNameAndGoal.colorShadowWidth}px`,
		...(textWidgetNameAndGoal.stroke !== '0' && textWidgetNameAndGoal.colorStroke && {
			backgroundColor: `rgba(${textWidgetNameAndGoal.colorStroke.r},${textWidgetNameAndGoal.colorStroke.g},${textWidgetNameAndGoal.colorStroke.b},${textWidgetNameAndGoal.colorStroke.a})`,
			'WebkitTextStroke': `${textWidgetNameAndGoal.stroke}px transparent`,
			'-webkit-background-clip': `text`,
		})
	};

	const indicatorColor = gradientColors
		? `linear-gradient(
			${gradientAngle || 90}deg,
			rgb(
				${gradientColors[0].r}
				${gradientColors[0].g}
				${gradientColors[0].b} /
				${gradientColors[0].a}
			),
			rgb(
				${gradientColors[1].r}
				${gradientColors[1].g}
				${gradientColors[1].b} /
				${gradientColors[1].a}
			)
			${gradientColors.length === 3
			? `, rgb(
					${gradientColors[2].r}
					${gradientColors[2].g}
					${gradientColors[2].b} /
					${gradientColors[2].a}
				)`
			: ''
		}
		)`
		: `rgb(
			${progressBarColor.r}
			${progressBarColor.g}
			${progressBarColor.b} /
			${progressBarColor.a}
		)`;

	return (
		<div id="widget-v7">
			<div
				className={`progress-bar-container mb-4 ${qrCode ? 'qr' : ''}`}
				style={{
					backgroundColor: `rgb(${colorBackground.r} ${colorBackground.g} ${colorBackground.b} / ${colorBackground.a})`
				}}
			>
				<QRCode nickname={nickname} isQrCode={qrCode} />
				<div className='w-100'>
					<h5
						className={`text-center mb-3 animate__animated animate__${textWidgetNameAndGoal.textAnimation === 'always' ? textWidgetNameAndGoal.fontAnimation : ''}`}
						style={textWidgetNameAndGoalStyles}
					>
						{label}
					</h5>

					<div id="progress-bar"
						className={turnOffProgressBarShadow ? 'shadow-none' : ''}
						style={{
							borderRadius: `${borderRadius}px`,
						}}
					>
						<div
							id="progress-v7"
							className={gradientAnimation === 'always' ? 'gradient-animation' : ''}
							style={{
								width: `${progressBarWidth}%`,
								background: `${indicatorColor}`,
								borderTopLeftRadius: `${borderRadius}px`,
								borderBottomLeftRadius: `${borderRadius}px`,
								borderTopRightRadius: `${gotAmountBorderRadius}px`,
								borderBottomRightRadius: `${gotAmountBorderRadius}px`,
							}}
						>
							<div id="text-v7" className={`progress-bar-collected ${progressBarWidth < 25 ? 'position-absolute' : ''}`}>
								<div className={`d-flex animate__animated animate__${textGotAmount.textAnimation === 'always' ? textGotAmount.fontAnimation : ''}`}>
									<span id="collected-v7" style={textGotAmountStyles}>
										{donatedAmount.toLocaleString('UA-ua')}
									</span>
									<span style={textGotAmountStyles}>
										{widget.showCurrencySign && (widgetCurrencies.find(c => c.label === widget.widgetCurrency)?.sign || '₴')}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="progress-bar-goal">
						<span
							style={{
								color: `rgb(${colorLabel.r} ${colorLabel.g} ${colorLabel.b} / ${colorLabel.a})`
							}}
						>
							{widgetGoal ? widgetGoal+':' : 'Ціль:'}
						</span>
						<div className={`d-flex goal animate__animated animate__${textWidgetNameAndGoal.textAnimation === 'always' ? textWidgetNameAndGoal.fontAnimation : ''}`}>
							<span id="goal-v7" style={textWidgetNameAndGoalStyles}>
								{parseInt(goalAmount).toLocaleString('UA-ua')}
							</span>
							<span style={textWidgetNameAndGoalStyles}>
								{widget.showCurrencySign && (widgetCurrencies.find(c => c.label === widget.widgetCurrency)?.sign || '₴')}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
