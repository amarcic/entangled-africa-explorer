import React from "react";
import {Popup} from "react-leaflet";
import {Button} from "@material-ui/core";

export const ReturnPopup = (props) => {

    //const { object, place, showRelatedObjects, handleRelatedObjects, mapDataContextEntity } = props;
    const { item } = props;

    return (
        //TODO: bring back all contents to popups
        /*<Popup>
            <div>
                <h2>{object.name}</h2>
                {place&&<p>{place.name}</p>}
                {showRelatedObjects&&mapDataContextEntity
                &&<ul>{
                    (mapDataContextEntity.related
                        &&mapDataContextEntity.related.map( relatedObj =>
                            <li>{relatedObj
                                ? `${relatedObj.name} (${relatedObj.type})`
                                : "no access"
                            }</li>
                        )
                    )
                }</ul>}
                {handleRelatedObjects&&<Button
                    onClick={() => {handleRelatedObjects(object.identifier)}}
                    name="showRelatedObjects"
                    variant="contained"
                    color="primary"
                    disabled={showRelatedObjects}
                >
                    Show related objects
                </Button>}
            </div>
        </Popup>*/
        <Popup>
            {item.name}
        </Popup>
    );
};