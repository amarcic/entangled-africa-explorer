import React, { useRef, useEffect } from 'react';
import { Marker } from "react-leaflet";
import { ReturnPopup } from "..";


export const ReturnMarker = (props) => {
    //console.log("ReturnMarker...")
    const { item, nestedItem, openPopup, handleRelatedObjects, showRelatedObjects } = props;
    const markerRef = useRef(null);

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
            position={nestedItem ? nestedItem.coordinates.split(", ").reverse() : item.coordinates.split(", ").reverse()}
        >
            {nestedItem
                ? <ReturnPopup item={item}
                               nestedItem={nestedItem}
                               handleRelatedObjects={handleRelatedObjects}
                               showRelatedObjects={showRelatedObjects}
                />
                : <ReturnPopup item={item}/>
            }
        </Marker>
    );
};
