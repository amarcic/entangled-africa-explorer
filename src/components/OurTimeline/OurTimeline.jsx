import React from "react";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";


export const OurTimeline = () => {

    const { t, i18n } = useTranslation();

    return (
        <div>
            <h2>{t('Timeline')}</h2>
            <Grid className="grid-outer" container direction="row" spacing={1}>
                <Grid className="grid-timeline" item xs={12} lg={9}>
                    here will be an amazing timeline
                </Grid>
            </Grid>
        </div>
    );
};
