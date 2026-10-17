import test from "node:test"; import assert from "node:assert/strict";
import { EventBus, CommandBus, StateMachine, Router, TokenBucket, MemoryCache, Workflow } from "../src/index.js";

test("event bus publishes and unsubscribes", async()=>{const bus=new EventBus();let n=0;const off=bus.on<number>("x",v=>{n+=v});await bus.emit("x",2);off();await bus.emit("x",2);assert.equal(n,2)});
test("command bus dispatches",async()=>{const bus=new CommandBus();bus.register("x",{execute:({data})=>data});assert.equal(await bus.execute("x",{data:7}),7)});
test("state machine validates transitions",()=>{const s=new StateMachine();assert.equal(s.current(),"created");s.transition("starting");assert.equal(s.can("running"),true);assert.throws(()=>s.transition("stopped"))});
test("router dispatches exact route",async()=>{const r=new Router().add({method:"GET",path:"/health",handler:()=>({status:200,body:{ok:true}})});assert.equal((await r.handle({method:"GET",path:"/health",headers:{}})).status,200)});
test("cache expires",async()=>{const c=new MemoryCache<number>();c.set("x",1,5);assert.equal(c.get("x"),1);await new Promise(r=>setTimeout(r,10));assert.equal(c.get("x"),undefined)});
test("workflow runs in order",async()=>{const w=new Workflow<number>().add({id:"a",run:x=>x+1}).add({id:"b",run:x=>x*2});assert.equal(await w.run(2),6)});
test("rate limiter rejects excess",()=>{const b=new TokenBucket(1,0.001);assert.equal(b.consume().allowed,true);assert.equal(b.consume().allowed,false)});
