import React, {useRef, useEffect} from 'react';
import {Marker} from "react-leaflet";
import {ReturnPopup} from "..";


export const ReturnMarker = (props) => {
    console.log("ReturnMarker...")

    const markerRef = useRef(null);
    const { item, openPopup } = props;

    useEffect(() => {
        if (openPopup) {
            console.log("Now the popup for marker", item.name, "should open...");
            markerRef.current.leafletElement.openPopup();
        }
    }, [openPopup]);

    return (
        <Marker
            ref={markerRef}
            //coordinates need to be reversed because of different standards between geojson and leaflet
            position={item.coordinates.split(", ").reverse()}
        >
            <ReturnPopup item={item}/>
        </Marker>
    );
};