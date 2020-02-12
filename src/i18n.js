import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationsAR from '../public/locales/translationsAR.json';
import translationsDE from '../public/locales/translationsDE.json';
import translationsEN from '../public/locales/translationsEN.json';
import translationsFR from '../public/locales/translationsFR.json';

// the translations
const resources = {
    ar: {
        translation: translationsAR
    },
    de: {
        translation: translationsDE
    },
    en: {
        translation: translationsEN
    },
    fr: {
        translation: translationsFR
    },
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: "en",

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;