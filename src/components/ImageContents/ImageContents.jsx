import React from "react";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { Card, Grid } from "@material-ui/core";

export const ImageContents = () => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Image contents')}</h3>
                </Grid>
                <Grid item>
                    Here could be a word cloud maybe
                </Grid>
            </Grid>
        </Card>
    )
}