"use strict";

const race = require("../src/race");
const sinon = require("sinon");
const assert = require("power-assert");

describe("race process",()=>{
  it("invokes race functions and return the first return of them as sencond argument of callback",(done)=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        "testfunc1",
        "testfunc2",
        "testfunc3"
      ],
      event:{
        data:"dummyData"
      }
    };

    const expectReturns = [
      "testrtn1",
      "testrtn2",
      "testrtn3"
    ];

    const callback = sinon.spy();

    const handler = race.factory(lambda);
    handler(event,null,callback);

    assert(lambda.invoke.callCount === event.functions.length);
    for(var i=0;i<event.functions.length;i++){
      const call = lambda.invoke.getCall(i);
      const invokeParam = call.args[0];
      const invokecallback = call.args[1];

      assert(invokeParam.FunctionName === event.functions[i]);
      assert.deepEqual(invokeParam.Payload,JSON.stringify(event.event));

      invokecallback(null,{Payload:expectReturns[i]});
    }

    //XXX Promise.raceの完了待ち。他になんかいい方法無いものか。。。
    setTimeout(()=>{
      assert(callback.callCount === 1);
      assert(callback.getCall(0).args[0] === null);
      assert.deepEqual(callback.getCall(0).args[1],expectReturns[0]);
      done();
    },100);
  });

  it("omits null return",(done)=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        "testfunc1",
        "testfunc2",
        "testfunc3"
      ],
      event:{
        data:"dummyData"
      }
    };

    const expectReturns = [
      null,
      null,
      "testrtn3"
    ];

    const callback = sinon.spy();

    const handler = race.factory(lambda);
    handler(event,null,callback);

    assert(lambda.invoke.callCount === event.functions.length);
    for(var i=0;i<event.functions.length;i++){
      const call = lambda.invoke.getCall(i);
      const invokeParam = call.args[0];
      const invokecallback = call.args[1];

      assert(invokeParam.FunctionName === event.functions[i]);
      assert.deepEqual(invokeParam.Payload,JSON.stringify(event.event));

      invokecallback(null,{Payload:expectReturns[i]});
    }

    //XXX Promise.raceの完了待ち。他になんかいい方法無いものか。。。
    setTimeout(()=>{
      assert(callback.callCount === 1);
      assert(callback.getCall(0).args[0] === null);
      assert.deepEqual(callback.getCall(0).args[1],expectReturns[2]);
      done();
    },100);
  });

  it("omits functions that returns error",(done)=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        "testfunc1",
        "testfunc2",
        "testfunc3"
      ],
      event:{
        data:"dummyData"
      }
    };

    const expectReturns = [
      "some error",
      "testrtn2",
      "testrtn3"
    ];

    const callback = sinon.spy();

    const handler = race.factory(lambda);
    handler(event,null,callback);

    assert(lambda.invoke.callCount === event.functions.length);
    for(var i=0;i<event.functions.length;i++){
      const call = lambda.invoke.getCall(i);
      const invokeParam = call.args[0];
      const invokecallback = call.args[1];

      assert(invokeParam.FunctionName === event.functions[i]);
      assert.deepEqual(invokeParam.Payload,JSON.stringify(event.event));

      const result = expectReturns[i];
      if(result === "some error"){
        invokecallback(result,null);
      }else{
        invokecallback(null,{Payload:result});
      }
    }

    //XXX Promise.raceの完了待ち。他になんかいい方法無いものか。。。
    setTimeout(()=>{
      assert(callback.callCount === 1);
      assert(callback.getCall(0).args[0] === null);
      assert.deepEqual(callback.getCall(0).args[1],expectReturns[1]);
      done();
    },100);
  });

  it("calls callback with error message as first argument if 'functions' dosn't exist in event object",()=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      event:{
        data:"dummyData"
      }
    };

    const callback = sinon.spy();

    const handler = race.factory(lambda);
    handler(event,null,callback);

    assert(callback.callCount === 1);
    assert(typeof callback.getCall(0).args[0] === "string");
  });

  it("calls callback with error message as first argument if 'event' dosn't exist in event object",()=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        "testfunc1",
        "testfunc2",
        "testfunc3"
      ]
    };

    const callback = sinon.spy();

    const handler = race.factory(lambda);
    handler(event,null,callback);

    assert(callback.callCount === 1);
    assert(typeof callback.getCall(0).args[0] === "string");
  });

  it("calls callback with error message as first argument if 'functions' of event object is not array",()=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:"testfunc",
      event:{
        data:"dummyData"
      }
    };

    const callback = sinon.spy();

    const handler = race.factory(lambda);
    handler(event,null,callback);

    assert(callback.callCount === 1);
    assert(typeof callback.getCall(0).args[0] === "string");
  });

  it("calls callback with no argument if 'functions' of event object is empty array",()=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[],
      event:{
        data:"dummyData"
      }
    };

    const callback = sinon.spy();

    const handler = race.factory(lambda);
    handler(event,null,callback);

    assert(callback.callCount === 1);
    assert(callback.getCall(0).args.length === 0);
  });

  it("calls callback with no argument if race functions returns null after timeout",(done)=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        "testfunc1",
        "testfunc2",
        "testfunc3"
      ],
      event:{
        data:"dummyData"
      }
    };

    const expectReturns = [
      null,
      null,
      null
    ];

    const callback = sinon.spy();

    const handler = race.factory(lambda);
    handler(event,null,callback);

    assert(lambda.invoke.callCount === event.functions.length);
    for(var i=0;i<event.functions.length;i++){
      const call = lambda.invoke.getCall(i);
      const invokeParam = call.args[0];
      const invokecallback = call.args[1];

      assert(invokeParam.FunctionName === event.functions[i]);
      assert.deepEqual(invokeParam.Payload,JSON.stringify(event.event));

      invokecallback(null,{Payload:expectReturns[i]});
    }

    //XXX Promise.raceの完了待ち。他になんかいい方法無いものか。。。
    setTimeout(()=>{
      assert(callback.callCount === 1);
      assert(callback.getCall(0).args.length === 0);
      done();
    },1900);
  });
});
