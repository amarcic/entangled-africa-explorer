import React from "react";
import {Popup} from "react-leaflet";
import {Button} from "@material-ui/core";


export const ReturnPopup = (props) => {
    //console.log("ReturnPopup...")
    const { item, nestedItem, showRelatedObjects, handleRelatedObjects } = props;


    return (
        <Popup>
            {item
            && <h2>{item.name}</h2>}
            {nestedItem
            && <p>{nestedItem.name}</p>}
            {/*showRelatedObjects
            &&<ul>{
                (item
                    &&item.related
                    &&item.related.map( relatedObj =>
                        <li>{relatedObj
                            ? `${relatedObj.name} (${relatedObj.type})`
                            : "no access"
                        }</li>
                    )
                )
            }</ul>*/}
            {handleRelatedObjects&&
            <Button
                onClick={() => {handleRelatedObjects(item.identifier)}}
                name="showRelatedObjects"
                variant="contained"
                color="primary"
                disabled={showRelatedObjects}
            >
                Show related objects
            </Button>}
        </Popup>
    );
};
