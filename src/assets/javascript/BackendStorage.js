BackendStorage = Class.extend({

    /**
     * @constructor
     * 
     */
    init:function(){
        this.octo=null;
        this.repositories = null;
        this.currentRepository = null;
        this.currentPath = "";
        this.currentFileHandle = null;
    },
    

    connect: function(token, callback)
    {
        this.octo = new Octokat({
            token: token
        });

        this.octo.user.fetch(function(param0, user){
            if(user){
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }
});