import React from "react";
import { IconButton } from "@material-ui/core";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ZoomInIcon from "@material-ui/icons/ZoomIn";

export const DashboardTile = (props) => {
    const [input, dispatch] = props.reducer;
    const {area, content, showNext} = props;

    return (
        <>
            <IconButton
                onClick={() => dispatch({type: "TOGGLE_STATE", payload: {toggledField: `${area}IsBig`}})
                }
                style={{backgroundColor: "rgba(171,134,97,0.18)", position: "relative", left: "20px", top: "70px"}}
            >
                {input[`${area}IsBig`]
                    ? <ZoomOutIcon/>
                    : <ZoomInIcon/>
                }
            </IconButton>
            {content}
            {showNext}
        </>
    )
}