/*jshint sub:true*/


/**
 * 
 * The **GraphicalEditor** is responsible for layout and dialog handling.
 * 
 * @author Andreas Herz
 */

var Files = Class.extend(
{

    /**
     * @constructor
     * 
     * @param {String} canvasId the id of the DOM element to use as paint container
     */
    init : function(app)
    {
        this.render();
    },

    render: function()
    {
        $.ajax({
            url:conf.backend.file.list ,
            xhrFields: {
                withCredentials: true
            },
            success:function(response) {
                var files = response.files;
                // sort the result
                // Directories are always on top
                //
                files.sort(function (a, b) {
                    if (a.type === b.type) {
                        if (a.id.toLowerCase() < b.id.toLowerCase())
                            return -1;
                        if (a.id.toLowerCase() > b.id.toLowerCase())
                            return 1;
                        return 0;
                    }
                    return 1;
                });

                var compiled = Hogan.compile(
                    '{{#files}}' +
                    '<div class="col-lg-3 col-md-4 col-xs-6 thumb">'+
                    '  <span class="ion-ios-close-outline deleteIcon"  data-toggle="confirmation"  data-id="{{id}}"></span>'+
                    '  <a class="thumbnail" data-id="{{id}}">'+
                    '    <img class="img-responsive" src="/backend/file/image?id={{id}}" alt="">'+
                    '    <h4>{{name}}</h4>'+
                    '  </a>'+
                    '</div>'+
                    '{{/files}}'
                );


                var output = compiled.render({
                    files: files
                });
                $("#files .container > .row").html($(output));

                $("#files .container .deleteIcon").on("click", function(){
                    var $el = $(this);
                    var name =  $el.data("id");
                    app.fileDelete(name,function(){
                        var parent = $el.parent();
                        parent.hide('slow', function(){ parent.remove(); });
                    });
                });

                $("[data-toggle='confirmation']").popConfirm({
                    title: "Delete File?",
                    content: "",
                    placement: "bottom" // (top, right, bottom, left)
                });



                $("#files .container .thumbnail").on("click", function(){
                    var $el = $(this);
                    var name =  $el.data("id");
                    app.fileOpen(name);
                });

            }
        });
    }
});
