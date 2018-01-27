// (function () {
    var camera, scene, renderer;
    var geometry, material, mesh;
    var arenaDom = {
        element: document.getElementById("arena"),
        container: document.getElementById("canvasContainer"),
        width: function (){ return this.container.clientWidth},
        height: function (){ return this.container.clientHeight}
    };

    init();
    animate();

    function init() {

        // #Camera & Scene
        camera = new THREE.PerspectiveCamera( 70, arenaDom.width() / arenaDom.height(), 0.01, 10 );
        camera.position.z = 1;
        scene = new THREE.Scene();

        geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
        material = new THREE.MeshNormalMaterial();

        mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );

        renderer = new THREE.WebGLRenderer( { antialias: true, canvas: arenaDom.element } );
        renderer.setSize( arenaDom.width(), arenaDom.height() );
    }

    function animate() {

        requestAnimationFrame( animate );

        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.02;

        renderer.render( scene, camera );

    }
// }());