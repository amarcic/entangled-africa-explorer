import React, { useContext } from 'react';
import { SettingsContext, LabelsContext } from "../../Contexts";

export const HelloComputerButton = props => {

    const settings = useContext(SettingsContext);
    const labels = useContext(LabelsContext);

    return(
        <button onClick={ (ev) => alert(`Hi ${ev.type}`) }>{labels.HelloComputerButton[settings.language]}</button>
    );
}