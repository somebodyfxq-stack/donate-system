import uk from 'date-fns/locale/uk';
import moment from 'moment';
import React, {Component} from 'react';
import {CSVDownload} from 'react-csv';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {connect} from 'react-redux';
import {ConfirmModal} from '../../coms/modal/ConfirmModal';
import '../../css/donates.css';

import {DonateSource} from '../../enums/DonateEnums';
import {getAmountInUAH, getCurrencyRate, isForeignCurrency} from '../../enums/PaymentEnums';
import {isUserVerifiedStatus} from '../../enums/UserStatus';
import widgetEnum from '../../enums/widgetEnum';
import DonateModel from '../../models/DonateModel';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import helpers from '../../utils/helpers';
import {stringToNumber} from '../../utils/utils';

class Donates extends Component {

    URL_RECENT_DONATES = '/tools/recent-donates';
    widgetCurrencies = widgetEnum.CURRENCIES;

    socket = null;

    constructor(props) {
        super(props);

        this.state = {
            content: [],
            item: new DonateModel(),
            widgetGoals: [],
            token: null,
            page: 0,
            size: 15,
            pages: 0,
            first: false,
            last: false,
            total: 0,
            totalAmount: 0,
            showDownloadCSV: false,
            isSearchOn: false,
            newClientName: '',
            rowToEdit: '',
            showDonateToUser: true,
            showYoutubeToUser: true,
            isModalOpen: false,
            isDeleteModalOpen: false,
            activeAlertWidget: [],
			changeAllDonationClientName: false,
			deleteAllDonations: false,
			isLoading: true,
            formData: {
                name: '',
                amount: '',
                timeFrame: [new Date(), new Date()]
            },
			isMobileView: window.innerWidth < 768
        };
    }

    componentDidMount() {
        this.socket = helpers.buildSocket();

        this.fetchInitData();

		window.addEventListener("resize", this.handleResize);
    }

	componentWillUnmount() {
		window.removeEventListener("resize", this.handleResize);
	}

	handleResize = () => {
		const isMobileView = window.innerWidth < 768;
		if (isMobileView !== this.state.isMobileView) {
			this.setState({ isMobileView });
		}
	};

    fetchInitData() {
		const { page, size } = this.state;

		Promise.all([
			api.getDonates({ page, size }),
			api.getWidgets('goal'),
			api.getDonateVisibility(),
			api.getWidgets('alert'),
		]).then(data => {
			const [donates, goalWidgets, donateVisibility, alertWidgets ] = data;

			const { content, page, size, pages, first, last, total, token } = donates || {};
			const widgetGoals = goalWidgets.widgets;
			const {showDonateToUser, showYoutubeToUser} = donateVisibility;

			let activeAlertWidget = [];
			alertWidgets.widgets.forEach(widget => {
				if (widget.widgetFor === 'donate' && widget.widgetStatus === "active") {
					activeAlertWidget = widget.widgetsConfig;
				}
			});

			this.setState({
				content, page, size, pages, first, last, total,
				widgetGoals, token, showDonateToUser, showYoutubeToUser,
				activeAlertWidget, isLoading: false
			});
		});
    };


    fetchData() {
		const { page, size } = this.state;

		api.getDonates({ page, size }).then(donates => {
			const { content, page, size, pages, first, last, total, token } = donates || {};

			this.setState({content, page, size, pages, first, last, total, token, isLoading: false});
		});
    }

    onSkip = () => {
        const { userId } = this.props;

        if (this.socket) {
            this.socket.emit('message', { userId, skipMessage: true });
            messageService.success('Повідомлення зупинено');
        }
    };

    onPause = async (field) => {
        const data = await api.toggleDonateVisibility({ status: !this.state[field], field });

        messageService.success(data.message || 'Збережено');

        const { userId } = this.props;

        if (this.socket) {
            this.socket.emit('message', { userId, toggleDonateVisibility: true, [field]: data[field] });
            messageService.success('Дію виконано');
        }

        this.setState({ [field]: data[field] });
    };

    onChange = (event) => {
		event.preventDefault();
        const { id, value } = event.target;
        const newItem = { ...this.state.item };

        newItem[id] = value;
        this.setState({ item: newItem });
    };

    onClientNameChange = (event) => {
        this.setState({ newClientName: event.target.value });
    }

	onRadioChange = (event) => {
		const { value, name } = event.target;

		if (name === 'donationClientName') {
			this.setState({ changeAllDonationClientName: value === "all" })
		}

		if (name === 'deleteDonation') {
			this.setState({ deleteAllDonations: value === "all" })
		}
	}

	test() {
		this.setState({ activeButton: true })
	}

    changeDonationClientName = async (newName, oldName, renameAll) => {
        const { content, rowToEdit } = this.state;

        if (newName !== oldName) {
            if (renameAll) {
                content.forEach(cont => {
                    if (cont.clientName === oldName) {
                        cont.clientName = newName;
                    }

                    return cont;
                })
            } else {
                if (content[rowToEdit].clientName === oldName) {
                    content[rowToEdit].clientName = newName;
                }
            }

            await api.changeDonationClientName({ newName, oldName, renameAll, donateId: content[rowToEdit].id });
        }

        this.setState({ content, rowToEdit: '', newClientName: '', isModalOpen: false });
    }

    onDateChange = (event) => {
        const item = { ...this.state.item };

        item.createdAt = event;
        this.setState({ item: item });
    };

    onAdd = () => {
        this.setState({ item: new DonateModel() });
    };

    onEdit = (item) => {
        const donate = new DonateModel();

        item = helpers.assignDefaultValues(donate, item);
        this.setState({ item });
    };

    youtubeParser = (url) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);

        return (match && match[7].length === 11) ? match[7] : false;
    };

    onSave = (e) => {
        e.preventDefault();

        const item = this.state.item;
        const content = this.state.content.slice();

        if (item.interactionMedia) {
            item.interactionMedia = this.youtubeParser(item.interactionMedia);
        }

        if (item.amount) {
            item.actualAmount = isForeignCurrency(item.currency) ? stringToNumber(item.amount, 0) * getCurrencyRate(item.currency) : item.amount;

            api.saveDonate(item).then((resp) => {
                content.unshift(resp.data);
                this.setState({ content, item: new DonateModel() });
                this.closeAddModal.click();
                this.props.dispatch(api.getConfig());
            });
        } else {
            messageService.error('Вкажіть суму');
        }
    };

    onAddVideoToQueue = (item) => {
        const { userId } = this.props;
        const { activeAlertWidget } = this.state;

        if (this.socket) {
            let interactionWidgetId = '';

            activeAlertWidget.forEach(widget => {
                const amount = getAmountInUAH(item.amount, item.currency);
                if (widget.isSpecificAmount) {
                    if (parseInt(widget.specificAmount) === amount) {
                        interactionWidgetId = widget.interactionWidgetId;
                    }
                } else {
                    if (parseInt(widget.minAmount) <= amount && amount <= parseInt(widget.maxAmount)) {
                        interactionWidgetId = widget.interactionWidgetId;
                    }
                }
            })

            if (interactionWidgetId) {
                this.socket.emit('message', {
                    userId,
                    interactionWidget: true,
                    widgetState: 1,
                    lastDonate: item,
                    interactionWidgetId
                });
                messageService.success('Відео додано до черги відтворення');
            } else {
                messageService.error('Ой! Ми не змогли знайти інтерактивний віджет для цього відео');
            }
        }
    };

    onDelete = (rowId, deleteAll) => {
        const id = rowId ? rowId : this.state.item.id;

        if (id) {
            let itemToRemove = {};

            if (deleteAll) {
                itemToRemove = this.state.content.find((item) => item.id === id);
            }

            api.deleteDonate({ id, deleteAll, clientName: itemToRemove.clientName }).then((res) => {
                const data = res.data;
                if (data && (data.id || data.clientName)) {
                    const content = this.state.content.filter(function (item) {
                        return deleteAll ? item.clientName !== itemToRemove.clientName : item.id !== data.id;
                    });
                    this.setState({ content });
                }
                this.setState({ isDeleteModalOpen: false });
                this.closeEditModal.click();
                // this.props.dispatch(api.getConfig());
            });
        }
    };

    publishDonate = (data) => {
        api.publishDonate(data).then((resp) => {
            const donate = resp.data;

            if (donate) {
                const { content } = this.state;
                const i = content.findIndex(d => d.id === donate.id);

                if (i > -1) {
                    content[i] = donate;
                    this.setState({ content });
                }
            }
        });
    };

    banDonate = (data) => {
        api.banDonate(data).then((resp) => {
            const donate = resp.data;

            if (donate) {
                const { content } = this.state;
                const i = content.findIndex(d => d.id === donate.id);

                if (i > -1) {
                    content[i] = donate;
                    this.setState({ content });
                }
            }
        });
    };

    markAllAsSeen = async () => {
        const resp = await api.markAllAsSeen();

        if (resp.success) {
            const { content } = this.state;
            content.forEach(c => c.isPublished = true);

            this.setState({ content });
        }

        messageService.success(resp?.message || 'Ой, сталася помилка');
    }

    // manuallyApproveDonate = (data) => {
    //     api.manuallyApproveDonate(data).then(() => {
    //         this.fetchData();
    //     });
    // };

	goToPage = (page) => {
		this.setState({ page }, () => this.fetchData());
	};

    onOpenNewWindow = () => {
        const { token } = this.state;

        if (token) {
            window.open(`${this.URL_RECENT_DONATES}/${token}`, 'sharer', 'toolbar=0,status=0,width=420,height=600');
        }
    };

    onDonateSearch = async (e) => {
        e.preventDefault();
        const { name, timeFrame, amount, steps } = this.state.formData;

        const resp = await api.getDonationData({ name, amount, steps, timeFrame });

        if (resp?.success) {
            this.donationData = resp.donatesWithSteps;

            this.setState({ content: resp.content || [], isSearchOn: true, totalAmount: resp.totalAmount });
        } else {
            messageService.success('Йо, щось пішло не так');
        }
    };

    onDownloadCsvClick = () => {
        this.setState({ showDownloadCSV: true }, () => {
            setTimeout(() => {
                this.setState({ showDownloadCSV: false })
            }, 1000)
        });
    }

    onFormChange = (e) => {
        const { value, id } = e.target;

        const { formData } = this.state;
        formData[id] = value;

        this.setState({ formData });
    }

    onDateTimeChange = (time, element) => {
        const { formData } = this.state;
        formData.timeFrame[element] = time;

        this.setState({ formData });
    }

    onAllReset = () => {
        this.setState({ showDownloadCSV: false, content: [], isSearchOn: false });
        this.donationData = null;

        this.fetchData();
    }

    renderTotalAmount = () => {
        const { totalAmount, isSearchOn } = this.state;

        if (isSearchOn && totalAmount) {
            return (
                <div className="total-amount my-3">
                    <span>Загальна сума: {totalAmount} ₴</span>
                </div>
            )
        }

        return null;
    }

    toggleModal = (modal, modalState) => {
        this.setState({ [modal]: modalState })
    }

	formatDate(dateString) {
		const date = new Date(dateString);

		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');

		return `${day}.${month}.${year}, ${hours}:${minutes}`;
	}

	renderAlerts() {
		const { showDonateToUser, showYoutubeToUser } = this.state;
		const buttonText = `${showDonateToUser ? 'Зупинити' : 'Відновити'} показ донатів`;
        const showYoutubeButton = `${showYoutubeToUser ? 'Зупинити' : 'Відновити'} показ Youtube`;

		return (
			<div className='donates-alerts mb-3'>
				{!showDonateToUser && (
					<div className="alert custom-alert d-flex flex-column flex-md-row align-items-center justify-content-md-between">
						<div className='d-flex align-items-md-center'>
							<div className='info-icon-wrapper cursor mr-2'>
								<i className="fa-solid fa-info"></i>
							</div>
							<span>Показ донатів призупинено, для відновлення натисніть кнопку знизу або</span>
						</div>
						<button
							type="button"
							className="btn btn-outline-dark ml-md-3 mt-2 mt-md-0"
							title={buttonText}
							onClick={() => this.onPause('showDonateToUser')}
						>
							<i className="fa-regular fa-eye"></i>
							{buttonText}
						</button>
					</div>
				)}
				{!showYoutubeToUser && (
					<div className="alert custom-alert d-flex flex-column flex-md-row align-items-center justify-content-md-between">
						<div className='d-flex align-items-md-center'>
							<div className='info-icon-wrapper mr-2'>
								<i className="fa-solid fa-info"></i>
							</div>
							<span>Показ Youtube призупинено, для відновлення натисніть кнопку знизу або</span>
						</div>
						<button
							type="button"
							className="btn btn-outline-dark ml-md-3 mt-2 mt-md-0"
							title={showYoutubeButton}
							onClick={() => this.onPause('showYoutubeToUser')}
						>
							<i className="fa-regular fa-eye"></i>
							{showYoutubeButton}
						</button>
					</div>
				)}
			</div>
		)
	};

	renderButtons(isNotDropdown) {
		const { showDonateToUser, showYoutubeToUser } = this.state;

		const buttonText = `${showDonateToUser ? 'Зупинити' : 'Відновити'} показ донатів`;
        const showYoutubeButton = `${showYoutubeToUser ? 'Зупинити' : 'Відновити'} показ Youtube`;

		return (
			<>
				<button type="button" className={`btn btn-outline-dark ${isNotDropdown ? 'd-none d-md-flex' : ''}`}
					id="modalButton"
					data-toggle="modal" data-target="#addDonateModal"
					title="Додати повідомлення"
					onClick={this.onAdd}>
					<i className="fa-regular fa-envelope"></i>
					<span>Додати повідомлення</span>
				</button>

				<button type="button" className={`btn btn-outline-dark ${isNotDropdown ? 'd-none d-md-flex' : ''}`}
					title="Стрічка донатів (нове вікно)"
					onClick={this.onOpenNewWindow}>
					<i className="pointer fas fa-external-link-alt"></i>
					<span>Окреме вікно</span>
				</button>

				<button type="button" className={`btn btn-outline-dark ${isNotDropdown ? 'd-none d-md-flex' : ''}`}
					title="Позначити всі повідомллення як Відображені"
					onClick={this.markAllAsSeen}>
					<i className="pointer item-published fa-regular fa-circle-check"></i>
					<span>Прочитати всі</span>
				</button>

				<button type="button" className={`btn btn-outline-warning ${!isNotDropdown ? 'd-none' : ''}`}
					title="Зупинити повідомлення"
					onClick={this.onSkip}>
					<i className="fa-solid fa-triangle-exclamation"></i>
					<span>Зупинити донат</span>
				</button>

				<button type="button" className={`btn btn-outline-dark ${isNotDropdown ? 'd-none d-md-flex' : ''}`}
					title={buttonText}
					onClick={() => this.onPause('showDonateToUser')}>
					<i className={`fa-regular ${showDonateToUser ? 'fa-circle-stop' : 'fa-eye'}`}></i>
					<span>{buttonText}</span>
				</button>

				<button type="button" className={`btn btn-outline-dark ${isNotDropdown ? 'd-none d-md-flex' : ''}`}
					title={showYoutubeButton}
					onClick={() => this.onPause('showYoutubeToUser')}>
					<i className={`fa-regular ${showYoutubeToUser ? 'fa-circle-stop' : 'fa-eye'}`}></i>
					<span>{showYoutubeButton}</span>
				</button>
			</>
		)
	};

	renderControls() {
        const { isSearchOn, showDownloadCSV } = this.state;

        return (
			<div className="d-flex mb-3">
				<div className="d-flex flex-column flex-sm-row align-items-sm-baseline w-100">
					<div className="buttons-row">
						{this.renderButtons(true)}
					</div>
					<div className='d-md-none my-2 my-sm-0 mx-sm-2'>
						<div className="dropdown panel-custom-dropdown">
							<button className="btn btn-outline-dark dropdown-toggle" type="button"
								id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<i className="fa-solid fa-gear"></i>
								<span>Налаштування</span>
							</button>
							<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
								{this.renderButtons(false)}
							</div>
						</div>
					</div>
					<div className='d-flex flex-sm-column ml-md-2'>
						<button type="button" className="btn btn-outline-dark mr-2 mr-sm-0"
							data-toggle="modal" data-target="#addFiltersModal"
							title="Фільтри">
							<div className='d-flex position-relative'>
								<i className="fa-solid fa-bars"></i>
								{isSearchOn && <div className='filter-notification'></div>}
							</div>
							<span>Фільтри</span>
						</button>
						{isSearchOn && (
							<button type="button" className="btn btn-outline-dark d-flex align-items-center mt-0 mt-sm-2"
								disabled={!this.donationData}
								title="Завантажити CSV"
								onClick={this.onDownloadCsvClick}>
								<i className="fa-solid fa-file-arrow-down mr-2"></i>
								<span>CSV</span>
							</button>
						)}
					</div>
					{showDownloadCSV && (
						<div className="" aria-describedby="downloadCSV">
							<CSVDownload data={this.donationData} target="_blank" />
						</div>
					)}
				</div>
			</div>
        );
    };

    getSourceAttrs(source) {
        let title = DonateSource.manual.title;
        let iconCls = DonateSource.manual.icon;

        if (DonateSource[source] && DonateSource[source].source === source) {
            title = DonateSource[source].title;
            iconCls = DonateSource[source].icon;
        }

        const cls = `item-${source} ${iconCls}`;

        return { cls, title };
    }

    maskText = (text) => {
        if (!text) {
            return '*';
        }

        return `${text.slice(0, 1)}****`;
    }

	isLoadingContainer = () => {
		return (
			<div className="d-flex flex-column align-items-center no-data-container">
				<i className="fa-regular fa-heart"></i>
				<h5 className="text-center my-3"><strong>У вас ще немає донатів</strong></h5>
				<span>Тут будуть відображатись ваші донати. Також ви можете додати тестове повідомлення,
				щоб перевірити чи воно відображається в OBS Studio.</span>
			</div>
		)
	};

	renderDonatesInfo(content) {
		const { isSearchOn, isMobileView } = this.state;
		const amountCell = <th scope="col" className="text-right amount">Сума</th>;

		return (
			<>
				{content.length > 0 || isSearchOn ? (
					<table className="table table-responsive">
						<thead>
							<tr>
								<th scope="col" className='name'>Ім’я</th>
								{isMobileView && amountCell}
								<th scope="col" className="text-left subscription-donation">Підписка/Донат</th>
								<th scope="col" className="text-left date">Дата</th>
								<th scope="col" className="text-left system">Система</th>
								{!isMobileView && amountCell}
								<th scope="col" className="text-left">Дії</th>
							</tr>
						</thead>
						<tbody>
							{content?.map((item, i) => this.renderItem(item, i))}
						</tbody>
					</table>
				) : (
					<div>
						<hr/>
						{this.isLoadingContainer()}
					</div>
				)}
			</>
		)
	};

	renderAmountColumn(item) {
		return (
			<td>
				<div className="d-flex align-items-baseline justify-content-end">
					{item.isPaidFee && <i className="fas fa-star donate-badge" title={`Оплачено з комісією: ${item.paidAmount}`}></i>}
					{item.isNoServiceFee && <i className="fas fa-heart donate-badge" title={`Без комісії сервісу`}></i>}
					{isForeignCurrency(item.currency) && <span className="mr-1">{helpers.getCurrencySign(item.currency)}</span>}
					<span className="amount">{item.amount}</span>
					{item.currency === 'UAH' && <span className="ml-1">₴</span>}
				</div>
			</td>
		)
	};

	renderItem(item, i) {
		const { status } = this.props;
		const { isMobileView } = this.state;
        const sourceAttrs = this.getSourceAttrs(item.source);
        const smallName = item.interactionMediaName?.slice(0, 30) || '';

		return (
			<tr key={item.id}>
				<td>
					<div className="d-flex justify-content-between">
						<div>
							<div className="item-client">{item.ban ? this.maskText(item.clientName) : item.clientName}</div>
							{item.message ? <div className="item-text">{item.ban ? this.maskText(item.message) : item.message}</div> : '-'}
						</div>

						{isUserVerifiedStatus(status) && (
							<div className='item-icon' onClick={() => this.setState({ rowToEdit: i, isModalOpen: true })}>
								<i className="fa-solid fa-user-pen" title='Змінити ім’я' />
							</div>
						)}
						</div>
				</td>
				{isMobileView && this.renderAmountColumn(item)}
				<td>
					{item.goalWidgetName && <div className="badge goal">
						{item.goalWidgetName?.replace('{percentage}', '').replace('{start}', '').replace('{end}', '')}
					</div>}
					{item.isSubscription && (
						<div className="badge subscription">
							Підписка 
							{item.subscriptionSuccessCount === 1 ? ' (Нова!)' : ` (x${item.subscriptionSuccessCount})`}
						</div>
					)}
					{item.interactionMedia && (
						<div className='mt-1'>
							<a className="badge badge-pill interaction pointer mr-2"
								title={item.interactionMediaName}
								href={`https://youtube.com/watch?v=${item.interactionMedia}${item.interactionMediaStartTime ? `&t=${item.interactionMediaStartTime}` : ''}`}
								target="_blank" rel="noopener noreferrer">
								<i className="fab fa-youtube" />
								{smallName ? (
									<div className="text ml-3">{smallName}</div>
								) : ''}
							</a>
							<span
								className="badge badge-pill interaction-play pointer"
								title="Відправити відео в чергу"
								onClick={() => this.onAddVideoToQueue(item)}>
									<i className="fa-solid fa-play"></i>
							</span>
						</div>
					)}
					{item.uploadedVoice && (
						<div className='mt-1'>
							<a className="badge badge-pill voice-uploaded pointer"	href={item.uploadedVoice} target="_blank" rel="noopener noreferrer">
								<i className="fa-solid fa-microphone" />
							</a>
						</div>
					)}
				</td>
				<td>
					<div className="item-date">{this.formatDate(item.createdAt)}</div>
					<div className="item-orderId">{item.pubOrderId}</div>
				</td>
				<td>
					<div className="d-flex align-items-center">
						<i className={`item-source ${sourceAttrs.cls} mr-2`}
							title={sourceAttrs.title}
							data-toggle="modal"
							data-target={item.source === 'manual' || item.source === 'dyaka' ? '#editDonateModal' : ''}
							onClick={() => this.onEdit(item)} />
						{item.source !== 'manual' &&
							<span className={'item-source item-' + item.source}>{item.source}</span>
						}
					</div>
				</td>
				{!isMobileView && this.renderAmountColumn(item)}
				<td>
					<div className="d-flex align-items-center" style={{marginTop: '-5px'}}>
						<div className='item-icon' onClick={() => this.publishDonate({ id: item.id, publish: !item.isPublished })}>
							<i className={`item-status ${item.isPublished ? 'item-published fas'
								: 'far'} fa-check-circle`}
								title={item.isPublished ? 'Опубліковано' : 'Неопубліковано'} />
						</div>

						<div className='item-icon' onClick={() => this.banDonate({ id: item.id, ban: !item.ban })}>
							<i className={`item-status item-ban fas ${item.ban ? 'fa-eye-slash' : 'fa-eye'}`}
								title={item.ban ? 'Приховано' : 'Показано'} />
						</div>

						{(item.source === 'manual' || item.source === 'mono') && (
							<div className='item-icon' onClick={() => this.setState({itemToDelete: item.id, isDeleteModalOpen: true})}>
								<i className="fas fa-trash-alt remove-row" title="Видалити" />
							</div>
						)}
					</div>
				</td>
			</tr>
		)
	};

	renderPagination() {
		const { page, size, total, isSearchOn } = this.state;

		if (total === 0 || isSearchOn) {
			return null;
		}

		const totalPages = Math.ceil(total / size);
		const currentPage = page + 1;
		const pages = [];
		const maxVisiblePages = 1; // Number of pages to the left and right of the current page

		// Add first page
		if (currentPage >= 1 && total > size) {
			pages.push(1);
		}

		// Intermediate pages
		for (let i = Math.max(2, currentPage - maxVisiblePages); i <= Math.min(totalPages - 1, currentPage + maxVisiblePages); i++) {
			pages.push(i);
		}

		// Add last page
		if (currentPage <= totalPages && total > size) {
			pages.push(totalPages);
		}

		return (
			<div className="pagination d-flex align-items-center justify-content-center mt-3">
				{pages.map((page, index) => {
					const showDots = index > 0 && page > pages[index - 1] + 1;

					return (
						<React.Fragment key={page}>
							{showDots && <span className="dots">...</span>}
							<button
								className={`page-btn ${currentPage === page ? 'active' : ''}`}
								onClick={() => this.goToPage(page - 1)} // Передаємо сторінку в форматі 0-індекса
							>
								{page}
							</button>
						</React.Fragment>
					);
				})}
			</div>
		)
	};


    renderAddModal() {
        const { item, widgetGoals } = this.state;

        return <div className="modal fade add-donate-modal" id="addDonateModal" tabIndex="-1" role="dialog"
            aria-labelledby="addDonateModal" style={{paddingRight: '0px'}}>
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="d-flex justify-content-center">
                        <h3>Додати повідомлення</h3>
                    </div>
					<div className='text-disclaimer mb-3'>
						Додайте тестове повідомлення, щоб перевірити чи воно відображається в OBS Studio.
						Після цього повідомлення можна буде видалити.
					</div>
                    <div className="modal-body">
                        <form onSubmit={(e) => this.onSave(e)}>
							<div className='row'>
								<div className='col-md-6 form-group'>
									<label htmlFor="clientName">Ім’я донатора</label>
									<input id="clientName" type="text" className="form-control"
										value={item.clientName}
										placeholder='Вкажіть ім’я'
										onChange={this.onChange} />
								</div>
								{widgetGoals.length !== 0 ?
									<div className="col-md-6 form-group">
										<label htmlFor="clientName">Ціль</label>
										<select id="goalWidgetId" type="text" className="form-control"
											value={item.goalWidgetId}
											onChange={this.onChange}>
											<option key={1000} value="">Оберіть ціль</option>
											{widgetGoals.map((w, i) =>
												<option key={i} value={w.widgetId}>{w.widgetLabel ? w.widgetLabel.replace('{percentage}', '').replace('{start}', '').replace('{end}', '') : ''}</option>
											)}
										</select>
									</div>
									:
									null
								}
							</div>
                            <div className="form-group">
                                <label htmlFor="message">Повідомлення</label>
                                <textarea id="message" className="form-control" rows="4"
                                    value={item.message}
									placeholder='Напишіть ваше повідомлення для підписників'
                                    onChange={this.onChange} />
                            </div>

							<div className="row">
								<div className="col-md-6 form-group">
									<label htmlFor="amount">Сума</label>
									<input id="amount" type="number" className="form-control" required
										placeholder='00.00'
										value={item.amount}
										onChange={this.onChange} />
								</div>
								<div className="col-md-6 form-group d-flex justify-content-between align-items-end">
									{this.widgetCurrencies.map((c, i) =>
										<button key={c.label} type='button' id="currency"
											className={`btn btn-currency ${item.currency === c.label ? 'active' : ''}`}
											value={c.label}
											onClick={(e) => this.onChange(e)}
										>
											{c.sign} {c.label}
										</button>
									)}
								</div>
								<div className="col-md-6 form-group">
									<label htmlFor="date">Дата</label>
									<DatePicker
										selected={moment(item.createdAt)._d}
										onChange={this.onDateChange}
										dateFormat="dd.MM.yyyy"
										className="form-control"
										maxDate={moment()._d}
									/>
								</div>
							</div>

                            <div className="form-group">
                                <div className="row">
                                    <div className="col-md-6 form-group">
                                        <label htmlFor="interactionMedia">Посилання на Youtube відео</label>
                                        <input id="interactionMedia" type="text" className="form-control"
                                            value={item.interactionMedia}
											placeholder='https://www.youtube.com'
                                            onChange={this.onChange} />
                                    </div>
                                    <div className="col-md-6 form-group">
                                        <label htmlFor="interactionMediaStartTime">Початок відео у секундах</label>
                                        <input id="interactionMediaStartTime" type="number" className="form-control"
                                            onChange={this.onChange}
											placeholder='0:00'
                                            value={item.interactionMediaStartTime} />
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mt-lg-4">
                                <button type="button" className="btn btn-outline-dark mr-lg-3" data-dismiss="modal"
                                    ref={closeAddModal => this.closeAddModal = closeAddModal}>
                                    Скасувати
                                </button>
                                <button type="submit" className="btn btn-dark"
                                    onClick={(e) => this.onSave(e)}>
                                    Додати повідомлення
                                </button>
                            </div>
                        </form>
                    </div>

					<div className='close-icon' data-dismiss="modal">
						<i className="fa-solid fa-xmark"></i>
					</div>
                </div>
            </div>
        </div>;
    }

    renderEditModal() {
        const { item } = this.state;

        return <div className="modal fade add-donate-modal" id="editDonateModal" tabIndex="-1" role="dialog"
            aria-labelledby="editDonateModal" style={{paddingRight: '0px'}}>
            <div className="modal-dialog" role="document">
                <div className="modal-content">
					<div className="d-flex justify-content-center">
                        <h3>Редагувати повідомлення</h3>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={(e) => {
                            e.preventDefault()
                        }}>
                            <div className="form-group">
                                <label htmlFor="clientName">Ім’я донатора</label>
                                <input id="clientName" type="text" className="form-control" disabled="disabled"
                                    value={item.clientName} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Повідомлення</label>
                                <textarea id="message" className="form-control" rows="3" disabled="disabled"
                                    value={item.message} />
                            </div>

							<div className="row">
								<div className="col-6 form-group">
									<label htmlFor="amount">Сума</label>
									<input id="amount" type="number" className="form-control" required
										disabled="disabled"
										value={item.amount} />
								</div>
								<div className="col-6 form-group">
									<label htmlFor="clientName">Валюта</label>
									<select id="currency" className="form-control"
										value={item.currency}
										disabled="disabled">
										{this.widgetCurrencies.map((item, i) =>
											<option key={item.label} value={item.label}>{item.sign} {item.label}</option>
										)}
									</select>
								</div>
								<div className="col-md-6 form-group">
									<label htmlFor="date">Дата</label>
									<input id="date" type="text" className="form-control" required
										disabled="disabled"
										value={item.createdAt} />
								</div>
							</div>

							<div className="row mb-3">
								<div className="col-md-6 form-group">
									<label htmlFor="interactionMedia">Посилання на Youtube відео</label>
									<input id="interactionMedia" type="text" className="form-control"
										placeholder='https://www.youtube.com'
										value={item.interactionMedia}
										onChange={this.onChange} />
								</div>
								<div className="col-md-6 form-group">
									<label htmlFor="interactionMediaStartTime">Початок відео у секундах</label>
									<input id="interactionMediaStartTime" type="number" className="form-control"
										placeholder='0.00'
										onChange={this.onChange}
										value={item.interactionMediaStartTime} />
								</div>
							</div>

                            <div className="d-flex justify-content-between mt-lg-4">
                                <button type="button" className="btn btn-outline-dark mr-3" data-dismiss="modal"
                                    ref={closeEditModal => this.closeEditModal = closeEditModal}>
                                    Скасувати
                                </button>
                                <button type="button" className="btn btn-danger"
                                    onClick={() => this.onDelete()}>
                                    Видалити
                                </button>
                            </div>
                        </form>
                    </div>
					<div className='close-icon' data-dismiss="modal">
						<i className="fa-solid fa-xmark"></i>
					</div>
                </div>
            </div>
        </div>;
    }

    renderDeleteModal() {
        const { isDeleteModalOpen, itemToDelete, deleteAllDonations } = this.state;

        const itemToRemove = this.state.content.find((item) => item.id === itemToDelete);

        return (
            <ConfirmModal
                isModalOpen={isDeleteModalOpen}
                toggleModal={(state) => this.toggleModal('isDeleteModalOpen', state)}
            >
                <div className="h-100 d-flex flex-column justify-content-between confirm-modal-content">
                    <h4>Видалити донат</h4>

					<div className="form-check mb-2">
						<input
							className="form-check-input"
							type="radio"
							name="deleteDonation"
							id="deleteDonation"
							value="single"
							checked={!deleteAllDonations}
							onChange={this.onRadioChange}
						/>
						<label
							className="form-check-label"
							htmlFor="deleteDonation"
						>
							Видалити лише цей донат
						</label>
					</div>

					<div className="form-check mb-3">
						<input
							className="form-check-input"
							type="radio"
							name="deleteDonation"
							id="deleteAllDonations"
							value="all"
							disabled={!itemToRemove?.clientName}
							checked={deleteAllDonations}
							onChange={this.onRadioChange}
						/>
						<label
							className="form-check-label"
							htmlFor="deleteAllDonations"
						>
							Видалити всі донати
						</label>
					</div>

					<div className="d-flex justify-content-between">
						<button type="button" className="btn btn-outline-dark confirm-modal-button"
							onClick={() => this.toggleModal('isDeleteModalOpen', false)}>
							Скасувати
						</button>

                        <button type="button" className="btn btn-dark confirm-modal-button"
                            onClick={() => this.onDelete(itemToDelete, deleteAllDonations)}>
                            Видалити
                        </button>
                    </div>
                </div>
            </ConfirmModal>
        )
    }

    renderModal() {
        const { isModalOpen, newClientName, rowToEdit, content, changeAllDonationClientName } = this.state;
        const item = {...content[rowToEdit]};

        return (
            <ConfirmModal
                isModalOpen={isModalOpen}
                toggleModal={(state) => this.toggleModal('isModalOpen', state)}
            >
                <div className="h-100 d-flex flex-column justify-content-between confirm-modal-content">
                    <h4>Змінити ім’я</h4>
					<div className='text-disclaimer mb-3'>
						Зміна імені буде відображатись лише вам.
					</div>
					<div className="form-group">
						<input id="clientName" type="text" className="form-control"
							value={newClientName || item.clientName}
							onChange={this.onClientNameChange}
						/>
					</div>
					<div className="form-check mb-2">
						<input
							className="form-check-input"
							type="radio"
							name="donationClientName"
							id="changeDonationClientName"
							value="single"
							checked={!changeAllDonationClientName}
							onChange={this.onRadioChange}
						/>
						<label
							className="form-check-label"
							htmlFor="changeDonationClientName"
						>
							Змінити лише для цього донату
						</label>
					</div>

					<div className="form-check mb-3">
						<input
							className="form-check-input"
							type="radio"
							name="donationClientName"
							id="changeAllDonationClientName"
							value="all"
							checked={changeAllDonationClientName}
							onChange={this.onRadioChange}
						/>
						<label
							className="form-check-label"
							htmlFor="changeAllDonationClientName"
						>
							Змінити для всіх донатів цієї людини
						</label>
					</div>

                    <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-outline-dark confirm-modal-button"
                            onClick={() => this.toggleModal('isModalOpen', false)}>
                            Скасувати
                        </button>
                        <button type="button" className="btn btn-dark confirm-modal-button"
                            onClick={() => this.changeDonationClientName(
                                newClientName.trim() || item.clientName.trim(),
                                item.clientName.trim(),
                                changeAllDonationClientName
                            )}>
                            Зберегти
                        </button>
                    </div>
                </div>
            </ConfirmModal>
        )
    }

	renderAddFiltersModal() {
		const { name, amount, timeFrame, steps } = this.state.formData;
		const { isSearchOn } = this.state;

		return (
			<div className="modal fade modal-slide-right" id="addFiltersModal" tabIndex="-1" role="dialog"
				aria-labelledby="addFiltersModal" aria-hidden="true">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<h4 className='mb-4'><strong>Фільтри</strong></h4>
						<div className='row'>
							<div className='col-md-6'>
								<div className="form-group">
									<label htmlFor="name">Ім'я</label>
									<input id="name" type="text" className="form-control mb-1"
                                        placeholder="Вкажіть ім'я"
                                        value={name}
                                        onChange={this.onFormChange}
									/>
								</div>
							</div>
							<div className='col-md-6'>
								<div className="form-group">
									<label htmlFor="amount">Сума</label>
									<input id="amount" type="text" className="form-control"
                                        placeholder="Вкажіть суму"
                                        value={amount}
                                        onChange={this.onFormChange}
									/>
								</div>
							</div>
							<div className='col-md-6'>
								<div className="form-group">
									<label htmlFor="steps">Крок</label>
									<input id="steps" type="text" className="form-control"
                                        placeholder="Вкажіть крок"
                                        value={steps}
                                        onChange={this.onFormChange}
									/>
								</div>
							</div>
						</div>

						<div className='row mt-2'>
							<div className='col-6'>
								<div className="form-group">
									<label>Початкова дата</label>
									<DatePicker
										selected={moment(timeFrame[0])._d}
										onChange={(time) => this.onDateTimeChange(time, 0)}
										showTimeSelect={false}
										selectsStart
										startDate={moment(timeFrame[0])._d}
										endDate={moment(timeFrame[1])._d}
										timeIntervals={15}
										dateFormat="yyyy/MM/dd"
										timeFormat="HH:mm"
										className="form-control"
										maxDate={moment(timeFrame[1])._d}
										locale={uk}
									/>
								</div>
							</div>
							<div className='col-6'>
								<div className="form-group">
									<label>Кінцева дата</label>
									<DatePicker
                                        selected={moment(timeFrame[1])._d}
                                        onChange={(time) => this.onDateTimeChange(time, 1)}
                                        showTimeSelect={false}
                                        selectsStart
                                        startDate={moment(timeFrame[0])._d}
                                        endDate={moment(timeFrame[1])._d}
                                        timeIntervals={15}
                                        dateFormat="yyyy/MM/dd"
                                        timeFormat="HH:mm"
                                        className="form-control"
                                        minDate={moment(timeFrame[0])._d}
                                        locale={uk}
                                    />
								</div>
							</div>
						</div>

						<div className='button-container'>
							<div>
								{isSearchOn && (
									<button type="button" className="btn btn-outline-dark" onClick={this.onAllReset}>
										Скинути фільтри
									</button>
								)}
							</div>
							<button type="button" className="btn btn-primary" onClick={this.onDonateSearch}>
								Фільтрувати
							</button>
						</div>

						<div className='close-icon' data-dismiss="modal">
							<i className="fa-solid fa-xmark"></i>
						</div>
					</div>
				</div>
			</div>
		)
	};

    render() {
        const { content, isLoading } = this.state;

        return (
			<>
				{this.renderAlerts()}
				<div className="donates">
					{this.renderControls()}
					{this.renderTotalAmount()}
					{!isLoading && this.renderDonatesInfo(content)}
					{!isLoading && this.renderPagination()}
					{this.renderAddModal()}
					{this.renderEditModal()}
					{this.renderModal()}
					{this.renderDeleteModal()}
					{this.renderAddFiltersModal()}
				</div>
			</>
        )
    }
}

function mapStateToProps(state) {
    const { userId, nickname, status } = state.config;

    return { userId, nickname, status };
}

export default connect(mapStateToProps)(Donates);
