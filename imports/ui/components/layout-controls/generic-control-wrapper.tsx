import React, { useState, useMemo } from 'react';

import moment from 'moment';

import Form from 'antd/lib/form';

import { IGenericDocument } from '/imports/api/lib/core';
import { EnumDocumentModes } from '/imports/api/consts';
import { useOnce, useWhenChanged } from '/imports/api/lib/react-hooks';
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
    elem: TAppLayoutElement<any>
    app: IApp<any>
    mode: EnumDocumentModes
    defaults: IGenericDocument
    document: IGenericDocument
    children?: JSX.Element
    onValuesChange: IMethodOnValuesChange
    currentUser: IWorldUser
    /**
     * optionaler Parameter, der Steuert ob ein <Form.Item> im Falle von True
     * erzeugt wird, oder nur ein einfaches DIV-Element,
     * da es sich nicht um eine Eingabe-Komponente handelt
     * sondern nur um eine Darstellung von Informationen
     */
    withoutInput?: boolean

    /**
     * Klassenname des eigentlichen, generischen Inhalts
     * der Angezeigt werden soll z.B. "mbac-text-input"
     * So können im nachfolgenden die einzelnen Darstellungsformen
     * gesamt oder auch unabhängig von einander gestyled werden
     */
    className?: string
}

export const GenericControlWrapper = (props: IGenericControlProps) : JSX.Element => {
    const { elem, app, mode, onValuesChange, defaults, document, children, withoutInput = false, className } = props;
    const { fields } = app || { fields: null };
    const { field, enabled, visible } = elem || {field:null, enabled:null, visible:null};

    let { rules, autoValue } = (field && fields) ? fields[field as string] : { rules: undefined, autoValue: null };

    const [disabled, setDisabled] = useState(mode === EnumDocumentModes.SHOW);
    const [hide, setHide] = useState(false);

    const isEnabled = useMemo( () => (enabled ? eval(enabled as unknown as string) : () => true), [enabled] );
    const isVisible = useMemo( () => (visible ? eval(visible as unknown as string) : () => true), [visible] );


    useWhenChanged(mode, (_oldMode: any) => {
        if (mode == EnumDocumentModes.EDIT) {
            // initialer Aufruf, wenn man aus dem SHOW in den EDIT-mode geht
            const d = !isEnabled({ allValues: document, mode}, { moment });
            if (d != disabled) setDisabled(d);
            const h = !isVisible({ fieldName: field, allValues: document, mode}, {moment});
            if (h != hide) {
                //console.log('SET on useWhenChanged EDIT', field, h)
                setHide(h);
            }

        } else if ( mode == 'SHOW' ) {
            if (!disabled) setDisabled(true);

            const h = !isVisible({ fieldName: field, allValues: document, mode}, {moment});
            if (h != hide) {
                //console.log('SET on useWhenChanged SHOW', field, h)
                setHide(h);
            }
        } else {
            // NEW
            const d = !isEnabled({ allValues: defaults, mode}, { moment });
            if (d != disabled) setDisabled(d);
            const h = !isVisible({ fieldName: field, allValues: defaults, mode}, { moment });
            if (h != hide) {
                //console.log('SET on useWhenChanged NEW', field, h)
                setHide(h);
            }
        }
    });

    useOnce( () => {
        const h = !isVisible({ fieldName: field, allValues: (mode == EnumDocumentModes.NEW ? defaults: document), mode}, {moment});
        if (h != hide) {
            //console.log('SET on useOnce', field, h)
            setHide(h);
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
            const d = !isEnabled({changedValues, allValues, mode}, { moment });
            if (d != disabled) setDisabled(d);
        });
    }

    if (visible) {
        // immer dann aufrufen, wenn sich Werte geändert haben
        onValuesChange( (changedValues, allValues) => {            
            const h = !isVisible({fieldName: field, changedValues, allValues, mode}, {moment});
            if (h != hide) {
                //console.log('SET on onValuesChange', field, h, changedValues, allValues)
                setHide(h);
            }
        });
    }

    let cln = 'mbac-layout-element' + (className ? ' ' + className : '');
    if (hide) {
        cln += ' mbac-hidden'
    }

    if (disabled) {
        cln += ' mbac-disabled'
    }

    // mode für SHOW, EDIT, NEW etc anfügen um auch hier eine abhängigkeit zu schaffen
    cln += ' mbac-mode-' + mode.toLowerCase();

    if (withoutInput) {
        return (
            <div className={cln} style={hide ? {display: 'none'} : undefined}>        
                { children ? React.cloneElement(children, { className: mode, disabled }) : null }
            </div>
        )
    }

    return (
        <Form.Item 
            className={cln}
            label={getLabel(elem, app.fields)}
            name={field as string}
            rules={hide || disabled ? undefined : rules}
            style={hide ? {display: 'none'} : undefined}
        >
            { children ? React.cloneElement(children, { className: mode, disabled }) : null }
        </Form.Item>
    );
}