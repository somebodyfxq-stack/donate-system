// import am4geodata_ukraineHigh from '@amcharts/amcharts4-geodata/ukraineHigh';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
// import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import moment from 'moment';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import '../../css/stats.css';
import {Currency, CurrencyDisplay, getAmountInUAH} from '../../enums/PaymentEnums';
import widgetEnum from '../../enums/widgetEnum';
import {api} from '../../services/api';
import {BillingBriefAlert} from './billing/BillingBusiness';

am4core.useTheme(am4themes_animated);

const timeFormat = {
    last24Hours: 'HH:00',
    last7Days: 'DD.MM',
    last30Days: 'DD.MM'
};

export const Alert = {
	donatello: {
		id: 'alert-donatello',
		text: 'Донати і підписки від 10₴ повернулися! Підключай спосіб оплати Donatello.',
		textLink: 'Підключити',
		link: '/panel/settings?tab=paymentOptions'
	},
    fondy: {
        id: 'alert-fondy',
        text: 'Виплати Fondy відбудуться у найближчі тижні, відразу після отримання коштів.',
        textLink: 'Детальніше',
        link: '/panel/payouts?tab=fondy'
    },
    telegram: {
        id: 'alert-telegram',
        text: 'У нас дуже крутий Telegram бот.',
        textLink: 'Підключити',
        link: '/panel/settings?tab=integrations'
    },
    discord: {
        id: 'alert-discord',
        text: 'Отримуй повідомлення про донати у Discord.',
        textLink: 'Спробувати',
        link: '/panel/settings?tab=integrations'
    },
    streamElements: {
        id: 'alert-streamElements',
        text: 'Інтегруй донати зі StreamElements.',
        textLink: 'Підключити',
        link: '/panel/settings?tab=integrations'
    },
    socialNetworks: {
        id: 'alert-socialNetworks',
        text: 'Додай посилання на свої медіа-канали, це пришвидшує модерацію виплат.',
        textLink: 'Додати',
        link: '/panel/page?tab=social-networks'
    },
	userAuths: {
        id: 'alert-userAuths',
        text: 'Додай ще один спосіб логування, щоб не втратити доступ до свого акаунту',
        textLink: 'Додати',
        link: '/panel/settings?tab=services'
    }
};

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
			alerts: '',
			totalAmount: '',
			subscribers: '',
			totalSubscriptionAmount: '',
			cryptoDonates: '0',
			totalCryptoDonatesAmount: '0',
            items: [],
            clients: [],
            usersDropdown: [],
            copiedUsersData: {},
            selectedUser: '',
            regions: widgetEnum.REGIONSIP,
            timePeriod: 'last7Days',
            timePeriodChartStacked: 'last7Days',
            periodDonationAmount: 0,
            usersPeriodTotalAmount: 0,
            isLoadingStats: true,
            reload: false,
            settings: null,
            integrations: null,
			isPaymentRequired: false
        }
    }

    options = [{
        name: 'Останні 24 години',
        id: 'last24Hours'
    }, {
        name: 'Останні 7 днів',
        id: 'last7Days'
    }, {
        name: 'Останні 30 днів',
        id: 'last30Days'
    }];

    onChange = (e) => {
        const {value, id} = e.target;
        let {selectedUser} = this.state;

        if (id === 'timePeriodChartStacked') {
            selectedUser = 'none';
        }

        this.setState({[id]: value, selectedUser}, () => this.getChartData(id));
    };

    componentDidMount() {
        api.getSettings().then((settings) => this.setState({settings}));
        api.getIntegrations().then((integrations) => this.setState({integrations}));

        api.getUserStats().then((resp) => {
            const {generalStats} = resp;
            const {alerts, totalAmount, cryptoDonates, totalCryptoDonatesAmount, clients} = generalStats;

            this.createLineChart(generalStats.amountByMonth, 'chartDiv');
            // this.createMap(generalStats.amountByLocation);

			api.getSubscriptionStats().then((resp) => {
				const {subscribers, totalSubscriptionAmount} = resp.data;

				this.setState({subscribers, totalSubscriptionAmount, isLoadingStats: false});
			});

            this.setState({items: [], alerts, totalAmount, cryptoDonates, totalCryptoDonatesAmount, clients});
        });

		api.getBilling(true).then((resp) => {
			if (!resp.billingInfo) {
				return;
			}

			this.setState({isPaymentRequired: resp.billingInfo?.isPaymentRequired});
		});

        this.getUserStatsTimePeriod().catch();
    }

    setProperAmount = (resp) => {
        resp.donates.forEach(donate => {
            if (donate.currency !== Currency.UAH) {
                donate.amount = getAmountInUAH(donate.amount, donate.currency);
            }

            return donate;
        })

        return resp;
    }

    chartAPICall = async (timePeriod) =>
        await api.getUserDonateTimePeriod(timePeriod);


    getChartData = async (id) => {
        let resp = await this.chartAPICall(this.state[id]);

        resp = this.setProperAmount(resp);

        if (id === 'timePeriod') {
            this.createChartData(resp);
        } else {
            this.createStackedColumn(resp);
        }
    }

    getUserStatsTimePeriod = async () => {
        const {timePeriod} = this.state;
        let resp = await this.chartAPICall(timePeriod);

        resp = this.setProperAmount(resp);

        this.createChartData(resp);
        this.createStackedColumn(resp);
    }

    createChartData = (resp) => {
        const {timePeriod} = this.state;

        const data = this.makeChartData(resp, timePeriod);
        this.createLineChart(data.data, 'timePeriodChart');

        this.setState({periodDonationAmount: data.totalAmount})
    }

    createStackedColumn = (resp) => {
        const {timePeriodChartStacked} = this.state;

        const stackedColumn = this.makeStackedColumnData(resp, timePeriodChartStacked);
        this.createStackedColumnChart(stackedColumn);

        this.setState({
            usersPeriodTotalAmount: stackedColumn.totalAmount,
            usersDropdown: stackedColumn.usersDropdown,
            copiedUsersData: resp
        })
    }

    filterByUser = (e) => {
        const {value, id} = e.target;
        const {copiedUsersData, timePeriodChartStacked} = this.state;

        const donates = value !== 'none' ? copiedUsersData.donates?.filter(c => c.clientName === value) : copiedUsersData.donates;
        const stackedColumn = this.makeStackedColumnData({donates}, timePeriodChartStacked);

        this.createStackedColumnChart(stackedColumn);

        this.setState({[id]: value, usersPeriodTotalAmount: stackedColumn.totalAmount});
    }

    makeChartData = (resp, timePeriod) => {
        let stats = {};
        let data = [];
        let totalAmount = 0;

        resp && resp.donates.forEach((d) => {
            const stamp = moment(d.createdAt).format(timeFormat[timePeriod]);

            if (!stats[stamp]) {
                stats[stamp] = 0
            }

            stats[stamp] += parseInt(d.amount);
            totalAmount += parseInt(d.amount);
            return d;
        });

        Object.keys(stats).forEach((s, i) => {
            data.push({
                amount: stats[s],
                createdAt: s,
                i
            })
        })

        data = data.sort((a, b) => a.i - b.i);

        return {data, totalAmount};
    }

    makeStackedColumnData = (resp, timePeriod) => {
        let stats = {};
        let data = [];
        let totalAmount = 0;
        let chartsLegend = [];
        let clientStats = {};
        let usersDropdown = [];

        resp.donates.forEach((d) => {
            const stamp = moment(d.createdAt).format(timeFormat[timePeriod]);

            if (!stats[stamp]) {
                stats[stamp] = {};
            }

            if (!stats[stamp][d.clientName]) {
                stats[stamp][d.clientName] = 0;
            }

            if (!clientStats[d.clientName]) {
                clientStats[d.clientName] = 0;
            }

            stats[stamp][d.clientName] += parseInt(d.amount);
            clientStats[d.clientName] += parseInt(d.amount);
            totalAmount += parseInt(d.amount);

            chartsLegend.push(d.clientName);
            return d;
        });

        Object.keys(stats).forEach((s, i) => {
            data.push({
                ...stats[s],
                createdAt: s,
                i
            })
        })

        data = data.sort((a, b) => a.i - b.i);
        chartsLegend = new Set(chartsLegend);

        Object.keys(clientStats).forEach(c => {
            usersDropdown.push({
                name: c,
                amount: clientStats[c]
            })
        })

        usersDropdown = usersDropdown.sort((a, b) => b.amount - a.amount);

        return {data, totalAmount, usersDropdown, chartsLegend, clientStats};
    }

	createStackedColumnChart = ({ data, chartsLegend }) => {
		// Create chart instance
		const chart = am4core.create("chartStacked", am4charts.XYChart);

		// Add data
		chart.data = data;

		// Create X-axis (Category Axis)
		const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = "createdAt";
		categoryAxis.renderer.grid.template.location = 0;

		// X-axis styling
		categoryAxis.renderer.labels.template.fill = am4core.color("#6D7680");
		categoryAxis.renderer.labels.template.fontSize = 12;
		categoryAxis.renderer.labels.template.fontWeight = "500";
		categoryAxis.renderer.grid.template.disabled = true; // Remove vertical grid lines
		categoryAxis.renderer.line.stroke = am4core.color("#E5E8EB"); // X-axis line color
		categoryAxis.renderer.line.strokeWidth = 1;

		// Create Y-axis (Value Axis)
		const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.min = 0;

		// Y-axis styling
		valueAxis.renderer.labels.template.fill = am4core.color("#6D7680");
		valueAxis.renderer.labels.template.fontSize = 12;
		valueAxis.renderer.labels.template.fontWeight = "500";
		valueAxis.renderer.grid.template.stroke = am4core.color("#C7CBD1"); // Light grey grid lines
		valueAxis.renderer.grid.template.strokeWidth = 1; // Thin grid lines
		valueAxis.renderer.grid.template.strokeDasharray = "4,4"; // Dashed horizontal lines
		valueAxis.renderer.grid.template.strokeOpacity = 0.8; // Semi-transparent grid lines
		valueAxis.renderer.line.stroke = am4core.color("#C7CBD1"); // Y-axis line color
		valueAxis.renderer.line.strokeWidth = 1;

		// Format Y-axis numbers without commas
		valueAxis.numberFormatter.numberFormat = "#";

		// Create series
		function createSeries(field, name) {
			// Set up series
			const series = chart.series.push(new am4charts.ColumnSeries());
			series.name = name;
			series.dataFields.valueY = field;
			series.dataFields.categoryX = "createdAt";

			// Make it stacked
			series.stacked = true;

			// Configure columns
			series.columns.template.width = am4core.percent(70);

			// Tooltip configuration
			series.columns.template.tooltipHTML = `
				<div style="
					padding: 12px 16px;
					font-size: 14px;
					font-weight: 500;
					border-radius: 10px;
					background: #fff;
					border: 1px solid #E3E5E8;
					box-shadow: 0px 4px 10px 0px rgba(235, 235, 235, 0.80);
				">
					<div style="color: #8D939C; margin-bottom: 8px;">{categoryX}</div>
					<div class="d-flex justify-content-between align-items-center w-100" style="color: #0A1830;">
						<div class="d-flex align-items-center" style="margin-right: 8px;">
							<span style="color: {stroke}; font-size: 18px; margin-right: 4px;">●</span>
							{name}
						</div>
						<div>{valueY} ₴</div>
					</div>
				</div>
			`;

			series.columns.template.tooltipY = 0; // Center tooltip vertically

			// Remove the tooltip border and pointer
			series.tooltip.getFillFromObject = false; // Prevents the tooltip from automatically getting the background color
			series.tooltip.background.strokeWidth = 0; // Remove the border
			series.tooltip.background.fill = am4core.color("#00000000"); // Remove the background color

			// Tooltip pointer orientation
			series.tooltip.pointerOrientation = "down";

			// Add labels to the columns
			const labelBullet = series.bullets.push(new am4charts.LabelBullet());
			labelBullet.label.text = "{valueY}";
			labelBullet.locationY = 0.5;
			labelBullet.label.hideOversized = true;
			labelBullet.label.fontSize = 10;

			return series;
		}

		// Add series for each legend item
		chartsLegend.forEach((c) => {
			createSeries(c, c);
		})
	};

	createLineChart = (data, div) => {
		const chart = am4core.create(div, am4charts.XYChart);
		chart.hiddenState.properties.opacity = 0; // Initial fade-in
		chart.data = data;

		// X-axis (Category Axis)
		const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.renderer.grid.template.location = 0;
		categoryAxis.dataFields.category = "createdAt";
		categoryAxis.renderer.minGridDistance = 40;

		// Styling X-axis
		categoryAxis.renderer.labels.template.fill = am4core.color("#6D7680"); // Light grey text color
		categoryAxis.renderer.labels.template.fontSize = 12;
		categoryAxis.renderer.labels.template.fontWeight = "500";
		categoryAxis.renderer.grid.template.disabled = true; // Remove vertical grid lines
		categoryAxis.renderer.line.stroke = am4core.color("#E5E8EB"); // X-axis line color
		categoryAxis.renderer.line.strokeWidth = 1;

		// Y-axis (Value Axis)
		const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.min = 0;

		// Format numbers on Y-axis to remove commas
		valueAxis.numberFormatter.numberFormat = "#";  // Use this to remove commas for thousands

		// Styling Y-axis
		valueAxis.renderer.labels.template.fill = am4core.color("#6D7680"); // Light grey text color
		valueAxis.renderer.labels.template.fontSize = 12;
		valueAxis.renderer.labels.template.fontWeight = "500";
		valueAxis.renderer.grid.template.stroke = am4core.color("#C7CBD1"); // Light grey grid lines
		valueAxis.renderer.grid.template.strokeWidth = 1; // Thin grid lines
		valueAxis.renderer.grid.template.strokeDasharray = "4,4"; // Dashed horizontal lines
		valueAxis.renderer.grid.template.strokeOpacity = 0.8; // Semi-transparent grid lines
		valueAxis.renderer.line.stroke = am4core.color("#C7CBD1"); // Y-axis line color
		valueAxis.renderer.line.strokeWidth = 1;

		// Remove inside ticks on both axes
		categoryAxis.renderer.ticks.template.disabled = true;
		valueAxis.renderer.ticks.template.disabled = true;

		// Create series
		const series = chart.series.push(new am4charts.ColumnSeries());
		series.dataFields.categoryX = "createdAt";
		series.dataFields.valueY = "amount";
		series.columns.template.strokeOpacity = 0;

		// Tooltip customization
		series.columns.template.tooltipHTML = `
			<div style="
				font-size: 14px;
				font-weight: 500;
				color: #0A1830;
				background: #fff;
				padding: 12px 16px;
				border-radius: 10px;
				border: 1px solid #E3E5E8;
				box-shadow: 0px 4px 10px 0px rgba(235, 235, 235, 0.80);
			">
				<span style="color: #8D939C;">{categoryX}</span><br />
				<span style="font-weight: 700;">
					${div === "timePeriodChart" ? "{valueY.formatNumber('#')} ₴" : "{valueY.formatNumber('#.00')} ₴"}
				</span>
			</div>
		`;

		// Remove the tooltip border and pointer
		series.tooltip.getFillFromObject = false; // Prevents the tooltip from automatically getting the background color
		series.tooltip.background.strokeWidth = 0; // Remove the border
		series.tooltip.background.fill = am4core.color("#00000000"); // Remove the background color

		series.columns.template.tooltipY = 0; // Center tooltip vertically

		// Column color configuration
		series.columns.template.adapter.add("fill", function (fill, target) {
			return am4core.color("#5991F6"); // Set uniform color for all columns
		});

		// Tooltip pointer orientation
		series.tooltip.pointerOrientation = "down";

		// Specific configuration for "timePeriodChart"
		if (div === "timePeriodChart") {
			categoryAxis.renderer.minGridDistance = 25;
			if (data.length > 15) {
				categoryAxis.renderer.labels.template.rotation = -50;
			}
		}
	};

    // createMap = (data = []) => {
    //     // Create map instance
    //     const chart = am4core.create('mapDiv', am4maps.MapChart);
    //     const regions = [...this.state.regions];

    //     // Set map definition
    //     chart.geodata = am4geodata_ukraineHigh;

    //     // Set projection
    //     chart.projection = new am4maps.projections.Miller();

    //     // Create map polygon series
    //     const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

    //     // Make map load polygon data (state shapes and names) from GeoJSON
    //     polygonSeries.useGeodata = true;

    //     // Set min/max fill color for each area
    //     polygonSeries.heatRules.push({
    //         property: 'fill',
    //         target: polygonSeries.mapPolygons.template,
    //         min: am4core.color('#FBC02D'),
    //         max: am4core.color('#dc6788')
    //     });

    //     regions.forEach((reg) => {
    //         data.forEach((d) => {
    //             if (reg.location.indexOf(d.location) !== -1) {
    //                 reg.value = d.value;
    //                 reg.amount = d.amount;
    //                 reg.count = d.value;
    //             }
    //         })
    //     })

    //     polygonSeries.data = regions;

    //     // Configure series tooltip
    //     const polygonTemplate = polygonSeries.mapPolygons.template;
    //     polygonTemplate.tooltipText = '{name}: {count} ({amount} ₴)';
    //     polygonTemplate.nonScalingStroke = true;
    //     polygonTemplate.strokeWidth = 0.5;

    //     // Create hover state and set alternative fill color
    //     const hs = polygonTemplate.states.create('hover');
    //     hs.properties.fill = am4core.color('#C2BE3C');
    // };

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    renderSpinner = () => (
        <div className="d-flex justify-content-center" style={{minHeight: "70px"}}>
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );

	isMoreThanOneLinked = (userAuths) => {
		if (!userAuths) return false;
		const linkedCount = Object.values(userAuths).filter(account => account.linked === true);
		return linkedCount.length > 1;
	};

    onAlertDismiss = (item, remind) => {
        const timeToRemind = remind ? moment().add(7, 'days') : moment().add(10, 'years');
        const timeStamp = moment(timeToRemind).format('DD.MM.YYYY');

        localStorage.setItem(item, timeStamp);

        this.setState({reload: !this.state.reload})
    }

    isAlertVisible = (item) => {
        const {settings, integrations} = this.state;
        const {status} = this.props;

        if (!settings || !integrations || !status) {
            return false;
        }

		if (item === Alert.donatello.id) {
			return true;
		}

        if (item === Alert.telegram.id && integrations.telegram?.enabled) {
            return false;
        }

        if (item === Alert.discord.id && integrations.discord?.enabled) {
            return false;
        }

        if (item === Alert.streamElements.id && integrations.streamElements?.enabled) {
            return false;
        }

		const isMoreThanOneUserAuths = this.isMoreThanOneLinked(settings.userAuths);

		if (item === Alert.userAuths.id && isMoreThanOneUserAuths) {
            return false;
        }

        const date = localStorage.getItem(item);

        if (date) {
            return moment(moment(date, 'DD.MM.YYYY')).diff(moment(), 'days') < 0;
        }

        return true;
    }

    buildAlerts = () => {
        return Object.keys(Alert).map((id, i) => (
            this.isAlertVisible(Alert[id].id) &&
            <div key={id} className={`alert alert-info ${Alert[id].className || ''} custom-alert fade show`} role="alert">
                <span>
                    <span className={`mr-2 ${Alert[id].className || ''}`}>{Alert[id].text}</span>
                    <Link to={Alert[id].target ? {pathname: Alert[id].link} : Alert[id].link}
						  target={Alert[id].target || '_self'}
						  onClick={() => this.onAlertDismiss(Alert[id].id)}>
						{Alert[id].textLink}
					</Link>
                </span>
                <span className='action-buttons'>
                    <span className={`ml-3 ${Alert[id].className || ''} action-text pointer`}
                          onClick={() => this.onAlertDismiss(Alert[id].id, true)}>
                        <i className="fa-regular fa-bell" title="Нагадати пізніше"></i>
                    </span>
                    <span className={`ml-3 ${Alert[id].className} action-text pointer`}
                          onClick={() => this.onAlertDismiss(Alert[id].id)}>
                        <i className="fa-solid fa-xmark" title="Нецікаво"></i>
                    </span>
                </span>
            </div>
        ));
    }

	buildUnpaidBillAlert = () => {
		const {isPaymentRequired} = this.state;

		return isPaymentRequired && <div className={`alert ${BillingBriefAlert.isPaymentRequired.type} alert-panel`} role="alert">
			<div className="d-flex justify-content-between align-items-center">
				<span style={{width: '25px'}}><strong><i className={`fas ${BillingBriefAlert.isPaymentRequired.icon} mr-4`}></i></strong></span>
				<div className="mr-auto">{BillingBriefAlert.isPaymentRequired.text()}</div>
				<Link to="/panel/billing?tab=business" className="alert-link">
					<button className="btn btn-sm btn-warning align-self-end">
						Переглянути
					</button>
				</Link>
			</div>
		</div>;
	};

	renderStaticChart = (noDonates) => {
		return (
			<div className='no-clients d-flex flex-column align-items-center text-center'>
				<div className='graph-container'>
					<div className='graph'></div>
					<div className='graph'></div>
					<div className='graph'></div>
					<div className='graph'></div>
					<div className='graph'></div>
					<div className='graph'></div>
					<div className='graph light'></div>
					<div className='graph light'></div>
					<div className='graph light'></div>
					<div className='graph light'></div>
				</div>
				{noDonates ? <h4>За вказаний період донати відсутні</h4> :	<h4>Тут буде відображатись ваша статистика</h4>}
				{!noDonates && <span>Переглядайте статистику донатів за різний період та фільтруйте по глядачах</span>}
			</div>
		)
	};

    render() {
        const {
			alerts, totalAmount, subscribers, totalSubscriptionAmount, cryptoDonates, totalCryptoDonatesAmount,
			timePeriod, periodDonationAmount, clients, isLoadingStats, timePeriodChartStacked,
			usersPeriodTotalAmount, usersDropdown, selectedUser
        } = this.state;

        return (
            <div className="dashboard-container">
                <div className='important-alerts'>
                    {this.buildAlerts()}
					{this.buildUnpaidBillAlert()}
                </div>
                <div className="row">
                    <section className="col-md-6 col-lg-8 mt-4">
						<div className='dashboard-card'>
							<h5>Загалом</h5>
							{isLoadingStats ? (
								this.renderSpinner()
							) : (
								<>
									<div className="row">
										<div className="col-md-12 col-lg-6">
											<div className="in-general-item">
												<div className='icon'>
													<i className="fa-solid fa-money-bills"></i>
												</div>
												<div className='d-flex flex-column'>
													<div className='amount'>
														<span>{totalAmount} </span>
														<span>{CurrencyDisplay.UAH.sign}</span>
													</div>
													<div className='quantity'>
														Донати:
														<span> {alerts}</span>
													</div>
												</div>
											</div>
										</div>

										<div className="col-md-12 col-lg-6 mt-3 mt-lg-0">
											<div className="in-general-item">
												<div className='icon'>
													<i className="fa-solid fa-wallet"></i>
												</div>
												<div className='d-flex flex-column'>
													<div className='amount'>
														<span>{totalCryptoDonatesAmount} </span>
														<span>{CurrencyDisplay.USDT.sign}</span>
													</div>
													<div className='quantity'>
														Криптодонати:
														<span> {cryptoDonates}</span>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="row mt-3">
										<div className="col-md-12 col-lg-6">
											<div className="in-general-item">
												<div className='icon'>
													<i className="fa-solid fa-user-group"></i>
												</div>
												<div className='d-flex flex-column'>
													<div className='amount'>
														<span>{totalSubscriptionAmount} </span>
														<span>{CurrencyDisplay.UAH.sign}</span>
													</div>
													<div className='quantity'>
														Підписники:
														<span> {subscribers}</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</>
							)}
						</div>
                    </section>

                    <section className="col-md-6 col-lg-4 mt-4">
						<div className='dashboard-card'>
							<h5>Топ 5 донаторів</h5>
							<div className="d-flex align-items-center justify-content-center">
								{isLoadingStats ? (
									this.renderSpinner()
								) : (
								clients.length !== 0 ? (
										<div className='d-flex flex-column w-100'>
											{clients.map((item, i) =>
												<div className="top-five-item border-botttom" key={i}>
													<div className='d-flex align-items-center'>
														<div className="number">{i+1}</div>
														<div className="client-name mr-2">{item.clientName}</div>
													</div>
													<div className="total-amount">{item.totalAmount} {CurrencyDisplay.UAH.sign}</div>
												</div>
											)}
										</div>
									) : (
										<div className='no-clients text-center'>
											<div className="icons-container">
												<div className='icon'><i className="fa-solid fa-user-group"></i></div>
												<div className='icon'><i className="fa-solid fa-user"></i></div>
												<div className='icon'><i className="fa-solid fa-user-group"></i></div>
											</div>
											<span>Переглядайте топ ваших донаторів</span>
										</div>
									)
								)}
							</div>
						</div>
                    </section>
                </div>

                {isLoadingStats && (
					<div className='dashboard-card mt-3 pt-5'>
						{this.renderSpinner()}
					</div>
				)}

				{!isLoadingStats && clients.length === 0 && (
					<div className='dashboard-card mt-3 pt-5'>
						{this.renderStaticChart(false)}
					</div>
				)}

				<div className={`${isLoadingStats || clients.length === 0 ? 'd-none' : ''}`}>
					<div className="row">
						<section className="col-sm-12 mt-4">
							<div className='dashboard-card'>
								<div className='row mb-3'>
									<div className='col-12 col-sm-3 d-flex align-items-center'>
										<h5 className='mb-3 mb-sm-0'>Донати</h5>
									</div>
									<div className='col-12 col-sm-9'>
										<div className="d-flex justify-content-between justify-content-sm-end align-items-center">
											<select id="timePeriod" className="mr-3"
													value={timePeriod}
													onChange={this.onChange}>
												{this.options.map((item, i) =>
													<option key={item.id} value={item.id}>{item.name}</option>
												)}
											</select>
											<div className='donations'>Сума: <span>{periodDonationAmount} {CurrencyDisplay.UAH.sign}</span></div>
										</div>
									</div>
								</div>

								{periodDonationAmount === 0 && (
									<div className='d-flex align-items-center justify-content-center animate__animated animate__fadeIn' style={{height: '300px'}}>
										{this.renderStaticChart(true)}
									</div>
								)}

								<div id="timePeriodChart" className={`${periodDonationAmount === 0 ? 'd-none' : ''}`} style={{width: '100%', height: '300px'}}/>
							</div>
						</section>
					</div>

					<div className="row">
						<section className="col-sm-12 mt-4">
							<div className='dashboard-card'>
								<div className='row mb-3'>
									<div className='col-12 col-md-2 d-flex align-items-center'>
										<h5 className='mb-3 mb-md-0'>Глядачі</h5>
									</div>
									<div className='col-12 col-md-10'>
										<div className="d-flex justify-content-md-end justify-content-between align-items-center donators-list">
											<select id="selectedUser" className="mr-3"
													value={selectedUser}
													onChange={this.filterByUser}>
												<option key={100000} value="none">Глядачі</option>
												{usersDropdown.map((item, i) =>
													<option key={i} value={item.name}>{`${item.name} - ${item.amount}`}</option>
												)}
											</select>

											<select id="timePeriodChartStacked" className="mr-md-3 mr-0"
													value={timePeriodChartStacked}
													onChange={this.onChange}>
												{this.options.map((item, i) =>
													<option key={item.id} value={item.id}>{item.name}</option>
												)}
											</select>
											<div className='donations spectators'>Сума: <span>{usersPeriodTotalAmount} {CurrencyDisplay.UAH.sign}</span></div>
										</div>
									</div>
								</div>

								{usersPeriodTotalAmount === 0 && (
									<div className='d-flex align-items-center justify-content-center animate__animated animate__fadeIn' style={{height: '400px'}}>
										{this.renderStaticChart(true)}
									</div>
								)}

								<div id="chartStacked" className={`${usersPeriodTotalAmount === 0 ? 'd-none' : ''}`} style={{width: '100%', height: '400px'}}/>
							</div>
						</section>
					</div>

					<div className="row">
						<section className="col-sm-12 mt-4">
							<div className='dashboard-card'>
								<h5>Статистика за весь час</h5>

								<div id="chartDiv" style={{width: '100%', height: '300px'}}/>
							</div>
						</section>
					</div>
				</div>


                {/* <div className="row mb-5">
                    <section className="col-sm-12 mt-4">
                        <h3 className="">Мапа</h3>
                        <div id="mapDiv" style={{ width: '100%', height: '300px' }} />
                    </section>
                </div> */}
            </div>
		)
    }
}

function mapStateToProps(state) {
    return {status: state.config.status};
}

export default connect(mapStateToProps)(Dashboard);
