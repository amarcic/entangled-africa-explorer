import React from 'react';
import { Grid } from '@material-ui/core'
import { useStyles } from '../../styles';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export const Layout = (props) => {
    const {menu, bigTile, leftOrTopTile, topRightOrMiddleTile, bottomRightOrBottomTile, loadingIndicator, rightTileIsMovedToBottomInstead} = props;

    const theme = useTheme();
    const classes = useStyles();

    /* Default breakpoints (inclusive-exclusive):
             xs = extra-small: 0px-600px
             sm = small: 600px-960px
             md = medium: 960px-1280px
             lg = large: 1280px-1920px
             xl = extra-large: 1920px-...
    */

    const containerForTwoTiles = (tiles) => {
        return (
            useMediaQuery(theme.breakpoints.up('md')) && !rightTileIsMovedToBottomInstead
                ? <Grid
                    item
                    xs={12}
                    md={rightTileIsMovedToBottomInstead ? 12 : 6}
                    lg={rightTileIsMovedToBottomInstead ? 12 : 8}

                    container
                    direction="row"
                    spacing={rightTileIsMovedToBottomInstead ? 2 : 0}
                >
                    {tiles}
                </Grid>
                : tiles
        )
    }

    return (
        <Grid
            className={classes.dashboardBody}

            container
            direction="row"
            spacing={2}
        >

            <Grid
                item
                xs={12}
                md={12}
                lg={12}

                container
                direction="column"
            >
                {
                    // collapsed or expanded filters
                    menu
                }
            </Grid>

            {bigTile && <Grid
                className={classes.fullHeightTile}

                item
                xs={12}
                md={12}
                lg={12}

                container
                direction="row"
                spacing={0}
            >
                {
                    // whichever tile was enlarged by the user
                    bigTile
                }
            </Grid>}

            {leftOrTopTile && <Grid
                className={classes.fullHeightTile}

                item
                xs={12}
                md={rightTileIsMovedToBottomInstead ? 12 : 6}
                lg={rightTileIsMovedToBottomInstead ? 12 : 4}

                container
            >
                {
                    // map (if not enlarged)
                    leftOrTopTile
                }
            </Grid>}

            {/* if areaA and areaB are supposed to be shown as two tiles next to the map, put a container Grid around them to accomplish this */}
            {containerForTwoTiles(
                <>
                    <Grid
                        className={classes.halfHeightTile}

                        item
                        xs={12}
                        md={rightTileIsMovedToBottomInstead ? 6 : 12}

                        container
                        direction="row"
                    >
                        {
                            // areaA (if not enlarged, in that case areaB moves here)
                            topRightOrMiddleTile
                        }
                    </Grid>

                    <Grid
                        className={classes.halfHeightTile}

                        item
                        xs={12}
                        md={rightTileIsMovedToBottomInstead ? 6 : 12}

                        container
                        direction="row"
                    >
                        {
                            // areaB (if not enlarged)
                            bottomRightOrBottomTile
                        }
                    </Grid>
                </>
            )}

            <Grid
                className={classes.dashboardFooter}
                item
                xs={12}
                md={12}
                lg={12}
            >
                {
                    // loading symbol (if current query result is still loading)
                    loadingIndicator
                }
            </Grid>
        </Grid>
    );
}
