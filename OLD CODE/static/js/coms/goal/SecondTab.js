import React, {useState} from 'react';
import {SketchPicker} from 'react-color';
// import Badge from '../../components/Badge';
import Switch from 'react-switch';
import Badge from '../misc/Badge';
import FontEditor from '../misc/FontEditor';
import {Modal} from '../modal/Modal';

const SecondTab = ({
  widget,
  onSaveFont,
  onChange,
  onSwitchChange,
  onShowPicker,
  onChangeColor,
  animationOptions,
  onShowGradientPicker,
  onCloseGradientPicker,
  onChangeGradientColor,
  onRemoveGradientPicker,
  addNewGradient,
  addRandomGradient,
  onClosePicker,
  showColorBorderPicker,
  styles,
  colorText,
  showGradientPickers,
  showColorPicker,
  showColorFontPicker,
  showColorFontNumbersPicker,
  saveSelectedMedia,
  onRemoveElement,
}) => {
  const [visible, setModalVisible] = useState(false);

  return (
    <>
      <div className="form-group row mb-lg-4"></div>
      <div className="form-group row mb-lg-4">
        <label htmlFor="viewType" className="col-sm-4 col-form-label">
          Розвернути віджет на 90*
        </label>
        <div className="col-sm-4">
          <Switch id="isActive"
            onChange={(checked) => onSwitchChange(checked, 'isNinetyDegree')}
            checked={widget.isNinetyDegree}
          />
        </div>
      </div>
      <FontEditor
        font={colorText}
        element={'colorText'}
        onSaveFont={onSaveFont}
        text='Стиль тексту'
        widget='GOAL'
        onChange={onChange}
        textAnimation={widget.textAnimation}
      />
      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label slide-container">
          {`${widget.isNinetyDegree ? 'Ширина' : 'Висота'} віджета`}
        </div>
        <div className="col-sm-4 mt-2 mb-3 mb-sm-0">
          <input id="height" className="slider" type="range" min="0" max={widget.isNinetyDegree ? "800" : "200"}
            value={widget.height}
            onChange={onChange} />
        </div>
        <div className="col-sm-2">
          <div className="input-group">
            <input id="height" type="number" className="form-control"
              value={widget.height}
              onChange={onChange} />
            <div className="input-group-append">
              <span className="input-group-text" id="amount">
                px
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label slide-container">
          Радіус краю
        </div>
        <div className="col-sm-4 mt-2 mb-3 mb-sm-0">
          <input id="borderRadius" className="slider" type="range" min="0" max={parseInt(widget.height / 2)}
            value={widget.borderRadius}
            onChange={onChange} />
        </div>
        <div className="col-sm-2">
          <div className="input-group">
            <input id="borderRadius" type="number" className="form-control"
              value={widget.borderRadius}
              onChange={onChange} />
            <div className="input-group-append">
              <span className="input-group-text" id="amount">
                px
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label slide-container">
          Ширина краю
        </div>
        <div className="col-sm-4 mt-2 mb-3 mb-sm-0">
          <input id="borderWidth" className="slider" type="range" min="0" max="10"
            value={widget.borderWidth}
            onChange={onChange} />
        </div>
        <div className="col-sm-2">
          <div className="input-group">
            <input id="borderWidth" type="number" className="form-control"
              value={widget.borderWidth}
              onChange={onChange} />
            <div className="input-group-append">
              <span className="input-group-text" id="amount">
                px
              </span>
            </div>
          </div>
        </div>
      </div>

	  <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label slide-container">
          {Badge()}
          Радіус полоски заповнення
        </div>
        <div className="col-sm-4 mt-2 mb-3 mb-sm-0">
          <input id="gotAmountBorderRadius" className="slider" type="range" min="0" max={parseInt((widget.height - widget.borderWidth * 2) / 2)}
            value={widget.gotAmountBorderRadius}
            onChange={onChange} />
		  <small className="form-text text-muted" style={{marginTop: '38px'}}>
			якщо радіус більше <strong>0px</strong>, то прозорою смугу отриманих донатів зробити неможливо
          </small>
        </div>
        <div className="col-sm-2">
          <div className="input-group">
            <input id="gotAmountBorderRadius" type="number" className="form-control"
              value={widget.gotAmountBorderRadius}
              onChange={onChange} />
            <div className="input-group-append">
              <span className="input-group-text" id="amount">
                px
              </span>
            </div>
          </div>
        </div>
      </div>

      {widget.borderWidth > 0 &&
        <div className="form-group row mb-lg-4">
          <div className="col-sm-4 col-form-label">
            Колір краю
          </div>
          <div className="col-sm-3">
            <div style={styles.swatch} onClick={() => onShowPicker('colorBorder')}>
              <div style={styles.colorBorder} />
            </div>
            {showColorBorderPicker &&
              <div style={styles.popover}>
                <div style={styles.cover} onClick={() => { onClosePicker('colorBorder') }} />
                <SketchPicker
                  color={widget.colorBorder}
                  onChange={(e) => onChangeColor(e, 'colorBorder')} />
              </div>
            }
          </div>
        </div>
      }

      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label">Колір цифр</div>
        <div className="col-sm-3">
          <div style={styles.swatch} onClick={() => onShowPicker('colorFontNumbers')}>
            <div style={styles.colorFontNumbers} />
          </div>
          {showColorFontNumbersPicker &&
            <div style={styles.popover}>
              <div style={styles.cover} onClick={() => { onClosePicker('colorFontNumbers') }} />
              <SketchPicker
                color={widget.colorFontNumbers}
                onChange={(e) => onChangeColor(e, 'colorFontNumbers')} />
            </div>
          }
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <label htmlFor="elementsAnimation" className="col-sm-4 col-form-label">
          Анімація елементів
        </label>
        <div className="col-sm-7">
          <Switch id="elementsAnimation"
            disabled={widget.isNinetyDegree}
            onChange={(checked) => onSwitchChange(checked, 'elementsAnimation')}
            checked={widget.elementsAnimation}
          />
          <small id="elementsAnimation" className="form-text text-muted">
            <div className="mb-1">
              при отриманні доната полоса отриманих донатів буде плавно збільшуватися
              доступно якщо <strong>Розвернути віджет на 90*</strong> вимкнено
            </div>
          </small>
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <label htmlFor="gifSeparator" className="col-sm-4 col-form-label">
          Картинка розділення
        </label>
        <div className="col-sm-3">
          <div className="media-container-select"
            onClick={() => setModalVisible(true)}>
            {widget.gifSeparator?.url ?
              <img id="gifSeparator" alt=""
                src={widget.gifSeparator.url}
                className="animation" />
              :
              "Виберіть анімацію"
            }
          </div>
          {widget.gifSeparator?.url &&
            <div className="delete-item-button" onClick={() => onRemoveElement('images')} >
              <i className='fas fa-trash-alt'></i>
            </div>
          }
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <label htmlFor="gifSeparatorAbove" className="col-sm-4 col-form-label">
          Відображати <strong>Картинка розділення</strong> поверх тексту?
        </label>
        <div className="col-sm-3">
          <Switch id="gifSeparatorAbove"
            disabled={!widget.gifSeparator?.url}
            onChange={(checked) => onSwitchChange(checked, 'gifSeparatorAbove')}
            checked={widget.gifSeparatorAbove}
          />
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label">Колір фону індикатора</div>
        <div className="col-sm-3">
          <div style={styles.swatch} onClick={() => onShowPicker('colorFont')}>
            <div style={styles.colorFont} />
          </div>
          {showColorFontPicker &&
            <div style={styles.popover}>
              <div style={styles.cover} onClick={() => { onClosePicker('colorFont') }} />
              <SketchPicker
                color={widget.colorFont}
                onChange={(e) => onChangeColor(e, 'colorFont')} />
            </div>
          }
        </div>
      </div>

      {widget.gradient ?
        <div className="form-group row mb-lg-4">
          <div className="col-sm-4 col-form-label">
            Колір індикатора
          </div>
          <div className="col-sm-6 d-flex align-items-center">
            {widget.gradientColors?.map((gradient, i) =>
              <div key={i} className="mr-3 d-flex align-items-center">
                <div style={styles.swatch} onClick={() => onShowGradientPicker(i)}>
                  <div style={{
                    ...styles.color, background: `rgba(${gradient.r},${gradient.g},
                  ${gradient.b},${gradient.a})`
                  }} />
                </div>
                {showGradientPickers[i] && <div style={styles.popover}>
                  <div style={styles.cover} onClick={() => onCloseGradientPicker(i)} />
                  <SketchPicker
                    color={gradient}
                    onChange={(e) => onChangeGradientColor(e, i)} />
                </div>
                }
                {widget.gradientColors.length > 2 &&
                  <i className="ml-4 fas fa-times" onClick={() => onRemoveGradientPicker(i)} />
                }
              </div>
            )}
            {widget.gradientColors.length < 3 &&
              <div className="fas cursor fa-plus-circle mr-3" title='Додати колір' onClick={addNewGradient}></div>
            }

            <div className="cursor fas fa-random ml-3" title='Спробувати випадкові кольори' onClick={addRandomGradient}></div>
          </div>
        </div>
        :
        <div className="form-group row mb-lg-4">
          <div className="col-sm-4 col-form-label">Колір індикатора</div>
          <div className="col-sm-3 d-flex align-items-center">
            <div style={styles.swatch} onClick={() => onShowPicker('color')}>
              <div style={styles.color} />
            </div>
            {showColorPicker && <div style={styles.popover}>
              <div style={styles.cover} onClick={() => { onClosePicker('color') }} />
              <SketchPicker
                color={widget.color}
                onChange={(e) => onChangeColor(e, 'color')} />
            </div>}
          </div>
        </div>
      }

      <div className="form-group row mb-lg-4">
        <label htmlFor="gradient" className="col-sm-4 col-form-label">
          Градіент
        </label>
        <div className="col-sm-4">
          <Switch id="gradient"
            onChange={(checked) => onSwitchChange(checked, 'gradient')}
            checked={widget.gradient}
          />
        </div>
      </div>

      {widget.gradient &&
        <div className="form-group row mb-lg-4">
          <label htmlFor="outerGradient" className="col-sm-4 col-form-label">
            Внутрішній градіент?
          </label>
          <div className="col-sm-5">
            <Switch id="outerGradient"
              onChange={(checked) => onSwitchChange(checked, 'outerGradient')}
              checked={widget.outerGradient}
            />
            <small id="outerGradient" className="form-text text-muted">
              <div className="mb-1">
                вигляд градіента <strong>внутрішній</strong> або <strong>зовнішній</strong>
              </div>
            </small>
          </div>
        </div>
      }

      {widget.gradient &&
        <div className="form-group row mb-lg-4">
          <div className="col-sm-4 col-form-label slide-container">
            Кут градіента
          </div>
          <div className="col-sm-4 mt-2 mb-3 mb-sm-0">
            <input id="gradientAngle" className="slider" type="range" min="0" max="360"
              value={widget.gradientAngle}
              onChange={onChange} />
          </div>
          <div className="col-sm-2">
            <div className="input-group">
              <input id="gradientAngle" type="number" className="form-control"
                value={widget.gradientAngle}
                onChange={onChange} />
              <div className="input-group-append">
                <span className="input-group-text" id="amount">
                  &#8737;
                </span>
              </div>
            </div>
          </div>
        </div>
      }

      {widget.gradient &&
        <div className="form-group row mb-lg-4">
          <label htmlFor="gradientAnimation" className="col-sm-4 col-form-label">
            Анімація градіента
          </label>
          <div className="col-sm-4">
            <select id="gradientAnimation" className="form-control"
              value={widget.gradientAnimation}
              onChange={(e) => onChange(e)}>
              {animationOptions.map((item, i) =>
                <option key={item.id} value={item.id}> {item.name} </option>
              )}
            </select>
          </div>
        </div>
      }

      {visible && (
        <Modal
          isOpen={visible}
          toggleModal={() => setModalVisible(false)}
          multiselect={false}
          rowOpened='images'
          saveSelectedMedia={(e, items) => { saveSelectedMedia(e, items); setModalVisible(false) }}
          selectedItems={{ images: [widget.gifSeparator?.id || null] }}
        />
      )}
    </>
  )
}

export default SecondTab;
