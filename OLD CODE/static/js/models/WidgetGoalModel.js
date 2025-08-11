import ColorModel from './ColorModel';
import FontModel from './FontModel';
import widgetEnum from '../enums/widgetEnum';
import { Currency } from '../enums/PaymentEnums';

class WidgetGoalModel {
    widgetLabel = '';
	widgetDescription= '';
    widgetName = '{start} / {end} {currency} ({percentage})';
	widgetCollected = '';
	widgetGoal = '';
    startAmount = 0;
    donatedAmount = 0;
    goalAmount = 5000;
    fontSize = 5;
    height = 80;
    borderWidth = 5;
    borderRadius = 25;
	gotAmountBorderRadius = 0;
    gradientAngle = 90;
    link = '';
    doubleAmountGoal = false;
    textPosition = 'inside';
    textAlignment = 'center';
    outerGradient = false;
    keepCounting = true;
    keepCountingPercentage = true;
    gradient = false;
    gradientAnimation = 'none';
    hideMinMaxNumbers = true;
    isNinetyDegree = false;
    showOnDonationPage = true;
    hideMinMaxNumbersDonatePage = false;
    widgetCurrency = Currency.UAH;
    addSubscriptionAmount = false;
    showCurrencySign = true;
    gifSeparatorAbove = false;
    showAmountWithoutFee = false;
    gifSeparator = {};
    multiGoalItems = {
        items: [{
            name: '{amount}',
            amount: 0,
        }],
        gradientColor: new ColorModel({r: '50', g: '50', b: '50', a: '0.5'}),
        textPosition: 'right',
        padding: 0,
        gradientStart: 50,
        borderRadius: 0,
        borderWidth: 0,
        borderColor: new ColorModel({r: '50', g: '50', b: '50', a: '1'})
    };
    multiGoal = false;
    color = new ColorModel({r: '53', g: '121', b: '246', a: '1'});
    colorFont = new ColorModel({r: '0', g: '0', b: '0', a: '1'});
    colorFontNumbers = new ColorModel({r: '255', g: '255', b: '255', a: '1'});
    colorBorder =  new ColorModel({r: '0', g: '0', b: '0', a: '1'});
    colorText = new FontModel({
        color: {r: '255', g: '255', b: '255', a: '1'},
        colorStroke: {r: 0, g: 0, b: 0, a: 1},
        colorTextBorder: {r: "255", g: "255", b: "255", a: "1"},
        fontSize: 20,
        fontFamily: 29,
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        letterSpacing: 0,
        wordSpacing: 0,
        fontAnimation: 'none',
        colorShadow: '',
        colorShadowWidth: '0',
        stroke: "3",
    })
    goalWidgetType = '1'; // 1 default, 2 diagram, 3 progress bar
    diagramSettings = {
		qrCode: false,
		replacingDiagramWithQrCode: false,
		gradient: false,
		gradientAngle: 0,
		gradientAnimation: 'none',
        colorBackground: new ColorModel({r: '246', g: '246', b: '247', a: '1'}),
        textWidgetNameAndGoal: new FontModel({
            color: {r: '10', g: '24', b: '48', a: '1'},
            fontSize: 18,
            fontFamily: 5,
            isBold: false,
            isItalic: false,
            isUnderlined: false,
            letterSpacing: 0,
            wordSpacing: 0,
            fontAnimation: 'none',
            colorShadow: '',
            colorShadowWidth: '0',
        }),
        textGotAmountAndPercentage: new FontModel({
            color: {r: '53', g: '121', b: '246', a: '1'},
            fontSize: 30,
            fontFamily: 5,
            isBold: false,
            isItalic: false,
            isUnderlined: false,
            letterSpacing: 0,
            wordSpacing: 0,
            fontAnimation: 'none',
            colorShadow: '',
            colorShadowWidth: '0',
        }),
        colorGoalLine: new ColorModel({r: '54', g: '122', b: '246', a: '1'}),
        innerColorGoalLine: new ColorModel({r: '175', g: '179', b: '187', a: '1'}),
        colorLabel: new ColorModel({r: '175', g: '179', b: '187', a: '1'}),
        colorDivider: new ColorModel({r: '175', g: '179', b: '187', a: '1'}),
        colorPercentageAndShadow: new ColorModel({r: '255', g: '255', b: '255', a: '1'}),
    }
    widgetStatus = widgetEnum.WidgetStatus.active;
	progressBarSettings = {
		qrCode: false,
		gradient: false,
		gradientAngle: 90,
		gradientAnimation: 'none',
		progressBarColor: new ColorModel({r: '54', g: '122', b: '246', a: '1'}),
		colorBackground: new ColorModel({r: '246', g: '246', b: '247', a: '1'}),
		colorLabel: new ColorModel({r: '175', g: '179', b: '187', a: '1'}),
		turnOffProgressBarShadow: false,
		borderRadius: 10,
		gotAmountBorderRadius: 10,
		textWidgetNameAndGoal: new FontModel({
            color: {r: '10', g: '24', b: '48', a: '1'},
            fontSize: 18,
            fontFamily: 5,
            isBold: false,
            isItalic: false,
            isUnderlined: false,
            letterSpacing: 0,
            wordSpacing: 0,
            fontAnimation: 'none',
            colorShadow: '',
            colorShadowWidth: '0',
        }),
        textGotAmount: new FontModel({
            color: {r: '255', g: '255', b: '255', a: '1'},
            fontSize: 30,
            fontFamily: 5,
            isBold: false,
            isItalic: false,
            isUnderlined: false,
            letterSpacing: 0,
            wordSpacing: 0,
            fontAnimation: 'none',
            colorShadow: '',
            colorShadowWidth: '0',
        }),
	};
	imageQrCode = false;
}

export default WidgetGoalModel;
