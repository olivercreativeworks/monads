//https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing/

import { MonadDefinitions } from "./Interfaces"
interface Monad<Value> extends MonadDefinitions.Monad<Value>{
}
interface Applicative<Value> extends MonadDefinitions.Applicative<Value>{
}

class Maybe<Value>{
    private $value?:Value

    constructor(x:Value){
        console.log(x)
        this.$value = x
    }
    
    static of<A>(x:A):Maybe<A>{
        return new Maybe(x)
    }

    // Decorator Function -- https://saul-mirone.github.io/a-complete-guide-to-typescript-decorator/
    //                       https://www.typescriptlang.org/docs/handbook/decorators.html
    // Call vs Apply vs Bind -- https://medium.com/@leonardobrunolima/javascript-tips-apply-vs-call-vs-bind-d738a9e8b4e1
    private static ignoreOperationIfValueIsNothing(target:Maybe<any>, propertyKey: string, descriptor:TypedPropertyDescriptor<(this:Maybe<any>, ...args) => any>) {
        const originalMethod = descriptor.value
        descriptor.value = function(this:Maybe<any>, ...args){
            return this.isNothing() ? this : originalMethod.apply(this, args)
        }
    } 

    private isNothing():Boolean{
        return this.$value == null || this.$value == undefined
    }

    @Maybe.ignoreOperationIfValueIsNothing
    map<A>(fn:(value:Value) => A): Maybe<A> {
        return Maybe.of(fn(this.$value as Value))
    }

    @Maybe.ignoreOperationIfValueIsNothing
    join<A>(this:Maybe<Maybe<A>>): Maybe<A>{
        return Maybe.of(this.$value.$value)
    }

    flatmap<A>(fn:(value:Value) => Maybe<A>): Maybe<A>{
        return this.map(fn).join()
    }

    @Maybe.ignoreOperationIfValueIsNothing
    filter(fn:(value:Value) => Boolean): Maybe<Value>{
        return fn(this.$value) ? this : Maybe.of(null)
    }

    @Maybe.ignoreOperationIfValueIsNothing
    ap<A, B>(this:Maybe<(value:A) => B>, otherMaybe:Maybe<A>): Maybe<B>{
        return otherMaybe.map(this.$value)
    }

    @Maybe.ignoreOperationIfValueIsNothing
    traverse<A, B extends Monad<A>, C extends Monad<Maybe<A>>> (fn: (value: Value) => B, of: (value: Maybe<A>) => C): C{
        return fn(this.$value).map(Maybe.of) as C
    }


    private identity<A>(x:A):A{
        return x
    }

    sequence<A, B extends Monad<Maybe<A>>>(this: Maybe<Monad<A>>, of: (value: Maybe<A>) => B ){
        return this.traverse(this.identity, of)
    }
}

console.log( Maybe.of(14).map(x  => x* 2).map(x => x.toString()) ) // Logs Maybe("28")
console.log( Maybe.of(14).map(x => null).map(x => x.toString()))   // Logs Maybe(null)