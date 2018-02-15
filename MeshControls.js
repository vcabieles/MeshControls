/** Events that make it easier to manipulate ThreeJS meshes as well as speed up development.
 * @author Victor Cabieles / victorcabieles@gmail.com / github.com/vcabieles
 * V:0.0.5 1/27/2018
 * .attach: options = draggable true by default, draggableBtnOn: left mouse button by default;
 * _this.map plane is undefined then one is created.
 */

/**
 * TODO: Delete the key selected from drag, dragstart and dragend
 * */

THREE.MeshControls = function (camera,scene,container) {

    if(scene === undefined || scene.nodeName){
        throw "THREE.MeshControls Scene Parameter Not Set Properly"
    }else if(container === undefined || container.nodeName === undefined || container === undefined){
        throw "THREE.MeshControls domElement Parameter Not Set Properly"
    }else{
        this.container = container;
        this.camera = camera;
        this.objects = [];
        this.mouseOverOnce = false;
    }

    var _this = this,
        _plane = new THREE.Plane(),
        _3DPlane = generatePlane(),
        _raycaster = new THREE.Raycaster(),
        _mouse = new THREE.Vector2(),
        _offset = new THREE.Vector3(),
        _intersection = new THREE.Vector3(),
        _direction = new THREE.Vector3(),
        _scale = new THREE.Vector3(1, 1, 1),
        _displacedMap = null,
        _lastKnownTarget = null,
        _previousPosition = {},
        _selected = null,
        _hovered = null,
        flags = {
            btn: {
                isLeftBtn: false,
                isRightBtn: false,
                isMiddleBtn: false
            },
            click: false,
            moving: false,
            generatedPlane: false,
            setLastPosition: false,
            dragging: false,
            hoverEventFired: false
        };

    this._raySet = function () {
        if (_this.camera instanceof THREE.OrthographicCamera) {
            // _this._vector.set(_mouse.x, _mouse.y, -1).unproject(_this.camera);
            // _direction.set(0, 0, -1).transformDirection(_this.camera.matrixWorld);
            // _raycaster.set(_this._vector, _this._direction);
            throw "THREE.MeshControls is not yet set up for THREE.OrthographicCamera"

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

    function toThreeCords(clientX, clientY, domElement){
        var rect = domElement === undefined ? _this.container.getBoundingClientRect() : domElement.getBoundingClientRect();
        _mouse.x = ( ( clientX - rect.left ) / rect.width ) * 2 - 1;
        _mouse.y = -( ( clientY - rect.top ) / rect.height ) * 2 + 1;
        return {
            x: _mouse.x,
            y: _mouse.y
        }
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
        container.addEventListener( 'mouseup', onDocumentMouseUp, false );
        container.addEventListener( 'mouseleave', onDocumentMouseLeave, false );
        document.addEventListener("keydown", onKeyDown, false);
        document.addEventListener("keypress", onKeyPress, false);
        document.addEventListener("keypress", onKeyUp, false);
    }

    function removeListeners(){

        container.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        container.removeEventListener( 'mousedown', onDocumentMouseDown, false );
        container.removeEventListener( 'mouseup', onDocumentMouseUp, false );
        container.removeEventListener( 'mouseleave', onDocumentMouseLeave, false );
        document.removeEventListener("keydown", onKeyDown, false);
        document.removeEventListener("keypress", onKeyPress, false);
        document.removeEventListener("keypress", onKeyUp, false);
    }

    function onDocumentMouseMove(event){
        event.preventDefault();

        _lastKnownTarget = event.target;
        toThreeCords(event.clientX, event.clientY);
        _this._raySet();
        var movingRay = _raycaster.intersectObjects(_this.objects, true);

        // checks to see if something is selected and draggable and if the right btn is clicked
        if (_selected && _selected.draggable === true && flags.btn[_selected.draggableOn] === true) {
            _displacedMap = _raycaster.intersectObject(_3DPlane);

            var pos = new THREE.Vector3().copy(_displacedMap[0].point.sub(_offset));
            pos.x *= _scale.x; pos.y *= _scale.y; pos.z *= _scale.z;
            _selected.position.copy(pos);
            flags.dragging = true;

            _this.dispatchEvent({type: 'drag', object: _selected, mouseEvent: event});
        }

        if(movingRay.length > 0 && flags.dragging === false){
            _hovered = movingRay[0];
            if(_this.mouseOverOnce === true){
                if(flags.hoverEventFired === false){
                    _this.dispatchEvent({type: 'mouseover', object: _hovered, selected: _hovered, mouseEvent: event});
                    flags.hoverEventFired = true;
                }
            }else{
                _this.dispatchEvent({type: 'mouseover', object: _hovered, selected: _hovered, mouseEvent: event});
            }


        }else if(movingRay.length === 0 && flags.dragging === false){
            if(_hovered !== null){
                _this.dispatchEvent({type: 'mouseleave', object: _hovered, selected: _hovered, mouseEvent: event});
                _hovered = null;
                flags.hoverEventFired = false;
            }
        }

        _this.dispatchEvent({type: 'mousemove', event: event, btn: flags.btn, intersects: movingRay, mouseEvent: event});

        _previousPosition.x = event.clientX;
        _previousPosition.y = event.clientY;

    }

    function onDocumentMouseDown(event){
        event.preventDefault();

        setMouseBtn(event);
        _this._raySet();

        var intersects = _raycaster.intersectObjects(_this.objects, true);
        if(intersects.length > 0){
            _this.dispatchEvent( { type: 'click', object: intersects[0], btn: flags.btn, intersects: intersects, mouseEvent: event});

            //Objects needs to be set to draggableOn
            if(flags.btn[intersects[0].object.draggableOn]===true){
                if(flags.generatedPlane === false && _this.map === undefined){
                    scene.add(_3DPlane);
                    // _this.objects.push(_3DPlane);
                    flags.generatedPlane = true;
                }else if(flags.generatedPlane === true){

                }else{
                    _this.map.name = "_plane";
                    _3DPlane = _this.map;
                }
                _selected = intersects[0].object;
            }

            if(_selected && _selected.draggable === true && flags.btn[_selected.draggableOn] === true){

                _this.dispatchEvent( { type: 'dragstart', object: _selected, btn: flags.btn, intersects: intersects, mouseEvent: event});
            }
        }

        _this.dispatchEvent({type: 'mousedown', event: event, btn: flags.btn, intersects: intersects, mouseEvent: event});

    }

    function onDocumentMouseUp(event){
        onDocumentMouseCancel(event);
        var mouseUpSelected = _raycaster.intersectObjects(_this.objects, true);

        if(mouseUpSelected.length > 0){
            _this.dispatchEvent( { type: 'mouseup', object: mouseUpSelected, btn: flags.btn, mouseEvent: event});
        }
        if(_selected && flags.btn[_selected.draggableOn] === true){
            flags.dragging = false;
            _this.dispatchEvent( { type: 'dragend', object: _selected, intersects: mouseUpSelected, mouseEvent: event});
            _selected = null;
        }

        _this.dispatchEvent({type: 'conatainermouseup', btn: flags.btn, mouseEvent: event});
    }

    function onDocumentMouseLeave(event){
        onDocumentMouseCancel(event);
        _this.dispatchEvent({type: 'conatainermouseleave', mouseEvent: event});

    }

    function onDocumentMouseCancel(event){
        event.preventDefault();

        flags.setLastPosition = false;
        flags.click = false;
        _lastKnownTarget = null;
        setMouseBtn(event);
        _this._raySet();
        container.blur();

    }

    function onKeyDown(event){
        if(_lastKnownTarget === arenaDom.element){
            _this.dispatchEvent( { type: 'keydown', mouseEvent: event});
        }
    }

    function onKeyPress(event){
        if(_lastKnownTarget === arenaDom.element){
            _this.dispatchEvent( { type: 'keypress', mouseEvent: event});
        }
    }

    function onKeyUp(event){
        if(_lastKnownTarget === arenaDom.element){
            _this.dispatchEvent( { type: 'keyup', mouseEvent: event});
        }
    }

    // #API
    this.attach = function (object, options){
        if(options === undefined || options === undefined && options.draggable === undefined ){
            options = {};
            options.draggable = false;
        }else{
            object.draggable = options.draggable;
        }
        if(options.draggableBtnOn === undefined){
            object.draggableOn = "isLeftBtn";
        }else{
            object.draggableOn = options.draggableOn;
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

    this.removeListeners = function(){
        removeListeners()
    };

    this.setMap = function(map){
        this.map =  map;
    };

    this.toThreeCords = toThreeCords;
    addListeners();
};

THREE.MeshControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.MeshControls.prototype.constructor = THREE.MeshControls;