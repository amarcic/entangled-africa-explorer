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

const App = () => {

    const { t, i18n } = useTranslation();

    const [labels, setLabels] = useState(INIT_LABELS);
    const [settings, setSettings] = useState(INIT_SETTINGS);

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

    return(
        <LabelsContext.Provider value={labels} ><SettingsContext.Provider value={settings}>
            <CssBaseline />
            <PageHeader />
            <p>{t('EntangledAfrica1')}</p>
            <div>
                <span>{labels.HelloWorld[settings.language]}</span><br />
                <HelloComputerButton />
                <button type="button" onClick={() => onSwitchLanguages(settings.language)} >Switch</button>
            </div>
        </SettingsContext.Provider></LabelsContext.Provider>

        );
    };

ReactDOM.render(<App />, document.getElementById('app' ));