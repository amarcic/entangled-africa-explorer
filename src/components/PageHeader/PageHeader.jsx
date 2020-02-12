import React from 'react';
import { useTranslation } from 'react-i18next';

export const PageHeader = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = lng => {
        i18n.changeLanguage(lng);
    };

    return(
        <header>
            <div>
                <button onClick={() => changeLanguage('de')}>Deutsch</button>
                <button onClick={() => changeLanguage('en')}>English</button>
                <button onClick={() => changeLanguage('fr')}>Français</button>
                <button onClick={() => changeLanguage('ar')}>لعربية</button>
            </div>
            <h1>{t('EntangledAfrica1')}</h1>
            <h2>{t('EntangledAfrica2')}</h2>
        </header>
    )
};