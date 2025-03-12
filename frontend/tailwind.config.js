/** @type {import('tailwindcss').Config} */

const primeui = require('tailwindcss-primeui');


module.exports = {
    content: [
        '.src/**/*.{html,ts,scss,css}'
    ],
    plugins: [
        primeui
    ]
};
