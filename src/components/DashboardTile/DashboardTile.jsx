import React from "react";
import { Card } from "@material-ui/core";
import { useStyles } from "../../styles";

export const DashboardTile = (props) => {
    const [input, dispatch] = props.reducer;
    const {area, content, showNext} = props;

    const classes = useStyles();

    return (
        <div className={classes.dashboardTile}>
            {showNext}
            <Card className={showNext ? classes.cardOfTileWithShowNext : classes.cardOfTileWithoutShowNext}>
                {content}
            </Card>
        </div>
    );
}