import React from "react";
import { IconButton, Tab, Tabs } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { useStyles } from "../../styles";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ZoomInIcon from "@material-ui/icons/ZoomIn";

// additional styling for this component only
const localStyles = makeStyles(theme => ({
    showNextCard: {
        //backgroundColor: "rgba(171,134,97,0.18)",
        width: "100%",
        //width: "99.5%",
        //marginLeft: "0.25%",
        //borderBottomRightRadius: "30px",
        //borderBottomLeftRadius: "30px"
    },

}));

export const ShowNext = (props) => {
    const [input, dispatch] = props.reducer;
    const { labels, area } = props;

    //const numberOfValues = labels.length;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const handleChange = (event, newValue) => {
        dispatch({type: "UPDATE_INPUT", payload: {field: area, value: newValue}})
    };


    return (
        <div style={{display: "flex", width: "100%", height: "35px", minHeight: "35px",}}>
            <Tabs
                value={input[area]}
                onChange={handleChange}
                textColor="primary"
                //indicatorColor="primary"
                TabIndicatorProps={{
                    style: {
                        display: "none"
                    }
                }}
                variant="scrollable"
                scrollButtons="auto"
                aria-label={`${area} selection tabs`}
                className={classes.tabs}
            >
                {labels.map((label, idx) => <Tab
                        key={idx}
                        value={idx}
                        label={t(label)}
                        variant={"outlined"}
                        className={input[area]===idx ? classes.tabSelected : classes.tab}
                    />
                )}
            </Tabs>

            <IconButton
                onClick={() => dispatch({type: "UPDATE_INPUT", payload: {field: "bigTileArea", value: input.bigTileArea === area ? "" : area}})}
                style={{backgroundColor: "rgba(171,134,97,0.18)"/*, position: "relative", left: "20px", top: "70px"*/}}
            >
                {input.bigTileArea === area
                    ? <ZoomOutIcon/>
                    : <ZoomInIcon/>
                }
            </IconButton>
        </div>
    )
};
