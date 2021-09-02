import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AppBar, Button, ClickAwayListener, Drawer, Grid, Grow, MenuItem, MenuList, Paper, Popper, Toolbar, Typography
} from '@material-ui/core';
import TranslateIcon from '@material-ui/icons/Translate';
import { useStyles } from '../../styles';
import { CollapsedFilters } from "../CollapsedFilters/CollapsedFilters";
import { Filters } from "../Filters/Filters";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SearchIcon from '@material-ui/icons/Search';


export const PageHeader = (props) => {

    const [input, dispatch] = props.reducer;
    const {arachneTypes, periods, regions} = props;

    const { t, i18n } = useTranslation();

    const changeLanguage = lng => {
        i18n.changeLanguage(lng).then();
    };

    const classes = useStyles();

    // Language menu: state, ref, handlers
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);

    const handleToggle = () => {
        setOpen(prevOpen => !prevOpen);
    };

    const handleClose = event => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    function handleLanguageChange(newLang) {
        changeLanguage(newLang);
        setOpen(false);
    }

    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        }
    }

    // Language menu: return focus to the button when we transitioned from !open -> open
    const prevOpen = useRef(open);
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);


    //Filters drawer: state, toggling
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = () => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(!drawerOpen);
    };

    return(
        <>
            <AppBar
                className={classes.appBar}
                color="primary"
                position="relative"
            >
                <Toolbar>
                    <Grid container direction="row" className={classes.dashboardHeader}>
                        <Grid item xs={10}>
                            <Typography variant="h1" className={classes.h1}>Entangled Africa Data Explorer</Typography>
                            <Typography variant="h2" className={classes.h2}>{t('EntangledAfrica1')}: {t('EntangledAfrica2')}</Typography>
                            <Button onClick={toggleDrawer()}>
                                <SearchIcon/> Filters <ExpandMoreIcon/>
                            </Button>
                            <CollapsedFilters
                                input={input}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <Button
                                ref={anchorRef}
                                aria-controls={open ? 'menu-list-grow' : undefined}
                                aria-haspopup="true"
                                onClick={handleToggle}

                            >
                                <TranslateIcon/> {t('current language')}
                            </Button>
                            <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal placement="bottom-end">
                                {({ TransitionProps, placement }) => (
                                    <Grow
                                        {...TransitionProps}
                                        style={{ transformOrigin: placement === 'top' ? 'left top' : 'left bottom' }}
                                    >
                                        <Paper className={classes.paper}>
                                            <ClickAwayListener onClickAway={handleClose}>
                                                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                                    <MenuItem onClick={() => handleLanguageChange('de')}>Deutsch</MenuItem>
                                                    <MenuItem onClick={() => handleLanguageChange('en')}>English</MenuItem>
                                                    <MenuItem onClick={() => handleLanguageChange('fr')}>Français</MenuItem>
                                                    <MenuItem onClick={() => handleLanguageChange('ar')}>لعربية</MenuItem>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>

            <Drawer
                classes={{
                    paper: classes.drawerPaper
                }}
                anchor="top"
                open={drawerOpen}
                onClose={toggleDrawer()}
                //onClose={toggleDrawer(false)}
                //onOpen={setDrawerOpen(true)}
            >
                <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={toggleDrawer()}
                >
                    <SearchIcon/> Close filters <ExpandLessIcon/>
                </Button>
                <Filters
                    arachneTypes={arachneTypes}
                    periods={periods}
                    reducer={[input, dispatch]}
                    regions={regions}
                />
            </Drawer>
        </>
    );
};