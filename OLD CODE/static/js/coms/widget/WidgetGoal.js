import slugify from '@sindresorhus/slugify';
import React, {Component} from 'react';

import Nav from 'react-bootstrap/Nav';
import {connect} from 'react-redux';
import reactCSS from 'reactcss';
import widgetEnum from '../../enums/widgetEnum';
import WidgetGoalModel from '../../models/WidgetGoalModel';
import {api} from '../../services/api';

import helpers from '../../utils/helpers';

import DiagramFirstTab from '../goal/diagramFirstTab';
import DiagramSecondTab from '../goal/diagramSecondTab';
import {DiagramWidgetV6} from '../goal/DiagramWidgetV6';

import ExamplesGoal from '../goal/examples';
import FirstTab from '../goal/FirstTab';
import {goalWidgetV3} from '../goal/goalWidgets';
import ProgressBarSecondTab from '../goal/ProgressBarSecondTab';
import {ProgressBarWidget} from '../goal/ProgressBarWidget';
import {ProgressBarWidgetV4} from '../goal/ProgressBarWidgetV4';
import SecondTab from '../goal/SecondTab';
import Badge from '../misc/Badge';
import WidgetItemSave from './WidgetItemSave';

class WidgetGoal extends Component {
  textPositions = widgetEnum.TEXT_POSITIONS;
  randomGradient = widgetEnum.RANDOM_GRADIENT;
  animationOptions = widgetEnum.GRADIENT_ANIMATION;
  goalWidgetTypes = [{
    id: 1,
    name: 'Стандартний',
  },
  {
    id: 2,
    name: 'Діаграма',
  },
  {
    id: 4,
    name: 'Діаграма V2',
  },
  {
    id: 3,
    name: 'Прогрес бар',
  },
  {
    id: 5,
    name: 'Прогрес бар V2',
  }
  ];

  constructor(props) {
    super(props);

    this.state = {
      widget: { ...new WidgetGoalModel(), ...this.props.widget },
      showColorPicker: false,
      showColorFontPicker: false,
      showColorFontNumbersPicker: false,
      showColorTextPicker: false,
      showGradientPickers: [],
      tabId: '1'
    };

    this.innerCircleV3Ref = React.createRef();
    this.circleV3Ref = React.createRef();

	this.innerCircleV6Ref = React.createRef();
    this.circleV6Ref = React.createRef();
	this.circleInternalV6Ref = React.createRef();
	this.markerV6Ref = React.createRef();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.widget.widgetId !== this.state.widget.widgetId) {
      this.setState({ widget: { ...new WidgetGoalModel(), ...nextProps.widget } });
    }
  }

  componentDidMount() {
    const widget = this.props.widget;

    if (widget.goalWidgetType === '2' || widget.goalWidgetType === '4') {
      // need to rerender to get new widget from DOM
      this.rerenderToGetWidget();
    }
  }

  rerenderToGetWidget = () => {
    setTimeout(() => {
      this.setState({ refresh: !this.state.refresh });
    }, 500)
  }

  componentDidUpdate() {
    localStorage.setItem('widgetGoal', JSON.stringify(this.state.widget));
  }

  buildColor = (color) => {
    return `rgba(${color.r},${color.g},${color.b},${color.a})`;
  };

  onChange = (e) => {
    const { value } = e.target;
    const id = e.target.id.replace(/Slider+$/, '');
    const widget = { ...this.state.widget };

    widget[id] = value;

    if (id === "widgetLabel") {
      let name = value.replace("{percentage}", "");
      name = slugify(name);

      widget.urlName = name;
    }

	if (id === "gradientAngleProgressBar") {
		widget.progressBarSettings.gradientAngle = value;
	}

	if (id === 'gradientAnimationProgressBar') {
		widget.progressBarSettings.gradientAnimation = value;
	}

	if (id === "gradientAngleDiagram") {
		widget.diagramSettings.gradientAngle = value;
	}

	if (id === 'gradientAnimationDiagram') {
		widget.diagramSettings.gradientAnimation = value;
	}

	if (id === "borderRadiusProgressBar") {
		widget.progressBarSettings.borderRadius = value;
	}

	if (id === "gotAmountBorderRadiusProgressBar") {
		widget.progressBarSettings.gotAmountBorderRadius = value;
	}

    this.setState({ widget });

    if (id === 'goalWidgetType' && widget.goalWidgetType === '2') {
      // need to rerender to get new widget from DOM
      this.rerenderToGetWidget();
    }
  };

  onTextEditorChange = (description, source) => {
	if (source !== 'user') return;

	const widget = { ...this.state.widget };
	widget.widgetDescription = description;

	this.setState({ widget });
  };

  onSwitchChange = (c, field) => {
    const widget = { ...this.state.widget };

    widget[field] = c;

    if (field === 'gradient' && c) {
      widget.gradientColors = this.randomGradient[this.getRandomInt(this.randomGradient.length)];
    } else if (field === 'gradient' && !c) {
      widget.gradientColors = false;
      widget.outerGradient = false;
    }

	if (field === 'progressBarGradient' && c) {
		widget.progressBarSettings.gradientColors = this.randomGradient[this.getRandomInt(this.randomGradient.length)];
		widget.progressBarSettings.gradient = true;
	  } else if (field === 'progressBarGradient' && !c) {
		widget.progressBarSettings.gradientColors = false;
		widget.progressBarSettings.outerGradient = false;
		widget.progressBarSettings.gradient = false;
	  }

	if (field === 'diagramGradient' && c) {
		widget.diagramSettings.gradientColors = this.randomGradient[this.getRandomInt(this.randomGradient.length)];
		widget.diagramSettings.gradient = true;
	  } else if (field === 'diagramGradient' && !c) {
		widget.diagramSettings.gradientColors = false;
		widget.diagramSettings.outerGradient = false;
		widget.diagramSettings.gradient = false;
	  }

    if (field === 'isNinetyDegree' && c) {
      //remove animation for 90* widget
      widget.elementsAnimation = false;
    }

    if (field === 'keepCounting' && !c) {
      widget.keepCountingPercentage = false;
    }

    if (field === 'doubleAmountGoal' && c) {
      widget.keepCounting = false;
      widget.keepCountingPercentage = false;
    }

	if (field === 'progressBarQrCode' && c) {
		widget.progressBarSettings.qrCode = true;
	} else if (field === 'progressBarQrCode' && !c) {
		widget.progressBarSettings.qrCode = false;
	}

	if (field === 'diagramQrCode' && c) {
		widget.diagramSettings.qrCode = true;
	} else if (field === 'diagramQrCode' && !c) {
		widget.diagramSettings.qrCode = false;
	}

	if (field === 'replacingDiagramWithQrCode' && c) {
		widget.diagramSettings.replacingDiagramWithQrCode = true;
	} else if (field === 'replacingDiagramWithQrCode' && !c) {
		widget.diagramSettings.replacingDiagramWithQrCode = false;
	}

	if (field === 'turnOffProgressBarShadow' && c) {
		widget.progressBarSettings.turnOffProgressBarShadow = true;
	} else if (field === 'turnOffProgressBarShadow' && !c) {
		widget.progressBarSettings.turnOffProgressBarShadow = false;
	}

    this.setState({ widget });
  };

  onChangeColor = (color, type, specificWidget) => {
    const widget = this.state.widget;

    if (!specificWidget) {
      widget[type] = color.rgb;
    } else {
      widget[specificWidget][type] = color.rgb;
    }

    this.setState({ widget });
  };

  onChangeGradientColor = (color, i, id) => {
    const widget = this.state.widget;

	if (id === 'progressBarSettings') {
		widget.progressBarSettings.gradientColors[i] = color.rgb;
	} else if (id === 'diagramSettings') {
		widget.diagramSettings.gradientColors[i] = color.rgb;
	} else {
		widget.gradientColors[i] = color.rgb;
	}

    this.setState({ widget });
  };

  onRemoveGradientPicker = (i, id) => {
    const widget = this.state.widget;

	if (id) {
		widget[id].gradientColors.splice(i, 1);
	} else {
		widget.gradientColors.splice(i, 1);
	}

    this.setState({ widget });
  };

  onSaveFont = (font, el, widgetType) => {
    const widget = { ...this.state.widget };

    if (widgetType) {
      widget[widgetType][el] = font;
    } else {
      widget[el] = font;
    }

    this.setState({ widget });
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

  onShowGradientPicker = (i) => {
    const { showGradientPickers } = this.state;

    showGradientPickers[i] = !showGradientPickers[i];

    this.setState({ showGradientPickers });
  };

  onCloseGradientPicker = (i) => {
    const { showGradientPickers } = this.state;

    showGradientPickers[i] = false;

    this.setState({ showGradientPickers });
  };

  onShowUrlLink = (e, widget) => {
    widget.showUrl = !widget.showUrl;
    this.setState({ widget: widget });
  };

  onCopyText = () => {
    const { widget, token } = this.props;
    const url = helpers.buildWidgetUrl(widget.widgetId, token);

    helpers.copyText(url);
  };

  onCopyUrlPage = () => {
    const { nickname } = this.props;
    const { widget } = this.state;

    const url = helpers.buildGoalPageUrl(widget.widgetId, widget.urlName, nickname)

    helpers.copyText(url);
  };

  onPreviewWidget = (e, widget, props) => {
    e.preventDefault();
    window.open(`${window.location.origin}/widget/${widget.widgetId}/token/${props.token}/preview`, 'sharer', 'toolbar=0,status=0,width=800,height=800');
  };

  addNewGradient = (id) => {
    const { widget } = this.state;

	if (typeof id === 'string') {
		widget[id].gradientColors = widget[id].gradientColors ? widget[id].gradientColors : [];

		widget[id].gradientColors.push({
			a: 1,
			b: 27,
			g: 205,
			r: 207
		});
	} else {
		widget.gradientColors = widget.gradientColors ? widget.gradientColors : [];

		widget.gradientColors.push({
			a: 1,
			b: 27,
			g: 205,
			r: 207
		});
	}

    this.setState({ widget });
  }

  getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
  }

  addRandomGradient = (id) => {
    const { widget } = this.state;

	if (typeof id === 'string') {
		widget[id].gradientColors = this.randomGradient[this.getRandomInt(this.randomGradient.length)];
	} else {
		widget.gradientColors = this.randomGradient[this.getRandomInt(this.randomGradient.length)];
	}

    this.setState({ widget });
  }

  createPreset = (e) => {
    e && e.preventDefault();

    const widget = { ...this.state.widget };
    widget.removable = true;
    delete widget.widgetId;

    api.addUsersGoalPreset(widget)
  }

  onSaveMultiGoal = (data) => {
    const widget = { ...this.state.widget };

    widget.multiGoalItems = data;
    this.setState({ widget });
  }

  onTabClick = (tabId) => {
    this.setState({ tabId });
  }

  onExampleClick = (item) => {
    let { widget } = this.state;

    widget = {
      ...widget,
      ...item
    }

    this.setState({ widget });
  }

  saveSelectedMedia = (e, items) => {
    e && e.preventDefault();
    const { widget } = this.state;

    const gifSeparator = {
      ...items.images.find(item => item.selected)
    }

    widget.gifSeparator = {
      name: gifSeparator.name,
      gcName: gifSeparator.gcName || gifSeparator.name,
      url: gifSeparator.url || gifSeparator.path,
      id: gifSeparator._id || gifSeparator.id
    };

    this.setState({widget});
  }

  onRemoveElement = () => {
    const { widget } = this.state;

    delete widget.gifSeparator;

    this.setState({widget});
  }

  render() {
    const { widget, showGradientPickers, tabId, showColorPicker,
      showColorBackgroundPicker, showColorLabelPicker, showColorGoalLinePicker,
      showInnerColorGoalLinePicker, showColorDividerPicker, showColorPercentageAndShadowPicker
    } = this.state;
    const { onSave, onCancel, nickname, token } = this.props;

    const { diagramSettings, progressBarSettings } = widget;

    const colorText = widget.colorText.color ? widget.colorText : { color: widget.colorText };

    const styles = reactCSS({
      default: {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${widget.color.r},${widget.color.g},
                ${widget.color.b},${widget.color.a})`
        },
		progressBarColor: {
			width: '36px',
			height: '14px',
			borderRadius: '2px',
			background: `rgba(${progressBarSettings.progressBarColor.r},${progressBarSettings.progressBarColor.g},
				  ${progressBarSettings.progressBarColor.b},${progressBarSettings.progressBarColor.a})`
		  },
        colorBackground: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${diagramSettings.colorBackground.r},${diagramSettings.colorBackground.g},
                ${diagramSettings.colorBackground.b},${diagramSettings.colorBackground.a})`
        },
		colorBackgroundProgressBar: {
			width: '36px',
			height: '14px',
			borderRadius: '2px',
			background: `rgba(${progressBarSettings.colorBackground.r},${progressBarSettings.colorBackground.g},
				  ${progressBarSettings.colorBackground.b},${progressBarSettings.colorBackground.a})`
		  },
        colorLabel: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${diagramSettings.colorLabel.r},${diagramSettings.colorLabel.g},
                ${diagramSettings.colorLabel.b},${diagramSettings.colorLabel.a})`
        },
		colorLabelProgressBar: {
			width: '36px',
			height: '14px',
			borderRadius: '2px',
			background: `rgba(${progressBarSettings.colorLabel.r},${progressBarSettings.colorLabel.g},
				  ${progressBarSettings.colorLabel.b},${progressBarSettings.colorLabel.a})`
		  },
        colorGoalLine: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${diagramSettings.colorGoalLine.r},${diagramSettings.colorGoalLine.g},
                ${diagramSettings.colorGoalLine.b},${diagramSettings.colorGoalLine.a})`
        },
        innerColorGoalLine: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${diagramSettings.innerColorGoalLine.r},${diagramSettings.innerColorGoalLine.g},
                ${diagramSettings.innerColorGoalLine.b},${diagramSettings.innerColorGoalLine.a})`
        },
        colorDivider: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${diagramSettings.colorDivider.r},${diagramSettings.colorDivider.g},
                ${diagramSettings.colorDivider.b},${diagramSettings.colorDivider.a})`
        },
        colorPercentageAndShadow: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${diagramSettings.colorPercentageAndShadow.r},${diagramSettings.colorPercentageAndShadow.g},
                ${diagramSettings.colorPercentageAndShadow.b},${diagramSettings.colorPercentageAndShadow.a})`
        },
        colorFont: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${widget.colorFont.r},${widget.colorFont.g},
                ${widget.colorFont.b},${widget.colorFont.a})`
        },
        colorText: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${widget.colorText.r},${widget.colorText.g},
                ${widget.colorText.b},${widget.colorText.a})`
        },
        colorFontNumbers: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${widget.colorFontNumbers.r},${widget.colorFontNumbers.g},
                ${widget.colorFontNumbers.b},${widget.colorFontNumbers.a})`
        },
        colorBorder: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${widget.colorBorder.r},${widget.colorBorder.g},
                ${widget.colorBorder.b},${widget.colorBorder.a})`
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
        }
      }
    }, this.props, this.state);

    return (
      <form onSubmit={(e) => onSave(e, widget)} className="mt-lg-5 ml-lg-3 mr-lg-3">
        <h4 className="mb-lg-5 d-flex justify-content-between">
          {`${widget.widgetId ? 'Редагувати' : 'Додати'} віджет`}
          <button className="btn btn-light mr-2"
            onClick={(e) => onCancel(e)}>
            Скасувати
          </button>
        </h4>

        <div className="form-group row mb-lg-4"></div>
        <div className="form-group row mb-lg-4">
          <label htmlFor="nameWidget" className="col-sm-4 col-form-label">
            Пряме посилання на збір
            {widget.widgetId &&
              <span>
                <i className="far fa-copy"
                  data-toggle="tooltip" data-placement="top" title="Скопіювати посилання"
                  onClick={() => this.onCopyUrlPage()} />
              </span>
            }
          </label>
          <div className="col-sm-6">
            <input id="widgetName" type="text" className="form-control" required
              disabled
              value={helpers.buildGoalPageUrl(widget.widgetId, widget.urlName, nickname)} />
            <small id="urlShow" className="form-text text-muted">
              {!widget.widgetId ? (
                <div className="mb-1">
                  * Посилання на віджет для <strong>OBS Studio</strong> буде доступним після збереження.
                </div>
              ) : (
                <div className="mb-1">
                  * Посилання залежить від <strong>Назва збору</strong>
                </div>
              )}
            </small>
          </div>
        </div>

        <div className="form-group row mb-lg-4">
          <label className="col-sm-4 col-form-label">Посилання на віджет
            {widget.widgetId &&
              <span>
                <i className={widget.showUrl ? 'fas fa-eye' : 'far fa-eye-slash'}
                  data-toggle="tooltip" data-placement="top"
                  title={!widget.showUrl ? 'Показати' : 'Сховати'}
                  onClick={(e) => this.onShowUrlLink(e, widget)} />
                <i className="far fa-copy"
                  data-toggle="tooltip" data-placement="top" title="Скопіювати посилання"
                  onClick={(e) => this.onCopyText(e)} />
              </span>
            }
          </label>
          <div className="col-sm-6 url">
            <input id="urlLink" className="p-2 form-control url-link" disabled type="text"
              value={widget.showUrl ? helpers.buildWidgetUrl(widget.widgetId, token) : widget.widgetId ? "************************" : ""} />

            <small id="urlShow" className="form-text text-muted">
              {widget.widgetId ? (
                <div>
                  <div className="mb-1">
                    * Це посилання можна використовувати в <strong>OBS Studio</strong>.
                  </div>
                  <div className="mb-1">
                    * Посилання містить ваш секретний токен. Не показуйте його, будь ласка, нікому.
                  </div>
                </div>
              ) : (
                <div className="mb-1">
                  * Посилання на віджет для <strong>OBS Studio</strong> буде доступним після збереження.
                </div>
              )}
            </small>
          </div>
        </div>

        <div className="form-group row mb-lg-4">
          <label htmlFor="goalWidgetType" className="col-sm-4 col-form-label">
            {Badge()}
            Вигляд збору коштів
          </label>
          <div className="col-sm-4">
            <select id="goalWidgetType" className="form-control"
              value={widget.goalWidgetType}
              onChange={(e) => this.onChange(e)}>
              {this.goalWidgetTypes.map((item, i) =>
                <option key={item.id} value={item.id}> {item.name} </option>
              )}
            </select>
          </div>
        </div>

		{widget.goalWidgetType === '2' && (
			goalWidgetV3({
        widget,
        innerCircleV3Ref: this.innerCircleV3Ref,
        circleV3Ref: this.circleV3Ref,
        i: 0,
        nickname: `${nickname}/goal/${widget.urlName}`})
		)}

		{widget.goalWidgetType === '4' && (
			DiagramWidgetV6({
				widget,
				innerCircleV6Ref: this.innerCircleV6Ref,
				circleV6Ref: this.circleV6Ref,
				circleInternalV6Ref: this.circleInternalV6Ref,
				markerV6Ref: this.markerV6Ref,
				i: 0,
				nickname: `${nickname}/goal/${widget.urlName}`
			})
		)}

		{widget.goalWidgetType === '3' && (
			ProgressBarWidget({widget, nickname: `${nickname}/goal/${widget.urlName}`})
		)}

		{widget.goalWidgetType === '5' && (
			ProgressBarWidgetV4({widget, nickname: `${nickname}/goal/${widget.urlName}`})
		)}

        <div className="form-group row">
          <label htmlFor="nameWidget" className="col-sm-4 col-form-label">
            Пресет даного віджета
          </label>
          <div className="col-sm-6">
            <button className="btn btn-light mr-2"
              onClick={this.createPreset}>
              Створити
            </button>
            <small id="urlShow" className="form-text text-muted">
              <div className="mb-1">
                Зберегти налаштування до <strong>Готові варіанти</strong>
                <br></br>
                Створюється копія налаштувань даного віджета для майбутнього перевикористання
              </div>
            </small>
          </div>
        </div>

        <div className="mb-5" />

        <Nav justify variant="tabs" defaultActiveKey="1" onSelect={(selectedKey) => this.onTabClick(selectedKey)}>
          <Nav.Item>
            <Nav.Link eventKey="1">Налаштування елементів</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="2">Візуальне налаштування</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="3">Готові варіанти</Nav.Link>
          </Nav.Item>
        </Nav>

        {tabId === '1' && widget.goalWidgetType === '1' && (
          <FirstTab
            widget={widget}
            textPositions={this.textPositions}
            onChange={this.onChange}
            onSwitchChange={this.onSwitchChange}
            onSaveMultiGoal={this.onSaveMultiGoal}
			onTextEditorChange={this.onTextEditorChange}
          />
        )}

        {tabId === '2' && widget.goalWidgetType === '1' && (
          <SecondTab
            widget={widget}
            onSaveFont={this.onSaveFont}
            onChange={this.onChange}
            onSwitchChange={this.onSwitchChange}
            onShowPicker={this.onShowPicker}
            onChangeColor={this.onChangeColor}
            animationOptions={this.animationOptions}
            onShowGradientPicker={this.onShowGradientPicker}
            onCloseGradientPicker={this.onCloseGradientPicker}
            onChangeGradientColor={this.onChangeGradientColor}
            onRemoveGradientPicker={this.onRemoveGradientPicker}
            addNewGradient={this.addNewGradient}
            addRandomGradient={this.addRandomGradient}
            onClosePicker={this.onClosePicker}
            showColorBorderPicker={this.state.showColorBorderPicker}
            styles={styles}
            colorText={colorText}
            showGradientPickers={showGradientPickers}
            showColorPicker={showColorPicker}
            showColorFontPicker={this.state.showColorFontPicker}
            showColorFontNumbersPicker={this.state.showColorFontNumbersPicker}
            saveSelectedMedia={this.saveSelectedMedia}
            onRemoveElement={this.onRemoveElement}
          />
        )}

        {tabId === '3' && (
          <ExamplesGoal
            onExampleClick={this.onExampleClick}
            widget={widget}
          />
        )}

        {tabId === '1' && (widget.goalWidgetType === '2' || widget.goalWidgetType === '3' || widget.goalWidgetType === '4' || widget.goalWidgetType === '5') && (
          <DiagramFirstTab
            widget={widget}
            onChange={this.onChange}
            onSwitchChange={this.onSwitchChange}
			onTextEditorChange={this.onTextEditorChange}
          />
        )}

        {tabId === '2' && (widget.goalWidgetType === '2' || widget.goalWidgetType === '4') && (
          <DiagramSecondTab
            widget={widget}
            onChangeColor={this.onChangeColor}
            styles={styles}
            onShowPicker={this.onShowPicker}
            onClosePicker={this.onClosePicker}
            showColorBackgroundPicker={showColorBackgroundPicker}
            showColorLabelPicker={showColorLabelPicker}
            showColorGoalLinePicker={showColorGoalLinePicker}
            showInnerColorGoalLinePicker={showInnerColorGoalLinePicker}
            showColorDividerPicker={showColorDividerPicker}
            showColorPercentageAndShadowPicker={showColorPercentageAndShadowPicker}
            onSaveFont={this.onSaveFont}
            textWidgetNameAndGoal={diagramSettings.textWidgetNameAndGoal}
            textGotAmountAndPercentage={diagramSettings.textGotAmountAndPercentage}
			onSwitchChange={this.onSwitchChange}
			onShowGradientPicker={this.onShowGradientPicker}
            onCloseGradientPicker={this.onCloseGradientPicker}
            onChangeGradientColor={this.onChangeGradientColor}
            onRemoveGradientPicker={this.onRemoveGradientPicker}
            addNewGradient={this.addNewGradient}
            addRandomGradient={this.addRandomGradient}
			showGradientPickers={showGradientPickers}
			onChange={this.onChange}
			animationOptions={this.animationOptions}
          />
        )}

		{tabId === '2' && (widget.goalWidgetType === '3' || widget.goalWidgetType === '5') && (
          <ProgressBarSecondTab
            widget={widget}
            onChangeColor={this.onChangeColor}
            styles={styles}
            onShowPicker={this.onShowPicker}
            onClosePicker={this.onClosePicker}
            showColorBackgroundPicker={showColorBackgroundPicker}
            showColorLabelPicker={showColorLabelPicker}
            onSaveFont={this.onSaveFont}
            textWidgetNameAndGoal={progressBarSettings.textWidgetNameAndGoal}
            textGotAmount={progressBarSettings.textGotAmount}
			onShowGradientPicker={this.onShowGradientPicker}
            onCloseGradientPicker={this.onCloseGradientPicker}
            onChangeGradientColor={this.onChangeGradientColor}
            onRemoveGradientPicker={this.onRemoveGradientPicker}
            addNewGradient={this.addNewGradient}
            addRandomGradient={this.addRandomGradient}
			showGradientPickers={showGradientPickers}
            showColorPicker={showColorPicker}
			onChange={this.onChange}
			animationOptions={this.animationOptions}
			onSwitchChange={this.onSwitchChange}
          />
        )}

        <WidgetItemSave
          onPreview={(e) => this.onPreviewWidget(e, widget, this.props)}
          widgetId={widget.widgetId ? true : false}
          onCancel={onCancel} />
      </form>
    )
  }
}

function mapStateToProps(state) {
  const { nickname } = state.config;

  return { nickname };
}

export default connect(mapStateToProps)(WidgetGoal);
