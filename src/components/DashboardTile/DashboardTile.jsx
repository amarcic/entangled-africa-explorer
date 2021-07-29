import React from "react";
import { Card, IconButton } from "@material-ui/core";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import { useStyles } from "../../styles";

export const DashboardTile = (props) => {
    const [input, dispatch] = props.reducer;
    const {area, content, showNext} = props;

    const classes = useStyles();

    console.log(area);
    console.log(input.bigTileArea);

    return (
        <>
            <Card className={classes.card}>
                <IconButton
                    onClick={() => dispatch({type: "UPDATE_INPUT", payload: {field: "bigTileArea", value: input.bigTileArea === area ? "" : area}})}
                    style={{backgroundColor: "rgba(171,134,97,0.18)"/*, position: "relative", left: "20px", top: "70px"*/}}
                >
                    {input.bigTileArea === area
                        ? <ZoomOutIcon/>
                        : <ZoomInIcon/>
                    }
                </IconButton>
                {content}
            </Card>
            {showNext}
        </>
    );
}