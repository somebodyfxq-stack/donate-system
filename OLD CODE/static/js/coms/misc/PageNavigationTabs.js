import React, {useCallback, useEffect} from 'react';
import {history} from '../../utils';

const PageNavigationTabs = ({tabs, activeTab, setActiveTab, urlPath}) => {
	const onTabClick = useCallback((tabId) => {
		history.push({
			pathname: `/panel/${urlPath}`,
			search: `?${new URLSearchParams({tab: tabs.find(tab => tab.id === tabId).route})}`
		});

		setActiveTab(tabId);
	}, [setActiveTab, tabs, urlPath]);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const tabFromRoute = urlParams.get('tab') || 'main';

		setActiveTab(tabs.find(tab => tab.route === tabFromRoute)?.id || 1);
	}, [setActiveTab, tabs]);

	return (
		<div className="tabs-button-container">
			<div className="nav nav-tabs">
				{tabs.map(tab => (
						<button key={tab.id}
								className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
								onClick={() => onTabClick(tab.id)}>
							{tab.title}
						</button>
					)
				)}
			</div>
		</div>
	);
};

export default PageNavigationTabs;
