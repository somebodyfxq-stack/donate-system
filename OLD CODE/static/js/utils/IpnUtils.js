const IpnUtils = {
    IpnPattern:  /^\d{10}$/,
    IpnMinDate: '1900-01-01',
    IpnMultipliers: [-1, 5, 7, 9, 4, 6, 10, 5, 7],
    IpnGenderMale: 'male',
    IpnGenderFemale: 'female',
	RestrictedIpns: ['0000000000', '1000000000'],

    gender: (ipn) => {
        if (!IpnUtils.isMatch(ipn)) {
            return false;
        }

        return ipn[8] % 2 ? IpnUtils.IpnGenderMale : IpnUtils.IpnGenderFemale;
    },

    birthDate: (ipn) => {
        if (!IpnUtils.isMatch(ipn)) {
            return false;
        }

        const days = parseInt(ipn.substring(0, 5)) - 1;

        return new Date(`${IpnUtils.IpnMinDate}T00:00:00Z`).setDate(
            new Date(`${IpnUtils.IpnMinDate}T00:00:00Z`).getDate() + days
        );
    },

    age: (ipn) => {
        const birthDate = IpnUtils.birthDate(ipn);

        if (!birthDate) {
            return false;
        }

        const from = new Date(birthDate);
        const to = new Date();

        return to.getFullYear() - from.getFullYear() -
            (from > to || (from.getFullYear() === to.getFullYear() && from.getMonth() > to.getMonth()) ||
                (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth() && from.getDate() > to.getDate())) ? 1 : 0;
    },

    isMatch: (ipn) => {
        return IpnUtils.IpnPattern.test(ipn);
    },

    isValidChecksum: (ipn) => {
        const count = IpnUtils.IpnMultipliers.length;
        let controlSum = 0;

        for (let i = 0; i < count; i++) {
            controlSum += ipn[i] * IpnUtils.IpnMultipliers[i];
        }

        const control = (controlSum - 11 * Math.floor(controlSum / 11)) % 10;

        return control === parseInt(ipn[9]);
    },

    isValid: (ipn) => {
        return IpnUtils.isMatch(ipn) && IpnUtils.isValidChecksum(ipn) && !IpnUtils.RestrictedIpns.includes(ipn);
    }
}

export default IpnUtils;
