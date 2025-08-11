export const WIDGET_FOR = {
  DONATE: 'donate',
  SUBSCRIPTION: 'subscription',
};

const widgetEnum = {
    VIEW_TYPES: [{
        id: 'topBottom',
        name: 'Картинка зверху, текст знизу'
    }, {
        id: 'bottomTop',
        name: 'Картинка знизу, текст зверху'
    }, {
        id: 'rightLeft',
        name: 'Картинка зправа, текст зліва'
    }, {
        id: 'leftRight',
        name: 'Картинка зліва, текст зправа'
    }, {
        id: 'center',
        name: 'Картинка посередині'
    }],

    TEXT_ALIGNMENT: [{
      id: 'start',
      name: 'Ліворуч'
    }, {
      id: 'center',
      name: 'Середина'
    }, {
      id: 'end',
      name: 'Праворуч'
    }],

	TEXT_TRANSFORM: [{
		id: 'none',
		name: 'Без змін'
	  }, {
		id: 'Upper',
		name: 'Все великими літерами'
	  }, {
		id: 'Lower',
		name: 'Все малими літерами'
	  }],

    CURRENCIES: [{
        name: 'Гривня',
        label: 'UAH',
        sign: '₴',
        selected: true
    }, {
        name: 'Долар',
        label: 'USD',
        sign: '$',
        selected: false
    }, {
        name: 'Євро',
        label: 'EUR',
        sign: '€',
        selected: false
    }],

    WidgetStatus: {
      active: 'active',
      deleted: 'deleted',
      deactivated: 'deactivated',
      paused: 'paused'
    },

    GRADIENT_ANIMATION: [{
      id: 'none',
      name: 'немає'
    }, {
      id: 'always',
      name: 'постійна анімація'
    }, {
      id: 'onDonate',
      name: 'коли отримуєш донат'
    }],

    LANGUAGES_TYPES: [{
      languageCode: 'uk-UA', //female
      ssmlGender: 'FEMALE',
      name: "uk-UA-Wavenet-A",
      voiceID: "googleStandardTTS",
      label: "Українська стандартна (жіночий голос)",
      description: "Чіткий, нейтральний голос — стандарт для автоматичного озвучення."
    }, {
      languageCode: "eNzwzM42HNfZ8BVJOQEB", //male
      voiceID: "eNzwzM42HNfZ8BVJOQEB",
      name: "eNzwzM42HNfZ8BVJOQEB",
      label: "Мемний голос з TikTok",
      description: "Дуже схожий на голос з TikTok який озвучує вредних котів"
    }, {
      languageCode: "MajbwhPMg2mRJJCesMAF", //male
      voiceID: "MajbwhPMg2mRJJCesMAF",
      name: "MajbwhPMg2mRJJCesMAF",
      label: "Олексій Сафін (професійний чоловічий голос)",
      description: "Унікальний український чоловічий голос: баритон середнього віку"
    }, {
      languageCode: "E6wya4FQ70nVOqD4lJ8Z", //female
      voiceID: "E6wya4FQ70nVOqD4lJ8Z",
      name: "E6wya4FQ70nVOqD4lJ8Z",
      label: "Марія Маро (професійний жіночий голос)",
      description: "Унікальний український жіночий голос: теплий, багатий та універсальний"
    }, {
      languageCode: "GVRiwBELe0czFUAJj0nX", //male
      voiceID: "GVRiwBELe0czFUAJj0nX",
      name: "GVRiwBELe0czFUAJj0nX",
      label: "Антон",
      description: "Врівноважений голос із глибоким тембром, підходить для офіційних чи розповідних форматів"
    }, {
      languageCode: "NJGiMgVHtXSA1XYSuNKl", //male
      voiceID: "NJGiMgVHtXSA1XYSuNKl",
      name: "NJGiMgVHtXSA1XYSuNKl",
      label: "Дмитро (акцент на картавість)",
      description: "Голос середній літ, акцент на картавість"
    }, {
      languageCode: "9Sj8ugvpK1DmcAXyvi3a", //male
      voiceID: "9Sj8ugvpK1DmcAXyvi3a",
      name: "9Sj8ugvpK1DmcAXyvi3a",
      label: "Олексій Некрасов",
      description: "Цей голос ідеально підходить для доставки новин, захоплення уваги та надихаючої довіри."
    }, {
      languageCode: "eVItLK1UvXctxuaRV2Oq", //female
      voiceID: "eVItLK1UvXctxuaRV2Oq",
      name: "eVItLK1UvXctxuaRV2Oq",
      label: "Зваблива лиходійка",
      description: "Спокусливий і небезпечний жіночий голос, ідеально підходить для відволікання уваги"
    }, {
      languageCode: "rCYFsCX2waxtHCgVD0e8", //male
      voiceID: "rCYFsCX2waxtHCgVD0e8",
      name: "rCYFsCX2waxtHCgVD0e8",
      label: "Голос з пекла, майже як у диявола :)",
      description: "Демонічний голос, що викликає тривогу з перших секунд. Темний, глибокий із відлунням справжнього жаху."
    }, {
      languageCode: "jn6ifzU1eO5tfUZ2ZJVg", //male
      voiceID: "jn6ifzU1eO5tfUZ2ZJVg",
      name: "jn6ifzU1eO5tfUZ2ZJVg",
      label: "Богдан",
      description: "Глибокий український баритон, що випромінює тепло"
    }, {
      languageCode: "UOxKeHS7lixzgw35mtAR", //male
      voiceID: "UOxKeHS7lixzgw35mtAR",
      name: "UOxKeHS7lixzgw35mtAR",
      label: "Бабуся (70+ років)",
      description: "Бабуся, цим все сказано, приємний, чуйний і добрий голос"
    }, {
      languageCode: "Sg8zw6Na9OqprPcNwJo1", //male
      voiceID: "Sg8zw6Na9OqprPcNwJo1",
      name: "Sg8zw6Na9OqprPcNwJo1",
      label: "Тоббі чи Доббі, ми точно не знаємо",
      description: "Кумедний, незграбний голос з непередбачуваними вставками. Ідеальний для пародій."
    }, {
      languageCode: "vGQNBgLaiM3EdZtxIiuY", //female
      voiceID: "vGQNBgLaiM3EdZtxIiuY",
      name: "vGQNBgLaiM3EdZtxIiuY",
      label: "Дівчина з аніме",
      description: "Пискливий, чарівний голос, що нагадує персонажів з японських мультфільмів."
    }, {
      languageCode: "oR4uRy4fHDUGGISL0Rev", //male
      voiceID: "oR4uRy4fHDUGGISL0Rev",
      name: "oR4uRy4fHDUGGISL0Rev",
      label: "Магічний оповідач з глибоким та мудрим голосом",
      description: "Столітній голос майстра для будь-якої справжньої магічної розповіді."
    }, {
      languageCode: "9yzdeviXkFddZ4Oz8Mok", //female
      voiceID: "9yzdeviXkFddZ4Oz8Mok",
      name: "9yzdeviXkFddZ4Oz8Mok",
      label: "Комедійний та постійно підсмішкуватий голос",
      description: "Жартівливий тон та постійний сміх"
    }, {
      languageCode: "EXAVITQu4vr4xnSDxMaL", //female
      voiceID: "EXAVITQu4vr4xnSDxMaL",
      name: "EXAVITQu4vr4xnSDxMaL",
      label: "Сара",
      description: "Молода доросла жінка з теплим, зрілим та якісним, заспокійливим та професійним тоном."
    }, {
      languageCode: "ThT5KcBeYPX3keUQqHPh", //female
      voiceID: "ThT5KcBeYPX3keUQqHPh",
      name: "ThT5KcBeYPX3keUQqHPh",
      label: "Дороті",
      description: "Емоційний голос із чіткою дикцією та легким шармом"
    }, {
      languageCode: "MF3mGyEYCl7XYWbV9V6O", //female
      voiceID: "MF3mGyEYCl7XYWbV9V6O",
      name: "MF3mGyEYCl7XYWbV9V6O",
      label: "Еллі",
      description: "Живий, емоційний голос із чіткою дикцією та легким шармом"
    }, {
      languageCode: "pNInz6obpgDQGcFmaJgB", //male
      voiceID: "pNInz6obpgDQGcFmaJgB",
      name: "pNInz6obpgDQGcFmaJgB",
      label: "Адам",
      description: "Людина з чіткою дикцією, підходить для всіх"
    }, {
      languageCode: "D38z5RcWu1voky8WS1ja", //male
      voiceID: "D38z5RcWu1voky8WS1ja",
      name: "D38z5RcWu1voky8WS1ja",
      label: "Фін",
      description: "Голос старшої людини, чіткий та солідний"
    }, {
      languageCode: "onwK4e9ZLuTAKqWW03F9", //male
      voiceID: "onwK4e9ZLuTAKqWW03F9",
      name: "onwK4e9ZLuTAKqWW03F9",
      label: "Даніель",
      description: "Сильний голос, ідеально підходить для доставки професійної трансляції чи історії новин."
    }, {
      languageCode: "en-US", //male
      name: "en-US-Wavenet-J",
      voiceID: "googleEnglishStandardTTS",
      label: "Англійська (чоловічий голос)",
      description: "Стандартний Google TTS чоловічий голос"
    }],

    PAGE_VERSION: {
      v1: 'v1',
      v2: 'v2'
    },

    RANDOM_GRADIENT: [
    [
      {
        a: 1,
        b: 36,
        g: 0,
        r: 2
      }, {
        a: 1,
        b: 255,
        g: 212,
        r: 0
      }
    ], [
      {
        a: 1,
        b: 195,
        g: 193,
        r: 34
      }, {
        a: 1,
        b: 45,
        g: 187,
        r: 253
      }
    ], [
      {
        a: 1,
        b: 251,
        g: 94,
        r: 63
      }, {
        a: 1,
        b: 107,
        g: 70,
        r: 252
      }
    ], [
      {
        a: 1,
        b: 180,
        g: 58,
        r: 131
      }, {
        a: 1,
        b: 29,
        g: 29,
        r: 253
      }, {
        a: 1,
        b: 69,
        g: 176,
        r: 252
      }
    ], [
      {
        a: 1,
        b: 202,
        g: 174,
        r: 238
      }, {
        a: 1,
        b: 233,
        g: 187,
        r: 148
      }
    ], [
      {
        r:244,
        g:37,
        b:243,
        a:1
      }, {
        r:255,
        g:204,
        b:37,
        a:1
      }, {
        r:20,
        g:196,
        b:6,
        a:1
      }
    ], [
      {
        r:85,
        g:228,
        b:224,
        a:1
      }, {
        r:75,
        g:68,
        b:224,
        a:0.74
      }, {
        r:64,
        g:198,
        b:238,
        a:1
      }
    ]],

    MARQUEE_DIRECTION: [{
        id: 'left',
        name: 'Праворуч -> ліворуч'
    }, {
        id: 'right',
        name: 'Ліворуч -> праворуч'
    }, {
        id: 'up',
        name: 'Верх -> низ'
    }, {
        id: 'down',
        name: 'Низ -> верх'
    }],

    TEXT_POSITIONS: [{
        id: 'above',
        name: 'Вгорі'
    }, {
        id: 'inside',
        name: 'Посередині'
    }, {
        id: 'below',
        name: 'Внизу'
    }, {
        id: 'none',
        name: 'Відсутня'
    }],

    TEXT_MULTIGOAL_POSITIONS: [{
        id: 'right',
        name: 'Праворуч'
    }, {
        id: 'left',
        name: 'Ліворуч'
    }, {
        id: 'center',
        name: 'Середина'
    }],

    VIEW_TYPES_TOP: [{
        id: 'line',
        name: 'Рухомий рядок'
    }, {
        id: 'list',
        name: 'Список'
    }, {
        id: 'slider',
        name: 'Слайдер'
    }],

    VIEW_TYPES_LIST: [{
        id: 1,
        name: 'Таблиця'
    }, {
        id: 2,
        name: 'Текст'
    }],

    WIDGET_TYPES_INTERACTION: [{
      id: '1',
      name: 'Відео віджет'
    }, {
      id: '2',
      name: 'Таймер'
    }, {
	  id: '3',
      name: 'Коло вибору'
	}],

    TIMER_TYPES_INTERACTION: [{
      id: '1',
      name: 'в секундах'
    }, {
      id: '2',
      name: 'з суми донату'
    }],

    SUBSCRIPTION_TYPES_WIDGET: [{
        id: 'subscriberCounter',
        name: 'Кількість підписників'
    }, {
        id: 'subscriberList',
        name: 'Список підписників'
    }],

    VIEW_TYPES_WIDGET: [{
        id: 'topDonators',
        name: 'Топ'
    }, {
        id: 'donationAmount',
        name: 'Зібрана сума'
    }, {
        id: 'lastDonators',
        name: 'Останній донатер'
    }, {
        id: 'topDjYoutube',
        name: 'Топ DJ (замовлення музики)'
    // }, {
    //     id: 'lastYoutubeSub',
    //     name: 'Останній Youtube підписник'
    // }, {
    //     id: 'lastTwitchSub',
    //     name: 'Останній Twitch підписник'
    // }, {
    //     id: 'youtubeSubs',
    //     name: 'Кількість Youtube підписників'
    // }, {
        // id: 'twitchSubs',
        // name: 'Кількість Twitch підписників'
    }],

    ALERT_TYPES: [{
        id: 'donate',
        name: 'Донат'
    }, {
        id: 'subscription',
        name: 'Регулярна підписка'
    }],

    TEXT_ALIGMENT: [{
      id: 'left',
      name: 'ліворуч'
    }, {
      id: 'center',
      name: 'середина'
    }, {
      id: 'right',
      name: 'праворуч'
    }],

    PERIODS: [{
        id: 'day',
        name: 'Сьогодні'
    }, {
        id: 'last24Hours',
        name: 'Останні 24 години'
    }, {
        id: 'week',
        name: 'Цей тиждень'
    }, {
        id: 'last7Days',
        name: 'Останні 7 днів'
    }, {
        id: 'month',
        name: 'Цей місяць'
    }, {
        id: 'last30Days',
        name: 'Останні 30 днів'
    }, {
        id: 'year',
        name: 'Цей рік'
    }, {
        id: 'lastYear',
        name: 'Останній рік'
    }, {
        id: 'allTime',
        name: 'Весь час'
    }, {
      id: 'custom',
      name: 'Специфічний вибір'
    }],

    FONT_ANIMATIONS: [{
      id: 'none',
      name: 'Немає'
    }, {
      id: "Attention seekers",
      name: "Attention seekers",
      header: true
    }, {
      id: "bounce",
      name: "bounce"
    },{
      id: "flash",
      name: "flash"
    },{
      id: "pulse",
      name: "pulse"
    },{
      id: "rubberBand",
      name: "rubberBand"
    },{
      id: "shakeX",
      name: "shakeX"
    },{
      id: "shakeY",
      name: "shakeY"
    },{
      id: "headShake",
      name: "headShake"
    },{
      id: "swing",
      name: "swing"
    },{
      id: "tada",
      name: "tada"
    },{
      id: "wobble",
      name: "wobble"
    },{
      id: "jello",
      name: "jello"
    },{
      id: "heartBeat",
      name: "heartBeat"
    },{
      id: "Back entrances",
      name: "Back entrances",
      header: true
    },{
      id: "backInDown",
      name: "backInDown"
    },{
      id: "backInLeft",
      name: "backInLeft"
    },{
      id: "backInRight",
      name: "backInRight"
    },{
      id: "backInUp",
      name: "backInUp"
    },{
      id: "Back exits",
      name: "Back exits",
      header: true
    },{
      id: "backOutDown",
      name: "backOutDown"
    },{
      id: "backOutLeft",
      name: "backOutLeft"
    },{
      id: "backOutRight",
      name: "backOutRight"
    },{
      id: "backOutUp",
      name: "backOutUp"
    },{
      id: "Bouncing entrances",
      name: "Bouncing entrances",
      header: true
    },{
      id: "bounceIn",
      name: "bounceIn"
    },{
      id: "bounceInDown",
      name: "bounceInDown"
    },{
      id: "bounceInLeft",
      name: "bounceInLeft"
    },{
      id: "bounceInRight",
      name: "bounceInRight"
    },{
      id: "bounceInUp",
      name: "bounceInUp"
    },{
      id: "Bouncing exits",
      name: "Bouncing exits",
      header: true
    },{
      id: "bounceOut",
      name: "bounceOut"
    },{
      id: "bounceOutDown",
      name: "bounceOutDown"
    },{
      id: "bounceOutLeft",
      name: "bounceOutLeft"
    },{
      id: "bounceOutRight",
      name: "bounceOutRight"
    },{
      id: "bounceOutUp",
      name: "bounceOutUp"
    },{
      id: "Fading entrances",
      name: "Fading entrances",
      header: true
    },{
      id: "fadeIn",
      name: "fadeIn"
    },{
      id: "fadeInDown",
      name: "fadeInDown"
    },{
      id: "fadeInDownBig",
      name: "fadeInDownBig"
    },{
      id: "fadeInLeft",
      name: "fadeInLeft"
    },{
      id: "fadeInLeftBig",
      name: "fadeInLeftBig"
    },{
      id: "fadeInRight",
      name: "fadeInRight"
    },{
      id: "fadeInRightBig",
      name: "fadeInRightBig"
    },{
      id: "fadeInUp",
      name: "fadeInUp"
    },{
      id: "fadeInUpBig",
      name: "fadeInUpBig"
    },{
      id: "fadeInTopLeft",
      name: "fadeInTopLeft"
    },{
      id: "fadeInTopRight",
      name: "fadeInTopRight"
    },{
      id: "fadeInBottomLeft",
      name: "fadeInBottomLeft"
    },{
      id: "fadeInBottomRight",
      name: "fadeInBottomRight"
    },{
      id: "Fading exits",
      name: "Fading exits",
      header: true
    },{
      id: "fadeOut",
      name: "fadeOut"
    },{
      id: "fadeOutDown",
      name: "fadeOutDown"
    },{
      id: "fadeOutDownBig",
      name: "fadeOutDownBig"
    },{
      id: "fadeOutLeft",
      name: "fadeOutLeft"
    },{
      id: "fadeOutLeftBig",
      name: "fadeOutLeftBig"
    },{
      id: "fadeOutRight",
      name: "fadeOutRight"
    },{
      id: "fadeOutRightBig",
      name: "fadeOutRightBig"
    },{
      id: "fadeOutUp",
      name: "fadeOutUp"
    },{
      id: "fadeOutUpBig",
      name: "fadeOutUpBig"
    },{
      id: "fadeOutTopLeft",
      name: "fadeOutTopLeft"
    },{
      id: "fadeOutTopRight",
      name: "fadeOutTopRight"
    },{
      id: "fadeOutBottomRight",
      name: "fadeOutBottomRight"
    },{
      id: "fadeOutBottomLeft",
      name: "fadeOutBottomLeft"
    },{
      id: "Flippers",
      name: "Flippers",
      header: true
    },{
      id: "flip",
      name: "flip"
    },{
      id: "flipInX",
      name: "flipInX"
    },{
      id: "flipInY",
      name: "flipInY"
    },{
      id: "flipOutX",
      name: "flipOutX"
    },{
      id: "flipOutY",
      name: "flipOutY"
    },{
      id: "Lightspeed",
      name: "Lightspeed",
      header: true
    },{
      id: "lightSpeedInRight",
      name: "lightSpeedInRight"
    },{
      id: "lightSpeedInLeft",
      name: "lightSpeedInLeft"
    },{
      id: "lightSpeedOutRight",
      name: "lightSpeedOutRight"
    },{
      id: "lightSpeedOutLeft",
      name: "lightSpeedOutLeft"
    },{
      id: "Rotating entrances",
      name: "Rotating entrances",
      header: true
    },{
      id: "rotateIn",
      name: "rotateIn"
    },{
      id: "rotateInDownLeft",
      name: "rotateInDownLeft"
    },{
      id: "rotateInDownRight",
      name: "rotateInDownRight"
    },{
      id: "rotateInUpLeft",
      name: "rotateInUpLeft"
    },{
      id: "rotateInUpRight",
      name: "rotateInUpRight"
    },{
      id: "Rotating exits",
      name: "Rotating exits",
      header: true
    },{
      id: "rotateOut",
      name: "rotateOut"
    },{
      id: "rotateOutDownLeft",
      name: "rotateOutDownLeft"
    },{
      id: "rotateOutDownRight",
      name: "rotateOutDownRight"
    },{
      id: "rotateOutUpLeft",
      name: "rotateOutUpLeft"
    },{
      id: "rotateOutUpRight",
      name: "rotateOutUpRight"
    },{
      id: "Specials",
      name: "Specials",
      header: true
    },{
      id: "hinge",
      name: "hinge"
    },{
      id: "jackInTheBox",
      name: "jackInTheBox"
    },{
      id: "rollIn",
      name: "rollIn"
    },{
      id: "rollOut",
      name: "rollOut"
    },{
      id: "Zooming entrances",
      name: "Zooming entrances",
      header: true
    },{
      id: "zoomIn",
      name: "zoomIn"
    },{
      id: "zoomInDown",
      name: "zoomInDown"
    },{
      id: "zoomInLeft",
      name: "zoomInLeft"
    },{
      id: "zoomInRight",
      name: "zoomInRight"
    },{
      id: "zoomInUp",
      name: "zoomInUp"
    },{
      id: "Zooming exits",
      name: "Zooming exits",
      header: true
    },{
      id: "zoomOut",
      name: "zoomOut"
    },{
      id: "zoomOutDown",
      name: "zoomOutDown"
    },{
      id: "zoomOutLeft",
      name: "zoomOutLeft"
    },{
      id: "zoomOutRight",
      name: "zoomOutRight"
    },{
      id: "zoomOutUp",
      name: "zoomOutUp"
    },{
      id: "Sliding entrances",
      name: "Sliding entrances",
      header: true
    },{
      id: "slideInDown",
      name: "slideInDown"
    },{
      id: "slideInLeft",
      name: "slideInLeft"
    },{
      id: "slideInRight",
      name: "slideInRight"
    },{
      id: "slideInUp",
      name: "slideInUp"
    },{
      id: "Sliding exits",
      name: "Sliding exits",
      header: true
    },{
      id: "slideOutDown",
      name: "slideOutDown"
    },{
      id: "slideOutLeft",
      name: "slideOutLeft"
    },{
      id: "slideOutRight",
      name: "slideOutRight"
    },{
      id: "slideOutUp",
      name: "slideOutUp"
    }],

    REGIONSIP: [{
        id: "UA-05",
        name: "Вінниця",
        location: "Vinnyts",
        count: 0,
        amount: 0,
    }, {
        id: "UA-07",
        name: "Волинь",
        count: 0,
        amount: 0,
        location: "Volyn"
    }, {
        id: "UA-09",
        name: "Луганськ",
        count: 0,
        amount: 0,
        location: "Luhansk"
    }, {
        id: "UA-12",
        name: "Дніпро",
        count: 0,
        amount: 0,
        location: "Dnipro"
    }, {
        id: "UA-14",
        name: "Донецьк",
        count: 0,
        amount: 0,
        location: "Donetsk"
    }, {
        id: "UA-18",
        name: "Житомир",
        count: 0,
        amount: 0,
        location: "Zhytomyr"
    }, {
        id: "UA-21",
        name: "Закарпаття",
        count: 0,
        amount: 0,
        location: ""
    }, {
        id: "UA-23",
        name: "Запоріжжя",
        count: 0,
        amount: 0,
        location: "Zaporizhz"
    }, {
        id: "UA-26",
        name: "Івано-Франківськ",
        count: 0,
        amount: 0,
        location: "Frankivsk"
    }, {
        id: "UA-30",
        name: "Місто Київ",
        count: 0,
        amount: 0,
        location: "Kyiv City"
    }, {
        id: "UA-32",
        name: "Київ",
        count: 0,
        amount: 0,
        location: "Kyivs"
    }, {
        id: "UA-35",
        name: "Кіровоград",
        location: "Kirovohrads",
        count: 0,
        amount: 0,
    }, {
        id: "UA-40",
        name: "Севастополь",
        count: 0,
        amount: 0,
        location: "Sebastopol Sevastopol",
    }, {
        id: "UA-43",
        name: "Крим - це Україна",
        count: 0,
        amount: 0,
        location: "Crimea",
    }, {
        id: "UA-46",
        name: "Львів",
        location: "L'vivs Lviv",
        count: 0,
        amount: 0,
    }, {
        id: "UA-48",
        name: "Миколаїв",
        count: 0,
        amount: 0,
        location: "Mykolayiv",
    }, {
        id: "UA-51",
        name: "Одеса",
        location: "Odeska Odes",
        count: 0,
        amount: 0,
    }, {
        id: "UA-53",
        name: "Полтава",
        count: 0,
        amount: 0,
        location: "Poltava",
    }, {
        id: "UA-56",
        name: "Рівне",
        location: "Rivnens Rivne",
        count: 0,
        amount: 0,
    }, {
        id: "UA-59",
        name: "Суми",
        location: "Sums Sumy",
        count: 0,
        amount: 0,
    }, {
        id: "UA-61",
        name: "Тернопіль",
        location: "Ternopil",
        count: 0,
        amount: 0,
    }, {
        id: "UA-63",
        name: "Харків",
        location: "Kharkiv",
        count: 0,
        amount: 0,
    }, {
        id: "UA-65",
        name: "Херсон",
        location: "Khersons",
        count: 0,
        amount: 0,
    }, {
        id: "UA-68",
        name: "Хмельницький",
        location: "Khmel'nyts'ka Khmeln",
        count: 0,
        amount: 0,
    }, {
        id: "UA-71",
        name: "Черкаси",
        count: 0,
        amount: 0,
        location: "Cherkasy",
    }, {
        id: "UA-74",
        name: "Чернігів",
        count: 0,
        amount: 0,
        location: "Chernihiv",
    }, {
        id: "UA-77",
        name: "Чернівці",
        count: 0,
        amount: 0,
        location: "Chernivtsi",
    }],

    FONTS: [
        {name: "monofont", id: "monofont", val: 0},
        {name: "Pangolin", id: "'Pangolin', cursive", val: 1},
        {name: "Bad Script", id: "'Bad Script', cursive", val: 2},
        {name: "Comfortaa", id: "'Comfortaa', cursive", val: 3},
        {name: "Cormorant SC", id: "'Cormorant SC', serif", val: 4},
        {name: "Didact Gothic", id: "'Didact Gothic', sans-serif", val: 5},
        {name: "Exo 2", id: "'Exo 2', sans-serif", val: 6},
        {name: "Forum", id: "'Forum', cursive", val: 7},
        {name: "Kelly Slab", id: "'Kelly Slab', cursive", val: 8},
        {name: "Kurale", id: "'Kurale', serif", val: 9},
        {name: "Lobster", id: "'Lobster', cursive", val: 10},
        {name: "Lobster Two", id: "'Lobster Two', cursive", val: 11},
        {name: "Lora", id: "'Lora', serif", val: 12},
        {name: "Marck Script", id: "'Marck Script', cursive", val: 13},
        {name: "Merriweather Sans", id: "'Merriweather Sans', sans-serif", val: 14},
        {name: "Merriweather", id: "'Merriweather', serif", val: 15},
        {name: "Neucha", id: "'Neucha', cursive", val: 16},
        {name: "Noto Serif", id: "'Noto Serif', serif", val: 17},
        {name: "Open Sans", id: "'Open Sans', sans-serif", val: 18},
        {name: "Open Sans Condensed", id: "'Open Sans Condensed', sans-serif", val: 19},
        {name: "Oswald", id: "'Oswald', sans-serif", val: 20},
        {name: "Philosopher", id: "'Philosopher', sans-serif", val: 21},
        {name: "Play", id: "'Play', sans-serif", val: 22},
        {name: "Playfair Display", id: "'Playfair Display', serif", val: 23},
        {name: "Poiret One", id: "'Poiret One', cursive", val: 24},
        {name: "Press Start 2P", id: "'Press Start 2P', cursive", val: 25},
        {name: "Roboto Condensed", id: "'Roboto Condensed', sans-serif", val: 26},
        {name: "Roboto Slab", id: "'Roboto Slab', serif", val: 27},
        {name: "Rubik", id: "'Rubik', sans-serif", val: 28},
        {name: "Rubik Mono One", id: "'Rubik Mono One', sans-serif", val: 29},
        {name: "Ruslan Display", id: "'Ruslan Display', cursive", val: 30},
        {name: "Russo One", id: "'Russo One', sans-serif", val: 31},
        {name: "Underdog", id: "'Underdog', cursive", val: 32},

        {name: "Amatic SC", id: "'Amatic SC', cursive", val: 33},
        {name: "Caveat", id: "'Caveat', cursive", val: 34},
        {name: "Jura", id: "'Jura', sans-serif", val: 35},
        {name: "Andika", id: "'Andika', sans-serif", val: 36},
        {name: "Literata", id: "'Literata', serif", val: 37},
        {name: "Poiret One", id: "'Poiret One', cursive", val: 38},
        {name: "Fira Sans Extra Condensed", id: "'Fira Sans Extra Condensed', sans-serif", val: 39},
        {name: "Montserrat", id: "'Montserrat', sans-serif", val: 40},

    ],

    // Images new instance
    // also we have a copy of this on backend
    images: () => {
        return [{
            id: 1,
            path: 'https://media.giphy.com/media/3o6Zt3OhbsQ5VLPmBW/giphy.gif',
            name: 'South Park'
        }, {
            id: 2,
            path: 'https://media.giphy.com/media/wpw9k5Qqh8JGg/giphy.gif',
            name: 'Donation Box'
        }, {
            id: 3,
            path: 'https://media.giphy.com/media/FsEsiwoXfZZCM/giphy.gif',
            name: 'Go, go'
        }, {
            id: 4,
            path: 'https://media.giphy.com/media/21v18KHh72DPa/giphy.gif',
            name: 'ice'
        }, {
            id: 5,
            path: 'https://media.giphy.com/media/ByUJHy4pyb1OU/giphy.gif',
            name: 'money'
        }, {
            id: 6,
            path: 'https://media.giphy.com/media/DoBrLnW1gVs64/giphy.gif',
            name: 'ice 2'
        }, {
            id: 7,
            path: 'https://media.giphy.com/media/3orieV6LqnXBYXanoQ/giphy.gif',
            name: 'simpsons'
        }, {
            id: 8,
            path: 'https://media.giphy.com/media/quWy75oAR5mDe/giphy.gif',
            name: 'goal'
        }, {
            id: 9,
            path: 'https://media.giphy.com/media/l2Jec6gCxujPIBKOQ/giphy.gif',
            name: 'simpsons 2'
        }, {
            id: 10,
            path: 'https://media.giphy.com/media/sDcfxFDozb3bO/giphy.gif',
            name: 'futurama'
        }, {
            id: 11,
            path: 'https://media.giphy.com/media/koMT6SdGxNw40/giphy.gif',
            name: 'money 2'
        }, {
            id: 12,
            path: 'https://media.giphy.com/media/3o7TKqutbBKc5ZP8pW/giphy.gif',
            name: 'south park 2'
        }, {
            id: 13,
            path: 'https://media.giphy.com/media/wt9vQha9HaExy/giphy.gif',
            name: 'simpsons 3'
        }, {
            id: 14,
            path: 'https://media.giphy.com/media/XYnBfgMRZy3MQ/giphy.gif',
            name: 'loud'
        }, {
            id: 15,
            path: 'https://media.giphy.com/media/VkMV9TldsPd28/giphy.gif',
            name: 'go 2'
        }, {
            id: 16,
            path: 'https://media.giphy.com/media/3o6Mb9oeV59vc1XeEw/giphy.gif',
            name: 'simpsons 4'
        }, {
            id: 17,
            path: 'https://media.giphy.com/media/cALkoAIov3Y9a/giphy.gif',
            name: 'i need it'
        }, {
            id: 18,
            path: 'https://media.giphy.com/media/mTdDhflqMCxtC/giphy.gif',
            name: 'i must go'
        }];
    },

    // Sounds new instance
    // also we have a copy of this on backend
    sounds: () => {
        return [{
            id: 2,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/air-horn-club-sample_1.mp3',
            name: 'air-horn-club',
        }, {
            id: 3,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/and-his-name-is-john-cena-1.mp3',
            name: 'and-his-name-is-john-cena-1',
        }, {
            id: 4,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/arroto_-_timo_pra_msg.mp3',
            name: 'arroto_-_timo_pra_msg',
        }, {
            id: 5,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/birdtheword.swf.mp3',
            name: 'birdtheword.swf',
        }, {
            id: 6,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/cuek.swf.mp3',
            name: 'cuek.swf',
        }, {
            id: 10,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/finishhim.swf.mp3',
            name: 'finishhim.swf',
        }, {
            id: 12,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/fuckoff.mp3',
            name: 'fuckoff',
        }, {
            id: 14,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/hallelujahshort.swf.mp3',
            name: 'hallelujahshort.swf',
        }, {
            id: 15,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/Halo.mp3',
            name: 'Halo',
        }, {
            id: 16,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/happy_birthday.mp3',
            name: 'happy_birthday',
        }, {
            id: 17,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/hello_motherfrucker.mp3',
            name: 'hello_motherfrucker',
        }, {
            id: 18,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/inceptionbutton.mp3',
            name: 'inceptionbutton',
        }, {
            id: 19,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/it-was-at-this-moment-that-he-he-knew-he-f-cked-up.mp3',
            name: 'it-was-at-this-moment-that-he-he-knew-he-f-cked-up',
        }, {
            id: 20,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/joey-s-_how-you-doin.mp3',
            name: 'joey-s-_how-you-doin',
        }, {
            id: 21,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/knockknockknockpenny.mp3',
            name: 'knockknockknockpenny',
        }, {
            id: 22,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/metalgearsolid.swf.mp3',
            name: 'metalgearsolid.swf',
        }, {
            id: 23,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/no-god-please-no-noooooooooo.mp3',
            name: 'no-god-please-no-noooooooooo',
        }, {
            id: 24,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/oh-shit_4.mp3',
            name: 'oh-shit_4',
        }, {
            id: 25,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/run-vine-sound-effect.mp3',
            name: 'run-vine-sound-effect',
        }, {
            id: 26,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/sound-9____.mp3',
            name: 'sound-9',
        }, {
            id: 27,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/surprise-motherfucker.mp3',
            name: 'surprise-motherfucker',
        }, {
            id: 28,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/thisissparta.swf.mp3',
            name: 'thisissparta.swf',
        }, {
            id: 29,
            path: 'https://storage.googleapis.com/donatello_upload/default_items/sounds/wakawaka.swf.mp3',
            name: 'wakawaka.swf',
        }];
    },

	HorizontalAlignmentButtons: [{
			text: 'Ліво',
			position: 'left'
		}, {
			text: 'Центр',
			position: 'center'
		},	{
			text: 'Право',
			position: 'right'
	}],

	VerticalAlignmentButtons: [{
			text: 'Верх',
			position: 'top'
		}, {
			text: 'Центр',
			position: 'center'
		}, {
			text: 'Низ',
			position: 'bottom'
	}]
};

export default widgetEnum;
