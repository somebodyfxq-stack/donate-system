import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {SketchPicker} from 'react-color';
import reactCSS from 'reactcss';
import widgetEnum from '../../enums/widgetEnum';

const textPositions = widgetEnum.TEXT_MULTIGOAL_POSITIONS;

export const MultiGoal = ({ show, handleClose, handleConfirm, widget }) => {
  const [widgetMultiGoalData, setWidgetMultiGoalData] = useState(widget.multiGoalItems || {});
  const [showGradientColorPicker, setGradientVisibility] = useState(false);
  const [showBorderColorPicker, setBorderColorVisibility] = useState(false);

  useEffect(() => {
    localStorage.setItem('widgetGoal', JSON.stringify({ ...widget, multiGoalItems: widgetMultiGoalData }));
  }, [widget, widgetMultiGoalData])

  useEffect(() => {
    setWidgetMultiGoalData({ ...widget.multiGoalItems });
  }, [widget])

  const onChange = useCallback((e) => {
    widgetMultiGoalData[e.currentTarget.id] = e.currentTarget.value;

    setWidgetMultiGoalData({ ...widgetMultiGoalData });
  }, [widgetMultiGoalData])

  const styles = useMemo(() => {
    if (!widgetMultiGoalData.gradientColor) {
      widgetMultiGoalData.gradientColor = { r: '50', g: '50', b: '50', a: '0.5' }
    }

    if (!widgetMultiGoalData.borderColor) {
      widgetMultiGoalData.borderColor = { r: '50', g: '50', b: '50', a: '1' }
    }

    return reactCSS({
      default: {
        gradientColor: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${widgetMultiGoalData.gradientColor.r},${widgetMultiGoalData.gradientColor.g},
              ${widgetMultiGoalData.gradientColor.b},${widgetMultiGoalData.gradientColor.a})`
        },
        borderColor: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${widgetMultiGoalData.borderColor.r},${widgetMultiGoalData.borderColor.g},
              ${widgetMultiGoalData.borderColor.b},${widgetMultiGoalData.borderColor.a})`
        },
        swatch: {
          marginTop: '7px',
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
    })
  }, [widgetMultiGoalData.gradientColor, widgetMultiGoalData.borderColor]);

  const handleItemChange = useCallback((e, i) => {
    widgetMultiGoalData.items[i] = {
      ...widgetMultiGoalData.items[i],
      [e.currentTarget.id]: e.currentTarget.value
    }

    setWidgetMultiGoalData({ ...widgetMultiGoalData });
  }, [widgetMultiGoalData])

  const addNewItem = useCallback(() => {
    const newItem = {
      name: '{amount}',
      amount: 0,
    }

    widgetMultiGoalData.items.push(newItem);

    setWidgetMultiGoalData({ ...widgetMultiGoalData });
  }, [widgetMultiGoalData])

  const removeItem = useCallback((i) => {
    const items = widgetMultiGoalData.items.filter((item, index) => index !== i);

    widgetMultiGoalData.items = items;

    setWidgetMultiGoalData({ ...widgetMultiGoalData });

    if (items.length === 0) {
      addNewItem();
    }
  }, [addNewItem, widgetMultiGoalData]);

  const onChangeColor = useCallback((gradientColor, item) => {
    widgetMultiGoalData[item] = gradientColor.rgb;

    if (item === 'gradientColor') {
      widgetMultiGoalData[item].a = widgetMultiGoalData[item].a > 0.7 ? 0.7 : widgetMultiGoalData[item].a;
    }

    setWidgetMultiGoalData({ ...widgetMultiGoalData });
  }, [widgetMultiGoalData]);

  return (
    <Modal show={show} size="lg" onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Параметри мультицілі</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '1rem' }}>
        <div className="form-group row mb-lg-3">
          {widgetMultiGoalData.items.map((item, i) => (
            <div key={i} className="col-sm-12 row multi-items mb-2">
              <label htmlFor="items" className="col-sm-3 col-form-label">{i === 0 && 'Список Речей'}</label>
              <div className="col-sm-5">
                <input id="name" type="text" className="form-control"
                  value={item.name}
                  onChange={(e) => handleItemChange(e, i)} />

                <small className="form-text text-muted">
                  Доступно: <u>{'{amount}'}</u> <br /> виглядатиме - {`${item.name.replace('{amount}', item.amount)}`}
                </small>
              </div>
              <div className="col-sm-2 input-group" style={{height: '38px'}}>
                <input id="amount" type="number" className="form-control"
                  value={item.amount}
                  onChange={(e) => handleItemChange(e, i)} />
                <div className="input-group-append">
                <span className="input-group-text" id="amount">
                  ₴
                </span>
              </div>
              </div>
              <div className="col-sm-2">
                <i className="ml-2 mt-2 fas fa-trash-alt mr-3"
                  onClick={() => removeItem(i)} />
                <i className="ml-2 mt-2 fas fa-plus-circle"
                  onClick={() => addNewItem()} />
              </div>
            </div>
          ))}
        </div>

        <div className="form-group row mb-lg-4">
          <div className="col-sm-3 col-form-label">Колір градіента</div>
          <div className="col-sm-3">
            <div style={styles.swatch} onClick={() => setGradientVisibility(true)}>
              <div style={styles.gradientColor} />
            </div>
            {showGradientColorPicker &&
              <div style={styles.popover}>
                <div style={styles.cover} onClick={() => setGradientVisibility(false)} />
                <SketchPicker
                  color={widgetMultiGoalData.gradientColor}
                  onChange={(e) => onChangeColor(e, 'gradientColor')} />
              </div>
            }
          </div>
        </div>

        <div className="form-group row mb-lg-4">
          <label htmlFor="multiGoalWidgetHeight" className="col-sm-3 col-form-label">Висота цього віджета</label>
          <div className="col-sm-4 mt-2">
            <input id="multiGoalWidgetHeight" className="slider" type="range" min="0" max="200"
              value={widgetMultiGoalData.multiGoalWidgetHeight}
              onChange={onChange} />
          </div>
          <div className="col-sm-2">
            <div className="input-group">
              <input id="multiGoalWidgetHeight" type="number" className="form-control"
                value={widgetMultiGoalData.multiGoalWidgetHeight}
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
          <label htmlFor="gradientStart" className="col-sm-3 col-form-label">Початок градіента</label>
          <div className="col-sm-4 mt-2">
            <input id="gradientStart" className="slider" type="range" min="0" max="100"
              value={widgetMultiGoalData.gradientStart}
              onChange={onChange} />
          </div>
          <div className="col-sm-2">
            <div className="input-group">
              <input id="gradientStart" type="number" className="form-control"
                value={widgetMultiGoalData.gradientStart}
                onChange={onChange} />
              <div className="input-group-append">
                <span className="input-group-text" id="amount">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group row mb-lg-4">
          <label htmlFor="textPosition" className="col-sm-3 col-form-label">Позиція тексту</label>
          <div className="col-sm-4">
            <select id="textPosition" className="form-control"
              value={widgetMultiGoalData.textPosition}
              onChange={(e) => onChange(e)}>
              {textPositions.map((item) =>
                <option key={item.id} value={item.id}> {item.name} </option>
              )}
            </select>
          </div>
        </div>

        <div className="form-group row mb-lg-4">
          <label htmlFor="padding" className="col-sm-3 col-form-label">Відступ тексту</label>
          <div className="col-sm-4 mt-2">
            <input id="padding" className="slider" type="range" min="0" max="20"
              value={widgetMultiGoalData.padding}
              onChange={onChange} />
          </div>
          <div className="col-sm-2">
            <div className="input-group">
              <input id="padding" type="number" className="form-control"
                value={widgetMultiGoalData.padding}
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
          <label htmlFor="borderWidth" className="col-sm-3 col-form-label">Ширина краю</label>
          <div className="col-sm-4 mt-2">
            <input id="borderWidth" className="slider" type="range" min="0" max="10"
              value={widgetMultiGoalData.borderWidth}
              onChange={onChange} />
          </div>
          <div className="col-sm-2">
            <div className="input-group">
              <input id="borderWidth" type="number" className="form-control"
                value={widgetMultiGoalData.borderWidth}
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
          <div className="col-sm-3 col-form-label">Колір краю</div>
          <div className="col-sm-3" style={{opacity: parseInt(widgetMultiGoalData.borderWidth) ? 1 : 0.3}}>
            <div style={styles.swatch} onClick={() => parseInt(widgetMultiGoalData.borderWidth) && setBorderColorVisibility(true)}>
              <div style={styles.borderColor} />
            </div>
            {showBorderColorPicker &&
              <div style={styles.popover}>
                <div style={styles.cover} onClick={() => setBorderColorVisibility(false)} />
                <SketchPicker
                  color={widgetMultiGoalData.borderColor}
                  onChange={(e) => onChangeColor(e, 'borderColor')} />
              </div>
            }
          </div>
        </div>

        <div className="form-group row mb-lg-4">
          <label htmlFor="borderRadius" className="col-sm-3 col-form-label">Радіус краю</label>
          <div className="col-sm-4 mt-2">
            <input id="borderRadius" className="slider" type="range" min="0" max={parseInt(widget.height / 2)}
              disabled={!parseInt(widgetMultiGoalData.borderWidth)}
              value={widgetMultiGoalData.borderRadius}
              onChange={onChange} />
          </div>
          <div className="col-sm-2">
            <div className="input-group">
              <input id="borderRadius" type="number" className="form-control"
                disabled={!parseInt(widgetMultiGoalData.borderWidth)}
                value={widgetMultiGoalData.borderRadius}
                onChange={onChange} />
              <div className="input-group-append">
                <span className="input-group-text" id="amount">
                  px
                </span>
              </div>
            </div>
          </div>
        </div>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          закрити
        </Button>
        <Button variant="primary" onClick={() => handleConfirm(widgetMultiGoalData)}>
          вибрати
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
