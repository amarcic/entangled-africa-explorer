import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import { HelloComputerButton } from './components/';
import { PageHeader } from './components/';
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

    //const [labels, setLabels] = useState(INIT_LABELS);
    const [settings, setSettings] = useState(INIT_SETTINGS);

    //Apollo GraphQL related
    const cache = new InMemoryCache();
    const link = new HttpLink({
        uri: "http://localhost:4000/"
    });

    const client = new ApolloClient({
        cache,
        link
    })

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
    /*
    const onSwitchLanguages = (setLang) => {
        switch (setLang){
            case 'en':
                const newSettings = {...settings, language: "de"};
                setSettings(newSettings);
                break;
            case 'de':
                const newSettings1 = {...settings, language: "en"};
                setSettings(newSettings1);
                break;
            default:
                console.log("How did we even get here?");
        }
    };
     */

    return(
        <SettingsContext.Provider value={settings}>
            <CssBaseline />
            <PageHeader />
            <h1>{t('EntangledAfrica1')}: {t('EntangledAfrica2')}</h1>
            <ApolloProvider client={client}>
                soon you will find a map with nice controls here
            </ApolloProvider>
        </SettingsContext.Provider>

        );
    };

ReactDOM.render(<App />, document.getElementById('app' ));