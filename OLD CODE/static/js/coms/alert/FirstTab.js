import React from 'react';
import Switch from 'react-switch';
import {Currency, getCurrencyRate} from '../../enums/PaymentEnums';
import widgetEnum, {WIDGET_FOR} from '../../enums/widgetEnum';
import {stringToNumber} from '../../utils/utils';
import Badge from '../misc/Badge';

const textTransformTypes = widgetEnum.TEXT_TRANSFORM;

const FirstTab = ({ widgetFor, currentConfigWidget, onChange, toggleModal, viewTypes }) => {
  return (
    <>
      <div className="form-group row mb-lg-4" />
      {WIDGET_FOR.DONATE === widgetFor && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="viewType" className="col-sm-4 col-form-label">
            Довільне розташування елементів віджета
          </label>
          <div className="col-sm-5" style={{ margin: "auto", marginLeft: 0 }}>
            <Switch id="showDetails"
              onChange={checked => onChange({ target: { value: checked, id: 'showDetails' } })}
              checked={currentConfigWidget.showDetails}
            />
          </div>
        </div>
      )}

      <div className="form-group row mb-lg-4">
        <label htmlFor="viewType" className="col-sm-4 col-form-label">
          Відображення елементів
        </label>
        <div className="col-sm-5">
          {currentConfigWidget.showDetails ?
            <button className="btn btn-primary mr-2 mr-4"
              onClick={(e) => toggleModal(e, true, 'showModal')}>
              Відкрити деталі
            </button>
            :
            <select id="viewType" className="form-control"
              value={currentConfigWidget.viewType}
              onChange={onChange}>
              {viewTypes.map((item, i) =>
                <option key={item.id} value={item.id}>{item.name}</option>
              )}
            </select>
          }
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <label htmlFor="textToShow" className="col-sm-4 col-form-label">
          Текст заголовку
        </label>
        <div className="col-sm-5" aria-describedby="showUserText">
          <input id="textToShow" type="text" className="form-control" required
            value={currentConfigWidget.textToShow}
            onChange={onChange} />
          <small id="showUserText" className="form-text text-muted">
            <div className="mt-2 mb-1">
              Доступні: <u>{'{user}'}</u> <u>{'{amount}'}</u> <u>{'{currency}'}</u> <u>{WIDGET_FOR.SUBSCRIPTION === widgetFor ? '{tier}' : ''}</u>
              <br></br>
              <strong>наприклад:</strong>
              {` '{user}' ${WIDGET_FOR.SUBSCRIPTION === widgetFor ? 'підписався' : 'задонатив'}
               '{amount}' '{currency}' ${WIDGET_FOR.SUBSCRIPTION === widgetFor ? 'Назва вашої підписки' : ''}`}
            </div>
          </small>
        </div>
      </div>

		{WIDGET_FOR.DONATE === widgetFor && (
			<div className="form-group row mb-lg-4">
				<label htmlFor="textTransform" className="col-sm-4 col-form-label">
					{Badge()}
					Трансформація тексту повідомлення
				</label>
				<div className="col-sm-5" style={{ margin: "auto", marginLeft: 0 }}>
					<select id="textTransform" className="form-control"
						value={currentConfigWidget.textTransform || 'none'}
						onChange={e => onChange(e)}>
						{textTransformTypes.map((item) =>
							<option key={item.id} value={item.id}>{item.name}</option>
						)}
					</select>
				</div>
			</div>
		)}

      <div className="form-group row mb-lg-4">
        <label htmlFor="isSpecificAmount" className="col-sm-4 col-form-label">
          Конкретна сума донату?
        </label>
        <div className="col-sm-5" style={{ margin: "auto", marginLeft: 0 }}>
          <Switch id="isSpecificAmount"
            onChange={checked => onChange({ target: { value: checked, id: 'isSpecificAmount' } })}
            checked={currentConfigWidget.isSpecificAmount}
          />
        </div>
      </div>

      {currentConfigWidget.isSpecificAmount ? (
        <div className="form-group row mb-lg-4">
          <label htmlFor="specificAmount" className="col-sm-4 col-form-label">
            Cума донату для цього віджета
          </label>
          <div className="col col-sm-5">
            <div className="row mb-2">
              <div className="col">
                <div className="input-group">
                  <input id="specificAmount" type="text" className="form-control" required
                    value={currentConfigWidget.specificAmount}
                    onChange={onChange} />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      ₴
                    </span>
                  </div>
                </div>
              </div>
              <div className="col"></div>
            </div>
            <div className="row mb-2">
              <div className="col">
                <div className="input-group">
                  <input id="specificAmount$" type="text" className="form-control" required
                    value={`~${(stringToNumber(currentConfigWidget.specificAmount, 1) / getCurrencyRate(Currency.USD)).toFixed(2)}`}
                    disabled/>
                  <div className="input-group-append">
                    <span className="input-group-text">
                      $
                    </span>
                  </div>
                </div>
              </div>
              <div className="col"></div>
            </div>
            <div className="row">
              <div className="col">
                <div className="input-group">
                  <input id="specificAmount€" type="text" className="form-control" required
                    value={`~${(stringToNumber(currentConfigWidget.specificAmount, 1) / getCurrencyRate(Currency.EUR)).toFixed(2)}`}
                    disabled/>
                  <div className="input-group-append">
                    <span className="input-group-text">
                      €
                    </span>
                  </div>
                </div>
              </div>
              <div className="col"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="form-group row mb-lg-4">
          <label htmlFor="nameWidget" className="col-sm-4 col-form-label">
            Мін / макс сума донату для цього віджета
          </label>
          <div className="col col-sm-5">
            <div className="row mb-2">
              <div className="col">
                <div className="input-group">
                  <input id="minAmount" type="text" className="form-control" required
                    value={currentConfigWidget.minAmount}
                    onChange={onChange} />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      ₴
                    </span>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="input-group">
                  <input id="maxAmount" type="text" className="form-control" required
                    value={currentConfigWidget.maxAmount}
                    onChange={onChange} />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      ₴
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col">
                <div className="input-group">
                  <input id="minAmount" type="text" className="form-control" required
                    value={`~${(stringToNumber(currentConfigWidget.minAmount, 1) / getCurrencyRate(Currency.USD)).toFixed(2)}`}
                    disabled/>
                  <div className="input-group-append">
                    <span className="input-group-text">
                      $
                    </span>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="input-group">
                  <input id="maxAmount" type="text" className="form-control" required
                    value={`~${(stringToNumber(currentConfigWidget.maxAmount, 1) / getCurrencyRate(Currency.USD)).toFixed(2)}`}
                    disabled/>
                  <div className="input-group-append">
                    <span className="input-group-text">
                      $
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <div className="input-group">
                  <input id="minAmount" type="text" className="form-control" required
                    value={`~${(stringToNumber(currentConfigWidget.minAmount, 1) / getCurrencyRate(Currency.EUR)).toFixed(2)}`}
                    disabled/>
                  <div className="input-group-append">
                    <span className="input-group-text">
                      €
                    </span>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="input-group">
                  <input id="maxAmount" type="text" className="form-control" required
                    value={`~${(stringToNumber(currentConfigWidget.maxAmount, 1) / getCurrencyRate(Currency.EUR)).toFixed(2)}`}
                    disabled/>
                  <div className="input-group-append">
                    <span className="input-group-text">
                      €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {WIDGET_FOR.DONATE === widgetFor && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="textLimit" className="col-sm-4 col-form-label">
            Максимальна кількість символів у повідомленні
          </label>
          <div className="col-sm-2" aria-describedby="showUserText">
            <input id="textLimit" type="text" className="form-control"
              value={currentConfigWidget.textLimit}
              onChange={onChange} />
          </div>
        </div>
      )}
    </>
  )
}

export default FirstTab;
