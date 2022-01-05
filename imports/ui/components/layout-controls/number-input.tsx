import React from 'react';

import InputNumber from 'antd/lib/input-number';

import { GenericInputWrapper, IGenericControlProps } from "./generic-input-wrapper";


export const NumberInput = (props: IGenericControlProps) => {
    return (
        <GenericInputWrapper {...props} >
            <InputNumber />
        </GenericInputWrapper>
    );
}