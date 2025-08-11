import React, {Component} from 'react';
import helpers from '../../utils/helpers';


class MonoJar extends Component {

    render() {
        const {jar, mono, selectedJar, selectJar, onButtonClick, jars} = this.props;

        return(
			<div
				className={
					'jar-card' +
					(selectedJar?.sendId === jar.sendId ? ' selected' : '') +
					(mono && mono.jarId && mono.jarConfig ? ' selected-jar' : '') +
					(jars && jars.length === 1 ? ' only-one-jar' : '')
				}
			>
				<div className='d-flex align-items-center'>
					<div className="jar-icon mr-3">
						<a
							href={`https://send.monobank.ua/${jar.sendId}`}
							title="URL-посилання на банку"
							target="_blank"
							rel="noopener noreferrer"
						>
							<img src="/img/jar_icon.svg" alt="Банка"/>
						</a>
					</div>

					<div className="d-flex flex-column info w-100">
						<div>
							<div className="title">{jar.title}</div>
							<div className="description">{jar.description}</div>
						</div>
						<div className="goal">
							<span>Ціль: </span>
							<span className="jar-amount">{helpers.formatCurrency(jar.goal / 100)} ₴</span>
						</div>
						<div className="balance">
							<span>Баланс: </span>
							<span className="jar-amount">{helpers.formatCurrency(jar.balance / 100)} ₴</span>
						</div>
					</div>
				</div>

				<div className='d-flex flex-column ml-md-3 ml-0'>
					{mono && mono.jarId && mono.jarConfig ? (
						<div className='disconnect-jar d-flex flex-column'>
							<a
								className="btn btn-dark btn-sm d-flex align-items-center justify-content-center"
								href={`https://send.monobank.ua/${mono.jarId}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<i className="fas fa-arrow-up-right-from-square mr-2"/>
								Посилання на банку
							</a>
							<button
								className="btn btn-outline-dark btn-sm mt-2"
								onClick={() => onButtonClick()}
							>
								Відключити банку
							</button>
						</div>
					) : (
						<input
							type='radio'
							checked={selectedJar?.sendId === jar.sendId}
							onChange={(e) => selectJar(jar)}
						/>
					)}
				</div>
			</div>
		)
    }
}

export default MonoJar;
