import * as THREE from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/libs/meshopt_decoder.module.js';

const stages=[...document.querySelectorAll('.stage')];
if(stages.length){
  try{ const t=document.createElement('canvas'); if(!(t.getContext('webgl2')||t.getContext('webgl'))) throw 0; }catch(e){ stages.length=0; }
}
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
let modelPromise=null;
function loadModel(){
  if(!modelPromise) modelPromise=new Promise((res,rej)=>{
    const l=new GLTFLoader(); l.setMeshoptDecoder(MeshoptDecoder);
    l.load('assets/model.glb',g=>res(g.scene),undefined,rej);
  });
  return modelPromise;
}
const PAINT={ 'RAL 6029':0x2a6e48 };
function prep(scene){
  const root=new THREE.Group(); root.add(scene.clone(true));
  root.traverse(o=>{ if(o.isMesh){ const m=o.material.clone(); o.material=m;
    if(PAINT[m.name]!==undefined) m.color.setHex(PAINT[m.name]);
    m.metalness=Math.min(m.metalness||0,0.35); m.roughness=Math.max(m.roughness||0.5,0.45);
    m.side=THREE.DoubleSide; } });
  return root;
}
function setup(stage,scene){
  const old=stage.querySelector('canvas[data-turn]');
  const model=prep(scene);
  const box=new THREE.Box3().setFromObject(model), ctr=box.getCenter(new THREE.Vector3()), size=box.getSize(new THREE.Vector3());
  const pivot=new THREE.Group(); model.position.sub(ctr); pivot.add(model);
  const r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  r.setPixelRatio(Math.min(devicePixelRatio||1,2)); r.setClearColor(0x000000,0);
  const c=r.domElement; c.tabIndex=0; c.setAttribute('role','img');
  c.setAttribute('aria-label','Rotatable 3D model of the Golden Fleece module beside a transformer. Drag, or use the left and right arrow keys, to rotate.');
  c.style.cssText='width:100%;height:100%;display:block;outline:none';
  const s=new THREE.Scene(); s.add(pivot);
  s.add(new THREE.HemisphereLight(0xffffff,0x55596a,2.1));
  const k=new THREE.DirectionalLight(0xffffff,2.8); k.position.set(2,3,2.5); s.add(k);
  const rim=new THREE.DirectionalLight(0x7fb0ff,1.2); rim.position.set(-3,1.5,-2); s.add(rim);
  const cam=new THREE.PerspectiveCamera(30,1,0.05,50);
  const rad=Math.hypot(size.x,size.y,size.z)/2;
  function fit(){
    const w=stage.clientWidth||1,h=stage.clientHeight||1; r.setSize(w,h,false); cam.aspect=w/h;
    const vf=THREE.MathUtils.degToRad(cam.fov/2), hf=Math.atan(Math.tan(vf)*cam.aspect);
    const d=rad*0.88/Math.sin(Math.min(vf,hf)); cam.position.set(0,d*0.28,d); cam.lookAt(0,0,0); cam.updateProjectionMatrix(); dirty=true;
  }
  let yaw=0.7,vel=0,drag=false,sx=0,sy=0,idle=0,auto=!reduce,tilt=0.0,dirty=true,visible=true,last=0;
  const AUTO=Math.PI*2/45;               // one turn every 45 seconds
  function frame(t){
    requestAnimationFrame(frame);
    const dt=Math.min((t-last)/1000||0,0.05); last=t;
    if(!visible) return;
    if(!drag){
      if(auto){ yaw+=AUTO*dt; dirty=true; }
      else if(Math.abs(vel)>1e-4){ yaw+=vel; vel*=Math.pow(0.0008,dt); dirty=true; }
      if(!auto && !reduce){ idle+=dt; if(idle>4){ auto=true; } }
    }
    if(dirty){ pivot.rotation.y=yaw; pivot.rotation.x=tilt; r.render(s,cam); dirty=false; }
  }
  c.addEventListener('pointerdown',e=>{drag=true;auto=false;idle=0;vel=0;sx=e.clientX;sy=e.clientY;c.setPointerCapture(e.pointerId);stage.style.cursor='grabbing';});
  c.addEventListener('pointermove',e=>{ if(!drag)return; const dx=(e.clientX-sx)/c.clientWidth, dy=(e.clientY-sy)/c.clientHeight; sx=e.clientX; sy=e.clientY;
    vel=dx*Math.PI*1.6; yaw+=vel; tilt=Math.max(-0.35,Math.min(0.35,tilt+dy*0.8)); dirty=true; });
  const up=()=>{drag=false;idle=0;stage.style.cursor='';}; c.addEventListener('pointerup',up); c.addEventListener('pointercancel',up);
  c.addEventListener('keydown',e=>{ if(e.key==='ArrowLeft'||e.key==='ArrowRight'){ auto=false; idle=0; yaw+=(e.key==='ArrowLeft'?-1:1)*0.12; dirty=true; e.preventDefault(); } });
  new IntersectionObserver(en=>{visible=en[0].isIntersecting; if(visible)dirty=true;}).observe(stage);
  new ResizeObserver(fit).observe(stage);
  stage.insertBefore(c,old||stage.firstChild); fit(); r.render(s,cam);
  if(old) old.remove();
  requestAnimationFrame(frame);
}
if(stages.length) loadModel().then(sc=>stages.forEach(st=>setup(st,sc))).catch(e=>console.warn('3D viewer unavailable, using image turntable',e));
