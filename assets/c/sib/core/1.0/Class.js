define(function(require, exports, module){
  var $ = require('../../core/1.0/jQuery+');
  var /*initializing = false,*/ fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  //this.Class = function(){};
  var Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function( opts ) { //staticAttr, prop) {

    var staticAttr = opts ? opts['static'] : null,
        mprivate = opts ? opts['private'] : null,
        prop = opts ? opts['public'] : null,
        _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    //initializing = true;
    var temp = this.prototype.init;
    this.prototype.init = function(){};
    var prototype = new this();
    this.prototype.init = temp;
    //initializing = false;
    //子类对父类继承过来的public方法,也做代理,使能访问自己(子类)的private方法!
    for(var i in prototype ) {
        //&& t
        if(typeof prototype[i] != 'function')continue;
        //console.debug('--------  ' + i);
        if(!prop || !prop[i]) {
            //console.debug('***** ' + i);
            prototype[i] = (function(name, fn){
                return function() {
                    var tmp = {};
                    if(mprivate) {
                        for(var p in mprivate){
                            if(this.hasOwnProperty(p))continue;
                            tmp[p] = this[p];
                            this[p] = mprivate[p];
                        }
                    }
    
                    var ret = fn.apply(this, arguments);
                    for(var pp in tmp){
                        //注意:这里如果tmp[pp]为undifined，则要删除，否则 this.hasOwnProperty为true,虽然为undifined!!!
                        if(tmp[pp] === undefined) {
                            delete this[pp];
                        } else {
                            this[pp] = tmp[pp];
                        }
                    }
                    return ret;
                }
            })(i, prototype[i]);
        }
    }
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        ((typeof _super[name] == "function" && fnTest.test(prop[name])) || mprivate) ?
        (function(name, fn){
          return function() {
            var tmp = {};
            if(mprivate) {
                for(var p in mprivate){
                    if(this.hasOwnProperty(p))continue;
                    tmp[p] = this[p];
                    this[p] = mprivate[p];
                }
            }

            tmp['_super'] = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            //this._super = tmp['_super'];
            for(var pp in tmp){
                //注意:解释同上!
                if(tmp[pp] === undefined) {
                    delete this[pp];
                } else {
                    this[pp] = tmp[pp];
                }
            }
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      
      if(!(this instanceof arguments.callee)) {
        //return new arguments.callee(options);
          throw new Error('Please used "new" keyword to create object!');
      }

      // All construction is actually done in the init method
      if (/* !initializing && */this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    $.extend(true, Class, this, staticAttr);

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
  
  return Class;
});