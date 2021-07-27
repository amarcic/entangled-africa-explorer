import React from "react";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { Grid, List, ListItem } from "@material-ui/core";

export const DataSources = () => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

    return (
        <>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Data sources')}</h3>
                </Grid>
            </Grid>
            <Grid className={classes.gridContent} item container direction="column" spacing={2}>
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
