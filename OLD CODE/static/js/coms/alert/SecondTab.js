import React from 'react';
import Switch from 'react-switch';
import {isUserVerifiedStatus} from '../../enums/UserStatus';

import widgetEnum, {WIDGET_FOR} from '../../enums/widgetEnum';
import Badge from '../misc/Badge';
import VoiceSelection from './VoiceSelection';

const LANGUAGES = widgetEnum.LANGUAGES_TYPES;

const SecondTab = ({
  widgetFor,
  currentConfigWidget,
  toggleModal,
  onChange,
  onRemoveElement,
  onNewAnimation,
  onRemoveAnimationRow,
  interactionWidgets,
  status
}) => {

  return (
    <>
      <div className="form-group row mb-lg-4" />
      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label slide-container">
          Термін відображення відео/анімації та тексту
        </div>
        <div className="col-sm-5 mt-2">
          <input id="timeLengthSlider" type="range" min="1" max="60" className="slider mb-2 mb-sm-0"
            value={currentConfigWidget.timeLength}
            onChange={onChange} />
        </div>
        <div className="col-sm-2">
          <div className="input-group">
            <input id="timeLength" type="number" className="form-control"
              value={currentConfigWidget.timeLength}
              onChange={onChange} />
            <div className="input-group-append">
              <span className="input-group-text">
                сек
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label slide-container">
          Гучність мелодії
        </div>
        <div className="col-sm-5 mt-2 mb-3 mb-sm-0">
          <input id="loudnessSlider" type="range" min="1" max="10" className="slider"
            value={currentConfigWidget.loudness}
            onChange={onChange} />
        </div>
        <div className="col-sm-2">
          <div className="input-group">
            <input id="loudness" type="number" className="form-control"
              value={currentConfigWidget.loudness}
              onChange={onChange} />
            <div className="input-group-append">
              <span className="input-group-text">
                <i className="fa fa-volume-up" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <label htmlFor="stopSoundWithAlert" className="col-9 col-sm-4 col-form-label">
          Зупинити Звук/Музику віджета зі сповіщенням
        </label>
        <div className="col-3 col-sm-7 col-form-label">
          <div className="checkbox-container">
            <Switch id="stopSoundWithAlert"
              checked={currentConfigWidget.stopSoundWithAlert || false}
              onChange={(checked) => onChange({ target: { value: checked, id: 'stopSoundWithAlert' } })} />
          </div>
          <small id="allowVoice" className="form-text text-muted mt-0">
            <div className="mb-1">
              Звук/Музика віджета зупинеться одразу зі зникненням сповіщення. (повязане зі <strong>Термін відображення анімації та тексту</strong>)
            </div>
          </small>
        </div>
      </div>

      {WIDGET_FOR.DONATE === widgetFor && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="allowVoiceRecord" className="col-9 col-sm-4 col-form-label">
            {Badge()}
            Дозволити голосове сповіщення
          </label>
          <div className="col-3 col-sm-7 col-form-label">
            <Switch id="allowVoiceRecord"
              checked={currentConfigWidget.allowVoiceRecord || false}
              onChange={(checked) => onChange({ target: { value: checked, id: 'allowVoiceRecord' } })} />
          </div>
		  <div className='col-sm-4'></div>
		  <div className='col-sm-7'>
		  	<small id="allowVoice" className="form-text text-muted mt-0">
              <div className="mb-1">
                Глядач зможе записувати <strong>голосове сповіщення</strong> разом з донатом.
              </div>
            </small>
		  </div>
        </div>
      )}

      {WIDGET_FOR.DONATE === widgetFor && (
        <div className="form-group row mb-lg-4">
          <div className="col col-sm-4 col-form-label slide-container">
            Дозволити вибір медіа
          </div>
          <div className="col-sm-7">
            <div className='d-flex justify-content-between'>
				<Switch id="allowUserSelectMedia"
					className="switch-media mr-2"
					checked={currentConfigWidget.allowUserSelectMedia || false}
					onChange={(checked) => onChange({ target: { value: checked, id: 'allowUserSelectMedia' } })} />

				<button
					disabled={!currentConfigWidget.allowUserSelectMedia}
					className="btn btn-primary"
					onClick={(e) => toggleModal(e, true, 'showMediaSelectionModal', null, 'multiselect')}>
					Відкрити список
				</button>
			</div>

            <small id="urlShow" className="form-text text-muted">
              <div className="mb-1 mt-3">
                Глядач зможе вибирати медіа для донату. Залежить від <strong>мінімальної</strong> і <strong>максимальної</strong>
                 суми донату для даного віджета.
              </div>
              <div className="mb-1">
                Виберіть у списку <strong>відео, анімації та звуки</strong>, які будуть доступні для глядача.
              </div>
            </small>
          </div>
        </div>
      )}

      {WIDGET_FOR.DONATE === widgetFor && (
        <div className="form-group row mb-lg-4">
          <div className="col-9 col-sm-4 col-form-label slide-container">
            {Badge()}
            Дозволити глядачам вибирати анімації з <strong>Tenor</strong>?
          </div>
          <div className="col-3 col-sm-5 col-form-label">
            <Switch id="tenorAnimationAllowed"
              className="switch-media"
              disabled={!currentConfigWidget.allowUserSelectMedia}
              checked={currentConfigWidget.tenorAnimationAllowed || false}
              onChange={(checked) => onChange({ target: { value: checked, id: 'tenorAnimationAllowed' } })} />
          </div>
		  <div className='col-sm-4'></div>
		  <div className='col-sm-7'>
		  	<small id="urlShow" className="form-text text-muted mt-0">
              <div className="mb-1">
			  	Глядач зможе шукати і вибирати анімації з бібліотеки анімацій <strong>Tenor</strong>.
              </div>
            </small>
		  </div>
        </div>
      )}

      {WIDGET_FOR.DONATE === widgetFor && (
        <div className="form-group row mb-lg-4">
          <label htmlFor="interactionWidgetId" className="col-sm-4 col-form-label">
            Приєднати інтерактивний віджет
          </label>
          <div className="col-sm-5">
            <select id="interactionWidgetId" className="form-control"
              disabled={interactionWidgets.length === 0}
              value={currentConfigWidget.interactionWidgetId}
              onChange={onChange}>
              <option key={1000} value="">Нічого не вибрано</option>
              {interactionWidgets.map((item, i) =>
                <option key={item.widgetId} value={item.widgetId}> {item.widgetName} </option>
              )}
            </select>
            <small className="form-text text-muted">
              {interactionWidgets.length === 0 && (
                <div className="mb-1 text-warning">
                  Спочатку створіть <strong>Інтерактивний віджет</strong>
                </div>
              )}
              <div className="mb-1">
                Глядач зможе замовляти <strong>відео YouTube</strong>.
              </div>
            </small>
          </div>
        </div>
      )}

      <div className="form-group row mb-lg-4">
        <label htmlFor="animation" className="col-sm-4 col-form-label">
          Анімація і Звуки
        </label>
        <div className="col-sm-7">
          {currentConfigWidget.animationSettings.map((item, i) => (
            <div className={`alert alert-secondary animation-row-item ${i === currentConfigWidget.animationSettings.length - 1 ? 'show' : ''}`} key={i}>
              <div className="">
                <div className="media-container-select"
                  onClick={(e) => toggleModal(e, true, 'showMediaSelectionModal', i, 'selected', {
                    ...item,
                    images: true
                  }, 'images')}>
                  {item.fileType && item.fileType.indexOf('video') >= 0 ?
                    <video width="122" height="75">
                      <source src={item.selectedAnimationPath} />
                    </video>
                    :
                    <img id="animation" alt="" onChange={onChange}
                      src={item.selectedAnimationPath}
                      className="animation" />
                  }
                </div>
                <div className="delete-item-button" onClick={() => onRemoveElement(i, 'images')}>
                  <i className="fas fa-trash-alt"></i>
                </div>
              </div>

              <div className="">
                <div className="media-container-select"
                  onClick={(e) => toggleModal(e, true, 'showMediaSelectionModal', i, 'selected', {
                    ...item,
                    sounds: true
                  }, 'sounds')}>
                  <div>{item.soundName || 'Вибрати звук'}</div>
                  {/* item.selectedSoundPath && getSound(item.selectedSoundPath)*/}
                </div>
                <div className="delete-item-button" onClick={() => onRemoveElement(i, 'sounds')}>
                  <i className="fas fa-trash-alt"></i>
                </div>
              </div>

              <div className="">
                <i className="ml-2 fas vertical-alligment fa-plus-circle"
                  onClick={() => onNewAnimation()} />
                <i className="ml-2 fas vertical-alligment fa-trash-alt"
                  onClick={() => onRemoveAnimationRow(i)} />
              </div>
            </div>
          ))}
          <small className="form-text text-muted">
            <div className="mt-2 mb-1">
              Музика у віджеті <strong>не буде програватися</strong>, якщо вибране відео.
            </div>
          </small>
        </div>
      </div>

      {currentConfigWidget.animationSettings.length > 1 &&
        <div className="form-group row mb-lg-4">
          <label htmlFor="isRandom" className="col-9 col-sm-4 col-form-label">
            Рендом
          </label>
          <div className="col-3 col-sm-7 col-form-label">
            <div className="checkbox-container">
              <Switch id="isRandom"
                checked={currentConfigWidget.isRandom || false}
                onChange={(checked) => onChange({ target: { value: checked, id: 'isRandom' } })} />
            </div>
          </div>
		  <div className='col-sm-4'></div>
		  <div className='col-sm-7'>
		  	<small id="showUserText" className="form-text text-muted mt-0">
              <div className="mb-1">
			  	<strong>Рендомне відображення</strong> віджетів, доданих вище.
              </div>
            </small>
		  </div>
        </div>
      }

      {WIDGET_FOR.DONATE === widgetFor && (
        <>
          <div className="form-group row mb-lg-4">
            <label htmlFor="readingHeaderText" className="col-9 col-sm-4 col-form-label">
              Читати заголовок
            </label>
            <div className="col-3 col-sm-7 col-form-label">
              <div className="checkbox-container">
                <Switch id="readingHeaderText"
                  checked={currentConfigWidget.readingHeaderText || false}
                  onChange={(checked) => onChange({ target: { value: checked, id: 'readingHeaderText' } })} />
              </div>
            </div>
          </div>

          <div className="form-group row mb-lg-4">
            <label htmlFor="isReadingText" className="col-9 col-sm-4 col-form-label">
              Читати повідомлення
            </label>
            <div className="col-3 col-sm-7 col-form-label">
              <div className="checkbox-container">
                <Switch id="isReadingText"
                  checked={currentConfigWidget.isReadingText || false}
                  onChange={(checked) => onChange({ target: { value: checked, id: 'isReadingText' } })} />
              </div>
            </div>
          </div>

          <div className="form-group row mb-lg-4">
            <label htmlFor="isTextVolumeSeparated" className="col-9 col-sm-4 col-form-label">
              Розділити гучність тексту та мелодії
            </label>
            <div className="col-3 col-sm-7 col-form-label">
              <div className="checkbox-container">
                <Switch id="isTextVolumeSeparated"
                  checked={currentConfigWidget.isTextVolumeSeparated || false}
                  onChange={(checked) => onChange({ target: { value: checked, id: 'isTextVolumeSeparated' } })} />
              </div>
            </div>
          </div>

          {currentConfigWidget.isTextVolumeSeparated && (
            <div className="form-group row mb-lg-4">
              <div className="col-12 col-sm-4 col-form-label slide-container">
                Гучність тексту
              </div>
              <div className="col-12 col-sm-5 mt-2 mb-3 mb-sm-0">
                <input id="textLoudness" type="range" min="1" max="10" className="slider"
                  value={currentConfigWidget.textLoudness}
                  onChange={onChange} />
              </div>
              <div className="col-12 col-sm-3 col-lg-2">
                <div className="input-group">
                  <input id="textLoudness" type="number" className="form-control"
                    value={currentConfigWidget.textLoudness}
                    onChange={onChange} />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      <i className="fa fa-volume-up" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-group row mb-lg-4">
            <label htmlFor="userLanguageTTS" className="col-9 col-sm-4 col-form-label">
              {Badge()}
              Дозволити глядачам вибрати голос читання повідомлення
            </label>
            <div className="col-3 col-sm-7 col-form-label">
              <div className="checkbox-container">
                <Switch id="userLanguageTTS"
                  disabled={!isUserVerifiedStatus(status)}
                  checked={currentConfigWidget.userLanguageTTS || false}
                  onChange={(checked) => onChange({ target: { value: checked, id: 'userLanguageTTS' } })} />
              </div>
            </div>
          </div>

          <div className="form-group row mb-lg-4">
            <label htmlFor="languageTTS" className="col-sm-4 col-form-label">
              {Badge()}
              Голос читання тексту
            </label>
            <div className="col-sm-5">
			  <VoiceSelection
				languageTTS={currentConfigWidget.languageTTS || LANGUAGES[0].voiceID}
				languages={LANGUAGES}
				onChange={onChange}
				isUserVerifiedStatus={isUserVerifiedStatus(status)}
			  />
              <small className="form-text text-muted">
                <div className="mt-2 mb-1">
                  <strong>Голоси AI</strong> доступні для верифікованих статусів.
                </div>
              </small>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default SecondTab;
