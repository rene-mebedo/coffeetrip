import React, { Fragment } from 'react';

import { EnumControltypes, EnumDocumentModes } from '/imports/api/consts';
import { GoogleMap } from './layout-controls/gogle-maps';
import { SingleModuleOption } from './layout-controls/app-link';
import { StringInput, TextInput } from './layout-controls/string-input';
import { HtmlInput } from './layout-controls/html-input';
import { DateInput, DatespanInput, YearInput } from './layout-controls/date-input';
import { OptionInput } from './layout-controls/option-input';
import { Collapsible } from './layout-controls/collapsible';
import { DividerControl } from './layout-controls/divider';

import { IApp, IAppLayoutElementReport, TAppFields, TAppLayoutElement } from '/imports/api/types/app-types';
import { ReportControl } from './layout-controls/report';
import { CurrencyInput, NumberInput } from './layout-controls/number-input';
import { WidgetSimple } from './layout-controls/widget-simple';
import { Columns } from './layout-controls/columns';
import { InlineCombination, Spacer } from './layout-controls/inline-combination';
import { IMethodOnValuesChange } from './layout-controls/generic-control-wrapper';
import { IGenericDocument } from '/imports/api/lib/core';
import { IWorldUser } from '/imports/api/types/world';

export const getLabel = (elem: TAppLayoutElement<any>, fields: TAppFields<any>): string => {
    if (elem.noTitle) return '';

    if (elem.title) return elem.title;

    return fields[elem.field as string].title || '';
}

export interface IAppLayoutElementProps {
    elements: Array<TAppLayoutElement<any>>,
    app: IApp<any>,
    mode: EnumDocumentModes,
    defaults: IGenericDocument,
    document: IGenericDocument,
    children?: JSX.Element,
    onValuesChange: IMethodOnValuesChange
    currentUser: IWorldUser
}

export const LayoutElements = (props:IAppLayoutElementProps): JSX.Element => {
    const { elements } = props;

    return <Fragment>
            {elements.map( (elem: TAppLayoutElement<any>, index: number) => { 
                const key: string = (elem.field as string) || (index+'');

                if (elem.controlType === EnumControltypes.ctStringInput ) return <StringInput {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctTextInput ) return <TextInput {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctNumberInput ) return <NumberInput {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctCurrencyInput ) return <CurrencyInput {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctHtmlInput ) return <HtmlInput {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctOptionInput ) return <OptionInput {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctDateInput ) return <DateInput {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctDatespanInput ) return <DatespanInput {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctYearInput ) return <YearInput {...props} key={key} elem={elem} />

                if (elem.controlType === EnumControltypes.ctCollapsible ) return <Collapsible {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctDivider ) return <DividerControl {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctInlineCombination ) return <InlineCombination {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctSpacer ) return <Spacer {...props} key={key} elem={elem} />

                if (elem.controlType === EnumControltypes.ctSingleModuleOption ) return <SingleModuleOption {...props} key={key} elem={elem} />

                if (elem.controlType === EnumControltypes.ctReport ) return <ReportControl {...props} key={key} elem={elem} environment='Document' reportId={(elem as IAppLayoutElementReport<any>).reportId} title={elem.title} />
                if (elem.controlType === EnumControltypes.ctColumns ) return <Columns {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctGoogleMap ) return <GoogleMap {...props} key={key} elem={elem} />
                if (elem.controlType === EnumControltypes.ctWidgetSimple ) return <WidgetSimple {...props} key={key} elem={elem} />

                return <div key={key}>Unknown Element controlType: {elem.controlType}</div>;
            })
        }
    </Fragment>;
}

export interface IAppLayoutProps {    
    app: IApp<any>,
    mode: EnumDocumentModes,
    defaults: IGenericDocument,
    document: IGenericDocument,
    onValuesChange: IMethodOnValuesChange
    currentUser: IWorldUser
}

export const AppLayout = ({ app, defaults, document, /*layoutName = 'default',*/ mode, onValuesChange, currentUser }:IAppLayoutProps) => {
    const layoutName = 'default';
    // TODO: Unterstützung anderer Layouttypen
    // aktuell wird nur das default-layout unterstützt
    const layout = app.layouts && (app.layouts[layoutName] || app.layouts.default);
    
    return (
        <LayoutElements elements={layout.elements} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} currentUser={currentUser} />
    )
}