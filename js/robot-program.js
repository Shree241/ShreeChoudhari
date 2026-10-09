// Deterministic Cartesian pick-and-place program shared by the 3D and SVG views.
// Coordinates are metres in this illustrative mechanism, not machine commands.
export const BAY_A={x:1.45,y:.29,z:1.05};
export const BAY_B={x:1.45,y:.29,z:-1.05};
export const HOME={x:1.35,y:1.55,z:0};
const upper=1.5,forearm=1.28,shoulderHeight=.9,toolLength=.84;
const rad=Math.PI/180,deg=180/Math.PI;
const mix=(a,b,t)=>a+(b-a)*t;
export function solvePose(point,grip=1){
 const r=Math.hypot(point.x,point.z),y=point.y+toolLength-shoulderHeight;
 const c=Math.max(-1,Math.min(1,(r*r+y*y-upper*upper-forearm*forearm)/(2*upper*forearm)));
 const elbow=-Math.acos(c),angle=Math.atan2(y,r)-Math.atan2(forearm*Math.sin(elbow),upper+forearm*Math.cos(elbow));
 return {base:Math.atan2(-point.z,point.x)*deg,shoulder:angle*deg-90,elbow:elbow*deg,wrist:0,pitch:0,roll:0,toolAngle:-180,grip};
}
export function jointPositions(pose){
 const b=pose.base*rad,s=pose.shoulder*rad,e=(pose.shoulder+pose.elbow)*rad,a=(pose.toolAngle??-180)*rad;
 const point=(r,y)=>({x:r*Math.cos(b),y,z:-r*Math.sin(b)});
 const r1=-Math.sin(s)*upper,y1=shoulderHeight+Math.cos(s)*upper;
 const r2=r1-Math.sin(e)*forearm,y2=y1+Math.cos(e)*forearm;
 const wrist=point(r2,y2),tip=point(r2-Math.sin(a)*toolLength,y2+Math.cos(a)*toolLength);
 return {base:point(0,.1),shoulder:point(0,shoulderHeight),elbow:point(r1,y1),wrist,tip};
}
export function createProgram(){
 let time=0,transfers=0,running=false,completed=false,from={...BAY_A},to={...BAY_B};
 const segments=[
  {duration:1.2,label:'Approach box',target:()=>({...from,y:1.3}),grip:1},
  {duration:1.4,label:'Lower to pick',target:()=>from,grip:1},
  {duration:.8,label:'Close gripper',target:()=>from,grip:0},
  {duration:1.4,label:'Lift box',target:()=>({...from,y:1.3}),grip:0},
  {duration:2.4,label:'Transfer box',target:()=>({...to,y:1.3}),grip:0},
  {duration:1.4,label:'Lower to place',target:()=>to,grip:0},
  {duration:.8,label:'Open gripper',target:()=>to,grip:1},
  {duration:1.2,label:'Clear the box',target:()=>({...to,y:1.3}),grip:1},
  {duration:1.4,label:'Return home',target:()=>HOME,grip:1}
 ];
 const duration=segments.reduce((n,s)=>n+s.duration,0);
 function sample(){
  let start=0,previous=HOME,previousGrip=1,index=0,t=0,point=HOME,grip=1;
  for(index=0;index<segments.length;index++){
   const s=segments[index],target=s.target();
   if(time<=start+s.duration||index===segments.length-1){
    t=Math.max(0,Math.min(1,(time-start)/s.duration));const eased=t*t*(3-2*t);
    point={x:mix(previous.x,target.x,eased),y:mix(previous.y,target.y,eased),z:mix(previous.z,target.z,eased)};
    grip=mix(previousGrip,s.grip,eased);break;
   }
   start+=s.duration;previous=target;previousGrip=s.grip;
  }
  const attached=index>=3&&index<=5;
  const placed=index>=6;
  return {time,duration,transfers,running,completed,phase:completed?'Transfer complete':time===0?'Ready to pick':segments[index].label,index,grip,attached,point,pose:solvePose(point,grip),box:attached?{...point}:placed?{...to}:{...from},from:{...from},to:{...to}};
 }
 return {
  start(){if(completed){[from,to]=[to,from];time=0;completed=false;}running=true;return sample();},
  stop(){running=false;return sample();},
  reset(){time=0;transfers=0;running=false;completed=false;from={...BAY_A};to={...BAY_B};return sample();},
  tick(dt,speed=1){if(running){time=Math.min(duration,time+Math.max(0,dt)*Math.max(0,speed));if(time>=duration){running=false;completed=true;transfers++;}}return sample();},
  sample
 };
}
