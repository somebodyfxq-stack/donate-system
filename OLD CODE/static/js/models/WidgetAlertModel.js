import FontModel from './FontModel';
import widgetEnum from '../enums/widgetEnum';

export class WidgetAlertItemModel {
    showDetails = true;
    viewType = 'topBottom';
    timeLength = 5;
    loudness = 8;
    textLoudness = 8;
    interactionWidgetId = '';
    allowVoiceRecord = false;
    isReadingText = true;
    readingHeaderText = false;
    isTextVolumeSeparated = false;
    textToShow = '{user} {amount}{currency}';
    headerFont = new FontModel({
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
    bodyFont = new FontModel({
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
    highlightedUserName = new FontModel();
    highlightedAmount = new FontModel();
    isSpecificAmount = false;
    specificAmount = 100;
    minAmount = 5;
    maxAmount = 100;
    infiniteImageAnimation = false;
    allowUserSelectMedia = false;
    tenorAnimationAllowed = true;
    showUpAnimation = 'bounceIn';
    fadeOutAnimation = 'bounceOut';
    highlightDonaterAndAmount = false;
    userLanguageTTS = false;
    languageTTS = 'googleStandardTTS';
    stopSoundWithAlert = false;
    animationSettings = [{
        animationId: '',
        soundId: ''
    }];
    customWidgetUi = {
        headerHeight: 250,
        headerLeft: 415,
        headerTop: 14,
        headerWidth: 370,
        headerZIndex: 2,
        imageHeight: 250,
        imageLeft: 15,
        imageTop: 15,
        imageWidth: 370,
        imageZIndex: 1,
        mainHeight: 600,
        mainWidth: 800,
        textHeight: 290,
        textLeft: 135,
        textTop: 290,
        textWidth: 535,
        textZIndex: 3,
    };
    isRandom = true;
	textTransform = 'none';

    constructor(props) {
        if (props) {
            Object.keys(props).forEach(key => {
                this[key] = props[key];
            });
        }
    }
}

class WidgetAlertModel {
    widgetName = 'Новий віджет';
    alertType = 'donate';
    widgetFor = 'donate';
    widgetStatus = widgetEnum.WidgetStatus.active;
    widgetsConfig = [
        new WidgetAlertItemModel(),
        new WidgetAlertItemModel({
            minAmount: 101,
            maxAmount: 1000
        })
    ];
    link = '';
    customSounds = [];
    customImages = [];
}

export default WidgetAlertModel;
