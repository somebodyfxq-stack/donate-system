class ColorModel {
    r = '206';
    g = '204';
    b = '25';
    a = '1';

    constructor(props) {
        if (props) {
            Object.keys(props).forEach(key => {
                this[key] = props[key];
            });
        }
    }
}

export default ColorModel;
