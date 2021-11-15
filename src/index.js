import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { AppContent } from './components/';
import './index.css';
import './i18n';
import { useTranslation } from 'react-i18next';
import CssBaseline from '@material-ui/core/CssBaseline';
//Apollo GraphQL related
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from '@apollo/react-hooks';
import { theme } from "./styles";
import { MuiThemeProvider } from "@material-ui/core";

const App = () => {

    const { t, i18n } = useTranslation();

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
        <React.Fragment>
            <CssBaseline/>
            <ApolloProvider client={client}>
                <MuiThemeProvider theme={theme}>
                    <AppContent/>
                </MuiThemeProvider>
            </ApolloProvider>
        </React.Fragment>
    );
};

ReactDOM.render(<App />, document.getElementById('app' ));