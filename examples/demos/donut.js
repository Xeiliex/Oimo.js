var donutsGeo = [];
var donuts = [];
var maxp = 0;
var maxPoint = 16;

var pos = [];

function demo() {

    cam ( 90, 20, 100 );

    world = new OIMO.World({ 
        timestep: 1/60, 
        iterations: 8, 
        broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
        worldscale: 1, 
        random: true, 
        info:true // display statistique
    });

   

    // basic geometry body

    var i, j, n, x, y, z, s, b;
    var px, py, pz;
    var radius = 3;
    var margin = 0.3;
    var num = 10;
    var mx = maxPoint;
    var rayon = 8;
    var a = (360/mx) * Math.torad;

    for( i = 0; i < num; i++){



        n = i*mx;
        py = (60 + (i*10));
        px = Math.rand(-40, 40);
        pz = Math.rand(-40, 40);

        donutsGeo[i] = new THREE.Tubular({ start:[px,0,pz], end:[px,-40,pz+40], numSegment:mx+1 }, (mx+1)*3, radius, 12, false );
        donuts[i] = new THREE.Mesh( donutsGeo[i], mat.donut );
        view.addMesh( donuts[i] );

        pos.push([])

        for( j = 0; j < mx; j++){

            x = (Math.sin(j*a) * rayon) + px;
            y = py; //+ Math.sin(j*0.5);
            z = (Math.cos(j*a) * rayon) + pz;

            add({ type:'sphere', size:[radius], pos:[x, y, z], move:1 }, true);

            if( j > 0 ) world.add({ type:'jointHinge', body1:n+(j-1), body2:n+j, pos1:[0,-(radius+margin),0], pos2:[0,(radius+margin),0], collision:false });
            if( j === mx-1 ) world.add({ type:'jointHinge', body1:n+(mx-1), body2:n, pos1:[0,-(radius+margin),0], pos2:[0,(radius+margin),0], collision:false });

        }
    }

    maxp = world.numRigidBodies;

    console.log(maxp)


    var ground = world.add({size:[1000, 10, 1000], pos:[0,-5,0], density:1 });

    
    
    for( i = 0; i<40; i++ ){
        x = Math.rand(-50, 50);
        z = Math.rand(-50, 50);
        s = Math.rand(5, 15);
        add({ type:'box', geometry:geo.dice, size:[s,s,s], pos:[x,s*0.5,z], move:true });
    }

};

function add( o, notToThree ){

    bodys.push( world.add(o) );
    if(!notToThree)meshs.push( view.add(o) );

}

function update () {

    world.step();

    var v, n, cx;

    bodys.forEach( function ( b, id ) {

        if(b.type===1){

            if(id < maxp){

                cx = Math.floor( id / maxPoint );
                n = (id) - (cx*maxPoint);
                //v = b.getPosition();

                donutsGeo[cx].positions[n].copy( b.getPosition() );

                if(n===0) donutsGeo[cx].positions[maxPoint].copy( b.getPosition() );
                //pos[cx][n] = v;
                //pos[cx][n+1] = v.y;
                //pos[cx][n+2] = v.z;

            } else {

                var mid = id - maxp

                if( b.sleeping ) meshs[mid].material = mat.sleep;
                else meshs[mid].material = mat.move;

                meshs[mid].position.copy( b.getPosition() );
                meshs[mid].quaternion.copy( b.getQuaternion() );

                if(meshs[mid].position.y<-10){
                    x = Math.rand(-5,5);
                    z = Math.rand(-5,5);
                    y = Math.rand(10,20);
                    b.resetPosition(x,y,z);
                }
            }
        }


    });

    donutsGeo.forEach( function ( b, id ) {

        //b.positions = pos[id];
        b.updatePath();

    });

    editor.tell( world.getInfo() );

}