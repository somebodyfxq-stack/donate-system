import uk from 'date-fns/locale/uk';
import moment from 'moment';
import React, {Component} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Switch from 'react-switch';
import widgetEnum, {WIDGET_FOR} from '../../enums/widgetEnum';
import WidgetTopModel from '../../models/WidgetTopModel';
import helpers from '../../utils/helpers';
import FontEditor from '../misc/FontEditor';
import WidgetItemSave from './WidgetItemSave';
import Badge from '../misc/Badge';

class WidgetTop extends Component {

    periods = widgetEnum.PERIODS;
    viewTypes = widgetEnum.VIEW_TYPES_TOP;
    viewLists = widgetEnum.VIEW_TYPES_LIST;
    marqueeDirections = widgetEnum.MARQUEE_DIRECTION;
    widgetTypes = widgetEnum.VIEW_TYPES_WIDGET;
    subscriptionTypes = widgetEnum.SUBSCRIPTION_TYPES_WIDGET;
    textAligment = widgetEnum.TEXT_ALIGMENT;
    widgetCurrencies = widgetEnum.CURRENCIES;
    widgetFor = widgetEnum.ALERT_TYPES;

    constructor(props) {
        super(props);

        this.state = {
            widget: {
                ...new WidgetTopModel(),
                ...this.props.widget
            },
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.widget.widgetId !== this.state.widget.widgetId) {
            this.setState({ widget: { ...nextProps.widget } });
        }
    }

    componentDidMount() {
        const { widget } = this.state;

        if (widget.customTimeFrame) {
            widget.customTimeFrame[0] = moment(widget.customTimeFrame[0])._d;
            widget.customTimeFrame[1] = moment(widget.customTimeFrame[1])._d;
        }

        this.setState({widget});
    }

    onChange = (e) => {
        const { value } = e.target;
        const id = e.target.id.replace(/Slider+$/, '');
        const widget = { ...this.state.widget };

        if (id === 'widgetFor') {
            if (value === 'donate') {
                widget.widgetType = "topDonators";
            } else {
                widget.widgetType = "subscriberCounter";
            }
        }

        widget[id] = value;
        this.setState({ widget });
    };

    onSaveFont = (font, element = 'font') => {
        const widget = this.state.widget;
        widget[element] = font;
        this.setState({ widget });
    };

    onShowUrlLink = () => {
        const widget = this.state.widget;

        widget.showUrl = !widget.showUrl;
        this.setState({ widget });
    };

    onDateTimeChange = (time, element) => {
        const {widget} = this.state;
        widget.customTimeFrame[element] = time;

        this.setState({widget});
    }

    onCopyText = () => {
        const { widget, token } = this.props;
        const url = helpers.buildWidgetUrl(widget.widgetId, token);

        helpers.copyText(url);
    };

    onSwitch = (checked, field) => {
        const widget = this.state.widget;

        widget[field] = checked;

        this.setState({ widget });
    };

    onPreviewWidget = (e, widget, props) => {
        e.preventDefault();
        window.open(`${window.location.origin}/widget/${widget.widgetId}/token/${props.token}/preview`, 'sharer', 'toolbar=0,status=0,width=800,height=800');
    };

    render() {
        const { widget } = this.state;
        const { token, onSave, onCancel, tierRecords, widgetGoalRecords } = this.props;

        return <form onSubmit={(e) => onSave(e, widget)} className="mt-lg-5 ml-lg-3 mr-lg-3 top-widget">
            <h4 className="mb-lg-5 d-flex justify-content-between">
                {`${widget.widgetId ? 'Редагувати' : 'Додати'} віджет`}
                <button className="btn btn-light mr-2"
                    onClick={(e) => onCancel(e)}>
                    Скасувати
                </button>
            </h4>

            <div className="form-group row mb-lg-4">
                <label htmlFor="widgetName" className="col-sm-4 col-form-label">Назва віджету</label>
                <div className="col-sm-6">
                    <input id="widgetName" type="text" className="form-control" required
                        value={widget.widgetName}
                        onChange={(e) => this.onChange(e)} />
                </div>
            </div>

            <div className="form-group row mb-lg-4">
                <label htmlFor="widgetCurrency" className="col-sm-4 col-form-label">Валюта віджету</label>
                <div className="col-sm-5">
                    <select id="widgetCurrency" className="form-control"
                        value={widget.widgetCurrency}
                        onChange={(e) => this.onChange(e)}>
                        {this.widgetCurrencies.map((item, i) =>
                            <option key={item.label} value={item.label}> {item.name} {item.sign} </option>
                        )}
                    </select>
                </div>
            </div>

            <div className="form-group row mb-lg-4">
                <label htmlFor="widgetFor" className="col-sm-4 col-form-label">Віджет для</label>
                <div className="col-sm-5">
                    <select id="widgetFor" className="form-control"
                        value={widget.widgetFor}
                        onChange={(e) => this.onChange(e)}>
                        {this.widgetFor.map((item, i) =>
                            <option key={item.id} value={item.id}> {item.name} </option>
                        )}
                    </select>
                </div>
            </div>

            {widget.widgetType.match(/^(subscriberCounter|subscriberList)$/) && (
                <div className="form-group row mb-lg-4">
                    <label htmlFor="subscription" className="col-sm-4 col-form-label">Рівні підписки</label>
                    <div className="col-sm-5">
                        <select id="subscription" className="form-control"
                            value={widget.subscription}
                            onChange={(e) => this.onChange(e)}>
                            <option key="0" value="all"> Всі підписки </option>
                            {tierRecords.map((item, i) =>
                                <option key={item._id} value={item._id}> {item.tierName} </option>
                            )}
                        </select>
                    </div>
                </div>
            )}

            <div className="form-group row mb-lg-4">
                <label htmlFor="widgetType" className="col-sm-4 col-form-label">Тип віджету</label>
                <div className="col-sm-5">
                    {widget.widgetType.match(/^(subscriberCounter|subscriberList)$/) ? (
                        <select id="widgetType" className="form-control"
                            value={widget.widgetType}
                            onChange={(e) => this.onChange(e)}>
                            {this.subscriptionTypes.map((item, i) =>
                                <option key={item.id} value={item.id}> {item.name} </option>
                            )}
                        </select>
                    ) : (
                        <select id="widgetType" className="form-control"
                            value={widget.widgetType}
                            onChange={(e) => this.onChange(e)}>
                            {this.widgetTypes.map((item, i) =>
                                <option key={item.id} value={item.id}> {item.name} </option>
                            )}
                        </select>
                    )}
                    {widget.widgetType.match(/^(lastTwitchSub|twitchSubs)$/) &&
                        <small id="widgetType" className="form-text text-muted">
                            Вам потрібно бути авторизованим через <strong>Twitch</strong>, щоб користуватися цим віджетом
                        </small>
                    }
                </div>
            </div>

			{widget.widgetType.match(/^(topDonators|donationAmount|lastDonators|topDjYoutube)$/) &&
				(<div className="form-group row mb-lg-4">
					<label htmlFor="specificGoalWidget" className="col-sm-4 col-form-label">
						{Badge()}
						Конкретний збір
					</label>
					<div className="col-sm-2" aria-describedby="specificGoalWidget">
						<Switch id="specificGoalWidget"
							checked={widget.specificGoalWidget}
							onChange={(checked) => this.onSwitch(checked, 'specificGoalWidget')}
							height={24}
							width={45}
							onColor="#3579F6"
							/>
					</div>
				</div>
			)}

			{widget.specificGoalWidget && widget.widgetType.match(/^(topDonators|donationAmount|lastDonators|topDjYoutube)$/) && (
                <div className="form-group row mb-lg-4">
                    <label htmlFor="goalWidgetId" className="col-sm-4 col-form-label">{Badge()}Назва збору</label>
                    <div className="col-sm-5">
                        <select id="goalWidgetId" className="form-control"
                            value={widget.goalWidgetId}
                            onChange={(e) => this.onChange(e)}>
                            <option key="1000" value=""> Оберіть збір </option>
                            {widgetGoalRecords.map((item, i) =>
                                <option key={item.widgetId} value={item.widgetId}> {item.widgetLabel} </option>
                            )}
                        </select>
                    </div>
                </div>
            )}

            {widget.widgetType.match(/^(topDonators|donationAmount|lastDonators|topDjYoutube|subscriberCounter|subscriberList)$/) &&
                <div className="form-group row mb-lg-4">
                    <label htmlFor="viewType" className="col-sm-4 col-form-label">Режим відображення</label>
                    <div className="col-sm-3">
                        <select id="viewType" className="form-control"
                            value={widget.viewType}
                            onChange={(e) => this.onChange(e)}>
                            {this.viewTypes.map((item, i) =>
                                <option key={item.id} value={item.id}> {item.name} </option>
                            )}
                        </select>
                    </div>
                </div>
            }

            {widget.viewType.match(/^(line)$/) &&
                <div className="form-group row mb-lg-4">
                    <label htmlFor="marqueeDirection" className="col-sm-4 col-form-label">Напрям прокручування тексту</label>
                    <div className="col-sm-3">
                        <select id="marqueeDirection" className="form-control"
                            value={widget.marqueeDirection}
                            onChange={(e) => this.onChange(e)}>
                            {this.marqueeDirections.map((item, i) =>
                                <option key={item.id} value={item.id}> {item.name} </option>
                            )}
                        </select>
                    </div>
                </div>
            }

            {widget.viewType.match(/^(list)$/) &&
                <div className="form-group row mb-lg-4">
                    <label htmlFor="viewList" className="col-sm-4 col-form-label">Відображення</label>
                    <div className="col-sm-3">
                        <select id="viewList" className="form-control"
                            value={widget.viewList}
                            onChange={(e) => this.onChange(e)}>
                            {this.viewLists.map((item, i) =>
                                <option key={item.id} value={item.id}> {item.name} </option>
                            )}
                        </select>
                    </div>
                </div>
            }

            {widget.widgetType.match(/^(topDonators|lastDonators|topDjYoutube)$/) && widget.widgetFor !== WIDGET_FOR.SUBSCRIPTION && (
                <div className="form-group row mb-lg-4">
                    <label htmlFor="amountItems" className="col-sm-4 col-form-label">Кількість елементів</label>
                    <div className="col-sm-3">
                        <input id="amountItems" type="number" className="form-control" required
                            value={widget.amountItems}
                            onChange={(e) => this.onChange(e)} />
                    </div>
                </div>
            )}

            {widget.viewType.match(/^(slider)$/) && (
                <div className="form-group row mb-lg-4">
                    <label htmlFor="textAligment" className="col-sm-4 col-form-label">
                        Розташування тексту
                    </label>
                    <div className="col-sm-3">
                        <select id="textAligment" className="form-control"
                            value={widget.textAligment}
                            onChange={(e) => this.onChange(e)}>
                            {this.textAligment.map((item, i) =>
                                <option key={item.id} value={item.id}> {item.name} </option>
                            )}
                        </select>
                    </div>
                </div>
            )}

            {(widget.widgetType.match(/^(topDonators|donationAmount|topDjYoutube)$/)) && widget.widgetFor !== WIDGET_FOR.SUBSCRIPTION &&
                <div className="form-group row mb-lg-4">
                    <label htmlFor="timeFrame" className="col-sm-4 col-form-label">Часовий відрізок</label>
                    <div className="col-sm-3">
                        <select id="timeFrame" className="form-control"
                            value={widget.timeFrame}
                            onChange={(e) => this.onChange(e)}>
                            {this.periods.map((item, i) =>
                                <option key={item.id} value={item.id}> {item.name} </option>
                            )}
                        </select>
                    </div>
                </div>
            }
            {widget.timeFrame === 'custom' && widget.widgetFor !== WIDGET_FOR.SUBSCRIPTION && (
                <div className="form-group row mb-lg-4">
                    <label htmlFor="timeFrame" className="col-sm-4 col-form-label">Часовий відрізок</label>
                    <div className="col-sm-6 time-picker-container">
                        <DatePicker
                            selected={moment(widget.customTimeFrame[0])._d}
                            onChange={(time) => this.onDateTimeChange(time, 0)}
                            showTimeSelect
                            selectsStart
                            startDate={moment(widget.customTimeFrame[0])._d}
                            endDate={moment(widget.customTimeFrame[1])._d}
                            timeIntervals={15}
                            dateFormat="yyyy-MM-dd HH:mm:ss"
                            timeFormat="HH:mm"
                            className="form-control"
                            maxDate={moment(widget.customTimeFrame[1])._d}
                            locale={uk}
                        />
                        <DatePicker
                            selected={moment(widget.customTimeFrame[1])._d}
                            onChange={(time) => this.onDateTimeChange(time, 1)}
                            showTimeSelect
                            selectsStart
                            startDate={moment(widget.customTimeFrame[0])._d}
                            endDate={moment(widget.customTimeFrame[1])._d}
                            timeIntervals={15}
                            dateFormat="yyyy-MM-dd HH:mm:ss"
                            timeFormat="HH:mm"
                            className="form-control"
                            minDate={moment(widget.customTimeFrame[0])._d}
                            locale={uk}
                        />
                    </div>
                </div>
            )}

            {(widget.widgetType.match(/^(topDonators|donationAmount|lastDonators|topDjYoutube|subscriberList)$/)) &&
                <div className="form-group row mb-lg-4">
                    <label htmlFor="textToShow" className="col-sm-4 col-form-label">
                        Текст заголовку
                    </label>
                    <div className="col-sm-5" aria-describedby="showUserText">
                        <input id="textToShow" type="text" className="form-control" required
                            value={widget.textToShow}
                            onChange={this.onChange} />
                        <small id="showUserText" className="form-text text-muted">
                            <div className="mt-2 mb-1">
                                Доступні: <u>{'{user}'}</u> <u>{'{amount}'}</u> <u>{'{currency}'}</u>
                            </div>

                            {(widget.widgetType.match(/^(donationAmount)$/)) &&
                                <div className="mt-2 mb-1">
                                    Для віджету "Зібрана сума" <u>{'{user}'}</u> не потрібен
                                </div>
                            }

                            {(widget.widgetType.match(/^(lastTwitchSub|youtubeSubs|twitchSubs)$/)) &&
                                <div className="mt-2 mb-1">
                                    Для цього типу віджету <u>{'{amount}'}</u> не потрібен
                                </div>
                            }

                        </small>
                    </div>
                </div>
            }

            {widget.widgetType.match(/^(subscriberCounter|subscriberList)$/) && (
                <div className="form-group row mb-lg-4">
                    <label htmlFor="showTierName" className="col-sm-4 col-form-label">
                        Покаузвати Рівень підписки у списку?
                    </label>
                    <div className="col-sm-2" aria-describedby="showTierName">
                        <Switch id="showTierName"
                            checked={widget.showTierName}
                            onChange={(checked) => this.onSwitch(checked, 'showTierName')}
							height={24}
							width={45}
							onColor="#3579F6"
                            />
                    </div>
                </div>
            )}

            {widget.widgetType.match(/^(subscriberCounter|subscriberList)$/) && widget.showTierName &&
                <FontEditor
                    text='Стиль назви підписки'
                    font={widget.fontSubscriptionName}
                    onSaveFont={(font) => this.onSaveFont(font, 'fontSubscriptionName')}
                />
            }

            <FontEditor
                text={`Стиль імені ${widget.widgetFor === WIDGET_FOR.SUBSCRIPTION ? 'глядача' : ''}`}
                font={widget.font}
                onSaveFont={this.onSaveFont}
            />

            <div className="form-group row mb-lg-4">
                <label htmlFor="highlightAmount" className="col-sm-4 col-form-label">
                    Виділити суму
                </label>
                <div className="col-sm-2" aria-describedby="highlightAmount">
                    <Switch id="highlightAmount"
                        checked={widget.highlightAmount}
                        onChange={(checked) => this.onSwitch(checked, 'highlightAmount')}
						height={24}
						width={45}
						onColor="#3579F6"
                        />
                </div>
            </div>

            {widget.highlightAmount &&
                <FontEditor
                    showNewBadge={true}
                    font={widget.fontAmount}
                    onSaveFont={(font) => this.onSaveFont(font, 'fontAmount')}
                    text='Стиль суми'
                />
            }

            {(widget.widgetType.match(/^(topDonators|donationAmount|lastDonators|topDjYoutube|subscriberCounter|subscriberList)$/)) &&
                widget.viewType.match(/^(line|slider)$/) && (
                    <div className="form-group row mb-lg-4">
                        <div className="col-sm-4 col-form-label slide-container">
                            Швидкість скролінгу
                        </div>
                        <div className="col-sm-4 mt-2 mb-3 mb-sm-0">
                            <input id="textSpeedSlider" type="range" min="0" max="10" className="slider"
                                value={widget.textSpeed}
                                onChange={(e) => this.onChange(e)} />
                        </div>
                        <div className="col-sm-2">
                            <div className="input-group">
                                <input id="textSpeed" type="number" className="form-control"
                                    value={widget.textSpeed}
                                    onChange={this.onChange} />
                                <div className="input-group-append">
                                    <span className="input-group-text" id="amount">
                                        сек
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <div className="form-group row mb-lg-4">
                <div className="col-sm-4 col-form-label slide-container">
                    Термін оповіщення
                </div>
                <div className="col-sm-4 mt-2">
                    <input id="timeLengthSlider" type="range" min="0" max="60" className="slider mb-2 mb-sm-1"
                        value={widget.timeLength}
                        onChange={this.onChange} />
                    <small id="urlShow" className="form-text text-muted mb-1">
                        "0" - показувати завжди.
                    </small>
                </div>
                <div className="col-sm-2">
                    <div className="input-group">
                        <input id="timeLength" type="number" className="form-control"
                            value={widget.timeLength}
                            onChange={this.onChange} />
                        <div className="input-group-append">
                            <span className="input-group-text">
                                сек
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-group row mb-lg-4">
                <label className="col-sm-4 col-form-label">Посилання на віджет
                    {widget.widgetId &&
                        <span>
                            <i className={widget.showUrl ? 'fas fa-eye' : 'far fa-eye-slash'}
                                data-toggle="tooltip" data-placement="top"
                                title={!widget.showUrl ? 'Показати' : 'Сховати'}
                                onClick={(e) => this.onShowUrlLink(e)} />
                            <i className="far fa-copy" data-toggle="tooltip" data-placement="top"
                                title="Скопіювати посилання"
                                onClick={(e) => this.onCopyText(e)} />
                        </span>
                    }
                </label>
                <div className="col-sm-6 url">
                    <input id="urlLink" className="p-2 form-control url-link" disabled
                        type="text"
                        value={widget.showUrl ? helpers.buildWidgetUrl(widget.widgetId, token) : "************************"} />
                    <small id="urlShow" className="form-text text-muted">
                        {widget.widgetId ?
                            <div>
                                <div className="mb-1">
                                    * Це посилання можна використовувати в <strong>OBS Studio</strong>.
                                </div>
                                <div className="mb-1">
                                    * Посилання містить ваш секретний токен. Не показуйте його, будь ласка, нікому.
                                </div>
                            </div>
                            :
                            <div className="mb-1">
                                Посилання на віджет для <strong>OBS Studio</strong> буде доступним після збереження.
                            </div>
                        }
                    </small>
                </div>
            </div>

            <WidgetItemSave
                onPreview={(e) => this.onPreviewWidget(e, widget, this.props)}
                onSave={(e) => onSave(e, widget)}
                widgetId={widget.widgetId ? true : false}
                onCancel={onCancel} />
        </form>
    }
}

export default WidgetTop;
