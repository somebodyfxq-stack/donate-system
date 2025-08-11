import React, {Component} from 'react';
import widgetEnum from '../../enums/widgetEnum';

class WidgetTopItem extends Component {

  periods = widgetEnum.PERIODS;
  viewTypes = widgetEnum.VIEW_TYPES_TOP;
  currencies = widgetEnum.CURRENCIES;

  getTypeName = (item, type) => {
    const list = type === 'view' ? this.viewTypes : this.periods;
    const prop = type === 'view' ? 'viewType' : 'timeFrame';
    const idx = list.findIndex(ls => ls.id === (parseInt(item[prop], 10) ? parseInt(item[prop], 10) : item[prop]));

    if (idx === -1) {
      return false;
    }
    return list[idx].name;
  };

  render() {
    const { item, index, editedRow, showWidget, onEdit, openConfirmModal, onClone } = this.props;

    if ((editedRow !== -1) && (index !== editedRow)) return (<div></div>);

    return <div className={'alert va-center overflow-x-md ' + (editedRow === index && showWidget ? 'alert-success' : 'alert-primary')}>
      <div className="row widget-list">
        <div className="col-md-4">{item.widgetName}</div>
        <div className="col-md-3">
          {this.getTypeName(item, 'view')}
        </div>
        <div className="col-md-1 text-align-center">{item.amountItems}</div>
        <div className="col-md-2 text-align-left">
          {this.getTypeName(item, 'period')}
        </div>
        <div className="col-md-1 text-align-left">
          {this.currencies.find((curr) => curr.label === item.widgetCurrency)?.sign || '₴'}
        </div>

        <div className="col-md-1 d-flex justify-content-end">
          <div className="fas fa-edit" onClick={() => onEdit(item, index)} />
          <div className="far cursor fa-clone ml-3" title='Зробити копію' onClick={() => onClone(index)} />
          <div className="fas fa-trash-alt ml-3" onClick={() => openConfirmModal()} />
        </div>
      </div>
    </div>;
  }
}

export default WidgetTopItem;
