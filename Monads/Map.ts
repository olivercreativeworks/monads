import { MonadDefinitions } from "./Interfaces"
import { Maybe } from "./Maybe"

interface Applicative<Value> extends MonadDefinitions.Applicative<Value>{
}

type ObjectKey = string | number | symbol
type MapObj<Value> = {[x in ObjectKey]: Value}

export class Map<Value>{
  private $value: MapObj<Value>
  
  static of<A>(x:MapObj<A>): Map<A>{
    return new Map(x) 
  }
  
  constructor(x:MapObj<Value>){
    this.$value = x
  }
  
  insert<A extends ObjectKey, B>(key:ObjectKey, val:Value): Map<Value>{
    const singleton: any = {}
    singleton[key] = val
    const newObject = {...this.$value, ...singleton}
    return Map.of(newObject)
  }
  
  reduceWithKeys<A>(fn:(initialValue:A, value:Value, key:string) => A, initialValue:A): A{
    return Object.keys(this.$value).reduce((prevVal, currKey) => fn(prevVal, this.$value[currKey], currKey), initialValue)
  }
  
  map<A>(fn:(value:Value) => A): Map<A>{
    return this.reduceWithKeys((map, val, key) => map.insert(key, fn(val)), Map.of({}))
  }
  
  updateValue(key: ObjectKey, fn:(value:Value)=> Value): Map<Value>{
    return this.insert(key, fn(this.$value[key]))
  }

  hasKey(key:ObjectKey): boolean{
    // why JSON.stringify: https://stackoverflow.com/questions/8892465/what-does-object-object-mean-javascript
    return key in this.$value ? true : false && console.log(`Key (${String(key)}) not found in object: ${JSON.stringify(this.$value)}`)
  }
  
  keyNotPresent(key:ObjectKey):boolean{
    return !this.hasKey(key)
  }

  lookupValue(key:ObjectKey): Maybe<Value>{
    return this.hasKey(key) ? Maybe.of(this.$value[key]) : Maybe.of(null)
  }

  traverse<A, B extends Applicative<A>, C extends Applicative<Map<A>>>(fn: (value: Value) => B, of:(value:Map<A>)=> C): C {
    return this.reduceWithKeys(
      (applicative, value, key) => fn(value).map((firstVal:A) => (theMap:Map<A>) => theMap.insert(key, firstVal)).ap(applicative) as C,
      of(Map.of({}) as Map<A>)
    )
  }

  private identity<A>(x:A):A{
    return x
  }

  sequence<A, B extends Applicative<A>, C extends Applicative<Map<A>>>(this: Map<B>, of:(value:Map<A>)=> C): C{
    return this.traverse(this.identity, of)
  }
}
        
console.log(Map.of({"3":3, "4":4}).map(x => x+1).updateValue("3", x=> x+1))
console.log(Map.of({"3":Maybe.of(3), "4":Maybe.of(4)}).sequence(Maybe.of))
