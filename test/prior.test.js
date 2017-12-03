"use strict";

const prior = require("../src/prior");
const sinon = require("sinon");
const assert = require("power-assert");

describe("prior process",()=>{
  it("invokes all functions and returns the most prior function(lowest 'priority' number)'s return as second argument of callback'",(done)=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        {name:"testfunc1",priority:3},
        {name:"testfunc2",priority:2},
        {name:"testfunc3",priority:1}
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

    const handler = prior.factory(lambda);
    handler(event,null,callback);

    assert(lambda.invoke.callCount === event.functions.length);
    for(var i=0;i<event.functions.length;i++){
      const call = lambda.invoke.getCall(i);
      const invokeParam = call.args[0];
      const invokecallback = call.args[1];

      assert(invokeParam.FunctionName === event.functions[i].name);
      assert.deepEqual(invokeParam.Payload,JSON.stringify(event.event));

      invokecallback(null,{Payload:expectReturns[i]});
    }

    //XXX Promise.allの完了待ち。他になんかいい方法無いものか。。。
    setTimeout(()=>{
      assert(callback.callCount === 1);
      assert(callback.getCall(0).args[0] === null);
      assert.deepEqual(callback.getCall(0).args[1],expectReturns[2]);
      done();
    },100);
  });

  it("omits null returns",(done)=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        {name:"testfunc1",priority:3},
        {name:"testfunc2",priority:2},
        {name:"testfunc3",priority:1}
      ],
      event:{
        data:"dummyData"
      }
    };

    const expectReturns = [
      "testrtn1",
      "testrtn2",
      null
    ];

    const callback = sinon.spy();

    const handler = prior.factory(lambda);
    handler(event,null,callback);

    assert(lambda.invoke.callCount === event.functions.length);
    for(var i=0;i<event.functions.length;i++){
      const call = lambda.invoke.getCall(i);
      const invokeParam = call.args[0];
      const invokecallback = call.args[1];

      assert(invokeParam.FunctionName === event.functions[i].name);
      assert.deepEqual(invokeParam.Payload,JSON.stringify(event.event));

      invokecallback(null,{Payload:expectReturns[i]});
    }

    //XXX Promise.allの完了待ち。他になんかいい方法無いものか。。。
    setTimeout(()=>{
      assert(callback.callCount === 1);
      assert(callback.getCall(0).args[0] === null);
      assert.deepEqual(callback.getCall(0).args[1],expectReturns[1]);
      done();
    },100);
  });

  it("omits functions that returns error",(done)=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        {name:"testfunc1",priority:3},
        {name:"testfunc2",priority:2},
        {name:"testfunc3",priority:1}
      ],
      event:{
        data:"dummyData"
      }
    };

    const expectReturns = [
      "testrtn1",
      "testrtn2",
      "some error"
    ];

    const callback = sinon.spy();

    const handler = prior.factory(lambda);
    handler(event,null,callback);

    assert(lambda.invoke.callCount === event.functions.length);
    for(var i=0;i<event.functions.length;i++){
      const call = lambda.invoke.getCall(i);
      const invokeParam = call.args[0];
      const invokecallback = call.args[1];

      assert(invokeParam.FunctionName === event.functions[i].name);
      assert.deepEqual(invokeParam.Payload,JSON.stringify(event.event));

      const result = expectReturns[i];
      if(result === "some error"){
        invokecallback(result,null);
      }else{
        invokecallback(null,{Payload:result});
      }
    }

    //XXX Promise.allの完了待ち。他になんかいい方法無いものか。。。
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

    const handler = prior.factory(lambda);
    handler(event,null,callback);

    assert(callback.callCount === 1);
    assert(typeof callback.getCall(0).args[0] === "string");
  });

  it("calls callback with error message as first argument if some values of 'functions' don't have 'priority' attribute",()=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        {name:"testfunc1",priority:3},
        {name:"testfunc2"},
        {name:"testfunc3",priority:1}
      ],
      event:{
        data:"dummyData"
      }
    };

    const callback = sinon.spy();

    const handler = prior.factory(lambda);
    handler(event,null,callback);

    assert(callback.callCount === 1);
    assert(typeof callback.getCall(0).args[0] === "string");
  });

  it("calls callback with error message as first argument if some values of 'functions' don't have 'name' attribute",()=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        {name:"testfunc1",priority:3},
        {priority:2},
        {name:"testfunc3",priority:1}
      ],
      event:{
        data:"dummyData"
      }
    };

    const callback = sinon.spy();

    const handler = prior.factory(lambda);
    handler(event,null,callback);

    assert(callback.callCount === 1);
    assert(typeof callback.getCall(0).args[0] === "string");
  });

  it("calls callback with error message as first argument if some 'priority' is not a number",()=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        {name:"testfunc1",priority:"a"},
        {name:"testfunc2",priority:2},
        {name:"testfunc3",priority:1}
      ],
      event:{
        data:"dummyData"
      }
    };

    const callback = sinon.spy();

    const handler = prior.factory(lambda);
    handler(event,null,callback);

    assert(callback.callCount === 1);
    assert(typeof callback.getCall(0).args[0] === "string");
  });

  it("calls callback with error message as first argument if 'event' dosn't exist in event object",()=>{
    const lambda = {invoke:sinon.spy()};

    const event = {
      functions:[
        {name:"testfunc1",priority:3},
        {name:"testfunc2",priority:2},
        {name:"testfunc3",priority:1}
      ]
    };

    const callback = sinon.spy();

    const handler = prior.factory(lambda);
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

    const handler = prior.factory(lambda);
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

    const handler = prior.factory(lambda);
    handler(event,null,callback);

    assert(callback.callCount === 1);
    assert(callback.getCall(0).args.length === 0);
  });
});
