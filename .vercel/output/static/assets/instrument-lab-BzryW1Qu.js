import{a as e,i as t,n,r}from"./index-DR9GT3VN.js";var i=e(t(),1);function a(e){let t=e.cores??4,n=e.memoryGb??null;return e.swiftShader||n!==null&&n<=2||t<=2?`low`:t>=8&&(n===null||n>=8)?`high`:`mid`}function o(e={}){let t=e.devicePixelRatio;return{webgpu:e.webgpu===!0,webgl2:e.webgl2===!0,reducedMotion:e.reducedMotion===!0,devicePixelRatio:typeof t==`number`&&t>0?t:1,coarsePointer:e.coarsePointer===!0,tier:a(e),cores:e.cores&&e.cores>0?e.cores:4,memoryGb:e.memoryGb??null,swiftShader:e.swiftShader===!0}}function s(){if(typeof window>`u`)return o({});let e=!1,t=!1;try{let n=document.createElement(`canvas`).getContext(`webgl2`);if(n){e=!0;let r=n.getExtension(`WEBGL_debug_renderer_info`),i=r?String(n.getParameter(r.UNMASKED_RENDERER_WEBGL)??``):``;t=/swiftshader|llvmpipe|softpipe/i.test(i),n.getExtension(`WEBGL_lose_context`)?.loseContext()}}catch{e=!1}let n=navigator,r=window.matchMedia?.(`(prefers-reduced-motion: reduce)`),i=window.matchMedia?.(`(pointer: coarse)`);return o({webgpu:`gpu`in navigator,webgl2:e,reducedMotion:r?.matches===!0,devicePixelRatio:window.devicePixelRatio,coarsePointer:i?.matches===!0,cores:navigator.hardwareConcurrency,memoryGb:typeof n.deviceMemory==`number`?n.deviceMemory:null,swiftShader:t})}function c(e,t,n){let r=0;for(let i of t)r+=i.amp*Math.sin(i.freq*e*Math.PI*2+i.phase+n);return .5+r*.42}function l(e){let t=[],n=Math.max(0,Math.floor(e));for(let e=0;e<n;e++)t.push({x:n===1?.5:e/(n-1),y:.5,vy:0,trail:[]});return t}function u(e,t,n,r){let i=Math.min(Math.max(t,0),.05);if(i!==0)for(let t of e){let e=(c(t.x,n,r)-t.y)*14-t.vy*5;t.vy+=e*i,t.y+=t.vy*i,t.x+=.07*i,t.x>1&&--t.x,t.trail.push(t.x,t.y),t.trail.length>12&&t.trail.splice(0,t.trail.length-12)}}var d=[`AUTO`,`LOW`,`MEDIUM`,`HIGH`,`ULTRA`],f=`proof-arcade-fidelity`;function p(){return typeof localStorage>`u`?null:localStorage}function m(e=p()){let t=e?.getItem(f);return t===`AUTO`||t===`LOW`||t===`MEDIUM`||t===`HIGH`||t===`ULTRA`?t:`AUTO`}function h(e,t=p()){try{t?.setItem(f,e)}catch{}}function g(e,t){return!t.webgl2&&!t.webgpu||e===`LOW`?`SAFE`:e===`MEDIUM`?t.webgl2||t.webgpu?`STANDARD`:`SAFE`:e===`HIGH`?t.webgl2||t.webgpu?`ENHANCED`:`SAFE`:e===`ULTRA`?t.webgpu?`ULTRA`:t.webgl2?`ENHANCED`:`SAFE`:t.reducedMotion||t.tier===`low`?`SAFE`:t.tier===`high`&&t.webgpu?`ULTRA`:t.tier===`high`&&t.webgl2?`ENHANCED`:t.webgl2||t.webgpu?`STANDARD`:`SAFE`}function _(e,t){return e===`ULTRA`&&t.webgpu?`webgpu`:e!==`SAFE`&&(t.webgl2||t.webgpu)?t.webgl2?`webgl2`:`webgpu`:`canvas`}function v(e,t){return t?e===`SAFE`?0:12:e===`SAFE`?24:e===`STANDARD`?72:e===`ENHANCED`?160:280}function y(e,t,n){return Math.min(Number.isFinite(e)&&e>0?e:1,t===`SAFE`?1:t===`STANDARD`?1.25:n?1.5:2)}function b(e,t){let n=g(e,t);return{choice:e,mode:n,backend:_(n,t),particles:v(n,t.reducedMotion),dpr:y(t.devicePixelRatio,n,t.coarsePointer)}}function x(e){return e.avgFps>=50&&e.p95Ms<=34?`clear`:`miss`}function S(e){let t=e.adapter===`acquired`&&e.device===`acquired`&&e.shader===`compiled`&&e.pipeline===`created`;return e.actual===`webgpu`?t?`pass`:`fail`:t?`fail`:e.actual===`webgl2`||e.actual===`canvas`?`pass`:`fail`}function C(e){if(e.length===0)return{avgFps:0,p50Ms:0,p95Ms:0,frames:0};let t=[...e].sort((e,t)=>e-t),n=e.reduce((e,t)=>e+t,0),r=e=>t[Math.min(t.length-1,Math.max(0,Math.floor(e*(t.length-1))))]*1e3;return{avgFps:n>0?e.length/n:0,p50Ms:r(.5),p95Ms:r(.95),frames:e.length}}var w=[.027,.031,.051],T=280,E=T*5*4;function D(e,t,n){return{width:Math.max(1,Math.floor(e*n)),height:Math.max(1,Math.floor(t*n))}}function O(e,t,n,r){let i=D(t,n,r);return(e.width!==i.width||e.height!==i.height)&&(e.width=i.width,e.height=i.height),i}function k(e,t){return e[t]??{amp:0,freq:1,phase:0}}function A(e,t){let n=e.getContext(`2d`);if(!n)throw Error(`canvas`);let r=1;return{backend:`canvas`,receipt:t,resize(t,n,i){r=i,O(e,t,n,i)},draw(t){let i=e.width,a=e.height;n.setTransform(1,0,0,1,0,0),n.globalAlpha=1,n.fillStyle=`#07080d`,n.fillRect(0,0,i,a),n.strokeStyle=`rgba(228,177,90,0.18)`,n.lineWidth=Math.max(1,r),n.beginPath();for(let e=0;e<=16;e++){let t=e/16*i;n.moveTo(t,0),n.lineTo(t,a)}for(let e=0;e<=9;e++){let t=e/9*a;n.moveTo(0,t),n.lineTo(i,t)}n.stroke();let o=(e,t,o)=>{n.beginPath(),n.strokeStyle=e,n.lineWidth=t*r;for(let e=0;e<=160;e++){let t=e/160,r=t*i,s=(1-o(t))*a;e===0?n.moveTo(r,s):n.lineTo(r,s)}n.stroke()};o(`rgba(143,208,176,0.9)`,1.5,e=>c(e,[k(t.waves,0)],t.time)),o(`rgba(228,177,90,0.85)`,1.5,e=>c(e,[k(t.waves,1)],t.time)),o(`#f4efe4`,2.2,e=>c(e,t.waves,t.time)),n.lineWidth=r,n.strokeStyle=`rgba(228,177,90,0.4)`,n.fillStyle=`#e4b15a`;for(let e of t.particles){n.beginPath();for(let t=0;t<e.trail.length;t+=2){let r=e.trail[t]*i,o=(1-e.trail[t+1])*a;t===0?n.moveTo(r,o):n.lineTo(r,o)}n.stroke(),n.beginPath(),n.arc(e.x*i,(1-e.y)*a,2.5*r,0,Math.PI*2),n.fill()}},destroy(){}}}var j=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,M=`#version 300 es
precision highp float;
in vec2 vUv;
uniform float uTime;
uniform float uAmp1;
uniform float uFreq1;
uniform float uPhase1;
uniform float uAmp2;
uniform float uFreq2;
uniform float uPhase2;
out vec4 outColor;
float tone(float x, float amp, float freq, float phase) {
  return amp * sin(freq * x * 6.28318530718 + phase + uTime);
}
void main() {
  float s1 = tone(vUv.x, uAmp1, uFreq1, uPhase1);
  float s2 = tone(vUv.x, uAmp2, uFreq2, uPhase2);
  float y1 = 0.5 + s1 * 0.42;
  float y2 = 0.5 + s2 * 0.42;
  float ys = 0.5 + (s1 + s2) * 0.42;
  float gx = min(fract(vUv.x * 16.0), 1.0 - fract(vUv.x * 16.0));
  float gy = min(fract(vUv.y * 9.0), 1.0 - fract(vUv.y * 9.0));
  float grid = 1.0 - smoothstep(0.0, 0.02, min(gx, gy));
  float d1 = abs(vUv.y - y1);
  float d2 = abs(vUv.y - y2);
  float ds = abs(vUv.y - ys);
  float w1 = 1.0 - smoothstep(0.0, 0.008, d1);
  float w2 = 1.0 - smoothstep(0.0, 0.008, d2);
  float ws = 1.0 - smoothstep(0.0, 0.012, ds);
  float glow = exp(-ds * ds * 900.0) * 0.28;
  vec3 col = vec3(0.027, 0.031, 0.051);
  col += vec3(0.894, 0.694, 0.353) * grid * 0.16;
  col += vec3(0.561, 0.816, 0.690) * (w1 + glow * 0.35);
  col += vec3(0.894, 0.694, 0.353) * w2;
  col += vec3(0.957, 0.937, 0.894) * (ws + glow);
  outColor = vec4(col, 1.0);
}`,N=`#version 300 es
in vec2 aCorner;
in vec2 aCenter;
uniform float uSize;
void main() {
  vec2 p = vec2(aCenter.x * 2.0 - 1.0, aCenter.y * 2.0 - 1.0) + aCorner * uSize;
  gl_Position = vec4(p, 0.0, 1.0);
}`,P=`#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(0.894, 0.694, 0.353, 0.95);
}`,F=`#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos.x * 2.0 - 1.0, aPos.y * 2.0 - 1.0, 0.0, 1.0);
}`,I=`#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(0.894, 0.694, 0.353, 0.45);
}`;function L(e,t,n){let r=e.createShader(t);if(!r)throw Error(`shader`);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r);throw e.deleteShader(r),Error(t||`shader`)}return r}function R(e,t,n){let r=e.createProgram();if(!r)throw Error(`program`);let i=L(e,e.VERTEX_SHADER,t),a=L(e,e.FRAGMENT_SHADER,n);if(e.attachShader(r,i),e.attachShader(r,a),e.linkProgram(r),e.deleteShader(i),e.deleteShader(a),!e.getProgramParameter(r,e.LINK_STATUS)){let t=e.getProgramInfoLog(r);throw e.deleteProgram(r),Error(t||`link`)}return r}function z(e,t){let n=null;try{if(n=e.getContext(`webgl2`,{alpha:!1,antialias:!1,powerPreference:`high-performance`}),!n)return null;let r=R(n,j,M),i=R(n,N,P),a=R(n,F,I),o=n.createBuffer(),s=n.createBuffer(),c=n.createBuffer(),l=n.createBuffer();if(!o||!s||!c||!l)return n.getExtension(`WEBGL_lose_context`)?.loseContext(),null;n.bindBuffer(n.ARRAY_BUFFER,o),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW),n.bindBuffer(n.ARRAY_BUFFER,s),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),n.STATIC_DRAW);let u=n.getAttribLocation(r,`aPos`),d=n.getAttribLocation(i,`aCorner`),f=n.getAttribLocation(i,`aCenter`),p=n.getAttribLocation(a,`aPos`),m={time:n.getUniformLocation(r,`uTime`),amp1:n.getUniformLocation(r,`uAmp1`),freq1:n.getUniformLocation(r,`uFreq1`),phase1:n.getUniformLocation(r,`uPhase1`),amp2:n.getUniformLocation(r,`uAmp2`),freq2:n.getUniformLocation(r,`uFreq2`),phase2:n.getUniformLocation(r,`uPhase2`),size:n.getUniformLocation(i,`uSize`)},h=!0,g=new Float32Array(E),_=new Float32Array(T*2);return{backend:`webgl2`,receipt:t,resize(t,r,i){O(e,t,r,i),n?.viewport(0,0,e.width,e.height)},draw(t){if(!h||!n)return;n.viewport(0,0,e.width,e.height),n.disable(n.BLEND),n.useProgram(r),n.bindBuffer(n.ARRAY_BUFFER,o),n.enableVertexAttribArray(u),n.vertexAttribPointer(u,2,n.FLOAT,!1,0,0);let v=k(t.waves,0),y=k(t.waves,1);n.uniform1f(m.time,t.time),n.uniform1f(m.amp1,v.amp),n.uniform1f(m.freq1,v.freq),n.uniform1f(m.phase1,v.phase),n.uniform1f(m.amp2,y.amp),n.uniform1f(m.freq2,y.freq),n.uniform1f(m.phase2,y.phase),n.drawArrays(n.TRIANGLES,0,3);let b=Math.min(t.particles.length,T);if(b===0)return;let x=0;for(let e=0;e<b;e++){let n=t.particles[e];_[e*2]=n.x,_[e*2+1]=n.y;for(let e=2;e<n.trail.length&&!(x+4>g.length);e+=2)g[x++]=n.trail[e-2],g[x++]=n.trail[e-1],g[x++]=n.trail[e],g[x++]=n.trail[e+1]}n.enable(n.BLEND),n.blendFunc(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA),x>0&&(n.useProgram(a),n.bindBuffer(n.ARRAY_BUFFER,l),n.bufferData(n.ARRAY_BUFFER,g.subarray(0,x),n.DYNAMIC_DRAW),n.enableVertexAttribArray(p),n.vertexAttribPointer(p,2,n.FLOAT,!1,0,0),n.drawArrays(n.LINES,0,x/2)),n.useProgram(i),n.uniform1f(m.size,.012),n.bindBuffer(n.ARRAY_BUFFER,s),n.enableVertexAttribArray(d),n.vertexAttribPointer(d,2,n.FLOAT,!1,0,0),n.vertexAttribDivisor(d,0),n.bindBuffer(n.ARRAY_BUFFER,c),n.bufferData(n.ARRAY_BUFFER,_.subarray(0,b*2),n.DYNAMIC_DRAW),n.enableVertexAttribArray(f),n.vertexAttribPointer(f,2,n.FLOAT,!1,0,0),n.vertexAttribDivisor(f,1),n.drawArraysInstanced(n.TRIANGLES,0,6,b),n.vertexAttribDivisor(f,0)},destroy(){h=!1,n?.deleteProgram(r),n?.deleteProgram(i),n?.deleteProgram(a),n?.deleteBuffer(o),n?.deleteBuffer(s),n?.deleteBuffer(c),n?.deleteBuffer(l),n?.getExtension(`WEBGL_lose_context`)?.loseContext()}}}catch(e){return console.error(`[proof-arcade] WebGL2 fell back`,e),n?.getExtension(`WEBGL_lose_context`)?.loseContext(),null}}var B=`
struct Uni {
  time: f32,
  amp1: f32,
  freq1: f32,
  phase1: f32,
  amp2: f32,
  freq2: f32,
  phase2: f32,
  reduced: f32,
}
@group(0) @binding(0) var<uniform> u: Uni;

struct BgOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vsBg(@builtin(vertex_index) index: u32) -> BgOut {
  var positions = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var out: BgOut;
  out.pos = vec4f(positions[index], 0.0, 1.0);
  out.uv = positions[index] * 0.5 + 0.5;
  return out;
}

fn tone(x: f32, amp: f32, freq: f32, phase: f32) -> f32 {
  return amp * sin(freq * x * 6.28318530718 + phase + u.time);
}

@fragment
fn fsBg(in: BgOut) -> @location(0) vec4f {
  let s1 = tone(in.uv.x, u.amp1, u.freq1, u.phase1);
  let s2 = tone(in.uv.x, u.amp2, u.freq2, u.phase2);
  let y1 = 0.5 + s1 * 0.42;
  let y2 = 0.5 + s2 * 0.42;
  let ys = 0.5 + (s1 + s2) * 0.42;
  let gx = min(fract(in.uv.x * 16.0), 1.0 - fract(in.uv.x * 16.0));
  let gy = min(fract(in.uv.y * 9.0), 1.0 - fract(in.uv.y * 9.0));
  let grid = 1.0 - smoothstep(0.0, 0.02, min(gx, gy));
  let ds = abs(in.uv.y - ys);
  let w1 = 1.0 - smoothstep(0.0, 0.008, abs(in.uv.y - y1));
  let w2 = 1.0 - smoothstep(0.0, 0.008, abs(in.uv.y - y2));
  let ws = 1.0 - smoothstep(0.0, 0.012, ds);
  let glow = exp(-ds * ds * 900.0) * 0.28;
  var col = vec3f(0.027, 0.031, 0.051);
  col += vec3f(0.894, 0.694, 0.353) * grid * 0.16;
  col += vec3f(0.561, 0.816, 0.690) * (w1 + glow * 0.35);
  col += vec3f(0.894, 0.694, 0.353) * w2;
  col += vec3f(0.957, 0.937, 0.894) * (ws + glow);
  return vec4f(col, 1.0);
}

@vertex
fn vsMark(@location(0) corner: vec2f, @location(1) center: vec2f) -> @builtin(position) vec4f {
  let p = vec2f(center.x * 2.0 - 1.0, center.y * 2.0 - 1.0) + corner * 0.012;
  return vec4f(p, 0.0, 1.0);
}

@fragment
fn fsMark() -> @location(0) vec4f {
  return vec4f(0.894, 0.694, 0.353, 0.95);
}

@vertex
fn vsLine(@location(0) p: vec2f) -> @builtin(position) vec4f {
  return vec4f(p.x * 2.0 - 1.0, p.y * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fsLine() -> @location(0) vec4f {
  return vec4f(0.894, 0.694, 0.353, 0.45);
}
`;function V(e,t){return new Promise(n=>{let r=setTimeout(()=>n(null),t);e.then(e=>{clearTimeout(r),n(e)},()=>{clearTimeout(r),n(null)})})}async function H(e,t){let n=navigator.gpu;if(!n)return t.adapter=`unavailable`,t.device=`skipped`,t.shader=`skipped`,t.pipeline=`skipped`,null;let r,i,a,o,s,c=!1,l=()=>{c||(c=!0,i?.destroy(),a?.destroy(),o?.destroy(),s?.destroy(),r?.destroy())};try{let c=await V(n.requestAdapter(),400);if(!c)return t.adapter=`unavailable`,t.device=`skipped`,t.shader=`skipped`,t.pipeline=`skipped`,null;t.adapter=`acquired`;let u=await V(c.requestDevice(),400);if(!u)return t.device=`unavailable`,t.shader=`skipped`,t.pipeline=`skipped`,null;t.device=`acquired`,r=u;let d=n.getPreferredCanvasFormat(),f=r.createShaderModule({code:B}),p=await f.getCompilationInfo();if(p.messages.some(e=>e.type===`error`))return t.shader=`error`,t.pipeline=`skipped`,console.error(`[proof-arcade] WebGPU shader fell back`,p.messages),l(),null;t.shader=`compiled`;let m=r.createRenderPipeline({layout:`auto`,vertex:{module:f,entryPoint:`vsBg`},fragment:{module:f,entryPoint:`fsBg`,targets:[{format:d}]},primitive:{topology:`triangle-list`}}),h={color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}},g=r.createRenderPipeline({layout:`auto`,vertex:{module:f,entryPoint:`vsMark`,buffers:[{arrayStride:8,attributes:[{shaderLocation:0,offset:0,format:`float32x2`}]},{arrayStride:8,stepMode:`instance`,attributes:[{shaderLocation:1,offset:0,format:`float32x2`}]}]},fragment:{module:f,entryPoint:`fsMark`,targets:[{format:d,blend:h}]},primitive:{topology:`triangle-list`}}),_=r.createRenderPipeline({layout:`auto`,vertex:{module:f,entryPoint:`vsLine`,buffers:[{arrayStride:8,attributes:[{shaderLocation:0,offset:0,format:`float32x2`}]}]},fragment:{module:f,entryPoint:`fsLine`,targets:[{format:d,blend:h}]},primitive:{topology:`line-list`}});t.pipeline=`created`,i=r.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});let v=i,y=r.createBindGroup({layout:m.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:v}}]});a=r.createBuffer({size:48,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});let b=a;r.queue.writeBuffer(b,0,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1])),o=r.createBuffer({size:T*8,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),s=r.createBuffer({size:E*4,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});let x=o,S=s,C=r,D=e.getContext(`webgpu`);if(!D)return t.pipeline=`error`,l(),null;D.configure({device:C,format:d,alphaMode:`opaque`});let A=new Float32Array(T*2),j=new Float32Array(E),M=!0;return t.actual=`webgpu`,{backend:`webgpu`,receipt:t,resize(t,n,r){O(e,t,n,r)},draw(t){if(!M||e.width<1||e.height<1)return;let n=k(t.waves,0),r=k(t.waves,1);C.queue.writeBuffer(v,0,new Float32Array([t.time,n.amp,n.freq,n.phase,r.amp,r.freq,r.phase,+!!t.reducedMotion]));let i=Math.min(t.particles.length,T),a=0;for(let e=0;e<i;e++){let n=t.particles[e];A[e*2]=n.x,A[e*2+1]=n.y;for(let e=2;e<n.trail.length&&!(a+4>j.length);e+=2)j[a++]=n.trail[e-2],j[a++]=n.trail[e-1],j[a++]=n.trail[e],j[a++]=n.trail[e+1]}a>0&&C.queue.writeBuffer(S,0,j.subarray(0,a)),i>0&&C.queue.writeBuffer(x,0,A.subarray(0,i*2));let o=C.createCommandEncoder(),s=D.getCurrentTexture().createView(),c=o.beginRenderPass({colorAttachments:[{view:s,clearValue:{r:w[0],g:w[1],b:w[2],a:1},loadOp:`clear`,storeOp:`store`}]});c.setPipeline(m),c.setBindGroup(0,y),c.draw(3),a>0&&(c.setPipeline(_),c.setVertexBuffer(0,S),c.draw(a/2)),i>0&&(c.setPipeline(g),c.setVertexBuffer(0,b),c.setVertexBuffer(1,x),c.draw(6,i)),c.end(),C.queue.submit([o.finish()])},destroy(){M=!1,l()}}}catch(e){return t.shader===`compiled`?t.pipeline=`error`:t.shader=`error`,console.error(`[proof-arcade] WebGPU fell back`,e),l(),null}}function U(e){let t=document.createElement(`canvas`);return t.setAttribute(`aria-hidden`,`true`),t.style.display=`block`,t.style.width=`100%`,t.style.height=`100%`,e.replaceChildren(t),t}async function W(e,t){let n={requested:t,actual:`canvas`,adapter:t===`webgpu`?`unavailable`:`skipped`,device:t===`webgpu`?`unavailable`:`skipped`,shader:`skipped`,pipeline:`skipped`};if(t===`webgpu`){let t=await H(U(e),n);if(t)return t;console.info(`[proof-arcade] WebGPU unavailable, using WebGL2`)}if(t!==`canvas`){let t=z(U(e),n);if(t)return n.actual=`webgl2`,t;console.info(`[proof-arcade] WebGL2 unavailable, using page drawing`)}try{return n.actual=`canvas`,A(U(e),n)}catch(e){return console.error(`[proof-arcade] page drawing unavailable`,e),n.actual=`canvas`,{backend:`canvas`,receipt:n,resize(){},draw(){},destroy(){}}}}var G=r(),K=[{amp:.35,freq:2,phase:0},{amp:.22,freq:3,phase:1}];function q(e){return e===`webgpu`?`WebGPU`:e===`webgl2`?`WebGL2`:`page drawing`}function J(e,t,n){let r=`This screen is using ${q(e)}.`;return t===`ULTRA`&&e!==`webgpu`&&(r+=` Ultra needs WebGPU, so this screen stepped down.`),n&&(r+=` Motion is reduced, so the curves stay put until a control changes.`),r}function Y(e){let t=`adapter ${e.adapter} · device ${e.device} · shader ${e.shader} · pipeline ${e.pipeline}`,n=S(e),r=`Init fail. The reported path does not match the facts.`;return n===`pass`&&e.actual===`webgpu`?r=`Init pass. Adapter, device, shader, and pipelines all came from this visit.`:n===`pass`&&e.requested===`webgpu`?r=`Init pass. WebGPU did not finish, so the fallback is honest. Those facts were not filled in.`:n===`pass`&&(r=`Init pass. This visit is using the drawing path it asked for.`),`Requested ${q(e.requested)}. Actual ${q(e.actual)}. ${t}. ${r}`}function X({onExit:e}){let t=(0,i.useRef)(null),r=(0,i.useRef)(K.map(e=>({...e}))),a=(0,i.useRef)(null),[o,f]=(0,i.useState)(()=>r.current.map(e=>({...e}))),[p,g]=(0,i.useState)(`AUTO`),[_,v]=(0,i.useState)(!1),[y,S]=(0,i.useState)(`Choosing a drawing mode for this device.`),[w,T]=(0,i.useState)(null),[E,D]=(0,i.useState)(!1),[O,k]=(0,i.useState)(null);(0,i.useEffect)(()=>{g(m()),v(!0)},[]),(0,i.useEffect)(()=>{if(!_)return;let e=t.current;if(!e)return;let n=!1,i=0,o=null,d=s(),f=b(p,d),m=l(f.particles),h=0,g=performance.now();D(!0),k(null),T(null),a.current=null;let v=()=>{if(!o)return;let t=e.getBoundingClientRect();o.resize(Math.max(t.width,1),Math.max(t.height,1),f.dpr)},y=new ResizeObserver(v),x=t=>{if(i=requestAnimationFrame(x),!o||document.hidden){let e=a.current;e&&(e.until+=Math.max(0,t-g)),g=t;return}let n=Math.min(.05,Math.max(0,(t-g)/1e3));g=t;let s=r.current;if(d.reducedMotion)for(let e of m)e.y=c(e.x,s,h),e.vy=0,e.trail=[];else h+=n,u(m,n,s,h);o.draw({time:h,waves:s,particles:m,reducedMotion:d.reducedMotion});let l=a.current;if(!l||(l.dts.push(n),t<l.until))return;let p=e.querySelector(`canvas`),_=C(l.dts);a.current=null,D(!1),k({backend:o.backend,avgFps:_.avgFps,p50Ms:_.p50Ms,p95Ms:_.p95Ms,frames:_.frames,particles:m.length,width:p?.width??0,height:p?.height??0,dpr:f.dpr})};return W(e,f.backend).then(t=>{if(n){t.destroy();return}o=t,T(t.receipt),S(J(t.backend,p,d.reducedMotion)),a.current={dts:[],until:performance.now()+3e3},v(),y.observe(e),i=requestAnimationFrame(x)}),()=>{n=!0,cancelAnimationFrame(i),y.disconnect(),o?.destroy(),e.replaceChildren(),a.current=null}},[p,_]);function A(e){h(e),g(e)}function j(e,t,n){let i=r.current.map((r,i)=>i===e?{...r,[t]:n}:r);r.current=i,f(i)}function M(){k(null),D(!0),a.current={dts:[],until:performance.now()+3e3}}let N=`Wave bench. Wave A amplitude ${o[0].amp.toFixed(2)}, frequency ${o[0].freq.toFixed(1)}, phase ${o[0].phase.toFixed(2)}. Wave B amplitude ${o[1].amp.toFixed(2)}, frequency ${o[1].freq.toFixed(1)}, phase ${o[1].phase.toFixed(2)}. The cream curve is their sum.`;return(0,G.jsxs)(`main`,{className:`relative flex h-dvh flex-col overflow-hidden bg-ink text-cream`,children:[(0,G.jsxs)(`header`,{className:`flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6`,children:[(0,G.jsxs)(`div`,{children:[(0,G.jsx)(`p`,{className:`font-mono text-xs tracking-widest text-gold`,children:`INSTRUMENT LAB`}),(0,G.jsx)(`h1`,{className:`text-2xl font-extrabold tracking-tight`,children:`Wave bench`})]}),e?(0,G.jsx)(`button`,{type:`button`,onClick:e,className:`inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-gold`,children:`Floor`}):(0,G.jsx)(n,{to:`/`,className:`inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-gold`,children:`Floor`})]}),(0,G.jsx)(`div`,{className:`relative h-1/2 min-h-40 shrink-0`,children:(0,G.jsx)(`div`,{ref:t,className:`absolute inset-0`,role:`img`,"aria-label":N})}),(0,G.jsxs)(`section`,{className:`min-h-0 flex-1 overflow-y-auto border-t border-line bg-ink px-4 py-3 sm:px-6`,children:[(0,G.jsx)(`p`,{className:`text-sm leading-relaxed text-mist`,"aria-live":`polite`,children:y}),(0,G.jsx)(`p`,{className:`mt-1 font-mono text-xs leading-relaxed text-cream`,"aria-live":`polite`,children:w?Y(w):`Reading the drawing path from this device.`}),(0,G.jsx)(`p`,{className:`mt-1 font-mono text-xs text-cream`,children:`sum = A sin(2π fA x + φA) + B sin(2π fB x + φB)`}),(0,G.jsx)(`div`,{className:`mt-3 flex gap-2 overflow-x-auto pb-1`,role:`group`,"aria-label":`Drawing fidelity`,children:d.map(e=>(0,G.jsx)(`button`,{type:`button`,"aria-pressed":p===e,onClick:()=>A(e),className:p===e?`min-h-11 shrink-0 rounded-full bg-gold px-3 text-xs font-extrabold text-ink`:`min-h-11 shrink-0 rounded-full border border-line bg-panel px-3 text-xs font-bold text-mist`,children:e},e))}),(0,G.jsxs)(`div`,{className:`mt-3 grid gap-4 sm:grid-cols-2`,children:[(0,G.jsx)(Z,{title:`Wave A`,tone:`text-mint`,wave:o[0],onChange:(e,t)=>j(0,e,t)}),(0,G.jsx)(Z,{title:`Wave B`,tone:`text-gold`,wave:o[1],onChange:(e,t)=>j(1,e,t)})]}),(0,G.jsx)(`p`,{className:`mt-3 text-sm text-mist`,children:`Peaks that meet grow. Peaks that oppose cancel. The cream curve is that sum.`}),(0,G.jsxs)(`div`,{className:`mt-3 flex flex-wrap items-center gap-3`,children:[(0,G.jsx)(`button`,{type:`button`,onClick:M,disabled:E,className:`min-h-11 rounded-full bg-gold px-4 text-sm font-extrabold text-ink disabled:opacity-60`,children:E?`Measuring…`:`Measure this device`}),(0,G.jsx)(`p`,{className:`text-xs text-mist`,children:`The check stays on this device. Nothing is sent.`})]}),(0,G.jsx)(`p`,{className:`mt-2 font-mono text-xs leading-relaxed text-cream`,"aria-live":`polite`,children:E&&!O?`Measuring…`:O?`${q(O.backend)} · ${O.avgFps.toFixed(1)} fps average · p50 ${O.p50Ms.toFixed(2)} ms · p95 ${O.p95Ms.toFixed(2)} ms · ${O.frames} frames · ${O.particles} particles · ${O.width}×${O.height} px · dpr ${O.dpr}. ${x(O)===`clear`?`This visit cleared the bench: at least 50 fps average and a p95 under 34 ms.`:`This visit missed the bench. Drop fidelity if the picture stutters. A clear visit is at least 50 fps average and a p95 under 34 ms.`}`:`Not measured on this visit. A clear visit is at least 50 fps average and a p95 under 34 ms.`})]})]})}function Z({title:e,tone:t,wave:n,onChange:r}){return(0,G.jsxs)(`fieldset`,{className:`min-w-0`,children:[(0,G.jsx)(`legend`,{className:`font-mono text-xs tracking-widest ${t}`,children:e}),(0,G.jsx)(Q,{label:`Amplitude`,min:0,max:.55,step:.01,value:n.amp,digits:2,onChange:e=>r(`amp`,e)}),(0,G.jsx)(Q,{label:`Frequency`,min:1,max:6,step:1,value:n.freq,digits:0,onChange:e=>r(`freq`,e)}),(0,G.jsx)(Q,{label:`Phase`,min:0,max:6.28,step:.01,value:n.phase,digits:2,onChange:e=>r(`phase`,e)})]})}function Q({label:e,min:t,max:n,step:r,value:i,digits:a,onChange:o}){return(0,G.jsxs)(`label`,{className:`mt-2 flex min-h-11 items-center gap-3 text-xs`,children:[(0,G.jsx)(`span`,{className:`w-24 shrink-0 font-mono tracking-widest text-mist`,children:e}),(0,G.jsx)(`input`,{type:`range`,min:t,max:n,step:r,value:i,onChange:e=>o(Number(e.target.value)),className:`h-11 min-w-0 flex-1 accent-gold`}),(0,G.jsx)(`span`,{className:`w-12 text-right font-mono text-cream`,children:i.toFixed(a)})]})}export{l as a,s as c,b as i,W as n,c as o,m as r,u as s,X as t};