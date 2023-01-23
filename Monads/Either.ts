import { MonadDefinitions } from "./Interfaces"
interface Monad<Value> extends MonadDefinitions.Monad<Value>{
}
interface Applicative<Value> extends MonadDefinitions.Applicative<Value>{
}

class Either<Value> implements Applicative<Value>{
    $value: Value
    isLeft: boolean
    isRight: boolean

    static of<A>(value:A):Either<A>{
        return new Either(value)
    }

    static left<A>(value:A):Either<A>{
        return new Either(value, true)
    }

    constructor(value:Value, isLeft:boolean = false){
        this.$value = value
        this.isLeft = isLeft
        this.isRight = !this.isLeft
    }

    map<A>(fn:(value:Value) => A): Either<A>{
        return this.isLeft ? this as Either<null> : Either.of(fn(this.$value))
    }

    join<A>(this:Either<Either<A>>): Either<A>{
        return this.isLeft ? this as Either<null>:  Either.of(this.$value.$value)
    }

    flatmap<A>(fn:(value:Value) => Either<A>): Either<A>{
        return this.map(fn).join()
    }

    ap<A, B>(this: Either<(value:A) => B>, otherEither: Either<A>): Either<B> {
        return this.isLeft ? this as Either<null> : otherEither.map(this.$value as (value:A) => B)
    }

    traverse<A, B extends Monad<A>, C extends Monad<Either<A>>>(fn:(value:Value) => B, of: (value:Either<A>) => C):C{
        return this.isLeft ? of(this as Either<null>)  : fn(this.$value).map(Either.of) as C
    }

    identity<A>(x:A):A{
        return x
    }

    sequence<A, B extends Monad<Either<A>>, C extends (value:A) => Value>(this: Either<Monad<A>>, of: ((value: Either<A>)=> B) & C):B{
        return this.traverse(this.identity, of as (value: Either<A>)=> B)
    }

    filter(fn:(value:Value) => boolean): Either<Value>{
        return this.isLeft ? this as Either<null> : fn(this.$value) ? this : Either.left(this.$value)
    }
}