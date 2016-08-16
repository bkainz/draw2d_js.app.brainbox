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
        this.app = app;
        this.render();
    },

    render: function()
    {
        var _this = this;
        if(this.app.loggedIn!==true){
            return;
        }

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
                    '    <img class="img-responsive" src="'+conf.backend.file.image+'?id={{id}}" data-id="{{id}}">'+
                    '    <h4 data-name="{{name}}">{{name}}</h4>'+
                    '  </a>'+
                    '</div>'+
                    '{{/files}}'
                );


                var output = compiled.render({
                    files: files
                });

                $("#files .container > .row").html(
                '<div class="col-lg-3 col-md-4 col-xs-6 thumbAdd">'+
                '    <div class="img-responsive ion-ios-plus-outline"></div>'+
                '    <h4>New File</h4>'+
                '</div>');

                $("#files .container > .row").append($(output));

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


                $("#files .container .thumbnail h4").on("click", function() {
                    var $el = $(this);
                    var name = $el.data("name");
                    var $replaceWith = $('<input type="input" class="filenameInplaceEdit" value="' + name + '" />');
                    $el.hide();
                    $el.after($replaceWith);
                    $replaceWith.focus();

                    var fire = function () {
                        var newName = $replaceWith.val();
                        if (newName !== "") {
                            // get the value and post them here
                            $.ajax({
                                    url: conf.backend.file.rename,
                                    method: "POST",
                                    xhrFields: { withCredentials: true},
                                    data:{
                                        from:name+conf.fileSuffix,
                                        to:newName+conf.fileSuffix
                                    }
                                }
                            ).done(function(){
                                $replaceWith.remove();
                                $el.html(newName);
                                $el.show();
                                $el.data("name", newName);
                                $(".thumb [data-id='"+name+conf.fileSuffix+"']").data("id",newName+conf.fileSuffix);
                            });

                        }
                        else {
                            // get the value and post them here
                            $replaceWith.remove();
                            $el.show();
                        }
                    };
                    $replaceWith.blur(fire);
                    $replaceWith.keypress(function (e) {
                        if (e.which === 13) {
                            fire();
                        }
                    });
                });

                $("#files .container .thumbnail img").on("click", function(){
                    var $el = $(this);
                    var name =  $el.data("id");
                    app.fileOpen(name);
                });

                $("#files .thumbAdd").on("click", function(){
                    new FileNew(_this.app).show();
                });
            }
        });
    }
});
