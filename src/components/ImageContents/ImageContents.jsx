import React from "react";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { Grid, List, ListItem, Typography } from "@material-ui/core";

export const ImageContents = (props) => {
    const { contents, maximizeTileButton } = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    //not sure if this format is okay as input for word cloud
    const countStuff = (stuff) => {
        let stuffCounts = {};
        if(stuff) {
            for (let i = 0; i < stuff.length; i++) {
                const num = stuff[i];
                stuffCounts[num] = stuffCounts[num] ? stuffCounts[num] + 1 : 1;
            }
        }
        return stuffCounts;
    }

    return (
        <>
            <Grid className={classes.dashboardTileHeader} item container direction="row" spacing={2}>
                <Grid item>
                    <Typography variant="h6" component="h3">{t('Image contents')}</Typography>
                </Grid>
                <Grid item xs={1}>
                    {maximizeTileButton}
                </Grid>
            </Grid>
            <Grid className={classes.dashboardTileContent} item container direction="column" spacing={2}>
                <Grid item>
                    Here could be a word cloud maybe...
                    {/*Something basic with the image contents*/}
                    {contents && contents.map((content, idx) => {
                            const countedContent = countStuff(content);
                            return (countedContent
                                && <List key={idx}>
                                    <h4>{`Image contents list ${idx}:`}</h4>
                                    {Object.keys(countedContent).map(c => {
                                            return (c
                                                && <ListItem key={c}>
                                                    {`${c}: ${countedContent[c]}`}
                                                </ListItem>

                                            )
                                        }
                                    )}
                                </List>
                            )
                        }
                    )}
                </Grid>
            </Grid>
        </>
    )
};
