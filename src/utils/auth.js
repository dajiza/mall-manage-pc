const TokenKey = 'user_token';

export function getToken() {
    return localStorage.getItem(TokenKey);
}

export function setToken(token) {
    return localStorage.setItem(TokenKey, token);
}
export function getAdminId() {
    return localStorage.getItem(AdminId);
}

export function setAdminId(id) {
    return localStorage.setItem(AdminId, id);
}

export function removeToken() {
    return localStorage.removeItem(TokenKey);
}
