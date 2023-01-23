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

    static ignoreOperationIfLeft(target:Either<any>, propertyName: string, descriptor:TypedPropertyDescriptor<(this:Either<any>, ...args) => any>){
        const originalMethod = descriptor.value
        descriptor.value = function(this:Either<any>,...args) {
            return this.isLeft ? this : originalMethod.apply(this, args)
        }
    }

    constructor(value:Value, isLeft:boolean = false){
        this.$value = value
        this.isLeft = isLeft
        this.isRight = !this.isLeft
    }

    @Either.ignoreOperationIfLeft
    map<A>(fn:(value:Value) => A): Either<A>{
        return Either.of(fn(this.$value))
    }

    @Either.ignoreOperationIfLeft
    join<A>(this:Either<Either<A>>): Either<A>{
        return Either.of(this.$value.$value)
    }

    flatmap<A>(fn:(value:Value) => Either<A>): Either<A>{
        return this.map(fn).join()
    }

    @Either.ignoreOperationIfLeft
    ap<A, B>(this: Either<(value:A) => B>, otherEither: Either<A>): Either<B> {
        return otherEither.map(this.$value as (value:A) => B)
    }

    traverse<A, B extends Monad<A>, C extends Monad<Either<A>>>(fn:(value:Value) => B, of?: (value:Either<A>) => C):C{
        return this.isLeft ? of(this as Either<null>) : fn(this.$value).map(Either.of) as C
    }

    private identity<A>(x:A):A{
        return x
    }

    sequence<A, B extends Monad<Either<A>>, C extends (value:A) => Value>(this: Either<Monad<A>>, of: ((value: Either<A>)=> B) & C):B{
        return this.traverse(this.identity, of as (value: Either<A>)=> B)
    }

    @Either.ignoreOperationIfLeft
    filter(fn:(value:Value) => boolean): Either<Value>{
        return fn(this.$value) ? this : Either.left(this.$value)
    }
}


console.log(
    Either.of(3).map(x => x+1).map(x => x.toString()),
    Either.left(3).map(x => x+1).map(x => x.toString())
)