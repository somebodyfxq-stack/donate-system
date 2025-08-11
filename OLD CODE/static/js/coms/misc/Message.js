import React, {Component} from 'react';

class Message extends Component {

    render() {
        const {options, message, close} = this.props;

        return <div className={'app-message message-' + options.type}
                    title='Клацніть, щоб закрити'
                    onClick={close}>
            {message}
        </div>;
    }
}

export default Message;