var ProbeWindow = Class.extend({

    init:function(canvas)
    {
        var _this = this;
        this.canvas = canvas;

        // sync the setting in the local storage
        this.stick = Locstor.get("stickWindow",false);
        this.watch("stick",function(id, oldval, newval){
            Locstor.set("stickWindow",newval);
            return newval;
        });

        // the tick function if the oszi goes from left to the right
        //
        this.rightShiftTick= $.proxy(function(entry){
            entry.data.unshift(entry.probe.getValue()?5:0);
            entry.vis
                .selectAll("path")
                .attr("transform", "translate(-" + _this.xScale(1) + ")")
                .attr("d", entry.path)
                .transition()
                .ease("linear")
                .duration(this.intervalTime )
                .attr("transform", "translate(0)");
                entry.data.pop();
        },this);

        this.leftShiftTick= $.proxy(function(entry){
            entry.data.push(entry.probe.getValue()?5:0);
            entry.vis
                .selectAll("path")
                .attr("transform", "translate(" + _this.xScale(1) + ")")
                .attr("d", entry.path)
                .transition()
                .ease("linear")
                .duration(this.intervalTime )
                .attr("transform", "translate(0)");
            entry.data.shift();
        },this);


        $(window).resize(function(){
            _this.resize();
        });

        this.canvas.on("probe:add", function(emitter, event){
           _this.addProbe(event.figure);
        });
        this.canvas.on("probe:remove", function(emitter, event){
            _this.removeProbe(event.figure);
        });

        this.channelBufferSize = 500;
        this.channelHeight =20;
        this.channelWidth = $("#probe_window").width();
        this.probes = [];

        this.xScale = d3.scale.linear().domain([0, this.channelBufferSize - 1]).range([0,this.channelWidth]);
        this.yScale = d3.scale.linear().domain([0, 5]).range([this.channelHeight, 0]);

        $("#probe_window_stick").on("click",function(){
            _this.stick = !_this.stick;
            if(_this.stick){
                $("#probe_window_stick").addClass("ion-ios-eye").removeClass("ion-ios-eye-outline");
            }
            else{
                $("#probe_window_stick").addClass("ion-ios-eye-outline").removeClass("ion-ios-eye");
            }

            // try to hide the window if the simulation isn't running.
            if(!_this.stick && !_this.canvas.isSimulationRunning()){
                _this.hide();
            }
        });

        if(this.stick){
            $("#probe_window_stick").addClass("ion-ios-eye").removeClass("ion-ios-eye-outline");
            this.show(true);
        }
    },

    show:function(force)
    {
        if(!force && this.stick){
            return;
        }

        var _this = this;
        var probes = [];

        this.resize();

        // get all probes from the canvas and add them to the window
        //
        this.canvas.getLines().each(function(i,line){
            var probe = line.getProbeFigure();
            if(probe!==null){
                probes.push(probe);
            }
        });


        // sort the probes by the "index" attribute
        //
        probes.sort(function(a,b){
            return a.index - b.index;
        });

        $("#probeSortable").remove();
        $("#probe_window").append('<ul id="probeSortable"></ul>');


        probes.forEach(function(probe){
            _this.addProbe(probe);
        });

        $("#probe_window").show().animate({height:'200px'},300);
        $("#draw2dCanvasWrapper").animate({bottom:'200px'},300);
        $( "#probeSortable" ).sortable({
            update: function( event, ui ) {
                var lis =  $( "#probeSortable li" );
                $.each(lis,function(index, li){
                    probeEntry = _this.probes.find(function(entry){
                        return entry.probe.id===li.attributes.id.value;
                    });
                    probeEntry.probe.setIndex(index);
                });
            }
        });

    },

    hide:function()
    {
        if(this.stick){
            return;
        }

        $("#probe_window").animate({height:'0'},300);
        $("#draw2dCanvasWrapper").animate({bottom:'0'},300, function(){
            $("#probeSortable").remove();
        });
    },

    resize:function()
    {
        var _this = this;
        this.channelWidth = $("#probe_window").width();
        this.xScale = d3.scale.linear().domain([0, this.channelBufferSize - 1]).range([0,this.channelWidth]);
        this.yScale = d3.scale.linear().domain([0, 5]).range([this.channelHeight, 0]);

        this.probes.forEach(function(entry){
            entry.svg.attr("width", _this.channelWidth);
        });
    },

    tick:function( intervalTime)
    {
       // test fiddle for D3 line chart
       // http://jsfiddle.net/Q5Jag/1859/

       this.intervalTime = intervalTime;
       this.probes.forEach(this.leftShiftTick);
    },

    removeProbe: function(probeFigure)
    {
        this.probes = $.grep(this.probes, function(entry) {
            return entry.probe != probeFigure;
        });
        $("#"+probeFigure.id).remove();
        this.resize();
    },

    addProbe: function(probeFigure)
    {
        probeFigure.setIndex(this.probes.length);

        var _this = this;

        var data = d3.range(this.channelBufferSize).map(function(){return 0;});

        var li    = d3.select("#probeSortable").append("li").attr("id",probeFigure.id).attr("index",probeFigure.getIndex());
        var label = li.append("div").text(probeFigure.getText());

        var svg   = li.append("svg:svg").attr("width", this.channelWidth).attr("height", this.channelHeight);
        var vis   = svg.append("svg:g");
        var path  = d3.svg
            .line()
            .x(function(d, i) {
                return _this.xScale(i);
            })
            .y(function(d, i) {
                return _this.yScale(d);
            })
            .interpolate("step-before");

        vis.selectAll("path")
            .data([data])
            .enter()
            .append("svg:path")
            .attr("d", path)
            .attr('stroke', 'green')
            .attr('stroke-width', 1)
            .attr('fill', 'none');

        this.probes.push({
            data: data,
            svg:svg,
            vis : vis,
            path:path,
            probe:probeFigure
        });

        // direct edit of the label
        //
        var $label = $(label[0]);
        $label.click(function() {

            var $replaceWith = $('<input type="input" class="inplaceEdit" value="'+probeFigure.getText()+'" />');
            $label.hide();
            $label.after($replaceWith);
            $replaceWith.focus();

            var fire=function() {
                var newLabel = $replaceWith.val();
                if(newLabel!=="") {
                    $replaceWith.remove();
                    $label.html(newLabel);
                    $label.show();
                    probeFigure.setText(newLabel);
                }
                else{
                    // get the value and post them here
                    $replaceWith.remove();
                    $label.show();
                }
            };
            $replaceWith.blur(fire);
            $replaceWith.keypress(function (e) {
                if (e.which == 13) {
                    fire();
                }
            });
        });
        this.resize();
    }
});
