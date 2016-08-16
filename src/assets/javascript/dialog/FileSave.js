var FileSave = Class.extend({

    /**
     * @constructor
     *
     */
    init:function(fileHandler){
        this.currentFileHandle = fileHandler;
    },

    /**
     * @method
     *
     * Open the file picker and load the selected file.<br>
     *
     * @param {Function} successCallback callback method if the user select a file and the content is loaded
     * @param {Function} errorCallback method to call if any error happens
     *
     * @since 4.0.0
     */
    show: function(canvas, successCallback)
    {
        var _this = this;

        $("#githubSaveFileDialog .githubFileName").val(_this.currentFileHandle.title);

        $('#githubSaveFileDialog').on('shown.bs.modal', function () {
            $(this).find('input:first').focus();
        });
        $("#githubSaveFileDialog").modal("show");

        // Button: Commit to GitHub
        //
        $("#githubSaveFileDialog .okButton").on("click", function () {

            canvas.setCurrentSelection(null);
            new draw2d.io.png.Writer().marshal(canvas, function (imageDataUrl){
                var writer = new draw2d.io.json.Writer();
                writer.marshal(canvas, function (json, base64) {
                    var name = $("#githubSaveFileDialog .githubFileName").val();
                    $.ajax({
                            url: conf.backend.file.save,
                            method: "POST",
                            xhrFields: {
                                withCredentials: true
                            },
                            data:{
                                id:name,
                                content:JSON.stringify({draw2d:json, image:imageDataUrl}, undefined, 2)
                            }
                        }
                    ).done(function(){
                        _this.currentFileHandle.title=name;
                        $('#githubSaveFileDialog').modal('hide');
                        successCallback();
                    });

                });
            }, canvas.getBoundingBox().scale(10, 10));
        });

    }

});