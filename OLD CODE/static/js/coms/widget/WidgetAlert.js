import React, {Component} from 'react';
import Nav from 'react-bootstrap/Nav';
import ReactModal from 'react-modal';
import Switch from 'react-switch';
import widgetEnum, {WIDGET_FOR} from '../../enums/widgetEnum';
import {WidgetAlertItemModel} from '../../models/WidgetAlertModel';

import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';
import helpers from '../../utils/helpers';

import {MAX_FILE_SIZE, UPLOAD_LIMIT} from '../../utils/useFileInteraction';
import CustomizedAlert from '../alert/CustomizedAlert';
import FirstTab from '../alert/FirstTab';
import SecondTab from '../alert/SecondTab';
import ThirdTab from '../alert/ThirdTab';
import Badge from '../misc/Badge';
import MediaModal from '../modal/MediaModal';
import WidgetItemSave from './WidgetItemSave';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root')
const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		borderRadius: '30px',
		transform: 'translate(-50%, -50%)',
		height: '90%',
		zIndex: '99',
		overflow: 'hidden',
		width: '100%',
		maxWidth: '790px',
		padding: '30px',
	}
};

const displayElementsStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		borderRadius: '30px',
		transform: 'translate(-50%, -50%)',
		height: '100%',
		zIndex: '99',
		overflow: 'auto',
		width: '100%',
		// maxWidth: '890px',
	}
};

class WidgetAlert extends Component {

  viewTypes = widgetEnum.VIEW_TYPES;
  fontAnimations = widgetEnum.FONT_ANIMATIONS;
  widgetFor = widgetEnum.ALERT_TYPES;

  constructor(props) {
    super(props);

    this.state = {
      widget: {
        ...this.props.widget
      },
      images: widgetEnum.images(),
      sounds: widgetEnum.sounds(),
      currentConfigWidget: {
        infiniteImageAnimation: false,
        isRandom: false,
        readingHeaderText: true,
        isReadingText: true
      },
      showColorPicker: false,
      imgUrl: '',
      soundUrl: '',
      audio: '',
      itemIndex: '',
      userssounds: [],
      usersimages: [],
      showModal: false,
      tabId: '1',
      selecting: 'selected',
      mediaForDonationPageIds: {},
      selectedItem: {},
      rowOpened: 'images',
      currentIndex: null,
      interactionWidgets: [],
      alreadyUploaded: 0,
      isModalOpen: false,
      isSaveModalOpen: false,
      indexToRemove: null,
    };
  }

  componentDidMount = () => {
    const images = [...this.state.images];
    const sounds = [...this.state.sounds];

    this.socket = helpers.buildSocket();

    this.props.userFiles.forEach((item) => {
      if (item.fileType.indexOf('image') >= 0 || item.fileType.indexOf('video') >= 0) {
        images.unshift(item);
      } else {
        sounds.unshift(item);
      }
    });

    const alreadyUploaded = this.props.userFiles.length;

    this.setState({ images, sounds, alreadyUploaded });

    this.getInteractionWidgets();
  };

  componentWillUnmount() {
    const userId = this.props.userId;

    this.socket && this.socket.emit('message', { userId, skipMessage: true });
    this.socket && this.socket.disconnect();
  }

  getInteractionWidgets = async () => {
    const data = await api.getWidgets('interactions');
    const widgets = data.widgets.filter(widget => widget.widgetBehaviour === "1");

    this.setState({ interactionWidgets: widgets });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.widget.widgetId !== this.state.widget.widgetId) {
      this.setState({ widget: { ...nextProps.widget } });
    }
  }

  toggleModal = async (e, state, modalName, itemIndex, selecting, item, rowOpened = '') => {
    e && e.preventDefault();

    if (!state) {
      this.setState({ [modalName]: state });
      return;
    }

    let { mediaForDonationPageIds, selectedItem, images, sounds, currentConfigWidget } = this.state;

    if (modalName === "showMediaSelectionModal" && selecting === 'multiselect') {
      const data = await api.getSelectedMedia(currentConfigWidget.mediaListId || '')
        .catch((err) => console.log(err));

      mediaForDonationPageIds = data;
    }

    if (item?.images && item?.selectedAnimationPath) {
      const filtered = images.find(im => (im.url || im.path) === item?.selectedAnimationPath);

      if (filtered) {
        selectedItem.images = [filtered.id || filtered._id];
      }
    } else {
      selectedItem.images = [];
    }

    if (item?.sounds && item?.selectedSoundPath) {
      const filtered = sounds.find(s => (s.url || s.path) === item?.selectedSoundPath);

      if (filtered) {
        selectedItem.sounds = [filtered.id || filtered._id];
      }
    } else {
      selectedItem.sounds = [];
    }

    this.setState({
      [modalName]: state,
      selecting,
      itemIndex,
      mediaForDonationPageIds,
      selectedItem,
      rowOpened,
    });
  };

  onCopyText = () => {
    const { widget, token } = this.props;
    const url = helpers.buildWidgetUrl(widget.widgetId, token);

    helpers.copyText(url);
  };

  enterUrl = (e, item) => {
    const el = e.target.value;

    if (el) {
      this.setState({ [item]: el });
    }
  };

  clearUrl = () => {
    this.setState({ imgUrl: '', soundUrl: '' });
  };

  onChange = (e, mainConfig) => {
    let { value } = e.target;
    const id = e.target.id.replace(/Slider+$/, '');
    const currentConfigWidget = { ...this.state.currentConfigWidget };
    const widget = { ...this.state.widget };

    // verify min max amount
    if (value && (id === 'maxAmount' || id === 'minAmount')) {
      value = parseInt(value) || 0;
    }

    // fix for an old widgets
    if (id === 'highlightDonaterAndAmount' && value) {
      const defaultStyles = JSON.parse(JSON.stringify(currentConfigWidget.headerFont));

      if (!currentConfigWidget.highlightedUserName) {
        currentConfigWidget.highlightedUserName = defaultStyles;
      }
      if (!currentConfigWidget.highlightedAmount) {
        currentConfigWidget.highlightedAmount = defaultStyles;
      }
    }

    if (mainConfig) {
      widget[id] = value;
      this.setState({ widget });
    } else {
      currentConfigWidget[id] = value;
      localStorage.setItem('widgetAlert', JSON.stringify(currentConfigWidget));
      this.setState({ currentConfigWidget });
    }
  };

  onSaveFont = (font, el) => {
    const currentConfigWidget = { ...this.state.currentConfigWidget };
    currentConfigWidget[el] = font;

    localStorage.setItem('widgetAlert', JSON.stringify(currentConfigWidget));
    this.setState({ currentConfigWidget });
  };

  onColorChange = (color) => {
    const currentConfigWidget = { ...this.state.currentConfigWidget };

    currentConfigWidget.font.color = color.rgb;

    localStorage.setItem('widgetAlert', JSON.stringify(currentConfigWidget));
    this.setState({ currentConfigWidget });
  };

  onToggleColorPicker = () => {
    this.setState({ showColorPicker: !this.state.showColorPicker })
  };

  onCloseColorPicker = () => {
    this.setState({ showColorPicker: false });
  };

  saveSelectedMedia = (e, { sounds, images }, tabSelected) => {
    e.preventDefault();

    const { widget, selecting, currentConfigWidget } = this.state;

    if (selecting === 'selected') {
      this.onElementSelect(
        sounds.find(s => s[selecting]),
        images.find(i => i[selecting]),
        tabSelected
      );

      this.setState({ showMediaSelectionModal: false });
      return;
    }

    const files = {
      sounds: sounds.filter(e => e[selecting]),
      images: images.filter(e => e[selecting]),
    };

    api.saveSelectedMedia({ files, widgetId: widget?.widgetId, mediaModelId: currentConfigWidget.mediaListId }).then(data => {
      messageService.success('Файли вибрано та збережено');

      currentConfigWidget.mediaListId = data.mediaListId;

      this.setState({ showMediaSelectionModal: false, currentConfigWidget });
    });
  };

  onElementSelect = (filteredSounds, filteredImages, tab) => {
    const { images, sounds, currentConfigWidget, itemIndex } = this.state;
    let item = {};
    let selectedItem = filteredSounds || filteredImages;

    if (tab === 'images') {
      images.map((image) => image.selected = false);
      item = {
        ...currentConfigWidget.animationSettings[itemIndex],
        animationId: selectedItem.id,
        fileType: selectedItem.fileType,
        animationName: selectedItem.name,
        selectedAnimationPath: selectedItem.path || selectedItem.url,
      }
    } else {
      sounds.map((sound) => sound.selected = false);
      item = {
        ...currentConfigWidget.animationSettings[itemIndex],
        soundId: selectedItem.id,
        soundName: selectedItem.name,
        selectedSoundPath: selectedItem.path || selectedItem.url,
      }
    }

    currentConfigWidget.animationSettings[itemIndex] = item;

    this.setState({ currentConfigWidget, images, sounds });
    localStorage.setItem('widgetAlert', JSON.stringify(currentConfigWidget));
  };

  onRemoveElement = (index, tab) => {
    const { images, sounds, currentConfigWidget } = this.state;
    let item = {};

    if (tab === 'images') {
      images.map((image) => image.selected = false);
      item = {
        ...currentConfigWidget.animationSettings[index],
        animationId: '',
        animationName: '',
        selectedAnimationPath: '',
      }
    } else {
      sounds.map((sound) => sound.selected = false);
      item = {
        ...currentConfigWidget.animationSettings[index],
        soundId: '',
        soundName: '',
        selectedSoundPath: '',
      }
    }

    currentConfigWidget.animationSettings[index] = item;

    this.setState({ currentConfigWidget, images, sounds });
  };

  onShowUrlLink = (e, widget) => {
    widget.showUrl = !widget.showUrl;
    this.setState({ widget: widget });
  };

  onNewAnimation = () => {
    let currentConfigWidget = { ...this.state.currentConfigWidget };

    currentConfigWidget.animationSettings.push({
      id: currentConfigWidget.animationSettings.length + 1,
      animationId: '',
      soundId: ''
    });
    this.setState({ currentConfigWidget });
  };

  onRemoveAnimationRow = (i) => {
    let currentConfigWidget = { ...this.state.currentConfigWidget };

    if (currentConfigWidget.animationSettings.length === 1) {
      currentConfigWidget.animationSettings = [{
        id: currentConfigWidget.animationSettings.length + 1,
        animationId: '',
        soundId: ''
      }]
    } else {
      currentConfigWidget.animationSettings.splice(i, 1);
    }

    this.setState({ currentConfigWidget });
  };

  onCancel = (e, id) => {
    const itemsCopy = this.state.itemsCopy.slice();
    const item = itemsCopy.find((itemCopy) => itemCopy.id === id);

    e.preventDefault();

    this.setState({
      editedRow: -1,
      widget: item,
      showWidget: false
    });
  };

  onPreviewWidget = (e, widget, props, i) => {
    e.preventDefault();

    if (props.token && widget.widgetId) {
      localStorage.setItem('widgetAlert', JSON.stringify(widget.widgetsConfig[i]));

      window.open(`${window.location.origin}/widget/${widget.widgetId}/token/${props.token}/preview`, 'sharer', 'toolbar=0,status=0,width=800,height=800');
    }
  };

  saveCustomizedWidget = (e, items) => {
    e && e.preventDefault();

    const currentConfigWidget = { ...this.state.currentConfigWidget };

    currentConfigWidget.customWidgetUi = items;

    this.toggleModal(e, false, 'showModal')
    this.setState({ currentConfigWidget });
  }

  onReset = (item) => {
    const currentConfigWidget = { ...this.state.currentConfigWidget };
    currentConfigWidget[item] = JSON.parse(JSON.stringify(currentConfigWidget.headerFont));

    this.setState({ currentConfigWidget });
  };

  onAddNewLink = (e, path, item, widget) => {
    let el = {};
    let dropdown = this.state[item].slice();
    e.preventDefault();

    el = {
      id: new Date().getTime(),
      name: 'New item ' + (dropdown.length + 1),
      path,
      selected: false,
      isPlaying: false
    };

    dropdown.push(el);
    if (!widget['custom' + item]) {
      widget['custom' + item] = [];
    }
    widget['custom' + item].push(el);

    this.setState({ [item]: dropdown, widget });
  };

  onEditConfig = (item, i) => {
    this.setState({ currentConfigWidget: item, currentIndex: i });
  };

  saveCurrentWidget = () => {
    const { widget, currentIndex } = this.state;
    const currentConfigWidget = { ...this.state.currentConfigWidget };
    const { onSave } = this.props;

    if (!currentConfigWidget.showDetails) {
      delete currentConfigWidget.customWidgetUi;
    }

    if (widget.widgetsConfig[currentIndex]) {
      widget.widgetsConfig[currentIndex] = currentConfigWidget;
    } else {
      widget.widgetsConfig.push(currentConfigWidget);
    }

    this.setState({ widget, currentConfigWidget: {} });

    if (!widget.widgetId) return;

    onSave(null, widget);
  };

  onAddConfig = () => {
    const widget = { ...this.state.widget };

    // not sure if this is needed
    const settings = {
      minAmount: 101,
      maxAmount: 1000
    };
    //

    const lastWidget = widget.widgetsConfig[widget.widgetsConfig.length - 1];

    if (lastWidget) {
      settings.minAmount = parseInt(lastWidget.maxAmount) + 1;
      settings.maxAmount = parseInt(lastWidget.maxAmount) + 100;
    };

    const newWidget = new WidgetAlertItemModel({ ...settings });

    widget.widgetsConfig.push(newWidget);
    this.setState({ widget });
  };

  onDeleteConfig = (i) => {
    const widget = { ...this.state.widget };

    if (widget.widgetsConfig.length === 1) {
      widget.widgetsConfig = [new WidgetAlertItemModel()];
    } else {
      widget.widgetsConfig.splice(i, 1);
    }

    this.setState({ widget, isModalOpen: false });
  };

  uploadHandler = (e, item) => {
    let file = e.target.files[0];

    if (!file.type) {
      return;
    }

    if (file.size / 1024 / 1024 >= MAX_FILE_SIZE) {
      messageService.success(`Файл занадто великий (максимум ${MAX_FILE_SIZE} мб)`);
      return;
    }

    if (this.props.userFiles.length > UPLOAD_LIMIT) {
      messageService.success(`Перевищено максимальну кількість файлів (${UPLOAD_LIMIT})`);
      return;
    }

    const isCorrectFileType = (file.type.indexOf('image') !== -1 && item === 'images') ||
      (file.type.indexOf('video') !== -1 && item === 'images') ||
      (file.type.indexOf('audio') !== -1 && item === 'sounds');

    if (isCorrectFileType) {
      messageService.success('Відвантаження файлу');

      const req = new XMLHttpRequest();
      const formData = new FormData();
      const sanitazedFileName = helpers.sanitazeFileName(file.name);

      formData.append("fileToUpload", file, sanitazedFileName);

      req.open("POST", "/panel-api/file");
      req.send(formData);
      const self = this;
      req.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          const responce = JSON.parse(this.response);
          const newItem = [...self.state[item]];

          messageService.success('Файл завантажений');

          newItem.unshift(responce);
          self.setState({ [item]: [] }, () => {// refresh sounds after add/remove item
            self.setState({ [item]: newItem, alreadyUploaded: self.state.alreadyUploaded + 1 });
          });
        }
      };
    } else {
      messageService.success('Неправильний тип файлу');
    }
  };

  onCloneConfig = (i) => {
    const widget = { ...this.state.widget };
    const newWidget = JSON.parse(JSON.stringify(widget.widgetsConfig[i]));

    delete newWidget.mediaListId;

    widget.widgetsConfig.push(newWidget);

    this.setState({ widget });
  };

  removeFile = (fileName, itemName) => {
    api.deleteFile({ name: fileName }).then(data => {

      let items = [...this.state[itemName]];

      items = items.filter((item) => item.name !== fileName);

      messageService.success('Файл видалений');
      this.setState({ [itemName]: [] }, () => {// refresh sounds after add/remove item
        this.setState({ [itemName]: items, alreadyUploaded: this.state.alreadyUploaded - 1 });
      });
    });
  };

  onTabClick = (tabId) => {
    this.setState({ tabId });
  };

  setPreviewOBSData = (e, widget, currentIndex) => {
    e && e.preventDefault();

    const { currentConfigWidget } = this.state;

    widget.widgetsConfig[currentIndex] = currentConfigWidget;

    const { isSpecificAmount, specificAmount, maxAmount } = currentConfigWidget;

    const donate = {
      amount: isSpecificAmount ? specificAmount : maxAmount,
      clientName: "donatello",
      currency: "UAH",
      message: "donatello тестовий донат!",
      isTestMessage: true,
    }

    this.sendTestDonateToOBS({ widget, donate, testPreview: true });
  }

  sendTestDonateToOBS = ({ widget, donate, testPreview }) => {
    const { userId } = this.props;

    messageService.success('Відправляю повідомлення');

    setTimeout(() => {
      if (this.socket && userId) {
        this.socket.emit('message', { userId, widget, donate, testPreview, skipMessage: true });
      } else {
        messageService.success('Ой, не вийшло відправити повідомлення в OBS.');
      }
    }, 1000)
  }

  checkIfWidgetsIntersect = (e, widget) => {
    e && e.preventDefault();
    let isIntersect = false

    widget.widgetsConfig.forEach((config, i) => {
      if (!config.isSpecificAmount) {
        let prevMaxAmount = null;

        if (widget.widgetsConfig[i - 1]) {
          const prevConfig = widget.widgetsConfig[i - 1];
          if (!prevConfig.isSpecificAmount) {
            prevMaxAmount = parseInt(prevConfig.maxAmount);
          }
        }
        const minAmount = parseInt(config.minAmount);
        if (prevMaxAmount > minAmount) {
          isIntersect = true;
        }
      }

      return config;
    })

    if (isIntersect) {
      this.setState({ isSaveModalOpen: true });
      return
    }

    this.props.onSave(e, widget)
  }

  cancelSubWidget = (e) => {
    e && e.preventDefault();

    this.setState({ currentIndex: null, currentConfigWidget: {} });
  }

  render() {
    const { widget, currentIndex, images, sounds, tabId,
      selecting, selectedItem, mediaForDonationPageIds, rowOpened,
      currentConfigWidget, interactionWidgets, alreadyUploaded,
      isModalOpen, indexToRemove, isSaveModalOpen
    } = this.state;

    const { onSave, onCancel, status } = this.props;

    return (
      <>
        {confirmRemoveModal({
          confirm: () => this.onDeleteConfig(indexToRemove),
          cancel: () => this.setState({ isModalOpen: false }),
          isModalOpen
        })}

        {confirmRemoveModal({
          confirm: () => { this.setState({ isSaveModalOpen: false }); onSave(null, widget) },
          cancel: () => this.setState({ isSaveModalOpen: false }),
          isModalOpen: isSaveModalOpen,
          title: 'Увага!',
          text: "Деякі підвіджети перетинають один одного сумами 'від' та 'до', віджет може працювати не правильно, всерівно зберегти?"
        })}

        <form onSubmit={(e) => this.checkIfWidgetsIntersect(e, widget)} className="mt-lg-5 ml-lg-3 mr-lg-3 widget-alert">
          <h4 className="mb-lg-5 d-flex justify-content-between">
            {`${widget.widgetId ? 'Редагувати' : 'Додати'} віджет`}
            <button className="btn btn-light mr-2"
              onClick={(e) => onCancel(e)}>
              Скасувати
            </button>
          </h4>

          <div className="form-group row mb-lg-4">
            <label htmlFor="nameWidget" className="col-sm-4 col-form-label">
              Назва віджету
            </label>
            <div className="col-sm-7">
              <input id="widgetName" type="text" className="form-control" required
                value={widget.widgetName}
                onChange={(e) => this.onChange(e, true)} />
            </div>
          </div>

          <div className="form-group row mb-lg-4">
            <label htmlFor="widgetFor" className="col-sm-4 col-form-label">
              Cповіщення для
            </label>
            <div className="col-sm-4">
              <select id="widgetFor" className="form-control"
                value={widget.widgetFor}
                onChange={(e) => this.onChange(e, true)}>
                {this.widgetFor.map((item) =>
                  <option key={item.id} value={item.id}>{item.name}</option>
                )}
              </select>
            </div>
          </div>

          {WIDGET_FOR.SUBSCRIPTION === widget.widgetFor && (
            <div className="form-group row mb-lg-4">
              <label htmlFor="showOnlyNewSubscription" className="col-sm-4 col-form-label">
                {Badge()} Відображати сповіщення тільки про нових підписників
              </label>
              <div className="col-sm-7" style={{ margin: "auto", marginLeft: 0 }}>
                <Switch id="showOnlyNewSubscription"
                  onChange={checked => this.onChange({ target: { value: checked, id: 'showOnlyNewSubscription' } }, true)}
                  checked={widget.showOnlyNewSubscription}
                />
              </div>
            </div>
          )}

          {WIDGET_FOR.DONATE === widget.widgetFor && (
            <div className="form-group row mb-lg-4">
              <label htmlFor="showOnlyAmountRange" className="col-sm-4 col-form-label">
                {Badge()} Відображати віджет якщо сума донату співпадає з підвіджетами
              </label>
              <div className="col-sm-7" style={{ margin: "auto", marginLeft: 0 }}>
                <Switch id="showOnlyAmountRange"
                  onChange={checked => this.onChange({ target: { value: checked, id: 'showOnlyAmountRange' } }, true)}
                  checked={widget.showOnlyAmountRange}
                />
                <small id="urlShow" className="form-text text-muted">
                  <div className="mb-1">
                    * Даний віджет буде відображено тільки якщо сума Донату входить у межі (мін-макс) підвіджетів.
                  </div>
                  <div className="mb-1">
                    * Це підходить для Монобанки, коли глядачі донатять 1 гривню і не потрібно показувати сповіщення.
                  </div>
                </small>
              </div>
            </div>
          )}

          <div className="form-group row mb-lg-4">
            <label className="col-sm-4 col-form-label">
              Посилання на віджет
              {widget.widgetId &&
                <span>
                  <i className={widget.showUrl ? 'fas fa-eye' : 'far fa-eye-slash'}
                    onClick={(e) => this.onShowUrlLink(e, widget)}
                    data-toggle="tooltip" data-placement="top"
                    title={!widget.showUrl ? 'Показати' : 'Сховати'}>
                  </i>
                  <i className="far fa-copy"
                    onClick={(e) => this.onCopyText(e, widget)}
                    data-toggle="tooltip" data-placement="top" title="Скопіювати посилання">
                  </i>
                </span>
              }
            </label>
            <div className="col-sm-7 url">
              <input id="urlLink" className="p-2 form-control url-link"
                disabled
                type="text"
                value={widget.showUrl ? helpers.buildWidgetUrl(widget.widgetId, this.props.token) : widget.widgetId ? "************************" : ''} />
              <small id="urlShow" className="form-text text-muted">
                {widget.widgetId ?
                  <div>
                    <div className="mb-1">
                      * Це посилання можна використовувати в <strong>OBS Studio</strong>.
                    </div>
                    <div className="mb-1">
                      * Посилання містить ваш секретний токен. Не показуйте його, будь ласка, нікому.
                    </div>
                  </div>
                  :
                  <div className="mb-1">
                    Посилання на віджет для <strong>OBS Studio</strong> буде доступним після збереження.
                  </div>
                }
              </small>
            </div>
          </div>

          <span className="widgets-list">
            {widget.widgetsConfig.map((item, i) =>
              <div key={i} className={'alert va-center overflow-x-md ' + (currentIndex === i && currentConfigWidget.viewType ? 'alert-primary' : 'alert-success')}>
                <div className="row widget-list">
                  <div className="col-md-1">
                    {this.props.token && widget.widgetId &&
                      <div className="fas fa-search" style={{ opacity: this.props.token ? 1 : 0.3, cursor: this.props.token ? 'pointer' : 'auto' }} title='Превю' onClick={(e) => this.onPreviewWidget(e, widget, this.props, i)} />
                    }
                  </div>
                  <div className="col-md-3">Сума донату</div>
                  {item.isSpecificAmount ? (
                    <div className="col-md-6">{item.specificAmount}</div>
                  ) : (
                    <>
                      <div className="col-md-3">від {item.minAmount}</div>
                      <div className="col-md-3">до {item.maxAmount}</div>
                    </>
                  )}
                  <div className="col-md-2 d-flex justify-content-end">
                    <div className="fas cursor fa-edit ml-3" title='Редагування' onClick={() => this.onEditConfig(item, i)} />
                    <div className="far cursor fa-clone ml-3" title='Зробити копію' onClick={() => this.onCloneConfig(i)} />
                    <div className="fas cursor fa-trash-alt ml-3 ml-sm-5" title='Видалити' onClick={() =>
                      this.setState({ indexToRemove: i, isModalOpen: true })
                    } />
                  </div>
                </div>
              </div>
            )}
            {!currentConfigWidget.viewType && (
              <div className="w-100 d-flex justify-content-end">
                <button type="button" className="btn add-widget btn-dark" title='Додати підвіджет' onClick={() => this.onAddConfig()}>Додати підвіджет</button>
              </div>
            )}
          </span>
          {!currentConfigWidget.viewType && (
            <small className="form-text text-muted mt-3">
              <ul>
                <li>Натисніть на <i className="fas cursor fa-edit"></i> щоб відредагувати віджет</li>
                <li>Натисніть на <i className="far cursor fa-clone"></i> щоб склонувати віджет</li>
              </ul>
            </small>
          )}

          {currentConfigWidget.viewType && (
            <span>
              <div className="form-group row mb-lg-4" />
              <Nav justify variant="tabs" defaultActiveKey="1" onSelect={(selectedKey) => this.onTabClick(selectedKey)}>
                <Nav.Item>
                  <Nav.Link eventKey="1">Налаштування елементів</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="2">Елементи віджета</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="3">Візуальне налаштування</Nav.Link>
                </Nav.Item>
              </Nav>

              {tabId === '1' && (
                <FirstTab
                  widgetFor={widget.widgetFor}
                  currentConfigWidget={currentConfigWidget}
                  onChange={this.onChange}
                  toggleModal={this.toggleModal}
                  viewTypes={this.viewTypes}
                />
              )}

              {tabId === '2' && (
                <SecondTab
                  widgetFor={widget.widgetFor}
                  currentConfigWidget={currentConfigWidget}
                  onChange={this.onChange}
                  toggleModal={this.toggleModal}
                  onNewAnimation={this.onNewAnimation}
                  onRemoveElement={this.onRemoveElement}
                  onRemoveAnimationRow={this.onRemoveAnimationRow}
                  interactionWidgets={interactionWidgets}
                  status={status}
                />
              )}

              {tabId === '3' && (
                <ThirdTab
                  currentConfigWidget={currentConfigWidget}
                  onChange={this.onChange}
                  onSaveFont={this.onSaveFont}
                  fontAnimations={this.fontAnimations}
                  onReset={this.onReset}
                />
              )}

              <ReactModal
                isOpen={this.state.showModal}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={null}
                style={displayElementsStyles}
                contentLabel="Example Modal"
              >
                <CustomizedAlert
                  widgetFor={widget.widgetFor}
                  saveCustomizedWidget={this.saveCustomizedWidget}
                  onCloseModal={(e) => this.toggleModal(e, false, 'showModal')}
                  ui={currentConfigWidget.customWidgetUi}
                  headerFont={currentConfigWidget.headerFont}
                  bodyFont={currentConfigWidget.bodyFont}
                  image={currentConfigWidget.animationSettings[0]?.selectedAnimationPath}
                  isVideo={currentConfigWidget.animationSettings[0]?.fileType?.indexOf('video') >= 0}
                />
              </ReactModal>

              <ReactModal
                isOpen={this.state.showMediaSelectionModal}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={(e) => this.toggleModal(e, false, 'showMediaSelectionModal')}
                style={customStyles}
                contentLabel="Example Modal"
              >
                <MediaModal
                  items={JSON.parse(JSON.stringify({ images: images, sounds: sounds }))}
                  saveSelectedMedia={this.saveSelectedMedia}
                  multiselect={selecting !== 'selected'}
                  selected={selecting}
                  showDeleteItems={false}
                  uploadHandler={this.uploadHandler}
                  removeFile={this.removeFile}
                  selectedItems={selecting === 'selected' ? selectedItem : mediaForDonationPageIds}
                  showUpload={true}
                  rowOpened={rowOpened}
                  alreadyUploaded={alreadyUploaded}
                />
              </ReactModal>
            </span>
          )}

          {currentConfigWidget.viewType ?
            <div className="form-group row mb-lg-2 mt-lg-5">
              <div className="col-sm-6 d-flex justify-content-center justify-content-sm-start mb-3 mb-sm-0">
                <button className="btn btn-light mr-2"
                  disabled={!this.props.token}
                  onClick={(e) => this.onPreviewWidget(e, widget, this.props, currentIndex)}>
                  <i className="fa-solid fa-paper-plane"></i>{' '}браузер
                </button>
                <button className="btn btn-light"
                  disabled={!this.props.token}
                  onClick={(e) => this.setPreviewOBSData(e, widget, currentIndex)}>
                  <i className="fa-solid fa-paper-plane"></i>{' '}Тестове сповіщення
                </button>
              </div>
              <div className="col-sm-6 d-flex justify-content-center justify-content-sm-end">
                <button className="btn btn-light mr-2"
                  onClick={(e) => this.cancelSubWidget(e)}>
                  Скасувати
                </button>
                <button className="btn btn-primary" type="button" onClick={this.saveCurrentWidget}>
                  Зберегти цей підвіджет
                </button>
              </div>
            </div>
            :
            <WidgetItemSave
              widgetId={widget.widgetId ? true : false}
              onSave={(e) => onSave(e, widget)}
              onCancel={onCancel} />
          }
        </form>
      </>
    )
  }
}

export default WidgetAlert;
