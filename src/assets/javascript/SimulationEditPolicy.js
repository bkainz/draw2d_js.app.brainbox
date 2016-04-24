var SimulationEditPolicy = draw2d.policy.canvas.ReadOnlySelectionPolicy.extend({


    init:function()
    {
      this._super();
    },

    /**
     * @method
     * Called by the canvas if the user click on a figure.
     *
     * @param {draw2d.Figure} the figure under the click event. Can be null
     * @param {Number} mouseX the x coordinate of the mouse during the click event
     * @param {Number} mouseY the y coordinate of the mouse during the click event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     *
     * @since 3.0.0
     */
    onClick: function(figure, mouseX, mouseY, shiftKey, ctrlKey)
    {
        if(figure!==null){
            figure.fireEvent("click", {
                figure:figure,
                x:mouseX,
                y:mouseY,
                relX: mouseX-figure.getAbsoluteX(),
                relY: mouseY-figure.getAbsoluteY(),
                shiftKey:shiftKey,
                ctrlKey:ctrlKey});

            figure.onClick();
        }
    }
});