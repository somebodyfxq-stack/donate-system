import FontModel from './FontModel';
import widgetEnum from '../enums/widgetEnum';

class WidgetTopModel {
    widgetName = '';
    amountItems = '';
    viewType = 'line';
    marqueeDirection = 'left';
    timeFrame = 'day';
    customTimeFrame = [new Date(), new Date()];
    textSpeed = '5';
    textToShow = '{user} {amount}{currency}';
    link = '';
    widgetType = 'topDonators';
    subscription = 'all';
    widgetFor = 'donate';
    showTierName = false;
    highlightAmount = false;
    fontSubscriptionName = new FontModel({
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
    });
    font = new FontModel({
        color: {r: '53', g: '121', b: '246', a: '1'},
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
    });
    fontAmount = new FontModel({
        color: {r: '53', g: '121', b: '246', a: '1'},
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
    });
    timeLength = 0;
    widgetStatus = widgetEnum.WidgetStatus.active;
	specificGoalWidget = false;
	goalWidgetId = '';
}

export default WidgetTopModel;
