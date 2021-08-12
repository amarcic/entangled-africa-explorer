import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ClickAwayListener, Grid, Grow, MenuItem, MenuList, Paper, Popper } from '@material-ui/core';
import TranslateIcon from '@material-ui/icons/Translate';
import { useStyles } from '../../styles';


export const PageHeader = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = lng => {
        i18n.changeLanguage(lng).then();
    };

    const classes = useStyles();

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

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

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);


    return(
        <Grid container direction="row" className={classes.dashboardHeader}>
            <Grid item xs={10}>
                <h1 className={classes.h1}>Entangled Africa Data Explorer</h1>
                <h2 className={classes.h2}>{t('EntangledAfrica1')}: {t('EntangledAfrica2')}</h2>
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
    );
};