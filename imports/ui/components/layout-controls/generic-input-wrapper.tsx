import React, { useState, useMemo } from 'react';

import moment from 'moment';

import Form from 'antd/lib/form';

import { IGenericDocument } from '/imports/api/lib/core';
import { EnumDocumentModes } from '/imports/api/consts';
import { useWhenChanged } from '/imports/api/lib/react-hooks';
import { getLabel } from '../app-layout';
import { IApp, TAppLayoutElement } from '/imports/api/types/app-types';
import { IWorldUser } from '/imports/api/types/world';

export type IMethodOnValuesChange = (
    callback: (
        changedValues: IGenericDocument,
        allValues: IGenericDocument,
        setValue: (fieldName: string, newValue: any) => void
    ) => void
) => void;

export interface IGenericControlProps {
    elem: TAppLayoutElement<any>,
    app: IApp<any>,
    mode: EnumDocumentModes,
    defaults: IGenericDocument,
    document: IGenericDocument,
    children?: JSX.Element,
    onValuesChange: IMethodOnValuesChange;
    currentUser: IWorldUser
}

export const GenericInputWrapper = (props: IGenericControlProps) : JSX.Element => {
    const { elem, app, mode, onValuesChange, defaults, document, children } = props;
    const { fields } = app;
    const { field, enabled } = elem;
    let { rules, autoValue } = fields[field as string];
    const [disabled, setDisabled] = useState(mode === EnumDocumentModes.SHOW);
    const isEnabled = useMemo( () => (enabled ? eval(enabled as unknown as string) : () => true), [enabled] );


    useWhenChanged(mode, (_oldMode: any) => {
        if (mode == EnumDocumentModes.EDIT) {
            // initialer Aufruf, wenn man aus dem SHOW in den EDIT-mode geht
            const d = !isEnabled({ allValues: document, mode, moment });
            if (d != disabled) setDisabled(d);
        } else if ( mode == 'SHOW' ) {
            if (!disabled) setDisabled(true);
        } else {
            // NEW
            const d = !isEnabled({ allValues: defaults, mode, moment });
            if (d != disabled) setDisabled(d);
        }
    });

    if (rules && rules.length) {
        rules = rules.map((r: any) => {
            if (r.customValidator) {
                return eval(r.customValidator);
            }
            return r;
        });
    }
    
    if (autoValue) {
        const recomputeValue = eval(autoValue as unknown as string);

        onValuesChange( (changedValues, allValues, setValue) => {
            const newValue = recomputeValue({changedValues, allValues, moment, injectables: app.injectables});
            if (allValues[field as string] !== newValue) {
                setValue(field as string, newValue);
            }
        });
    }

    if (enabled && mode !== EnumDocumentModes.SHOW) {
        // immer dann aufrufen, wenn sich Werte geändert haben
        onValuesChange( (changedValues, allValues) => {            
            const d = !isEnabled({changedValues, allValues, mode, moment});
            if (d != disabled) setDisabled(d);
        });
    }

    return (
        <Form.Item 
            label={getLabel(elem, app.fields)}
            name={field}
            rules={rules}
        >
            { 
                children ? React.cloneElement(children, { className: mode, disabled }) : null
            }
        </Form.Item>
    );
}