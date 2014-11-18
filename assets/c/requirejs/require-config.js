requirejs.config({
    baseUrl : '../../js',
    map : {
        '*' : {
            'css' : 'requirejs/css'
        }
    },
    paths : {
        //'jQuery' : 'sib/core/1.0/jQuery+',
        /** jquery and jquery plugin **/
        '$'      : 'sib/core/1.0/jQuery+',
        'jQuery' : 'sib/core/1.0/jQuery+',
        'jQuery.validate' : 'sib/core/1.0/jquery/jquery.validate',
        'jQuery.blockUI' : 'sib/core/1.0/jquery/jquery.blockUI',
        
        /** other base **/
        'json' : 'sib/core/1.0/json2',
        
        /** sib base **/
        'Sib'    : 'sib/core/1.0/Sib',
        'Widget' : 'sib/core/1.0/Widget',
        'Class'  : 'sib/core/1.0/Class',

        /** sib widget **/
        'Autocomplete' : 'sib/autocomplete/1.0/Autocomplete',
        'Calendar'     : 'sib/calendar/1.0/Calendar',
        'LineChart'    : 'sib/charts/1.0/linechart/LineChart',
        'Choose'       : 'sib/choose/1.0/Choose',
        'ComboBox'     : 'sib/combo/1.0/ComboBox',
        'DataGrid'     : 'sib/datagrid/1.0/DataGrid',
        'Dialog'       : 'sib/dialog/1.0/Dialog',
        'Layout'       : 'sib/layout/1.0/Layout',
        'Menu'         : 'sib/menu/1.0/Menu',
        'PageNavigator': 'sib/pagenavigator/1.0/PageNavigator',
        'Pagination'   : 'sib/pagination/1.0/Pagination',
        'Pin'          : 'sib/pin/1.0/Pin',
        'Placeholder'  : 'sib/placeholder/1.0/Placeholder',
        'Popup'        : 'sib/popup/1.0/Popup',
        'ProgressBar'  : 'sib/progressbar/1.0/ProgressBar',
        'Slide'        : 'sib/slide/1.0/Slide',
        'StepBar'      : 'sib/stepbar/1.0/StepBar',
        'Tabs'         : 'sib/tabs/1.0/Tabs',
        'Tip'          : 'sib/tip/1.0/Tip'
    }
});