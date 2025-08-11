import React from 'react';
import widgetEnum from '../../enums/widgetEnum';
import QRCode from './QRCode';
import '../../css/goal-widget-v7.css';
import '../../css/goal-widget-v4.css';

const FONTS = widgetEnum.FONTS;
const widgetCurrencies = widgetEnum.CURRENCIES;

const createTextStyle = (styleConfig) => ({
	color: `rgb(${styleConfig.color.r} ${styleConfig.color.g} ${styleConfig.color.b} / ${styleConfig.color.a})`,
	fontFamily: FONTS[styleConfig.fontFamily]?.id,
	letterSpacing: `${styleConfig.letterSpacing}px`,
	wordSpacing: `${styleConfig.wordSpacing}px`,
	fontWeight: styleConfig.isBold ? 'bold' : 100,
	fontStyle: styleConfig.isItalic ? 'italic' : 'normal',
	textDecoration: styleConfig.isUnderlined ? 'underline' : 'none',
	textShadow: `rgba(${styleConfig.colorShadow.r},${styleConfig.colorShadow.g},${styleConfig.colorShadow.b},${styleConfig.colorShadow.a}) 0px 0px ${styleConfig.colorShadowWidth}px`,
	...(styleConfig.stroke !== '0' && styleConfig.colorStroke && {
		backgroundColor: `rgba(${styleConfig.colorStroke.r},${styleConfig.colorStroke.g},${styleConfig.colorStroke.b},${styleConfig.colorStroke.a})`,
		WebkitTextStroke: `${styleConfig.stroke}px transparent`,
		'-webkit-background-clip': 'text',
	})
});

export const ProgressBarWidgetV4 = ({ widget, nickname }) => {
	const { progressBarSettings, widgetCollected } = widget;
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

	let donatedAmount = parseInt(widget.donatedAmount) + parseInt(widget.startAmount) || '1345';
	const goalAmount = widget.goalAmount;
	let percentage = (donatedAmount * 100) / goalAmount;

	if (!widget.keepCountingPercentage && goalAmount < donatedAmount) {
		percentage = 100;
	}

	let progressBarWidth = percentage;

	if (percentage > 100) {
		progressBarWidth = 100;
	}

	if (!widget.keepCounting && goalAmount < donatedAmount) {
		donatedAmount = goalAmount;
	}

	const textWidgetNameAndGoalStyles = createTextStyle(textWidgetNameAndGoal);
	const textGotAmountStyles = createTextStyle(textGotAmount);

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
		<div id="widget-v4-2">
			<div
				className={`progress-bar-container mb-4 ${qrCode ? 'qr' : ''}`}
				style={{
					backgroundColor: `rgb(${colorBackground.r} ${colorBackground.g} ${colorBackground.b} / ${colorBackground.a})`
				}}
			>
				<QRCode nickname={nickname} isQrCode={qrCode} />
				<div className='w-100'>
					<div className="progress-bar-collected">
						<span style={{color: `rgb(${colorLabel.r} ${colorLabel.g} ${colorLabel.b} / ${colorLabel.a})`}}>
							{widgetCollected ? widgetCollected : 'Зібрано'}
						</span>
						<div className="d-flex align-items-baseline">
							<div className="d-flex">
								<span id="collected-v4-2" style={textGotAmountStyles}>
									{donatedAmount.toLocaleString('UA-ua')}
								</span>
								<span style={textGotAmountStyles}>
									{widget.showCurrencySign && (widgetCurrencies.find(c => c.label === widget.widgetCurrency)?.sign || '₴')}
								</span>
							</div>
							<span><strong>&nbsp;/&nbsp;</strong></span>
							<div className="d-flex">
								<span id="goal-v4-2" style={textWidgetNameAndGoalStyles}>
									{parseInt(goalAmount).toLocaleString('UA-ua')}
								</span>
								<span style={textWidgetNameAndGoalStyles}>{widget.showCurrencySign && (widgetCurrencies.find(c => c.label === widget.widgetCurrency)?.sign || '₴')}</span>
							</div>
						</div>
					</div>

					<div id="progress-bar"
						className={turnOffProgressBarShadow ? 'shadow-none' : ''}
						style={{
							borderRadius: `${borderRadius}px`,
						}}
					>
						<div
							id="progress-v4-2"
							className={gradientAnimation === 'always' ? 'gradient-animation' : ''}
							style={{
								width: `${progressBarWidth}%`,
								background: `${indicatorColor}`,
								borderTopLeftRadius: `${borderRadius}px`,
								borderBottomLeftRadius: `${borderRadius}px`,
								borderTopRightRadius: `${gotAmountBorderRadius}px`,
								borderBottomRightRadius: `${gotAmountBorderRadius}px`,
							}}>
						</div>
					</div>

					<div id="text-v4-2" style={{...textGotAmountStyles, background: `${indicatorColor}`}}>{parseFloat(percentage).toFixed(2)}%</div>
				</div>
			</div>
		</div>
	);
};
