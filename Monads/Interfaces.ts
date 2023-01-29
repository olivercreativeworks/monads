export namespace MonadDefinitions{
    export interface Monad<Value>{
        map<A>(fn:(value:Value) => A): Monad<A>
    }
    
    export interface Applicative<Value>{
        map<A>(fn:(value:Value) => A): Applicative<A>
        ap<A, B>(this: Applicative<(value:A) => B>, otherApplicative: Applicative<A>): Applicative<B>
    }
}