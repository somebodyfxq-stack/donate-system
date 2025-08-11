import arrayMove from 'array-move';
import React, {Component} from 'react';

import SortableList, {SortableItem} from 'react-easy-sort';
import WidgetGoal from '../../coms/widget/WidgetGoal';
import WidgetGoalItem from '../../coms/widget/WidgetGoalItem';
import WidgetItemAdd from '../../coms/widget/WidgetItemAdd';
import '../../css/widgets.css';
import widgetEnum from '../../enums/widgetEnum';
import WidgetGoalModel from '../../models/WidgetGoalModel';
import {api} from '../../services/api';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';

class WidgetGoals extends Component {

  WidgetStatus = widgetEnum.WidgetStatus;

  constructor(props) {
    super(props);

    this.state = {
      items: [],
      widget: new WidgetGoalModel(),
      token: '',
      showWidget: false,
      editedRow: -1,
      isLoading: false,
      showSaveOrder: false,
      isModalOpen: false,
      indexToRemove: null
    };
  }

  componentDidMount = () => {
    this.setState({ isLoading: true }, () => {
      api.getWidgets('goal').then(this.updateForm);
    });
  };

  updateForm = (data) => {
    const items = data.widgets || [];
    const token = data.token || '';

    if (items.length > 1) {
      items.sort((a, b) => a.order - b.order);
    }

    this.setState({ items, token, isLoading: false });
  };

  onAdd = (e) => {
    this.setState({ showWidget: true });
  };

  onEdit = (item, i) => {
    this.setState({
      editedRow: item.widgetId,
      widget: item,
      showWidget: true
    });
  };

  onClone = (indexToClone) => {
    const items = [...this.state.items];
    let widgetToClone = {};

    widgetToClone = JSON.parse(JSON.stringify(items[indexToClone]));

    // pause widgets if more then one exists
    widgetToClone.widgetStatus = this.WidgetStatus.paused;
    delete widgetToClone.widgetId;

    api.saveWidget('goal', widgetToClone).then((res) => {
      items.push(res.data);

      this.setState({items});
    });
  }

  onSave = (e, widget) => {
    const items = this.state.items.slice();
    const index = items.findIndex(item => item.widgetId === widget.widgetId);

    e && e.preventDefault();

    widget.startAmount = widget.startAmount || 0;
    widget.urlName = widget.urlName ? widget.urlName : Date.now();// check if there is a url name

    api.saveWidget('goal', widget).then((res) => {
      if (index !== -1) {
        items[index] = res.data;
      } else {
        items.push(res.data);
      }
      this.setState({
        items: items,
        widget: new WidgetGoalModel(),
        showWidget: false,
        editedRow: -1
      });
    });
  };

  onDeactivate = (index) => {
    let items = this.state.items;

    api.deactivateWidget('goal', items[index]).then(res => {
      // console.log(res);
      items.splice(index, 1);

      this.setState({ items: items, showWidget: false, widget: new WidgetGoalModel(), isModalOpen: false, editedRow: -1 });
    });
  };

  onToggleWidget = (index) => {
    let items = this.state.items;

    api.toggleWidget('goal', items[index]).then(res => {
      const toggleStatus = {
        paused: 'active',
        active: 'paused'
      };

      items[index].widgetStatus = toggleStatus[items[index].widgetStatus];

      this.setState({ items: items, showWidget: false, widget: new WidgetGoalModel(), editedRow: -1 });
    });
  };

  onCancel = (e) => {
    const widget = new WidgetGoalModel();

    e.preventDefault();

    this.setState({
      editedRow: -1,
      widget: widget,
      showWidget: false
    });
  };

  onSortEnd = (oldIndex, newIndex) => {
    if (!this.state.showWidget) {// allow sort only if no edit mode
      this.setState({
        items: arrayMove(this.state.items, oldIndex, newIndex),
        showSaveOrder: true
      });
    }
  }

  showSaveOrderButton = () => {
	return(
		<div className='d-flex justify-content-end'>
			<button type="button" className="btn add-widget btn-info" onClick={(e) => this.saveOrderButton(e)}>
				Зберегти порядок
			</button>
		</div>
	)
  };

  saveOrderButton = () => {
    this.state.items.forEach((item, i) => {
      item.order = i;
      this.onSave(null, item);
    })

    this.setState({ showSaveOrder: false });
  };

  render() {
    const { isLoading, items, showWidget, editedRow,
      showSaveOrder, widget, isModalOpen, indexToRemove
    } = this.state;

    return !isLoading && <div>
      <div className="widgets">
        <SortableList onSortEnd={this.onSortEnd} className="list" draggedItemClassName="dragged">
          {items.map((item, i) =>
            <SortableItem key={i}>
              <div className="item">
                <WidgetGoalItem
                  item={item}
                  index={i}
                  editedRow={editedRow}
                  showWidget={showWidget}
                  getPercentage={this.getPercentage}
                  onEdit={this.onEdit}
                  onClone={this.onClone}
                  showSaveOrder={showSaveOrder}
                  onDeactivate={this.onDeactivate}
                  onToggleWidget={this.onToggleWidget}
                  openConfirmModal={() => this.setState({ isModalOpen: true, indexToRemove: i })}
                />
              </div>
            </SortableItem>
          )}
        </SortableList>

        {confirmRemoveModal({
          confirm: () => this.onDeactivate(indexToRemove),
          cancel: () => this.setState({ isModalOpen: false }),
          isModalOpen
        })}

        {items.length > 0 && !showWidget && (
          <small className="form-text text-muted text-goal">
            натисніть
            <i className={`fas fa-play ml-3`} />
            або
            <i className={`fas fa-pause ml-3`} />
            для зміни статусу віджета
          </small>
        )}

        {items.length > 0 && !showWidget && (
          <small className="form-text text-muted">
            <ul>
              <li>ви можете сортувати ці віджети за допомогою такої іконки <i className="fas fa-bars ml-3" /></li>
              <li>порядок цих віджетів буде збережено для вашої донат сторінки</li>
            </ul>
          </small>
        )}

        {showWidget &&
          <WidgetGoal
            widget={widget}
            token={this.state.token}
            onSave={this.onSave}
            onCancel={this.onCancel}
          />
        }

        {showSaveOrder && this.showSaveOrderButton()}
        {!showWidget && !showSaveOrder &&
			<div className="d-flex justify-content-end">
				<WidgetItemAdd onAdd={this.onAdd} />
			</div>
        }

      </div>
    </div>
  }
}

export default WidgetGoals;
