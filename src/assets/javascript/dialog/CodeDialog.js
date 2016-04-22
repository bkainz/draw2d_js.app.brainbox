var CodeDialog = Class.extend(
    {

        init:function(){
        },

        show:function(js){
            $('#codePreviewDialog .prettyprint').text(js);
            $('#codePreviewDialog .prettyprint').removeClass("prettyprinted");
            prettyPrint();
            $('#codePreviewDialog').modal('show');
        }
});