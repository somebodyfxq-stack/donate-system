import ColorModel from './ColorModel';

class FontModel {
    fontFamily = 5;
    fontSize = 20;
    isBold = false;
    isItalic = false;
    isUnderlined = false;
    letterSpacing = 4;
    wordSpacing = 0;
    fontAnimation = 'none';
    fontAnimationDuration = '2.5';
    infiniteAnimation = false;
    color = new ColorModel();
    colorShadow = '';
    colorShadowWidth = '15';
    textAlign = 'center';

    stroke = 0;
    colorStroke = '2';

    colorTextBorder = new ColorModel({r: '206', g: '204', b: '25', a: '1'});
    colorTextBorderWidth = '0';

    // gradient
    gradient = false;
    gradientOne = new ColorModel({r: '206', g: '204', b: '25', a: '1'});
    gradientTwo = new ColorModel({r: '206', g: '204', b: '25', a: '1'});
    gradientAngle = 90;

    constructor(props) {
        if (props) {
            Object.keys(props).forEach(key => {
                this[key] = props[key];
            });
        }
    }
}

export default FontModel;
