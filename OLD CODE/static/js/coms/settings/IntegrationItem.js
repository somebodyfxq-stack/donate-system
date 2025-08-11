import React, {Component} from 'react';
import Switch from 'react-switch';
import helpers from '../../utils/helpers';


class IntegrationItem extends Component {

    templateValues = ['isPaidFee', 'userName', 'amount', 'currency', 'goalName', 'message'];

    render() {
        const {
            title, name, id, config, placeholder, hasTemplate, template, templatePlaceholder, description,
            showRemoveIcon
        } = this.props;
        const {secondaryId, secondaryPlaceholder} = this.props;
        const {toggle, change, save, remove, test} = this.props;

        return <div className='integration-item'>
		<div className="form-group row my-0">
            <label className="col-12 col-md-3 col-form-label" htmlFor="webHook">
                <strong>{title}</strong>
            </label>
            <div className="col-12 col-md-7 mt-3 mt-md-0">
                {/* <div className="d-flex align-items-center mt-1 mb-3">
                    <Switch id={`${name}Enabled`}
                            onChange={(checked) => toggle(checked, name)}
                            checked={config?.enabled || false}/>

                    <small className="form-text text-muted ml-3">
                        {config?.enabled ? 'Увімкнено' : 'Вимкнено'}
                    </small>
                </div> */}

                <input id={id} className="form-control"
                    placeholder={placeholder}
                    disabled={!config?.enabled}
                    onChange={(e) => change(e, name)}
                    onBlur={() => save(name)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            save(name);
                        }
                    }}
                    value={config ? (config[id] || '') : ''}/>

                {secondaryId &&
                    <input id={secondaryId} className="form-control mt-3"
                           placeholder={secondaryPlaceholder}
                           disabled={!config?.enabled}
                           onChange={(e) => change(e, name)}
                           onBlur={() => save(name)}
                           onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                   save(name);
                               }
                           }}
                           value={config ? (config[secondaryId] || '') : ''}/>
                }

                <small id={`${name}-${id}`} className="form-text text-muted mt-3">
                    {description}
                </small>

                <div className="d-flex justify-content-between align-items-center mt-4">
                    {hasTemplate && <button className="btn btn-outline-dark" data-toggle="collapse"
                                            data-target={`.template-${id}`}
                                            aria-expanded="false" aria-controls={`.template-${id}`}>
                        <i className="fas fa-cog mr-2"/> Шаблон
                    </button>}

                    <button className="btn btn-dark ml-auto"
                            disabled={!config?.enabled}
                            onClick={() => test(name)}>
                        <i className="fas fa-paper-plane mr-2"/> Тестове повідомлення
                    </button>
                </div>

                {hasTemplate && <div className={`collapse my-3 template-${id}`}>
                    <input id="template" className="form-control"
                           placeholder={templatePlaceholder}
                           disabled={!config?.enabled}
                           onChange={(e) => change(e, name)}
                           onBlur={() => save(name)}
                           onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                   save(name);
                               }
                           }}
                           value={template || ''}/>

                    <small id={`${name}-${id}-template`}
                           className="form-text text-muted d-flex align-items-center flex-wrap mt-3">
                        <span className="mr-2 mb-2">Доступні змінні:</span>
                        {this.templateValues.map((value) =>
                            <span key={value} className="badge badge-pill badge-value pointer mb-2"
                                  onClick={(e) => helpers.copyText(`{${value}}`)}>
                                {`{${value}}`}
                            </span>
                        )}
                    </small>
                </div>}
            </div>

			<div className="col-12 col-md-2 col-0 switch-wrapper">
				<div className="d-flex align-items-center justify-content-end mt-1 mb-3">
                    {showRemoveIcon && (
                        <div className="mr-4">
                            <i className="fas cursor fa-trash-alt"
                                title="Видалити"
                                onClick={() => remove(name)} />
                        </div>
                    )}

                    <Switch
						id={`${name}Enabled`}
						onChange={(checked) => toggle(checked, name)}
						checked={config?.enabled || false}
						height={24}
						width={45}
						onColor='#3579F6'
					/>
                </div>
            </div>
        </div>
		</div>
    }
}

export default IntegrationItem;
