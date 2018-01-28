// (function () {
    var camera, scene, renderer;
    var meshControls;
    var arenaDom = {
        element: document.getElementById("arena"),
        container: document.getElementById("canvasContainer"),
        width: function (){ return this.container.clientWidth},
        height: function (){ return this.container.clientHeight},
        colors: ["#ba3748","#6d0e36","#8eecbb","#f4ad0e","#b91768"],
        randomPos: function () {
            return (Math.random() * (9-(-9)))+(-9)
        }
    };

    var loader = new THREE.TextureLoader();
    loader.crossOrigin = true;

    loader.load(
        'img/floor.jpg',
        onTextureLoad,
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(xhr) {
            console.log('An error happened');
        }
    );

    function onTextureLoad(texture){
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 8, 8 );
        arenaDom.floor = texture;

        init();
        animate();
    }

    function init() {


        // #Camera & Scene
        camera = new THREE.PerspectiveCamera( 65, arenaDom.width() / arenaDom.height(), 0.01, 3000 );
        camera.name = "Camera";
        camera.position.set(0,1,12);
        scene = new THREE.Scene();
        scene.name = "Scene";
        scene.add(camera);



        // #Floor
        var floorGeometry = new THREE.PlaneGeometry( 50, 50, 30,30 ),
            floorMaterial = new THREE.MeshBasicMaterial( { map : arenaDom.floor, side: THREE.DoubleSide } ),
            floorPlane = new THREE.Mesh( floorGeometry, floorMaterial );
            floorPlane.name = "Floor";
            floorPlane.rotateX(Math.PI/2);
            scene.add(floorPlane);

        //#Controls
        meshControls = new THREE.MeshControls(camera,scene,arenaDom.element);

        meshControls.addEventListener("click",function(event){
            var selectedObject = event.object[0];
            // selectedObject.object.position.y +=0.7;
           console.log("click", event)
        });
        meshControls.addEventListener("mouseup",function(event){
            var selectedObject = event.object[0];
            // selectedObject.object.position.y +=0.7;
            // console.log("mouse up")
        });

        meshControls.addEventListener("dragend",function(event){
            // console.log("dragEnd", event)
            // event.object.position.y = 0.40;

        });

        meshControls.addEventListener("dragstart",function(event){
            // console.log("dragstart",event)
        });

        meshControls.addEventListener("drag",function(event){
            console.log("drag", event);
            event.object.position.y = 0.40;

        });


        // #Light
        var pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
            pointLight.position.set( 10, 15, 15 );
            pointLight.name = "PointLight";
            scene.add( pointLight );


        // #Cubes
            arenaDom.colors.forEach(function(color,index){
            var geometry = new THREE.BoxGeometry( 0.8, 0.8, 0.8 );
            var material = new THREE.MeshPhongMaterial( {color: color} );
            var cube = new THREE.Mesh( geometry, material );
            cube.position.set(arenaDom.randomPos(),0.40,arenaDom.randomPos());
            cube.name = "Cube :"+color;
            meshControls.attach(cube);
            scene.add(cube);
        });

        renderer = new THREE.WebGLRenderer( { antialias: true, canvas: arenaDom.element } );
        renderer.setSize( arenaDom.width(), arenaDom.height() );
    }

    function animate() {

        requestAnimationFrame( animate );

        renderer.render( scene, camera );

    }
// }());