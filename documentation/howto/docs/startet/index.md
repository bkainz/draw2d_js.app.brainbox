## Brainbox Basics
You can customize and manipulate functional “brains” from any computer’s browser, local or remote.
Every <span class='branding'>brainbox</span> file consists of nodes which are linked together to form the logical flow of your
application. The nodes typically fall under **input**, **operation** or **output**.<br>
<br>
Based on a friendly user interface, the user can interact with its logic blocks, flip switches, change the
input data, connect any device via *wireless communication* modules and watch the output data changes for sequential
models. We are sure that this tool will be of great help to any student who has interest in this field, and enable
him to better understand the logic circuit design process.

Below is a very simple example of how these different nodes would interact with each other.
<br>
<br>
<center>
![example](example_brain.png)
</center>


## Easy To Use
<span class="container clearfix">
<span  class='primary' style="max-width:500px" markdown='1'>
  **1. Place**
  <br>
  Select an element. Place it on the board.
  <br>
  <br>
  **2. Connect**
  <br>
  Use the Wire Tool to connect your elements.
  <br>
  <br>
  **3. Test**
  <br>
  Click RUN to start the simulation.
</span>
<span  class='secondary' style="width:200px" markdown='1'>
   ![overview](overview_thumb.png)
</span>
</span>


## Place nodes
<span class='branding'>brainbox</span> lets you drag and drop components or nodes onto the editing surface and
manipulate them easily with your mouse.
<br>


### Placing nodes
To add a component to the document, drag it from the left palette on the left side of the window to the
editing surface on the right. Drop it at any location on the editing surface by releasing the left mouse button.

![](placing_nodes.gif)
<br>
<br>
<br>
<br>

### Select single component
To select a **single component** in the document, click it with your mouse. It will be highlighted blue to indicate
that it has been selected.

![](select_single_nodes.gif)
<br>
<br>
<br>
<br>

### Select multiple components
Drag and drop is not restricted only to single element. To select a **multiple component** in the document, click
anywhere in the document and drag a bounding box covering all elements to select.

![](select_multiple_nodes.gif)
<br>
<br>
<br>
<br>


### Grouping components
You can group multiple elements if you press the **shift key** during the multiple selection operation. The created *group*
ist more a raft than a closed group.

![](group_multiple_nodes.gif)
<br>
<br>
<br>
<br>

### Delete a node
To delete a node from the document, select it, and then click the Delete button in the upper tool bar. Alternatively,
press either Delete/Entf on your keyboard to delete the selected component. You may also right-click the editing surface
and choose *Delete* from the context menu.

![](delete_nodes.gif)


## Connect nodes
Signal is passed around the circuit by connecting nodes with **wires**.

### Create a Connection
To create a connection click a component's output pin (a circular connector, usually on the right side), and drag a
wire to an unconnected input pin. Compatible pins will be highlighted. Input pins may only be connected to a
single output pin. An output pin may be connected to many input pins.

![](connect_nodes.gif)
<br>
<br>
<br>
<br>


## Run the Simulation
*BrainBox* starts simulating when you press the green arrow at the top right corner. The signal will instantly
propagate among the connected components, and if your circuit contains one or more Clocks, they will start
oscillating.

![](run_simulation.gif)

## ...open an example
go to the editor and open your very first example and start the simulation. <a href="../../../../index.html?pane=files_tab" target="_parent">open</a>
<br>
<br>
<br>
<br>
