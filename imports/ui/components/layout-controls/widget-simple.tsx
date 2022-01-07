import React from 'react';

import Card from 'antd/lib/card';
import Statistic from 'antd/lib/statistic';

import { IGenericControlProps } from "./generic-input-wrapper";
import { IAppLayoutElementWidgetSimple } from '/imports/api/types/app-types';
import { EnumDocumentModes } from '/imports/api/consts';
import { isNumeric } from '/imports/api/lib/basics';


export const WidgetSimple = (props: IGenericControlProps) => {
    const elem: IAppLayoutElementWidgetSimple<any> = props.elem as IAppLayoutElementWidgetSimple<any>;
    const color = elem.color || '#666',
          borderColor = elem.color || '#eee',
          backgroundColor = elem.backgroundColor || '#fff'

    const {mode, document, defaults} = props;

    const doc = mode == EnumDocumentModes.NEW ? defaults : document;
    const value = (doc || {})[elem.field];
    let displayValue: string = '';

    if (isNumeric(value)) {
        // "0" wird auch als false interpretiert
        displayValue = value + '';
    } else {
        displayValue = value || '?';
    }

    return (        
        <div onClick={undefined} style={{color: color, cursor: null ? 'pointer':'default'}} >
            <Card style={{borderColor, color, backgroundColor}}
                //hoverable
                actions={undefined}
            >
                <Card.Meta 
                    style={{borderColor}}
                    //avatar={}
                    title={<span style={{color}}>{elem.title}</span>}
                />
                <Statistic
                    value={displayValue}
                    prefix={<i style={{marginRight:16}} className={elem.icon} />}
                    valueStyle={{ color }}
                />
            </Card>
        </div>
    );
}

