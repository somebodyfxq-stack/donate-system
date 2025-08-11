import React from 'react';
// import Badge from '../../components/Badge';
import Switch from 'react-switch';
import FontEditor from '../misc/FontEditor';

const ThirdTab = ({ currentConfigWidget, onSaveFont, onChange, fontAnimations, onReset }) => {
  return (
    <>
      <div className="form-group row mb-lg-4" />

      <div className="form-group row mb-lg-4">
        <label htmlFor="showUpAnimation" className="col-12 col-sm-4 col-form-label">
          Анімація появи віджета
        </label>
        <div className="col-12 col-sm-5 mb-3 mb-md-0">
          <select id="showUpAnimation" className="form-control"
            value={currentConfigWidget.showUpAnimation}
            onChange={onChange}>
            {fontAnimations.map((item, i) =>
              <option key={item.id} value={item.id} className={item.header ? 'disabled' : ''} disabled={item.header}> {item.name} </option>
            )}
          </select>
        </div>
        <div className="col-5 col-sm-3 container-animation mx-auto">
          <div className={`animation-example animate__animated animate__${currentConfigWidget.showUpAnimation}`}
          style={{animationDuration: `${currentConfigWidget.showUpAnimationDuration || "2.5"}s`}}
          >
          </div>
        </div>
      </div>
      <div className="form-group row mb-lg-4">
        <div className="col-12 col-sm-4 col-form-label slide-container">
          Швидкість анімації появи віджета
        </div>
        <div className="col-12 col-sm-5 mt-2 mb-2 mb-md-0">
          <input id="showUpAnimationDurationSlider" type="range" step="0.5" min="0.5" max="5" className="slider mb-2 mb-sm-0"
            value={currentConfigWidget.showUpAnimationDuration || "2.5"}
            disabled={currentConfigWidget.showUpAnimation === "none"}
            onChange={onChange} />
        </div>
        <div className="col-12 col-sm-3 col-lg-2">
          <div className="input-group">
            <input id="showUpAnimationDuration" type="number" className="form-control"
              value={currentConfigWidget.showUpAnimationDuration || "2.5"}
              disabled={currentConfigWidget.showUpAnimation === "none"}
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
        <label htmlFor="fadeOutAnimation" className="col-12 col-sm-4 col-form-label">
          Анімація зникнення віджета
        </label>
        <div className="col-12 col-sm-5 mb-3 mb-md-0">
          <select id="fadeOutAnimation" className="form-control"
            value={currentConfigWidget.fadeOutAnimation}
            onChange={onChange}>
            {fontAnimations.map((item, i) =>
              <option key={item.id} value={item.id} className={item.header ? 'disabled' : ''} disabled={item.header}> {item.name} </option>
            )}
          </select>
        </div>
        <div className="col-5 col-sm-3 container-animation mx-auto">
          <div className={`animation-example animate__animated animate__${currentConfigWidget.fadeOutAnimation}`}
          style={{animationDuration: `${currentConfigWidget.fadeOutAnimationDuration || "2.5"}s`}}
          ></div>
        </div>
      </div>
      <div className="form-group row mb-lg-4">
        <div className="col-12 col-sm-4 col-form-label slide-container">
          Швидкість анімації зникнення віджета
        </div>
        <div className="col-12 col-sm-5 mt-2 mb-2 mb-md-0">
          <input id="fadeOutAnimationDurationSlider" type="range" step="0.5" min="0.5" max="5" className="slider mb-2 mb-sm-0"
            value={currentConfigWidget.fadeOutAnimationDuration || "2.5"}
            disabled={currentConfigWidget.fadeOutAnimation === "none"}
            onChange={onChange} />
        </div>
        <div className="col-12 col-sm-3 col-lg-2">
          <div className="input-group">
            <input id="fadeOutAnimationDuration" type="number" className="form-control"
              value={currentConfigWidget.fadeOutAnimationDuration || "2.5"}
              disabled={currentConfigWidget.fadeOutAnimation === "none"}
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
        <label htmlFor="imageAnimation" className="col-12 col-sm-4 col-form-label">
          Анімація зображення (картинки/відео) віджета
        </label>
        <div className="col-12 col-sm-5 mb-3 mb-md-0">
          <select id="imageAnimation" className="form-control"
            value={currentConfigWidget.imageAnimation}
            onChange={onChange}>
            {fontAnimations.map((item, i) =>
              <option key={item.id} value={item.id} className={item.header ? 'disabled' : ''} disabled={item.header}> {item.name} </option>
            )}
          </select>
        </div>
        <div className="col-5 col-sm-3 container-animation mx-auto">
          <div className={`animation-example animate__animated animate__${currentConfigWidget.imageAnimation}`}
          style={{animationDuration: `${currentConfigWidget.fadeOutImageAnimationDuration || "2.5"}s`}}
          ></div>
        </div>
      </div>

      {currentConfigWidget.imageAnimation && currentConfigWidget.imageAnimation !== 'none' && (
        <>
          <div className="form-group row mb-lg-4">
            <div className="col-12 col-sm-4 col-form-label slide-container">
              Швидкість анімації зображення (картинки/відео)
            </div>
            <div className="col-12 col-sm-5 mt-2 mb-2 mb-md-0">
              <input id="fadeOutImageAnimationDurationSlider" type="range" step="0.5" min="0.5" max="5" className="slider mb-2 mb-sm-0"
                value={currentConfigWidget.fadeOutImageAnimationDuration || "2.5"}
                disabled={currentConfigWidget.imageAnimation === "none"}
                onChange={onChange} />
            </div>
            <div className="col-12 col-sm-3 col-lg-2">
              <div className="input-group">
                <input id="fadeOutImageAnimationDuration" type="number" className="form-control"
                  value={currentConfigWidget.fadeOutImageAnimationDuration || "2.5"}
                  disabled={currentConfigWidget.imageAnimation === "none"}
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
            <div className="col-9 col-sm-4 col-form-label slide-container">
              Постійна анімація зображення (картинки/відео)
            </div>
            <div className="col-3 col-sm-5 col-form-label">
              <Switch id="infiniteImageAnimation"
                checked={currentConfigWidget.infiniteImageAnimation}
                onChange={(checked) => onChange({ target: { value: checked, id: 'infiniteImageAnimation' } })} />
            </div>
          </div>
        </>
      )}

      <FontEditor font={currentConfigWidget.headerFont ? currentConfigWidget.headerFont : currentConfigWidget.font} //temporary need to it migrate
        element={'headerFont'}
        onSaveFont={onSaveFont}
        showFontGradient={true}
        showTextAlignment={true}
        text='Стиль заголовку'
        specialWidth={320}
        showNote="тут ви можете вибрати анімацію появи заголовку" />

      <FontEditor font={currentConfigWidget.bodyFont ? currentConfigWidget.bodyFont : currentConfigWidget.font} //temporary need to it migrate
        element={'bodyFont'}
        onSaveFont={onSaveFont}
        showFontGradient={true}
        showTextAlignment={true}
        text='Стиль тексту'
        specialWidth={320}
        showNote="тут ви можете вибрати анімацію появи тексту" />

      <div className="form-group row mb-lg-4">
		<label htmlFor="highlightDonaterAndAmount" className="col-9 col-sm-4 col-form-label">
          Виділити ім'я глядача та суму донату
		</label>
        <div className="col-3 col-sm-5 col-form-label">
          <div className="checkbox-container">
            <Switch id="highlightDonaterAndAmount"
              checked={currentConfigWidget.highlightDonaterAndAmount}
              onChange={(checked) => onChange({ target: { value: checked, id: 'highlightDonaterAndAmount' } })} />
          </div>
        </div>
      </div>

      {currentConfigWidget.highlightDonaterAndAmount && (
        <FontEditor font={currentConfigWidget.highlightedUserName}
          element='highlightedUserName'
          onSaveFont={onSaveFont}
          showFontGradient={true}
          resetButton={onReset}
          text='Стиль імені глядача'
          specialWidth={320}
          showNote="виберіть як ви хочете виділити ім'я глядача" />
      )}

      {currentConfigWidget.highlightDonaterAndAmount && (
        <FontEditor font={currentConfigWidget.highlightedAmount}
          element='highlightedAmount'
          onSaveFont={onSaveFont}
          showFontGradient={true}
          resetButton={onReset}
          text='Стиль суми донату'
          specialWidth={320}
          showNote="виберіть як ви хочете виділити суму донату" />
      )}
    </>
  )
}

export default ThirdTab;
