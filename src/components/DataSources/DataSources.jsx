import React from "react";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { Grid, List, ListItem, Typography } from "@material-ui/core";

export const DataSources = (props) => {
    const {maximizeTileButton} = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    return (
        <>
            <Grid className={classes.dashboardTileHeader} item container direction="row" spacing={2}>
                <Grid item>
                    <Typography variant="h6" component="h3">{t('Data sources')}</Typography>
                </Grid>
                <Grid item xs={1}>
                    {maximizeTileButton}
                </Grid>
            </Grid>
            <Grid className={classes.dashboardTileContent} item container direction="column" spacing={2}>
                <Grid item>
                    Here could be a list maybe...
                    <List>
                        <ListItem>iDAI.objects Arachne</ListItem>
                        <ListItem>iDAI.gazetteer</ListItem>
                        <ListItem>iDAI.chronontology</ListItem>
                    </List>
                </Grid>
            </Grid>
        </>
    )
};
