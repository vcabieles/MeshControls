/** Events that make it easier to manipulate ThreeJS meshes as well as speed up development.
 * @author Victor Cabieles / victorcabieles@gmail.com / github.com/vcabieles
 * Based on script by Vildanov Almaz / alvild@gmail.com / EventsControls.JS
 * V:0.0.1 1/25/2018
 */

// intersects = raycaster.intersectObjects( objects );
// =>
// intersects[ 0 ].object = this.focused
//     OR
// intersects[ 0 ].object = this.mouseOvered
// this.event = intersects[ 0 ];
// this.event.item - number of the selected object
// this.event.distance - distance between the origin of the ray and the intersection
// this.event.point - point of intersection, in world coordinates
// this.event.face - intersected face
// this.event.faceIndex - index of the intersected face
// this.event.indices - indices of vertices comprising the intersected face

THREE.Object3D.userDataParent = null;
THREE.Mesh.userDataParent = null;

function threeEvents (camera, domElement) {

    var _this = this;

    this.camera = camera;
    this.container = (domElement !== undefined) ? domElement : document;

    var _DisplaceFocused = null; // выделенный объект // selected object
    this.focused = null; // выделенный объект // selected object
    this.focusedChild = null; // выделенная часть 3D объекта // the selected part of 3D object
    this.previous = new THREE.Vector3(); // предыдущие координаты выделенного объекта // // previous coordinates of the selected object
    var _DisplacemouseOvered = null; // наведенный объект // an inverted object
    this.mouseOvered = null; // наведенный объект  // an inverted object
    this.mouseOveredChild = null; // наведенная часть 3D объекта // the induced part of the 3D object

    this.raycaster = new THREE.Raycaster();

    this.map = null;
    this.event = null;
    this.offset = new THREE.Vector3();
    this.offsetUse = false;
    this.scale = new THREE.Vector3(1, 1, 1);

    this._mouse = new THREE.Vector2();
    this.mouse = new THREE.Vector2();
    this._vector = new THREE.Vector3();
    this._direction = new THREE.Vector3();

    this.collidable = false;
    this.collidableEntities = [];
    this.collision = function () {

    };

    // CHANGE FROM ORIGINAL LIBRARY !
    this.isRightMouseButtonClicked = false;
    this.isLeftMouseButtonClicked = false;


    // API

    this.enabled = true;

    this.objects = [];
    var _DisplaceIntersects = [];
    var _DisplaceIntersectsMap = [];
    this.intersects = [];
    this.intersectsMap = [];

    this.update = function (event) {
        if (_this.enabled) {
            onContainerMouseMove(event);
            if (_mouseMoveFlag) _this.mouseMove(event);
        }
    };

    this.dragAndDrop = function (e) { }; // this.container.style.cursor = 'move';
    this.mouseOver = function (e) { };// this.container.style.cursor = 'pointer';
    this.mouseOut = function (e) { };// this.container.style.cursor = 'auto';
    this.mouseUp = function (e) { }; // this.container.style.cursor = 'auto';
    this.mouseMove = function (e) { };
    this.onclick = function (e) { };

    this.attach = function (object) {

        if (object instanceof THREE.Mesh) {
            this.objects.push(object);
        }
        else {

            this.objects.push(object);

            for (var i = 0; i < object.children.length; i++) {
                object.children[i].userDataParent = object;
            }
        }

    };

    this.detach = function (object) {
        var item = _this.objects.indexOf(object);
        this.objects.splice(item, 1);

    };

    this.dispose = function (object){
        _this.detach(object);
    };

    this.disposeAll = function (){
        _this.objects.length = 0;
    };

    this.getAttachedObjects = function (){
        return _this.objects;
    };

    var _mouseOverFlag = false;
    var _mouseOutFlag = false;
    var _dragAndDropFlag = false;
    var _mouseUpFlag = false;
    var _onclickFlag = false;
    var _mouseMoveFlag = false;

    this.attachEvent = function (event, handler) {

        switch (event) {
            case 'mouseOver': this.mouseOver = handler; _mouseOverFlag = true; break;
            case 'mouseOut': this.mouseOut = handler; _mouseOutFlag = true; break;
            case 'dragAndDrop': this.dragAndDrop = handler; _dragAndDropFlag = true; break;
            case 'mouseUp': this.mouseUp = handler; _mouseUpFlag = true; break;
            case 'onclick': this.onclick = handler; _onclickFlag = true; break;
            case 'mouseMove': this.mouseMove = handler; _mouseMoveFlag = true; break;
                break;
        }

    };

    this.detachEvent = function (event) {

        switch (event) {
            case 'mouseOver': _mouseOverFlag = false; break;
            case 'mouseOut': _mouseOutFlag = false; break;
            case 'dragAndDrop': _dragAndDropFlag = false; break;
            case 'mouseUp': _mouseUpFlag = false; break;
            case 'onclick': _onclickFlag = false; break;
            case 'mouseMove': _mouseMoveFlag = false; break;
                break;
        }

    };

    this.setFocus = function (object) {

        _DisplaceFocused = object;
        _this.event.item = _this.objects.indexOf(object);

        if (object.userDataParent) {
            this.focused = object.userDataParent;
            this.focusedChild = _DisplaceFocused;
            this.previous.copy(this.focused.position);
        }
        else {
            this.focused = object; this.focusedChild = null;
            this.previous.copy(this.focused.position);
        }

    };

    this.removeFocus = function () {

        _DisplaceFocused = null;
        this.focused = null;
        this.focusedChild = null;
        this.event = null;

    };

    this.select = function (object) {

        _DisplacemouseOvered = object;
        _this.event.item = _this.objects.indexOf(object);
        if (object.userDataParent) {
            this.mouseOvered = object.userDataParent;
            this.mouseOveredChild = _DisplacemouseOvered;
        }
        else {
            this.mouseOvered = object; this.mouseOveredChild = null;
        }

    };

    this.deselect = function () {

        _DisplacemouseOvered = null;
        this.mouseOvered = null;
        this.mouseOveredChild = null;
        this.event = null;

    };

    this.returnPrevious = function () {

        _this.focused.position.copy(this.previous);

    };

    this._raySet = function () {

        if (_this.camera instanceof THREE.OrthographicCamera) {
            _this._vector.set(_this._mouse.x, _this._mouse.y, -1).unproject(_this.camera);
            _this._direction.set(0, 0, -1).transformDirection(_this.camera.matrixWorld);
            _this.raycaster.set(_this._vector, _this._direction);

        }
        else {

            var vector = new THREE.Vector3(_this._mouse.x, _this._mouse.y, 1);
            //_this._projector.unprojectVector( vector, camera );
            vector.unproject(_this.camera);
            //	_this.raycaster = new THREE.Raycaster( _this.camera.position, vector.sub( _this.camera.position ).normalize() );
            _this.raycaster.set(_this.camera.position, vector.sub(_this.camera.position).normalize());

        }

    };

    this.intersectFrom = (origin, direction) => {
        _this._direction.set(direction.x, direction.y, direction.z);
        _this._vector.set(origin.x, origin.y, origin.z);
        _this.raycaster.set(_this._vector, _this._direction);
        _this.intersects = _this.raycaster.intersectObjects(_this.objects, true);
    }

    this._setMap = function () {

        _this.intersectsMap = _DisplaceIntersectsMap;

    };

    function getMousePos(event) {
        if (_this.enabled) {
            var x = event.offsetX === undefined ? event.layerX : event.offsetX;
            var y = event.offsetY === undefined ? event.layerY : event.offsetY;

            _this._mouse.x = ((x) / (_this.container.width / 2)) * 2 - 1;
            _this._mouse.y = -((y) /( _this.container.height / 2)) * 2 + 1;

            onContainerMouseMove(event);
            if (_mouseMoveFlag) _this.mouseMove(event);
        }
    }

    function onContainerMouseDown(event) {

        switch (event.button) {
            case 0: // left
                _this.isLeftMouseButtonClicked = true;
                _this.isRightMouseButtonClicked = false;

                break;
            case 1: // middle
                _this.isLeftMouseButtonClicked = false;
                _this.isRightMouseButtonClicked = false;

                break;
            case 2: // right
                _this.isLeftMouseButtonClicked = false;
                _this.isRightMouseButtonClicked = true;

                break;
        }

        if (_this.enabled && (_onclickFlag || _dragAndDropFlag)) {
            if (_this.focused) { return; }
            _this._raySet();
            _this.intersects = _this.raycaster.intersectObjects(_this.objects, true);

            if (_this.intersects.length > 0) {

                _this.event = _this.intersects[0];
                _this.setFocus(_this.intersects[0].object);

                if (_dragAndDropFlag) {
                    _this.intersects = _this.raycaster.intersectObject(_this.map);

                    try {
                        if (_this.offsetUse) {
                            var pos = new THREE.Vector3().copy(_this.focused.position);
                            pos.x = pos.x / _this.scale.x; pos.y = pos.y / _this.scale.y; pos.z = pos.z / _this.scale.z;
                            _this.offset.subVectors(_this.intersects[0].point, pos);

                        }
                        //_this.offset.copy( _this.intersects[ 0 ].point ).sub( _this.map.position );
                    }
                    catch (err) { }

                }

                _this.onclick(event);

            }
            else {
                _this.removeFocus(); _this.event = null;
            }
        }
    }

    function onContainerMouseMove() {

        _this._raySet();

        if (_this.focused) {

            if (_dragAndDropFlag) {
                _DisplaceIntersectsMap = _this.raycaster.intersectObject(_this.map);
                //_this._setMap();
                try {
                    var pos = new THREE.Vector3().copy(_DisplaceIntersectsMap[0].point.sub(_this.offset));
                    pos.x *= _this.scale.x; pos.y *= _this.scale.y; pos.z *= _this.scale.z;
                    _this.focused.position.copy(pos);
                }
                catch (err) { }

                _this.dragAndDrop();
            }
        }
        else {

            if (_mouseOverFlag) {

                _DisplaceIntersects = _this.raycaster.intersectObjects(_this.objects, true);
                _this.intersects = _DisplaceIntersects;
                if (_this.intersects.length > 0) {
                    _this.event = _this.intersects[0];
                    if (_this.mouseOvered) {
                        if (_DisplacemouseOvered !== _this.intersects[0].object) {
                            _this.mouseOut();
                            _this.select(_this.intersects[0].object);
                            _this.mouseOver(event);
                        }
                    }
                    else {
                        _this.select(_this.intersects[0].object);
                        _this.mouseOver(event);
                    }
                }
                else {
                    if (_DisplacemouseOvered) { _this.mouseOut(); _this.deselect(); }
                }
            }
        }

        if (_this.focused) {
            if (_this.collidable) {
                var originPoint = _this.focused.position.clone();
                for (var vertexIndex = 0; vertexIndex < _this.focused.geometry.vertices.length; vertexIndex++) {
                    var localVertex = _this.focused.geometry.vertices[vertexIndex].clone();
                    var globalVertex = _this.focused.localToWorld(localVertex);
                    var directionVector = new THREE.Vector3().copy(globalVertex);
                    directionVector.sub(_this.focused.position);

                    _this.raycaster.set(originPoint, directionVector.clone().normalize());
                    var collisionResults = _this.raycaster.intersectObjects(_this.collidableEntities);

                    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                        _this.collision();
                        break;
                    }

                }
            }

        }

        //}
    }

    function onContainerMouseUp(event) {
//        _this._raySet();
//        _this.intersects = _this.raycaster.intersectObjects(_this.objects, true);
        console.log("container Mouse UP");
        if (_this.enabled) {
            console.log("_this.enabled");
            if (_this.focused) {
                console.log("_this.focused");
                _this.intersects = _this.raycaster.intersectObjects(_this.objects, true);
                _this.mouseUp(event);
                _DisplaceFocused = null;
                _this.focused = null;

            }
        }

    }

    this.container.addEventListener('mousedown', onContainerMouseDown, false);	// Mouse clicked down
    this.container.addEventListener('mousemove', getMousePos, false);           // Mouaw coordinates
    this.container.addEventListener('mouseup', onContainerMouseUp, false);      // Mouse Is released

};