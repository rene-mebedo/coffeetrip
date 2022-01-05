import React, { Fragment, useEffect, useMemo, useState } from 'react';

import Collapse from 'antd/lib/collapse';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Divider from 'antd/lib/divider';
import Spin from 'antd/lib/spin';
import List from 'antd/lib/list';
import Skeleton from 'antd/lib/skeleton';
import Table from 'antd/lib/table';
import Image from 'antd/lib/image';
import Button from 'antd/lib/button';
import Menu from 'antd/lib/menu';
import Dropdown from 'antd/lib/dropdown';
import Tag from 'antd/lib/tag';
import Select from 'antd/lib/select';

import Space from 'antd/lib/space';
import message from 'antd/lib/message';

import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';

import { withTracker } from 'meteor/react-meteor-data';

import moment from 'moment';
import localization from 'moment/locale/de';

const { Panel } = Collapse;
const { Option } = Select;

import { EnumControltypes } from '/imports/api/consts';

import { debounce, deepClone, isArray } from '/imports/api/lib/basics';

import { getAppStore } from '/imports/api/lib/core';
import { check } from 'meteor/check';

import { useOnce, useWhenChanged } from '/imports/api/lib/react-hooks';
import { GoogleMap } from './layout-controls/gogle-maps';
import { SingleModuleOption } from './layout-controls/app-link';
import { GenericInputWrapper } from './layout-controls/generic-input-wrapper';
import { StringInput, TextInput } from './layout-controls/string-input';
import { HtmlInput } from './layout-controls/html-input';
import { DateInput, DatespanInput, YearInput } from './layout-controls/date-input';
import { OptionInput } from './layout-controls/option-input';
import { Collapsible } from './layout-controls/collapsible';
import { DividerControl } from './layout-controls/divider';

import { IGetReportResult } from '/imports/api/types/app-types';
import { ReportControl } from './layout-controls/report';
import { NumberInput } from './layout-controls/number-input';



export const getLabel = (elem, fields) => {
    if (elem.noTitle) return '';

    if (elem.title) return elem.title;

    return fields[elem.field].title;
}

export const LayoutElements = ({ elements, app, defaults, document, mode, onValuesChange }) => {
    return elements.map( (elem, index) => { 
        const key = elem.field || index;

        if (elem.controlType === EnumControltypes.ctStringInput ) return <StringInput key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctTextInput ) return <TextInput key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctNumberInput ) return <NumberInput key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctHtmlInput ) return <HtmlInput key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctOptionInput ) return <OptionInput key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctDateInput ) return <DateInput key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctDatespanInput ) return <DatespanInput key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctYearInput ) return <YearInput key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />

        if (elem.controlType === EnumControltypes.ctCollapsible ) return <Collapsible key={key} elem={elem} app={app} mode={mode} defaults={defaults} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctDivider ) return <DividerControl key={key} elem={elem} app={app} mode={mode} defaults={defaults} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctInlineCombination ) return <InlineCombination key={key} elem={elem} app={app} defaults={defaults} mode={mode} onValuesChange={onValuesChange} />

        if (elem.controlType === EnumControltypes.ctSingleModuleOption ) return <SingleModuleOption key={key} elem={elem} app={app} mode={mode} defaults={defaults} onValuesChange={onValuesChange} />

        if (elem.controlType === EnumControltypes.ctReport ) return <ReportControl key={key} environment='Document' reportId={elem.reportId} title={elem.title} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctColumns ) return <ColumnsLayout key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
        if (elem.controlType === EnumControltypes.ctGoogleMap ) return <GoogleMap key={key} elem={elem} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />

        return null;
    });
}

export const ColumnsLayout = ({ elem, app, mode, defaults, record, onValuesChange }) => {
    const { columns } = elem;

    return (
        <Row gutter={8}>
            { 
                columns.map( (col, colIndex) => {
                    const { columnDetails } = col;
                    return (
                        <Col key={colIndex} { ...columnDetails } >
                            <LayoutElements elements={col.elements} app={app} mode={mode} document={document} onValuesChange={onValuesChange} />
                        </Col>
                    );
                })
            }
        </Row>
    )
}

const InlineCombination = ({ elem, app, mode, defaults, record, onValuesChange }) => {
    return (
        <Row className="ant-form-item" style={{ display: 'flex', flexFlow:'row wrap' }}>
            <Col span={6} className="ant-form-item-label">
                <label>{getLabel(elem, app.fields)}</label>
            </Col>
            <Col className="ant-form-item-control" style={{ display: 'flex', flexFlow:'row wrap' }}>
                <LayoutElements elements={elem.elements} app={app} mode={mode} defauls={defaults} document={document} onValuesChange={onValuesChange} />
            </Col>
        </Row>
    )
}

export const AppLayout = ({ product, app, defaults, document, layoutName = 'default', mode, onValuesChange }) => {
    // aktuell wird nur das default-layout unterstützt
    const layout = app.layouts && (app.layouts[layoutName] || app.layouts.default);
    
    return (
        <LayoutElements elements={layout.elements} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
    )
}