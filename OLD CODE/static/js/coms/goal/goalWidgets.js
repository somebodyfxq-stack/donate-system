import React from 'react';
import widgetEnum from '../../enums/widgetEnum';
import helpers from '../../utils/helpers';
import QRCode from './QRCode';
import '../../css/goal-widget-v3.css';

const widgetCurrencies = widgetEnum.CURRENCIES;
const FONTS = widgetEnum.FONTS;

export const goalWidgetV3 = ({ widget, innerCircleV3Ref, circleV3Ref, i, nickname }) => {
  const { diagramSettings, widgetCollected, widgetGoal } = widget;

  if (!innerCircleV3Ref.current?.[i] && !circleV3Ref.current?.[i]) {
    setTimeout(() => {
      goalWidgetV3({ widget, innerCircleV3Ref, circleV3Ref, i, nickname });
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

  label = label.replace('{percentage}', percentage.toFixed(number) + '%');
  label = label.replace('{start}', donatedAmount);
  label = label.replace('{end}', goalAmount);
  label = label.replace(/{currency}/g, widget.showCurrencySign ? helpers.getCurrencySign(widget.widgetCurrency || 'UAH') : '');

  if (!widget.keepCounting && goalAmount < donatedAmount) {
    donatedAmount = goalAmount;
  }

  if (circleV3Ref.current?.[i] && innerCircleV3Ref.current?.[i]) {
    let circleWidth = donatedAmount;

    if (donatedAmount >= goalAmount) {
      circleWidth = goalAmount
    }

    const progressV3 = circleWidth / goalAmount;

    const circleStylesV3 = window.getComputedStyle(circleV3Ref.current[i]);
    const circumferenceV3 = 2 * Math.PI * parseInt(circleStylesV3.r, 10);
    const offsetV3 = circumferenceV3 * (1 - progressV3);

    circleV3Ref.current[i].style.strokeDasharray = `${circumferenceV3} ${circumferenceV3}`;
    circleV3Ref.current[i].style.strokeDashoffset = offsetV3;

    const { colorGoalLine, innerColorGoalLine, gradientColors } = diagramSettings;

    circleV3Ref.current[i].style.stroke = gradientColors ? 'url(#linearColors)' : `rgb(${colorGoalLine.r} ${colorGoalLine.g} ${colorGoalLine.b} / ${colorGoalLine.a})`;
    innerCircleV3Ref.current[i].style.stroke = `rgb(${innerColorGoalLine.r} ${innerColorGoalLine.g} ${innerColorGoalLine.b} / ${innerColorGoalLine.a})`;
  }

  const { colorBackground, textWidgetNameAndGoal, textGotAmountAndPercentage, colorLabel,
    colorDivider, colorPercentageAndShadow, qrCode, replacingDiagramWithQrCode, gradientAngle, gradientColors, gradientAnimation
  } = diagramSettings;

  const textGotAmountAndPercentageStyles = {
    'color': `rgb(${textGotAmountAndPercentage.color.r} ${textGotAmountAndPercentage.color.g} ${textGotAmountAndPercentage.color.b} / ${textGotAmountAndPercentage.color.a})`,
    'fontFamily': FONTS[textGotAmountAndPercentage.fontFamily].id,
    'letterSpacing': textGotAmountAndPercentage.letterSpacing + 'px',
    'wordSpacing': textGotAmountAndPercentage.wordSpacing + 'px',
    'fontWeight': !textGotAmountAndPercentage.isBold ? 100 : 'bold',
    'fontStyle': !textGotAmountAndPercentage.isItalic ? 'normal' : 'italic',
    'textDecoration': !textGotAmountAndPercentage.isUnderlined ? '' : 'underline',
    'textShadow': `rgba( ${textGotAmountAndPercentage.colorShadow.r},
      ${textGotAmountAndPercentage.colorShadow.g},
      ${textGotAmountAndPercentage.colorShadow.b},
      ${textGotAmountAndPercentage.colorShadow.a}) 0px 0px ${textGotAmountAndPercentage.colorShadowWidth}px`,
    ...(textGotAmountAndPercentage.stroke !== '0' && textGotAmountAndPercentage.colorStroke && {
      backgroundColor: `rgba(${textGotAmountAndPercentage.colorStroke.r},${textGotAmountAndPercentage.colorStroke.g},${textGotAmountAndPercentage.colorStroke.b},${textGotAmountAndPercentage.colorStroke.a})`,
      'WebkitTextStroke': `${textGotAmountAndPercentage.stroke}px transparent`,
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
  }

  const gradientColorFirst = gradientColors && `rgb(${gradientColors[0].r} ${gradientColors[0].g} ${gradientColors[0].b} / ${gradientColors[0].a})`;
  const gradientColorSecond = gradientColors && `rgb(${gradientColors[1].r} ${gradientColors[1].g} ${gradientColors[1].b} / ${gradientColors[1].a})`;
  const gradientColorThird = gradientColors && gradientColors.length === 3 ? `rgb(${gradientColors[2].r} ${gradientColors[2].g} ${gradientColors[2].b} / ${gradientColors[2].a})` : '';

  return (
    <div id="widget-v3">
      <div className={`progress-bar-container mb-4 ${qrCode && !replacingDiagramWithQrCode ? 'qr' : ''}`} style={{
        backgroundColor: `rgb(${colorBackground.r} ${colorBackground.g} ${colorBackground.b} / ${colorBackground.a})`
      }}>
		{!replacingDiagramWithQrCode && <div className='mr-3'>
			<QRCode nickname={nickname} isQrCode={qrCode} />
		</div>}
        <div>
		<h5 className="text-center mb-4"
          style={textWidgetNameAndGoalStyles}
        >{label}</h5>
        <div className="d-flex align-items-center">

          {replacingDiagramWithQrCode && qrCode ? (
			<QRCode nickname={nickname} isQrCode={qrCode} />
		  ) : (
			<div className="progress-circle-wrapper">
				<svg id="svg" viewBox="0 0 120 120">
					<linearGradient id="linearColors"  gradientTransform={`rotate(${gradientAngle})`}>
						<stop offset="0%" stop-color={gradientColorFirst}></stop>
						{gradientColors && gradientColors.length === 3 && <stop offset="50%" stop-color={gradientColorSecond}></stop>}
						<stop offset="100%" stop-color={gradientColors && gradientColors.length === 3 ? gradientColorThird : gradientColorSecond}></stop>
						{gradientAnimation === 'always' &&
							<animateTransform attributeName="gradientTransform" type="rotate" from="0" to="360" dur="5s" repeatCount="indefinite" />}
					</linearGradient>
					<circle r="50" cy="60" cx="60" ref={(element) => {
						if (!innerCircleV3Ref.current) {
						innerCircleV3Ref.current = [];
						};
						return (innerCircleV3Ref.current[i] = element)
					}} id="bar-inner-circle-v3" className="circle-white" />
					<circle r="50" cy="60" cx="-60" ref={(element) => {
						if (!circleV3Ref.current) {
						circleV3Ref.current = []
						};
						return (circleV3Ref.current[i] = element)
					}} id="bar-v3" />
				</svg>

				<div id="text-v3"
					style={{
						'backgroundColor': `rgb(${colorPercentageAndShadow.r} ${colorPercentageAndShadow.g} ${colorPercentageAndShadow.b} / ${colorPercentageAndShadow.a})`,
						'boxShadow': `0px 0px 40px 4px rgb(${colorPercentageAndShadow.r} ${colorPercentageAndShadow.g} ${colorPercentageAndShadow.b} / ${colorPercentageAndShadow.a})`,
					}}>
					<span
						style={{
						'backgroundColor': `rgb(${colorPercentageAndShadow.r} ${colorPercentageAndShadow.g} ${colorPercentageAndShadow.b} / ${colorPercentageAndShadow.a})`,
						...textGotAmountAndPercentageStyles,
						}}>
						{parseFloat(percentage).toFixed(2)}%
					</span>
				</div>
			</div>
		  )}

          <div className="progress-bar-sum-wrapper">
            <div className="progress-bar-sum">
              <span
                style={{
                  ...textGotAmountAndPercentageStyles,
                  'color': `rgb(${colorLabel.r} ${colorLabel.g} ${colorLabel.b} / ${colorLabel.a})`,
                }}
              >{widgetCollected ? widgetCollected : 'Зібрано'}</span>
              <div className="d-flex">
                <span id="collected-v3"
                  style={textGotAmountAndPercentageStyles}
                >{donatedAmount.toLocaleString('UA-ua')}</span>
                <span
                  style={textGotAmountAndPercentageStyles}
                >{widget.showCurrencySign && (widgetCurrencies.find(c => c.label === widget.widgetCurrency)?.sign || '₴')}</span>
              </div>
            </div>

            <hr className="my-2"
              style={{
                backgroundColor: `rgb(${colorDivider.r} ${colorDivider.g} ${colorDivider.b} / ${colorDivider.a})`,
              }}
            />

            <div className="progress-bar-sum">
              <span
                style={{
                  ...textWidgetNameAndGoalStyles,
                  'color': `rgb(${colorLabel.r} ${colorLabel.g} ${colorLabel.b} / ${colorLabel.a})`,
                }}
              >{widgetGoal ? widgetGoal : 'Ціль'}</span>
              <div className="d-flex">
                <span id="goal-v3"
                  style={textWidgetNameAndGoalStyles}
                >{parseInt(goalAmount).toLocaleString('UA-ua')}</span>
                <span
                  style={textWidgetNameAndGoalStyles}
                >{widget.showCurrencySign && (widgetCurrencies.find(c => c.label === widget.widgetCurrency)?.sign || '₴')}</span>
              </div>
            </div>
          </div>
        </div>
		</div>
      </div>
    </div>
  )
}

