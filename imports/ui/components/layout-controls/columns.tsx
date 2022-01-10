import React from 'react';

import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import { IGenericControlProps } from "./generic-input-wrapper";
import { IAppLayoutElementColumns } from '/imports/api/types/app-types';
import { LayoutElements } from '../app-layout';

export const Columns = ({ elem, app, mode, defaults, document, onValuesChange, currentUser }: IGenericControlProps) => {
    const { columns } = elem as IAppLayoutElementColumns<any>;

    return (
        <Row gutter={[16,16]} style={{marginBottom:16}}>
            { 
                columns.map( (col, colIndex) => {
                    const { columnDetails } = col;
                    return (
                        <Col key={colIndex} { ...columnDetails } >
                            <LayoutElements elements={col.elements} app={app} mode={mode} defaults={defaults} document={document} onValuesChange={onValuesChange} currentUser={currentUser} />
                        </Col>
                    );
                })
            }
        </Row>
    );
}