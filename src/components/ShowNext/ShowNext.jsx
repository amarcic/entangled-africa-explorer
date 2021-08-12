import React from "react";
import { Button, Card, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

// additional styling for this component only
const localStyles = makeStyles(theme => ({
    showNextCard: {
        backgroundColor: "rgba(171,134,97,0.18)",
        //width: "100%",
        width: "99.5%",
        marginLeft: "0.25%",
        borderBottomRightRadius: "30px",
        borderBottomLeftRadius: "30px"
    },
    showNextGrid: {
        height: "35px",
        justifyContent:"space-between",
        alignItems:"center",
    }
}));

export const ShowNext = (props) => {
    const [input, dispatch] = props.reducer;
    const { labels, area } = props;

    const numberOfValues = labels.length;

    const { t, i18n } = useTranslation();

    const localClasses = localStyles();


    return (
        <Card className={localClasses.showNextCard} square>
            <Grid className={localClasses.showNextGrid} item xs={12} container direction="row">
                <Grid item>
                    <Button
                        onClick={() => {
                            dispatch({type: "UPDATE_INPUT", payload: {
                                    field: area,
                                    value: input[area]===0
                                        ? numberOfValues-1
                                        : input[area]-1
                                }})
                        }}
                    >
                        <ArrowLeft/>
                    </Button>
                </Grid>
                <Grid item>
                    <span>{t(labels[input[area]])}</span>
                </Grid>
                <Grid item>
                    <Button
                        onClick={() => {
                            dispatch({type: "UPDATE_INPUT", payload: {
                                    field: area,
                                    value: input[area]===numberOfValues-1
                                        ? 0
                                        : input[area]+1
                                }})
                        }}
                    >
                        <ArrowRight/>
                    </Button>
                </Grid>
            </Grid>
        </Card>
    )
};
