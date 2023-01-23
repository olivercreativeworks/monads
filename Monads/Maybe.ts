//https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing/

import { MonadDefinitions } from "./Interfaces"
interface Monad<Value> extends MonadDefinitions.Monad<Value>{
}
interface Applicative<Value> extends MonadDefinitions.Applicative<Value>{
}

export class Maybe<Value> implements Applicative<Value>{
    $value?:Value | null

    constructor(value: Value){
        this.$value = value
    }

    static of<A>(x:A):Maybe<A>{
        return new Maybe(x)
    }

    isNothing():Boolean{
        return this.$value == null || this.$value == undefined
    }

    // typecasting 
    // https://www.typescripttutorial.net/typescript-tutorial/type-casting/
    map<B>(fn:(value:Value) => B): Maybe<B> {
        return this.isNothing() ? this as Maybe<null> : Maybe.of(fn(this.$value))
    }

    // specifying the type of 'this'
    // https://www.typescriptlang.org/docs/handbook/2/functions.html
    // https://stackoverflow.com/questions/28920753/declaring-the-type-of-this-in-a-typescript-function
    join<A>(this:Maybe<Maybe<A>>): Maybe<A>{
        return this.isNothing() ? this as Maybe<null> : Maybe.of(this.$value.$value)
        // return this.isNothing() ? this : this.$value
    }
    flatmap<A>(fn:(value:Value) => Maybe<A>): Maybe<A>{
        return this.map(fn).join()
    }
    filter(fn:(value:Value) => Boolean): Maybe<Value>{
        return this.isNothing() ? this as Maybe<null> : fn(this.$value) ? this as Maybe<Value> : Maybe.of(null)
    }
    ap<A, B>(this:Maybe<(value:A) => B>, otherMaybe:Maybe<A>): Maybe<B>{
        return this.isNothing() ? this as Maybe<null> : otherMaybe.map(this.$value)
    }

    traverse<A, B extends Monad<A>, C extends Monad<Maybe<A>>> (fn: (value: Value) => B, of: (value: Maybe<A>) => C): C{
        return this.isNothing() ? of(this as Maybe<null>) : fn(this.$value).map(Maybe.of) as C
    }


    identity<A>(x:A):A{
        return x
    }

    sequence<A, B extends Monad<Maybe<A>>>(this: Maybe<Monad<A>>, of: (value: Maybe<A>) => B ){
        return this.traverse(this.identity, of)
    }
}