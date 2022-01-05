import React, { Fragment, useEffect, useState } from 'react';

export const useMediaQueries = () => {
    let isPhone = false,
        isTablet = false,
        isDesktop = false,
        currentWidth = 0;

    const [ revision, setRevision ] = useState(0);
    const NOOP = () => {};

    const computeVars = (ow, forceUpdate) => {
        currentWidth = ow;

        if (ow < 768 && !isPhone) {
            isPhone = true;
            isTablet = false;
            isDesktop = false;
            return forceUpdate && setRevision(revision + 1);
        }

        if (ow >= 768 && ow < 1200 && !isTablet) {
            isPhone = false;
            isTablet = true;
            isDesktop = false;
            return forceUpdate &&setRevision(revision + 1);
        }

        if (ow >= 1200 && !isDesktop) {
            isPhone = false;
            isTablet = false;
            isDesktop = true;
            return forceUpdate && setRevision(revision + 1);
        }
    }
    // initial computation to setup vars on startup
    computeVars(window && window.outerWidth, false);

    useEffect(() => {
        const resizeHandler = e => {
            computeVars(e.target.outerWidth, true);
        }

        window.addEventListener('resize', resizeHandler);
        
        return function cleanUp() {
            window.removeEventListener('resize', resizeHandler);
        }
    });

    return {
        isPhone,
        isTablet,
        isDesktop,
        currentWidth
    }
}


export const MediaQuery = ( { showAtPhone, showAtTablet, showAtDesktop, children } ) => {
    const { isPhone, isTablet, isDesktop } = useMediaQueries();

    if (showAtPhone && isPhone) return children;
    if (showAtTablet && isTablet) return children;
    if (showAtDesktop && isDesktop) return children;
    
    return null;
}