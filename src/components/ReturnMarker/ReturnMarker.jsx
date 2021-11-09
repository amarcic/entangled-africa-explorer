import React, { useEffect, useRef } from 'react';
import { Marker } from "react-leaflet";
import { ReturnPopup } from "..";


export const ReturnMarker = (props) => {
    const { item, nestedItem, openPopup, handleRelatedObjects, showRelatedObjects } = props;
    const markerRef = useRef(null);

    useEffect(() => {
        if (openPopup) {
            markerRef && markerRef.current.openPopup();
        }
    }, [openPopup]);

    if (!(item.coordinates||nestedItem.coordinates)) return null;
    return (
        <Marker
            //coordinates need to be reversed because of different standards between geojson and leaflet
            position={nestedItem
                ? nestedItem.coordinates.split(", ").reverse()
                : item.coordinates.split(", ").reverse()}
            whenCreated={
                markerInstance => {
                    markerRef.current = markerInstance
                }
            }
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
