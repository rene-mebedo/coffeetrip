import React from 'react';

import DatePicker from 'antd/lib/date-picker';

import { GenericInputWrapper, IGenericControlProps } from "./generic-input-wrapper";

export const DateInput = (props: IGenericControlProps) => {   
    return (
        <GenericInputWrapper {...props} >
            <DatePicker format='DD.MM.YYYY' />
        </GenericInputWrapper>
    );
}

export const DatespanInput = (props: IGenericControlProps) => {
    return (
        <GenericInputWrapper {...props} >
            <DatePicker.RangePicker format='DD.MM.YYYY'  />
        </GenericInputWrapper>
    );
}

export const YearInput = (props: IGenericControlProps) => {   
    return (
        <GenericInputWrapper {...props} >
            <DatePicker picker="year" />
        </GenericInputWrapper>
    );
}