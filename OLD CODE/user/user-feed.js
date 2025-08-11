/*global $, UserPage */
/*jshint strict: false*/
/*jslint browser: true*/
/*jslint unparam: true*/

const UserFeed = {};

(function (me) {

    const feedItemTpl = `<div class="feed-item">
        <div class="userpic me-3" style="background-image: url('{avatar}')"></div>
        <div class="d-flex flex-column feed-item-details">
            <div class="d-flex align-items-end">
                <div class="client-name one-line">{clientName}</div>
                <div class="amount ms-auto">
                    <span>{amount}</span>
                    <span>{currency}</span>
                </div>
            </div>
            <div class="d-flex align-items-end">
                <div class="message mt-2">{message}</div>
                <div class="time-ago ms-auto">{timeAgo}</div>
            </div>
        </div>
    </div>`;

    const module = {

        // defaults
        isPaymentThanks: false,

        // dom components
        feedCmp: null,

        init: function (config) {
            me.isPaymentThanks = config.isPaymentThanks || me.isPaymentThanks;

            me.feedCmp = $('.feed');

            $(document).ready(function () {
                if (!me.isPaymentThanks) {
                    me.fetchData();
                }

                me.initEvents();
            });
        },

        initEvents: function () {

        },

        fetchData: function () {
            const url = window.location.pathname.split('/')[1];

            $.ajax({
                url: `/${url}/feed`,
                method: 'GET',
                success: function (resp) {
                    if (resp.success) {
                        me.render(resp.data);
                    } else {
                        UserPage.showNotification(resp.message || 'Щось пішло не так');
                    }
                }
            });
        },

        getRandomAvatar: function () {
            const topType = ['LongHairStraigh', 'LongHairDreads', 'WinterHat1'].sort(() => 0.5 - Math.random())[0];
            const skinColor = ['Brown', 'Pale', 'Tanned', 'Black'].sort(() => 0.5 - Math.random())[0];
            const eyeType = ['Squint', 'Dizzy', 'Happy'].sort(() => 0.5 - Math.random())[0];
            const clotheType = ['Overall', 'BlazerShirt'].sort(() => 0.5 - Math.random())[0];

            return `https://avataaars.io/?avatarStyle=Circle&topType=${topType}&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=${clotheType}&eyeType=${eyeType}&eyebrowType=Default&mouthType=Default&skinColor=${skinColor}`;
        },

        render: function (data) {
            let feedItems = '';

            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                item.currency = Currency[item.currency] || Currency.USD;
                item.timeAgo = $.timeago(item.createdAt);
                feedItems += UserPage.compileTemplate(feedItemTpl, item);
            }

            me.feedCmp && me.feedCmp.find('.feed-container').append(feedItems);
            me.feedCmp && me.feedCmp.show();
        }
    };

    $.extend(me, module);

}(UserFeed));
