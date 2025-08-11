import React from 'react';
import widgetEnum from '../../enums/widgetEnum';
import helpers from '../../utils/helpers';
import QRCode from './QRCode';
import '../../css/goal-widget-v6.css';

const widgetCurrencies = widgetEnum.CURRENCIES;
const FONTS = widgetEnum.FONTS;

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

const storeRef = (ref, i) => (element) => {
	if (!ref.current) {
		ref.current = [];
	}
	ref.current[i] = element;
};

export const DiagramWidgetV6 = ({ widget, innerCircleV6Ref, circleV6Ref, circleInternalV6Ref, markerV6Ref, i, nickname }) => {
	const { diagramSettings, widgetCollected, widgetGoal } = widget;
	const allV6RefsAvailable = circleV6Ref.current?.[i] && innerCircleV6Ref.current?.[i] && markerV6Ref.current?.[i] && circleInternalV6Ref.current?.[i];

	if (!allV6RefsAvailable) {
		setTimeout(() => {
			DiagramWidgetV6({ widget, innerCircleV6Ref, circleV6Ref, circleInternalV6Ref, markerV6Ref, i, nickname });
		}, 800)
	}

	let label = widget.widgetName;
	let donatedAmount = parseInt(widget.donatedAmount) + parseInt(widget.startAmount) || '1345';
	const goalAmount = widget.goalAmount;
	let percentage = donatedAmount * 100 / goalAmount;

	if (widget.widgetCompletedText && goalAmount < donatedAmount) {
		label = widget.widgetCompletedText;
	}

	if (!widget.keepCountingPercentage && goalAmount < donatedAmount) {
		percentage = 100;
	}

	let number = percentage % 1 ? 2 : 0;

	label = label
		.replace('{percentage}', percentage.toFixed(number) + '%')
		.replace('{start}', donatedAmount)
		.replace('{end}', goalAmount)
		.replace(/{currency}/g, widget.showCurrencySign ? helpers.getCurrencySign(widget.widgetCurrency || 'UAH') : '');

	if (!widget.keepCounting && goalAmount < donatedAmount) {
		donatedAmount = goalAmount;
	}

	if (allV6RefsAvailable) {
		let circleWidth = donatedAmount;

		if (donatedAmount >= goalAmount) {
			circleWidth = goalAmount
		}

		const progressV6 = circleWidth / goalAmount;

		const circleStylesV6 = window.getComputedStyle(circleV6Ref.current[i]);
		const circumferenceV6 = 2 * Math.PI * parseInt(circleStylesV6.r, 10);
		const offsetV6 = circumferenceV6 * (1 - progressV6);

		circleV6Ref.current[i].style.strokeDasharray = `${circumferenceV6} ${circumferenceV6}`;
		circleV6Ref.current[i].style.strokeDashoffset = offsetV6;
		markerV6Ref.current[i].style.transform = "rotate(" + 360 * progressV6 + "deg)";

		const { colorGoalLine, innerColorGoalLine, gradientColors, colorPercentageAndShadow } = diagramSettings;

		circleV6Ref.current[i].style.stroke = gradientColors ? 'url(#linearColors)' : `rgb(${colorGoalLine.r} ${colorGoalLine.g} ${colorGoalLine.b} / ${colorGoalLine.a})`;
		innerCircleV6Ref.current[i].style.stroke = `rgb(${innerColorGoalLine.r} ${innerColorGoalLine.g} ${innerColorGoalLine.b} / ${innerColorGoalLine.a})`;
		markerV6Ref.current[i].style.stroke = gradientColors ? 'url(#linearColors)' : `rgb(${colorGoalLine.r} ${colorGoalLine.g} ${colorGoalLine.b} / ${colorGoalLine.a})`;
		circleInternalV6Ref.current[i].style.fill = `rgb(${colorPercentageAndShadow.r} ${colorPercentageAndShadow.g} ${colorPercentageAndShadow.b} / ${colorPercentageAndShadow.a})`;
	}

	const { colorBackground, textWidgetNameAndGoal, textGotAmountAndPercentage, colorLabel, colorDivider,
		qrCode, replacingDiagramWithQrCode, gradientAngle, gradientColors, gradientAnimation
	} = diagramSettings;

	const textGotAmountAndPercentageStyles = createTextStyle(textGotAmountAndPercentage);
	const textWidgetNameAndGoalStyles = createTextStyle(textWidgetNameAndGoal);

	const gradientColorFirst = gradientColors && `rgb(${gradientColors[0].r} ${gradientColors[0].g} ${gradientColors[0].b} / ${gradientColors[0].a})`;
	const gradientColorSecond = gradientColors && `rgb(${gradientColors[1].r} ${gradientColors[1].g} ${gradientColors[1].b} / ${gradientColors[1].a})`;
	const gradientColorThird = gradientColors && gradientColors.length === 3 ? `rgb(${gradientColors[2].r} ${gradientColors[2].g} ${gradientColors[2].b} / ${gradientColors[2].a})` : '';

	return (
		<div id="widget-v6-2">
			<div
				className={`progress-bar-container mb-4 ${qrCode && !replacingDiagramWithQrCode ? 'qr' : ''}`}
				style={{
					backgroundColor: `rgb(${colorBackground.r} ${colorBackground.g} ${colorBackground.b} / ${colorBackground.a})`
				}}
			>
				{!replacingDiagramWithQrCode &&	<QRCode nickname={nickname} isQrCode={qrCode} />}

				<div>
					<h5 className="text-center mb-3" style={textWidgetNameAndGoalStyles}>{label}</h5>

					<div className="progress-bar-wrapper">

						{replacingDiagramWithQrCode && qrCode ? (
							<QRCode nickname={nickname} isQrCode={qrCode} />
						) : (
							<div id="text-v6-2">
								<svg id="svg" viewBox="0 0 120 120">

									<linearGradient id="linearColors"  gradientTransform={`rotate(${gradientAngle})`}>
										<stop offset="0%" stop-color={gradientColorFirst}></stop>
										{gradientColors && gradientColors.length === 3 && <stop offset="50%" stop-color={gradientColorSecond}></stop>}
										<stop offset="100%" stop-color={gradientColors && gradientColors.length === 3 ? gradientColorThird : gradientColorSecond}></stop>
										{gradientAnimation === 'always' &&
											<animateTransform attributeName="gradientTransform" type="rotate" from="0" to="360" dur="5s" repeatCount="indefinite" />}
									</linearGradient>

									<circle	className="circle-white" ref={storeRef(innerCircleV6Ref, i)} />
									<circle	id="bar-v6-2" ref={storeRef(circleV6Ref, i)} />
									<circle className="circle-internal" ref={storeRef(circleInternalV6Ref, i)} />
									<circle	id="marker-v6-2" ref={storeRef(markerV6Ref, i)} />
								</svg>
								<div className='percentages'>
									<span style={{...textGotAmountAndPercentageStyles}}>{parseFloat(percentage).toFixed(2)}%</span>
								</div>
							</div>
						)}

						<div className="progress-bar-sum-wrapper">
							<div className="progress-bar-collected">
								<span style={{
									...textGotAmountAndPercentageStyles,
									'color': `rgb(${colorLabel.r} ${colorLabel.g} ${colorLabel.b} / ${colorLabel.a})`
									}}
								>{widgetCollected ? widgetCollected : 'Зібрано'}</span>
								<div className="d-flex">
									<span id="collected-v6-2" style={textGotAmountAndPercentageStyles}>
										{donatedAmount.toLocaleString('UA-ua')}
									</span>
									<span style={textGotAmountAndPercentageStyles}>
										{widget.showCurrencySign && (widgetCurrencies.find(c => c.label === widget.widgetCurrency)?.sign || '₴')}
									</span>
								</div>
							</div>
							<hr className="my-2" style={{borderColor: `rgb(${colorDivider.r} ${colorDivider.g} ${colorDivider.b} / ${colorDivider.a})`}} />
							<div className="progress-bar-goal">
								<span style={{
									...textWidgetNameAndGoalStyles,
									'color': `rgb(${colorLabel.r} ${colorLabel.g} ${colorLabel.b} / ${colorLabel.a})`
									}}
								>{widgetGoal ? widgetGoal+':' : 'Ціль:'}&nbsp;</span>
								<div className="d-flex">
									<span id="goal-v6-2" style={textWidgetNameAndGoalStyles}>
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
			</div>
		</div>
	)
}

