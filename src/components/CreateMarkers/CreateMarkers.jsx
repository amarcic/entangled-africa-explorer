import React from 'react';
import { ReturnMarker } from "..";


export const CreateMarkers = (props) => {
    //console.log("CreateMarkers...")
    const { data, selectedMarker, handleRelatedObjects, showRelatedObjects } = props;


    return data && data.map((item, index) => {
            if (item && item.coordinates) {
                return (
                    item &&
                    <ReturnMarker
                        key={index}
                        item={item}
                        openPopup={selectedMarker === index}
                    />
                );
            }
            else if (item && item.spatial) {
                return item.spatial.map( (nestedItem, nestedIndex) => {
                        if (nestedItem === null) return null; //sometimes objects seem to have an empty 'spatial' array...?
                        else {
                            return(
                                item && nestedItem &&
                                <ReturnMarker
                                    key={index + '.' + nestedIndex}
                                    item={item}
                                    nestedItem={nestedItem}
                                    openPopup={(selectedMarker === index + '.' + nestedIndex) || showRelatedObjects} //?
                                    handleRelatedObjects={handleRelatedObjects}
                                    showRelatedObjects={showRelatedObjects}
                                />
                            )
                        }
                    }
                );
            }
        }
    );
};
