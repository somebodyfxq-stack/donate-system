import React, {Component} from 'react';
import {connect} from 'react-redux';
// import Badge from '../components/Badge';
import WidgetAlert from '../../coms/widget/WidgetAlert';
import WidgetAlertItem from '../../coms/widget/WidgetAlertItem';
import WidgetItemAdd from '../../coms/widget/WidgetItemAdd';
import widgetEnum, {WIDGET_FOR} from '../../enums/widgetEnum';
import WidgetAlertModel from '../../models/WidgetAlertModel';
import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';

import '../../css/animate.css';
import '../../css/widgets.css';
import helpers from '../../utils/helpers';

class WidgetAlerts extends Component {

  WidgetStatus = widgetEnum.WidgetStatus;

  constructor(props) {
    super(props);

    this.state = {
      items: [],
      token: '',
      widget: new WidgetAlertModel(),
      showWidget: false,
      editedRow: -1,
      isLoading: false,
      userFiles: [],
      isModalOpen: false,
      indexToRemove: null
    };
  }

  componentDidMount = () => {
    api.getFiles().then(data => {
      this.setState({ userFiles: data });
    });

    this.setState({ isLoading: true }, () => {
      api.getWidgets('alert').then(data => {
        const items = data.widgets;
        const token = data.token;

        this.setState({ items, token }, () => {
          this.updateForm();
        });
      });
    });
  };

  updateForm = () => {
    const itemsCopy = this.state.items.slice();
    this.setState({ isLoading: false, itemsCopy: itemsCopy });
  };

  onAdd = () => {
    const widget = new WidgetAlertModel();
    this.setState({
      widget,
      showWidget: true
    });
  };

  onEdit = (item, i) => {
    this.setState({
      editedRow: i,
      widget: item,
      showWidget: true
    });
  };

  refreshOBS = () => {
    const { userId } = this.props;

    messageService.success('оновлюю OBS, зачекайте');

    const socket = helpers.buildSocket();

    setTimeout(() => {
      if (socket && userId) {
        socket.emit('message', { userId, skipMessage: true });
        messageService.success('OBS оновлено');

        socket.disconnect()
      } else {
        messageService.success('Ой, не вийшло оновити OBS. Спробуйте самі');
      }
    }, 1000)
  }

  onClone = (indexToClone) => {
    const items = [...this.state.items];
    let widgetToClone = {};

    widgetToClone = JSON.parse(JSON.stringify(items[indexToClone]));

    // pause widgets if more then one exists
    widgetToClone.widgetStatus = this.WidgetStatus.paused;
    delete widgetToClone.widgetId;

    api.saveWidget('alert', widgetToClone).then((res) => {
      items.push(res.data);

      this.setState({items});
    });
  }

  onSave = (e, widget) => {
    const items = [...this.state.items];
    const index = items.findIndex(i => i.widgetId === widget.widgetId);
    const { editedRow } = this.state;

    e && e.preventDefault();

    widget.widgetsConfig.forEach(config => {
      if (!config.isSpecificAmount) {
        const minAmount = parseInt(config.minAmount);
        const maxAmount = parseInt(config.maxAmount);

        if (!maxAmount) {
          config.maxAmount = minAmount + 30000;
        }

        if (minAmount === maxAmount) {
          config.isSpecificAmount = true
          config.specificAmount = minAmount;
        }
      }

      return config
    })

    widget.widgetsConfig = widget.widgetsConfig.sort(function (a, b) {
      const aMinAmount = parseInt(a.minAmount);
      const aSpecificAmount = parseInt(a.specificAmount);
      const aIsSpecificAmount = a.isSpecificAmount || false;
      const bMinAmount = parseInt(b.minAmount);
      const bSpecificAmount = parseInt(b.specificAmount);
      const bIsSpecificAmount = b.isSpecificAmount || false;

      if ((aIsSpecificAmount ? aSpecificAmount : aMinAmount) < (bIsSpecificAmount ? bSpecificAmount : bMinAmount)) {
        return -1;
      }
      if ((aIsSpecificAmount ? aSpecificAmount : aMinAmount) > (bIsSpecificAmount ? bSpecificAmount : bMinAmount)) {
        return 1;
      }
      return 0;
    });

    if (widget.widgetFor === WIDGET_FOR.SUBSCRIPTION) {
      // to be sure to have proper config for subscription alert
      widget.widgetsConfig.forEach(config => {
        config.showDetails = true;
        config.textLimit = '';
        config.allowUserSelectMedia = false;
        config.tenorAnimationAllowed = false;
        config.interactionWidgetId = '';
        config.readingHeaderText = false;
        config.isReadingText = false;
        config.isTextVolumeSeparated = false;
		config.textTransform = 'none';

        return config;
      })
    }

    //check if the same widget type exists if yes - paused it.
    const item = items.find(item => item.widgetFor === widget.widgetFor);
    if (item && editedRow === -1) {
      // pause widgets if more then one exists
      widget.widgetStatus = this.WidgetStatus.paused;
    }

    api.saveWidget('alert', widget).then((res) => {
      if (index !== -1) {
        items[index] = res.data;
      } else {
        items.push(res.data);
      }

      this.setState({
        items: items,
        editedRow: e ? -1 : editedRow,
        showWidget: e ? false : true
      }, () => {
        this.refreshOBS();
      });
    });
  };

  onToggleWidget = async (i) => {
    const items = this.state.items.slice();

    let widget = items.find(w =>
      w.widgetStatus === this.WidgetStatus.active && w.widgetFor === items[i].widgetFor
    );

    if (widget) {
      widget.widgetStatus = this.WidgetStatus.paused;
      await api.saveWidget('alert', widget);
    }

    widget = items[i];
    widget.widgetStatus = this.WidgetStatus.active;
    await api.saveWidget('alert', widget);

    this.refreshOBS();
  };

  onCancel = (e) => {
    const widget = new WidgetAlertModel();
    e.preventDefault();

    this.setState({
      editedRow: -1,
      widget: widget,
      showWidget: false
    });
  };

  onDelete = (index) => {
    let items = this.state.items;

    api.deleteWidget('alert', items[index]).then(res => {
      // console.log(res);
      items.splice(index, 1);

      this.setState({ items, showWidget: false, widget: new WidgetAlertModel(), isModalOpen: false });
    });
  };

  render() {
    let { isLoading, items, showWidget, editedRow, isModalOpen, indexToRemove } = this.state;

    return !isLoading && <div>
      <div className="widgets">
        {/* {items.length > 0 && !showWidget && (
          <small className="form-text text-muted text-goal mb-2">
            активний віджет <strong>{this.state.items.find(w => w.widgetStatus === this.WidgetStatus.active)?.widgetName || 'Немає'}</strong>
          </small>
        )} */}

        {items.map((item, i) => {
          return (
            <WidgetAlertItem
              key={item.widgetId}
              item={item}
              index={i}
              editedRow={editedRow}
              showWidget={showWidget}
              onEdit={this.onEdit}
              onClone={() => this.onClone(i)}
              onToggleWidget={this.onToggleWidget}
              openConfirmModal={() => this.setState({ isModalOpen: true, indexToRemove: i })}
            />
          )
        })}

        {confirmRemoveModal({
          confirm: () => this.onDelete(indexToRemove),
          cancel: () => this.setState({ isModalOpen: false }),
          isModalOpen
        })}

        {showWidget &&
          <WidgetAlert
            items={this.state.items}
            widget={this.state.widget}
            token={this.state.token}
            onSave={this.onSave}
            onCancel={this.onCancel}
            userFiles={this.state.userFiles}
            userId={this.props.userId}
            status={this.props.status}
          />
        }

        {items.length > 0 && !showWidget && (
          <small className="form-text text-muted text-goal">
            натисніть
            <i className={`fas fa-play ml-3`} />
            для зміни статусу віджета
          </small>
        )}

        {items.length > 0 && !showWidget && (
          <small className="form-text text-muted text-goal">
            тільки один віджет певного типу може бути активним
          </small>
        )}

        {!showWidget &&
          <div className="d-flex justify-content-end">
            <WidgetItemAdd onAdd={this.onAdd} />
          </div>
        }
      </div>
    </div>
  }
}

function mapStateToProps(state) {
  const { userId, status } = state.config;

  return { userId, status };
}

export default connect(mapStateToProps)(WidgetAlerts);
