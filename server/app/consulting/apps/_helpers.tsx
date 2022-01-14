import React from "react";
import { AppData } from "/imports/api/types/app-types";

export const renderSimpleWidgetAufwandMitEinheit = (value: number, doc: AppData<any>): string | number | JSX.Element => {
    if (!doc) return <div>?</div>;

    const { singular, plural, faktor, precision } = doc.anzeigeeinheitDetails;
    const aufwand = value / faktor;
    let displayAufwand = +(Number(aufwand).toFixed(precision === undefined ? 2 : precision))
    
    return (
        <div>
            <span>{displayAufwand}</span>
            <span style={{fontSize:12, marginLeft:8}}>{(aufwand == 1 ? singular:plural)}</span>
        </div>
    );
}


export const renderSimpleWidgetCurrency = (value: number, doc: AppData<any>): string | number | JSX.Element => {
    if (!doc) return <div>?</div>;

    let displayValue = Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",").replace(/\,/g, "K").replace(/\./g, ",").replace(/\K/g, ".");
    
    return (
        <div>
            <span>{displayValue}</span>
            <span style={{fontSize:12, marginLeft:8}}>€</span>
        </div>
    );
}