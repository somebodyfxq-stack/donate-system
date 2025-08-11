export const UserStatus = {
    // -- No tier: new clients
    none: 'none',                   // new account, not verified

    // -- Tier #1: verified clients
	basic: 'basic',                 // basic client, verified by moderator or admin
	middle: 'middle',               // middle client with popular channel

    // -- Tier #2: top clients
	advanced: 'advanced',           // advanced client with solid history
	partner: 'partner',             // partner with benefits and prioritized support
	business: 'business',           // business partner (fop, commercial)

    // -- Edge cases
    pending: 'pending',             // suspected in fraud, not used for a long time
    blocked: 'blocked'              // finally blocked due to fraud activity
};

export const UserRole = {
	user: 'user',
	blogger: 'blogger',
	streamer: 'streamer',
};

export const UserLimitedStatuses = [UserStatus.none, UserStatus.basic];
export const UserFirstTierStatuses = [UserStatus.basic, UserStatus.middle];
export const UserBaseVerifiedStatuses = [UserStatus.basic, UserStatus.middle, UserStatus.advanced, UserStatus.partner, UserStatus.business];
export const UserVerifiedStatuses = [UserStatus.middle, UserStatus.advanced, UserStatus.partner, UserStatus.business];
export const UserTopStatuses = [UserStatus.advanced, UserStatus.partner, UserStatus.business];
export const UserActiveStatuses = [UserStatus.none, UserStatus.basic, UserStatus.middle, UserStatus.advanced, UserStatus.partner, UserStatus.business];
export const UserSuspendedStatuses = [UserStatus.pending, UserStatus.blocked];

export const isUserLimitedStatus = (status) => {
  return UserLimitedStatuses.includes(status);
}

export const isUserFirstTierStatus = (status) => {
	return UserFirstTierStatuses.includes(status);
}

export const isUserBaseVerifiedStatus = (status) => {
	return UserBaseVerifiedStatuses.includes(status);
}

export const isUserVerifiedStatus = (status) => {
	return UserVerifiedStatuses.includes(status);
}

export const isUserTopStatus = (status) => {
	return UserTopStatuses.includes(status);
}

export const isUserActiveStatus = (status) => {
	return UserActiveStatuses.includes(status);
}

export const isUserSuspendedStatus = (status) => {
	return UserSuspendedStatuses.includes(status);
}



export const StatusTerms = {
    none: {
		title: 'Початківець', icon: 'fas fa-horse', scroll: 0,
		serviceFee: '5', dailyAmount: '2,000',
		isModeratedPayouts: true
	},
    basic: {
		title: 'Базовий', icon: 'fas fa-handshake', scroll: 0,
		serviceFee: '5', dailyAmount: '4,000', upgradeAmount: '4,000',
		isModeratedPayouts: true
	},
    middle: {
		title: 'Середній', icon: 'fas fa-user-shield', scroll: 250,
		serviceFee: '5', maxAmount: '6,000', upgradeAmount: '8,000'
	},
    advanced: {
		title: 'Досвідчений', icon: 'fas fa-star', scroll: 505,
		serviceFee: '3', maxAmount: '10,000', upgradeAmount: '20,000'
	},
    partner: {
		title: 'Партнер', icon: 'fas fa-crown', scroll: 755,
		serviceFee: '2', maxAmount: '24,000', upgradeAmount: '40,000'
	},
	business: {
		title: 'Бізнес', icon: 'fas fa-briefcase', scroll: 900,
		serviceFee: '2', maxAmount: '24,000', upgradeAmount: '40,000'
	},
	pending: {
		title: 'Призупинено', icon: 'fas fa-pause-circle', scroll: 0, serviceFee: '5'
	},
    blocked: {
		title: 'Заблоковано', icon: 'fas fa-ban', scroll: 0, serviceFee: '5'
	}
}
