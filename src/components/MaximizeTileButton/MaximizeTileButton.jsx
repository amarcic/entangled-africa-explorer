import React from "react";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { IconButton } from "@material-ui/core";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ZoomInIcon from "@material-ui/icons/ZoomIn";

export const MaximizeTileButton = (props) => {
    const [input, dispatch] = props.reducer;
    const {area} = props;

    const {t, i18n} = useTranslation();

    const classes = useStyles();

    return (
        <IconButton
            className={classes.maximizeTileButton}
            onClick={() => dispatch({
                type: "UPDATE_INPUT",
                payload: {field: "bigTileArea", value: input.bigTileArea === area ? "" : area}
            })}
        >
            {input.bigTileArea === area
                ? <ZoomOutIcon/>
                : <ZoomInIcon/>
            }
        </IconButton>
    );
};