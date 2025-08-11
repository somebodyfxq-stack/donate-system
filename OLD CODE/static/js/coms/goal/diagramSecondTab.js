import React, {useEffect} from 'react';
import {SketchPicker} from 'react-color';
import Switch from 'react-switch';
import FontEditor from '../misc/FontEditor';

const DiagramSecondTab = ({
	widget,
	onChangeColor,
	styles,
	onShowPicker,
	onClosePicker,
	showColorBackgroundPicker,
	showColorLabelPicker,
	showColorGoalLinePicker,
	showInnerColorGoalLinePicker,
	showColorDividerPicker,
	showColorPercentageAndShadowPicker,
	onSaveFont,
	textWidgetNameAndGoal,
	textGotAmountAndPercentage,
	onSwitchChange,
	onShowGradientPicker,
	onCloseGradientPicker,
	onChangeGradientColor,
	onRemoveGradientPicker,
	addNewGradient,
	addRandomGradient,
	showGradientPickers,
	onChange,
	animationOptions
}) => {
  useEffect(() => {
    localStorage.setItem('widgetGoal', JSON.stringify({ ...widget }));
  }, [widget])

  return (
    <>
      <div className="form-group row mb-lg-4"></div>

	  <div className="form-group row mb-lg-4">
		<label htmlFor="qrCode" className="col-sm-4 col-form-label">
			Показувати QR код
		</label>
		<div className="col-sm-4">
			<Switch
				id="qrCode"
				onChange={checked => onSwitchChange(checked, 'diagramQrCode')}
				checked={widget.diagramSettings.qrCode}
				height={24}
				width={45}
				onColor={'#3579F6'}
			/>
		</div>
	  </div>

	  {widget.diagramSettings.qrCode && (
		<div className="form-group row mb-lg-4">
			<label htmlFor="replacingDiagramWithQrCode" className="col-sm-4 col-form-label">
				Замінити діаграму QR кодом
			</label>
			<div className="col-sm-4">
				<Switch
					id="replacingDiagramWithQrCode"
					onChange={checked => onSwitchChange(checked, 'replacingDiagramWithQrCode')}
					checked={widget.diagramSettings.replacingDiagramWithQrCode}
					height={24}
					width={45}
					onColor={'#3579F6'}
				/>
			</div>
		</div>
	  )}
      <FontEditor
        font={textWidgetNameAndGoal}
        element={'textWidgetNameAndGoal'}
        onSaveFont={(font, element) => onSaveFont(font, element, 'diagramSettings')}
        text='Заголовок та сума Ціль'
        widget='GOAL'
        hideFontSize={true}
        textAnimation={widget.diagramSettings.textWidgetNameAndGoalAnimation}
      />

      <FontEditor
        font={textGotAmountAndPercentage}
        element={'textGotAmountAndPercentage'}
        onSaveFont={(font, element) => onSaveFont(font, element, 'diagramSettings')}
        text='Зібрано та Відсотки'
        widget='GOAL'
        hideFontSize={true}
        // textAnimation={widget.diagramSettings.textGotAmountAndPercentageAnimation}
      />

      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label">Колір бекграунда</div>
        <div className="col-sm-3 d-flex align-items-center">
          <div style={styles.swatch} onClick={() => onShowPicker('colorBackground')}>
            <div style={styles.colorBackground} />
          </div>
          {showColorBackgroundPicker && (
            <div style={styles.popover}>
              <div style={styles.cover} onClick={() => onClosePicker('colorBackground') } />
              <SketchPicker
                color={widget.diagramSettings.colorBackground}
                onChange={(e) => onChangeColor(e, 'colorBackground', 'diagramSettings')} />
            </div>
          )}
        </div>
      </div>

	  	{widget.diagramSettings.gradient ? (
			<div className="form-group row mb-lg-4">
				<div className="col-sm-4 col-form-label">
					Колір полоски заповнення
				</div>
				<div className="col-sm-6 d-flex align-items-center">
					{widget.diagramSettings.gradientColors?.map((gradient, i) => (
						<div key={i} className="mr-3 d-flex align-items-center">
							<div style={styles.swatch} onClick={() => onShowGradientPicker(i)}>
								<div
									style={{
										...styles.progressBarColor,
										background: `rgba(${gradient.r},${gradient.g}, ${gradient.b},${gradient.a})`
									}}
								/>
							</div>
							{showGradientPickers[i] && (
								<div style={styles.popover}>
									<div style={styles.cover} onClick={() => onCloseGradientPicker(i)} />
									<SketchPicker color={gradient} onChange={e => onChangeGradientColor(e, i, 'diagramSettings')} />
								</div>
							)}
							{widget.diagramSettings.gradientColors.length > 2 && (
								<i className="ml-4 fas fa-times" onClick={() => onRemoveGradientPicker(i, 'diagramSettings')} />
							)}
						</div>
					))}
					{widget.diagramSettings.gradientColors.length < 3 && (
						<div className="fas cursor fa-plus-circle mr-3" title="Додати колір" onClick={() => addNewGradient('diagramSettings')}></div>
					)}

					<div
						className="cursor fas fa-random ml-3"
						title="Спробувати випадкові кольори"
						onClick={() => addRandomGradient('diagramSettings')}
					></div>
				</div>
			</div>
		) : (
			<div className="form-group row mb-lg-4">
				<div className="col-sm-4 col-form-label">Колір полоски заповнення</div>
				<div className="col-sm-3 d-flex align-items-center">
				<div style={styles.swatch} onClick={() => onShowPicker('colorGoalLine')}>
					<div style={styles.colorGoalLine} />
				</div>
				{showColorGoalLinePicker && (
					<div style={styles.popover}>
					<div style={styles.cover} onClick={() => onClosePicker('colorGoalLine') } />
					<SketchPicker
						color={widget.diagramSettings.colorGoalLine}
						onChange={(e) => onChangeColor(e, 'colorGoalLine', 'diagramSettings')} />
					</div>
				)}
				</div>
			</div>
		)}

		<div className="form-group row mb-lg-4">
			<label htmlFor="gradient" className="col-sm-4 col-form-label">
				Градіент полоски заповнення
			</label>
			<div className="col-sm-4">
				<Switch
					id="diagramGradient"
					onChange={checked => onSwitchChange(checked, 'diagramGradient')}
					checked={widget.diagramSettings.gradient}
					height={24}
					width={45}
					onColor={'#3579F6'}
				/>
			</div>
		</div>

		{widget.diagramSettings.gradient && (
			<div className="form-group row mb-lg-4">
				<div className="col-sm-4 col-form-label">
					Кут градіента
				</div>
				<div className="col-sm-4 mt-2 mb-3 mb-sm-0">
					<input
						id="gradientAngleDiagram"
						className="slider"
						type="range"
						min="0"
						max="360"
						value={widget.diagramSettings.gradientAngle}
						onChange={onChange}
					/>
				</div>
				<div className="col-sm-2">
					<div className="input-group">
						<input
							id="gradientAngleDiagram"
							type="number"
							className="form-control"
							value={widget.diagramSettings.gradientAngle}
							onChange={onChange}
						/>
						<div className="input-group-append">
							<span className="input-group-text" id="amount">
								&#8737;
							</span>
						</div>
					</div>
				</div>
			</div>
		)}

		{widget.diagramSettings.gradient && (
			<div className="form-group row mb-lg-4">
				<label htmlFor="gradientAnimationDiagram" className="col-sm-4 col-form-label">
					Анімація градіента
				</label>
				<div className="col-sm-4">
					<select
						id="gradientAnimationDiagram"
						className="form-control"
						value={widget.diagramSettings.gradientAnimation}
						onChange={e => onChange(e)}
					>
						{animationOptions.map((item, i) => (
							<option key={item.id} value={item.id}>
								{' '}
								{item.name}{' '}
							</option>
						))}
					</select>
				</div>
			</div>
		)}

      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label">Колір залишку полоски заповнення</div>
        <div className="col-sm-3 d-flex align-items-center">
          <div style={styles.swatch} onClick={() => onShowPicker('innerColorGoalLine')}>
            <div style={styles.innerColorGoalLine} />
          </div>
          {showInnerColorGoalLinePicker && (
            <div style={styles.popover}>
              <div style={styles.cover} onClick={() => onClosePicker('innerColorGoalLine') } />
              <SketchPicker
                color={widget.diagramSettings.innerColorGoalLine}
                onChange={(e) => onChangeColor(e, 'innerColorGoalLine', 'diagramSettings')} />
            </div>
          )}
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label">Колір Зібрано та Ціль</div>
        <div className="col-sm-3 d-flex align-items-center">
          <div style={styles.swatch} onClick={() => onShowPicker('colorLabel')}>
            <div style={styles.colorLabel} />
          </div>
          {showColorLabelPicker && (
            <div style={styles.popover}>
              <div style={styles.cover} onClick={() => onClosePicker('colorLabel') } />
              <SketchPicker
                color={widget.diagramSettings.colorLabel}
                onChange={(e) => onChangeColor(e, 'colorLabel', 'diagramSettings')} />
            </div>
          )}
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label">Колір роздільника</div>
        <div className="col-sm-3 d-flex align-items-center">
          <div style={styles.swatch} onClick={() => onShowPicker('colorDivider')}>
            <div style={styles.colorDivider} />
          </div>
          {showColorDividerPicker && (
            <div style={styles.popover}>
              <div style={styles.cover} onClick={() => onClosePicker('colorDivider') } />
              <SketchPicker
                color={widget.diagramSettings.colorDivider}
                onChange={(e) => onChangeColor(e, 'colorDivider', 'diagramSettings')} />
            </div>
          )}
        </div>
      </div>

      <div className="form-group row mb-lg-4">
        <div className="col-sm-4 col-form-label">Колір бекграунда {widget.goalWidgetType === '4' ? 'внутрішнього кільця' : 'та тінь Відсотків'}</div>
        <div className="col-sm-3 d-flex align-items-center">
          <div style={styles.swatch} onClick={() => onShowPicker('colorPercentageAndShadow')}>
            <div style={styles.colorPercentageAndShadow} />
          </div>
          {showColorPercentageAndShadowPicker && (
            <div style={styles.popover}>
              <div style={styles.cover} onClick={() => onClosePicker('colorPercentageAndShadow') } />
              <SketchPicker
                color={widget.diagramSettings.colorPercentageAndShadow}
                onChange={(e) => onChangeColor(e, 'colorPercentageAndShadow', 'diagramSettings')} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DiagramSecondTab;
