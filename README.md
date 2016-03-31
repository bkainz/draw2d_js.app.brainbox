# Digital Training Studio

Preview: [http://freegroup.github.io/draw2d_js.app.digital_training_studio/](http://freegroup.github.io/draw2d_js.app.digital_training_studio/)

Extended Demo project to build a circuit diagramming application with the http://www.draw2d.org framework.

The **Digital Training Studio** is one of three applications which works together.
 
You can create very easy new shapes for the circuit diagramming application without changing one line of code. Just go to the Draw2D Designer, paint it, save it, done! At this point you can use it in the circuit app. The repository provides the new shape.
  
 
##[Draw2D Shape Designer](http://freegroup.github.io/draw2d_js.app.shape_designer)
 The Shape Designer is one tool to design (draw) stencils for the Draw2d.js library. You can export the generated JS code or store them in your private github repositry.
 
 The code can be found [here](https://github.com/freegroup/draw2d_js.app.shape_designer)
  
##[Draw2D Shape Repository](http://freegroup.github.io/draw2d_js.shapes)
The repository is the *whippersnapper* in the Draw2D tool chain. It is a still growing repository of Draw2D shapes and code.

The code can be found [here](https://github.com/freegroup/draw2d_js.shapes)



## Feel free to clone and build your own App
 
You need bower and grunt to build this Draw2D demo app.

Grunt runs on Node.js, so if you don't have npm installed already, go ahead and install it.

###To install Grunt's command line interface run:

```
npm install -g grunt-cli
```

With the flag -g you installed it globally and now you can access it from anywhere on your system.

###Bower
Installing bower couldn't be simpler. Just go:
```
npm install -g bower
```
and you have it.

###Download draw2d.js

and all required libraries in the right version with one command

```
bower install
```

now you have draw2d.js, jquery, raphael,...in the right version in your project.


###Install dependencies for the Gruntfile.js

```
npm install
```

###Build the project
Just type:

```
grunt
```

and you find the result in the **dist** folder.

