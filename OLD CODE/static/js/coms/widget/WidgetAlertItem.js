import React, {Component} from 'react';
import widgetEnum from '../../enums/widgetEnum';

class WidgetAlertItem extends Component {
  alertTypes = widgetEnum.ALERT_TYPES;
  WidgetStatus = widgetEnum.WidgetStatus;

  getItemAlertType = () => {
    const index = this.alertTypes.findIndex(type => type.id === this.props.item.widgetFor)

    return this.alertTypes[index] ? this.alertTypes[index].name : '';
  };

  render() {
    const { item, index, editedRow, showWidget, onEdit, openConfirmModal, onToggleWidget, onClone } = this.props;

    if ((editedRow !== -1) && (index !== editedRow)) return (<div></div>);

    // TODO remove it. temporary to migrate to new widget UI
    if (!item.widgetsConfig) {
      let widgetsConfig = {
        "viewType": item.viewType,
        "timeLength": item.timeLength,
        "loudness": item.loudness,
        "isReadingText": item.isReadingText,
        "readingHeaderText": item.readingHeaderText,
        "textToShow": item.textToShow,
        "headerFont": item.headerFont,
        "bodyFont": item.bodyFont,
        "minAmount": item.minAmount || 0,
        "maxAmount": item.maxAmount || 100,
        "animationSettings": item.animationSettings,
        "isRandom": item.isRandom,
      };
      item.widgetsConfig = [];
      item.widgetsConfig.push(widgetsConfig);
    }
    //****

    const pausedWidget = item?.widgetStatus === this.WidgetStatus.paused;

    const title = {
      paused: 'Натисніть для поновлення',
      active: 'Натисніть для паузи',
    };

    return (
      <div className={'alert va-center overflow-x-md ' + (editedRow === index && showWidget ? 'alert-success' : 'alert-primary') + ' ' + item?.widgetStatus}>
        <div className="row widget-list">
          <div className="col-md-4">{item.widgetName}</div>
          <div className="col-md-2">
            {this.getItemAlertType()}
          </div>
          <div className="col-md-3">Кількість віджетів: {item.widgetsConfig ? item.widgetsConfig.length : 1}</div>
          <div className="col-md-1 d-flex justify-content-end">
            <i
              className={`${pausedWidget ? 'fas fa-play' : 'fas fa-pause'} mr-3`}
              title={title[item?.widgetStatus]}
              style={{ color: !pausedWidget && '#ccc' }}
              onClick={() => pausedWidget && onToggleWidget(index)}
            />
            <div className="far cursor fa-clone mr-3" title='Зробити копію' onClick={onClone} />
            <div className="fas fa-edit" onClick={() => onEdit(item, index)} />
            <div className="fas fa-trash-alt ml-3" onClick={openConfirmModal} />
          </div>
        </div>
      </div>
    );
  }
}

export default WidgetAlertItem;
