import React, {useCallback, useEffect, useState} from 'react';
import WidgetInteraction from '../../coms/widget/WidgetInteraction';
import WidgetInteractionItem from '../../coms/widget/WidgetInteractionItem';
import WidgetItemAdd from '../../coms/widget/WidgetItemAdd';
import WidgetInteractionModel from '../../models/WidgetInteractionModel';

import {api} from '../../services/api';
import {messageService} from '../../services/messageService';
import {confirmRemoveModal} from '../../utils/confirmRemoveModal';

import '../../css/widgets.css';

const WidgetInteractions = () => {
  const [isLoading, onLoaded] = useState(true);
  const [currentWidget, setCurrentWidget] = useState({});
  const [token, setToken] = useState('');
  const [widgets, setWidgets] = useState([]);
  const [isModalOpen, toggleModalOpen] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState(null);

  const getData = useCallback(async () => {
    const data = await api.getWidgets('interactions');

    setWidgets([...data.widgets]);
    setToken(data.token);
    onLoaded(false);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const onAdd = useCallback(() => {
    const currentWidget = { ...new WidgetInteractionModel() };

    setCurrentWidget({ ...currentWidget });
  }, []);

  const onEdit = useCallback((widget) => {
    setCurrentWidget({
      ...new WidgetInteractionModel(),
      ...widget
    });
  }, []);

  const onDelete = useCallback(async (index) => {
    const newWidgets = [...widgets];
    await api.deleteWidget('interactions', newWidgets[index]);
    newWidgets.splice(index, 1);

    setWidgets([...newWidgets]);

    toggleModalOpen(false);
  }, [widgets]);

  const onSave = useCallback(async (e, widget) => {
    e && e.preventDefault();

    const res = await api.saveWidget('interactions', widget);
    const index = widgets.findIndex(item => item.widgetId === widget.widgetId);
    const newWidgets = [...widgets];

    if (index !== -1) {
      newWidgets[index] = res.data;
    } else {
      newWidgets.push(res.data);
    }

    setWidgets([...newWidgets]);

    setCurrentWidget({});
  }, [widgets]);

  const onCancel = useCallback((e) => {
    e && e.preventDefault();

    setCurrentWidget({});
  }, []);

  const updateWheelWidget = useCallback(async (e) => {
    e && e.preventDefault();

    const res = await api.updateWheelWidget({ widgetType: 'interactions' });

    messageService.success(res.message);
  }, []);

  const changeGotAmount = useCallback(async (e, gotAmount) => {
    e && e.preventDefault();

    const res = await api.updateWheelWidget({ widgetType: 'interactions', gotAmount, actionType: 'FIX_GOT_AMOUNT' });

    messageService.success(res.message);
  }, [])

  return (
    !isLoading &&
    <div>
      <div className="widgets">
        {widgets.map((widget, i) =>
          <WidgetInteractionItem
            key={i}
            widget={widget}
            selected={widget.widgetId === currentWidget.widgetId}
            isEditMode={!!currentWidget.widgetId}
            onEdit={onEdit}
            openConfirmModal={() => {
              toggleModalOpen(true);
              setIndexToRemove(i);
            }}
          />
        )}

        {confirmRemoveModal({
          confirm: () => onDelete(indexToRemove),
          cancel: () => toggleModalOpen(false),
          isModalOpen
        })}

        {currentWidget.widgetAvailable ?
          <WidgetInteraction
            token={token}
            widget={currentWidget}
            onSave={onSave}
            onCancel={onCancel}
            updateWheelWidget={updateWheelWidget}
            changeGotAmount={changeGotAmount}
          />
          :
          <div className="d-flex justify-content-end">
            <WidgetItemAdd onAdd={onAdd} />
          </div>
        }
      </div>
    </div>
  )
}

export default WidgetInteractions;
