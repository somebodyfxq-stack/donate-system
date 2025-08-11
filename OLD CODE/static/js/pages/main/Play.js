import uk from 'date-fns/locale/uk';
import moment from 'moment';
import React, {useCallback, useMemo, useState} from 'react';
import {CSVDownload} from 'react-csv';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../css/play.css';
import Switch from 'react-switch';
import Badge from '../../coms/misc/Badge';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';

const randomAPIs = [{
  id: 'js',
  label: 'JS Random',
  disabled: false
}, {
  id: 'randomOrg',
  label: 'Random Org',
  disabled: true
}];

const options = [{
  id: '1',
  name: "Не об'єднувати донати"
}, {
  id: '2',
  name: "Об'єднувати донати"
}];

const donationTypes = [{
  id: 'all',
  name: 'Всі'
}, {
  id: 'false',
  name: 'Тільки Донати'
}, {
  id: 'true',
  name: 'Тільки Підписки'
}];

const Play = () => {
  const [formData, setFormData] = useState({
    steps: '',
    name: '',
    amount: '',
    combineDonates: '1',
    donationType: 'all',
    timeFrame: [moment().subtract(1, 'day'), moment()],
    notChanged: false
  });
  const [response, setResponse] = useState({});
  const [filteredContent, setFilteredContent] = useState([]);
  const [controlData, setControlData] = useState({
    min: '',
    max: '',
    removeWinnerFromGame: false,
    disableField: false
  });
  const [randomResponse, setRandomResponse] = useState('');
  const [numberSequence, setNumberSequence] = useState([]);
  const [emailVisible, setEmailVisible] = useState(false);
  const [showDownloadCSV, setShowDownloadCSV] = useState(false);

  const onDateTimeChange = useCallback((time, element) => {
    const newFormData = { ...formData };

    newFormData.timeFrame[element] = time || moment();

    setFormData({ ...newFormData, notChanged: false });
  }, [formData]);

  const onDonateSearch = useCallback(async (e) => {
    e.preventDefault();

    const { name, timeFrame, amount, steps, combineDonates, donationType } = formData;

    const resp = await api.getDonationData({ name, amount, steps, timeFrame, combineDonates, donationType });

    if (resp?.success) {
      setResponse({ content: resp.content || [], donationData: resp.donatesWithSteps, totalAmount: resp.totalAmount });
      setFilteredContent(resp.donatesWithSteps || []);
      // - 1 the first row is a header
      setControlData({ min: 1, max: resp.donatesWithSteps.length - 1, disableField: false, removeWinnerFromGame: false });
      setFormData({ ...formData, notChanged: true });
      setRandomResponse('');
      setNumberSequence([]);
    } else {
      messageService.success('Йо, щось пішло не так');
    }
  }, [formData]);

  const getRandom = useCallback((max, min) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }, [])

  const setFilteredItems = useCallback((filteredContent, random) => {
    const filtered = filteredContent.filter(filtered => filtered[0] !== filteredContent[random][0]);

    setFilteredContent([...filtered]);
  }, [setFilteredContent])

  const getNewWinner = useCallback((min) => {
    let random = getRandom(filteredContent.length - 1, min);

    if (filteredContent.length === 1) {
      messageService.success('Виглядає, що всі гравці прийняли участь');
      return -1;
    }

    setFilteredItems(filteredContent, random);

    return filteredContent[random][5];
  }, [filteredContent, getRandom, setFilteredItems]);

  const getRandomNumber = useCallback(async (e) => {
    e.preventDefault();

    const { min, max, removeWinnerFromGame } = controlData;

    let random = null;

    if (removeWinnerFromGame && numberSequence.length) {
      random = getNewWinner(min);
    } else {
      random = getRandom(max, min);

      removeWinnerFromGame && setFilteredItems(filteredContent, random);
    }

    if (random === -1) {
      return
    }

    setRandomResponse(random);
    setNumberSequence([...numberSequence, random]);
    setControlData({...controlData, disableField: true });

    // const resp = await api.getRandomNumber({ ...controlData });

    // if (resp?.success) {
    //   setRandomResponse(resp.number);
    // } else {
    //   messageService.success('Йо, щось пішло не так');
    // }
  }, [controlData, numberSequence, getNewWinner, filteredContent, getRandom, setFilteredItems]);

  const getRandomResponse = useMemo(() => {
    if (!response.donationData || !randomResponse) return;

    const data = response.donationData;

    return (
      <section className="play-table">
        <h3 style={{ marginTop: '50px' }}>Переможець</h3>

        <h2 className="mt-3 mb-3">--{randomResponse}--</h2>
        <table className="table table-hover table-responsive-sm">
          <thead>
            <tr>
              <th scope="col">#</th>
              {data[0].map((label, i) =>
                <th scope="col" key={i} className="text-left">{label}</th>
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{randomResponse}</th>
              {data[randomResponse] && data[randomResponse].map((label, i) =>
                <th key={i} scope="row" onClick={() => setEmailVisible(!emailVisible)}>
                  {i === 4 && label ?
                    emailVisible ?
                      label : <i className='fas fa-eye' style={{ cursor: "pointer" }}></i>
                    :
                    label
                  }
                </th>
              )}
            </tr>
          </tbody>
        </table>
        <p>Номери Переможців</p>
        <div>{numberSequence.map((number, i) => <div key={i}>{i + 1}: --{number}-- <strong>{response.donationData[number][0]}</strong></div>)}</div>
      </section>
    )
  }, [response, randomResponse, emailVisible, numberSequence, ])

  const getTable = useMemo(() => {
    if (!response.donationData) return;

    const data = response.donationData;

    return (
      <section className="play-table">
        <h3 style={{ marginTop: '50px' }}>
          Список
          <span className='small'>{response.totalAmount ? ` загальна сума - ${response.totalAmount}грн` : ''}
          </span>
        </h3>
        <table className="table table-hover table-responsive-sm">
          <thead>
            <tr>
              <th scope="col">#</th>
              {data[0].map((label, i) =>
                <th scope="col" key={i} className="text-left">{label}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((donate, i) => (
              (i !== 0 && i <= 5000) && <tr key={i}>
                <th key={i} scope="row">{i}</th>
                {donate.map((item, i) =>
                  <th key={i} scope="row">{
                    i === 4 ?
                      <i className='fas fa-eye'></i>
                      :
                      item
                  }</th>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 5000 && (
          <div>...</div>
        )}
      </section>
    )
  }, [response]);

  const getControls = useMemo(() => {
    if (!response.donationData) return;

    return (
      <section className="play-table">
        <h3 style={{ marginTop: '50px' }}>Керування</h3>
        <form onSubmit={getRandomNumber}>
          <div className="row mb-3">
            <div className="col-4 col-sm-3">
              {Badge()}
              Не включати у розіргаш існуючуго переможця
            </div>
            <div className="col-4 col-sm-3">
              <Switch id="removeWinnerFromGame"
                checked={controlData.removeWinnerFromGame}
                disabled={controlData.disableField}
                onChange={(checked) => setControlData({ ...controlData, removeWinnerFromGame: checked })} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-4 col-sm-3">
              <input id="min" type="number" className="form-control mb-1"
                placeholder="Мін"
                max={controlData.max}
                value={controlData.min}
                disabled={controlData.disableField}
                onChange={(e) => setControlData({ ...controlData, min: e.target.value })} />
            </div>
            <div className="col-4 col-sm-3">
              <input id="max" type="number" className="form-control"
                placeholder="Макс"
                min={controlData.min}
                value={controlData.max}
                disabled={controlData.disableField}
                onChange={(e) => setControlData({ ...controlData, max: e.target.value })} />
            </div>
            <div className="col-4 col-sm-3">
              <select id="randomAPI" className="form-control"
                value={controlData.randomAPI}
                disabled={controlData.disableField}
                onChange={(e) => setControlData({ ...controlData, randomAPI: e.target.value })} >
                {randomAPIs.map((item, i) =>
                  <option key={i} value={item.id} disabled={item.disabled}> {item.label} </option>
                )}
              </select>
            </div>
            <div className="col-12 col-sm-3">
              <button type="submit" className="btn btn-primary mt-2 mt-sm-0"
                title="пошук">
                <span className="d-inline-block">Отримати число</span>
              </button>
            </div>
          </div>
          <div className="comment-box">
            <p>Наразі доступно тільки звичайний JS random - <strong>Math.floor(Math.random() * (max - min + 1) + min).</strong></p>
            <p><strong>Random Org </strong> в процесі підключення.</p>
          </div>
          <div>
          </div>
        </form>
      </section>
    )
  }, [controlData, response.donationData, getRandomNumber]);

  return (
    <div className="play-container">
      <form onSubmit={onDonateSearch}>
        <div className="row mb-1">
          <div className="col-3">
            <input id="name" type="text" className="form-control"
              placeholder="Ім'я донатера"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, notChanged: false, name: e.target.value })} />
          </div>
          <div className="col-3">
            <input id="steps" type="number" className="form-control"
              placeholder="Ціна квитка/Крок"
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, notChanged: false, steps: e.target.value })} />
          </div>
          <div className="col-3 time-picker-container">
            <DatePicker
              selected={moment(formData.timeFrame[0])._d}
              onChange={(time) => onDateTimeChange(time, 0)}
              showTimeSelect
              selectsStart
              startDate={moment(formData.timeFrame[0])._d}
              endDate={moment(formData.timeFrame[1])._d}
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              timeFormat="HH:mm"
              className="form-control"
              maxDate={moment(formData.timeFrame[1])._d}
              locale={uk}
              required={true}
            />
          </div>
          <div className="col-3 time-picker-container">
            <DatePicker
              selected={moment(formData.timeFrame[1])._d}
              onChange={(time) => onDateTimeChange(time, 1)}
              showTimeSelect
              selectsStart
              startDate={moment(formData.timeFrame[0])._d}
              endDate={moment(formData.timeFrame[1])._d}
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              timeFormat="HH:mm"
              className="form-control"
              minDate={moment(formData.timeFrame[0])._d}
              locale={uk}
              required={true}
            />
          </div>
        </div>
        <div className="row buttons-row mb-3">
          <div className="col-3">
            <input id="amount" type="number" className="form-control"
              placeholder="Сума від"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, notChanged: false, amount: e.target.value })} />
          </div>
          <div className="col-3">
            <select id="combineDonates" className="form-control"
              value={formData.combineDonates}
              onChange={(e) => setFormData({ ...formData, notChanged: false, combineDonates: e.target.value })}>
              {options.map((item, i) =>
                <option key={item.id} value={item.id}>{item.name}</option>
              )}
            </select>
          </div>
          <div className="col-3">
            <select id="donationType" className="form-control"
              value={formData.donationType}
              onChange={(e) => setFormData({ ...formData, notChanged: false, donationType: e.target.value })}>
              {donationTypes.map((item, i) =>
                <option key={item.id} value={item.id}>{item.name}</option>
              )}
            </select>
          </div>
        </div>
        <div className="row buttons-row">
          <div className="col-3 offset-md-6">
            <button type="button" className="btn btn-secondary"
              disabled={!response.donationData}
              title="завантажити CSV"
              onClick={() => setShowDownloadCSV(!showDownloadCSV)}>
              <i className="fa-solid fa-cloud-arrow-down mr-2"></i>
              <span className="d-none d-md-inline-block">CSV</span>
            </button>
          </div>
          <div className="col-3">
            <button type="submit" className="btn btn-primary"
              disabled={formData.notChanged}
              title="пошук">
              <i className="fa-solid fa-magnifying-glass"></i>
              <span className="d-none d-md-inline-block">Пошук</span>
            </button>
          </div>
        </div>
        <div className="comment-box">
          <p>Короткі імена не можуть бути об'єднані через можливе використання їх різними донаторами.</p>
          <p>Можна завантажити файл <strong>CSV</strong></p>
          {controlData.max > 5000 && (
            <p>Максимально видимо на сторінці - 5000 записів</p>
          )}
        </div>
      </form>
      {showDownloadCSV && (
        <div className="col-sm-1" aria-describedby="downloadCSV">
          <CSVDownload data={response.donationData} target="_blank" />
        </div>
      )}
      {getControls}
      {getRandomResponse}
      {getTable}
    </div>
  )
}

export default Play;
