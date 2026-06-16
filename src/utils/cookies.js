import pkg from 'winston';

const { http } = pkg;

export const cookies = {
    getOptions: () => ({
        httpOptions: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 1 day
    }),

    set: (res, name, value, options = {}) => {
        res.cookie(name, value, { ...cookies.getOptions(), ...options });
    },

    clearCookie: (res, name, options = {}) => {
        res.clearCookie(name, { ...cookies.getOptions(), ...options });
    },

    get: (req, name) => {
        return req.cookies[name];
    }
}