import React, {useCallback, useEffect} from 'react';

const PageTabs = ({tabs, activeTab, setActiveTab}) => {
	const onTabClick = useCallback((tabRoute) => {
		setActiveTab(tabRoute);
	}, [setActiveTab]);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const tabFromRoute = urlParams.get('tab') || 'main';

		setActiveTab(tabs.find(tab => tab.route === tabFromRoute)?.route || tabs[0].route);
	}, [setActiveTab, tabs]);

	return (
		<div className="tabs-button-container">
			<div className="nav nav-tabs">
				{tabs.map(tab => (
					<button key={tab.route}
							className={`nav-link ${activeTab === tab.route ? 'active' : ''}`}
							onClick={() => onTabClick(tab.route)}>
						{tab.title}
					</button>
				))}
			</div>
		</div>
	);
};

export default PageTabs;
