import React, {Component} from 'react';
import {SketchPicker} from 'react-color';
import ReactModal from 'react-modal';
import Switch from 'react-switch';
import reactCSS from 'reactcss';
import widgetEnum from '../../enums/widgetEnum';

import helpers from '../../utils/helpers';
import Badge from './Badge';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        borderRadius: '20px',
        transform: 'translate(-50%, -50%)',
        height: '90%',
        width: '50%',
        zIndex: '99'
    }
};
// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root')

class FontEditor extends Component {

    fontAnimations = widgetEnum.FONT_ANIMATIONS;
    fonts = widgetEnum.FONTS;
    animationOptions = widgetEnum.GRADIENT_ANIMATION;
    textAlignment = widgetEnum.TEXT_ALIGNMENT;

    constructor(props) {
        super(props);

        this.state = {
            font: {
                infiniteAnimation: false,
                isBold: false,
                isItalic: false,
                isUnderlined: false,
                ...this.props.font

            },
            showColorPicker: false,
            showColorShadowPicker: false,
            showColorStrokePicker: false,
            showModal: false
        };
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.font !== prevProps.font) {
            this.setState({ font: this.props.font });
        }
    }

    onCancel = () => {
        const font = { ...this.props.font };
        this.setState({ font });
    };

    onChange = (e) => {
        const { value } = e.target;
        const id = e.target.id.replace(/Slider+$/, '');
        const font = this.state.font;

        font[id] = value;
        this.setState({ font });
    };

    onColorChange = (color, prop, selector) => {
        const font = this.state.font;

        font[prop] = color[selector];
        this.setState({ font });
    };

    getColorPickerOption = (picker) => {
        return `show${helpers.capitalize(picker)}Picker`;
    };

    onShowPicker = (picker) => {
        const option = this.getColorPickerOption(picker);

        this.setState({ [option]: !this.state[option] });
    };

    onClosePicker = (picker) => {
        const option = this.getColorPickerOption(picker);

        this.setState({ [option]: false });
    };

    onSwitch = (checked, prop) => {
        const font = this.state.font;

        font[prop] = checked;
        this.setState({ font });
    };

    toggleModal = (state) => {
        this.setState({ showModal: state });
    };

    render() {
        const font = { ...this.state.font };
        const { onSaveFont, text, showNewBadge, widget, textAnimation,
            buttonLabelStyle, showNote, specialWidth, resetButton,
            element, hideLabel, showTextAlignment
        } = this.props;

        let previewStyles = {
            fontSize: font.fontSize + 'px',
            fontFamily: this.fonts[font.fontFamily] ? this.fonts[font.fontFamily].id : font.fontFamily,
            textAlign: font.textAlign || 'center',
            height: '80px',
            color: `rgba(${font.color?.r}, ${font.color?.g}, ${font.color?.b}, ${font.color?.a})`,
            fontWeight: font.isBold ? 'bolder' : '',
            fontStyle: font.isItalic ? 'italic' : '',
            textDecoration: font.isUnderlined ? 'underline' : '',
            letterSpacing: font.letterSpacing + 'px',
            wordSpacing: font.wordSpacing + 'px',
            animationDuration: `${font.fontAnimationDuration || "2.5"}s`,
            ...(!font.gradient && {
                textShadow: `rgba(${font.colorShadow?.r},${font.colorShadow?.g},${font.colorShadow?.b},${font.colorShadow?.a}) 0px 0px ${font.colorShadowWidth}px`
            }),
            ...(font.stroke !== '0' && font.colorStroke && {
                backgroundColor: `rgba(${font.colorStroke?.r},${font.colorStroke?.g},${font.colorStroke?.b},${font.colorStroke?.a})`,
                'WebkitTextStroke': `${font.stroke}px transparent`,
                '-webkit-background-clip': `text`,
            })
        };

        if (font.gradient) {
            const o = font.gradientOne || {};
            const t = font.gradientTwo || {};

            previewStyles = {
                ...previewStyles,
                backgroundImage: `linear-gradient(${font.gradientAngle}deg, rgba(${o.r}, ${o.g}, ${o.b}) 0%, rgba(${t.r}, ${t.g}, ${t.b}) 100%)`,
                backgroundSize: '100%',
                'WebkitTextFillColor': 'transparent',
                '-webkit-background-clip': `text`,
            }
        }

        const styles = reactCSS({
            'default': {
                color: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: `rgba(${font.color?.r},${font.color?.g},${font.color?.b},${font.color?.a})`
                },
                gradientOne: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: `rgba(${font.gradientOne?.r},${font.gradientOne?.g},${font.gradientOne?.b},${font.gradientOne?.a})`
                },
                gradientTwo: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: `rgba(${font.gradientTwo?.r},${font.gradientTwo?.g},${font.gradientTwo?.b},${font.gradientTwo?.a})`
                },
                colorBorder: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: font.colorBorder
                },
                colorShadow: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: `rgba(${font.colorShadow?.r},${font.colorShadow?.g},${font.colorShadow?.b},${font.colorShadow?.a})`
                },
                colorStroke: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: `rgba(${font.colorStroke?.r},${font.colorStroke?.g},${font.colorStroke?.b},${font.colorStroke?.a})`
                },
                swatch: {
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            }
        }, this.props, this.state);

        return <div className="font-editor">
            <div className="form-group row mb-lg-4">
                {!hideLabel && <label htmlFor="textStyle" className={`col-sm-${buttonLabelStyle?.label || 4} col-form-label`}>
                    {showNewBadge && Badge()}
                    {text ? text : 'Стиль тексту'}
                </label>}
                <div className={`col-sm-${buttonLabelStyle?.button || 3}`}>
                    <div
                        id="textStyle"
                        className="btn alert-success edit-text-button"
                        onClick={() => this.toggleModal(true)}>
                        Редагування тексту
                    </div>
                    {showNote && (
                        <small id="textStyle" className="form-text text-muted">
                            <div className="mb-1" style={{width: specialWidth}}>
                                {showNote}
                            </div>
                        </small>
                    )}
                </div>
                {resetButton && (
                    <div className={`col-sm-${buttonLabelStyle?.button || 2}`}>
                        <div
                            id="resetSettings"
                            className="btn alert-warning edit-text-button"
                            onClick={() => resetButton(element)}>
                            скинути
                        </div>
                    </div>
                )}

            </div>

            <ReactModal
                isOpen={this.state.showModal}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={() => this.toggleModal(false)}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <div className="widgets modal-body">
                    <div className="col-sm-12 upload-animation">
                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-12" style={{ overflow: 'hidden' }}>
                                <div className={`animate__animated animate__${font.fontAnimation} ${font.infiniteAnimation || textAnimation === 'always' ? 'infinite-animation' : ''}`}
                                    style={previewStyles}>
                                    Прев'ю тексту {font.gradient && ' і також, ще більше тексту, щоб побачити градіент'}
                                </div>
                            </div>
                        </div>
                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-3">
                                Шрифт
                            </div>
                            <div className="col-sm-4">
                                <select id="fontFamily" value={font.fontFamily}
                                    onChange={(e) => this.onChange(e)}
                                    className="form-control">
                                    {this.fonts.map((item, i) =>
                                        <option key={i} value={item.val}> {item.name} </option>
                                    )}
                                </select>
                            </div>
                        </div>
                        {showTextAlignment && (
                            <div className="form-group row mb-lg-4">
                                <div className="col-sm-3">
                                    Позиція тексту
                                </div>
                                <div className="col-sm-4">
                                    <select id="textAlign" value={font.textAlign || 'center'}
                                        onChange={(e) => this.onChange(e)}
                                        className="form-control">
                                        {this.textAlignment.map((item, i) =>
                                            <option key={item.id} value={item.id}> {item.name} </option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        )}
                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-3">
                                Анімація шрифту
                            </div>
                            <div className="col-sm-4">
                                <select id="fontAnimation" value={font.fontAnimation}
                                    onChange={(e) => this.onChange(e)}
                                    className="form-control">
                                    {this.fontAnimations.map((item, i) =>
                                        <option key={item.id} value={item.id} className={item.header ? 'disabled' : ''} disabled={item.header}> {item.name} </option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* OLD IMPLEMENTATION STILL IN USE */}
                        {font.fontAnimation !== 'none' && this.props.onChange && widget === 'GOAL' &&
                            <div className="form-group row mb-lg-4">
                                <label htmlFor="textAnimation" className="col-sm-3 col-form-label">
                                    {Badge()}
                                    Анімація тексту
                                </label>
                                <div className="col-sm-4">
                                    <select id="textAnimation" className="form-control"
                                        value={textAnimation}
                                        onChange={(e) => {
                                            this.props.onChange && this.props.onChange(e);
                                            !this.props.onChange && this.onChange(e);
                                        }}>
                                        {this.animationOptions.map((item, i) =>
                                            <option key={item.id} value={item.id}> {item.name} </option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        }

                        {/* NEW IMPLEMENTATION */}
                        {font.fontAnimation !== 'none' && !this.props.onChange && widget === 'GOAL' &&
                            <div className="form-group row mb-lg-4">
                                <label htmlFor="textAnimation" className="col-sm-3 col-form-label">
                                    {Badge()}
                                    Анімація тексту
                                </label>
                                <div className="col-sm-4">
                                    <select id="textAnimation" className="form-control"
                                        value={font.textAnimation}
                                        onChange={(e) => this.onChange(e)}>
                                        {this.animationOptions.map((item, i) =>
                                            <option key={item.id} value={item.id}> {item.name} </option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        }

                        {font.fontAnimation !== 'none' &&
                            <div className="form-group row mb-lg-4">
                                <div className="col-sm-3 col-form-label">
                                    Швидкість анімації
                                </div>
                                <div className="col-sm-4">
                                    <input id="fontAnimationDurationSlider" type="range" step="0.5" min="0.5" max="5" className="slider mb-2 mb-sm-0"
                                        value={font.fontAnimationDuration || "2.5"}
                                        onChange={this.onChange} />
                                </div>
                                <div className="col-sm-3">
                                    <div className="input-group">
                                        <input id="fontAnimationDuration" type="number" className="form-control"
                                            value={font.fontAnimationDuration || "2.5"}
                                            onChange={this.onChange} />
                                        <div className="input-group-append">
                                            <span className="input-group-text">
                                                сек
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                        {font.fontAnimation !== 'none' &&
                            this.props.widget !== 'GOAL' &&
                            <div className="form-group row mb-lg-4">
                                <div className="col-sm-3">
                                    Постійна анімація?
                                </div>
                                <div className="col-sm-3">
                                    <Switch id="infiniteAnimation"
                                        checked={font.infiniteAnimation}
                                        onChange={(checked) => this.onSwitch(checked, 'infiniteAnimation')} />
                                </div>
                            </div>
                        }

                        {this.props.showFontGradient && (
                            <div className="form-group row mb-lg-4">
                                <div className="col-sm-3">
                                    {Badge()}
                                    Градіент
                                </div>
                                <div className="col-sm-3">
                                    <Switch id="gradient"
                                        checked={font.gradient}
                                        onChange={(checked) => this.onSwitch(checked, 'gradient')} />
                                </div>
                            </div>
                        )}

                        {font.gradient && (
                            <div className="form-group row mb-lg-4">
                                <div className="col-sm-3">
                                    {Badge()}
                                    Кут градіента
                                </div>
                                <div className="col-sm-3 mb-2 mb-sm-0">
                                    <input id="gradientAngle" className="slider" type="range" min="0" max="360"
                                    value={font.gradientAngle}
                                    onChange={this.onChange} />
                                </div>
                                <div className="col-sm-3">
                                    <input id="gradientAngle" className="height-input"
                                        value={font.gradientAngle}
                                        onChange={this.onChange}>
                                    </input>
                                </div>
                            </div>
                        )}

                        {font.gradient ?
                            <div className="form-group row mb-lg-4">
                                <div className="col-sm-3 mb-2 mb-sm-0">
                                    {Badge()}
                                    Градіент шрифта
                                </div>
                                <div className="col-sm-5">
                                    <div style={styles.swatch} onClick={() => this.onShowPicker('gradientOne')}>
                                        <div style={styles.gradientOne} />
                                    </div>
                                    {this.state.showGradientOnePicker && <div style={styles.popover}>
                                        <div style={styles.cover} onClick={() => this.onClosePicker('gradientOne')} />
                                        <SketchPicker color={font.gradientOne}
                                            onChange={(e) => this.onColorChange(e, 'gradientOne', 'rgb')} />
                                    </div>}

                                    <div style={styles.swatch} className="ml-4" onClick={() => this.onShowPicker('gradientTwo')}>
                                        <div style={styles.gradientTwo} />
                                    </div>
                                    {this.state.showGradientTwoPicker && <div style={styles.popover}>
                                        <div style={styles.cover} onClick={() => this.onClosePicker('gradientTwo')} />
                                        <SketchPicker color={font.gradientTwo}
                                            onChange={(e) => this.onColorChange(e, 'gradientTwo', 'rgb')} />
                                    </div>}
                                </div>
                            </div>
                            :
                            <div className="form-group row mb-lg-4">
                                <div className="col-sm-3">
                                    Колір шрифта
                                </div>
                                <div className="col-sm-3">
                                    <div style={styles.swatch} onClick={() => this.onShowPicker('color')}>
                                        <div style={styles.color} />
                                    </div>
                                    {this.state.showColorPicker && <div style={styles.popover}>
                                        <div style={styles.cover} onClick={() => this.onClosePicker('color')} />
                                        <SketchPicker color={font.color}
                                            onChange={(e) => this.onColorChange(e, 'color', 'rgb')} />
                                    </div>}
                                </div>
                            </div>
                        }

                        {!font.gradient && (
                            <div className="form-group row mb-lg-4">
                                <div className="col-sm-3">
                                    Колір тіні
                                </div>
                                <div className="col-sm-3">
                                    <div style={styles.swatch} onClick={() => this.onShowPicker('colorShadow')}>
                                        <div style={styles.colorShadow} />
                                    </div>
                                    {this.state.showColorShadowPicker && <div style={styles.popover}>
                                        <div style={styles.cover} onClick={() => this.onClosePicker('colorShadow')} />
                                        <SketchPicker color={font.colorShadow}
                                            onChange={(e) => this.onColorChange(e, 'colorShadow', 'rgb')} />
                                    </div>}
                                </div>
                            </div>
                        )}

                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-3">
                                Величина тіні
                            </div>
                            <div className="col-sm-3 mb-2 mb-sm-0">
                                <input id="colorShadowWidth" type="range" min="0" max="30" className="slider"
                                    value={font.colorShadowWidth}
                                    onChange={(e) => this.onChange(e)} />
                            </div>
                            <div className="col-sm-3">
                                <input id="colorShadowWidth" className="height-input"
                                    value={font.colorShadowWidth}
                                    onChange={(e) => this.onChange(e)}>
                                </input>px.
                            </div>
                        </div>

                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-3">
                                Розмір обводки
                            </div>
                            <div className="col-sm-3 mb-2 mb-sm-0">
                                <input id="strokeSlider" type="range" min="0" max="20" className="slider"
                                    value={font.stroke}
                                    onChange={(e) => this.onChange(e)} />
                            </div>
                            <div className="col-sm-3">
                                <input id="stroke" className="height-input"
                                    value={font.stroke}
                                    onChange={(e) => this.onChange(e)}>
                                </input>px.
                            </div>
                        </div>

                        {(!!font.stroke && font.stroke !== '0') && (
                            <div className="form-group row mb-lg-4">
                                <div className="col-sm-3">
                                    Колір обводки
                                </div>
                                <div className="col-sm-3">
                                    <div style={styles.swatch} onClick={() => this.onShowPicker('colorStroke')}>
                                        <div style={styles.colorStroke} />
                                    </div>
                                    {this.state.showColorStrokePicker && <div style={styles.popover}>
                                        <div style={styles.cover} onClick={() => this.onClosePicker('colorStroke')} />
                                        <SketchPicker color={font.colorStroke}
                                            onChange={(e) => this.onColorChange(e, 'colorStroke', 'rgb')} />
                                    </div>}
                                </div>
                            </div>
                        )}

                        {!this.props.hideFontSize && (
                            <div className="form-group row mb-lg-4">
                                <div className="col-sm-3">
                                    Розмір шрифта
                                </div>
                                <div className="col-sm-3 mb-2 mb-sm-0">
                                    <input id="fontSizeSlider" type="range" min="10" max="90" className="slider"
                                        value={font.fontSize}
                                        onChange={(e) => this.onChange(e)} />
                                </div>
                                <div className="col-sm-3">
                                    <input id="fontSize" className="height-input"
                                        value={font.fontSize}
                                        onChange={(e) => this.onChange(e)}>
                                    </input>px.
                                </div>
                            </div>
                        )}

                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-3">
                                Відстань між буквами
                            </div>
                            <div className="col-sm-3 mb-2 mb-sm-0">
                                <input id="letterSpacingSlider" type="range" min="0" max="30" className="slider"
                                    value={font.letterSpacing}
                                    onChange={(e) => this.onChange(e)} />
                            </div>
                            <div className="col-sm-3">
                                <input id="letterSpacing" className="height-input"
                                    value={font.letterSpacing}
                                    onChange={(e) => this.onChange(e)}>
                                </input>px.
                            </div>
                        </div>

                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-3">
                                Відстань між словами
                            </div>
                            <div className="col-sm-3 mb-2 mb-sm-0">
                                <input id="wordSpacingSlider" type="range" min="0" max="30" className="slider"
                                    value={font.wordSpacing}
                                    onChange={(e) => this.onChange(e)} />
                            </div>
                            <div className="col-sm-3">
                                <input id="wordSpacing" className="height-input"
                                    value={font.wordSpacing}
                                    onChange={(e) => this.onChange(e)}>
                                </input>px.
                            </div>
                        </div>

                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-3">
                                Жирний
                            </div>
                            <div className="col-sm-3">
                                <Switch id="isBold"
                                    checked={font.isBold}
                                    onChange={(checked) => this.onSwitch(checked, 'isBold')} />
                            </div>
                        </div>
                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-3">
                                Курсив
                            </div>
                            <div className="col-sm-3">
                                <Switch id="isItalic"
                                    checked={font.isItalic}
                                    onChange={(checked) => this.onSwitch(checked, 'isItalic')} />
                            </div>
                        </div>
                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-3">
                                Підкреслення
                            </div>
                            <div className="col-sm-3">
                                <Switch id="isUnderlined"
                                    checked={font.isUnderlined}
                                    onChange={(checked) => this.onSwitch(checked, 'isUnderlined')} />
                            </div>
                        </div>
                        <div className="form-group row mb-lg-4">
                            <div className="col-sm-12 d-flex justify-content-end">
                                <button className="btn btn-default mr-4" data-dismiss="modal"
                                    onClick={() => { this.onCancel(); this.toggleModal(false) }}>
                                    Скасувати
                                </button>
                                <button className="btn btn-primary mr-2" data-dismiss="modal"
                                    onClick={() => { onSaveFont(font, element); this.toggleModal(false) }}>
                                    Вибрати
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ReactModal>
        </div>
    }
}

export default FontEditor;
