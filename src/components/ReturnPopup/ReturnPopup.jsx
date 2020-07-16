import React from "react";
import {Popup} from "react-leaflet";
import {Button} from "@material-ui/core";

export const ReturnPopup = (props) => {
    return (
        <Popup>
            <div>
                <h2>{props.object.name}</h2>
                {props.place&&<p>{props.place.name}</p>}
                {props.showRelatedObjects&&props.mapDataContextEntity
                &&<ul>{
                    (props.mapDataContextEntity.related
                        &&props.mapDataContextEntity.related.map( relatedObj =>
                            <li>{relatedObj
                                ? `${relatedObj.name} (${relatedObj.type})`
                                : "no access"
                            }</li>
                        )
                    )
                }</ul>}
                {props.handleRelatedObjects&&<Button
                    onClick={() => {props.handleRelatedObjects(props.object.identifier)}}
                    name="showRelatedObjects"
                    variant="contained"
                    color="primary"
                    disabled={props.showRelatedObjects}
                >
                    Show related objects
                </Button>}
            </div>
        </Popup>
    );
};