import React from 'react';

import Input from 'antd/lib/input';

import { GenericInputWrapper, IGenericControlProps } from "./generic-input-wrapper";


export const StringInput = (props: IGenericControlProps) => {
    return (
        <GenericInputWrapper {...props} >
            <Input  />
        </GenericInputWrapper>
    );
}

export const TextInput = (props: IGenericControlProps) => {
    return (
        <GenericInputWrapper {...props} >
            <Input.TextArea rows={4} />
        </GenericInputWrapper>
    );
}