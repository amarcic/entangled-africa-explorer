import React from "react";
import {Popup} from "react-leaflet";
import {Button} from "@material-ui/core";

export const ReturnPopup = (object, place, handleRelatedObjects, showRelatedObjects) => {
    return (
        <Popup>
            <div>
                <h2>{object.name}</h2>
                <p>{place.name}</p>
                {/*{input.showRelatedObjects&&mapDataContext&&mapDataContext.entity
                &&<ul>{
                    (mapDataContext.entity.related
                        &&mapDataContext.entity.related.map( relatedObj =>
                            <li>{relatedObj
                                ? `${relatedObj.name} (${relatedObj.type})`
                                : "no access"
                            }</li>
                        )
                    )
                }</ul>}*/}
                <Button
                    onClick={() => {handleRelatedObjects(object.identifier)}}
                    name="showRelatedObjects"
                    variant="contained"
                    color="primary"
                    disabled={showRelatedObjects}
                >
                    Show related objects
                </Button>
            </div>
        </Popup>
    );
};