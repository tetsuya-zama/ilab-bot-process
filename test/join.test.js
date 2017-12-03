"use strict";

const join = require("../src/join");
const sinon = require("sinon");
const assert = require("power-assert");


describe("join process",()=>{
  it("invokes all functions and return all of returns as array via callback sencond argument",(done)=>{
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

    const handler = join.factory(lambda);
    handler(event,null,callback);

    assert(lambda.invoke.callCount === event.functions.length);
    for(var i=0;i<event.functions.length;i++){
      const call = lambda.invoke.getCall(i);
      const invokeParam = call.args[0];
      const invokeCallback = call.args[1];

      assert(invokeParam.FunctionName === event.functions[i]);
      assert.deepEqual(invokeParam.Payload,JSON.stringify(event.event));

      invokeCallback(null,{Payload:expectReturns[i]});
    }

    //XXX Promise.allの完了待ち。他になんかいい方法無いものか。。。
    setTimeout(()=>{
      assert(callback.callCount === 1);
      assert(callback.getCall(0).args[0] === null);
      assert.deepEqual(callback.getCall(0).args[1],expectReturns);
      done();
    },100);


  });

  it("omits null returns",(done)=>{
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
      null,
      "testrtn3"
    ];

    const callback = sinon.spy();

    const handler = join.factory(lambda);
    handler(event,null,callback);

    assert(lambda.invoke.callCount === event.functions.length);
    for(var i=0;i<event.functions.length;i++){
      const call = lambda.invoke.getCall(i);
      const invokeParam = call.args[0];
      const invokeCallback = call.args[1];

      assert(invokeParam.FunctionName === event.functions[i]);
      assert.deepEqual(invokeParam.Payload,JSON.stringify(event.event));

      invokeCallback(null,{Payload:expectReturns[i]});
    }

    //XXX Promise.allの完了待ち。他になんかいい方法無いものか。。。
    setTimeout(()=>{
      assert(callback.callCount === 1);
      assert(callback.getCall(0).args[0] === null);
      assert.deepEqual(callback.getCall(0).args[1],expectReturns.filter(v => v !== null));
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
      "testrtn1",
      "some error",
      "testrtn3"
    ];

    const callback = sinon.spy();

    const handler = join.factory(lambda);
    handler(event,null,callback);

    assert(lambda.invoke.callCount === event.functions.length);
    for(var i=0;i<event.functions.length;i++){
      const call = lambda.invoke.getCall(i);
      const invokeParam = call.args[0];
      const invokeCallback = call.args[1];

      assert(invokeParam.FunctionName === event.functions[i]);
      assert.deepEqual(invokeParam.Payload,JSON.stringify(event.event));

      const result = expectReturns[i];
      if(result === "some error"){
        invokeCallback(result,null);
      }else{
        invokeCallback(null,{Payload:result});
      }
    }

    //XXX Promise.allの完了待ち。他になんかいい方法無いものか。。。
    setTimeout(()=>{
      assert(callback.callCount === 1);
      assert(callback.getCall(0).args[0] === null);
      assert.deepEqual(callback.getCall(0).args[1],expectReturns.filter(v => v !== "some error"));
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

    const handler = join.factory(lambda);
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

    const handler = join.factory(lambda);
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

    const handler = join.factory(lambda);
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

    const handler = join.factory(lambda);
    handler(event,null,callback);

    assert(callback.callCount === 1);
    assert(callback.getCall(0).args.length === 0);
  });
});
