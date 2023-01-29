/**
 * @template Values, FunctorValue
 */
class Map{
    /**
     * @template A, B, C, D, E, F, Z
     * @param { {[x:string]: unknown extends Z ? unknown : Functor extends Z ? Functor<B, C, D> : Z } } x
     * @return {MapObj<unknown extends Z ? never : Z , B>}
     */
    static of(x){
      return isObject(x) ? new MapObj(x) : error(x)  // pass in values and functor value here? 
  
      /** @template {A} @param {A} x */
      function error(x){
        throw Error(`The input to MapObj must have a constructor type Object, but your input:'${x}' has a constructor type of: ${x.constructor}.`)
      }
  
      /** @template A @param {A} x */
      function isObject (x){ return x.constructor === Object}
    }
  
    /**
     * @param {Object<string, Values>} x
     */
    constructor(x){
      this.$value = x
    }
  
    /** @param {function(string):boolean} filterFn @return {MapObj<Values, FunctorValue>} */
    removeKey(filterFn){
      return Object.keys(this.$value).filter(filterFn).reduce((prevVal, currKey) => prevVal.insert(currKey, this.$value[currKey]) , MapObj.of({}))
    }
  
    /**
     * @template A, B
     * @param {A} key
     * @param {B} val
     */
    insert(key, val){
      /** @type {{[x:string]:B}} */
      const singleton = {}
      singleton[key] = val
      /** @type { {[x:string]: Values | B} } */
      const updatedObj = Object.assign({}, this.$value, singleton)
      return MapObj.of(updatedObj)
    }
  
    /**
     * @template A, B, D
     * @template {string} C
     * @param {function(A, Values, C): D} fn Arg1 is initial value, Arg2 is the value, arg3 is the key
     * @param {A} initialValue
     * @return {D}
     */
    reduceWithKeys(fn, initialValue){
      return Object.keys(this.$value).reduce((prevVal, currKey) => fn(prevVal, this.$value[currKey], currKey), initialValue)
    }
    /**
     * @template A
     * @param {function(Values): A}fn
     */
    map(fn){
      return this.reduceWithKeys((map, val, key) => map.insert(key, fn(val)), MapObj.of({}))
    }
  
    // my idea
    /**
     * @template A
     * @param {string} key The key of the value you want to update
     * @param {function(Values): A} fn The function used to update the value
     */
    updateValue(key, fn){
      return this.insert(key, fn(this.$value[key]))
    }
  
    /** @param {string} key @return {Maybe<Values>} */
    lookupValue(key){
      return this.hasKey(key) ? Maybe.of(this.$value[key]) : Maybe.of(null)
    }
    
    /** @param {string} key */
    hasKey(key){
      // why JSON.stringify: https://stackoverflow.com/questions/8892465/what-does-object-object-mean-javascript
      return key in this.$value || Logger.log(`Key (${key}) not found in object: ${JSON.stringify(this.$value)}`)  && false
    }
  
    /** @param {string} key */
    keyNotPresent(key){
      return !(this.hasKey(key))
    }
  
  
    // /**
    //  * @template A, B
    //  * @param {function(Values): A} fn
    //  * @param {string} key
    //  * @param {B} [valueToInsertIfKeyNotPresent]
    //  */
    // updateValue(fn, key, valueToInsertIfKeyNotPresent){
    //   return this.isPresent(key) ? this.insert(key, fn(this.$value[key])) : this.insert(key, valueToInsertIfKeyNotPresent) 
    // }
  
  
    //  * @template {{[x:string]:B}} updatedObj
    //  * @return {Maybe extends A ? Maybe< MapObj<updatedObj, B>, updatedObj> :
    //  *          Either extends A ? Either< MapObj<updatedObj, B>, false, true, updatedObj> :
    //  *          unknown
    //  *         }
  
    // /**
    //  * @template A, 
    //  * @param {function(MapObj<Obj, Values, FunctorValue>): A} of
    //  * @return {Either extends Values ? Either<MapObj<{[x:string] : FunctorValue}, FunctorValue>, false, true> : 
    //  *          Maybe extends Values ? Maybe<MapObj<{[x:string]: FunctorValue}, FunctorValue>, FunctorValue> :
    //  *          unknown
    //  *         }
    //  */
    // sequence(of){
    //   /** @template B @param {B} x */
    //   const identity = x => x
    //   return this.traverse(of, identity) 
    // }
  
  
    // /**
    //  * @template A, C
    //  * @param {function(MapObj<Obj, Values, FunctorValue>): A } of
    //  */
    // sequence(of){
    //   /** @template B @param {B} x */
    //   const identity = x => x
    //   return this.traverse(of, identity) 
    // }
  
    // /**
    //  * @template A, B, C, D, Z
    //  * @template {{[x:string]:B}} updatedObj
    //  * @param {function(MapObj<Object<string, B>, Values,  FunctorValue>):A} of
    //  * @param {function(Values): Functor extends Z ? Functor<B, C, D> : unknown } fn
    //  */
    // traverse(of, fn){
    //   return this.reduceWithKeys(
    //     /** @param {A} monad @param {Values} val @param{string} key */
    //     (monad, val, key) => fn(val).map(firstVal => theMap => theMap.insert(key, firstVal)).ap(monad)  
    //     ,of(MapObj.of({}))
    //   )
    // }
  
    /**
     * @template {ApplicativeFunctor extends Values ? never : 
     *            Maybe extends Values ? Maybe<MapObj> : 
     *            Either extends Values ? Either<MapObj, false, true>} A 
     * @param {Values extends ApplicativeFunctor ? function(MapObj<>): A : never} of
     * @return {ApplicativeFunctor extends Values ? never :
     *          Either extends Values ? Either<MapObj<{[x:string] : FunctorValue}, FunctorValue>, false, true> : 
     *          Maybe extends Values ? Maybe<MapObj<{[x:string]: FunctorValue}, FunctorValue>, FunctorValue> :
     *          never
     *         }
     */
    sequence(of){
      /** @template B @param {B} x */
      const identity = x => x
      return this.traverse(of, identity) 
    }
  
    /**
     * @template C
     * @template {ApplicativeFunctor} A 
     * @param {function(MapObj<>): A} of
     * @param {function(Values): ApplicativeFunctor extends A ? never :
     *                           Maybe extends A ? Maybe<C> : 
     *                           Either extends A ? Either<C, false, true> : 
     *                           A extends unknown ? never} fn
     * @return {ApplicativeFunctor extends A ? never :
     *          Maybe extends A ? Maybe<MapObj<{[x:string]: C}, C>, C> : 
     *          Either extends A ? Either<MapObj<{[x:string] : C}, C>, false, true> :
     *         }
     */
    traverse(of, fn){
      return this.reduceWithKeys(
        /** @param {A} monad @param {Values} val @param{string} key */
        (monad, val, key) => fn(val).map(firstVal => theMap => theMap.insert(key, firstVal)).ap(monad)  
        ,of(MapObj.of({}))
      )
    }
  }