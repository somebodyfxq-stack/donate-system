import React, {useState, useCallback} from 'react';
import {Rnd} from 'react-rnd';
import widgetEnum, {WIDGET_FOR} from '../../enums/widgetEnum';

const CustomizedAlert = props => {
  const [mainHeight, setMainHeight] = useState((props?.ui?.mainHeight) || 600);
  const [mainWidth, setMainWidth] = useState((props?.ui?.mainWidth) || 800);

  const [imageWidthHeight, setImageWidthHeight] = useState({ height: props?.ui?.imageHeight || 200, width: props?.ui?.imageWidth || 280 });
  const [imageZIndex, setImageZIndex] = useState((props?.ui?.imageZIndex) || 1);
  const [imagePosition, setImagePosition] = useState({ x: props?.ui?.imageLeft || 0, y: props?.ui?.imageTop || 0 });

  const [headerWidthHeight, setHeaderWidthHeight] = useState({ height: props?.ui?.headerHeight || 310, width: props?.ui?.headerWidth || 480 });
  const [headerZIndex, setHeaderZIndex] = useState((props?.ui?.headerZIndex) || 2);
  const [headerPosition, setHeaderPosition] = useState({ x: props?.ui?.headerLeft || 480, y: props?.ui?.headerTop || 0 });

  const [textWidthHeight, setTextWidthHeight] = useState({ height: props?.ui?.textHeight || 170, width: props?.ui?.textWidth || 540 });
  const [textZIndex, setTextZIndex] = useState((props?.ui?.textZIndex) || 3);
  const [textPosition, setTextPosition] = useState({ x: props?.ui?.textLeft || 30, y: props?.ui?.textTop || 220 });

  const { bodyFont, headerFont, widgetFor } = props;

  const [activeElement, setActiveElement] = useState('');

  const mainStyles = {
    height: mainHeight + 'px',
    width: mainWidth + 'px',
    position: 'absolute',
    border: '2px solid #000000',
    overflow: 'hidden',
  };

  const imageStyles = {
    height: imageWidthHeight.height + 'px',
    width: imageWidthHeight.width + 'px',
    zIndex: imageZIndex
  };

  const imageCentered = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  const headerStyles = {
    height: headerWidthHeight.height + 'px',
    width: headerWidthHeight.width + 'px',
    zIndex: headerZIndex,
    fontFamily: widgetEnum.FONTS[headerFont.fontFamily].id,
    textAlign: headerFont.textAlign || 'center',
    fontSize: headerFont.fontSize + 'px',
    letterSpacing: headerFont.letterSpacing + 'px',
    wordSpacing: headerFont.wordSpacing + 'px',
    fontWeight: !headerFont.isBold ? 100 : 'bold',
    fontStyle: !headerFont.isItalic ? 'normal' : 'italic',
    textDecoration: !headerFont.isUnderlined ? '' : 'underline',
    textShadow: `rgba(${headerFont.colorShadow.r},${headerFont.colorShadow.g},${headerFont.colorShadow.b},${headerFont.colorShadow.a}) 0px 0px ${headerFont.colorShadowWidth}px`,
    color: `rgba( ${headerFont.color.r},
                  ${headerFont.color.g},
                  ${headerFont.color.b},
                  ${headerFont.color.a})`,
    ...(headerFont.stroke !== '0' && headerFont.colorStroke && {
      backgroundColor: `rgba(${headerFont.colorStroke?.r},${headerFont.colorStroke?.g},${headerFont.colorStroke?.b},${headerFont.colorStroke?.a})`,
      'WebkitTextStroke': `${headerFont.stroke}px transparent`,
      '-webkit-background-clip': `text`,
    })
  };

  const textStyles = {
    height: textWidthHeight.height + 'px',
    width: textWidthHeight.width + 'px',
    zIndex: textZIndex,
    fontFamily: widgetEnum.FONTS[bodyFont.fontFamily].id,
    textAlign: bodyFont.textAlign || 'center',
    fontSize: bodyFont.fontSize + 'px',
    letterSpacing: bodyFont.letterSpacing + 'px',
    wordSpacing: bodyFont.wordSpacing + 'px',
    fontWeight: !bodyFont.isBold ? 100 : 'bold',
    fontStyle: !bodyFont.isItalic ? 'normal' : 'italic',
    textDecoration: !bodyFont.isUnderlined ? '' : 'underline',
    textShadow: `rgba(${bodyFont.colorShadow.r},${bodyFont.colorShadow.g},${bodyFont.colorShadow.b},${bodyFont.colorShadow.a}) 0px 0px ${bodyFont.colorShadowWidth}px`,
    color: `rgba( ${bodyFont.color.r},
                  ${bodyFont.color.g},
                  ${bodyFont.color.b},
                  ${bodyFont.color.a})`,
    ...(bodyFont.stroke !== '0' && bodyFont.colorStroke && {
      backgroundColor: `rgba(${bodyFont.colorStroke?.r},${bodyFont.colorStroke?.g},${bodyFont.colorStroke?.b},${bodyFont.colorStroke?.a})`,
      'WebkitTextStroke': `${bodyFont.stroke}px transparent`,
      '-webkit-background-clip': `text`,
    })
  };

	const elementData = {
		header: {
			widthHeight: headerWidthHeight,
			position: headerPosition,
			setPosition: setHeaderPosition,
		},
		image: {
			widthHeight: imageWidthHeight,
			position: imagePosition,
			setPosition: setImagePosition,
		},
		text: {
			widthHeight: textWidthHeight,
			position: textPosition,
			setPosition: setTextPosition,
		},
	};

	const setHorizontalAlignment = useCallback((position) => {
		const data = elementData[activeElement];
		if (!data) return;

		const { width } = data.widthHeight;
		let x = 0;

		if (position === 'center') {
			x = (mainWidth - width) / 2;
		} else if (position === 'right') {
			x = mainWidth - width;
		}

		data.setPosition({ x, y: data.position.y });
	}, [activeElement, elementData, mainWidth]);

	const setVerticalAlignment = useCallback((position) => {
		const data = elementData[activeElement];
		if (!data) return;

		const { height } = data.widthHeight;
		let y = 0;

		if (position === 'center') {
			y = (mainHeight - height) / 2;
		} else if (position === 'bottom') {
			y = mainHeight - height;
		}

		data.setPosition({ x: data.position.x, y });
	}, [activeElement, elementData, mainHeight]);

  return (
    <div style={{ minWidth: 600, maxWidth: 900 }}>
      <div className="form-group row mb-lg-4">
        <label className="col-sm-2 col-form-label">
          Розширення вікна
        </label>
        <div className="col-sm-2">
          <small id="showUserText" className="form-text text-muted">
            ширина
          </small>
          <input type="number" className="form-control" required
            value={mainWidth}
            onChange={e => setMainWidth(e.target.value)} />
        </div>
        <div className="col-sm-2">
          <small id="showUserText" className="form-text text-muted">
            висота
          </small>
          <input type="number" className="form-control" required
            value={mainHeight}
            onChange={e => setMainHeight(e.target.value)} />
        </div>
        <div className="col-sm-12">
          <small className="form-text text-muted">
            * Не забудьте змінити розширення вікна у OBS/TT studio, якщо ви міняєте розширення вікна тут.
          </small>
        </div>
      </div>


	  <div className="form-group row mb-lg-4">
        <label className="col-sm-2 col-form-label">
			Вирівнювання елемента
        </label>
        <div className="col-sm-4 col-md-3">
			<small className="form-text text-muted">
				Горизонтальне
			</small>
			<div>
				{widgetEnum.HorizontalAlignmentButtons.map((button, i) => (
					<button key={i} className="btn btn-secondary mr-1"
						style={{fontSize: '12px'}}
						disabled={!activeElement}
						onClick={() => setHorizontalAlignment(button.position)}
					>
						{button.text}
					</button>
				))}
			</div>
        </div>
        <div className="col-sm-4 col-md-3">
			<small className="form-text text-muted">
				Вертикальне
			</small>
			<div>
				{widgetEnum.VerticalAlignmentButtons.map((button, i) => (
					<button key={i} className="btn btn-secondary mr-1"
						style={{fontSize: '12px'}}
						disabled={!activeElement}
						onClick={() => setVerticalAlignment(button.position)}
					>
						{button.text}
					</button>
				))}
			</div>
        </div>
        <div className="col-sm-12">
			<small className="form-text text-muted">
				* Клацніть по елементу щоб вирівняти його по горизонталі чи вертикалі.
			</small>
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <label className="col-sm-2 col-form-label">
          Порядок шарів
        </label>
        <div className="col-sm-2">
          <small id="showUserText" className="form-text text-muted">
            Анімація
          </small>
          <input type="number" className="form-control" required
            value={imageZIndex}
            onChange={e => setImageZIndex(e.target.value)} />
        </div>
        <div className="col-sm-2">
          <small id="showUserText" className="form-text text-muted">
            Заголовок
          </small>
          <input type="number" className="form-control" required
            value={headerZIndex}
            onChange={e => setHeaderZIndex(e.target.value)} />
        </div>
        {widgetFor === WIDGET_FOR.DONATE && (
          <div className="col-sm-2">
            <small id="showUserText" className="form-text text-muted">
              Tекст
            </small>
            <input type="number" className="form-control" required
              value={textZIndex}
              onChange={e => setTextZIndex(e.target.value)} />
          </div>
        )}
        <div className="col-sm-2">
          <button className="btn btn-primary mt-4" style={{width: '100%'}}
            onClick={(e) => props.saveCustomizedWidget(e, {
              mainHeight,
              mainWidth,
              imageHeight: imageWidthHeight.height,
              imageWidth: imageWidthHeight.width,
              imageLeft: imagePosition.x,
              imageTop: imagePosition.y,
              imageZIndex,
              headerHeight: headerWidthHeight.height,
              headerWidth: headerWidthHeight.width,
              headerLeft: headerPosition.x,
              headerTop: headerPosition.y,
              headerZIndex,
              textHeight: textWidthHeight.height,
              textWidth: textWidthHeight.width,
              textLeft: textPosition.x,
              textTop: textPosition.y,
              textZIndex
            })
            }>
            Зберегти
          </button>
        </div>
        <div className="col-sm-2">
          <button className="btn btn-secondary mt-4" style={{width: '100%'}}
            onClick={props.onCloseModal}>
            Закрити
          </button>
        </div>
        <small id="urlShow" className="form-text text-muted">
          <div className="mb-1">
            * Порядок шарів - шар з більшою цифрою відображатиметься вище шарів з меншою цифрою.
          </div>
        </small>
      </div>

      <div style={{ display: 'flex' }}>
        <div id='main-widget-container' style={mainStyles}>

          <Rnd
            style={imageStyles}
            size={{ ...imageWidthHeight }}
            position={{ ...imagePosition }}
            onDragStop={(e, d) =>
              setImagePosition({ x: d.x, y: d.y })
            }
            onResizeStop={(e, direction, ref, delta, position) => {
              setImagePosition({ x: position.x, y: position.y });
              setImageWidthHeight({ width: parseInt(ref.style.width), height: parseInt(ref.style.height) });
            }}
			onClick={() => setActiveElement('image')}
          >
            <div style={{ ...imageStyles, ...imageCentered }}>
              {props.isVideo ?
                <video style={{ height: "100%", width: "100%", objectFit: "contain" }} autoPlay>
                  <source src={props.image} />
                </video>
                :
                <img style={{ height: "100%", width: "100%", objectFit: "contain" }}
                  src={props.image}
                  alt="animation">
                </img>
              }
            </div>
          </Rnd>

          <Rnd
            style={headerStyles}
            size={{ ...headerWidthHeight }}
            position={{ ...headerPosition }}
            onDragStop={(e, d) =>
              setHeaderPosition({ x: d.x, y: d.y })
            }
            onResizeStop={(e, direction, ref, delta, position) => {
              setHeaderPosition({ x: position.x, y: position.y });
              setHeaderWidthHeight({ width: parseInt(ref.style.width), height: parseInt(ref.style.height) });
            }}
			onClick={() => setActiveElement('header')}
          >
            Користувач дарує 100 грн
          </Rnd>

          {widgetFor === WIDGET_FOR.DONATE && (
            <Rnd
              style={textStyles}
              size={{ ...textWidthHeight }}
              position={{ ...textPosition }}
              onDragStop={(e, d) =>
                setTextPosition({ x: d.x, y: d.y })
              }
              onResizeStop={(e, direction, ref, delta, position) => {
                setTextPosition({ x: position.x, y: position.y })
                setTextWidthHeight({ width: parseInt(ref.style.width), height: parseInt(ref.style.height) });
              }}
			  onClick={() => setActiveElement('text')}
            >
              тестове повідомлення
            </Rnd>
          )}

        </div>
      </div>
    </div>
  )
};

export default CustomizedAlert;
