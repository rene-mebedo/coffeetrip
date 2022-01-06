import React from 'react';

import Card from 'antd/lib/card';
import Statistic from 'antd/lib/statistic';

import { IGenericControlProps } from "./generic-input-wrapper";
import { IAppLayoutElementWidgetSimple } from '/imports/api/types/app-types';
import { EnumDocumentModes } from '/imports/api/consts';


export const WidgetSimple = (props: IGenericControlProps) => {
    const elem: IAppLayoutElementWidgetSimple<any> = props.elem as IAppLayoutElementWidgetSimple<any>;
    const color = elem.color || '#666',
          borderColor = elem.color || '#eee',
          backgroundColor = elem.backgroundColor || '#fff'

    const {mode, document, defaults} = props;

    const doc = mode == EnumDocumentModes.NEW ? defaults : document;
    const value = doc[elem.field] || '?';
    console.log(props.document);

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
                    value={value}
                    prefix={<i style={{marginRight:16}} className={elem.icon} />}
                    valueStyle={{ color }}
                />
            </Card>
        </div>
    );
}

