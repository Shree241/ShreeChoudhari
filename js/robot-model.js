import * as THREE from 'three';

// Articulated demonstration model. Joint angles are in degrees.
export function createRobot() {
  const robot = new THREE.Group();
  const coral = new THREE.MeshStandardMaterial({color:0xff8a45,metalness:.38,roughness:.3});
  const graphite = new THREE.MeshStandardMaterial({color:0x24282c,metalness:.7,roughness:.32});
  const steel = new THREE.MeshStandardMaterial({color:0xa9b1b9,metalness:.82,roughness:.25});
  const black = new THREE.MeshStandardMaterial({color:0x0f1216,metalness:.3,roughness:.48});
  const signal = new THREE.MeshStandardMaterial({color:0x8be4de,emissive:0xff8a45,emissiveIntensity:.45,roughness:.4});
  function mesh(parent,geometry,material,x=0,y=0,z=0) {
    const part=new THREE.Mesh(geometry,material);
    part.position.set(x,y,z);part.castShadow=true;part.receiveShadow=true;parent.add(part);return part;
  }
  function cylinder(parent,radius,height,material,x=0,y=0,z=0) {
    return mesh(parent,new THREE.CylinderGeometry(radius,radius,height,40),material,x,y,z);
  }
  function box(parent,w,h,d,material,x=0,y=0,z=0) {
    return mesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z);
  }
  function joint(parent,radius=.27) {
    const housing=cylinder(parent,radius,.58,graphite);housing.rotation.x=Math.PI/2;
    [-1,1].forEach(side=>{
      const cap=cylinder(parent,radius*.78,.04,steel,0,0,side*.31);cap.rotation.x=Math.PI/2;
      const inset=cylinder(parent,radius*.48,.045,coral,0,0,side*.335);inset.rotation.x=Math.PI/2;
      for(let i=0;i<6;i++) {
        const angle=i*Math.PI/3;
        const bolt=cylinder(parent,.026,.025,black,Math.cos(angle)*radius*.62,Math.sin(angle)*radius*.62,side*.345);
        bolt.rotation.x=Math.PI/2;
      }
    });
  }
  function link(parent,length,radius) {
    mesh(parent,new THREE.CapsuleGeometry(radius,length-2*radius,8,24),coral,0,length/2,0);
    [-1,1].forEach(side=>box(parent,.09,length-.33,.12,steel,side*(radius+.035),length/2,0));
    box(parent,radius*.9,length*.42,.035,graphite,0,length*.51,radius+.01);
    for(let i=0;i<4;i++)box(parent,radius*.67,.018,.012,black,0,length*.4+i*.075,radius+.035);
  }
  cylinder(robot,.74,.14,graphite,0,.07,0);
  cylinder(robot,.58,.08,steel,0,.18,0);
  cylinder(robot,.44,.32,coral,0,.37,0);
  cylinder(robot,.46,.035,signal,0,.535,0);
  for(let i=0;i<6;i++) {
    const a=i*Math.PI/3;cylinder(robot,.044,.025,steel,Math.sin(a)*.64,.15,Math.cos(a)*.64);
  }
  const base=new THREE.Group();base.position.y=.56;robot.add(base);
  cylinder(base,.37,.2,graphite,0,.1,0);
  [-1,1].forEach(side=>box(base,.22,.43,.15,coral,0,.25,side*.255));
  const shoulder=new THREE.Group();shoulder.position.y=.34;base.add(shoulder);joint(shoulder,.29);
  link(shoulder,1.5,.22);
  const elbow=new THREE.Group();elbow.position.y=1.5;shoulder.add(elbow);joint(elbow,.245);
  link(elbow,1.28,.175);
  const wrist=new THREE.Group();wrist.position.y=1.28;elbow.add(wrist);joint(wrist,.18);
  const wristRoll=new THREE.Group();wrist.add(wristRoll);
  cylinder(wristRoll,.16,.24,graphite,0,.12,0);
  const wristPitch=new THREE.Group();wristPitch.position.y=.24;wristRoll.add(wristPitch);joint(wristPitch,.13);
  const toolRoll=new THREE.Group();toolRoll.position.y=.1;wristPitch.add(toolRoll);
  cylinder(toolRoll,.14,.12,steel,0,.08,0);
  box(toolRoll,.39,.15,.26,graphite,0,.22,0);
  const fingers=[-1,1].map(side=>{
    const finger=new THREE.Group();finger.position.set(side*.15,.3,0);toolRoll.add(finger);
    box(finger,.065,.28,.14,steel,0,.14,0);
    box(finger,.1,.055,.15,black,-side*.025,.27,0);return finger;
  });
  const tip=new THREE.Object3D();tip.position.y=.65;toolRoll.add(tip);
  function setPose({base:angleBase=20,shoulder:angleShoulder=-20,elbow:angleElbow=-70,wrist:angleWrist=0,pitch=0,roll=0,grip=.7}={}) {
    base.rotation.y=THREE.MathUtils.degToRad(angleBase);
    shoulder.rotation.z=THREE.MathUtils.degToRad(angleShoulder);
    elbow.rotation.z=THREE.MathUtils.degToRad(angleElbow);
    wrist.rotation.z=THREE.MathUtils.degToRad(-90-angleShoulder-angleElbow);
    wristRoll.rotation.y=THREE.MathUtils.degToRad(angleWrist);
    wristPitch.rotation.z=THREE.MathUtils.degToRad(pitch);
    toolRoll.rotation.y=THREE.MathUtils.degToRad(roll);
    fingers.forEach((finger,i)=>{finger.position.x=(i===0?-1:1)*(.1+.08*grip);});
    robot.updateMatrixWorld(true);
  }
  setPose();
  return {robot,setPose,tip,joints:{base,shoulder,elbow,wrist:wristRoll,wristPitch,toolRoll}};
}
