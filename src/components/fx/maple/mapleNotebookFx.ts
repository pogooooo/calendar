import { Swarm, count, group, rand, type FxContext, type FxModule, type Particle } from '../engine';

/** Small ink blooms and paper dust, scoped to the notebook calendar. */
const pigment = (ctx:FxContext) => ctx.texture('notebook-pigment',(g,s)=>{
    const c=s/2,gradient=g.createRadialGradient(c,c,0,c,c,c);
    gradient.addColorStop(0,'rgba(255,255,255,.7)');
    gradient.addColorStop(.42,'rgba(255,255,255,.3)');
    gradient.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gradient;g.fillRect(0,0,s,s);
},64);

const ink = (ctx:FxContext):[number,number,number] => ctx.dark ? [.72,.43,.29] : [.52,.22,.13];

function bloom(ctx:FxContext,erase=false) {
    const r=ctx.rect,x=ctx.hasRect?r.x+r.w*.5:ctx.x,y=ctx.hasRect?r.y+Math.min(r.h*.5,20):ctx.y;
    const mark:Particle={x,y,vx:0,vy:0,size:34,sx:1.35,sy:.25,life:.55,tint:ink(ctx),alpha:k=>(1-k)*.28,scale:k=>.65+k*.5};
    const dust=Array.from({length:count(ctx,4)},():Particle=>({x:x+rand(-9,9),y:y+rand(-3,3),vx:rand(-10,10),vy:erase?rand(4,12):rand(-12,-4),drag:1.8,size:rand(2,4),life:rand(.45,.75),tint:ink(ctx),alpha:k=>(1-k)*.4}));
    return group(new Swarm(ctx,pigment(ctx),[mark]),new Swarm(ctx,pigment(ctx),dust));
}

const mod:FxModule={effects:{
    'calendar-pick':ctx=>bloom(ctx),
    'month-flip':(ctx,event)=>{
        const r=ctx.rect,dir=event.direction??1;
        return new Swarm(ctx,pigment(ctx),Array.from({length:count(ctx,8)},():Particle=>({
            x:dir>0?r.x+r.w:r.x,y:r.y+rand(.1,.8)*r.h,vx:-dir*rand(80,170),vy:rand(-9,9),drag:1.9,
            size:rand(2,5),life:rand(.45,.85),delay:rand(0,.15),tint:ink(ctx),alpha:k=>Math.sin(k*Math.PI)*.28,
        })));
    },
    page:()=>null,
    theme:()=>null,
    complete:ctx=>bloom(ctx),
    add:ctx=>bloom(ctx),
    drop:ctx=>bloom(ctx),
    advance:ctx=>bloom(ctx),
    sticker:ctx=>bloom(ctx),
    remove:ctx=>bloom(ctx,true),
}};
export default mod;
