import React from 'react';

import { GenericInputWrapper, IGenericControlProps } from "./generic-input-wrapper";
import { Summernote } from '../Summernote';

export const HtmlInput = (props: IGenericControlProps) => {
    const options = { 
        //airMode: true, 
        popover: {
            image: [
                ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
                ['float', ['floatLeft', 'floatRight', 'floatNone']],
                ['remove', ['removeMedia']]
            ],
            link: [
                ['link', ['linkDialogShow', 'unlink']]
            ],
            table: [
                ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
                ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
            ],
            air: [
                ['font', ['bold', 'underline', 'italic', 'superscript']],
                ['font1', ['clear']],
                ['color', ['forecolor', 'backcolor']],
                ['para', ['ul', 'ol']],
                ['para1', ['paragraph']],
                ['table', ['table']],
                ['link', ['linkDialogShow', 'unlink']],
                ['view', ['fullscreen', 'codeview']]
            ]
        }  
    };
    
    return (
        <GenericInputWrapper {...props} >
            <Summernote options={options} />
        </GenericInputWrapper>
    )
}