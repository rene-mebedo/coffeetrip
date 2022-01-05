import React from 'react';

import Radio from 'antd/lib/radio';
import Space from 'antd/lib/space';

import { GenericInputWrapper, IGenericControlProps } from "./generic-input-wrapper";
import { IAppLayoutElementOptionInput, IOptionInputValue } from '/imports/api/types/app-types';
import { EnumDocumentModes } from '/imports/api/consts';

// https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
declare module 'csstype' {
    interface Properties {
        // Add a CSS Custom Property
        '--radio-color'?: string | number;
        '--radio-bgcolor'?: string | number;
    }
}

export const OptionInput = (props: IGenericControlProps) => {
    const { mode } = props;
    const elem: IAppLayoutElementOptionInput = props.elem as IAppLayoutElementOptionInput;

    return (
        <GenericInputWrapper {...props} >
            <Radio.Group buttonStyle="outline" disabled={mode === EnumDocumentModes.SHOW}>
                <Space direction={elem.direction || 'horizontal'}>
                    { 
                        elem.values.map( (v: IOptionInputValue) => {
                            const c: string | number = v.color || '#fff';
                            const bc: string | number = v.backgroundColor || '#999';

                            return <Radio.Button style={{['--radio-color']:c, ['--radio-bgcolor']:bc}} key={v._id} value={v._id} >{v.title}</Radio.Button>
                        })
                    }
                </Space>
            </Radio.Group>
        </GenericInputWrapper>
    )
}

