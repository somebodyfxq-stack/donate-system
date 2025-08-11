import React, {useCallback, useEffect, useState} from 'react';
import Switch from 'react-switch';
import {Currency, CurrencyDisplay, getCurrencyRate} from '../../enums/PaymentEnums';
import widgetEnum from '../../enums/widgetEnum';
import FontModel from '../../models/FontModel';
import helpers from '../../utils/helpers';
import {stringToNumber} from '../../utils/utils';
import Badge from '../misc/Badge';
import ColorPicker from '../misc/ColorPicker';
import FontEditor from '../misc/FontEditor';
import WidgetItemSave from './WidgetItemSave';

import '../../css/widgets.css';

const widgetBehaviors = widgetEnum.WIDGET_TYPES_INTERACTION;
// const timer = widgetEnum.TIMER_TYPES_INTERACTION;

const WIDGET_TYPE = {
  ytVideo: '1',
  timer: '2',
  wheelOfFortune: '3',
}

const WidgetInteraction = ({ widget, onSave, onCancel, token, updateWheelWidget, changeGotAmount }) => {
  const [formData, setFormData] = useState({ ...widget });
  const [showUrl, toggleUrlVisibility] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [sectorColors, setSectorColors] = useState('');

  useEffect(() => {
    if (formData.sectorsOfWheel) {
      setSectorColors(formData.sectorsOfWheel.reduce((acc, sector, i) => {
        acc[i] = sector.color;
        return acc;
      }, {}))
    }
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (formData.widgetId === widget.widgetId) return;

    setFormData({ ...formData, ...widget });
  }, [widget])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let refresh = false;
    if (!formData.videoTitleFont) {
      formData.videoTitleFont = new FontModel();
      refresh = true;
    }

    if (!formData.donatorNameFont) {
      formData.donatorNameFont = new FontModel();
      refresh = true;
    }

    if (refresh) {
      setFormData({ ...formData });
    }
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (formData.sectorsOfWheel) {
      const updatedSectors = formData.sectorsOfWheel.map((sector, i) => ({
        ...sector,
        color: sectorColors[i] || sector.color
      }));
      setFormData(prevData => ({
        ...prevData,
        sectorsOfWheel: updatedSectors
      }));
    }
  }, [sectorColors]);// eslint-disable-line react-hooks/exhaustive-deps

  const removeMinMaxAmount = useCallback((i) => {
    const { amounts } = formData;

    amounts.splice(i, 1);

    if (amounts.length === 0) {
      amounts.push({
        minAmount: 100,
        maxAmount: 1000
      })
    }

    setFormData({ ...formData, amounts });
  }, [formData]);

  const setDataAmount = useCallback((e, i, field) => {
    const { amounts } = formData;

    amounts[i][field] = e.target.value;

    setFormData({ ...formData, amounts })
  }, [formData]);

  const addNewRange = useCallback((e) => {
    e.preventDefault()
    const { amounts } = formData;
    let minAmount = 100;
    let maxAmount = 1000;
    let isSpecificAmount = false;
    let specificAmount = 100;

    const lastRange = amounts[amounts.length - 1];

    if (lastRange) {
      minAmount = parseInt(lastRange.maxAmount) + 1;
      maxAmount = parseInt(lastRange.maxAmount) + 1000;
      isSpecificAmount = lastRange.isSpecificAmount;
      specificAmount = parseInt(lastRange.specificAmount) + 100
    }

    amounts.push({ minAmount, maxAmount, isSpecificAmount, specificAmount });

    setFormData({ ...formData, amounts });
  }, [formData]);

  const onCopyText = () => {
    const url = helpers.buildWidgetUrl(widget.widgetId, token);

    helpers.copyText(url);
  };

  const addSector = useCallback((e) => {
    e.preventDefault();
    if (!formData.sectorsOfWheel) formData.sectorsOfWheel = [];
    formData.sectorsOfWheel.push({ color: "#fff", label: "Сектор", percentage: 25 });

    setFormData({ ...formData });
  }, [formData]);

  const removeSector = useCallback((e, i) => {
    e.preventDefault();
    formData.sectorsOfWheel.splice(i, 1);

    setFormData({ ...formData });

    const updatedColors = Object.keys(sectorColors).reduce((acc, key) => {
      const index = parseInt(key, 10);
      if (index !== i) {
        acc[index > i ? index - 1 : index] = sectorColors[key];
      }
      return acc;
    }, {});

    setSectorColors({ ...updatedColors });
  }, [formData, sectorColors]);

  const handleColorChange = useCallback((i, color) => {
    setSectorColors(prevColors => ({
      ...prevColors,
      [i]: color
    }));

    formData.sectorsOfWheel[i].color = sectorColors[i];

    setFormData({ ...formData });
  }, [formData, sectorColors]);

  const renderAmountField = useCallback(({ id, amount, currency }) => {
    return (
      <div className="col">
        <div className="input-group amount-count">
          <input id={id} type="text" className="form-control input-wrapper-left" required
            value={`~${(stringToNumber(amount, 1) / getCurrencyRate(currency)).toFixed(2)}`}
            disabled />
          <div className="input-group-append">
            <span className="input-group-text input-wrapper-right">
              {CurrencyDisplay[currency].sign}
            </span>
          </div>
        </div>
      </div>
    )
  }, [])

  return (
    <form onSubmit={(e) => onSave(e, formData)} className="mt-lg-5 ml-lg-3 mr-lg-3">
      <h4 className="mb-lg-5 d-flex justify-content-between">
        {`${widget.widgetId ? 'Редагувати' : 'Додати'} віджет`}
        <button className="btn btn-light mr-2"
          onClick={(e) => onCancel(e)}>
          Скасувати
        </button>
      </h4>

      <small className="form-text text-muted mb-3">
        Створюєте віджет та налаштовуєте його, у <strong>Сповіщеннях</strong>
        <br></br> у
        вкладці <strong>Елементи віджета</strong> поле <strong>Приєднати інтерактивний віджет </strong>
        добавляєте цей віджет
      </small>

      <div className="form-group row mb-lg-4">
        <label htmlFor="widgetName" className="col-sm-4 col-form-label">Назва віджету</label>
        <div className="col-sm-6">
          <input id="widgetName" type="text" className="form-control"
            onChange={(e) => setFormData({ ...formData, widgetName: e.target.value })}
            value={formData.widgetName}
            required
          />
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <label className="col-sm-4 col-form-label">
          Посилання на віджет
          {widget.widgetId &&
            <span>
              <i className={showUrl ? 'fas fa-eye' : 'far fa-eye-slash'}
                onClick={() => toggleUrlVisibility(!showUrl)}
                data-toggle="tooltip" data-placement="top"
                title={!showUrl ? 'Показати' : 'Сховати'}>
              </i>
              <i className="far fa-copy"
                onClick={(e) => onCopyText(e, widget)}
                data-toggle="tooltip" data-placement="top" title="Скопіювати посилання">
              </i>
            </span>
          }
        </label>
        <div className="col-sm-6 url">
          <input id="urlLink" className="p-2 form-control url-link"
            disabled
            type="text"
            value={showUrl ?
              helpers.buildWidgetUrl(widget.widgetId, token) :
              widget.widgetId ?
                "************************" : ''
            }
          />
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

      <div className="form-group row mb-lg-4">
        <label htmlFor="widgetBehaviour" className="col-sm-4 col-form-label">{Badge()} Який віджет?</label>
        <div className="col-sm-6">
          <select id="widgetBehaviour" className="form-control"
            value={formData.widgetBehaviour}
            onChange={(e) => setFormData({
              ...formData,
              widgetBehaviour: e.target.value,
              donateAmountToMinutes: e.target.value === '2'
            })}>
            {widgetBehaviors.map((item) =>
              <option key={item.id} value={item.id}> {item.name} </option>
            )}
          </select>
        </div>
      </div>

      {/* {formData.widgetBehaviour === WIDGET_TYPE.timer &&
        <div className="form-group row mb-lg-4">
          <label htmlFor="timer" className="col-sm-4 col-form-label">Відлік</label>
          <div className="col-sm-6">
            <select id="timer" className="form-control"
              value={formData.timer}
              onChange={(e) => setFormData({ ...formData, timer: e.target.value })}>
              {timer.map((item) =>
                <option key={item.id} value={item.id}> {item.name} </option>
              )}
            </select>
          </div>
        </div>
      } */}

      {/* <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label slide-container">
          Автоматично показувати віджет?
        </div>
        <div className="col-sm-5">
          <Switch id="approveWidgetAutomatically"
            checked={formData.approveWidgetAutomatically}
            onChange={(approveWidgetAutomatically) => setFormData({ ...formData, approveWidgetAutomatically })} />
        </div>
      </div> */}

      {/* {formData.widgetBehaviour === WIDGET_TYPE.ytVideo &&
        <div className="form-group row mb-lg-4">
          <div className="col-sm-4 col-form-label slide-container">
            Автоматично відтворювати відео?
          </div>
          <div className="col-sm-5">
            <Switch id="autoStartVideo"
              checked={formData.autoStartVideo}
              onChange={(autoStartVideo) => setFormData({ ...formData, autoStartVideo })} />
          </div>
        </div>
      } */}

      {formData.widgetBehaviour === WIDGET_TYPE.timer && (
        <div className="form-group row mb-lg-4">
          <div className="col-sm-4 col-form-label slide-container">
            Донат до хвилин?
          </div>
          <div className="col-sm-5">
            <Switch id="donateAmountToMinutes"
              checked={formData.donateAmountToMinutes}
              onChange={(donateAmountToMinutes) => setFormData({ ...formData, donateAmountToMinutes })} />
          </div>
        </div>
      )}

      {formData.widgetBehaviour !== WIDGET_TYPE.wheelOfFortune && (
        <div className="form-group row mb-lg-4">
          <div className="col col-sm-4 col-form-label slide-container">
            Привязка суми до {formData.donateAmountToMinutes ? 'хвилин' : 'секунд'}
          </div>
          <div className="col-sm-5">
            <Switch id="tieAmountToTime"
              checked={formData.tieAmountToTime}
              onChange={(tieAmountToTime) => setFormData({ ...formData, tieAmountToTime })} />
            {formData.widgetBehaviour === WIDGET_TYPE.timer && !formData.tieAmountToTime && (
              <small id="tierNote" className="form-text text-muted">
                гривня до {formData.donateAmountToMinutes ? 'хвилин' : 'секунд'} - 1:1
              </small>
            )}
          </div>
        </div>
      )}

      {formData.tieAmountToTime && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="amountPerSecond" className="col-sm-4 col-form-label">Сума за {formData.donateAmountToMinutes ? 'хвилину' : 'секунду'}</label>
          <div className="col-sm-3">
            <div className="input-group">
              <input id="amountPerSecond" type="number" className="form-control"
                value={formData.amountPerSecond}
                onChange={(e) => setFormData({ ...formData, amountPerSecond: e.target.value })}
                required
              />
              <div className="input-group-append">
                <span className="input-group-text" id="amount">
                  ₴
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.timer && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="initialTime" className="col-sm-4 col-form-label">Початковий час</label>
          <div className="col-sm-3">
            <div className="input-group">
              <input id="initialTime" type="number" className="form-control"
                value={formData.initialTime}
                onChange={(e) => setFormData({ ...formData, initialTime: e.target.value })}
                required
              />
              <div className="input-group-append">
                <span className="input-group-text" id="amount">
                  {formData.donateAmountToMinutes ? 'хв' : 'сек'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.timer && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="timeReduction2x" className="col-sm-4 col-form-label">
            Зменшити додавання часу в 2x
          </label>
          <div className="col-sm-4">
            <div className="input-group">
              <input id="timeReduction2x" type="number" className="form-control"
                value={formData.timeReduction2x}
                onChange={(e) => setFormData({ ...formData, timeReduction2x: e.target.value })}
              />
              <div className="input-group-append">
                <span className="input-group-text" id="amount">
                  {formData.donateAmountToMinutes ? 'хв' : 'сек'} на таймері
                </span>
              </div>
            </div>
            <small id="tierNote" className="form-text text-muted">
              зменшує додавання часу в таймер після донату великої суми
            </small>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.timer && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="timeReduction4x" className="col-sm-4 col-form-label">
            Зменшити додавання часу в 4x
          </label>
          <div className="col-sm-4">
            <div className="input-group">
              <input id="timeReduction4x" type="number" className="form-control"
                value={formData.timeReduction4x}
                onChange={(e) => setFormData({ ...formData, timeReduction4x: e.target.value })}
              />
              <div className="input-group-append">
                <span className="input-group-text" id="amount">
                  {formData.donateAmountToMinutes ? 'хв' : 'сек'} на таймері
                </span>
              </div>
            </div>
            <small id="tierNote" className="form-text text-muted">
              зменшує додавання часу в таймер після донату великої суми
            </small>
          </div>
        </div>
      )}

      {!formData.tieAmountToTime && formData.widgetBehaviour === WIDGET_TYPE.ytVideo && (
        <div className="form-group row mb-lg-4">
          <div className="col col-sm-4 col-form-label slide-container">
            Максимальний час відео (у хвилинах)
          </div>
          <div className="col-sm-5 mt-2 mb-3 mb-sm-0">
            <input id="videoTimeLimitSlider" type="range" min="1" max="20" className="slider"
              value={formData.videoTimeLimit}
              onChange={(e) => setFormData({ ...formData, videoTimeLimit: e.target.value })} />
          </div>
          <div className="col-sm-2">
            <div className="input-group">
              <input id="videoTimeLimit" type="number" className="form-control"
                value={formData.videoTimeLimit}
                onChange={(e) => setFormData({ ...formData, videoTimeLimit: e.target.value })} />
              <div className="input-group-append">
                <span className="input-group-text">
                  <i className="fa-solid fa-stopwatch"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.timer &&
        <FontEditor
          font={formData.fontCounter}
          element='fontCounter'
          onSaveFont={(fontCounter) => setFormData({ ...formData, fontCounter })}
          text='Стиль відліку'
          widget='GOAL'
        />
      }

      {formData.widgetBehaviour === WIDGET_TYPE.ytVideo && (
        <>
          <div className="form-group row mb-lg-4">
            <div className="col-sm-4 col-form-label slide-container">
              Гучність
            </div>
            <div className="col-sm-5 mt-2 mb-3 mb-sm-0">
              <input id="volumeSlider" type="range" min="1" max="10" className="slider"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })} />
            </div>
            <div className="col-sm-2">
              <div className="input-group">
                <input id="volume" type="number" className="form-control"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })} />
                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="fa fa-volume-up" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group row mb-lg-4">
            <div className="col col-sm-4 col-form-label slide-container">
              Відображати назву кліпу?
            </div>
            <div className="col-sm-2">
              <Switch id="showVideoTitle"
                checked={formData.showVideoTitle}
                onChange={(showVideoTitle) => setFormData({ ...formData, showVideoTitle })}
              />
            </div>
            {formData.showVideoTitle && (
              <div className="col-sm-4">
                <FontEditor
                  font={formData.videoTitleFont}
                  hideLabel="true"
                  buttonLabelStyle={{
                    button: 10,
                  }}
                  onSaveFont={(videoTitleFont) => setFormData({ ...formData, videoTitleFont })}
                />
              </div>
            )}
          </div>

          <div className="form-group row mb-lg-4">
            <div className="col col-sm-4 col-form-label slide-container">
              Відображати імя донатера?
            </div>
            <div className="col-sm-2">
              <Switch id="showDonatorName"
                checked={formData.showDonatorName}
                onChange={(showDonatorName) => setFormData({ ...formData, showDonatorName })}
              />
            </div>
            {formData.showDonatorName && (
              <div className="col-sm-4">
                <FontEditor
                  font={formData.donatorNameFont}
                  hideLabel="true"
                  buttonLabelStyle={{
                    button: 10,
                  }}
                  onSaveFont={(donatorNameFont) => setFormData({ ...formData, donatorNameFont })}
                />
              </div>
            )}
          </div>

          <div className="form-group row mb-lg-4">
            <label htmlFor="minVideoLikes" className="col-sm-4 col-form-label">Мінімум лайків</label>
            <div className="col-sm-3">
              <input id="minVideoLikes" type="text" className="form-control"
                onChange={(e) => setFormData({ ...formData, minVideoLikes: e.target.value })}
                value={formData.minVideoLikes}
                required
              />
            </div>
          </div>

          <div className="form-group row mb-lg-4">
            <label htmlFor="minVideoViews" className="col-sm-4 col-form-label">Мінімум переглядів</label>
            <div className="col-sm-3">
              <input id="minVideoViews" type="text" className="form-control"
                onChange={(e) => setFormData({ ...formData, minVideoViews: e.target.value })}
                value={formData.minVideoViews}
                required
              />
            </div>
          </div>

          <div className="form-group row mb-lg-4">
            <label htmlFor="minVideoComments" className="col-sm-4 col-form-label">Мінімум коментарів</label>
            <div className="col-sm-3">
              <input id="minVideoComments" type="text" className="form-control"
                onChange={(e) => setFormData({ ...formData, minVideoComments: e.target.value })}
                value={formData.minVideoComments}
                required
              />
            </div>
          </div>
        </>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.ytVideo && (
        <div className="form-group row mb-lg-4">
          <div className="col col-sm-4 col-form-label slide-container">
            Відображати новий донат одразу?
          </div>
          <div className="col-sm-7">
            <Switch id="showDonateImmediately"
              checked={formData.showDonateImmediately}
              onChange={(showDonateImmediately) => setFormData({ ...formData, showDonateImmediately })} />
            <small id="urlShow" className="form-text text-muted">
              <div className="mb-1">
                * відображати отриманий донат не чекаючи закінчення відео.
              </div>
            </small>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.wheelOfFortune && (
        <div className="form-group row mb-lg-4">
          <div className="col col-sm-4 col-form-label slide-container">
            {Badge()}
            Зачитати текст вголос?
          </div>
          <div className="col-sm-7">
            <Switch id="readText"
              checked={formData.readText}
              onChange={(readText) => setFormData({ ...formData, readText })} />
            <small id="urlShow" className="form-text text-muted">
              <div className="mb-1">
                * текст буде зачитано після зупинки колеса
              </div>
            </small>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.wheelOfFortune && formData.readText && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="textToShow" className="col-sm-4 col-form-label">
            {Badge()}
            Текст після закінчення обертання
          </label>
          <div className="col-sm-6">
            <input id="textToShow" type="text" className="form-control" maxLength="50"
              onChange={(e) => setFormData({ ...formData, textToShow: e.target.value })}
              value={formData.textToShow}
              required
            />
            <small id="urlShow" className="form-text text-muted">
              <div className="mb-1">
                * Доступні: <u>{'{winner}'}</u>
              </div>
            </small>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.wheelOfFortune &&
        <div className="form-group row mb-lg-4">
          <label htmlFor="sectorColors" className="col-sm-4 col-form-label">Сектори</label>
          <div className="col-sm-6">
            <div className="d-flex align-items-center justify-content-around mb-2">
              <small className="form-text text-muted">назва сектора</small>
              <small className="form-text text-muted">ймовірність</small>
            </div>
            {formData.sectorsOfWheel?.map((sector, i) => (
              <div key={i} className="d-flex align-items-center mb-2">
                <ColorPicker
                  color={sectorColors[i] || sector.color}
                  onChange={(color) => handleColorChange(i, color)}
                />
                <input
                  type="text"
                  className="form-control ml-2"
                  value={sector.label}
                  placeholder={`Сектор${i + 1}`}
                  onChange={(e) => {
                    const updatedSectors = [...formData.sectorsOfWheel];
                    updatedSectors[i].label = e.target.value;
                    setFormData({ ...formData, sectorsOfWheel: updatedSectors });
                  }}
                />
                <input
                  type="number"
                  style={{ maxWidth: '70px' }}
                  className="form-control ml-2"
                  value={sector.percentage}
                  placeholder="20"
                  onChange={(e) => {
                    const updatedSectors = [...formData.sectorsOfWheel];
                    updatedSectors[i].percentage = e.target.value;
                    setFormData({ ...formData, sectorsOfWheel: updatedSectors });
                  }}
                />
                {formData.sectorsOfWheel?.length > 2 && (
                  <div className="input-tools mr-0">
                    <i
                      className="fa-regular fa-trash-can"
                      onClick={(e) => removeSector(e, i)}
                      title="Видалити"
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              disabled={formData.sectorsOfWheel?.length > 14}
              className="btn btn-outline-dark justify-content-between mt-2"
              title="Додати сектор"
              onClick={addSector}
            >
              <span>Додати сектор</span>
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      }

      {formData.widgetBehaviour === WIDGET_TYPE.wheelOfFortune && (
        <div className="form-group row mb-lg-4">
          <div className="col col-sm-4 col-form-label slide-container">
            {Badge()}
            Запуск від певної суми?
          </div>
          <div className="col-sm-7">
            <Switch id="startFromAmount"
              checked={formData.startFromAmount}
              onChange={(startFromAmount) => setFormData({ ...formData, startFromAmount })} />
            <small id="urlShow" className="form-text text-muted">
              <div className="mb-1">
                * колесо вибору запуститься після отримання певної суми
              </div>
            </small>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.wheelOfFortune && formData.startFromAmount && (
        <FontEditor
          font={formData.fontCounter}
          element='fontCounter'
          onSaveFont={(fontCounter) => setFormData({ ...formData, fontCounter })}
          widget='GOAL'
          buttonLabelStyle={{
            button: 4,
          }}
        />
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.wheelOfFortune && formData.startFromAmount && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="textToDisplay" className="col-sm-4 col-form-label">
            {Badge()}
            Текст
          </label>
          <div className="col-sm-6">
            <input id="textToDisplay" type="text" className="form-control" maxLength="50"
              onChange={(e) => setFormData({ ...formData, textToDisplay: e.target.value })}
              value={formData.textToDisplay}
              required
            />
            <small id="urlShow" className="form-text text-muted">
              <div className="mb-1">
                * Доступні: <u>{'{got}'}</u> <u>{'{amount}'}</u> <u>{'{currency}'}</u>
              </div>
            </small>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.wheelOfFortune && formData.startFromAmount && (
        <div className="form-group row mb-lg-4">
          <div className="col col-sm-4 col-form-label">
            {Badge()}
            Запуск від суми
          </div>
          <div className="col-sm-5">
            <div className="row mb-2">
              <div className="col">
                <div className="input-group amount-count">
                  <input id="amount" type="text" className="form-control input-wrapper-left" required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                  <div className="vertical-line-wrapper">
                    <div className="vertical-line"></div>
                  </div>
                  <div className="input-group-append">
                    <span className="input-group-text input-wrapper-right">
                      ₴
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              {renderAmountField({ id: 'amount', amount: formData.amount, currency: Currency.USD })}
            </div>
            <div className="row mb-3">
              {renderAmountField({ id: 'amount', amount: formData.amount, currency: Currency.EUR })}
            </div>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.wheelOfFortune && formData.startFromAmount && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="newAmount" className="col-sm-4 col-form-label">
            {Badge()}
            Зміна отриманої суми у колесі вибору
          </label>
          <div className="col-sm-2">
            <input id="newAmount" type="text" className="form-control" maxLength="50"
              onChange={(e) => setNewAmount(e.target.value)}
              value={newAmount}
            />
          </div>
          <div className="col-sm-4">
            <button
              className="btn btn-outline-dark justify-content-between"
              title="Відправити у віджет"
              onClick={(e) => changeGotAmount(e, newAmount)}
            >
              Відправити у віджет
            </button>
            <small id="urlShow" className="form-text text-muted">
              <div className="mb-1">
                * виправляє отриману суму у колесі вибору.
              </div>
            </small>
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.wheelOfFortune && formData.amounts && !formData.startFromAmount && (
        <div className="form-group row mb-lg-4 pt-3">
          <label htmlFor="form-group" className="col-sm-4 col-form-label">Мінімальна і максимальна сума донату</label>
          <div className="col-sm-6">
            {formData.amounts.map((item, i) =>
              <div key={i} className="page-view-item-description mt-3 mt-sm-0 mb-2">
                <div className="form-group row mb-lg-4">
                  <label htmlFor="isSpecificAmount" className="col-sm-7 col-form-label">
                    Конкретна сума донату?
                  </label>
                  <div className="col-sm-5" style={{ margin: "auto", marginLeft: 0 }}>
                    <Switch id="isSpecificAmount"
                      onChange={(checked) => setDataAmount({ target: { value: checked } }, i, 'isSpecificAmount')}
                      checked={item.isSpecificAmount}
                    />
                  </div>
                </div>
                <div className='row'>
                  <div className='col-10'>
                    <div className="row mb-2">
                      {item.isSpecificAmount ?
                        <div className="col">
                          <div className="input-group amount-count">
                            <input id="specificAmount" type="text" className="form-control input-wrapper-left" required
                              value={item.specificAmount}
                              onChange={(e) => setDataAmount(e, i, 'specificAmount')}
                            />
                            <div className="vertical-line-wrapper">
                              <div className="vertical-line"></div>
                            </div>
                            <div className="input-group-append">
                              <span className="input-group-text input-wrapper-right">
                                ₴
                              </span>
                            </div>
                          </div>
                        </div>
                        :
                        <>
                          <div className="col">
                            <div className="input-group amount-count">
                              <input id="minAmount" type="text" className="form-control input-wrapper-left" required
                                value={item.minAmount}
                                onChange={(e) => setDataAmount(e, i, 'minAmount')}
                              />
                              <div className="vertical-line-wrapper">
                                <div className="vertical-line"></div>
                              </div>
                              <div className="input-group-append">
                                <span className="input-group-text input-wrapper-right">
                                  ₴
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="col">
                            <div className="input-group amount-count">
                              <input id="maxAmount" type="text" className="form-control input-wrapper-left" required
                                value={item.maxAmount}
                                onChange={(e) => setDataAmount(e, i, 'maxAmount')} />
                              <div className="vertical-line-wrapper">
                                <div className="vertical-line"></div>
                              </div>
                              <div className="input-group-append">
                                <span className="input-group-text input-wrapper-right">
                                  ₴
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      }
                    </div>

                    {item.isSpecificAmount ?
                      <>
                        <div className="row mb-2">
                          {renderAmountField({ id: 'specificAmount', amount: item.specificAmount, currency: Currency.USD })}
                        </div>
                        <div className="row mb-3">
                          {renderAmountField({ id: 'specificAmount', amount: item.specificAmount, currency: Currency.EUR })}
                        </div>
                      </>
                      :
                      <>
                        <div className="row mb-2">
                          {renderAmountField({ id: 'minAmount', amount: item.minAmount, currency: Currency.USD })}
                          {renderAmountField({ id: 'maxAmount', amount: item.maxAmount, currency: Currency.USD })}
                        </div>
                        <div className="row mb-3">
                          {renderAmountField({ id: 'minAmount', amount: item.minAmount, currency: Currency.EUR })}
                          {renderAmountField({ id: 'maxAmount', amount: item.maxAmount, currency: Currency.EUR })}
                        </div>
                      </>
                    }
                  </div>
                  <div className='col-2'>
                    <div className='amount-group'>
                      <div className="input-tools pl-0">
                        <i
                          className="fa-regular fa-trash-can"
                          title="Видалити"
                          onClick={() => removeMinMaxAmount(i)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {formData.amounts && formData.amounts.length < 10 &&
              <div className={`d-flex ${formData.amounts.length === 0 && 'justify-content-start justify-content-md-end'}`} >
                <button
                  className="btn btn-outline-dark justify-content-between"
                  title="Додати проміжок"
                  onClick={(e) => addNewRange(e)}
                >
                  <span>Додати проміжок</span>
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            }
          </div>
        </div>
      )}

      {formData.widgetBehaviour === WIDGET_TYPE.wheelOfFortune &&
        <div className="form-group row mb-lg-4 pt-3">
          <label htmlFor="" className="col-sm-4 col-form-label"></label>
          <div className="col-sm-6">
            <button
              className="btn btn-outline-dark justify-content-between mt-5"
              title="Тестовий запуск"
              onClick={updateWheelWidget}
            >
              <span>Тестовий запуск</span>
            </button>
          </div>
        </div>
      }

      <WidgetItemSave
        hidePreviewButton={true}
        widgetId={widget.widgetId ? true : false}
        onCancel={onCancel} />
    </form>
  )
}

export default WidgetInteraction;
