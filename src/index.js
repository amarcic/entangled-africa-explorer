import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { HelloComputerButton } from './components/';
import './index.css';

const INIT_LABELS = {
    HelloWorld: {
        de: "Hallo ganze Welt",
        en: "Hello World"
    },
    HelloComputerButton: {
        de: "Achtung, Rechenmaschine!",
        en: "Hello Computer"
    }
};

const INIT_SETTINGS = {
    language: "en"
}

const App = () => {
    const [labels, setLabels] = useState(INIT_LABELS);
    const [settings, setSettings] = useState(INIT_SETTINGS);

    return(
        <div>
            <span>{labels.HelloWorld[settings.language]}</span><br />
            <HelloComputerButton />
        </div>
        )
    }

ReactDOM.render(<App />, document.getElementById('app' ))
