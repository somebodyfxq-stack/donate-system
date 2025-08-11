class SettingsModel {
    email = '';
    nickname = '';
    clientName = '';
	forbiddenWordsEnabled = true;
    wordsBlackList = '';
	forbiddenWordReplacement = '';
    subtractFee = false;
    newStatsDate = false;
    authorTopDonatorStartDate = '';
    removeLinks = false;
    token = '';
    userRole = [];
    darkTheme = false;
    moderateDonates = 1; // in seconds
    userAuths = {
        google: {linked: false},
        youtube: {linked: false},
        twitch: {linked: false},
        discord: {linked: false},
        trovo: {linked: false}
    };
}

export default SettingsModel;
