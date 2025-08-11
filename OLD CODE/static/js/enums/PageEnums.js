import Billing from '../pages/main/billing/Billing';
import Dashboard from '../pages/main/Dashboard';
import Donates from '../pages/main/Donates';
import Loading from '../pages/main/Loading';
import Play from '../pages/main/Play';
import Payouts from '../pages/payouts/Payouts';
import DocApi from '../pages/profile/DocApi';
import Library from '../pages/profile/Library';
import Page from '../pages/profile/Page';
import Settings from '../pages/profile/Settings';
import WhatsNew from '../pages/profile/WhatsNew';
import Messages from '../pages/subscriptions/Messages';
import Posts from '../pages/subscriptions/Posts';
import Subscribers from '../pages/subscriptions/Subscribers';
import Subscriptions from '../pages/subscriptions/Subscriptions';
import UserMessages from '../pages/user/UserMessages';
import UserNews from '../pages/user/UserNews';
import UserSubscriptions from '../pages/user/UserSubscriptions';
import WidgetAlerts from '../pages/widgets/WidgetAlerts';
import WidgetGoals from '../pages/widgets/WidgetGoals';
import WidgetInteractions from '../pages/widgets/WidgetInteractions';
import WidgetTops from '../pages/widgets/WidgetTops';


const sections = [{
    id: 'main',
    section: 'Загальні',
    icon: 'home',
    requireSettings: true,
    pages: [{
        id: 'dashboard',
        title: 'Огляд',
        path: '/panel/dashboard',
        icon: 'fas fa-solar-panel',
        component: Dashboard
    }, {
        id: 'donates',
        title: 'Донати',
        path: '/panel/donates',
        icon: 'fas fa-heart',
        component: Donates
    }, {
        id: 'payouts',
        title: 'Виплати',
        path: '/panel/payouts',
        icon: 'fas fa-money-check',
        component: Payouts
	}, {
        id: 'play',
        title: 'Розіграші',
        path: '/panel/play',
        icon: 'fas fa-gift',
        component: Play
    }, {
		id: 'billing',
		title: 'Послуги',
		path: '/panel/billing',
		icon: 'fas fa-university',
		component: Billing
	}, {
        id: 'loading',
        title: 'Завантаження',
        path: '/panel/loading',
        icon: 'fas fa-solar-panel',
        component: Loading,
        feature: 'loader'
    }]
}, {
    id: 'widgets',
    section: 'Віджети',
    icon: 'window-maximize',
    requireSettings: true,
    pages: [{
        id: 'alert-widget',
        title: 'Сповіщення',
        path: '/panel/alert-widget',
        icon: 'far fa-comments',
        component: WidgetAlerts
    }, {
        id: 'goal-widget',
        title: 'Збір коштів',
        path: '/panel/goal-widget',
        icon: 'fas fa-chart-line',
        component: WidgetGoals
    }, {
        id: 'top-widget',
        title: 'Статистика',
        path: '/panel/top-widget',
        icon: 'far fa-star',
        component: WidgetTops
    }, {
        id: 'media-widget',
        title: 'Інтерактивні',
        path: '/panel/interaction-widget',
        icon: 'fas fa-photo-video',
        component: WidgetInteractions
    }]
}, {
    id: 'subscription',
    section: 'Творчість',
    icon: 'fa-solid fa-people-group',
    requireSettings: true,
    pages: [{
        id: 'subscriptions',
        title: 'Підписки',
        path: '/panel/subscriptions',
        icon: 'fa-regular fa-gem',
        component: Subscriptions
    }, {
        id: 'subscribers',
        title: 'Підписники',
        path: '/panel/subscribers',
        icon: 'fa-solid fa-person-walking',
        component: Subscribers
    }, {
        id: 'my-posts',
        title: 'Публікації',
        path: '/panel/posts',
        icon: 'fa-solid fa-rss',
        component: Posts
    }, {
        id: 'messages',
        title: 'Повідомлення',
        path: '/panel/messages',
        icon: 'fa-regular fa-envelope',
        component: Messages
    }]
}, {
    id: 'user-subscription',
    section: 'Глядач',
    icon: 'fa-solid fa-people-pulling',
    requireSettings: true,
    pages: [{
        id: 'user-news',
        title: 'Новини',
        path: '/panel/my-news',
        icon: 'fa-regular fa-file-lines',
        component: UserNews,
    },
	{
        id: 'user-subscriptions',
        title: 'Мої підписки',
        path: '/panel/my-subscriptions',
        icon: 'fa-regular far fa-newspaper',
        component: UserSubscriptions
    }, {
        id: 'user-chats',
        title: 'Мої повідомлення',
        path: '/panel/my-messages',
        icon: 'fa-regular fa-envelope',
        component: UserMessages
    }]
}, {
    id: 'profile',
    section: 'Профіль',
    icon: 'user-circle',
    pages: [{
        id: 'settings',
        title: 'Налаштування',
        path: '/panel/settings',
        icon: 'fas fa-tasks',
        component: Settings
    }, {
        id: 'page',
        title: 'Сторінка',
        path: '/panel/page',
        icon: 'fas fa-chalkboard-teacher',
        component: Page
    }, {
        id: 'library',
        title: 'Бібліотека Donatello',
        path: '/panel/library',
        icon: 'fa-regular fa-images',
        component: Library
    }, {
        id: 'docApi',
        title: 'Donatello API',
        path: '/panel/doc-api',
        icon: 'fas fa-code',
        component: DocApi
    }, {
        id: 'whatsNew',
        title: 'Що нового',
        path: '/panel/whats-new',
        icon: 'far fa-question-circle',
        component: WhatsNew
    }]
}];

function buildSidebarPages() {
    return sections;
}

function buildModuleRoutes() {
    let routes = [];

    sections.forEach((section) => {
        section.pages.forEach((page) => {
            routes.push(page);
        })
    });

    return routes;
}

function buildDefaultModuleRoute() {
    let routes = buildModuleRoutes();

    return routes[0];
}

const SidebarPages = buildSidebarPages();
const PageRoutes = buildModuleRoutes();
const DefaultPageRoute = buildDefaultModuleRoute();

export {SidebarPages, PageRoutes, DefaultPageRoute};
