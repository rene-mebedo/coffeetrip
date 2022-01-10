import React from 'react';

import Divider from 'antd/lib/divider';

import { IGenericControlProps } from "./generic-input-wrapper";
import { IAppLayoutElementDivider } from '/imports/api/types/app-types';


export const DividerControl = (props: IGenericControlProps) => {
    const elem: IAppLayoutElementDivider<any> = props.elem as IAppLayoutElementDivider<any>;

    return (
        <Divider orientation={elem.orientation || 'left'} >{elem.title}</Divider>
    );
}

