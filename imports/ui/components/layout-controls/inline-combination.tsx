import React from 'react';

import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import { IGenericControlProps } from "./generic-input-wrapper";
import { IAppLayoutElementInlineCombination } from '/imports/api/types/app-types';
import { getLabel, LayoutElements } from '../app-layout';

export const InlineCombination = ({ elem, app, mode, defaults, document, onValuesChange, currentUser }: IGenericControlProps) => {
    const elements = (elem as IAppLayoutElementInlineCombination<any>).elements;

    return (
        <Row className="ant-form-item" style={{ display: 'flex', flexFlow:'row wrap' }}>
            <Col span={6} className="ant-form-item-label">
                <label>{getLabel(elem, app.fields)}</label>
            </Col>
            <Col className="ant-form-item-control" style={{ display: 'flex', flexFlow:'row wrap' }}>
                <LayoutElements currentUser={currentUser} elements={elements} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} />
            </Col>
        </Row>
    );
}