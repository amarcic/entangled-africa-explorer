import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import {PageHeader, AppContent} from './components/';
import { LabelsContext, SettingsContext } from './Contexts';
import { INIT_LABELS, INIT_SETTINGS } from "./INIT_VALUES";
import './index.css';
import './i18n';
import { useTranslation } from 'react-i18next';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
//Apollo GraphQL related
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from '@apollo/react-hooks';

const App = () => {

    const { t, i18n } = useTranslation();

    const [settings, setSettings] = useState(INIT_SETTINGS);

    //Apollo GraphQL related
    const cache = new InMemoryCache();
    const link = new HttpLink({
        uri: "http://localhost:4000/"
    });

    const client = new ApolloClient({
        cache,
        link
    });

    return(
        <SettingsContext.Provider value={settings}>
            <CssBaseline />
            <Container maxWidth={"xl"}>
                <PageHeader />
                <h1>{t('EntangledAfrica1')}: {t('EntangledAfrica2')}</h1>
                <ApolloProvider client={client}>
                    <AppContent/>
                </ApolloProvider>
            </Container>
        </SettingsContext.Provider>
    );
};

ReactDOM.render(<App />, document.getElementById('app' ));