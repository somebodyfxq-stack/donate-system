import React, {Component} from 'react';

class WidgetItemSave extends Component {

  render() {
    const { onCancel, onPreview, hidePreviewButton } = this.props;

    return (
      <div className="form-group row mb-lg-2 mt-lg-5">
        <div className="col-sm-4 d-flex justify-content-start mb-3 mb-sm-0">
          {!hidePreviewButton &&
            <button className="btn btn-light mr-2 preview-button"
              disabled={!this.props.widgetId}
              onClick={(e) => onPreview(e)}>
              Попередній перегляд
            </button>
          }
        </div>
        <div className="col-sm-8 d-flex justify-content-end">
          <button className="btn btn-light mr-2"
            onClick={(e) => onCancel(e)}>
            Скасувати
          </button>
          <button className="btn btn-primary" type="submit">
            Зберегти віджет
          </button>
        </div>
      </div>
    )
  }
}

export default WidgetItemSave;
