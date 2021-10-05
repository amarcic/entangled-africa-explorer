import React from "react";
import { Tab, Tabs } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";


export const ShowNext = (props) => {
    const [input, dispatch] = props.reducer;
    const { labels, area } = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const handleChange = (event, newValue) => {
        dispatch({type: "UPDATE_INPUT", payload: {field: area, value: newValue}})
    };


    return (
        <div style={{display: "flex", width: "100%", height: "35px", minHeight: "35px",}}>
            {labels && <Tabs
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
                        className={input[area] === idx ? classes.tabSelected : classes.tab}
                    />
                )}
            </Tabs>}
        </div>
    )
};
