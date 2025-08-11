import React from 'react';
import widgetEnum from '../../enums/widgetEnum';

import '../../css/widgets.css';

const widgetBehaviours = widgetEnum.WIDGET_TYPES_INTERACTION;

const WidgetInteractionItem = ({
  widget,
  onEdit,
  openConfirmModal,
  selected,
  isEditMode,
}) => {

  if (isEditMode && !selected) return (<div></div>);

  const getWidgetBehaviour = () => {
    return widgetBehaviours.find(w => w.id === widget.widgetBehaviour).name;
  };

  return (
    <div className={`alert va-center ${selected ? 'alert-success' : 'alert-primary'}`}>
      <div className="row widget-list">
        <div className="col-md-5">{widget.widgetName}</div>
        <div className="col-md-5">{getWidgetBehaviour()}</div>
        {/* <div className="col-md-3 text-align-center"></div> */}
        <div className="col-md-2 d-flex justify-content-end">
          <div className="fas fa-edit" onClick={() => onEdit(widget)} />
          <div className="fas fa-trash-alt ml-3" onClick={() => openConfirmModal()} />
        </div>
      </div>
    </div>
  );
}

export default WidgetInteractionItem;
