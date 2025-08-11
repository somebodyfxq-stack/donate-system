import React, {Component} from 'react';

class WidgetItemAdd extends Component {
  render() {
    const {onAdd, isDisabled, label} = this.props;

    return (
      <button type="button"
        className={'btn add-widget ' + (isDisabled ? 'btn-default' : 'btn-dark')}
        onClick={(e) => onAdd(e)}
        disabled={isDisabled}>
        {label || 'Додати віджет'}
      </button>
    );
  }
}

export default WidgetItemAdd;
