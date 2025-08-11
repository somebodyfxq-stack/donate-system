import React, {Component} from 'react';
// import {monoDemoData} from '../enums/monoDemoData';
import {monoApi} from '../../services/monoApi';
import MonoJar from './MonoJar';


class MonoLink extends Component {

    constructor(props) {
        super(props);

        this.state = {
            token: '',
            getClientInfoDone: false, // allow fetch client info only once, to prevent ban from api provider
            jars: [],
            selectedJar: ''
        };
    }

    onChange = (e) => {
        this.setState({token: e.target.value});
    };

    getClientInfo = (e) => {
        e.preventDefault();

        const {token} = this.state;

        // test
        // if (monoDemoData.jars) {
        //     this.setState({jars: monoDemoData.jars, getClientInfoDone: true});
        // }

        // prod
        monoApi.getClientInfo(token).then((res) => {
            // console.log(res);

            if (res.errorDescription) {
                // console.log(res.errorDescription);
            } else {
                this.setState({jars: res.jars, getClientInfoDone: true});
            }
        });
    }

    selectJar = (selectedJar) => {
        // console.log('select jar');
        // console.log(selectedJar);
        this.setState({selectedJar});
    }

    linkJar = (e) => {
        e.preventDefault();

        const {token, selectedJar} = this.state;
        const data = {jarId: selectedJar.sendId, jarConfig: selectedJar};

        // console.log('Save data');
        // console.log(data);

        this.props.onSave(data, token);
    }

    render() {
        const {token, getClientInfoDone, jars, selectedJar} = this.state;
        const {onCancel} = this.props;

        return(
			<form className="mt-3">
				<div className="payment-item-description">
					<span>Токен Моно *</span>

					<div className='d-flex mt-2'>
						<input
							id="token"
							type="text"
							className="form-control mr-md-3"
							required
							onChange={(e) => this.onChange(e)}
							value={token}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault(); // and ignore
								}
							}}
						/>

						<button
							className="btn btn-dark btn-sm d-none d-md-block"
							disabled={!token || getClientInfoDone}
							onClick={(e) => this.getClientInfo(e)}
						>
							Отримати дані
						</button>
					</div>

					{!jars && (
						<div className="alert alert-warning mt-3" role="alert">
							Ой, ми не знайшли жодної банки! <br/>
							Створіть <strong>Банку</strong> у застосунку <strong>Монобанк</strong>, та спробуйте знову. Накопичення - Відкрити банку.
						</div>
					)}

					<div className="comment-box lite-text">
						<p>
							<strong>Токен Моно</strong> можна отримати на сайті <a href="https://api.monobank.ua" target="_blank" rel="noopener noreferrer">api.monobank.ua</a>.
						</p>
						<p>
							Токен використовується <strong>лише у браузері</strong>, щоб отримати <strong>список
							банок</strong> і створити безпечний <strong>вебхук</strong> на наш сервіс.
							Вебхук потрібний для отримання даних про нові донати і оновлення віджетів.
						</p>
						<p>
							<strong>Донателло не зберігає токен</strong>. Ми зберігаємо лише відкриті дані про банку (посилання, назва, ціль та ін.).
						</p>
					</div>
				</div>


				<div className="d-flex justify-content-between mt-3">
					{jars && jars.length === 0 && (
						<button className="btn btn-outline-dark btn-sm mr-2"
								onClick={(e) => onCancel(e)}>
							Скасувати
						</button>
					)}
					<button className="btn btn-dark btn-sm d-block d-md-none" disabled={!token || getClientInfoDone}
							onClick={(e) => this.getClientInfo(e)}>
						Отримати дані
					</button>
				</div>

				<div className="form-group mb-2 mt-2">
					<div className="jars-container">
						{jars && jars.map((jar) =>
							<MonoJar
								key={jar.sendId}
								jar={jar}
								jars={jars}
								selectedJar={selectedJar}
								selectJar={this.selectJar}
							/>
						)}
					</div>

					{jars && jars.length > 0 && <div className="d-flex justify-content-between">
						<button className="btn btn-outline-dark btn-sm mr-2"
								onClick={(e) => onCancel(e)}>
							Скасувати
						</button>
						<button className="btn btn-dark btn-sm" disabled={!selectedJar}
								onClick={(e) => this.linkJar(e)}>
							Підключити
						</button>
					</div>}
				</div>
			</form>
		)
	}
}

export default MonoLink;
