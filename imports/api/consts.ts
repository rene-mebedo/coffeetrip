export enum EnumMethodResult {
    STATUS_OKAY = '200',
    STATUS_NOT_LOGGED_IN = '403',
    STATUS_NOT_FOUND = '404',
    STATUS_SERVER_EXCEPTION = '500',

    STATUS_ABORT = 'abort',
    STATUS_LOADING = 'loading',
}

export enum EnumFieldTypes {
    ftString = 'String',
    ftAppLink = 'AppLink',
    ftDate = 'Date',
    ftDatespan = 'Datespan',
    ftYear = 'Year',
    ftInteger = 'Integer',
    ftBoolean = 'Boolean'
}

export enum EnumControltypes {
    ctCollapsible = 'Collapsible',
    ctStringInput = 'String',
    ctTextInput = 'Text',
    ctNumberInput = 'Number',
    ctHtmlInput = 'Html',
    ctDateInput = 'Date',
    ctDatespanInput = 'Datespan',
    ctYearInput = 'Year',
    ctInlineCombination = 'InlineCombination',
    ctOptionInput = 'Option',
    ctDivider = 'Divider',
    ctSingleModuleOption = 'SingleModuleOption',
    ctReport = 'Report',
    ctColumns = 'Columns',
    ctGoogleMap = 'GoogleMap',
}

export enum EnumDocumentModes {
    NEW = 'NEW',
    EDIT = 'EDIT',
    SHOW = 'SHOW'
}