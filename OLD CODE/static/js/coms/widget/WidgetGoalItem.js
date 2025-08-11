import React, {Component} from 'react';
import {SortableKnob} from 'react-easy-sort';
import widgetEnum from '../../enums/widgetEnum';

class WidgetGoalItem extends Component {
  currencies = widgetEnum.CURRENCIES;
  getCurrentAmount = (item) => {
    const { startAmount, donatedAmount } = item;
    const currentAmount = parseInt(startAmount || 0, 10) + parseInt(donatedAmount || 0, 10);

    return isNaN(currentAmount) ? '0' : Math.round(currentAmount);
  };

  getPercentage = (item, isText) => {
    const { startAmount, donatedAmount, goalAmount, keepCountingPercentage } = item;
    const percentage = (parseInt(startAmount || 0, 10) + parseInt(donatedAmount || 0, 10)) * 100 / parseInt(goalAmount || 1, 10);

    let persent = (isNaN(percentage) ? '0' : Math.round(percentage));

    if (keepCountingPercentage && isText) {
      return persent;
    }

    if (persent >= 100) {
      return 100;
    } else {
      return persent;
    }
  };

  buildGradient = (data) => {
    let gradientParts = [];
    let gradientPersentage = {
      small: ['0%', '100%'],
      big: ['0%', '50%', '100%']
    };
    let gradientSize = data.gradientColors.length === 3 ? 'big' : 'small';

    data.gradientColors.forEach((c, i) => {
      gradientParts.push(`rgba(${c.r}, ${c.g}, ${c.b}) ${gradientPersentage[gradientSize][i]}`);
    });

    return `linear-gradient(${data.gradientAngle || 90}deg, ${gradientParts.join()})`;
  };

  getBackground = (item, c) => {
    let background = `rgba(${c.r},${c.g},${c.b},${c.a})`;

    if (item.gradient) {
      background = this.buildGradient(item);
    }

    return background;
  };

  getWidth = (item) => {
    return item.outerGradient ? this.getPercentage(item) + '%' : '100%';
  };

  getWidgetText = (item) => {
    let text = this.getPercentage(item, true);

    if (text >= 100 && item.widgetCompletedText) {
      text = item.widgetCompletedText;
    } else {
      text = `${text}%`;
    }

    return text;
  }

  render() {
    const { item, index, editedRow, showWidget, onEdit, openConfirmModal, showSaveOrder, onToggleWidget, onClone } = this.props;

    const cf = item.colorFont;
    const c = item.color;
    const n = item.colorFontNumbers || { r: '50', g: '50', b: '50', a: '1' };
    const b = item.colorBorder || { r: '50', g: '50', b: '50', a: '1' };

    if ((editedRow !== -1) && (item.widgetId !== editedRow)) return (<div></div>);

    const pausedWidget = item?.widgetStatus === 'paused';
    const title = {
      paused: 'Натисніть для поновлення',
      active: 'Натисніть для паузи',
    };
	const widgetTypes = [
		{
			type: '1',
			name: 'Стандартний'
		},
		{
			type: '2',
			name: 'Діаграма'
		},
		{
			type: '3',
			name: 'Прогрес бар'
		},
		{
			type: '4',
			name: 'Діаграма V2'
		},
		{
			type: '5',
			name: 'Прогрес бар V2'
		}
	];

	const widgetName = widgetTypes.find(widget => widget.type === item.goalWidgetType);

    return (
      <div className={`alert va-center overflow-x-md ${item.widgetId === editedRow && showWidget ? 'alert-success' : 'alert-primary'} ${item?.widgetStatus}`}>
        <div className="row widget-list" style={{ display: 'contents' }}>
          <SortableKnob>
            <div className="fas fa-bars" style={{ cursor: 'move' }} />
          </SortableKnob>
          <div className={`col-md-${item.multiGoal ? 3 : 4}`}>{item.widgetLabel || item.widgetName}</div>
          {item.multiGoal && <div className="col-md-1">мульти</div>}
          <div className="col-md-1 text-align-right" style={{ color: `rgba(${n.r},${n.g},${n.b},${n.a})` }}>
            {this.getCurrentAmount(item)}
            {this.currencies.find((curr) => curr.label === item.widgetCurrency)?.sign || '₴'}
          </div>
          {item.goalWidgetType !== '1' ? (
            <div className="col-md-4 text-center">{widgetName?.name || 'Стандартний'}</div>
          ) : (
            <div className="col-md-4">
              <div className="row" style={{ borderRadius: '15px', overflow: 'hidden', position: 'relative', border: `${item.borderWidth}px solid rgba(${b.r},${b.g},${b.b},${b.a})` }}>
                <span className="percentage" style={{ fontSize: '0.8rem' }}>
                  {this.getWidgetText(item)}
                </span>
                <span className={`received ${item.gradientAnimation === 'always' && 'gradient-animation'}`} style={{
                  width: this.getWidth(item),
                  background: this.getBackground(item, c)
                }} />
                <span className="amount" style={{
                  background: `rgba(${cf.r},${cf.g},${cf.b},${cf.a})`,
                  width: 100 - this.getPercentage(item) + '%',
                }} />
              </div>
            </div>
          )}
          <div className="col-md-2" style={{ color: `rgba(${n.r},${n.g},${n.b},${n.a})` }}>
            {item.goalAmount}
            {this.currencies.find((curr) => curr.label === item.widgetCurrency)?.sign || '₴'}
          </div>
          <div className="col-md-1 d-flex justify-content-end">
            <i
              className="fas fa-edit"
              title='Редагування'
              style={{ color: showSaveOrder && '#ccc' }}
              onClick={() => !showSaveOrder && !pausedWidget && onEdit(item, editedRow)}
            />
            <div className="far cursor fa-clone ml-3" title='Зробити копію' onClick={() => onClone(index)} />
            <i
              className={`${pausedWidget ? 'fas fa-play' : 'fas fa-pause'} ml-3`}
              title={title[item?.widgetStatus]}
              style={{ color: showSaveOrder && '#ccc' }}
              onClick={() => !showSaveOrder && onToggleWidget(index)}
            />
            <i
              title='Видалити'
              className="fas fa-trash-alt ml-3"
              style={{ color: showSaveOrder && '#ccc' }}
              onClick={() => !showSaveOrder && !pausedWidget && openConfirmModal()}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default WidgetGoalItem;
