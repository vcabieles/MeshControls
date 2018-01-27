// (function () {
    var camera, scene, renderer;
    var geometry, material, mesh;
    var arenaDom = {
        element: document.getElementById("arena"),
        container: document.getElementById("canvasContainer"),
        width: function (){ return this.container.clientWidth},
        height: function (){ return this.container.clientHeight}
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
        camera = new THREE.PerspectiveCamera( 45, arenaDom.width() / arenaDom.height(), 0.01, 3000 );
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

        // #Cubes




        renderer = new THREE.WebGLRenderer( { antialias: true, canvas: arenaDom.element } );
        renderer.setSize( arenaDom.width(), arenaDom.height() );
    }

    function animate() {

        requestAnimationFrame( animate );

        renderer.render( scene, camera );

    }
// }());