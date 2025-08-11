import React, {Component} from 'react';
import {connect} from 'react-redux';
import '../../css/settings.css';
import WhatsNewEnum from '../../enums/WhatsNewEnum';

class WhatsNew extends Component {
    constructor(props) {
        super(props);

        this.state = {
            items: WhatsNewEnum,
        };
    }

    componentDidMount() {
        localStorage.setItem('whatsNewCounter', WhatsNewEnum.length + '');
    }

    /**
     * @return {JSX.Element}
     */
    render() {
        const {modal} = this.props;
        let {items} = this.state;

        items = JSON.parse(JSON.stringify(items));

        if (modal) {
            items.length = 1;
        }

        return <div className={!modal ? 'whats-new' : ''}>
            {items.map((w, i) =>
                <section key={i} style={{marginBottom: 30}}>
                    <h3 style={{marginTop: 0}}>{w.title}</h3>
                    <div className="card-body" style={{paddingTop: '10px'}}>
                        <p className="card-text">{w.content}</p>
                    </div>
                </section>
            )}
            {modal && <button type="button" className="btn btn-primary" style={{'float': 'right'}}
                              onClick={() => this.props.onCloseModal()}>
                Закрити
            </button>}
        </div>;
    }
}

function mapStateToProps(state) {
    const {status} = state.config;
    return {status};
}

export default connect(mapStateToProps)(WhatsNew);
