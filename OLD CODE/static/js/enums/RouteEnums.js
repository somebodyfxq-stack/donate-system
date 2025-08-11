export const ApiHost = window.location.origin;

export const ApiBase = '/api/v1';

export const ApiRoutes = {
    me: `${ApiBase}/me`,
    donates: `${ApiBase}/donates`,
    clients: `${ApiBase}/clients`,
	subscribers: `${ApiBase}/subscribers?isActive=true`
};
