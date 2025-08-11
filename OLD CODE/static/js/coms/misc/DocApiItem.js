import React, {Component} from 'react';
import '../../css/doc-api.css';
import {ApiBase, ApiHost} from '../../enums/RouteEnums';
import helpers from '../../utils/helpers';


class DocApiItem extends Component {

    render() {
        const {title} = this.props;
        const {method, route, query, response, responseExample} = this.props.api;
        let {requestExample} = this.props.api;

        return <section className="doc-api-section">
            <h3>{title}</h3>

            <div className="form-group row">
                <div className="col-sm-6 col-form-label">
                    <div className="link">
                        <div className="badge badge-primary">{method}</div>
                        <span>{ApiHost + ApiBase}/<strong>{route}</strong></span>
                    </div>

                    <div className="security box">
                        <h4>Security: Token</h4>
                        <div className="description">
                            Provide your token in the 'X-Token' header when making request.
                        </div>
                        <div className="example">
                            Example: <span className="code">'X-Token': {`{token}`}</span>
                        </div>
                    </div>

                    {query && <div className="params box">
                        <h4>Query parameters</h4>
                        {query.map((param) => <div key={param.name} className="param">
                            <div className="param-header">
                                <span className="param-name">{param.name}</span>
                                <span className="param-type">{param.type}</span>
                                <span className="param-code">{param.default}</span>
                                {param.optional && <span className="param-optional">optional</span>}
                            </div>
                        </div>)}
                    </div>}

                    {response.map((resp) => <div key={resp.code} className="params box">
                        <h4>
                            <span>Response</span>
                            <span className="response-type">
                                {resp.type}
                            </span>
                            <span className={'badge badge-sm badge-' + resp.cls}>{resp.code}</span>
                        </h4>
                        {resp.params.map((param) => <div key={param.name} className="param">
                            <div className="param-header">
                                <span className="param-name">{param.name}</span>
                                <span className="param-type">{param.type}</span>
                                {param.example && <span className="param-code">{param.example}</span>}
                            </div>
                        </div>)}
                    </div>)}
                </div>

                <div className="col-sm-6 col-form-label">
                    <div className="code-box">
                        <div className="header">
                            <div className="title">
                                Request example: cURL
                            </div>
                            <i className="fas fa-copy pointer" onClick={() => helpers.copyText(requestExample)}/>
                        </div>
                        <div className="text-code">
                            <pre>{requestExample}</pre>
                        </div>
                    </div>

                    <div className="code-box mt-3">
                        <div className="header">
                            <div className="title">
                                Response example
                            </div>
                            <i className="fas fa-copy pointer" onClick={() => helpers.copyText(responseExample)}/>
                        </div>
                        <div className="text-code">
                            <pre>{responseExample}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>;
    }
}


export default DocApiItem;
