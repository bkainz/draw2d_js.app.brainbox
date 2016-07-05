# Brainbox - working with real device

Logic gates are the basic building blocks of any digital system. It is an electronic circuit having one or 
more than one input and only one output. The relationship between the input and the output is based on a 
certain logic. Based on this, logic gates are named as AND gate, OR gate, NOT gate etc.

Now you can  edit and run your digital circuit simulation designs online on PCs, Macs, thin clients, tablets, smart phones, smart TVs and e-book readers without any installation. You can use **DigitalTrainingStudio** in the office, classroom or at home and connect even your RaspberryPi to drive real physical devices.

(*Extended Demo project for the [draw2d.js](http://www.draw2d.org) library which shows how to connect the browser with a node.js server on raspberry Pi or just your local computer.*)

![image](src/assets/images/animation.gif)



# How to install and use it
You have different options to use the brainbox.

## Internet
just go to [http://freegroup.github.io/draw2d_js.app.brainbox/](http://freegroup.github.io/draw2d_js.app.brainbox/) and you can build your own digital circuits. You can save and load your created schemas if you login with your Google+ account.


## Intranet
You can install the application even in your local intranet for training purpose. Just install and run the backend server (to store and load the circuit files) on every computer which can run a simple node.js server. 

```
npm install -g brainbox
```


## Raspberry Pi
You have **full access to the `GPIO`** pins on you RaspberryPi with the browser based digital circuit simulator. If node.js already running on your raspi you need just to install the simulator 
like on your desktop

```
npm install -g brainbox
```

and start the server with `brainbox`. The server reports the URL how to connect to 
your RaspberryPi with the browser.

See the running example on YouTube: [https://www.youtube.com/watch?v=fUkAIjTaNXI](https://www.youtube.com/watch?v=fUkAIjTaNXI)

###The simulation circuit
![image](src/assets/images/readme_gpio_dts.png?raw=true)

### connect a real LED to your GPIO pin 3
You find a lot of documentation how to connect a simple LED to your raspi. A good source is always the web page of the original [raspberry pi organisation](https://www.raspberrypi.org/documentation/usage/gpio/)

Now you can start the simulation in your browser and the LED connecte to the GPIO(3) lights up
if you press the button in your simulator.




# Feel free to clone and and run it
 
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

###Gitbook
The application uses gitbook to create a getting started guide (at the moment only in *german*). 

```
npm install -g gitbook-cli
```


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

