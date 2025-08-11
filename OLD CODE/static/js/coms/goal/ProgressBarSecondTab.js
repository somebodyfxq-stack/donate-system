import React, {useEffect} from 'react';
import {SketchPicker} from 'react-color';
import Switch from 'react-switch';
import Badge from '../misc/Badge';
import FontEditor from '../misc/FontEditor';

const ProgressBarSecondTab = ({
	widget,
	onChangeColor,
	styles,
	onShowPicker,
	onClosePicker,
	showColorBackgroundPicker,
	showColorLabelPicker,
	onSaveFont,
	textWidgetNameAndGoal,
	textGotAmount,
	onShowGradientPicker,
	onCloseGradientPicker,
	onChangeGradientColor,
	onRemoveGradientPicker,
	addNewGradient,
	addRandomGradient,
	showGradientPickers,
	showColorPicker,
	onChange,
	onSwitchChange,
	animationOptions
}) => {
	useEffect(() => {
		localStorage.setItem('widgetGoal', JSON.stringify({ ...widget }));
	}, [widget]);

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
						onChange={checked => onSwitchChange(checked, 'progressBarQrCode')}
						checked={widget.progressBarSettings.qrCode}
						height={24}
						width={45}
						onColor={'#3579F6'}
					/>
				</div>
			</div>

			<FontEditor
				font={textWidgetNameAndGoal}
				element={'textWidgetNameAndGoal'}
				onSaveFont={(font, element) => onSaveFont(font, element, 'progressBarSettings')}
				text={widget.goalWidgetType !== '5' ? "Заголовок та сума Ціль" : "Сума Ціль"}
				widget="GOAL"
				hideFontSize={true}
			/>

			<FontEditor
				font={textGotAmount}
				element={'textGotAmount'}
				onSaveFont={(font, element) => onSaveFont(font, element, 'progressBarSettings')}
				text={widget.goalWidgetType !== '5' ? "Сума Зібрано" : "Сума Зібрано та відсотки"}
				widget="GOAL"
				hideFontSize={true}
			/>

			<div className="form-group row mb-lg-4">
				<div className="col-sm-4 col-form-label">Колір бекграунда</div>
				<div className="col-sm-3 d-flex align-items-center">
					<div style={styles.swatch} onClick={() => onShowPicker('colorBackground')}>
						<div style={styles.colorBackgroundProgressBar} />
					</div>
					{showColorBackgroundPicker && (
						<div style={styles.popover}>
							<div style={styles.cover} onClick={() => onClosePicker('colorBackground')} />
							<SketchPicker
								color={widget.progressBarSettings.colorBackground}
								onChange={e => onChangeColor(e, 'colorBackground', 'progressBarSettings')}
							/>
						</div>
					)}
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<div className="col-sm-4 col-form-label">{widget.goalWidgetType !== '5' ? "Колір Ціль" : "Колір Зібрано"}</div>
				<div className="col-sm-3 d-flex align-items-center">
					<div style={styles.swatch} onClick={() => onShowPicker('colorLabel')}>
						<div style={styles.colorLabelProgressBar} />
					</div>
					{showColorLabelPicker && (
						<div style={styles.popover}>
							<div style={styles.cover} onClick={() => onClosePicker('colorLabel')} />
							<SketchPicker
								color={widget.progressBarSettings.colorLabel}
								onChange={e => onChangeColor(e, 'colorLabel', 'progressBarSettings')}
							/>
						</div>
					)}
				</div>
			</div>

			{widget.progressBarSettings.gradient ? (
				<div className="form-group row mb-lg-4">
					<div className="col-sm-4 col-form-label">
						Колір індикатора
					</div>
					<div className="col-sm-6 d-flex align-items-center">
						{widget.progressBarSettings.gradientColors?.map((gradient, i) => (
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
										<SketchPicker color={gradient} onChange={e => onChangeGradientColor(e, i, 'progressBarSettings')} />
									</div>
								)}
								{widget.progressBarSettings.gradientColors.length > 2 && (
									<i className="ml-4 fas fa-times" onClick={() => onRemoveGradientPicker(i, 'progressBarSettings')} />
								)}
							</div>
						))}
						{widget.progressBarSettings.gradientColors.length < 3 && (
							<div className="fas cursor fa-plus-circle mr-3" title="Додати колір" onClick={() => addNewGradient('progressBarSettings')}></div>
						)}

						<div
							className="cursor fas fa-random ml-3"
							title="Спробувати випадкові кольори"
							onClick={() => addRandomGradient('progressBarSettings')}
						></div>
					</div>
				</div>
			) : (
				<div className="form-group row mb-lg-4">
					<div className="col-sm-4 col-form-label">Колір індикатора</div>
					<div className="col-sm-3 d-flex align-items-center">
						<div style={styles.swatch} onClick={() => onShowPicker('color')}>
							<div style={styles.progressBarColor} />
						</div>
						{showColorPicker && (
							<div style={styles.popover}>
								<div
									style={styles.cover}
									onClick={() => {
										onClosePicker('color');
									}}
								/>
								<SketchPicker color={widget.progressBarSettings.progressBarColor} onChange={e => onChangeColor(e, 'progressBarColor', 'progressBarSettings')} />
							</div>
						)}
					</div>
				</div>
			)}

			<div className="form-group row mb-lg-4">
				<label htmlFor="gradient" className="col-sm-4 col-form-label">
					Градіент індикатора
				</label>
				<div className="col-sm-4">
					<Switch
						id="progressBarGradient"
						onChange={checked => onSwitchChange(checked, 'progressBarGradient')}
						checked={widget.progressBarSettings.gradient}
						height={24}
						width={45}
						onColor={'#3579F6'}
					/>
				</div>
			</div>

			{widget.progressBarSettings.gradient && (
				<div className="form-group row mb-lg-4">
					<div className="col-sm-4 col-form-label slide-container">
						Кут градіента
					</div>
					<div className="col-sm-4 mt-2 mb-3 mb-sm-0">
						<input
							id="gradientAngleProgressBar"
							className="slider"
							type="range"
							min="0"
							max="360"
							value={widget.progressBarSettings.gradientAngle}
							onChange={onChange}
						/>
					</div>
					<div className="col-sm-2">
						<div className="input-group">
							<input
								id="gradientAngleProgressBar"
								type="number"
								className="form-control"
								value={widget.progressBarSettings.gradientAngle}
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

			{widget.progressBarSettings.gradient && (
				<div className="form-group row mb-lg-4">
					<label htmlFor="gradientAnimationProgressBar" className="col-sm-4 col-form-label">
						Анімація градіента
					</label>
					<div className="col-sm-4">
						<select
							id="gradientAnimationProgressBar"
							className="form-control"
							value={widget.progressBarSettings.gradientAnimation}
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
				<label htmlFor="turnOffProgressBarShadow" className="col-sm-4 col-form-label">
					Вимкнути тінь індикатора
				</label>
				<div className="col-sm-4">
					<Switch
						id="turnOffProgressBarShadow"
						onChange={checked => onSwitchChange(checked, 'turnOffProgressBarShadow')}
						checked={widget.progressBarSettings.turnOffProgressBarShadow}
						height={24}
						width={45}
						onColor={'#3579F6'}
					/>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<div className="col-sm-4 col-form-label slide-container">
					{Badge()}
					Радіус краю
				</div>
				<div className="col-sm-4 mt-2 mb-3 mb-sm-0">
					<input
						id="borderRadiusProgressBar"
						className="slider"
						type="range"
						min="0"
						max={widget.goalWidgetType === '3' ? "23" : "8"}
						value={widget.progressBarSettings.borderRadius || 10}
						onChange={onChange}
					/>
				</div>
				<div className="col-sm-2">
					<div className="input-group">
						<input
							id="borderRadiusProgressBar"
							type="number"
							className="form-control"
							value={widget.progressBarSettings.borderRadius || 10}
							onChange={onChange}
						/>
						<div className="input-group-append">
							<span className="input-group-text" id="amount">px</span>
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
					<input
						id="gotAmountBorderRadiusProgressBar"
						className="slider"
						type="range"
						min="0"
						max={widget.goalWidgetType === '3' ? "23" : "8"}
						value={widget.progressBarSettings.gotAmountBorderRadius || 10}
						onChange={onChange}
					/>
				</div>
				<div className="col-sm-2">
					<div className="input-group">
						<input
							id="gotAmountBorderRadiusProgressBar"
							type="number"
							className="form-control"
							value={widget.progressBarSettings.gotAmountBorderRadius || 10}
							onChange={onChange}
						/>
						<div className="input-group-append">
							<span className="input-group-text" id="amount">px</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ProgressBarSecondTab;
