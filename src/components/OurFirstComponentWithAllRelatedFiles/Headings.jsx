import React from 'react';

// the hook
import { useTranslation } from 'react-i18next';

export const Headings = () => {
    const { t, i18n } = useTranslation();
    return([
        <h1>{t('EntangledAfrica1')}</h1>,
        <h2>{t('EntangledAfrica2')}</h2>
    ])
};