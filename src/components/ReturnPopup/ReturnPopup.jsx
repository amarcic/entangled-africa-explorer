import React from "react";
import {Popup} from "react-leaflet";
import {Button} from "@material-ui/core";

export const ReturnPopup = (object, place, hRO) => {
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
                    onClick={() => {hRO(place.identifier)}}
                    name="showRelatedObjects"
                    variant="contained"
                    color="primary"
                    disabled={false}//OurMap.input.showRelatedObjects}
                >
                    Show related objects
                </Button>
            </div>
        </Popup>
    );
};