/** Events that make it easier to manipulate ThreeJS meshes as well as speed up development.
 * @author Victor Cabieles / victorcabieles@gmail.com / github.com/vcabieles
 * V:0.0.5 1/27/2018
 * .attach: options = draggable true by default, draggableBtnOn: left mouse button by default;
 * _this.map plane is undefined then one is created.
 */

/**
 * TODO: add option for listening to keys for the whole document
 * TODO: _this.map is _3DPlane
 */
THREE.MeshControls = function (camera,scene,container) {

    if(scene === undefined || scene.nodeName){
        throw "THREE.MeshControls Scene Parameter Not set"
    }else if(container === undefined || container.nodeName === undefined){
        throw "THREE.MeshControls Element Parameter Not set"
    }else{
        this.container = container;
        this.camera = camera;
        this.objects = [];

    }

    var _plane = new THREE.Plane(),
        _3DPlane = generatePlane(),
        _raycaster = new THREE.Raycaster(),
        _mouse = new THREE.Vector2(),
        _offset = new THREE.Vector3(),
        _intersection = new THREE.Vector3(),
        _direction = new THREE.Vector3(),
        _scale = new THREE.Vector3(1, 1, 1),
        _displacedMap = null,
        _lastKnownTarget = null,
        _previousPosition = {};

    var _selected = null, _hovered = null;


    var _this = this,
        flags = {
            btn: {
                isLeftBtn: false,
                isRightBtn: false,
                isMiddleBtn: false
            },
            click: false,
            moving: false,
            generatedPlane: false,
            setLastPosition: false
        };

    this._raySet = function () {
        if (_this.camera instanceof THREE.OrthographicCamera) {
            _this._vector.set(_mouse.x, _mouse.y, -1).unproject(_this.camera);
            _direction.set(0, 0, -1).transformDirection(_this.camera.matrixWorld);
            _raycaster.set(_this._vector, _this._direction);

        }
        else {
            var vector = new THREE.Vector3(_mouse.x, _mouse.y, 1);
            vector.unproject(_this.camera);
            _raycaster.set(_this.camera.position, vector.sub(_this.camera.position).normalize());
        }

    };

    function generatePlane(){
        var floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 10, 10 ),
            floorMaterial = new THREE.MeshBasicMaterial( { color : 0xffffff, side: THREE.DoubleSide } ),
            plane = new THREE.Mesh( floorGeometry, floorMaterial );
            floorMaterial.transparent = true;
            floorMaterial.opacity = 0;
            plane.name = "_plane";
            plane.rotateX(Math.PI/2);
            plane.position.copy(camera.position);
            plane.position.y = 0;
            return plane;
    }

    function toThreeCords(clientX, clientY){
        var rect = _this.container.getBoundingClientRect();
            _mouse.x = ( ( clientX - rect.left ) / rect.width ) * 2 - 1;
            _mouse.y = -( ( clientY - rect.top ) / rect.height ) * 2 + 1;
    }

    function setMouseBtn(event){
        switch (event.button) {
            case 0: // left
                flags.btn.isLeftBtn = true;
                flags.btn.isRightBtn = false;
                flags.btn.isMiddleBtn = false;
                break;
            case 1: // middle
                flags.btn.isLeftBtn = false;
                flags.btn.isRightBtn = false;
                flags.btn.isMiddleBtn = true;
                break;
            case 2: // right
                flags.btn.isLeftBtn = false;
                flags.btn.isRightBtn = true;
                flags.btn.isMiddleBtn = false;
                break;
        }
    }

    function addListeners(){
        container.addEventListener( 'mousemove', onDocumentMouseMove, false );
        container.addEventListener( 'mousedown', onDocumentMouseDown, false );
        container.addEventListener( 'mouseup', onDocumentMouseCancel, false );
        container.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
        // container.addEventListener( 'touchmove', onDocumentTouchMove, false );
        // container.addEventListener( 'touchstart', onDocumentTouchStart, false );
        // container.addEventListener( 'touchend', onDocumentTouchEnd, false );
        document.addEventListener("keydown", onKeyDown, false);
        document.addEventListener("keypress", onKeyPress, false);
        document.addEventListener("keypress", onKeyUp, false);
    }

    function removeListeners(){

        container.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        container.removeEventListener( 'mousedown', onDocumentMouseDown, false );
        container.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
        container.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
        // container.removeEventListener( 'touchmove', onDocumentTouchMove, false );
        // container.removeEventListener( 'touchstart', onDocumentTouchStart, false );
        // container.removeEventListener( 'touchend', onDocumentTouchEnd, false );
        document.removeEventListener("keydown", onKeyDown, false);
        document.removeEventListener("keypress", onKeyPress, false);
        document.removeEventListener("keypress", onKeyUp, false);
    }

    function onDocumentMouseMove(event){
        event.preventDefault();
        // console.log(event);
        _lastKnownTarget = event.target;
        toThreeCords(event.clientX, event.clientY);
        _this._raySet();

        // if(_previousPosition.x === event.clientX && _previousPosition.y === event.clientY){
        //     console.log("previous position");
        // }else {
            // checks to see if something is selected and draggable and if the right btn is clicked
            if (_selected && _selected.draggable === true && flags.btn[_selected.draggableOn] === true) {
                _displacedMap = _raycaster.intersectObject(_3DPlane);
                // if(flags.setLastPosition === false){
                //     flags.setLastPosition = true;
                // }else{
                    try {
                        var pos = new THREE.Vector3().copy(_displacedMap[0].point.sub(_offset));
                        pos.x *= _scale.x; pos.y *= _scale.y; pos.z *= _scale.z;
                        _selected.position.copy(pos);
                        console.log(_displacedMap);
                        // _selected.position.set(_displacedMap[0].point.x, _selected.position.y, _displacedMap[0].point.z);


                    } catch (err) {
                        throw err
                    }
                    _this.dispatchEvent({type: 'drag', object: _selected});
                // }


            }
        // }

        _previousPosition.x = event.clientX;
        _previousPosition.y = event.clientY;
    }

    function onDocumentMouseDown(event){
        event.preventDefault();
        setMouseBtn(event);
        _this._raySet();

        var intersects = _raycaster.intersectObjects(_this.objects, true);
        if(intersects.length > 0){
            _this.dispatchEvent( { type: 'click', object: intersects[0], btn: flags.btn, intersects: intersects});

            if(flags.btn[intersects[0].object.draggableOn]===true){
                if(flags.generatedPlane === false && _this.map === undefined){
                    scene.add(_3DPlane);
                    _this.objects.push(_3DPlane);
                    flags.generatedPlane = true;
                    console.log("Plane generated")
                }else if(flags.generatedPlane === true){

                }else{
                    _this.map.name = "_plane";
                    _3DPlane = _this.map;
                }
                _selected = intersects[0].object;
                // var mapIntersect = _raycaster.intersectObject(_3DPlane);
                // var pos = new THREE.Vector3().copy(_selected.position);
                // pos.x = pos.x / _scale.x; pos.y = pos.y / _scale.y; pos.z = pos.z / _scale.z;
                // _offset.subVectors(mapIntersect[0].point, pos);
            }

            if(_selected && _selected.draggable === true && flags.btn[_selected.draggableOn] === true){
                // var mapIntersect = _raycaster.intersectObject(_3DPlane);
                try {
                    // var pos = new THREE.Vector3().copy(_selected.position);
                    // pos.x = pos.x / _scale.x; pos.y = pos.y / _scale.y; pos.z = pos.z / _scale.z;
                    // _offset.subVectors(mapIntersect[0].point, pos);
                }
                catch (err) { throw err }
                _this.dispatchEvent( { type: 'dragstart', object: _selected, btn: flags.btn, intersects: intersects});
            }
        }
    }

    function onDocumentMouseCancel(event){
        event.preventDefault();
        flags.setLastPosition = false;
        flags.click = false;
        setMouseBtn(event);
        _this._raySet();
        container.blur();

        var mouseUpSelected = _raycaster.intersectObjects(_this.objects, true);

        if(mouseUpSelected.length > 0){
            _this.dispatchEvent( { type: 'mouseup', object: mouseUpSelected, btn: flags.btn});
        }
        if(_selected && flags.btn[_selected.draggableOn] === true){

            _this.dispatchEvent( { type: 'dragend', object: _selected, intersects: mouseUpSelected});
            _selected = null;
        }

    }

    function onKeyDown(event){
        if(_lastKnownTarget === arenaDom.element){
            _this.dispatchEvent( { type: 'keydown', event: event});
        }
    }

    function onKeyPress(event){
        if(_lastKnownTarget === arenaDom.element){
            _this.dispatchEvent( { type: 'keypress', event: event});
        }
    }

    function onKeyUp(event){
        if(_lastKnownTarget === arenaDom.element){
            _this.dispatchEvent( { type: 'keyup', event: event});
        }
    }

    // #API
    this.attach = function (object, options){
        if(options === undefined || options === undefined && options.draggable === undefined ){
           options = {};
           options.draggable = false;
           // switch back to false
           object.draggable = true;

        }
        if(options.draggableBtnOn === undefined){
            object.draggableOn = "isLeftBtn";
        }
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
        removeListeners()
    };

    this.removeListenrs = function(){
        removeListeners()
    };

    this.setMap = function(map){
      this.map =  map;
    };

    addListeners();

};

THREE.MeshControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.MeshControls.prototype.constructor = THREE.MeshControls;