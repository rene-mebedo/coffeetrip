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

import { AppData, IApp, IAppLayoutElementReport, TAppFields, TAppLayoutElement } from '/imports/api/types/app-types';
import { ReportControl } from './layout-controls/report';
import { NumberInput } from './layout-controls/number-input';
import { WidgetSimple } from './layout-controls/widget-simple';
import { Columns } from './layout-controls/columns';
import { InlineCombination } from './layout-controls/inline-combination';
import { IMethodOnValuesChange } from './layout-controls/generic-input-wrapper';
import { IGenericDocument } from '/imports/api/lib/core';
import { IWorldUser } from '/imports/api/types/world';

export const getLabel = (elem: TAppLayoutElement<any>, fields: TAppFields<any>): string => {
    if (elem.noTitle) return '';

    if (elem.title) return elem.title;

    return fields[elem.field].title || '';
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

export const LayoutElements = ({ elements, app, defaults, document, mode, onValuesChange, currentUser }:IAppLayoutElementProps): JSX.Element => {

    return <Fragment>
            {elements.map( (elem: TAppLayoutElement<any>, index: number) => { 
                const key = elem.field || index;

                if (elem.controlType === EnumControltypes.ctStringInput ) return <StringInput currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctTextInput ) return <TextInput currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctNumberInput ) return <NumberInput currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctHtmlInput ) return <HtmlInput currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctOptionInput ) return <OptionInput currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctDateInput ) return <DateInput currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctDatespanInput ) return <DatespanInput currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctYearInput ) return <YearInput currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />

                if (elem.controlType === EnumControltypes.ctCollapsible ) return <Collapsible currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctDivider ) return <DividerControl currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctInlineCombination ) return <InlineCombination currentUser={currentUser} key={key} elem={elem} app={app} defaults={defaults} document={document} mode={mode} onValuesChange={onValuesChange} />

                if (elem.controlType === EnumControltypes.ctSingleModuleOption ) return <SingleModuleOption currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />

                if (elem.controlType === EnumControltypes.ctReport ) return <ReportControl currentUser={currentUser} key={key} environment='Document' reportId={(elem as IAppLayoutElementReport<any>).reportId} title={elem.title} mode={mode} defaults={defaults as unknown as AppData<any>} document={document as unknown as AppData<any>} />
                if (elem.controlType === EnumControltypes.ctColumns ) return <Columns currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctGoogleMap ) return <GoogleMap key={key} elem={elem} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
                if (elem.controlType === EnumControltypes.ctWidgetSimple ) return <WidgetSimple currentUser={currentUser} key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />

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