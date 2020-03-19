import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import { HelloComputerButton } from './components/';
import { PageHeader, OurMap } from './components/';
import { LabelsContext, SettingsContext } from './Contexts';
import { INIT_LABELS, INIT_SETTINGS } from "./INIT_VALUES";
import './index.css';
import './i18n';
import { useTranslation } from 'react-i18next';
import CssBaseline from '@material-ui/core/CssBaseline';
//Apollo GraphQL related
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";
import { ApolloProvider } from "@apollo/react-hooks";

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

    //example to check if fetching works
    client
        .query({
            query: gql`
            query giveInfo {
                entity(id: 1189042) {
                    name 
                    temporalArachne {
                        begin
                    }
                }
            }
            `
        }).then(result => console.log(result));

    return(
        <SettingsContext.Provider value={settings}>
            <CssBaseline />
            <PageHeader />
            <h1>{t('EntangledAfrica1')}: {t('EntangledAfrica2')}</h1>
            <ApolloProvider client={client}>
                soon you will also find nice controls here
                <OurMap/>
            </ApolloProvider>
        </SettingsContext.Provider>
        );
    };

ReactDOM.render(<App />, document.getElementById('app' ));