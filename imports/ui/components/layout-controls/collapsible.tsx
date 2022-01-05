import React from 'react';

import Collapse from 'antd/lib/collapse';

import { IGenericControlProps } from "./generic-input-wrapper";
import { IAppLayoutElementCollapsible } from '/imports/api/types/app-types';
import { getLabel, LayoutElements } from '../app-layout';


export const Collapsible = (props: IGenericControlProps) => {
    const {  app, mode, defaults, document, onValuesChange } = props;
    const elem: IAppLayoutElementCollapsible = props.elem as IAppLayoutElementCollapsible;

    return (
        <Collapse defaultActiveKey={elem.collapsedByDefault ? ['1'] : undefined}
            style={{marginBottom:16}}
        >
            <Collapse.Panel header={getLabel(elem, app.fields)} key="1">
                <LayoutElements elements={elem.elements} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
            </Collapse.Panel>
        </Collapse>
    );
}
