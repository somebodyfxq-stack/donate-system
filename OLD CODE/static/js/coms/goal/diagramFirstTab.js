import React, {useEffect} from 'react';
import ReactQuill from 'react-quill';
import Switch from 'react-switch';
import widgetEnum from '../../enums/widgetEnum';
import Badge from '../misc/Badge';

const widgetCurrencies = widgetEnum.CURRENCIES;

const DiagramFirstTab = ({ widget, onChange, onSwitchChange, onTextEditorChange }) => {
	useEffect(() => {
		localStorage.setItem('widgetGoal', JSON.stringify({ ...widget }));
	}, [widget]);

	return (
		<>
			<div className="form-group row mb-lg-4"></div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="widgetLabel" className="col-sm-4 col-form-label">Назва збору</label>
				<div className="col-sm-6">
					<input id="widgetLabel" type="text" className="form-control" required
						value={widget.widgetLabel}
						onChange={onChange} />
				</div>
			</div>

			{widget.goalWidgetType !== '5' && (
				<div className="form-group row mb-lg-4">
					<label htmlFor="nameWidget" className="col-sm-4 col-form-label">Текст збору у віджеті</label>
					<div className="col-sm-6">
						<input id="widgetName" type="text" className="form-control" required
							value={widget.widgetName}
							onChange={onChange} />
						<small id="showUserText" className="form-text text-muted">
							<div className="mt-2 mb-1">
								Доступно: <u>{'{percentage} {start} {end} {currency}'}</u>
							</div>
						</small>
					</div>
				</div>
			)}

			{widget.goalWidgetType !== '5' && (
				<div className="form-group row mb-lg-4">
					<label htmlFor="nameWidget" className="col-sm-4 col-form-label">Текст після завершення збору</label>
					<div className="col-sm-6">
						<input id="widgetCompletedText" type="text" className="form-control"
							value={widget.widgetCompletedText}
							onChange={onChange} />
					</div>
				</div>
			)}

			{widget.goalWidgetType !== '3' && (
				<div className="form-group row mb-lg-4">
					<label htmlFor="widgetCollected" className="col-sm-4 col-form-label">{Badge()}Текст Зібрано</label>
					<div className="col-sm-6">
						<input id="widgetCollected" type="text" className="form-control"
							value={widget.widgetCollected}
							onChange={onChange} />
					</div>
				</div>
			)}

			{widget.goalWidgetType !== '5' && (
				<div className="form-group row mb-lg-4">
					<label htmlFor="widgetGoal" className="col-sm-4 col-form-label">{Badge()}Текст Ціль</label>
					<div className="col-sm-6">
						<input id="widgetGoal" type="text" className="form-control"
							value={widget.widgetGoal}
							onChange={onChange} />
					</div>
				</div>
			)}

			<div className="form-group row mb-lg-4">
				<label htmlFor="viewType" className="col-sm-4 col-form-label">
					Відображати віджет на вашій Донат сторінці
				</label>
				<div className="col-sm-4">
					<Switch id="showOnDonationPage"
						onChange={(checked) => onSwitchChange(checked, 'showOnDonationPage')}
						checked={widget.showOnDonationPage}
					/>
				</div>
			</div>

			{widget.showOnDonationPage && (
				<div className="form-group row mb-lg-4">
					<label htmlFor="widgetDescription" className="col-sm-4 col-form-label">{Badge()}Опис збору на вашій Донат сторінці</label>
					<div className="col-sm-6">
						<small id="showUserText" className="form-text text-muted">
							<div className="mt-2 mb-2">
								Цей текст буде відображено на донат сторінці, як опис до збору коштів. Можете описати, що саме ви збираєте і додати якусь корисну інформацію.
							</div>
						</small>
						<ReactQuill
							theme="snow"
							value={widget.widgetDescription}
							onChange={(e, delta, source) => onTextEditorChange(e, source)}
						/>
					</div>
				</div>
			)}

			<div className="form-group row mb-lg-4">
				<label htmlFor="hideMinMaxNumbersDonatePage" className="col-sm-4 col-form-label">
					Заховати початкову і кінцеву суму на Донат сторінці
				</label>
				<div className="col-sm-4">
					<Switch id="hideMinMaxNumbersDonatePage"
						onChange={(checked) => onSwitchChange(checked, 'hideMinMaxNumbersDonatePage')}
						checked={widget.hideMinMaxNumbersDonatePage}
						disabled={!widget.showOnDonationPage}
					/>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="widgetCurrency" className="col-sm-4 col-form-label">Валюта віджету</label>
				<div className="col-sm-4">
					<select id="widgetCurrency" className="form-control"
						value={widget.widgetCurrency}
						onChange={onChange}
						disabled={widget.widgetId}>
						{widgetCurrencies.map((item, i) =>
							<option key={item.label} value={item.label}> {item.name} {item.sign} </option>
						)}
					</select>
					<small id="showUserText" className="form-text text-muted">
						валюту можна змінювати перед <strong>створенням віджета</strong> і не може бути змінена після його створення
					</small>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="showCurrencySign" className="col-sm-4 col-form-label">
					Показувати знак валюти у віджеті
				</label>
				<div className="col-sm-6">
					<Switch id="showCurrencySign"
						onChange={(checked) => onSwitchChange(checked, 'showCurrencySign')}
						checked={widget.showCurrencySign}
					/>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="startAmount" className="col-sm-4 col-form-label">Початкова сума</label>
				<div className="col-sm-3">
					<div className="input-group">
						<input id="startAmount" type="number" min="0" className="form-control" required
							value={widget.startAmount}
							onChange={onChange} />
						<div className="input-group-append">
							<span className="input-group-text" id="amount">
								{widgetCurrencies.find(c => c.label === widget.widgetCurrency)?.sign || '₴'}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="goalAmount" className="col-sm-4 col-form-label">Цільова сума</label>
				<div className="col-sm-3">
					<div className="input-group">
						<input id="goalAmount" type="number" min="1" className="form-control" required
							value={widget.goalAmount}
							onChange={onChange} />
						<div className="input-group-append">
							<span className="input-group-text" id="amount">
								{widgetCurrencies.find(c => c.label === widget.widgetCurrency)?.sign || '₴'}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="maxAmount" className="col-sm-4 col-form-label">Зібрано</label>
				<div className="col-sm-3">
					<div className="input-group">
						<input id="donatedAmount" type="number" min="0" className="form-control" required
							value={widget.donatedAmount}
							onChange={onChange} />
						<div className="input-group-append">
							<span className="input-group-text" id="amount">
								{widgetCurrencies.find(c => c.label === widget.widgetCurrency)?.sign || '₴'}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="addSubscriptionAmount" className="col-sm-4 col-form-label">
					Додавати cуму з регулярних підписок?
				</label>
				<div className="col-sm-6">
					<Switch id="addSubscriptionAmount"
						onChange={(checked) => onSwitchChange(checked, 'addSubscriptionAmount')}
						checked={widget.addSubscriptionAmount}
					/>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="showAmountWithoutFee" className="col-sm-4 col-form-label">
					Додавати суму без комісії?
				</label>
				<div className="col-sm-6">
					<Switch id="showAmountWithoutFee"
						onChange={(checked) => onSwitchChange(checked, 'showAmountWithoutFee')}
						checked={widget.showAmountWithoutFee}
					/>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="doubleAmountGoal" className="col-sm-4 col-form-label">
					Подвоювати ціль збору після її досягнення?
				</label>
				<div className="col-sm-6">
					<Switch id="doubleAmountGoal"
						onChange={(checked) => onSwitchChange(checked, 'doubleAmountGoal')}
						checked={widget.doubleAmountGoal}
					/>
					<small id="showUserText" className="form-text text-muted">
						як тільки ви досягнете цілі <strong>збору</strong> нова <strong>ціль збору</strong> збільшується у два рази.
					</small>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="keepCounting" className="col-sm-4 col-form-label">
					Збільшувати суму у "Зібрано"
				</label>
				<div className="col-sm-6">
					<Switch id="keepCounting"
						onChange={(checked) => onSwitchChange(checked, 'keepCounting')}
						checked={widget.keepCounting}
						disabled={widget.doubleAmountGoal}
					/>
					<small id="showUserText" className="form-text text-muted">
						продовжимо додавати суму донатів до <strong>Зібрано</strong> після досягнення 100% збору.
					</small>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="keepCounting" className="col-sm-4 col-form-label">
					Збільшувати % збору
				</label>
				<div className="col-sm-6">
					<Switch id="keepCountingPercentage"
						disabled={!widget.keepCounting || widget.doubleAmountGoal}
						onChange={(checked) => onSwitchChange(checked, 'keepCountingPercentage')}
						checked={widget.keepCountingPercentage}
					/>
					<small id="showUserText" className="form-text text-muted">
						продовжимо додавати % отриманої суми <strong>120% / 140%</strong> після досягнення 100% збору.
					</small>
				</div>
			</div>

			<div className="form-group row mb-lg-4">
				<label htmlFor="keepCounting" className="col-sm-4 col-form-label">
					{Badge({ label: 'Beta', variant: 'info' })}
					Посилання на Конверт
				</label>
				<div className="col-sm-6">
					<input id="pbEnvelopeUrl" type="text" className="form-control"
						placeholder="https://next.privat24.ua/send/a1b2c"
						value={widget.pbEnvelopeUrl}
						onChange={onChange} />
					<small id="showUserText" className="form-text text-muted">
						Усі дані про збір будуть синхронізуватися зі сторінкою Конверту (Приват). Донати з Донателло ігноруватимуться.
					</small>
				</div>
			</div>
		</>
	)
}

export default DiagramFirstTab;
