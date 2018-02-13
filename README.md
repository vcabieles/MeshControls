### _In Development_
# MeshControls.JS
Events that make it easier to manipulate ThreeJS meshes as well as speed up development.

### [DEMO](meshcontrols.klever.systems) Open the console

### Instantiate
##### index.html
```
<script src="/three.min.js"></script>
<script src="meshcontrols/MeshControls.mini.js"></script
```
##### yourScript.js
```
var meshControls = new THREE.MeshControls(camera,scene,domElement);
options = {
    draggable: Boolean,
    draggableOn: Integer //Defaults to 0 Left. 1 = Middle; 2 = Right;
}

meshControls.attach(<MESH or 3DObject>, options)
```
### Event Listeners
```
meshControls.addEventListener("<TYPE>",function(event){

});
```
##### Event Types
Types are strings
*  click
*  mousemove
*  mousedown
*  mouseover
*  mouseleave
*  mouseup
*  mouseleave
*  dragstart
*  drag
*  dragend
*  keydown
*  keypress
*  keyup

### API Core
```
MeshControls.attach() 
Adds the object from which you will be able to get events for.

MeshControls.dispose(<Mesh or 3Dobject>)
Accepts an object and removes the listeners from it.

MeshControls.disposeAll()
Removes listeners from all attached objects and dom.

MeshControls.removeListeners()
Removes all eventlisteners from document.

MeshControls.setMap(_Plane)
Sets the plane from which drag and drop cordinates can be intersected.

MeshControls.toThreeCords(clientX, clientY, domElement)
Returns x and y according to threejs vectors. 
```