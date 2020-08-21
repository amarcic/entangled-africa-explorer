import React from 'react';
import {ReturnMarker} from "..";


export const CreateMarkers = (props) => {
    console.log("CreateMarkers...")

    const { data, selectedMarker } = props;
    console.log("The selectedMarker is index", selectedMarker)

    return data.map((item, index) => (
        <ReturnMarker
            key={index}
            item={item}
            openPopup={selectedMarker === index}
        />
    ));
}