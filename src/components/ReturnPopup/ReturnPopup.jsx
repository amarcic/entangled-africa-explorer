import React from "react";
import {Popup} from "react-leaflet";
import {Button} from "@material-ui/core";

export const ReturnPopup = (props) => {
    return (
        <Popup>
            <div>
                <h2>{props.object.name}</h2>
                <p>{props.place.name}</p>
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
                    onClick={() => {props.handleRelatedObjects(props.object.identifier)}}
                    name="showRelatedObjects"
                    variant="contained"
                    color="primary"
                    disabled={props.showRelatedObjects}
                >
                    Show related objects
                </Button>
            </div>
        </Popup>
    );
};