import React, {Component} from 'react';
import WidgetItemAdd from '../../coms/widget/WidgetItemAdd';
import WidgetTop from '../../coms/widget/WidgetTop';
import WidgetTopItem from '../../coms/widget/WidgetTopItem';
import widgetEnum from '../../enums/widgetEnum';
import WidgetTopModel from '../../models/WidgetTopModel';
import {api} from '../../services/api';
import '../../css/widgets.css';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';

class WidgetTops extends Component {

  WidgetStatus = widgetEnum.WidgetStatus;

  constructor(props) {
    super(props);

    this.state = {
      items: [],
      token: '',
      widget: new WidgetTopModel(),
      editedRow: -1,
      showColorPicker: false,
      showWidget: false,
      isLoading: false,
      isModalOpen: false,
      indexToRemove: null,
      tierRecords: [],
	  widgetGoalRecords: []
    };
  }

  componentDidMount = () => {
    this.setState({ isLoading: true }, () => {
      Promise.all([
        api.getWidgets('top'),
        api.getAllUserTiers(),
		api.getWidgets('goal'),
      ]).then(this.updateForm);
    });
  };

  updateForm = ([widgetData, tiersData, widgetGoalData]) => {
    const { widgets, token } = widgetData;
    const { tierRecords } = tiersData;
	const { widgets: widgetGoalRecords } = widgetGoalData;

    this.setState({ items: widgets, token, tierRecords, widgetGoalRecords, isLoading: false });
  };

  onAdd = (e) => {
    this.setState({
      showWidget: true
    });
  };

  onEdit = (item, i) => {
    this.setState({
      widget: item,
      editedRow: i,
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

    api.saveWidget('top', widgetToClone).then((res) => {
      items.push(res.data);

      this.setState({items});
    });
  }


  onSave = (e, widget) => {
    let items = this.state.items.slice();
    const index = items.findIndex(item => item.widgetId === widget.widgetId);

    e.preventDefault();

    api.saveWidget('top', widget).then((res) => {
      if (index !== -1) {
        items[index] = res.data;
      } else {
        items.push(res.data);
      }

      this.setState({
        items: items,
        editedRow: -1,
        widget: new WidgetTopModel(),
        showWidget: false
      });
    });
  };

  onDelete = (index) => {
    let items = this.state.items;

    api.deleteWidget('top', items[index]).then(res => {
      // console.log(res);
      items.splice(index, 1);

      this.setState({ items, showWidget: false, widget: new WidgetTopModel(), isModalOpen: false });
    });
  };

  onCancel = (e) => {
    const widget = new WidgetTopModel();

    e.preventDefault();

    this.setState({
      editedRow: -1,
      widget: widget,
      showWidget: false
    });
  };

  render() {
    const { isLoading, items, widget, token, editedRow, showWidget,
      indexToRemove, isModalOpen, tierRecords, widgetGoalRecords } = this.state;

    return !isLoading && <div>
      <div className="widgets">
        {items.map((item, i) =>
          <WidgetTopItem
            key={item.widgetId}
            item={item}
            index={i}
            editedRow={editedRow}
            onClone={this.onClone}
            showWidget={showWidget}
            onEdit={this.onEdit}
            openConfirmModal={() => this.setState({ isModalOpen: true, indexToRemove: i })}
          />
        )}

        {confirmRemoveModal({
          confirm: () => this.onDelete(indexToRemove),
          cancel: () => this.setState({ isModalOpen: false }),
          isModalOpen
        })}

        {showWidget &&
          <WidgetTop
            widget={widget}
            tierRecords={tierRecords}
			widgetGoalRecords={widgetGoalRecords}
            token={token}
            onSave={this.onSave}
            onCancel={this.onCancel}
          />
        }

        {!showWidget &&
			<div className="d-flex justify-content-end">
				<WidgetItemAdd onAdd={this.onAdd} />
			</div>
        }
      </div>
    </div>
  }
}

export default WidgetTops;
