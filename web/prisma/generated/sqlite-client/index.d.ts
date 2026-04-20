
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Template
 * 
 */
export type Template = $Result.DefaultSelection<Prisma.$TemplatePayload>
/**
 * Model TemplateLayer
 * 
 */
export type TemplateLayer = $Result.DefaultSelection<Prisma.$TemplateLayerPayload>
/**
 * Model ColorOption
 * 
 */
export type ColorOption = $Result.DefaultSelection<Prisma.$ColorOptionPayload>
/**
 * Model Render
 * 
 */
export type Render = $Result.DefaultSelection<Prisma.$RenderPayload>
/**
 * Model UserImage
 * 
 */
export type UserImage = $Result.DefaultSelection<Prisma.$UserImagePayload>
/**
 * Model PSDTemplate
 * 
 */
export type PSDTemplate = $Result.DefaultSelection<Prisma.$PSDTemplatePayload>
/**
 * Model BookTemplate
 * 
 */
export type BookTemplate = $Result.DefaultSelection<Prisma.$BookTemplatePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Templates
 * const templates = await prisma.template.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Templates
   * const templates = await prisma.template.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.template`: Exposes CRUD operations for the **Template** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Templates
    * const templates = await prisma.template.findMany()
    * ```
    */
  get template(): Prisma.TemplateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.templateLayer`: Exposes CRUD operations for the **TemplateLayer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TemplateLayers
    * const templateLayers = await prisma.templateLayer.findMany()
    * ```
    */
  get templateLayer(): Prisma.TemplateLayerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.colorOption`: Exposes CRUD operations for the **ColorOption** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ColorOptions
    * const colorOptions = await prisma.colorOption.findMany()
    * ```
    */
  get colorOption(): Prisma.ColorOptionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.render`: Exposes CRUD operations for the **Render** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Renders
    * const renders = await prisma.render.findMany()
    * ```
    */
  get render(): Prisma.RenderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userImage`: Exposes CRUD operations for the **UserImage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserImages
    * const userImages = await prisma.userImage.findMany()
    * ```
    */
  get userImage(): Prisma.UserImageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pSDTemplate`: Exposes CRUD operations for the **PSDTemplate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PSDTemplates
    * const pSDTemplates = await prisma.pSDTemplate.findMany()
    * ```
    */
  get pSDTemplate(): Prisma.PSDTemplateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bookTemplate`: Exposes CRUD operations for the **BookTemplate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BookTemplates
    * const bookTemplates = await prisma.bookTemplate.findMany()
    * ```
    */
  get bookTemplate(): Prisma.BookTemplateDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Template: 'Template',
    TemplateLayer: 'TemplateLayer',
    ColorOption: 'ColorOption',
    Render: 'Render',
    UserImage: 'UserImage',
    PSDTemplate: 'PSDTemplate',
    BookTemplate: 'BookTemplate'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "template" | "templateLayer" | "colorOption" | "render" | "userImage" | "pSDTemplate" | "bookTemplate"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Template: {
        payload: Prisma.$TemplatePayload<ExtArgs>
        fields: Prisma.TemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          findFirst: {
            args: Prisma.TemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          findMany: {
            args: Prisma.TemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>[]
          }
          create: {
            args: Prisma.TemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          createMany: {
            args: Prisma.TemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>[]
          }
          delete: {
            args: Prisma.TemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          update: {
            args: Prisma.TemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          deleteMany: {
            args: Prisma.TemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TemplateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>[]
          }
          upsert: {
            args: Prisma.TemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          aggregate: {
            args: Prisma.TemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTemplate>
          }
          groupBy: {
            args: Prisma.TemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<TemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.TemplateCountArgs<ExtArgs>
            result: $Utils.Optional<TemplateCountAggregateOutputType> | number
          }
        }
      }
      TemplateLayer: {
        payload: Prisma.$TemplateLayerPayload<ExtArgs>
        fields: Prisma.TemplateLayerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TemplateLayerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TemplateLayerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload>
          }
          findFirst: {
            args: Prisma.TemplateLayerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TemplateLayerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload>
          }
          findMany: {
            args: Prisma.TemplateLayerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload>[]
          }
          create: {
            args: Prisma.TemplateLayerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload>
          }
          createMany: {
            args: Prisma.TemplateLayerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TemplateLayerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload>[]
          }
          delete: {
            args: Prisma.TemplateLayerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload>
          }
          update: {
            args: Prisma.TemplateLayerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload>
          }
          deleteMany: {
            args: Prisma.TemplateLayerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TemplateLayerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TemplateLayerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload>[]
          }
          upsert: {
            args: Prisma.TemplateLayerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplateLayerPayload>
          }
          aggregate: {
            args: Prisma.TemplateLayerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTemplateLayer>
          }
          groupBy: {
            args: Prisma.TemplateLayerGroupByArgs<ExtArgs>
            result: $Utils.Optional<TemplateLayerGroupByOutputType>[]
          }
          count: {
            args: Prisma.TemplateLayerCountArgs<ExtArgs>
            result: $Utils.Optional<TemplateLayerCountAggregateOutputType> | number
          }
        }
      }
      ColorOption: {
        payload: Prisma.$ColorOptionPayload<ExtArgs>
        fields: Prisma.ColorOptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ColorOptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ColorOptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload>
          }
          findFirst: {
            args: Prisma.ColorOptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ColorOptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload>
          }
          findMany: {
            args: Prisma.ColorOptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload>[]
          }
          create: {
            args: Prisma.ColorOptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload>
          }
          createMany: {
            args: Prisma.ColorOptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ColorOptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload>[]
          }
          delete: {
            args: Prisma.ColorOptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload>
          }
          update: {
            args: Prisma.ColorOptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload>
          }
          deleteMany: {
            args: Prisma.ColorOptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ColorOptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ColorOptionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload>[]
          }
          upsert: {
            args: Prisma.ColorOptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColorOptionPayload>
          }
          aggregate: {
            args: Prisma.ColorOptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateColorOption>
          }
          groupBy: {
            args: Prisma.ColorOptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ColorOptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ColorOptionCountArgs<ExtArgs>
            result: $Utils.Optional<ColorOptionCountAggregateOutputType> | number
          }
        }
      }
      Render: {
        payload: Prisma.$RenderPayload<ExtArgs>
        fields: Prisma.RenderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RenderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RenderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload>
          }
          findFirst: {
            args: Prisma.RenderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RenderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload>
          }
          findMany: {
            args: Prisma.RenderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload>[]
          }
          create: {
            args: Prisma.RenderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload>
          }
          createMany: {
            args: Prisma.RenderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RenderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload>[]
          }
          delete: {
            args: Prisma.RenderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload>
          }
          update: {
            args: Prisma.RenderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload>
          }
          deleteMany: {
            args: Prisma.RenderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RenderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RenderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload>[]
          }
          upsert: {
            args: Prisma.RenderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RenderPayload>
          }
          aggregate: {
            args: Prisma.RenderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRender>
          }
          groupBy: {
            args: Prisma.RenderGroupByArgs<ExtArgs>
            result: $Utils.Optional<RenderGroupByOutputType>[]
          }
          count: {
            args: Prisma.RenderCountArgs<ExtArgs>
            result: $Utils.Optional<RenderCountAggregateOutputType> | number
          }
        }
      }
      UserImage: {
        payload: Prisma.$UserImagePayload<ExtArgs>
        fields: Prisma.UserImageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserImageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserImageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload>
          }
          findFirst: {
            args: Prisma.UserImageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserImageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload>
          }
          findMany: {
            args: Prisma.UserImageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload>[]
          }
          create: {
            args: Prisma.UserImageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload>
          }
          createMany: {
            args: Prisma.UserImageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserImageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload>[]
          }
          delete: {
            args: Prisma.UserImageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload>
          }
          update: {
            args: Prisma.UserImageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload>
          }
          deleteMany: {
            args: Prisma.UserImageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserImageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserImageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload>[]
          }
          upsert: {
            args: Prisma.UserImageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserImagePayload>
          }
          aggregate: {
            args: Prisma.UserImageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserImage>
          }
          groupBy: {
            args: Prisma.UserImageGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserImageGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserImageCountArgs<ExtArgs>
            result: $Utils.Optional<UserImageCountAggregateOutputType> | number
          }
        }
      }
      PSDTemplate: {
        payload: Prisma.$PSDTemplatePayload<ExtArgs>
        fields: Prisma.PSDTemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PSDTemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PSDTemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload>
          }
          findFirst: {
            args: Prisma.PSDTemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PSDTemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload>
          }
          findMany: {
            args: Prisma.PSDTemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload>[]
          }
          create: {
            args: Prisma.PSDTemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload>
          }
          createMany: {
            args: Prisma.PSDTemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PSDTemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload>[]
          }
          delete: {
            args: Prisma.PSDTemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload>
          }
          update: {
            args: Prisma.PSDTemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload>
          }
          deleteMany: {
            args: Prisma.PSDTemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PSDTemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PSDTemplateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload>[]
          }
          upsert: {
            args: Prisma.PSDTemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PSDTemplatePayload>
          }
          aggregate: {
            args: Prisma.PSDTemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePSDTemplate>
          }
          groupBy: {
            args: Prisma.PSDTemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<PSDTemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.PSDTemplateCountArgs<ExtArgs>
            result: $Utils.Optional<PSDTemplateCountAggregateOutputType> | number
          }
        }
      }
      BookTemplate: {
        payload: Prisma.$BookTemplatePayload<ExtArgs>
        fields: Prisma.BookTemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BookTemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BookTemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload>
          }
          findFirst: {
            args: Prisma.BookTemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BookTemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload>
          }
          findMany: {
            args: Prisma.BookTemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload>[]
          }
          create: {
            args: Prisma.BookTemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload>
          }
          createMany: {
            args: Prisma.BookTemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BookTemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload>[]
          }
          delete: {
            args: Prisma.BookTemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload>
          }
          update: {
            args: Prisma.BookTemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload>
          }
          deleteMany: {
            args: Prisma.BookTemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BookTemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BookTemplateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload>[]
          }
          upsert: {
            args: Prisma.BookTemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookTemplatePayload>
          }
          aggregate: {
            args: Prisma.BookTemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBookTemplate>
          }
          groupBy: {
            args: Prisma.BookTemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<BookTemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.BookTemplateCountArgs<ExtArgs>
            result: $Utils.Optional<BookTemplateCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    template?: TemplateOmit
    templateLayer?: TemplateLayerOmit
    colorOption?: ColorOptionOmit
    render?: RenderOmit
    userImage?: UserImageOmit
    pSDTemplate?: PSDTemplateOmit
    bookTemplate?: BookTemplateOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TemplateCountOutputType
   */

  export type TemplateCountOutputType = {
    layers: number
    colorOptions: number
    renders: number
  }

  export type TemplateCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    layers?: boolean | TemplateCountOutputTypeCountLayersArgs
    colorOptions?: boolean | TemplateCountOutputTypeCountColorOptionsArgs
    renders?: boolean | TemplateCountOutputTypeCountRendersArgs
  }

  // Custom InputTypes
  /**
   * TemplateCountOutputType without action
   */
  export type TemplateCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateCountOutputType
     */
    select?: TemplateCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TemplateCountOutputType without action
   */
  export type TemplateCountOutputTypeCountLayersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TemplateLayerWhereInput
  }

  /**
   * TemplateCountOutputType without action
   */
  export type TemplateCountOutputTypeCountColorOptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ColorOptionWhereInput
  }

  /**
   * TemplateCountOutputType without action
   */
  export type TemplateCountOutputTypeCountRendersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RenderWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Template
   */

  export type AggregateTemplate = {
    _count: TemplateCountAggregateOutputType | null
    _avg: TemplateAvgAggregateOutputType | null
    _sum: TemplateSumAggregateOutputType | null
    _min: TemplateMinAggregateOutputType | null
    _max: TemplateMaxAggregateOutputType | null
  }

  export type TemplateAvgAggregateOutputType = {
    width: number | null
    height: number | null
    coverWidth: number | null
    coverHeight: number | null
    spineWidth: number | null
  }

  export type TemplateSumAggregateOutputType = {
    width: number | null
    height: number | null
    coverWidth: number | null
    coverHeight: number | null
    spineWidth: number | null
  }

  export type TemplateMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    category: string | null
    thumbnail: string | null
    baseImage: string | null
    width: number | null
    height: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    coverWidth: number | null
    coverHeight: number | null
    spineWidth: number | null
    warpPreset: string | null
  }

  export type TemplateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    category: string | null
    thumbnail: string | null
    baseImage: string | null
    width: number | null
    height: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    coverWidth: number | null
    coverHeight: number | null
    spineWidth: number | null
    warpPreset: string | null
  }

  export type TemplateCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    description: number
    category: number
    thumbnail: number
    baseImage: number
    width: number
    height: number
    isActive: number
    createdAt: number
    updatedAt: number
    coverWidth: number
    coverHeight: number
    spineWidth: number
    warpPreset: number
    _all: number
  }


  export type TemplateAvgAggregateInputType = {
    width?: true
    height?: true
    coverWidth?: true
    coverHeight?: true
    spineWidth?: true
  }

  export type TemplateSumAggregateInputType = {
    width?: true
    height?: true
    coverWidth?: true
    coverHeight?: true
    spineWidth?: true
  }

  export type TemplateMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    category?: true
    thumbnail?: true
    baseImage?: true
    width?: true
    height?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    coverWidth?: true
    coverHeight?: true
    spineWidth?: true
    warpPreset?: true
  }

  export type TemplateMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    category?: true
    thumbnail?: true
    baseImage?: true
    width?: true
    height?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    coverWidth?: true
    coverHeight?: true
    spineWidth?: true
    warpPreset?: true
  }

  export type TemplateCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    category?: true
    thumbnail?: true
    baseImage?: true
    width?: true
    height?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    coverWidth?: true
    coverHeight?: true
    spineWidth?: true
    warpPreset?: true
    _all?: true
  }

  export type TemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Template to aggregate.
     */
    where?: TemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Templates to fetch.
     */
    orderBy?: TemplateOrderByWithRelationInput | TemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Templates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Templates
    **/
    _count?: true | TemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TemplateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TemplateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TemplateMaxAggregateInputType
  }

  export type GetTemplateAggregateType<T extends TemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTemplate[P]>
      : GetScalarType<T[P], AggregateTemplate[P]>
  }




  export type TemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TemplateWhereInput
    orderBy?: TemplateOrderByWithAggregationInput | TemplateOrderByWithAggregationInput[]
    by: TemplateScalarFieldEnum[] | TemplateScalarFieldEnum
    having?: TemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TemplateCountAggregateInputType | true
    _avg?: TemplateAvgAggregateInputType
    _sum?: TemplateSumAggregateInputType
    _min?: TemplateMinAggregateInputType
    _max?: TemplateMaxAggregateInputType
  }

  export type TemplateGroupByOutputType = {
    id: string
    name: string
    slug: string
    description: string | null
    category: string
    thumbnail: string
    baseImage: string
    width: number
    height: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    coverWidth: number | null
    coverHeight: number | null
    spineWidth: number | null
    warpPreset: string | null
    _count: TemplateCountAggregateOutputType | null
    _avg: TemplateAvgAggregateOutputType | null
    _sum: TemplateSumAggregateOutputType | null
    _min: TemplateMinAggregateOutputType | null
    _max: TemplateMaxAggregateOutputType | null
  }

  type GetTemplateGroupByPayload<T extends TemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TemplateGroupByOutputType[P]>
            : GetScalarType<T[P], TemplateGroupByOutputType[P]>
        }
      >
    >


  export type TemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    category?: boolean
    thumbnail?: boolean
    baseImage?: boolean
    width?: boolean
    height?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    coverWidth?: boolean
    coverHeight?: boolean
    spineWidth?: boolean
    warpPreset?: boolean
    layers?: boolean | Template$layersArgs<ExtArgs>
    colorOptions?: boolean | Template$colorOptionsArgs<ExtArgs>
    renders?: boolean | Template$rendersArgs<ExtArgs>
    _count?: boolean | TemplateCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["template"]>

  export type TemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    category?: boolean
    thumbnail?: boolean
    baseImage?: boolean
    width?: boolean
    height?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    coverWidth?: boolean
    coverHeight?: boolean
    spineWidth?: boolean
    warpPreset?: boolean
  }, ExtArgs["result"]["template"]>

  export type TemplateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    category?: boolean
    thumbnail?: boolean
    baseImage?: boolean
    width?: boolean
    height?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    coverWidth?: boolean
    coverHeight?: boolean
    spineWidth?: boolean
    warpPreset?: boolean
  }, ExtArgs["result"]["template"]>

  export type TemplateSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    category?: boolean
    thumbnail?: boolean
    baseImage?: boolean
    width?: boolean
    height?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    coverWidth?: boolean
    coverHeight?: boolean
    spineWidth?: boolean
    warpPreset?: boolean
  }

  export type TemplateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "description" | "category" | "thumbnail" | "baseImage" | "width" | "height" | "isActive" | "createdAt" | "updatedAt" | "coverWidth" | "coverHeight" | "spineWidth" | "warpPreset", ExtArgs["result"]["template"]>
  export type TemplateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    layers?: boolean | Template$layersArgs<ExtArgs>
    colorOptions?: boolean | Template$colorOptionsArgs<ExtArgs>
    renders?: boolean | Template$rendersArgs<ExtArgs>
    _count?: boolean | TemplateCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TemplateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TemplateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Template"
    objects: {
      layers: Prisma.$TemplateLayerPayload<ExtArgs>[]
      colorOptions: Prisma.$ColorOptionPayload<ExtArgs>[]
      renders: Prisma.$RenderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      description: string | null
      category: string
      thumbnail: string
      baseImage: string
      width: number
      height: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
      coverWidth: number | null
      coverHeight: number | null
      spineWidth: number | null
      warpPreset: string | null
    }, ExtArgs["result"]["template"]>
    composites: {}
  }

  type TemplateGetPayload<S extends boolean | null | undefined | TemplateDefaultArgs> = $Result.GetResult<Prisma.$TemplatePayload, S>

  type TemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TemplateCountAggregateInputType | true
    }

  export interface TemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Template'], meta: { name: 'Template' } }
    /**
     * Find zero or one Template that matches the filter.
     * @param {TemplateFindUniqueArgs} args - Arguments to find a Template
     * @example
     * // Get one Template
     * const template = await prisma.template.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TemplateFindUniqueArgs>(args: SelectSubset<T, TemplateFindUniqueArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Template that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TemplateFindUniqueOrThrowArgs} args - Arguments to find a Template
     * @example
     * // Get one Template
     * const template = await prisma.template.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, TemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Template that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateFindFirstArgs} args - Arguments to find a Template
     * @example
     * // Get one Template
     * const template = await prisma.template.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TemplateFindFirstArgs>(args?: SelectSubset<T, TemplateFindFirstArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Template that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateFindFirstOrThrowArgs} args - Arguments to find a Template
     * @example
     * // Get one Template
     * const template = await prisma.template.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, TemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Templates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Templates
     * const templates = await prisma.template.findMany()
     * 
     * // Get first 10 Templates
     * const templates = await prisma.template.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const templateWithIdOnly = await prisma.template.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TemplateFindManyArgs>(args?: SelectSubset<T, TemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Template.
     * @param {TemplateCreateArgs} args - Arguments to create a Template.
     * @example
     * // Create one Template
     * const Template = await prisma.template.create({
     *   data: {
     *     // ... data to create a Template
     *   }
     * })
     * 
     */
    create<T extends TemplateCreateArgs>(args: SelectSubset<T, TemplateCreateArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Templates.
     * @param {TemplateCreateManyArgs} args - Arguments to create many Templates.
     * @example
     * // Create many Templates
     * const template = await prisma.template.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TemplateCreateManyArgs>(args?: SelectSubset<T, TemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Templates and returns the data saved in the database.
     * @param {TemplateCreateManyAndReturnArgs} args - Arguments to create many Templates.
     * @example
     * // Create many Templates
     * const template = await prisma.template.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Templates and only return the `id`
     * const templateWithIdOnly = await prisma.template.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, TemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Template.
     * @param {TemplateDeleteArgs} args - Arguments to delete one Template.
     * @example
     * // Delete one Template
     * const Template = await prisma.template.delete({
     *   where: {
     *     // ... filter to delete one Template
     *   }
     * })
     * 
     */
    delete<T extends TemplateDeleteArgs>(args: SelectSubset<T, TemplateDeleteArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Template.
     * @param {TemplateUpdateArgs} args - Arguments to update one Template.
     * @example
     * // Update one Template
     * const template = await prisma.template.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TemplateUpdateArgs>(args: SelectSubset<T, TemplateUpdateArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Templates.
     * @param {TemplateDeleteManyArgs} args - Arguments to filter Templates to delete.
     * @example
     * // Delete a few Templates
     * const { count } = await prisma.template.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TemplateDeleteManyArgs>(args?: SelectSubset<T, TemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Templates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Templates
     * const template = await prisma.template.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TemplateUpdateManyArgs>(args: SelectSubset<T, TemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Templates and returns the data updated in the database.
     * @param {TemplateUpdateManyAndReturnArgs} args - Arguments to update many Templates.
     * @example
     * // Update many Templates
     * const template = await prisma.template.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Templates and only return the `id`
     * const templateWithIdOnly = await prisma.template.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TemplateUpdateManyAndReturnArgs>(args: SelectSubset<T, TemplateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Template.
     * @param {TemplateUpsertArgs} args - Arguments to update or create a Template.
     * @example
     * // Update or create a Template
     * const template = await prisma.template.upsert({
     *   create: {
     *     // ... data to create a Template
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Template we want to update
     *   }
     * })
     */
    upsert<T extends TemplateUpsertArgs>(args: SelectSubset<T, TemplateUpsertArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Templates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateCountArgs} args - Arguments to filter Templates to count.
     * @example
     * // Count the number of Templates
     * const count = await prisma.template.count({
     *   where: {
     *     // ... the filter for the Templates we want to count
     *   }
     * })
    **/
    count<T extends TemplateCountArgs>(
      args?: Subset<T, TemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Template.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TemplateAggregateArgs>(args: Subset<T, TemplateAggregateArgs>): Prisma.PrismaPromise<GetTemplateAggregateType<T>>

    /**
     * Group by Template.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TemplateGroupByArgs['orderBy'] }
        : { orderBy?: TemplateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Template model
   */
  readonly fields: TemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Template.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    layers<T extends Template$layersArgs<ExtArgs> = {}>(args?: Subset<T, Template$layersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    colorOptions<T extends Template$colorOptionsArgs<ExtArgs> = {}>(args?: Subset<T, Template$colorOptionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    renders<T extends Template$rendersArgs<ExtArgs> = {}>(args?: Subset<T, Template$rendersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Template model
   */
  interface TemplateFieldRefs {
    readonly id: FieldRef<"Template", 'String'>
    readonly name: FieldRef<"Template", 'String'>
    readonly slug: FieldRef<"Template", 'String'>
    readonly description: FieldRef<"Template", 'String'>
    readonly category: FieldRef<"Template", 'String'>
    readonly thumbnail: FieldRef<"Template", 'String'>
    readonly baseImage: FieldRef<"Template", 'String'>
    readonly width: FieldRef<"Template", 'Int'>
    readonly height: FieldRef<"Template", 'Int'>
    readonly isActive: FieldRef<"Template", 'Boolean'>
    readonly createdAt: FieldRef<"Template", 'DateTime'>
    readonly updatedAt: FieldRef<"Template", 'DateTime'>
    readonly coverWidth: FieldRef<"Template", 'Float'>
    readonly coverHeight: FieldRef<"Template", 'Float'>
    readonly spineWidth: FieldRef<"Template", 'Float'>
    readonly warpPreset: FieldRef<"Template", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Template findUnique
   */
  export type TemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter, which Template to fetch.
     */
    where: TemplateWhereUniqueInput
  }

  /**
   * Template findUniqueOrThrow
   */
  export type TemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter, which Template to fetch.
     */
    where: TemplateWhereUniqueInput
  }

  /**
   * Template findFirst
   */
  export type TemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter, which Template to fetch.
     */
    where?: TemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Templates to fetch.
     */
    orderBy?: TemplateOrderByWithRelationInput | TemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Templates.
     */
    cursor?: TemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Templates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Templates.
     */
    distinct?: TemplateScalarFieldEnum | TemplateScalarFieldEnum[]
  }

  /**
   * Template findFirstOrThrow
   */
  export type TemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter, which Template to fetch.
     */
    where?: TemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Templates to fetch.
     */
    orderBy?: TemplateOrderByWithRelationInput | TemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Templates.
     */
    cursor?: TemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Templates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Templates.
     */
    distinct?: TemplateScalarFieldEnum | TemplateScalarFieldEnum[]
  }

  /**
   * Template findMany
   */
  export type TemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter, which Templates to fetch.
     */
    where?: TemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Templates to fetch.
     */
    orderBy?: TemplateOrderByWithRelationInput | TemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Templates.
     */
    cursor?: TemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Templates.
     */
    skip?: number
    distinct?: TemplateScalarFieldEnum | TemplateScalarFieldEnum[]
  }

  /**
   * Template create
   */
  export type TemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * The data needed to create a Template.
     */
    data: XOR<TemplateCreateInput, TemplateUncheckedCreateInput>
  }

  /**
   * Template createMany
   */
  export type TemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Templates.
     */
    data: TemplateCreateManyInput | TemplateCreateManyInput[]
  }

  /**
   * Template createManyAndReturn
   */
  export type TemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * The data used to create many Templates.
     */
    data: TemplateCreateManyInput | TemplateCreateManyInput[]
  }

  /**
   * Template update
   */
  export type TemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * The data needed to update a Template.
     */
    data: XOR<TemplateUpdateInput, TemplateUncheckedUpdateInput>
    /**
     * Choose, which Template to update.
     */
    where: TemplateWhereUniqueInput
  }

  /**
   * Template updateMany
   */
  export type TemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Templates.
     */
    data: XOR<TemplateUpdateManyMutationInput, TemplateUncheckedUpdateManyInput>
    /**
     * Filter which Templates to update
     */
    where?: TemplateWhereInput
    /**
     * Limit how many Templates to update.
     */
    limit?: number
  }

  /**
   * Template updateManyAndReturn
   */
  export type TemplateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * The data used to update Templates.
     */
    data: XOR<TemplateUpdateManyMutationInput, TemplateUncheckedUpdateManyInput>
    /**
     * Filter which Templates to update
     */
    where?: TemplateWhereInput
    /**
     * Limit how many Templates to update.
     */
    limit?: number
  }

  /**
   * Template upsert
   */
  export type TemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * The filter to search for the Template to update in case it exists.
     */
    where: TemplateWhereUniqueInput
    /**
     * In case the Template found by the `where` argument doesn't exist, create a new Template with this data.
     */
    create: XOR<TemplateCreateInput, TemplateUncheckedCreateInput>
    /**
     * In case the Template was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TemplateUpdateInput, TemplateUncheckedUpdateInput>
  }

  /**
   * Template delete
   */
  export type TemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter which Template to delete.
     */
    where: TemplateWhereUniqueInput
  }

  /**
   * Template deleteMany
   */
  export type TemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Templates to delete
     */
    where?: TemplateWhereInput
    /**
     * Limit how many Templates to delete.
     */
    limit?: number
  }

  /**
   * Template.layers
   */
  export type Template$layersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
    where?: TemplateLayerWhereInput
    orderBy?: TemplateLayerOrderByWithRelationInput | TemplateLayerOrderByWithRelationInput[]
    cursor?: TemplateLayerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TemplateLayerScalarFieldEnum | TemplateLayerScalarFieldEnum[]
  }

  /**
   * Template.colorOptions
   */
  export type Template$colorOptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
    where?: ColorOptionWhereInput
    orderBy?: ColorOptionOrderByWithRelationInput | ColorOptionOrderByWithRelationInput[]
    cursor?: ColorOptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ColorOptionScalarFieldEnum | ColorOptionScalarFieldEnum[]
  }

  /**
   * Template.renders
   */
  export type Template$rendersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
    where?: RenderWhereInput
    orderBy?: RenderOrderByWithRelationInput | RenderOrderByWithRelationInput[]
    cursor?: RenderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RenderScalarFieldEnum | RenderScalarFieldEnum[]
  }

  /**
   * Template without action
   */
  export type TemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Template
     */
    omit?: TemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
  }


  /**
   * Model TemplateLayer
   */

  export type AggregateTemplateLayer = {
    _count: TemplateLayerCountAggregateOutputType | null
    _avg: TemplateLayerAvgAggregateOutputType | null
    _sum: TemplateLayerSumAggregateOutputType | null
    _min: TemplateLayerMinAggregateOutputType | null
    _max: TemplateLayerMaxAggregateOutputType | null
  }

  export type TemplateLayerAvgAggregateOutputType = {
    zIndex: number | null
    transformX: number | null
    transformY: number | null
    transformScaleX: number | null
    transformScaleY: number | null
    transformRotation: number | null
    boundsX: number | null
    boundsY: number | null
    boundsWidth: number | null
    boundsHeight: number | null
    opacity: number | null
  }

  export type TemplateLayerSumAggregateOutputType = {
    zIndex: number | null
    transformX: number | null
    transformY: number | null
    transformScaleX: number | null
    transformScaleY: number | null
    transformRotation: number | null
    boundsX: number | null
    boundsY: number | null
    boundsWidth: number | null
    boundsHeight: number | null
    opacity: number | null
  }

  export type TemplateLayerMinAggregateOutputType = {
    id: string | null
    templateId: string | null
    name: string | null
    type: string | null
    zIndex: number | null
    transformX: number | null
    transformY: number | null
    transformScaleX: number | null
    transformScaleY: number | null
    transformRotation: number | null
    boundsX: number | null
    boundsY: number | null
    boundsWidth: number | null
    boundsHeight: number | null
    warpData: string | null
    perspectiveData: string | null
    maskPath: string | null
    blendMode: string | null
    opacity: number | null
    defaultColor: string | null
    isColorable: boolean | null
    layerPart: string | null
    compositeUrl: string | null
    createdAt: Date | null
  }

  export type TemplateLayerMaxAggregateOutputType = {
    id: string | null
    templateId: string | null
    name: string | null
    type: string | null
    zIndex: number | null
    transformX: number | null
    transformY: number | null
    transformScaleX: number | null
    transformScaleY: number | null
    transformRotation: number | null
    boundsX: number | null
    boundsY: number | null
    boundsWidth: number | null
    boundsHeight: number | null
    warpData: string | null
    perspectiveData: string | null
    maskPath: string | null
    blendMode: string | null
    opacity: number | null
    defaultColor: string | null
    isColorable: boolean | null
    layerPart: string | null
    compositeUrl: string | null
    createdAt: Date | null
  }

  export type TemplateLayerCountAggregateOutputType = {
    id: number
    templateId: number
    name: number
    type: number
    zIndex: number
    transformX: number
    transformY: number
    transformScaleX: number
    transformScaleY: number
    transformRotation: number
    boundsX: number
    boundsY: number
    boundsWidth: number
    boundsHeight: number
    warpData: number
    perspectiveData: number
    maskPath: number
    blendMode: number
    opacity: number
    defaultColor: number
    isColorable: number
    layerPart: number
    compositeUrl: number
    createdAt: number
    _all: number
  }


  export type TemplateLayerAvgAggregateInputType = {
    zIndex?: true
    transformX?: true
    transformY?: true
    transformScaleX?: true
    transformScaleY?: true
    transformRotation?: true
    boundsX?: true
    boundsY?: true
    boundsWidth?: true
    boundsHeight?: true
    opacity?: true
  }

  export type TemplateLayerSumAggregateInputType = {
    zIndex?: true
    transformX?: true
    transformY?: true
    transformScaleX?: true
    transformScaleY?: true
    transformRotation?: true
    boundsX?: true
    boundsY?: true
    boundsWidth?: true
    boundsHeight?: true
    opacity?: true
  }

  export type TemplateLayerMinAggregateInputType = {
    id?: true
    templateId?: true
    name?: true
    type?: true
    zIndex?: true
    transformX?: true
    transformY?: true
    transformScaleX?: true
    transformScaleY?: true
    transformRotation?: true
    boundsX?: true
    boundsY?: true
    boundsWidth?: true
    boundsHeight?: true
    warpData?: true
    perspectiveData?: true
    maskPath?: true
    blendMode?: true
    opacity?: true
    defaultColor?: true
    isColorable?: true
    layerPart?: true
    compositeUrl?: true
    createdAt?: true
  }

  export type TemplateLayerMaxAggregateInputType = {
    id?: true
    templateId?: true
    name?: true
    type?: true
    zIndex?: true
    transformX?: true
    transformY?: true
    transformScaleX?: true
    transformScaleY?: true
    transformRotation?: true
    boundsX?: true
    boundsY?: true
    boundsWidth?: true
    boundsHeight?: true
    warpData?: true
    perspectiveData?: true
    maskPath?: true
    blendMode?: true
    opacity?: true
    defaultColor?: true
    isColorable?: true
    layerPart?: true
    compositeUrl?: true
    createdAt?: true
  }

  export type TemplateLayerCountAggregateInputType = {
    id?: true
    templateId?: true
    name?: true
    type?: true
    zIndex?: true
    transformX?: true
    transformY?: true
    transformScaleX?: true
    transformScaleY?: true
    transformRotation?: true
    boundsX?: true
    boundsY?: true
    boundsWidth?: true
    boundsHeight?: true
    warpData?: true
    perspectiveData?: true
    maskPath?: true
    blendMode?: true
    opacity?: true
    defaultColor?: true
    isColorable?: true
    layerPart?: true
    compositeUrl?: true
    createdAt?: true
    _all?: true
  }

  export type TemplateLayerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TemplateLayer to aggregate.
     */
    where?: TemplateLayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TemplateLayers to fetch.
     */
    orderBy?: TemplateLayerOrderByWithRelationInput | TemplateLayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TemplateLayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TemplateLayers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TemplateLayers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TemplateLayers
    **/
    _count?: true | TemplateLayerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TemplateLayerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TemplateLayerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TemplateLayerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TemplateLayerMaxAggregateInputType
  }

  export type GetTemplateLayerAggregateType<T extends TemplateLayerAggregateArgs> = {
        [P in keyof T & keyof AggregateTemplateLayer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTemplateLayer[P]>
      : GetScalarType<T[P], AggregateTemplateLayer[P]>
  }




  export type TemplateLayerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TemplateLayerWhereInput
    orderBy?: TemplateLayerOrderByWithAggregationInput | TemplateLayerOrderByWithAggregationInput[]
    by: TemplateLayerScalarFieldEnum[] | TemplateLayerScalarFieldEnum
    having?: TemplateLayerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TemplateLayerCountAggregateInputType | true
    _avg?: TemplateLayerAvgAggregateInputType
    _sum?: TemplateLayerSumAggregateInputType
    _min?: TemplateLayerMinAggregateInputType
    _max?: TemplateLayerMaxAggregateInputType
  }

  export type TemplateLayerGroupByOutputType = {
    id: string
    templateId: string
    name: string
    type: string
    zIndex: number
    transformX: number | null
    transformY: number | null
    transformScaleX: number | null
    transformScaleY: number | null
    transformRotation: number | null
    boundsX: number | null
    boundsY: number | null
    boundsWidth: number | null
    boundsHeight: number | null
    warpData: string | null
    perspectiveData: string | null
    maskPath: string | null
    blendMode: string
    opacity: number
    defaultColor: string | null
    isColorable: boolean
    layerPart: string | null
    compositeUrl: string | null
    createdAt: Date
    _count: TemplateLayerCountAggregateOutputType | null
    _avg: TemplateLayerAvgAggregateOutputType | null
    _sum: TemplateLayerSumAggregateOutputType | null
    _min: TemplateLayerMinAggregateOutputType | null
    _max: TemplateLayerMaxAggregateOutputType | null
  }

  type GetTemplateLayerGroupByPayload<T extends TemplateLayerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TemplateLayerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TemplateLayerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TemplateLayerGroupByOutputType[P]>
            : GetScalarType<T[P], TemplateLayerGroupByOutputType[P]>
        }
      >
    >


  export type TemplateLayerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    name?: boolean
    type?: boolean
    zIndex?: boolean
    transformX?: boolean
    transformY?: boolean
    transformScaleX?: boolean
    transformScaleY?: boolean
    transformRotation?: boolean
    boundsX?: boolean
    boundsY?: boolean
    boundsWidth?: boolean
    boundsHeight?: boolean
    warpData?: boolean
    perspectiveData?: boolean
    maskPath?: boolean
    blendMode?: boolean
    opacity?: boolean
    defaultColor?: boolean
    isColorable?: boolean
    layerPart?: boolean
    compositeUrl?: boolean
    createdAt?: boolean
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["templateLayer"]>

  export type TemplateLayerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    name?: boolean
    type?: boolean
    zIndex?: boolean
    transformX?: boolean
    transformY?: boolean
    transformScaleX?: boolean
    transformScaleY?: boolean
    transformRotation?: boolean
    boundsX?: boolean
    boundsY?: boolean
    boundsWidth?: boolean
    boundsHeight?: boolean
    warpData?: boolean
    perspectiveData?: boolean
    maskPath?: boolean
    blendMode?: boolean
    opacity?: boolean
    defaultColor?: boolean
    isColorable?: boolean
    layerPart?: boolean
    compositeUrl?: boolean
    createdAt?: boolean
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["templateLayer"]>

  export type TemplateLayerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    name?: boolean
    type?: boolean
    zIndex?: boolean
    transformX?: boolean
    transformY?: boolean
    transformScaleX?: boolean
    transformScaleY?: boolean
    transformRotation?: boolean
    boundsX?: boolean
    boundsY?: boolean
    boundsWidth?: boolean
    boundsHeight?: boolean
    warpData?: boolean
    perspectiveData?: boolean
    maskPath?: boolean
    blendMode?: boolean
    opacity?: boolean
    defaultColor?: boolean
    isColorable?: boolean
    layerPart?: boolean
    compositeUrl?: boolean
    createdAt?: boolean
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["templateLayer"]>

  export type TemplateLayerSelectScalar = {
    id?: boolean
    templateId?: boolean
    name?: boolean
    type?: boolean
    zIndex?: boolean
    transformX?: boolean
    transformY?: boolean
    transformScaleX?: boolean
    transformScaleY?: boolean
    transformRotation?: boolean
    boundsX?: boolean
    boundsY?: boolean
    boundsWidth?: boolean
    boundsHeight?: boolean
    warpData?: boolean
    perspectiveData?: boolean
    maskPath?: boolean
    blendMode?: boolean
    opacity?: boolean
    defaultColor?: boolean
    isColorable?: boolean
    layerPart?: boolean
    compositeUrl?: boolean
    createdAt?: boolean
  }

  export type TemplateLayerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "templateId" | "name" | "type" | "zIndex" | "transformX" | "transformY" | "transformScaleX" | "transformScaleY" | "transformRotation" | "boundsX" | "boundsY" | "boundsWidth" | "boundsHeight" | "warpData" | "perspectiveData" | "maskPath" | "blendMode" | "opacity" | "defaultColor" | "isColorable" | "layerPart" | "compositeUrl" | "createdAt", ExtArgs["result"]["templateLayer"]>
  export type TemplateLayerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }
  export type TemplateLayerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }
  export type TemplateLayerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }

  export type $TemplateLayerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TemplateLayer"
    objects: {
      template: Prisma.$TemplatePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      templateId: string
      name: string
      type: string
      zIndex: number
      transformX: number | null
      transformY: number | null
      transformScaleX: number | null
      transformScaleY: number | null
      transformRotation: number | null
      boundsX: number | null
      boundsY: number | null
      boundsWidth: number | null
      boundsHeight: number | null
      warpData: string | null
      perspectiveData: string | null
      maskPath: string | null
      blendMode: string
      opacity: number
      defaultColor: string | null
      isColorable: boolean
      layerPart: string | null
      compositeUrl: string | null
      createdAt: Date
    }, ExtArgs["result"]["templateLayer"]>
    composites: {}
  }

  type TemplateLayerGetPayload<S extends boolean | null | undefined | TemplateLayerDefaultArgs> = $Result.GetResult<Prisma.$TemplateLayerPayload, S>

  type TemplateLayerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TemplateLayerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TemplateLayerCountAggregateInputType | true
    }

  export interface TemplateLayerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TemplateLayer'], meta: { name: 'TemplateLayer' } }
    /**
     * Find zero or one TemplateLayer that matches the filter.
     * @param {TemplateLayerFindUniqueArgs} args - Arguments to find a TemplateLayer
     * @example
     * // Get one TemplateLayer
     * const templateLayer = await prisma.templateLayer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TemplateLayerFindUniqueArgs>(args: SelectSubset<T, TemplateLayerFindUniqueArgs<ExtArgs>>): Prisma__TemplateLayerClient<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TemplateLayer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TemplateLayerFindUniqueOrThrowArgs} args - Arguments to find a TemplateLayer
     * @example
     * // Get one TemplateLayer
     * const templateLayer = await prisma.templateLayer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TemplateLayerFindUniqueOrThrowArgs>(args: SelectSubset<T, TemplateLayerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TemplateLayerClient<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TemplateLayer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateLayerFindFirstArgs} args - Arguments to find a TemplateLayer
     * @example
     * // Get one TemplateLayer
     * const templateLayer = await prisma.templateLayer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TemplateLayerFindFirstArgs>(args?: SelectSubset<T, TemplateLayerFindFirstArgs<ExtArgs>>): Prisma__TemplateLayerClient<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TemplateLayer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateLayerFindFirstOrThrowArgs} args - Arguments to find a TemplateLayer
     * @example
     * // Get one TemplateLayer
     * const templateLayer = await prisma.templateLayer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TemplateLayerFindFirstOrThrowArgs>(args?: SelectSubset<T, TemplateLayerFindFirstOrThrowArgs<ExtArgs>>): Prisma__TemplateLayerClient<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TemplateLayers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateLayerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TemplateLayers
     * const templateLayers = await prisma.templateLayer.findMany()
     * 
     * // Get first 10 TemplateLayers
     * const templateLayers = await prisma.templateLayer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const templateLayerWithIdOnly = await prisma.templateLayer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TemplateLayerFindManyArgs>(args?: SelectSubset<T, TemplateLayerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TemplateLayer.
     * @param {TemplateLayerCreateArgs} args - Arguments to create a TemplateLayer.
     * @example
     * // Create one TemplateLayer
     * const TemplateLayer = await prisma.templateLayer.create({
     *   data: {
     *     // ... data to create a TemplateLayer
     *   }
     * })
     * 
     */
    create<T extends TemplateLayerCreateArgs>(args: SelectSubset<T, TemplateLayerCreateArgs<ExtArgs>>): Prisma__TemplateLayerClient<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TemplateLayers.
     * @param {TemplateLayerCreateManyArgs} args - Arguments to create many TemplateLayers.
     * @example
     * // Create many TemplateLayers
     * const templateLayer = await prisma.templateLayer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TemplateLayerCreateManyArgs>(args?: SelectSubset<T, TemplateLayerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TemplateLayers and returns the data saved in the database.
     * @param {TemplateLayerCreateManyAndReturnArgs} args - Arguments to create many TemplateLayers.
     * @example
     * // Create many TemplateLayers
     * const templateLayer = await prisma.templateLayer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TemplateLayers and only return the `id`
     * const templateLayerWithIdOnly = await prisma.templateLayer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TemplateLayerCreateManyAndReturnArgs>(args?: SelectSubset<T, TemplateLayerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TemplateLayer.
     * @param {TemplateLayerDeleteArgs} args - Arguments to delete one TemplateLayer.
     * @example
     * // Delete one TemplateLayer
     * const TemplateLayer = await prisma.templateLayer.delete({
     *   where: {
     *     // ... filter to delete one TemplateLayer
     *   }
     * })
     * 
     */
    delete<T extends TemplateLayerDeleteArgs>(args: SelectSubset<T, TemplateLayerDeleteArgs<ExtArgs>>): Prisma__TemplateLayerClient<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TemplateLayer.
     * @param {TemplateLayerUpdateArgs} args - Arguments to update one TemplateLayer.
     * @example
     * // Update one TemplateLayer
     * const templateLayer = await prisma.templateLayer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TemplateLayerUpdateArgs>(args: SelectSubset<T, TemplateLayerUpdateArgs<ExtArgs>>): Prisma__TemplateLayerClient<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TemplateLayers.
     * @param {TemplateLayerDeleteManyArgs} args - Arguments to filter TemplateLayers to delete.
     * @example
     * // Delete a few TemplateLayers
     * const { count } = await prisma.templateLayer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TemplateLayerDeleteManyArgs>(args?: SelectSubset<T, TemplateLayerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TemplateLayers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateLayerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TemplateLayers
     * const templateLayer = await prisma.templateLayer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TemplateLayerUpdateManyArgs>(args: SelectSubset<T, TemplateLayerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TemplateLayers and returns the data updated in the database.
     * @param {TemplateLayerUpdateManyAndReturnArgs} args - Arguments to update many TemplateLayers.
     * @example
     * // Update many TemplateLayers
     * const templateLayer = await prisma.templateLayer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TemplateLayers and only return the `id`
     * const templateLayerWithIdOnly = await prisma.templateLayer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TemplateLayerUpdateManyAndReturnArgs>(args: SelectSubset<T, TemplateLayerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TemplateLayer.
     * @param {TemplateLayerUpsertArgs} args - Arguments to update or create a TemplateLayer.
     * @example
     * // Update or create a TemplateLayer
     * const templateLayer = await prisma.templateLayer.upsert({
     *   create: {
     *     // ... data to create a TemplateLayer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TemplateLayer we want to update
     *   }
     * })
     */
    upsert<T extends TemplateLayerUpsertArgs>(args: SelectSubset<T, TemplateLayerUpsertArgs<ExtArgs>>): Prisma__TemplateLayerClient<$Result.GetResult<Prisma.$TemplateLayerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TemplateLayers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateLayerCountArgs} args - Arguments to filter TemplateLayers to count.
     * @example
     * // Count the number of TemplateLayers
     * const count = await prisma.templateLayer.count({
     *   where: {
     *     // ... the filter for the TemplateLayers we want to count
     *   }
     * })
    **/
    count<T extends TemplateLayerCountArgs>(
      args?: Subset<T, TemplateLayerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TemplateLayerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TemplateLayer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateLayerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TemplateLayerAggregateArgs>(args: Subset<T, TemplateLayerAggregateArgs>): Prisma.PrismaPromise<GetTemplateLayerAggregateType<T>>

    /**
     * Group by TemplateLayer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateLayerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TemplateLayerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TemplateLayerGroupByArgs['orderBy'] }
        : { orderBy?: TemplateLayerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TemplateLayerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTemplateLayerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TemplateLayer model
   */
  readonly fields: TemplateLayerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TemplateLayer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TemplateLayerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    template<T extends TemplateDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TemplateDefaultArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TemplateLayer model
   */
  interface TemplateLayerFieldRefs {
    readonly id: FieldRef<"TemplateLayer", 'String'>
    readonly templateId: FieldRef<"TemplateLayer", 'String'>
    readonly name: FieldRef<"TemplateLayer", 'String'>
    readonly type: FieldRef<"TemplateLayer", 'String'>
    readonly zIndex: FieldRef<"TemplateLayer", 'Int'>
    readonly transformX: FieldRef<"TemplateLayer", 'Float'>
    readonly transformY: FieldRef<"TemplateLayer", 'Float'>
    readonly transformScaleX: FieldRef<"TemplateLayer", 'Float'>
    readonly transformScaleY: FieldRef<"TemplateLayer", 'Float'>
    readonly transformRotation: FieldRef<"TemplateLayer", 'Float'>
    readonly boundsX: FieldRef<"TemplateLayer", 'Float'>
    readonly boundsY: FieldRef<"TemplateLayer", 'Float'>
    readonly boundsWidth: FieldRef<"TemplateLayer", 'Float'>
    readonly boundsHeight: FieldRef<"TemplateLayer", 'Float'>
    readonly warpData: FieldRef<"TemplateLayer", 'String'>
    readonly perspectiveData: FieldRef<"TemplateLayer", 'String'>
    readonly maskPath: FieldRef<"TemplateLayer", 'String'>
    readonly blendMode: FieldRef<"TemplateLayer", 'String'>
    readonly opacity: FieldRef<"TemplateLayer", 'Float'>
    readonly defaultColor: FieldRef<"TemplateLayer", 'String'>
    readonly isColorable: FieldRef<"TemplateLayer", 'Boolean'>
    readonly layerPart: FieldRef<"TemplateLayer", 'String'>
    readonly compositeUrl: FieldRef<"TemplateLayer", 'String'>
    readonly createdAt: FieldRef<"TemplateLayer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TemplateLayer findUnique
   */
  export type TemplateLayerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
    /**
     * Filter, which TemplateLayer to fetch.
     */
    where: TemplateLayerWhereUniqueInput
  }

  /**
   * TemplateLayer findUniqueOrThrow
   */
  export type TemplateLayerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
    /**
     * Filter, which TemplateLayer to fetch.
     */
    where: TemplateLayerWhereUniqueInput
  }

  /**
   * TemplateLayer findFirst
   */
  export type TemplateLayerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
    /**
     * Filter, which TemplateLayer to fetch.
     */
    where?: TemplateLayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TemplateLayers to fetch.
     */
    orderBy?: TemplateLayerOrderByWithRelationInput | TemplateLayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TemplateLayers.
     */
    cursor?: TemplateLayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TemplateLayers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TemplateLayers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TemplateLayers.
     */
    distinct?: TemplateLayerScalarFieldEnum | TemplateLayerScalarFieldEnum[]
  }

  /**
   * TemplateLayer findFirstOrThrow
   */
  export type TemplateLayerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
    /**
     * Filter, which TemplateLayer to fetch.
     */
    where?: TemplateLayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TemplateLayers to fetch.
     */
    orderBy?: TemplateLayerOrderByWithRelationInput | TemplateLayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TemplateLayers.
     */
    cursor?: TemplateLayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TemplateLayers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TemplateLayers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TemplateLayers.
     */
    distinct?: TemplateLayerScalarFieldEnum | TemplateLayerScalarFieldEnum[]
  }

  /**
   * TemplateLayer findMany
   */
  export type TemplateLayerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
    /**
     * Filter, which TemplateLayers to fetch.
     */
    where?: TemplateLayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TemplateLayers to fetch.
     */
    orderBy?: TemplateLayerOrderByWithRelationInput | TemplateLayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TemplateLayers.
     */
    cursor?: TemplateLayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TemplateLayers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TemplateLayers.
     */
    skip?: number
    distinct?: TemplateLayerScalarFieldEnum | TemplateLayerScalarFieldEnum[]
  }

  /**
   * TemplateLayer create
   */
  export type TemplateLayerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
    /**
     * The data needed to create a TemplateLayer.
     */
    data: XOR<TemplateLayerCreateInput, TemplateLayerUncheckedCreateInput>
  }

  /**
   * TemplateLayer createMany
   */
  export type TemplateLayerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TemplateLayers.
     */
    data: TemplateLayerCreateManyInput | TemplateLayerCreateManyInput[]
  }

  /**
   * TemplateLayer createManyAndReturn
   */
  export type TemplateLayerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * The data used to create many TemplateLayers.
     */
    data: TemplateLayerCreateManyInput | TemplateLayerCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TemplateLayer update
   */
  export type TemplateLayerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
    /**
     * The data needed to update a TemplateLayer.
     */
    data: XOR<TemplateLayerUpdateInput, TemplateLayerUncheckedUpdateInput>
    /**
     * Choose, which TemplateLayer to update.
     */
    where: TemplateLayerWhereUniqueInput
  }

  /**
   * TemplateLayer updateMany
   */
  export type TemplateLayerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TemplateLayers.
     */
    data: XOR<TemplateLayerUpdateManyMutationInput, TemplateLayerUncheckedUpdateManyInput>
    /**
     * Filter which TemplateLayers to update
     */
    where?: TemplateLayerWhereInput
    /**
     * Limit how many TemplateLayers to update.
     */
    limit?: number
  }

  /**
   * TemplateLayer updateManyAndReturn
   */
  export type TemplateLayerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * The data used to update TemplateLayers.
     */
    data: XOR<TemplateLayerUpdateManyMutationInput, TemplateLayerUncheckedUpdateManyInput>
    /**
     * Filter which TemplateLayers to update
     */
    where?: TemplateLayerWhereInput
    /**
     * Limit how many TemplateLayers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TemplateLayer upsert
   */
  export type TemplateLayerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
    /**
     * The filter to search for the TemplateLayer to update in case it exists.
     */
    where: TemplateLayerWhereUniqueInput
    /**
     * In case the TemplateLayer found by the `where` argument doesn't exist, create a new TemplateLayer with this data.
     */
    create: XOR<TemplateLayerCreateInput, TemplateLayerUncheckedCreateInput>
    /**
     * In case the TemplateLayer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TemplateLayerUpdateInput, TemplateLayerUncheckedUpdateInput>
  }

  /**
   * TemplateLayer delete
   */
  export type TemplateLayerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
    /**
     * Filter which TemplateLayer to delete.
     */
    where: TemplateLayerWhereUniqueInput
  }

  /**
   * TemplateLayer deleteMany
   */
  export type TemplateLayerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TemplateLayers to delete
     */
    where?: TemplateLayerWhereInput
    /**
     * Limit how many TemplateLayers to delete.
     */
    limit?: number
  }

  /**
   * TemplateLayer without action
   */
  export type TemplateLayerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateLayer
     */
    select?: TemplateLayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TemplateLayer
     */
    omit?: TemplateLayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateLayerInclude<ExtArgs> | null
  }


  /**
   * Model ColorOption
   */

  export type AggregateColorOption = {
    _count: ColorOptionCountAggregateOutputType | null
    _min: ColorOptionMinAggregateOutputType | null
    _max: ColorOptionMaxAggregateOutputType | null
  }

  export type ColorOptionMinAggregateOutputType = {
    id: string | null
    templateId: string | null
    name: string | null
    layerName: string | null
    colors: string | null
    createdAt: Date | null
  }

  export type ColorOptionMaxAggregateOutputType = {
    id: string | null
    templateId: string | null
    name: string | null
    layerName: string | null
    colors: string | null
    createdAt: Date | null
  }

  export type ColorOptionCountAggregateOutputType = {
    id: number
    templateId: number
    name: number
    layerName: number
    colors: number
    createdAt: number
    _all: number
  }


  export type ColorOptionMinAggregateInputType = {
    id?: true
    templateId?: true
    name?: true
    layerName?: true
    colors?: true
    createdAt?: true
  }

  export type ColorOptionMaxAggregateInputType = {
    id?: true
    templateId?: true
    name?: true
    layerName?: true
    colors?: true
    createdAt?: true
  }

  export type ColorOptionCountAggregateInputType = {
    id?: true
    templateId?: true
    name?: true
    layerName?: true
    colors?: true
    createdAt?: true
    _all?: true
  }

  export type ColorOptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ColorOption to aggregate.
     */
    where?: ColorOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ColorOptions to fetch.
     */
    orderBy?: ColorOptionOrderByWithRelationInput | ColorOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ColorOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ColorOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ColorOptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ColorOptions
    **/
    _count?: true | ColorOptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ColorOptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ColorOptionMaxAggregateInputType
  }

  export type GetColorOptionAggregateType<T extends ColorOptionAggregateArgs> = {
        [P in keyof T & keyof AggregateColorOption]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateColorOption[P]>
      : GetScalarType<T[P], AggregateColorOption[P]>
  }




  export type ColorOptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ColorOptionWhereInput
    orderBy?: ColorOptionOrderByWithAggregationInput | ColorOptionOrderByWithAggregationInput[]
    by: ColorOptionScalarFieldEnum[] | ColorOptionScalarFieldEnum
    having?: ColorOptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ColorOptionCountAggregateInputType | true
    _min?: ColorOptionMinAggregateInputType
    _max?: ColorOptionMaxAggregateInputType
  }

  export type ColorOptionGroupByOutputType = {
    id: string
    templateId: string
    name: string
    layerName: string
    colors: string
    createdAt: Date
    _count: ColorOptionCountAggregateOutputType | null
    _min: ColorOptionMinAggregateOutputType | null
    _max: ColorOptionMaxAggregateOutputType | null
  }

  type GetColorOptionGroupByPayload<T extends ColorOptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ColorOptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ColorOptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ColorOptionGroupByOutputType[P]>
            : GetScalarType<T[P], ColorOptionGroupByOutputType[P]>
        }
      >
    >


  export type ColorOptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    name?: boolean
    layerName?: boolean
    colors?: boolean
    createdAt?: boolean
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["colorOption"]>

  export type ColorOptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    name?: boolean
    layerName?: boolean
    colors?: boolean
    createdAt?: boolean
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["colorOption"]>

  export type ColorOptionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    name?: boolean
    layerName?: boolean
    colors?: boolean
    createdAt?: boolean
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["colorOption"]>

  export type ColorOptionSelectScalar = {
    id?: boolean
    templateId?: boolean
    name?: boolean
    layerName?: boolean
    colors?: boolean
    createdAt?: boolean
  }

  export type ColorOptionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "templateId" | "name" | "layerName" | "colors" | "createdAt", ExtArgs["result"]["colorOption"]>
  export type ColorOptionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }
  export type ColorOptionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }
  export type ColorOptionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }

  export type $ColorOptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ColorOption"
    objects: {
      template: Prisma.$TemplatePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      templateId: string
      name: string
      layerName: string
      colors: string
      createdAt: Date
    }, ExtArgs["result"]["colorOption"]>
    composites: {}
  }

  type ColorOptionGetPayload<S extends boolean | null | undefined | ColorOptionDefaultArgs> = $Result.GetResult<Prisma.$ColorOptionPayload, S>

  type ColorOptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ColorOptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ColorOptionCountAggregateInputType | true
    }

  export interface ColorOptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ColorOption'], meta: { name: 'ColorOption' } }
    /**
     * Find zero or one ColorOption that matches the filter.
     * @param {ColorOptionFindUniqueArgs} args - Arguments to find a ColorOption
     * @example
     * // Get one ColorOption
     * const colorOption = await prisma.colorOption.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ColorOptionFindUniqueArgs>(args: SelectSubset<T, ColorOptionFindUniqueArgs<ExtArgs>>): Prisma__ColorOptionClient<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ColorOption that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ColorOptionFindUniqueOrThrowArgs} args - Arguments to find a ColorOption
     * @example
     * // Get one ColorOption
     * const colorOption = await prisma.colorOption.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ColorOptionFindUniqueOrThrowArgs>(args: SelectSubset<T, ColorOptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ColorOptionClient<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ColorOption that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColorOptionFindFirstArgs} args - Arguments to find a ColorOption
     * @example
     * // Get one ColorOption
     * const colorOption = await prisma.colorOption.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ColorOptionFindFirstArgs>(args?: SelectSubset<T, ColorOptionFindFirstArgs<ExtArgs>>): Prisma__ColorOptionClient<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ColorOption that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColorOptionFindFirstOrThrowArgs} args - Arguments to find a ColorOption
     * @example
     * // Get one ColorOption
     * const colorOption = await prisma.colorOption.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ColorOptionFindFirstOrThrowArgs>(args?: SelectSubset<T, ColorOptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ColorOptionClient<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ColorOptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColorOptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ColorOptions
     * const colorOptions = await prisma.colorOption.findMany()
     * 
     * // Get first 10 ColorOptions
     * const colorOptions = await prisma.colorOption.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const colorOptionWithIdOnly = await prisma.colorOption.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ColorOptionFindManyArgs>(args?: SelectSubset<T, ColorOptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ColorOption.
     * @param {ColorOptionCreateArgs} args - Arguments to create a ColorOption.
     * @example
     * // Create one ColorOption
     * const ColorOption = await prisma.colorOption.create({
     *   data: {
     *     // ... data to create a ColorOption
     *   }
     * })
     * 
     */
    create<T extends ColorOptionCreateArgs>(args: SelectSubset<T, ColorOptionCreateArgs<ExtArgs>>): Prisma__ColorOptionClient<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ColorOptions.
     * @param {ColorOptionCreateManyArgs} args - Arguments to create many ColorOptions.
     * @example
     * // Create many ColorOptions
     * const colorOption = await prisma.colorOption.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ColorOptionCreateManyArgs>(args?: SelectSubset<T, ColorOptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ColorOptions and returns the data saved in the database.
     * @param {ColorOptionCreateManyAndReturnArgs} args - Arguments to create many ColorOptions.
     * @example
     * // Create many ColorOptions
     * const colorOption = await prisma.colorOption.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ColorOptions and only return the `id`
     * const colorOptionWithIdOnly = await prisma.colorOption.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ColorOptionCreateManyAndReturnArgs>(args?: SelectSubset<T, ColorOptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ColorOption.
     * @param {ColorOptionDeleteArgs} args - Arguments to delete one ColorOption.
     * @example
     * // Delete one ColorOption
     * const ColorOption = await prisma.colorOption.delete({
     *   where: {
     *     // ... filter to delete one ColorOption
     *   }
     * })
     * 
     */
    delete<T extends ColorOptionDeleteArgs>(args: SelectSubset<T, ColorOptionDeleteArgs<ExtArgs>>): Prisma__ColorOptionClient<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ColorOption.
     * @param {ColorOptionUpdateArgs} args - Arguments to update one ColorOption.
     * @example
     * // Update one ColorOption
     * const colorOption = await prisma.colorOption.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ColorOptionUpdateArgs>(args: SelectSubset<T, ColorOptionUpdateArgs<ExtArgs>>): Prisma__ColorOptionClient<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ColorOptions.
     * @param {ColorOptionDeleteManyArgs} args - Arguments to filter ColorOptions to delete.
     * @example
     * // Delete a few ColorOptions
     * const { count } = await prisma.colorOption.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ColorOptionDeleteManyArgs>(args?: SelectSubset<T, ColorOptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ColorOptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColorOptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ColorOptions
     * const colorOption = await prisma.colorOption.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ColorOptionUpdateManyArgs>(args: SelectSubset<T, ColorOptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ColorOptions and returns the data updated in the database.
     * @param {ColorOptionUpdateManyAndReturnArgs} args - Arguments to update many ColorOptions.
     * @example
     * // Update many ColorOptions
     * const colorOption = await prisma.colorOption.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ColorOptions and only return the `id`
     * const colorOptionWithIdOnly = await prisma.colorOption.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ColorOptionUpdateManyAndReturnArgs>(args: SelectSubset<T, ColorOptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ColorOption.
     * @param {ColorOptionUpsertArgs} args - Arguments to update or create a ColorOption.
     * @example
     * // Update or create a ColorOption
     * const colorOption = await prisma.colorOption.upsert({
     *   create: {
     *     // ... data to create a ColorOption
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ColorOption we want to update
     *   }
     * })
     */
    upsert<T extends ColorOptionUpsertArgs>(args: SelectSubset<T, ColorOptionUpsertArgs<ExtArgs>>): Prisma__ColorOptionClient<$Result.GetResult<Prisma.$ColorOptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ColorOptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColorOptionCountArgs} args - Arguments to filter ColorOptions to count.
     * @example
     * // Count the number of ColorOptions
     * const count = await prisma.colorOption.count({
     *   where: {
     *     // ... the filter for the ColorOptions we want to count
     *   }
     * })
    **/
    count<T extends ColorOptionCountArgs>(
      args?: Subset<T, ColorOptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ColorOptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ColorOption.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColorOptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ColorOptionAggregateArgs>(args: Subset<T, ColorOptionAggregateArgs>): Prisma.PrismaPromise<GetColorOptionAggregateType<T>>

    /**
     * Group by ColorOption.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColorOptionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ColorOptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ColorOptionGroupByArgs['orderBy'] }
        : { orderBy?: ColorOptionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ColorOptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetColorOptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ColorOption model
   */
  readonly fields: ColorOptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ColorOption.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ColorOptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    template<T extends TemplateDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TemplateDefaultArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ColorOption model
   */
  interface ColorOptionFieldRefs {
    readonly id: FieldRef<"ColorOption", 'String'>
    readonly templateId: FieldRef<"ColorOption", 'String'>
    readonly name: FieldRef<"ColorOption", 'String'>
    readonly layerName: FieldRef<"ColorOption", 'String'>
    readonly colors: FieldRef<"ColorOption", 'String'>
    readonly createdAt: FieldRef<"ColorOption", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ColorOption findUnique
   */
  export type ColorOptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
    /**
     * Filter, which ColorOption to fetch.
     */
    where: ColorOptionWhereUniqueInput
  }

  /**
   * ColorOption findUniqueOrThrow
   */
  export type ColorOptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
    /**
     * Filter, which ColorOption to fetch.
     */
    where: ColorOptionWhereUniqueInput
  }

  /**
   * ColorOption findFirst
   */
  export type ColorOptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
    /**
     * Filter, which ColorOption to fetch.
     */
    where?: ColorOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ColorOptions to fetch.
     */
    orderBy?: ColorOptionOrderByWithRelationInput | ColorOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ColorOptions.
     */
    cursor?: ColorOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ColorOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ColorOptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ColorOptions.
     */
    distinct?: ColorOptionScalarFieldEnum | ColorOptionScalarFieldEnum[]
  }

  /**
   * ColorOption findFirstOrThrow
   */
  export type ColorOptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
    /**
     * Filter, which ColorOption to fetch.
     */
    where?: ColorOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ColorOptions to fetch.
     */
    orderBy?: ColorOptionOrderByWithRelationInput | ColorOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ColorOptions.
     */
    cursor?: ColorOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ColorOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ColorOptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ColorOptions.
     */
    distinct?: ColorOptionScalarFieldEnum | ColorOptionScalarFieldEnum[]
  }

  /**
   * ColorOption findMany
   */
  export type ColorOptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
    /**
     * Filter, which ColorOptions to fetch.
     */
    where?: ColorOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ColorOptions to fetch.
     */
    orderBy?: ColorOptionOrderByWithRelationInput | ColorOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ColorOptions.
     */
    cursor?: ColorOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ColorOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ColorOptions.
     */
    skip?: number
    distinct?: ColorOptionScalarFieldEnum | ColorOptionScalarFieldEnum[]
  }

  /**
   * ColorOption create
   */
  export type ColorOptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
    /**
     * The data needed to create a ColorOption.
     */
    data: XOR<ColorOptionCreateInput, ColorOptionUncheckedCreateInput>
  }

  /**
   * ColorOption createMany
   */
  export type ColorOptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ColorOptions.
     */
    data: ColorOptionCreateManyInput | ColorOptionCreateManyInput[]
  }

  /**
   * ColorOption createManyAndReturn
   */
  export type ColorOptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * The data used to create many ColorOptions.
     */
    data: ColorOptionCreateManyInput | ColorOptionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ColorOption update
   */
  export type ColorOptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
    /**
     * The data needed to update a ColorOption.
     */
    data: XOR<ColorOptionUpdateInput, ColorOptionUncheckedUpdateInput>
    /**
     * Choose, which ColorOption to update.
     */
    where: ColorOptionWhereUniqueInput
  }

  /**
   * ColorOption updateMany
   */
  export type ColorOptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ColorOptions.
     */
    data: XOR<ColorOptionUpdateManyMutationInput, ColorOptionUncheckedUpdateManyInput>
    /**
     * Filter which ColorOptions to update
     */
    where?: ColorOptionWhereInput
    /**
     * Limit how many ColorOptions to update.
     */
    limit?: number
  }

  /**
   * ColorOption updateManyAndReturn
   */
  export type ColorOptionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * The data used to update ColorOptions.
     */
    data: XOR<ColorOptionUpdateManyMutationInput, ColorOptionUncheckedUpdateManyInput>
    /**
     * Filter which ColorOptions to update
     */
    where?: ColorOptionWhereInput
    /**
     * Limit how many ColorOptions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ColorOption upsert
   */
  export type ColorOptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
    /**
     * The filter to search for the ColorOption to update in case it exists.
     */
    where: ColorOptionWhereUniqueInput
    /**
     * In case the ColorOption found by the `where` argument doesn't exist, create a new ColorOption with this data.
     */
    create: XOR<ColorOptionCreateInput, ColorOptionUncheckedCreateInput>
    /**
     * In case the ColorOption was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ColorOptionUpdateInput, ColorOptionUncheckedUpdateInput>
  }

  /**
   * ColorOption delete
   */
  export type ColorOptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
    /**
     * Filter which ColorOption to delete.
     */
    where: ColorOptionWhereUniqueInput
  }

  /**
   * ColorOption deleteMany
   */
  export type ColorOptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ColorOptions to delete
     */
    where?: ColorOptionWhereInput
    /**
     * Limit how many ColorOptions to delete.
     */
    limit?: number
  }

  /**
   * ColorOption without action
   */
  export type ColorOptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColorOption
     */
    select?: ColorOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ColorOption
     */
    omit?: ColorOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColorOptionInclude<ExtArgs> | null
  }


  /**
   * Model Render
   */

  export type AggregateRender = {
    _count: RenderCountAggregateOutputType | null
    _avg: RenderAvgAggregateOutputType | null
    _sum: RenderSumAggregateOutputType | null
    _min: RenderMinAggregateOutputType | null
    _max: RenderMaxAggregateOutputType | null
  }

  export type RenderAvgAggregateOutputType = {
    designX: number | null
    designY: number | null
    designScale: number | null
    designRotation: number | null
    progress: number | null
  }

  export type RenderSumAggregateOutputType = {
    designX: number | null
    designY: number | null
    designScale: number | null
    designRotation: number | null
    progress: number | null
  }

  export type RenderMinAggregateOutputType = {
    id: string | null
    templateId: string | null
    userImage: string | null
    designX: number | null
    designY: number | null
    designScale: number | null
    designRotation: number | null
    colorSelections: string | null
    status: string | null
    resultUrl: string | null
    progress: number | null
    createdAt: Date | null
    completedAt: Date | null
  }

  export type RenderMaxAggregateOutputType = {
    id: string | null
    templateId: string | null
    userImage: string | null
    designX: number | null
    designY: number | null
    designScale: number | null
    designRotation: number | null
    colorSelections: string | null
    status: string | null
    resultUrl: string | null
    progress: number | null
    createdAt: Date | null
    completedAt: Date | null
  }

  export type RenderCountAggregateOutputType = {
    id: number
    templateId: number
    userImage: number
    designX: number
    designY: number
    designScale: number
    designRotation: number
    colorSelections: number
    status: number
    resultUrl: number
    progress: number
    createdAt: number
    completedAt: number
    _all: number
  }


  export type RenderAvgAggregateInputType = {
    designX?: true
    designY?: true
    designScale?: true
    designRotation?: true
    progress?: true
  }

  export type RenderSumAggregateInputType = {
    designX?: true
    designY?: true
    designScale?: true
    designRotation?: true
    progress?: true
  }

  export type RenderMinAggregateInputType = {
    id?: true
    templateId?: true
    userImage?: true
    designX?: true
    designY?: true
    designScale?: true
    designRotation?: true
    colorSelections?: true
    status?: true
    resultUrl?: true
    progress?: true
    createdAt?: true
    completedAt?: true
  }

  export type RenderMaxAggregateInputType = {
    id?: true
    templateId?: true
    userImage?: true
    designX?: true
    designY?: true
    designScale?: true
    designRotation?: true
    colorSelections?: true
    status?: true
    resultUrl?: true
    progress?: true
    createdAt?: true
    completedAt?: true
  }

  export type RenderCountAggregateInputType = {
    id?: true
    templateId?: true
    userImage?: true
    designX?: true
    designY?: true
    designScale?: true
    designRotation?: true
    colorSelections?: true
    status?: true
    resultUrl?: true
    progress?: true
    createdAt?: true
    completedAt?: true
    _all?: true
  }

  export type RenderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Render to aggregate.
     */
    where?: RenderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Renders to fetch.
     */
    orderBy?: RenderOrderByWithRelationInput | RenderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RenderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Renders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Renders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Renders
    **/
    _count?: true | RenderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RenderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RenderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RenderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RenderMaxAggregateInputType
  }

  export type GetRenderAggregateType<T extends RenderAggregateArgs> = {
        [P in keyof T & keyof AggregateRender]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRender[P]>
      : GetScalarType<T[P], AggregateRender[P]>
  }




  export type RenderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RenderWhereInput
    orderBy?: RenderOrderByWithAggregationInput | RenderOrderByWithAggregationInput[]
    by: RenderScalarFieldEnum[] | RenderScalarFieldEnum
    having?: RenderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RenderCountAggregateInputType | true
    _avg?: RenderAvgAggregateInputType
    _sum?: RenderSumAggregateInputType
    _min?: RenderMinAggregateInputType
    _max?: RenderMaxAggregateInputType
  }

  export type RenderGroupByOutputType = {
    id: string
    templateId: string
    userImage: string
    designX: number
    designY: number
    designScale: number
    designRotation: number
    colorSelections: string
    status: string
    resultUrl: string | null
    progress: number
    createdAt: Date
    completedAt: Date | null
    _count: RenderCountAggregateOutputType | null
    _avg: RenderAvgAggregateOutputType | null
    _sum: RenderSumAggregateOutputType | null
    _min: RenderMinAggregateOutputType | null
    _max: RenderMaxAggregateOutputType | null
  }

  type GetRenderGroupByPayload<T extends RenderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RenderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RenderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RenderGroupByOutputType[P]>
            : GetScalarType<T[P], RenderGroupByOutputType[P]>
        }
      >
    >


  export type RenderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    userImage?: boolean
    designX?: boolean
    designY?: boolean
    designScale?: boolean
    designRotation?: boolean
    colorSelections?: boolean
    status?: boolean
    resultUrl?: boolean
    progress?: boolean
    createdAt?: boolean
    completedAt?: boolean
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["render"]>

  export type RenderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    userImage?: boolean
    designX?: boolean
    designY?: boolean
    designScale?: boolean
    designRotation?: boolean
    colorSelections?: boolean
    status?: boolean
    resultUrl?: boolean
    progress?: boolean
    createdAt?: boolean
    completedAt?: boolean
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["render"]>

  export type RenderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    userImage?: boolean
    designX?: boolean
    designY?: boolean
    designScale?: boolean
    designRotation?: boolean
    colorSelections?: boolean
    status?: boolean
    resultUrl?: boolean
    progress?: boolean
    createdAt?: boolean
    completedAt?: boolean
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["render"]>

  export type RenderSelectScalar = {
    id?: boolean
    templateId?: boolean
    userImage?: boolean
    designX?: boolean
    designY?: boolean
    designScale?: boolean
    designRotation?: boolean
    colorSelections?: boolean
    status?: boolean
    resultUrl?: boolean
    progress?: boolean
    createdAt?: boolean
    completedAt?: boolean
  }

  export type RenderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "templateId" | "userImage" | "designX" | "designY" | "designScale" | "designRotation" | "colorSelections" | "status" | "resultUrl" | "progress" | "createdAt" | "completedAt", ExtArgs["result"]["render"]>
  export type RenderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }
  export type RenderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }
  export type RenderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | TemplateDefaultArgs<ExtArgs>
  }

  export type $RenderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Render"
    objects: {
      template: Prisma.$TemplatePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      templateId: string
      userImage: string
      designX: number
      designY: number
      designScale: number
      designRotation: number
      colorSelections: string
      status: string
      resultUrl: string | null
      progress: number
      createdAt: Date
      completedAt: Date | null
    }, ExtArgs["result"]["render"]>
    composites: {}
  }

  type RenderGetPayload<S extends boolean | null | undefined | RenderDefaultArgs> = $Result.GetResult<Prisma.$RenderPayload, S>

  type RenderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RenderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RenderCountAggregateInputType | true
    }

  export interface RenderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Render'], meta: { name: 'Render' } }
    /**
     * Find zero or one Render that matches the filter.
     * @param {RenderFindUniqueArgs} args - Arguments to find a Render
     * @example
     * // Get one Render
     * const render = await prisma.render.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RenderFindUniqueArgs>(args: SelectSubset<T, RenderFindUniqueArgs<ExtArgs>>): Prisma__RenderClient<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Render that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RenderFindUniqueOrThrowArgs} args - Arguments to find a Render
     * @example
     * // Get one Render
     * const render = await prisma.render.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RenderFindUniqueOrThrowArgs>(args: SelectSubset<T, RenderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RenderClient<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Render that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RenderFindFirstArgs} args - Arguments to find a Render
     * @example
     * // Get one Render
     * const render = await prisma.render.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RenderFindFirstArgs>(args?: SelectSubset<T, RenderFindFirstArgs<ExtArgs>>): Prisma__RenderClient<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Render that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RenderFindFirstOrThrowArgs} args - Arguments to find a Render
     * @example
     * // Get one Render
     * const render = await prisma.render.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RenderFindFirstOrThrowArgs>(args?: SelectSubset<T, RenderFindFirstOrThrowArgs<ExtArgs>>): Prisma__RenderClient<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Renders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RenderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Renders
     * const renders = await prisma.render.findMany()
     * 
     * // Get first 10 Renders
     * const renders = await prisma.render.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const renderWithIdOnly = await prisma.render.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RenderFindManyArgs>(args?: SelectSubset<T, RenderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Render.
     * @param {RenderCreateArgs} args - Arguments to create a Render.
     * @example
     * // Create one Render
     * const Render = await prisma.render.create({
     *   data: {
     *     // ... data to create a Render
     *   }
     * })
     * 
     */
    create<T extends RenderCreateArgs>(args: SelectSubset<T, RenderCreateArgs<ExtArgs>>): Prisma__RenderClient<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Renders.
     * @param {RenderCreateManyArgs} args - Arguments to create many Renders.
     * @example
     * // Create many Renders
     * const render = await prisma.render.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RenderCreateManyArgs>(args?: SelectSubset<T, RenderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Renders and returns the data saved in the database.
     * @param {RenderCreateManyAndReturnArgs} args - Arguments to create many Renders.
     * @example
     * // Create many Renders
     * const render = await prisma.render.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Renders and only return the `id`
     * const renderWithIdOnly = await prisma.render.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RenderCreateManyAndReturnArgs>(args?: SelectSubset<T, RenderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Render.
     * @param {RenderDeleteArgs} args - Arguments to delete one Render.
     * @example
     * // Delete one Render
     * const Render = await prisma.render.delete({
     *   where: {
     *     // ... filter to delete one Render
     *   }
     * })
     * 
     */
    delete<T extends RenderDeleteArgs>(args: SelectSubset<T, RenderDeleteArgs<ExtArgs>>): Prisma__RenderClient<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Render.
     * @param {RenderUpdateArgs} args - Arguments to update one Render.
     * @example
     * // Update one Render
     * const render = await prisma.render.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RenderUpdateArgs>(args: SelectSubset<T, RenderUpdateArgs<ExtArgs>>): Prisma__RenderClient<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Renders.
     * @param {RenderDeleteManyArgs} args - Arguments to filter Renders to delete.
     * @example
     * // Delete a few Renders
     * const { count } = await prisma.render.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RenderDeleteManyArgs>(args?: SelectSubset<T, RenderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Renders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RenderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Renders
     * const render = await prisma.render.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RenderUpdateManyArgs>(args: SelectSubset<T, RenderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Renders and returns the data updated in the database.
     * @param {RenderUpdateManyAndReturnArgs} args - Arguments to update many Renders.
     * @example
     * // Update many Renders
     * const render = await prisma.render.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Renders and only return the `id`
     * const renderWithIdOnly = await prisma.render.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RenderUpdateManyAndReturnArgs>(args: SelectSubset<T, RenderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Render.
     * @param {RenderUpsertArgs} args - Arguments to update or create a Render.
     * @example
     * // Update or create a Render
     * const render = await prisma.render.upsert({
     *   create: {
     *     // ... data to create a Render
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Render we want to update
     *   }
     * })
     */
    upsert<T extends RenderUpsertArgs>(args: SelectSubset<T, RenderUpsertArgs<ExtArgs>>): Prisma__RenderClient<$Result.GetResult<Prisma.$RenderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Renders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RenderCountArgs} args - Arguments to filter Renders to count.
     * @example
     * // Count the number of Renders
     * const count = await prisma.render.count({
     *   where: {
     *     // ... the filter for the Renders we want to count
     *   }
     * })
    **/
    count<T extends RenderCountArgs>(
      args?: Subset<T, RenderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RenderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Render.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RenderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RenderAggregateArgs>(args: Subset<T, RenderAggregateArgs>): Prisma.PrismaPromise<GetRenderAggregateType<T>>

    /**
     * Group by Render.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RenderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RenderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RenderGroupByArgs['orderBy'] }
        : { orderBy?: RenderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RenderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRenderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Render model
   */
  readonly fields: RenderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Render.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RenderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    template<T extends TemplateDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TemplateDefaultArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Render model
   */
  interface RenderFieldRefs {
    readonly id: FieldRef<"Render", 'String'>
    readonly templateId: FieldRef<"Render", 'String'>
    readonly userImage: FieldRef<"Render", 'String'>
    readonly designX: FieldRef<"Render", 'Float'>
    readonly designY: FieldRef<"Render", 'Float'>
    readonly designScale: FieldRef<"Render", 'Float'>
    readonly designRotation: FieldRef<"Render", 'Float'>
    readonly colorSelections: FieldRef<"Render", 'String'>
    readonly status: FieldRef<"Render", 'String'>
    readonly resultUrl: FieldRef<"Render", 'String'>
    readonly progress: FieldRef<"Render", 'Int'>
    readonly createdAt: FieldRef<"Render", 'DateTime'>
    readonly completedAt: FieldRef<"Render", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Render findUnique
   */
  export type RenderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
    /**
     * Filter, which Render to fetch.
     */
    where: RenderWhereUniqueInput
  }

  /**
   * Render findUniqueOrThrow
   */
  export type RenderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
    /**
     * Filter, which Render to fetch.
     */
    where: RenderWhereUniqueInput
  }

  /**
   * Render findFirst
   */
  export type RenderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
    /**
     * Filter, which Render to fetch.
     */
    where?: RenderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Renders to fetch.
     */
    orderBy?: RenderOrderByWithRelationInput | RenderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Renders.
     */
    cursor?: RenderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Renders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Renders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Renders.
     */
    distinct?: RenderScalarFieldEnum | RenderScalarFieldEnum[]
  }

  /**
   * Render findFirstOrThrow
   */
  export type RenderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
    /**
     * Filter, which Render to fetch.
     */
    where?: RenderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Renders to fetch.
     */
    orderBy?: RenderOrderByWithRelationInput | RenderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Renders.
     */
    cursor?: RenderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Renders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Renders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Renders.
     */
    distinct?: RenderScalarFieldEnum | RenderScalarFieldEnum[]
  }

  /**
   * Render findMany
   */
  export type RenderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
    /**
     * Filter, which Renders to fetch.
     */
    where?: RenderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Renders to fetch.
     */
    orderBy?: RenderOrderByWithRelationInput | RenderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Renders.
     */
    cursor?: RenderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Renders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Renders.
     */
    skip?: number
    distinct?: RenderScalarFieldEnum | RenderScalarFieldEnum[]
  }

  /**
   * Render create
   */
  export type RenderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
    /**
     * The data needed to create a Render.
     */
    data: XOR<RenderCreateInput, RenderUncheckedCreateInput>
  }

  /**
   * Render createMany
   */
  export type RenderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Renders.
     */
    data: RenderCreateManyInput | RenderCreateManyInput[]
  }

  /**
   * Render createManyAndReturn
   */
  export type RenderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * The data used to create many Renders.
     */
    data: RenderCreateManyInput | RenderCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Render update
   */
  export type RenderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
    /**
     * The data needed to update a Render.
     */
    data: XOR<RenderUpdateInput, RenderUncheckedUpdateInput>
    /**
     * Choose, which Render to update.
     */
    where: RenderWhereUniqueInput
  }

  /**
   * Render updateMany
   */
  export type RenderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Renders.
     */
    data: XOR<RenderUpdateManyMutationInput, RenderUncheckedUpdateManyInput>
    /**
     * Filter which Renders to update
     */
    where?: RenderWhereInput
    /**
     * Limit how many Renders to update.
     */
    limit?: number
  }

  /**
   * Render updateManyAndReturn
   */
  export type RenderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * The data used to update Renders.
     */
    data: XOR<RenderUpdateManyMutationInput, RenderUncheckedUpdateManyInput>
    /**
     * Filter which Renders to update
     */
    where?: RenderWhereInput
    /**
     * Limit how many Renders to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Render upsert
   */
  export type RenderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
    /**
     * The filter to search for the Render to update in case it exists.
     */
    where: RenderWhereUniqueInput
    /**
     * In case the Render found by the `where` argument doesn't exist, create a new Render with this data.
     */
    create: XOR<RenderCreateInput, RenderUncheckedCreateInput>
    /**
     * In case the Render was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RenderUpdateInput, RenderUncheckedUpdateInput>
  }

  /**
   * Render delete
   */
  export type RenderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
    /**
     * Filter which Render to delete.
     */
    where: RenderWhereUniqueInput
  }

  /**
   * Render deleteMany
   */
  export type RenderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Renders to delete
     */
    where?: RenderWhereInput
    /**
     * Limit how many Renders to delete.
     */
    limit?: number
  }

  /**
   * Render without action
   */
  export type RenderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Render
     */
    select?: RenderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Render
     */
    omit?: RenderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RenderInclude<ExtArgs> | null
  }


  /**
   * Model UserImage
   */

  export type AggregateUserImage = {
    _count: UserImageCountAggregateOutputType | null
    _avg: UserImageAvgAggregateOutputType | null
    _sum: UserImageSumAggregateOutputType | null
    _min: UserImageMinAggregateOutputType | null
    _max: UserImageMaxAggregateOutputType | null
  }

  export type UserImageAvgAggregateOutputType = {
    width: number | null
    height: number | null
  }

  export type UserImageSumAggregateOutputType = {
    width: number | null
    height: number | null
  }

  export type UserImageMinAggregateOutputType = {
    id: string | null
    filename: string | null
    originalUrl: string | null
    processedUrl: string | null
    width: number | null
    height: number | null
    createdAt: Date | null
  }

  export type UserImageMaxAggregateOutputType = {
    id: string | null
    filename: string | null
    originalUrl: string | null
    processedUrl: string | null
    width: number | null
    height: number | null
    createdAt: Date | null
  }

  export type UserImageCountAggregateOutputType = {
    id: number
    filename: number
    originalUrl: number
    processedUrl: number
    width: number
    height: number
    createdAt: number
    _all: number
  }


  export type UserImageAvgAggregateInputType = {
    width?: true
    height?: true
  }

  export type UserImageSumAggregateInputType = {
    width?: true
    height?: true
  }

  export type UserImageMinAggregateInputType = {
    id?: true
    filename?: true
    originalUrl?: true
    processedUrl?: true
    width?: true
    height?: true
    createdAt?: true
  }

  export type UserImageMaxAggregateInputType = {
    id?: true
    filename?: true
    originalUrl?: true
    processedUrl?: true
    width?: true
    height?: true
    createdAt?: true
  }

  export type UserImageCountAggregateInputType = {
    id?: true
    filename?: true
    originalUrl?: true
    processedUrl?: true
    width?: true
    height?: true
    createdAt?: true
    _all?: true
  }

  export type UserImageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserImage to aggregate.
     */
    where?: UserImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserImages to fetch.
     */
    orderBy?: UserImageOrderByWithRelationInput | UserImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserImages
    **/
    _count?: true | UserImageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserImageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserImageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserImageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserImageMaxAggregateInputType
  }

  export type GetUserImageAggregateType<T extends UserImageAggregateArgs> = {
        [P in keyof T & keyof AggregateUserImage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserImage[P]>
      : GetScalarType<T[P], AggregateUserImage[P]>
  }




  export type UserImageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserImageWhereInput
    orderBy?: UserImageOrderByWithAggregationInput | UserImageOrderByWithAggregationInput[]
    by: UserImageScalarFieldEnum[] | UserImageScalarFieldEnum
    having?: UserImageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserImageCountAggregateInputType | true
    _avg?: UserImageAvgAggregateInputType
    _sum?: UserImageSumAggregateInputType
    _min?: UserImageMinAggregateInputType
    _max?: UserImageMaxAggregateInputType
  }

  export type UserImageGroupByOutputType = {
    id: string
    filename: string
    originalUrl: string
    processedUrl: string | null
    width: number | null
    height: number | null
    createdAt: Date
    _count: UserImageCountAggregateOutputType | null
    _avg: UserImageAvgAggregateOutputType | null
    _sum: UserImageSumAggregateOutputType | null
    _min: UserImageMinAggregateOutputType | null
    _max: UserImageMaxAggregateOutputType | null
  }

  type GetUserImageGroupByPayload<T extends UserImageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserImageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserImageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserImageGroupByOutputType[P]>
            : GetScalarType<T[P], UserImageGroupByOutputType[P]>
        }
      >
    >


  export type UserImageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    originalUrl?: boolean
    processedUrl?: boolean
    width?: boolean
    height?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["userImage"]>

  export type UserImageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    originalUrl?: boolean
    processedUrl?: boolean
    width?: boolean
    height?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["userImage"]>

  export type UserImageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    originalUrl?: boolean
    processedUrl?: boolean
    width?: boolean
    height?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["userImage"]>

  export type UserImageSelectScalar = {
    id?: boolean
    filename?: boolean
    originalUrl?: boolean
    processedUrl?: boolean
    width?: boolean
    height?: boolean
    createdAt?: boolean
  }

  export type UserImageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "filename" | "originalUrl" | "processedUrl" | "width" | "height" | "createdAt", ExtArgs["result"]["userImage"]>

  export type $UserImagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserImage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      filename: string
      originalUrl: string
      processedUrl: string | null
      width: number | null
      height: number | null
      createdAt: Date
    }, ExtArgs["result"]["userImage"]>
    composites: {}
  }

  type UserImageGetPayload<S extends boolean | null | undefined | UserImageDefaultArgs> = $Result.GetResult<Prisma.$UserImagePayload, S>

  type UserImageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserImageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserImageCountAggregateInputType | true
    }

  export interface UserImageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserImage'], meta: { name: 'UserImage' } }
    /**
     * Find zero or one UserImage that matches the filter.
     * @param {UserImageFindUniqueArgs} args - Arguments to find a UserImage
     * @example
     * // Get one UserImage
     * const userImage = await prisma.userImage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserImageFindUniqueArgs>(args: SelectSubset<T, UserImageFindUniqueArgs<ExtArgs>>): Prisma__UserImageClient<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserImage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserImageFindUniqueOrThrowArgs} args - Arguments to find a UserImage
     * @example
     * // Get one UserImage
     * const userImage = await prisma.userImage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserImageFindUniqueOrThrowArgs>(args: SelectSubset<T, UserImageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserImageClient<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserImage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserImageFindFirstArgs} args - Arguments to find a UserImage
     * @example
     * // Get one UserImage
     * const userImage = await prisma.userImage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserImageFindFirstArgs>(args?: SelectSubset<T, UserImageFindFirstArgs<ExtArgs>>): Prisma__UserImageClient<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserImage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserImageFindFirstOrThrowArgs} args - Arguments to find a UserImage
     * @example
     * // Get one UserImage
     * const userImage = await prisma.userImage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserImageFindFirstOrThrowArgs>(args?: SelectSubset<T, UserImageFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserImageClient<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserImages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserImageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserImages
     * const userImages = await prisma.userImage.findMany()
     * 
     * // Get first 10 UserImages
     * const userImages = await prisma.userImage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userImageWithIdOnly = await prisma.userImage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserImageFindManyArgs>(args?: SelectSubset<T, UserImageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserImage.
     * @param {UserImageCreateArgs} args - Arguments to create a UserImage.
     * @example
     * // Create one UserImage
     * const UserImage = await prisma.userImage.create({
     *   data: {
     *     // ... data to create a UserImage
     *   }
     * })
     * 
     */
    create<T extends UserImageCreateArgs>(args: SelectSubset<T, UserImageCreateArgs<ExtArgs>>): Prisma__UserImageClient<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserImages.
     * @param {UserImageCreateManyArgs} args - Arguments to create many UserImages.
     * @example
     * // Create many UserImages
     * const userImage = await prisma.userImage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserImageCreateManyArgs>(args?: SelectSubset<T, UserImageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserImages and returns the data saved in the database.
     * @param {UserImageCreateManyAndReturnArgs} args - Arguments to create many UserImages.
     * @example
     * // Create many UserImages
     * const userImage = await prisma.userImage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserImages and only return the `id`
     * const userImageWithIdOnly = await prisma.userImage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserImageCreateManyAndReturnArgs>(args?: SelectSubset<T, UserImageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserImage.
     * @param {UserImageDeleteArgs} args - Arguments to delete one UserImage.
     * @example
     * // Delete one UserImage
     * const UserImage = await prisma.userImage.delete({
     *   where: {
     *     // ... filter to delete one UserImage
     *   }
     * })
     * 
     */
    delete<T extends UserImageDeleteArgs>(args: SelectSubset<T, UserImageDeleteArgs<ExtArgs>>): Prisma__UserImageClient<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserImage.
     * @param {UserImageUpdateArgs} args - Arguments to update one UserImage.
     * @example
     * // Update one UserImage
     * const userImage = await prisma.userImage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserImageUpdateArgs>(args: SelectSubset<T, UserImageUpdateArgs<ExtArgs>>): Prisma__UserImageClient<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserImages.
     * @param {UserImageDeleteManyArgs} args - Arguments to filter UserImages to delete.
     * @example
     * // Delete a few UserImages
     * const { count } = await prisma.userImage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserImageDeleteManyArgs>(args?: SelectSubset<T, UserImageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserImageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserImages
     * const userImage = await prisma.userImage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserImageUpdateManyArgs>(args: SelectSubset<T, UserImageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserImages and returns the data updated in the database.
     * @param {UserImageUpdateManyAndReturnArgs} args - Arguments to update many UserImages.
     * @example
     * // Update many UserImages
     * const userImage = await prisma.userImage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserImages and only return the `id`
     * const userImageWithIdOnly = await prisma.userImage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserImageUpdateManyAndReturnArgs>(args: SelectSubset<T, UserImageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserImage.
     * @param {UserImageUpsertArgs} args - Arguments to update or create a UserImage.
     * @example
     * // Update or create a UserImage
     * const userImage = await prisma.userImage.upsert({
     *   create: {
     *     // ... data to create a UserImage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserImage we want to update
     *   }
     * })
     */
    upsert<T extends UserImageUpsertArgs>(args: SelectSubset<T, UserImageUpsertArgs<ExtArgs>>): Prisma__UserImageClient<$Result.GetResult<Prisma.$UserImagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserImageCountArgs} args - Arguments to filter UserImages to count.
     * @example
     * // Count the number of UserImages
     * const count = await prisma.userImage.count({
     *   where: {
     *     // ... the filter for the UserImages we want to count
     *   }
     * })
    **/
    count<T extends UserImageCountArgs>(
      args?: Subset<T, UserImageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserImageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserImageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserImageAggregateArgs>(args: Subset<T, UserImageAggregateArgs>): Prisma.PrismaPromise<GetUserImageAggregateType<T>>

    /**
     * Group by UserImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserImageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserImageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserImageGroupByArgs['orderBy'] }
        : { orderBy?: UserImageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserImageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserImageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserImage model
   */
  readonly fields: UserImageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserImage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserImageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserImage model
   */
  interface UserImageFieldRefs {
    readonly id: FieldRef<"UserImage", 'String'>
    readonly filename: FieldRef<"UserImage", 'String'>
    readonly originalUrl: FieldRef<"UserImage", 'String'>
    readonly processedUrl: FieldRef<"UserImage", 'String'>
    readonly width: FieldRef<"UserImage", 'Int'>
    readonly height: FieldRef<"UserImage", 'Int'>
    readonly createdAt: FieldRef<"UserImage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserImage findUnique
   */
  export type UserImageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * Filter, which UserImage to fetch.
     */
    where: UserImageWhereUniqueInput
  }

  /**
   * UserImage findUniqueOrThrow
   */
  export type UserImageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * Filter, which UserImage to fetch.
     */
    where: UserImageWhereUniqueInput
  }

  /**
   * UserImage findFirst
   */
  export type UserImageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * Filter, which UserImage to fetch.
     */
    where?: UserImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserImages to fetch.
     */
    orderBy?: UserImageOrderByWithRelationInput | UserImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserImages.
     */
    cursor?: UserImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserImages.
     */
    distinct?: UserImageScalarFieldEnum | UserImageScalarFieldEnum[]
  }

  /**
   * UserImage findFirstOrThrow
   */
  export type UserImageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * Filter, which UserImage to fetch.
     */
    where?: UserImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserImages to fetch.
     */
    orderBy?: UserImageOrderByWithRelationInput | UserImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserImages.
     */
    cursor?: UserImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserImages.
     */
    distinct?: UserImageScalarFieldEnum | UserImageScalarFieldEnum[]
  }

  /**
   * UserImage findMany
   */
  export type UserImageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * Filter, which UserImages to fetch.
     */
    where?: UserImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserImages to fetch.
     */
    orderBy?: UserImageOrderByWithRelationInput | UserImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserImages.
     */
    cursor?: UserImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserImages.
     */
    skip?: number
    distinct?: UserImageScalarFieldEnum | UserImageScalarFieldEnum[]
  }

  /**
   * UserImage create
   */
  export type UserImageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * The data needed to create a UserImage.
     */
    data: XOR<UserImageCreateInput, UserImageUncheckedCreateInput>
  }

  /**
   * UserImage createMany
   */
  export type UserImageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserImages.
     */
    data: UserImageCreateManyInput | UserImageCreateManyInput[]
  }

  /**
   * UserImage createManyAndReturn
   */
  export type UserImageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * The data used to create many UserImages.
     */
    data: UserImageCreateManyInput | UserImageCreateManyInput[]
  }

  /**
   * UserImage update
   */
  export type UserImageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * The data needed to update a UserImage.
     */
    data: XOR<UserImageUpdateInput, UserImageUncheckedUpdateInput>
    /**
     * Choose, which UserImage to update.
     */
    where: UserImageWhereUniqueInput
  }

  /**
   * UserImage updateMany
   */
  export type UserImageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserImages.
     */
    data: XOR<UserImageUpdateManyMutationInput, UserImageUncheckedUpdateManyInput>
    /**
     * Filter which UserImages to update
     */
    where?: UserImageWhereInput
    /**
     * Limit how many UserImages to update.
     */
    limit?: number
  }

  /**
   * UserImage updateManyAndReturn
   */
  export type UserImageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * The data used to update UserImages.
     */
    data: XOR<UserImageUpdateManyMutationInput, UserImageUncheckedUpdateManyInput>
    /**
     * Filter which UserImages to update
     */
    where?: UserImageWhereInput
    /**
     * Limit how many UserImages to update.
     */
    limit?: number
  }

  /**
   * UserImage upsert
   */
  export type UserImageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * The filter to search for the UserImage to update in case it exists.
     */
    where: UserImageWhereUniqueInput
    /**
     * In case the UserImage found by the `where` argument doesn't exist, create a new UserImage with this data.
     */
    create: XOR<UserImageCreateInput, UserImageUncheckedCreateInput>
    /**
     * In case the UserImage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserImageUpdateInput, UserImageUncheckedUpdateInput>
  }

  /**
   * UserImage delete
   */
  export type UserImageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
    /**
     * Filter which UserImage to delete.
     */
    where: UserImageWhereUniqueInput
  }

  /**
   * UserImage deleteMany
   */
  export type UserImageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserImages to delete
     */
    where?: UserImageWhereInput
    /**
     * Limit how many UserImages to delete.
     */
    limit?: number
  }

  /**
   * UserImage without action
   */
  export type UserImageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserImage
     */
    select?: UserImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserImage
     */
    omit?: UserImageOmit<ExtArgs> | null
  }


  /**
   * Model PSDTemplate
   */

  export type AggregatePSDTemplate = {
    _count: PSDTemplateCountAggregateOutputType | null
    _avg: PSDTemplateAvgAggregateOutputType | null
    _sum: PSDTemplateSumAggregateOutputType | null
    _min: PSDTemplateMinAggregateOutputType | null
    _max: PSDTemplateMaxAggregateOutputType | null
  }

  export type PSDTemplateAvgAggregateOutputType = {
    width: number | null
    height: number | null
  }

  export type PSDTemplateSumAggregateOutputType = {
    width: number | null
    height: number | null
  }

  export type PSDTemplateMinAggregateOutputType = {
    id: string | null
    name: string | null
    originalFile: string | null
    parsedData: string | null
    width: number | null
    height: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PSDTemplateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    originalFile: string | null
    parsedData: string | null
    width: number | null
    height: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PSDTemplateCountAggregateOutputType = {
    id: number
    name: number
    originalFile: number
    parsedData: number
    width: number
    height: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PSDTemplateAvgAggregateInputType = {
    width?: true
    height?: true
  }

  export type PSDTemplateSumAggregateInputType = {
    width?: true
    height?: true
  }

  export type PSDTemplateMinAggregateInputType = {
    id?: true
    name?: true
    originalFile?: true
    parsedData?: true
    width?: true
    height?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PSDTemplateMaxAggregateInputType = {
    id?: true
    name?: true
    originalFile?: true
    parsedData?: true
    width?: true
    height?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PSDTemplateCountAggregateInputType = {
    id?: true
    name?: true
    originalFile?: true
    parsedData?: true
    width?: true
    height?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PSDTemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PSDTemplate to aggregate.
     */
    where?: PSDTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PSDTemplates to fetch.
     */
    orderBy?: PSDTemplateOrderByWithRelationInput | PSDTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PSDTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PSDTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PSDTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PSDTemplates
    **/
    _count?: true | PSDTemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PSDTemplateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PSDTemplateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PSDTemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PSDTemplateMaxAggregateInputType
  }

  export type GetPSDTemplateAggregateType<T extends PSDTemplateAggregateArgs> = {
        [P in keyof T & keyof AggregatePSDTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePSDTemplate[P]>
      : GetScalarType<T[P], AggregatePSDTemplate[P]>
  }




  export type PSDTemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PSDTemplateWhereInput
    orderBy?: PSDTemplateOrderByWithAggregationInput | PSDTemplateOrderByWithAggregationInput[]
    by: PSDTemplateScalarFieldEnum[] | PSDTemplateScalarFieldEnum
    having?: PSDTemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PSDTemplateCountAggregateInputType | true
    _avg?: PSDTemplateAvgAggregateInputType
    _sum?: PSDTemplateSumAggregateInputType
    _min?: PSDTemplateMinAggregateInputType
    _max?: PSDTemplateMaxAggregateInputType
  }

  export type PSDTemplateGroupByOutputType = {
    id: string
    name: string
    originalFile: string
    parsedData: string
    width: number
    height: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: PSDTemplateCountAggregateOutputType | null
    _avg: PSDTemplateAvgAggregateOutputType | null
    _sum: PSDTemplateSumAggregateOutputType | null
    _min: PSDTemplateMinAggregateOutputType | null
    _max: PSDTemplateMaxAggregateOutputType | null
  }

  type GetPSDTemplateGroupByPayload<T extends PSDTemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PSDTemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PSDTemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PSDTemplateGroupByOutputType[P]>
            : GetScalarType<T[P], PSDTemplateGroupByOutputType[P]>
        }
      >
    >


  export type PSDTemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    originalFile?: boolean
    parsedData?: boolean
    width?: boolean
    height?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["pSDTemplate"]>

  export type PSDTemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    originalFile?: boolean
    parsedData?: boolean
    width?: boolean
    height?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["pSDTemplate"]>

  export type PSDTemplateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    originalFile?: boolean
    parsedData?: boolean
    width?: boolean
    height?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["pSDTemplate"]>

  export type PSDTemplateSelectScalar = {
    id?: boolean
    name?: boolean
    originalFile?: boolean
    parsedData?: boolean
    width?: boolean
    height?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PSDTemplateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "originalFile" | "parsedData" | "width" | "height" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["pSDTemplate"]>

  export type $PSDTemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PSDTemplate"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      originalFile: string
      parsedData: string
      width: number
      height: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["pSDTemplate"]>
    composites: {}
  }

  type PSDTemplateGetPayload<S extends boolean | null | undefined | PSDTemplateDefaultArgs> = $Result.GetResult<Prisma.$PSDTemplatePayload, S>

  type PSDTemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PSDTemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PSDTemplateCountAggregateInputType | true
    }

  export interface PSDTemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PSDTemplate'], meta: { name: 'PSDTemplate' } }
    /**
     * Find zero or one PSDTemplate that matches the filter.
     * @param {PSDTemplateFindUniqueArgs} args - Arguments to find a PSDTemplate
     * @example
     * // Get one PSDTemplate
     * const pSDTemplate = await prisma.pSDTemplate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PSDTemplateFindUniqueArgs>(args: SelectSubset<T, PSDTemplateFindUniqueArgs<ExtArgs>>): Prisma__PSDTemplateClient<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PSDTemplate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PSDTemplateFindUniqueOrThrowArgs} args - Arguments to find a PSDTemplate
     * @example
     * // Get one PSDTemplate
     * const pSDTemplate = await prisma.pSDTemplate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PSDTemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, PSDTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PSDTemplateClient<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PSDTemplate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PSDTemplateFindFirstArgs} args - Arguments to find a PSDTemplate
     * @example
     * // Get one PSDTemplate
     * const pSDTemplate = await prisma.pSDTemplate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PSDTemplateFindFirstArgs>(args?: SelectSubset<T, PSDTemplateFindFirstArgs<ExtArgs>>): Prisma__PSDTemplateClient<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PSDTemplate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PSDTemplateFindFirstOrThrowArgs} args - Arguments to find a PSDTemplate
     * @example
     * // Get one PSDTemplate
     * const pSDTemplate = await prisma.pSDTemplate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PSDTemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, PSDTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__PSDTemplateClient<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PSDTemplates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PSDTemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PSDTemplates
     * const pSDTemplates = await prisma.pSDTemplate.findMany()
     * 
     * // Get first 10 PSDTemplates
     * const pSDTemplates = await prisma.pSDTemplate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pSDTemplateWithIdOnly = await prisma.pSDTemplate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PSDTemplateFindManyArgs>(args?: SelectSubset<T, PSDTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PSDTemplate.
     * @param {PSDTemplateCreateArgs} args - Arguments to create a PSDTemplate.
     * @example
     * // Create one PSDTemplate
     * const PSDTemplate = await prisma.pSDTemplate.create({
     *   data: {
     *     // ... data to create a PSDTemplate
     *   }
     * })
     * 
     */
    create<T extends PSDTemplateCreateArgs>(args: SelectSubset<T, PSDTemplateCreateArgs<ExtArgs>>): Prisma__PSDTemplateClient<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PSDTemplates.
     * @param {PSDTemplateCreateManyArgs} args - Arguments to create many PSDTemplates.
     * @example
     * // Create many PSDTemplates
     * const pSDTemplate = await prisma.pSDTemplate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PSDTemplateCreateManyArgs>(args?: SelectSubset<T, PSDTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PSDTemplates and returns the data saved in the database.
     * @param {PSDTemplateCreateManyAndReturnArgs} args - Arguments to create many PSDTemplates.
     * @example
     * // Create many PSDTemplates
     * const pSDTemplate = await prisma.pSDTemplate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PSDTemplates and only return the `id`
     * const pSDTemplateWithIdOnly = await prisma.pSDTemplate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PSDTemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, PSDTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PSDTemplate.
     * @param {PSDTemplateDeleteArgs} args - Arguments to delete one PSDTemplate.
     * @example
     * // Delete one PSDTemplate
     * const PSDTemplate = await prisma.pSDTemplate.delete({
     *   where: {
     *     // ... filter to delete one PSDTemplate
     *   }
     * })
     * 
     */
    delete<T extends PSDTemplateDeleteArgs>(args: SelectSubset<T, PSDTemplateDeleteArgs<ExtArgs>>): Prisma__PSDTemplateClient<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PSDTemplate.
     * @param {PSDTemplateUpdateArgs} args - Arguments to update one PSDTemplate.
     * @example
     * // Update one PSDTemplate
     * const pSDTemplate = await prisma.pSDTemplate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PSDTemplateUpdateArgs>(args: SelectSubset<T, PSDTemplateUpdateArgs<ExtArgs>>): Prisma__PSDTemplateClient<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PSDTemplates.
     * @param {PSDTemplateDeleteManyArgs} args - Arguments to filter PSDTemplates to delete.
     * @example
     * // Delete a few PSDTemplates
     * const { count } = await prisma.pSDTemplate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PSDTemplateDeleteManyArgs>(args?: SelectSubset<T, PSDTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PSDTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PSDTemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PSDTemplates
     * const pSDTemplate = await prisma.pSDTemplate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PSDTemplateUpdateManyArgs>(args: SelectSubset<T, PSDTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PSDTemplates and returns the data updated in the database.
     * @param {PSDTemplateUpdateManyAndReturnArgs} args - Arguments to update many PSDTemplates.
     * @example
     * // Update many PSDTemplates
     * const pSDTemplate = await prisma.pSDTemplate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PSDTemplates and only return the `id`
     * const pSDTemplateWithIdOnly = await prisma.pSDTemplate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PSDTemplateUpdateManyAndReturnArgs>(args: SelectSubset<T, PSDTemplateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PSDTemplate.
     * @param {PSDTemplateUpsertArgs} args - Arguments to update or create a PSDTemplate.
     * @example
     * // Update or create a PSDTemplate
     * const pSDTemplate = await prisma.pSDTemplate.upsert({
     *   create: {
     *     // ... data to create a PSDTemplate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PSDTemplate we want to update
     *   }
     * })
     */
    upsert<T extends PSDTemplateUpsertArgs>(args: SelectSubset<T, PSDTemplateUpsertArgs<ExtArgs>>): Prisma__PSDTemplateClient<$Result.GetResult<Prisma.$PSDTemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PSDTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PSDTemplateCountArgs} args - Arguments to filter PSDTemplates to count.
     * @example
     * // Count the number of PSDTemplates
     * const count = await prisma.pSDTemplate.count({
     *   where: {
     *     // ... the filter for the PSDTemplates we want to count
     *   }
     * })
    **/
    count<T extends PSDTemplateCountArgs>(
      args?: Subset<T, PSDTemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PSDTemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PSDTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PSDTemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PSDTemplateAggregateArgs>(args: Subset<T, PSDTemplateAggregateArgs>): Prisma.PrismaPromise<GetPSDTemplateAggregateType<T>>

    /**
     * Group by PSDTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PSDTemplateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PSDTemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PSDTemplateGroupByArgs['orderBy'] }
        : { orderBy?: PSDTemplateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PSDTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPSDTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PSDTemplate model
   */
  readonly fields: PSDTemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PSDTemplate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PSDTemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PSDTemplate model
   */
  interface PSDTemplateFieldRefs {
    readonly id: FieldRef<"PSDTemplate", 'String'>
    readonly name: FieldRef<"PSDTemplate", 'String'>
    readonly originalFile: FieldRef<"PSDTemplate", 'String'>
    readonly parsedData: FieldRef<"PSDTemplate", 'String'>
    readonly width: FieldRef<"PSDTemplate", 'Int'>
    readonly height: FieldRef<"PSDTemplate", 'Int'>
    readonly isActive: FieldRef<"PSDTemplate", 'Boolean'>
    readonly createdAt: FieldRef<"PSDTemplate", 'DateTime'>
    readonly updatedAt: FieldRef<"PSDTemplate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PSDTemplate findUnique
   */
  export type PSDTemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * Filter, which PSDTemplate to fetch.
     */
    where: PSDTemplateWhereUniqueInput
  }

  /**
   * PSDTemplate findUniqueOrThrow
   */
  export type PSDTemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * Filter, which PSDTemplate to fetch.
     */
    where: PSDTemplateWhereUniqueInput
  }

  /**
   * PSDTemplate findFirst
   */
  export type PSDTemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * Filter, which PSDTemplate to fetch.
     */
    where?: PSDTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PSDTemplates to fetch.
     */
    orderBy?: PSDTemplateOrderByWithRelationInput | PSDTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PSDTemplates.
     */
    cursor?: PSDTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PSDTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PSDTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PSDTemplates.
     */
    distinct?: PSDTemplateScalarFieldEnum | PSDTemplateScalarFieldEnum[]
  }

  /**
   * PSDTemplate findFirstOrThrow
   */
  export type PSDTemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * Filter, which PSDTemplate to fetch.
     */
    where?: PSDTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PSDTemplates to fetch.
     */
    orderBy?: PSDTemplateOrderByWithRelationInput | PSDTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PSDTemplates.
     */
    cursor?: PSDTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PSDTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PSDTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PSDTemplates.
     */
    distinct?: PSDTemplateScalarFieldEnum | PSDTemplateScalarFieldEnum[]
  }

  /**
   * PSDTemplate findMany
   */
  export type PSDTemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * Filter, which PSDTemplates to fetch.
     */
    where?: PSDTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PSDTemplates to fetch.
     */
    orderBy?: PSDTemplateOrderByWithRelationInput | PSDTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PSDTemplates.
     */
    cursor?: PSDTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PSDTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PSDTemplates.
     */
    skip?: number
    distinct?: PSDTemplateScalarFieldEnum | PSDTemplateScalarFieldEnum[]
  }

  /**
   * PSDTemplate create
   */
  export type PSDTemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * The data needed to create a PSDTemplate.
     */
    data: XOR<PSDTemplateCreateInput, PSDTemplateUncheckedCreateInput>
  }

  /**
   * PSDTemplate createMany
   */
  export type PSDTemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PSDTemplates.
     */
    data: PSDTemplateCreateManyInput | PSDTemplateCreateManyInput[]
  }

  /**
   * PSDTemplate createManyAndReturn
   */
  export type PSDTemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * The data used to create many PSDTemplates.
     */
    data: PSDTemplateCreateManyInput | PSDTemplateCreateManyInput[]
  }

  /**
   * PSDTemplate update
   */
  export type PSDTemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * The data needed to update a PSDTemplate.
     */
    data: XOR<PSDTemplateUpdateInput, PSDTemplateUncheckedUpdateInput>
    /**
     * Choose, which PSDTemplate to update.
     */
    where: PSDTemplateWhereUniqueInput
  }

  /**
   * PSDTemplate updateMany
   */
  export type PSDTemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PSDTemplates.
     */
    data: XOR<PSDTemplateUpdateManyMutationInput, PSDTemplateUncheckedUpdateManyInput>
    /**
     * Filter which PSDTemplates to update
     */
    where?: PSDTemplateWhereInput
    /**
     * Limit how many PSDTemplates to update.
     */
    limit?: number
  }

  /**
   * PSDTemplate updateManyAndReturn
   */
  export type PSDTemplateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * The data used to update PSDTemplates.
     */
    data: XOR<PSDTemplateUpdateManyMutationInput, PSDTemplateUncheckedUpdateManyInput>
    /**
     * Filter which PSDTemplates to update
     */
    where?: PSDTemplateWhereInput
    /**
     * Limit how many PSDTemplates to update.
     */
    limit?: number
  }

  /**
   * PSDTemplate upsert
   */
  export type PSDTemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * The filter to search for the PSDTemplate to update in case it exists.
     */
    where: PSDTemplateWhereUniqueInput
    /**
     * In case the PSDTemplate found by the `where` argument doesn't exist, create a new PSDTemplate with this data.
     */
    create: XOR<PSDTemplateCreateInput, PSDTemplateUncheckedCreateInput>
    /**
     * In case the PSDTemplate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PSDTemplateUpdateInput, PSDTemplateUncheckedUpdateInput>
  }

  /**
   * PSDTemplate delete
   */
  export type PSDTemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
    /**
     * Filter which PSDTemplate to delete.
     */
    where: PSDTemplateWhereUniqueInput
  }

  /**
   * PSDTemplate deleteMany
   */
  export type PSDTemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PSDTemplates to delete
     */
    where?: PSDTemplateWhereInput
    /**
     * Limit how many PSDTemplates to delete.
     */
    limit?: number
  }

  /**
   * PSDTemplate without action
   */
  export type PSDTemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PSDTemplate
     */
    select?: PSDTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PSDTemplate
     */
    omit?: PSDTemplateOmit<ExtArgs> | null
  }


  /**
   * Model BookTemplate
   */

  export type AggregateBookTemplate = {
    _count: BookTemplateCountAggregateOutputType | null
    _avg: BookTemplateAvgAggregateOutputType | null
    _sum: BookTemplateSumAggregateOutputType | null
    _min: BookTemplateMinAggregateOutputType | null
    _max: BookTemplateMaxAggregateOutputType | null
  }

  export type BookTemplateAvgAggregateOutputType = {
    coverWidth: number | null
    coverHeight: number | null
    spineWidth: number | null
  }

  export type BookTemplateSumAggregateOutputType = {
    coverWidth: number | null
    coverHeight: number | null
    spineWidth: number | null
  }

  export type BookTemplateMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    coverWidth: number | null
    coverHeight: number | null
    spineWidth: number | null
    thumbnail: string | null
    previewImage: string | null
    baseImage: string | null
    warpPreset: string | null
    bookType: string | null
    showPages: boolean | null
    pageColor: string | null
    showShadow: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BookTemplateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    coverWidth: number | null
    coverHeight: number | null
    spineWidth: number | null
    thumbnail: string | null
    previewImage: string | null
    baseImage: string | null
    warpPreset: string | null
    bookType: string | null
    showPages: boolean | null
    pageColor: string | null
    showShadow: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BookTemplateCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    description: number
    coverWidth: number
    coverHeight: number
    spineWidth: number
    thumbnail: number
    previewImage: number
    baseImage: number
    warpPreset: number
    bookType: number
    showPages: number
    pageColor: number
    showShadow: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BookTemplateAvgAggregateInputType = {
    coverWidth?: true
    coverHeight?: true
    spineWidth?: true
  }

  export type BookTemplateSumAggregateInputType = {
    coverWidth?: true
    coverHeight?: true
    spineWidth?: true
  }

  export type BookTemplateMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    coverWidth?: true
    coverHeight?: true
    spineWidth?: true
    thumbnail?: true
    previewImage?: true
    baseImage?: true
    warpPreset?: true
    bookType?: true
    showPages?: true
    pageColor?: true
    showShadow?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BookTemplateMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    coverWidth?: true
    coverHeight?: true
    spineWidth?: true
    thumbnail?: true
    previewImage?: true
    baseImage?: true
    warpPreset?: true
    bookType?: true
    showPages?: true
    pageColor?: true
    showShadow?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BookTemplateCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    coverWidth?: true
    coverHeight?: true
    spineWidth?: true
    thumbnail?: true
    previewImage?: true
    baseImage?: true
    warpPreset?: true
    bookType?: true
    showPages?: true
    pageColor?: true
    showShadow?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BookTemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BookTemplate to aggregate.
     */
    where?: BookTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BookTemplates to fetch.
     */
    orderBy?: BookTemplateOrderByWithRelationInput | BookTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BookTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BookTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BookTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BookTemplates
    **/
    _count?: true | BookTemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BookTemplateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BookTemplateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BookTemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BookTemplateMaxAggregateInputType
  }

  export type GetBookTemplateAggregateType<T extends BookTemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateBookTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBookTemplate[P]>
      : GetScalarType<T[P], AggregateBookTemplate[P]>
  }




  export type BookTemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookTemplateWhereInput
    orderBy?: BookTemplateOrderByWithAggregationInput | BookTemplateOrderByWithAggregationInput[]
    by: BookTemplateScalarFieldEnum[] | BookTemplateScalarFieldEnum
    having?: BookTemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BookTemplateCountAggregateInputType | true
    _avg?: BookTemplateAvgAggregateInputType
    _sum?: BookTemplateSumAggregateInputType
    _min?: BookTemplateMinAggregateInputType
    _max?: BookTemplateMaxAggregateInputType
  }

  export type BookTemplateGroupByOutputType = {
    id: string
    name: string
    slug: string
    description: string | null
    coverWidth: number
    coverHeight: number
    spineWidth: number
    thumbnail: string
    previewImage: string
    baseImage: string
    warpPreset: string
    bookType: string
    showPages: boolean
    pageColor: string
    showShadow: boolean
    createdAt: Date
    updatedAt: Date
    _count: BookTemplateCountAggregateOutputType | null
    _avg: BookTemplateAvgAggregateOutputType | null
    _sum: BookTemplateSumAggregateOutputType | null
    _min: BookTemplateMinAggregateOutputType | null
    _max: BookTemplateMaxAggregateOutputType | null
  }

  type GetBookTemplateGroupByPayload<T extends BookTemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BookTemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BookTemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BookTemplateGroupByOutputType[P]>
            : GetScalarType<T[P], BookTemplateGroupByOutputType[P]>
        }
      >
    >


  export type BookTemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    coverWidth?: boolean
    coverHeight?: boolean
    spineWidth?: boolean
    thumbnail?: boolean
    previewImage?: boolean
    baseImage?: boolean
    warpPreset?: boolean
    bookType?: boolean
    showPages?: boolean
    pageColor?: boolean
    showShadow?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["bookTemplate"]>

  export type BookTemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    coverWidth?: boolean
    coverHeight?: boolean
    spineWidth?: boolean
    thumbnail?: boolean
    previewImage?: boolean
    baseImage?: boolean
    warpPreset?: boolean
    bookType?: boolean
    showPages?: boolean
    pageColor?: boolean
    showShadow?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["bookTemplate"]>

  export type BookTemplateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    coverWidth?: boolean
    coverHeight?: boolean
    spineWidth?: boolean
    thumbnail?: boolean
    previewImage?: boolean
    baseImage?: boolean
    warpPreset?: boolean
    bookType?: boolean
    showPages?: boolean
    pageColor?: boolean
    showShadow?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["bookTemplate"]>

  export type BookTemplateSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    coverWidth?: boolean
    coverHeight?: boolean
    spineWidth?: boolean
    thumbnail?: boolean
    previewImage?: boolean
    baseImage?: boolean
    warpPreset?: boolean
    bookType?: boolean
    showPages?: boolean
    pageColor?: boolean
    showShadow?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BookTemplateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "description" | "coverWidth" | "coverHeight" | "spineWidth" | "thumbnail" | "previewImage" | "baseImage" | "warpPreset" | "bookType" | "showPages" | "pageColor" | "showShadow" | "createdAt" | "updatedAt", ExtArgs["result"]["bookTemplate"]>

  export type $BookTemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BookTemplate"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      description: string | null
      coverWidth: number
      coverHeight: number
      spineWidth: number
      thumbnail: string
      previewImage: string
      baseImage: string
      warpPreset: string
      bookType: string
      showPages: boolean
      pageColor: string
      showShadow: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["bookTemplate"]>
    composites: {}
  }

  type BookTemplateGetPayload<S extends boolean | null | undefined | BookTemplateDefaultArgs> = $Result.GetResult<Prisma.$BookTemplatePayload, S>

  type BookTemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BookTemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BookTemplateCountAggregateInputType | true
    }

  export interface BookTemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BookTemplate'], meta: { name: 'BookTemplate' } }
    /**
     * Find zero or one BookTemplate that matches the filter.
     * @param {BookTemplateFindUniqueArgs} args - Arguments to find a BookTemplate
     * @example
     * // Get one BookTemplate
     * const bookTemplate = await prisma.bookTemplate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BookTemplateFindUniqueArgs>(args: SelectSubset<T, BookTemplateFindUniqueArgs<ExtArgs>>): Prisma__BookTemplateClient<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BookTemplate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BookTemplateFindUniqueOrThrowArgs} args - Arguments to find a BookTemplate
     * @example
     * // Get one BookTemplate
     * const bookTemplate = await prisma.bookTemplate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BookTemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, BookTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BookTemplateClient<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BookTemplate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookTemplateFindFirstArgs} args - Arguments to find a BookTemplate
     * @example
     * // Get one BookTemplate
     * const bookTemplate = await prisma.bookTemplate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BookTemplateFindFirstArgs>(args?: SelectSubset<T, BookTemplateFindFirstArgs<ExtArgs>>): Prisma__BookTemplateClient<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BookTemplate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookTemplateFindFirstOrThrowArgs} args - Arguments to find a BookTemplate
     * @example
     * // Get one BookTemplate
     * const bookTemplate = await prisma.bookTemplate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BookTemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, BookTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__BookTemplateClient<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BookTemplates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookTemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BookTemplates
     * const bookTemplates = await prisma.bookTemplate.findMany()
     * 
     * // Get first 10 BookTemplates
     * const bookTemplates = await prisma.bookTemplate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bookTemplateWithIdOnly = await prisma.bookTemplate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BookTemplateFindManyArgs>(args?: SelectSubset<T, BookTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BookTemplate.
     * @param {BookTemplateCreateArgs} args - Arguments to create a BookTemplate.
     * @example
     * // Create one BookTemplate
     * const BookTemplate = await prisma.bookTemplate.create({
     *   data: {
     *     // ... data to create a BookTemplate
     *   }
     * })
     * 
     */
    create<T extends BookTemplateCreateArgs>(args: SelectSubset<T, BookTemplateCreateArgs<ExtArgs>>): Prisma__BookTemplateClient<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BookTemplates.
     * @param {BookTemplateCreateManyArgs} args - Arguments to create many BookTemplates.
     * @example
     * // Create many BookTemplates
     * const bookTemplate = await prisma.bookTemplate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BookTemplateCreateManyArgs>(args?: SelectSubset<T, BookTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BookTemplates and returns the data saved in the database.
     * @param {BookTemplateCreateManyAndReturnArgs} args - Arguments to create many BookTemplates.
     * @example
     * // Create many BookTemplates
     * const bookTemplate = await prisma.bookTemplate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BookTemplates and only return the `id`
     * const bookTemplateWithIdOnly = await prisma.bookTemplate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BookTemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, BookTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BookTemplate.
     * @param {BookTemplateDeleteArgs} args - Arguments to delete one BookTemplate.
     * @example
     * // Delete one BookTemplate
     * const BookTemplate = await prisma.bookTemplate.delete({
     *   where: {
     *     // ... filter to delete one BookTemplate
     *   }
     * })
     * 
     */
    delete<T extends BookTemplateDeleteArgs>(args: SelectSubset<T, BookTemplateDeleteArgs<ExtArgs>>): Prisma__BookTemplateClient<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BookTemplate.
     * @param {BookTemplateUpdateArgs} args - Arguments to update one BookTemplate.
     * @example
     * // Update one BookTemplate
     * const bookTemplate = await prisma.bookTemplate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BookTemplateUpdateArgs>(args: SelectSubset<T, BookTemplateUpdateArgs<ExtArgs>>): Prisma__BookTemplateClient<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BookTemplates.
     * @param {BookTemplateDeleteManyArgs} args - Arguments to filter BookTemplates to delete.
     * @example
     * // Delete a few BookTemplates
     * const { count } = await prisma.bookTemplate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BookTemplateDeleteManyArgs>(args?: SelectSubset<T, BookTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BookTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookTemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BookTemplates
     * const bookTemplate = await prisma.bookTemplate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BookTemplateUpdateManyArgs>(args: SelectSubset<T, BookTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BookTemplates and returns the data updated in the database.
     * @param {BookTemplateUpdateManyAndReturnArgs} args - Arguments to update many BookTemplates.
     * @example
     * // Update many BookTemplates
     * const bookTemplate = await prisma.bookTemplate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BookTemplates and only return the `id`
     * const bookTemplateWithIdOnly = await prisma.bookTemplate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BookTemplateUpdateManyAndReturnArgs>(args: SelectSubset<T, BookTemplateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BookTemplate.
     * @param {BookTemplateUpsertArgs} args - Arguments to update or create a BookTemplate.
     * @example
     * // Update or create a BookTemplate
     * const bookTemplate = await prisma.bookTemplate.upsert({
     *   create: {
     *     // ... data to create a BookTemplate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BookTemplate we want to update
     *   }
     * })
     */
    upsert<T extends BookTemplateUpsertArgs>(args: SelectSubset<T, BookTemplateUpsertArgs<ExtArgs>>): Prisma__BookTemplateClient<$Result.GetResult<Prisma.$BookTemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BookTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookTemplateCountArgs} args - Arguments to filter BookTemplates to count.
     * @example
     * // Count the number of BookTemplates
     * const count = await prisma.bookTemplate.count({
     *   where: {
     *     // ... the filter for the BookTemplates we want to count
     *   }
     * })
    **/
    count<T extends BookTemplateCountArgs>(
      args?: Subset<T, BookTemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BookTemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BookTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookTemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BookTemplateAggregateArgs>(args: Subset<T, BookTemplateAggregateArgs>): Prisma.PrismaPromise<GetBookTemplateAggregateType<T>>

    /**
     * Group by BookTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookTemplateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BookTemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BookTemplateGroupByArgs['orderBy'] }
        : { orderBy?: BookTemplateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BookTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBookTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BookTemplate model
   */
  readonly fields: BookTemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BookTemplate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BookTemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BookTemplate model
   */
  interface BookTemplateFieldRefs {
    readonly id: FieldRef<"BookTemplate", 'String'>
    readonly name: FieldRef<"BookTemplate", 'String'>
    readonly slug: FieldRef<"BookTemplate", 'String'>
    readonly description: FieldRef<"BookTemplate", 'String'>
    readonly coverWidth: FieldRef<"BookTemplate", 'Float'>
    readonly coverHeight: FieldRef<"BookTemplate", 'Float'>
    readonly spineWidth: FieldRef<"BookTemplate", 'Float'>
    readonly thumbnail: FieldRef<"BookTemplate", 'String'>
    readonly previewImage: FieldRef<"BookTemplate", 'String'>
    readonly baseImage: FieldRef<"BookTemplate", 'String'>
    readonly warpPreset: FieldRef<"BookTemplate", 'String'>
    readonly bookType: FieldRef<"BookTemplate", 'String'>
    readonly showPages: FieldRef<"BookTemplate", 'Boolean'>
    readonly pageColor: FieldRef<"BookTemplate", 'String'>
    readonly showShadow: FieldRef<"BookTemplate", 'Boolean'>
    readonly createdAt: FieldRef<"BookTemplate", 'DateTime'>
    readonly updatedAt: FieldRef<"BookTemplate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BookTemplate findUnique
   */
  export type BookTemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * Filter, which BookTemplate to fetch.
     */
    where: BookTemplateWhereUniqueInput
  }

  /**
   * BookTemplate findUniqueOrThrow
   */
  export type BookTemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * Filter, which BookTemplate to fetch.
     */
    where: BookTemplateWhereUniqueInput
  }

  /**
   * BookTemplate findFirst
   */
  export type BookTemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * Filter, which BookTemplate to fetch.
     */
    where?: BookTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BookTemplates to fetch.
     */
    orderBy?: BookTemplateOrderByWithRelationInput | BookTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BookTemplates.
     */
    cursor?: BookTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BookTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BookTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BookTemplates.
     */
    distinct?: BookTemplateScalarFieldEnum | BookTemplateScalarFieldEnum[]
  }

  /**
   * BookTemplate findFirstOrThrow
   */
  export type BookTemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * Filter, which BookTemplate to fetch.
     */
    where?: BookTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BookTemplates to fetch.
     */
    orderBy?: BookTemplateOrderByWithRelationInput | BookTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BookTemplates.
     */
    cursor?: BookTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BookTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BookTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BookTemplates.
     */
    distinct?: BookTemplateScalarFieldEnum | BookTemplateScalarFieldEnum[]
  }

  /**
   * BookTemplate findMany
   */
  export type BookTemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * Filter, which BookTemplates to fetch.
     */
    where?: BookTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BookTemplates to fetch.
     */
    orderBy?: BookTemplateOrderByWithRelationInput | BookTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BookTemplates.
     */
    cursor?: BookTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BookTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BookTemplates.
     */
    skip?: number
    distinct?: BookTemplateScalarFieldEnum | BookTemplateScalarFieldEnum[]
  }

  /**
   * BookTemplate create
   */
  export type BookTemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * The data needed to create a BookTemplate.
     */
    data: XOR<BookTemplateCreateInput, BookTemplateUncheckedCreateInput>
  }

  /**
   * BookTemplate createMany
   */
  export type BookTemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BookTemplates.
     */
    data: BookTemplateCreateManyInput | BookTemplateCreateManyInput[]
  }

  /**
   * BookTemplate createManyAndReturn
   */
  export type BookTemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * The data used to create many BookTemplates.
     */
    data: BookTemplateCreateManyInput | BookTemplateCreateManyInput[]
  }

  /**
   * BookTemplate update
   */
  export type BookTemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * The data needed to update a BookTemplate.
     */
    data: XOR<BookTemplateUpdateInput, BookTemplateUncheckedUpdateInput>
    /**
     * Choose, which BookTemplate to update.
     */
    where: BookTemplateWhereUniqueInput
  }

  /**
   * BookTemplate updateMany
   */
  export type BookTemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BookTemplates.
     */
    data: XOR<BookTemplateUpdateManyMutationInput, BookTemplateUncheckedUpdateManyInput>
    /**
     * Filter which BookTemplates to update
     */
    where?: BookTemplateWhereInput
    /**
     * Limit how many BookTemplates to update.
     */
    limit?: number
  }

  /**
   * BookTemplate updateManyAndReturn
   */
  export type BookTemplateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * The data used to update BookTemplates.
     */
    data: XOR<BookTemplateUpdateManyMutationInput, BookTemplateUncheckedUpdateManyInput>
    /**
     * Filter which BookTemplates to update
     */
    where?: BookTemplateWhereInput
    /**
     * Limit how many BookTemplates to update.
     */
    limit?: number
  }

  /**
   * BookTemplate upsert
   */
  export type BookTemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * The filter to search for the BookTemplate to update in case it exists.
     */
    where: BookTemplateWhereUniqueInput
    /**
     * In case the BookTemplate found by the `where` argument doesn't exist, create a new BookTemplate with this data.
     */
    create: XOR<BookTemplateCreateInput, BookTemplateUncheckedCreateInput>
    /**
     * In case the BookTemplate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BookTemplateUpdateInput, BookTemplateUncheckedUpdateInput>
  }

  /**
   * BookTemplate delete
   */
  export type BookTemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
    /**
     * Filter which BookTemplate to delete.
     */
    where: BookTemplateWhereUniqueInput
  }

  /**
   * BookTemplate deleteMany
   */
  export type BookTemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BookTemplates to delete
     */
    where?: BookTemplateWhereInput
    /**
     * Limit how many BookTemplates to delete.
     */
    limit?: number
  }

  /**
   * BookTemplate without action
   */
  export type BookTemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookTemplate
     */
    select?: BookTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BookTemplate
     */
    omit?: BookTemplateOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TemplateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description',
    category: 'category',
    thumbnail: 'thumbnail',
    baseImage: 'baseImage',
    width: 'width',
    height: 'height',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    coverWidth: 'coverWidth',
    coverHeight: 'coverHeight',
    spineWidth: 'spineWidth',
    warpPreset: 'warpPreset'
  };

  export type TemplateScalarFieldEnum = (typeof TemplateScalarFieldEnum)[keyof typeof TemplateScalarFieldEnum]


  export const TemplateLayerScalarFieldEnum: {
    id: 'id',
    templateId: 'templateId',
    name: 'name',
    type: 'type',
    zIndex: 'zIndex',
    transformX: 'transformX',
    transformY: 'transformY',
    transformScaleX: 'transformScaleX',
    transformScaleY: 'transformScaleY',
    transformRotation: 'transformRotation',
    boundsX: 'boundsX',
    boundsY: 'boundsY',
    boundsWidth: 'boundsWidth',
    boundsHeight: 'boundsHeight',
    warpData: 'warpData',
    perspectiveData: 'perspectiveData',
    maskPath: 'maskPath',
    blendMode: 'blendMode',
    opacity: 'opacity',
    defaultColor: 'defaultColor',
    isColorable: 'isColorable',
    layerPart: 'layerPart',
    compositeUrl: 'compositeUrl',
    createdAt: 'createdAt'
  };

  export type TemplateLayerScalarFieldEnum = (typeof TemplateLayerScalarFieldEnum)[keyof typeof TemplateLayerScalarFieldEnum]


  export const ColorOptionScalarFieldEnum: {
    id: 'id',
    templateId: 'templateId',
    name: 'name',
    layerName: 'layerName',
    colors: 'colors',
    createdAt: 'createdAt'
  };

  export type ColorOptionScalarFieldEnum = (typeof ColorOptionScalarFieldEnum)[keyof typeof ColorOptionScalarFieldEnum]


  export const RenderScalarFieldEnum: {
    id: 'id',
    templateId: 'templateId',
    userImage: 'userImage',
    designX: 'designX',
    designY: 'designY',
    designScale: 'designScale',
    designRotation: 'designRotation',
    colorSelections: 'colorSelections',
    status: 'status',
    resultUrl: 'resultUrl',
    progress: 'progress',
    createdAt: 'createdAt',
    completedAt: 'completedAt'
  };

  export type RenderScalarFieldEnum = (typeof RenderScalarFieldEnum)[keyof typeof RenderScalarFieldEnum]


  export const UserImageScalarFieldEnum: {
    id: 'id',
    filename: 'filename',
    originalUrl: 'originalUrl',
    processedUrl: 'processedUrl',
    width: 'width',
    height: 'height',
    createdAt: 'createdAt'
  };

  export type UserImageScalarFieldEnum = (typeof UserImageScalarFieldEnum)[keyof typeof UserImageScalarFieldEnum]


  export const PSDTemplateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    originalFile: 'originalFile',
    parsedData: 'parsedData',
    width: 'width',
    height: 'height',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PSDTemplateScalarFieldEnum = (typeof PSDTemplateScalarFieldEnum)[keyof typeof PSDTemplateScalarFieldEnum]


  export const BookTemplateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description',
    coverWidth: 'coverWidth',
    coverHeight: 'coverHeight',
    spineWidth: 'spineWidth',
    thumbnail: 'thumbnail',
    previewImage: 'previewImage',
    baseImage: 'baseImage',
    warpPreset: 'warpPreset',
    bookType: 'bookType',
    showPages: 'showPages',
    pageColor: 'pageColor',
    showShadow: 'showShadow',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BookTemplateScalarFieldEnum = (typeof BookTemplateScalarFieldEnum)[keyof typeof BookTemplateScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type TemplateWhereInput = {
    AND?: TemplateWhereInput | TemplateWhereInput[]
    OR?: TemplateWhereInput[]
    NOT?: TemplateWhereInput | TemplateWhereInput[]
    id?: StringFilter<"Template"> | string
    name?: StringFilter<"Template"> | string
    slug?: StringFilter<"Template"> | string
    description?: StringNullableFilter<"Template"> | string | null
    category?: StringFilter<"Template"> | string
    thumbnail?: StringFilter<"Template"> | string
    baseImage?: StringFilter<"Template"> | string
    width?: IntFilter<"Template"> | number
    height?: IntFilter<"Template"> | number
    isActive?: BoolFilter<"Template"> | boolean
    createdAt?: DateTimeFilter<"Template"> | Date | string
    updatedAt?: DateTimeFilter<"Template"> | Date | string
    coverWidth?: FloatNullableFilter<"Template"> | number | null
    coverHeight?: FloatNullableFilter<"Template"> | number | null
    spineWidth?: FloatNullableFilter<"Template"> | number | null
    warpPreset?: StringNullableFilter<"Template"> | string | null
    layers?: TemplateLayerListRelationFilter
    colorOptions?: ColorOptionListRelationFilter
    renders?: RenderListRelationFilter
  }

  export type TemplateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    category?: SortOrder
    thumbnail?: SortOrder
    baseImage?: SortOrder
    width?: SortOrder
    height?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coverWidth?: SortOrderInput | SortOrder
    coverHeight?: SortOrderInput | SortOrder
    spineWidth?: SortOrderInput | SortOrder
    warpPreset?: SortOrderInput | SortOrder
    layers?: TemplateLayerOrderByRelationAggregateInput
    colorOptions?: ColorOptionOrderByRelationAggregateInput
    renders?: RenderOrderByRelationAggregateInput
  }

  export type TemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: TemplateWhereInput | TemplateWhereInput[]
    OR?: TemplateWhereInput[]
    NOT?: TemplateWhereInput | TemplateWhereInput[]
    name?: StringFilter<"Template"> | string
    description?: StringNullableFilter<"Template"> | string | null
    category?: StringFilter<"Template"> | string
    thumbnail?: StringFilter<"Template"> | string
    baseImage?: StringFilter<"Template"> | string
    width?: IntFilter<"Template"> | number
    height?: IntFilter<"Template"> | number
    isActive?: BoolFilter<"Template"> | boolean
    createdAt?: DateTimeFilter<"Template"> | Date | string
    updatedAt?: DateTimeFilter<"Template"> | Date | string
    coverWidth?: FloatNullableFilter<"Template"> | number | null
    coverHeight?: FloatNullableFilter<"Template"> | number | null
    spineWidth?: FloatNullableFilter<"Template"> | number | null
    warpPreset?: StringNullableFilter<"Template"> | string | null
    layers?: TemplateLayerListRelationFilter
    colorOptions?: ColorOptionListRelationFilter
    renders?: RenderListRelationFilter
  }, "id" | "slug">

  export type TemplateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    category?: SortOrder
    thumbnail?: SortOrder
    baseImage?: SortOrder
    width?: SortOrder
    height?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coverWidth?: SortOrderInput | SortOrder
    coverHeight?: SortOrderInput | SortOrder
    spineWidth?: SortOrderInput | SortOrder
    warpPreset?: SortOrderInput | SortOrder
    _count?: TemplateCountOrderByAggregateInput
    _avg?: TemplateAvgOrderByAggregateInput
    _max?: TemplateMaxOrderByAggregateInput
    _min?: TemplateMinOrderByAggregateInput
    _sum?: TemplateSumOrderByAggregateInput
  }

  export type TemplateScalarWhereWithAggregatesInput = {
    AND?: TemplateScalarWhereWithAggregatesInput | TemplateScalarWhereWithAggregatesInput[]
    OR?: TemplateScalarWhereWithAggregatesInput[]
    NOT?: TemplateScalarWhereWithAggregatesInput | TemplateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Template"> | string
    name?: StringWithAggregatesFilter<"Template"> | string
    slug?: StringWithAggregatesFilter<"Template"> | string
    description?: StringNullableWithAggregatesFilter<"Template"> | string | null
    category?: StringWithAggregatesFilter<"Template"> | string
    thumbnail?: StringWithAggregatesFilter<"Template"> | string
    baseImage?: StringWithAggregatesFilter<"Template"> | string
    width?: IntWithAggregatesFilter<"Template"> | number
    height?: IntWithAggregatesFilter<"Template"> | number
    isActive?: BoolWithAggregatesFilter<"Template"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Template"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Template"> | Date | string
    coverWidth?: FloatNullableWithAggregatesFilter<"Template"> | number | null
    coverHeight?: FloatNullableWithAggregatesFilter<"Template"> | number | null
    spineWidth?: FloatNullableWithAggregatesFilter<"Template"> | number | null
    warpPreset?: StringNullableWithAggregatesFilter<"Template"> | string | null
  }

  export type TemplateLayerWhereInput = {
    AND?: TemplateLayerWhereInput | TemplateLayerWhereInput[]
    OR?: TemplateLayerWhereInput[]
    NOT?: TemplateLayerWhereInput | TemplateLayerWhereInput[]
    id?: StringFilter<"TemplateLayer"> | string
    templateId?: StringFilter<"TemplateLayer"> | string
    name?: StringFilter<"TemplateLayer"> | string
    type?: StringFilter<"TemplateLayer"> | string
    zIndex?: IntFilter<"TemplateLayer"> | number
    transformX?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformY?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformScaleX?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformScaleY?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformRotation?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsX?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsY?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsWidth?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsHeight?: FloatNullableFilter<"TemplateLayer"> | number | null
    warpData?: StringNullableFilter<"TemplateLayer"> | string | null
    perspectiveData?: StringNullableFilter<"TemplateLayer"> | string | null
    maskPath?: StringNullableFilter<"TemplateLayer"> | string | null
    blendMode?: StringFilter<"TemplateLayer"> | string
    opacity?: FloatFilter<"TemplateLayer"> | number
    defaultColor?: StringNullableFilter<"TemplateLayer"> | string | null
    isColorable?: BoolFilter<"TemplateLayer"> | boolean
    layerPart?: StringNullableFilter<"TemplateLayer"> | string | null
    compositeUrl?: StringNullableFilter<"TemplateLayer"> | string | null
    createdAt?: DateTimeFilter<"TemplateLayer"> | Date | string
    template?: XOR<TemplateScalarRelationFilter, TemplateWhereInput>
  }

  export type TemplateLayerOrderByWithRelationInput = {
    id?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    zIndex?: SortOrder
    transformX?: SortOrderInput | SortOrder
    transformY?: SortOrderInput | SortOrder
    transformScaleX?: SortOrderInput | SortOrder
    transformScaleY?: SortOrderInput | SortOrder
    transformRotation?: SortOrderInput | SortOrder
    boundsX?: SortOrderInput | SortOrder
    boundsY?: SortOrderInput | SortOrder
    boundsWidth?: SortOrderInput | SortOrder
    boundsHeight?: SortOrderInput | SortOrder
    warpData?: SortOrderInput | SortOrder
    perspectiveData?: SortOrderInput | SortOrder
    maskPath?: SortOrderInput | SortOrder
    blendMode?: SortOrder
    opacity?: SortOrder
    defaultColor?: SortOrderInput | SortOrder
    isColorable?: SortOrder
    layerPart?: SortOrderInput | SortOrder
    compositeUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    template?: TemplateOrderByWithRelationInput
  }

  export type TemplateLayerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TemplateLayerWhereInput | TemplateLayerWhereInput[]
    OR?: TemplateLayerWhereInput[]
    NOT?: TemplateLayerWhereInput | TemplateLayerWhereInput[]
    templateId?: StringFilter<"TemplateLayer"> | string
    name?: StringFilter<"TemplateLayer"> | string
    type?: StringFilter<"TemplateLayer"> | string
    zIndex?: IntFilter<"TemplateLayer"> | number
    transformX?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformY?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformScaleX?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformScaleY?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformRotation?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsX?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsY?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsWidth?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsHeight?: FloatNullableFilter<"TemplateLayer"> | number | null
    warpData?: StringNullableFilter<"TemplateLayer"> | string | null
    perspectiveData?: StringNullableFilter<"TemplateLayer"> | string | null
    maskPath?: StringNullableFilter<"TemplateLayer"> | string | null
    blendMode?: StringFilter<"TemplateLayer"> | string
    opacity?: FloatFilter<"TemplateLayer"> | number
    defaultColor?: StringNullableFilter<"TemplateLayer"> | string | null
    isColorable?: BoolFilter<"TemplateLayer"> | boolean
    layerPart?: StringNullableFilter<"TemplateLayer"> | string | null
    compositeUrl?: StringNullableFilter<"TemplateLayer"> | string | null
    createdAt?: DateTimeFilter<"TemplateLayer"> | Date | string
    template?: XOR<TemplateScalarRelationFilter, TemplateWhereInput>
  }, "id">

  export type TemplateLayerOrderByWithAggregationInput = {
    id?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    zIndex?: SortOrder
    transformX?: SortOrderInput | SortOrder
    transformY?: SortOrderInput | SortOrder
    transformScaleX?: SortOrderInput | SortOrder
    transformScaleY?: SortOrderInput | SortOrder
    transformRotation?: SortOrderInput | SortOrder
    boundsX?: SortOrderInput | SortOrder
    boundsY?: SortOrderInput | SortOrder
    boundsWidth?: SortOrderInput | SortOrder
    boundsHeight?: SortOrderInput | SortOrder
    warpData?: SortOrderInput | SortOrder
    perspectiveData?: SortOrderInput | SortOrder
    maskPath?: SortOrderInput | SortOrder
    blendMode?: SortOrder
    opacity?: SortOrder
    defaultColor?: SortOrderInput | SortOrder
    isColorable?: SortOrder
    layerPart?: SortOrderInput | SortOrder
    compositeUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: TemplateLayerCountOrderByAggregateInput
    _avg?: TemplateLayerAvgOrderByAggregateInput
    _max?: TemplateLayerMaxOrderByAggregateInput
    _min?: TemplateLayerMinOrderByAggregateInput
    _sum?: TemplateLayerSumOrderByAggregateInput
  }

  export type TemplateLayerScalarWhereWithAggregatesInput = {
    AND?: TemplateLayerScalarWhereWithAggregatesInput | TemplateLayerScalarWhereWithAggregatesInput[]
    OR?: TemplateLayerScalarWhereWithAggregatesInput[]
    NOT?: TemplateLayerScalarWhereWithAggregatesInput | TemplateLayerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TemplateLayer"> | string
    templateId?: StringWithAggregatesFilter<"TemplateLayer"> | string
    name?: StringWithAggregatesFilter<"TemplateLayer"> | string
    type?: StringWithAggregatesFilter<"TemplateLayer"> | string
    zIndex?: IntWithAggregatesFilter<"TemplateLayer"> | number
    transformX?: FloatNullableWithAggregatesFilter<"TemplateLayer"> | number | null
    transformY?: FloatNullableWithAggregatesFilter<"TemplateLayer"> | number | null
    transformScaleX?: FloatNullableWithAggregatesFilter<"TemplateLayer"> | number | null
    transformScaleY?: FloatNullableWithAggregatesFilter<"TemplateLayer"> | number | null
    transformRotation?: FloatNullableWithAggregatesFilter<"TemplateLayer"> | number | null
    boundsX?: FloatNullableWithAggregatesFilter<"TemplateLayer"> | number | null
    boundsY?: FloatNullableWithAggregatesFilter<"TemplateLayer"> | number | null
    boundsWidth?: FloatNullableWithAggregatesFilter<"TemplateLayer"> | number | null
    boundsHeight?: FloatNullableWithAggregatesFilter<"TemplateLayer"> | number | null
    warpData?: StringNullableWithAggregatesFilter<"TemplateLayer"> | string | null
    perspectiveData?: StringNullableWithAggregatesFilter<"TemplateLayer"> | string | null
    maskPath?: StringNullableWithAggregatesFilter<"TemplateLayer"> | string | null
    blendMode?: StringWithAggregatesFilter<"TemplateLayer"> | string
    opacity?: FloatWithAggregatesFilter<"TemplateLayer"> | number
    defaultColor?: StringNullableWithAggregatesFilter<"TemplateLayer"> | string | null
    isColorable?: BoolWithAggregatesFilter<"TemplateLayer"> | boolean
    layerPart?: StringNullableWithAggregatesFilter<"TemplateLayer"> | string | null
    compositeUrl?: StringNullableWithAggregatesFilter<"TemplateLayer"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TemplateLayer"> | Date | string
  }

  export type ColorOptionWhereInput = {
    AND?: ColorOptionWhereInput | ColorOptionWhereInput[]
    OR?: ColorOptionWhereInput[]
    NOT?: ColorOptionWhereInput | ColorOptionWhereInput[]
    id?: StringFilter<"ColorOption"> | string
    templateId?: StringFilter<"ColorOption"> | string
    name?: StringFilter<"ColorOption"> | string
    layerName?: StringFilter<"ColorOption"> | string
    colors?: StringFilter<"ColorOption"> | string
    createdAt?: DateTimeFilter<"ColorOption"> | Date | string
    template?: XOR<TemplateScalarRelationFilter, TemplateWhereInput>
  }

  export type ColorOptionOrderByWithRelationInput = {
    id?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    layerName?: SortOrder
    colors?: SortOrder
    createdAt?: SortOrder
    template?: TemplateOrderByWithRelationInput
  }

  export type ColorOptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ColorOptionWhereInput | ColorOptionWhereInput[]
    OR?: ColorOptionWhereInput[]
    NOT?: ColorOptionWhereInput | ColorOptionWhereInput[]
    templateId?: StringFilter<"ColorOption"> | string
    name?: StringFilter<"ColorOption"> | string
    layerName?: StringFilter<"ColorOption"> | string
    colors?: StringFilter<"ColorOption"> | string
    createdAt?: DateTimeFilter<"ColorOption"> | Date | string
    template?: XOR<TemplateScalarRelationFilter, TemplateWhereInput>
  }, "id">

  export type ColorOptionOrderByWithAggregationInput = {
    id?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    layerName?: SortOrder
    colors?: SortOrder
    createdAt?: SortOrder
    _count?: ColorOptionCountOrderByAggregateInput
    _max?: ColorOptionMaxOrderByAggregateInput
    _min?: ColorOptionMinOrderByAggregateInput
  }

  export type ColorOptionScalarWhereWithAggregatesInput = {
    AND?: ColorOptionScalarWhereWithAggregatesInput | ColorOptionScalarWhereWithAggregatesInput[]
    OR?: ColorOptionScalarWhereWithAggregatesInput[]
    NOT?: ColorOptionScalarWhereWithAggregatesInput | ColorOptionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ColorOption"> | string
    templateId?: StringWithAggregatesFilter<"ColorOption"> | string
    name?: StringWithAggregatesFilter<"ColorOption"> | string
    layerName?: StringWithAggregatesFilter<"ColorOption"> | string
    colors?: StringWithAggregatesFilter<"ColorOption"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ColorOption"> | Date | string
  }

  export type RenderWhereInput = {
    AND?: RenderWhereInput | RenderWhereInput[]
    OR?: RenderWhereInput[]
    NOT?: RenderWhereInput | RenderWhereInput[]
    id?: StringFilter<"Render"> | string
    templateId?: StringFilter<"Render"> | string
    userImage?: StringFilter<"Render"> | string
    designX?: FloatFilter<"Render"> | number
    designY?: FloatFilter<"Render"> | number
    designScale?: FloatFilter<"Render"> | number
    designRotation?: FloatFilter<"Render"> | number
    colorSelections?: StringFilter<"Render"> | string
    status?: StringFilter<"Render"> | string
    resultUrl?: StringNullableFilter<"Render"> | string | null
    progress?: IntFilter<"Render"> | number
    createdAt?: DateTimeFilter<"Render"> | Date | string
    completedAt?: DateTimeNullableFilter<"Render"> | Date | string | null
    template?: XOR<TemplateScalarRelationFilter, TemplateWhereInput>
  }

  export type RenderOrderByWithRelationInput = {
    id?: SortOrder
    templateId?: SortOrder
    userImage?: SortOrder
    designX?: SortOrder
    designY?: SortOrder
    designScale?: SortOrder
    designRotation?: SortOrder
    colorSelections?: SortOrder
    status?: SortOrder
    resultUrl?: SortOrderInput | SortOrder
    progress?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    template?: TemplateOrderByWithRelationInput
  }

  export type RenderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RenderWhereInput | RenderWhereInput[]
    OR?: RenderWhereInput[]
    NOT?: RenderWhereInput | RenderWhereInput[]
    templateId?: StringFilter<"Render"> | string
    userImage?: StringFilter<"Render"> | string
    designX?: FloatFilter<"Render"> | number
    designY?: FloatFilter<"Render"> | number
    designScale?: FloatFilter<"Render"> | number
    designRotation?: FloatFilter<"Render"> | number
    colorSelections?: StringFilter<"Render"> | string
    status?: StringFilter<"Render"> | string
    resultUrl?: StringNullableFilter<"Render"> | string | null
    progress?: IntFilter<"Render"> | number
    createdAt?: DateTimeFilter<"Render"> | Date | string
    completedAt?: DateTimeNullableFilter<"Render"> | Date | string | null
    template?: XOR<TemplateScalarRelationFilter, TemplateWhereInput>
  }, "id">

  export type RenderOrderByWithAggregationInput = {
    id?: SortOrder
    templateId?: SortOrder
    userImage?: SortOrder
    designX?: SortOrder
    designY?: SortOrder
    designScale?: SortOrder
    designRotation?: SortOrder
    colorSelections?: SortOrder
    status?: SortOrder
    resultUrl?: SortOrderInput | SortOrder
    progress?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    _count?: RenderCountOrderByAggregateInput
    _avg?: RenderAvgOrderByAggregateInput
    _max?: RenderMaxOrderByAggregateInput
    _min?: RenderMinOrderByAggregateInput
    _sum?: RenderSumOrderByAggregateInput
  }

  export type RenderScalarWhereWithAggregatesInput = {
    AND?: RenderScalarWhereWithAggregatesInput | RenderScalarWhereWithAggregatesInput[]
    OR?: RenderScalarWhereWithAggregatesInput[]
    NOT?: RenderScalarWhereWithAggregatesInput | RenderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Render"> | string
    templateId?: StringWithAggregatesFilter<"Render"> | string
    userImage?: StringWithAggregatesFilter<"Render"> | string
    designX?: FloatWithAggregatesFilter<"Render"> | number
    designY?: FloatWithAggregatesFilter<"Render"> | number
    designScale?: FloatWithAggregatesFilter<"Render"> | number
    designRotation?: FloatWithAggregatesFilter<"Render"> | number
    colorSelections?: StringWithAggregatesFilter<"Render"> | string
    status?: StringWithAggregatesFilter<"Render"> | string
    resultUrl?: StringNullableWithAggregatesFilter<"Render"> | string | null
    progress?: IntWithAggregatesFilter<"Render"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Render"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"Render"> | Date | string | null
  }

  export type UserImageWhereInput = {
    AND?: UserImageWhereInput | UserImageWhereInput[]
    OR?: UserImageWhereInput[]
    NOT?: UserImageWhereInput | UserImageWhereInput[]
    id?: StringFilter<"UserImage"> | string
    filename?: StringFilter<"UserImage"> | string
    originalUrl?: StringFilter<"UserImage"> | string
    processedUrl?: StringNullableFilter<"UserImage"> | string | null
    width?: IntNullableFilter<"UserImage"> | number | null
    height?: IntNullableFilter<"UserImage"> | number | null
    createdAt?: DateTimeFilter<"UserImage"> | Date | string
  }

  export type UserImageOrderByWithRelationInput = {
    id?: SortOrder
    filename?: SortOrder
    originalUrl?: SortOrder
    processedUrl?: SortOrderInput | SortOrder
    width?: SortOrderInput | SortOrder
    height?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type UserImageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserImageWhereInput | UserImageWhereInput[]
    OR?: UserImageWhereInput[]
    NOT?: UserImageWhereInput | UserImageWhereInput[]
    filename?: StringFilter<"UserImage"> | string
    originalUrl?: StringFilter<"UserImage"> | string
    processedUrl?: StringNullableFilter<"UserImage"> | string | null
    width?: IntNullableFilter<"UserImage"> | number | null
    height?: IntNullableFilter<"UserImage"> | number | null
    createdAt?: DateTimeFilter<"UserImage"> | Date | string
  }, "id">

  export type UserImageOrderByWithAggregationInput = {
    id?: SortOrder
    filename?: SortOrder
    originalUrl?: SortOrder
    processedUrl?: SortOrderInput | SortOrder
    width?: SortOrderInput | SortOrder
    height?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: UserImageCountOrderByAggregateInput
    _avg?: UserImageAvgOrderByAggregateInput
    _max?: UserImageMaxOrderByAggregateInput
    _min?: UserImageMinOrderByAggregateInput
    _sum?: UserImageSumOrderByAggregateInput
  }

  export type UserImageScalarWhereWithAggregatesInput = {
    AND?: UserImageScalarWhereWithAggregatesInput | UserImageScalarWhereWithAggregatesInput[]
    OR?: UserImageScalarWhereWithAggregatesInput[]
    NOT?: UserImageScalarWhereWithAggregatesInput | UserImageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserImage"> | string
    filename?: StringWithAggregatesFilter<"UserImage"> | string
    originalUrl?: StringWithAggregatesFilter<"UserImage"> | string
    processedUrl?: StringNullableWithAggregatesFilter<"UserImage"> | string | null
    width?: IntNullableWithAggregatesFilter<"UserImage"> | number | null
    height?: IntNullableWithAggregatesFilter<"UserImage"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"UserImage"> | Date | string
  }

  export type PSDTemplateWhereInput = {
    AND?: PSDTemplateWhereInput | PSDTemplateWhereInput[]
    OR?: PSDTemplateWhereInput[]
    NOT?: PSDTemplateWhereInput | PSDTemplateWhereInput[]
    id?: StringFilter<"PSDTemplate"> | string
    name?: StringFilter<"PSDTemplate"> | string
    originalFile?: StringFilter<"PSDTemplate"> | string
    parsedData?: StringFilter<"PSDTemplate"> | string
    width?: IntFilter<"PSDTemplate"> | number
    height?: IntFilter<"PSDTemplate"> | number
    isActive?: BoolFilter<"PSDTemplate"> | boolean
    createdAt?: DateTimeFilter<"PSDTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"PSDTemplate"> | Date | string
  }

  export type PSDTemplateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    originalFile?: SortOrder
    parsedData?: SortOrder
    width?: SortOrder
    height?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PSDTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PSDTemplateWhereInput | PSDTemplateWhereInput[]
    OR?: PSDTemplateWhereInput[]
    NOT?: PSDTemplateWhereInput | PSDTemplateWhereInput[]
    name?: StringFilter<"PSDTemplate"> | string
    originalFile?: StringFilter<"PSDTemplate"> | string
    parsedData?: StringFilter<"PSDTemplate"> | string
    width?: IntFilter<"PSDTemplate"> | number
    height?: IntFilter<"PSDTemplate"> | number
    isActive?: BoolFilter<"PSDTemplate"> | boolean
    createdAt?: DateTimeFilter<"PSDTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"PSDTemplate"> | Date | string
  }, "id">

  export type PSDTemplateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    originalFile?: SortOrder
    parsedData?: SortOrder
    width?: SortOrder
    height?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PSDTemplateCountOrderByAggregateInput
    _avg?: PSDTemplateAvgOrderByAggregateInput
    _max?: PSDTemplateMaxOrderByAggregateInput
    _min?: PSDTemplateMinOrderByAggregateInput
    _sum?: PSDTemplateSumOrderByAggregateInput
  }

  export type PSDTemplateScalarWhereWithAggregatesInput = {
    AND?: PSDTemplateScalarWhereWithAggregatesInput | PSDTemplateScalarWhereWithAggregatesInput[]
    OR?: PSDTemplateScalarWhereWithAggregatesInput[]
    NOT?: PSDTemplateScalarWhereWithAggregatesInput | PSDTemplateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PSDTemplate"> | string
    name?: StringWithAggregatesFilter<"PSDTemplate"> | string
    originalFile?: StringWithAggregatesFilter<"PSDTemplate"> | string
    parsedData?: StringWithAggregatesFilter<"PSDTemplate"> | string
    width?: IntWithAggregatesFilter<"PSDTemplate"> | number
    height?: IntWithAggregatesFilter<"PSDTemplate"> | number
    isActive?: BoolWithAggregatesFilter<"PSDTemplate"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"PSDTemplate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PSDTemplate"> | Date | string
  }

  export type BookTemplateWhereInput = {
    AND?: BookTemplateWhereInput | BookTemplateWhereInput[]
    OR?: BookTemplateWhereInput[]
    NOT?: BookTemplateWhereInput | BookTemplateWhereInput[]
    id?: StringFilter<"BookTemplate"> | string
    name?: StringFilter<"BookTemplate"> | string
    slug?: StringFilter<"BookTemplate"> | string
    description?: StringNullableFilter<"BookTemplate"> | string | null
    coverWidth?: FloatFilter<"BookTemplate"> | number
    coverHeight?: FloatFilter<"BookTemplate"> | number
    spineWidth?: FloatFilter<"BookTemplate"> | number
    thumbnail?: StringFilter<"BookTemplate"> | string
    previewImage?: StringFilter<"BookTemplate"> | string
    baseImage?: StringFilter<"BookTemplate"> | string
    warpPreset?: StringFilter<"BookTemplate"> | string
    bookType?: StringFilter<"BookTemplate"> | string
    showPages?: BoolFilter<"BookTemplate"> | boolean
    pageColor?: StringFilter<"BookTemplate"> | string
    showShadow?: BoolFilter<"BookTemplate"> | boolean
    createdAt?: DateTimeFilter<"BookTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"BookTemplate"> | Date | string
  }

  export type BookTemplateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
    thumbnail?: SortOrder
    previewImage?: SortOrder
    baseImage?: SortOrder
    warpPreset?: SortOrder
    bookType?: SortOrder
    showPages?: SortOrder
    pageColor?: SortOrder
    showShadow?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BookTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: BookTemplateWhereInput | BookTemplateWhereInput[]
    OR?: BookTemplateWhereInput[]
    NOT?: BookTemplateWhereInput | BookTemplateWhereInput[]
    name?: StringFilter<"BookTemplate"> | string
    description?: StringNullableFilter<"BookTemplate"> | string | null
    coverWidth?: FloatFilter<"BookTemplate"> | number
    coverHeight?: FloatFilter<"BookTemplate"> | number
    spineWidth?: FloatFilter<"BookTemplate"> | number
    thumbnail?: StringFilter<"BookTemplate"> | string
    previewImage?: StringFilter<"BookTemplate"> | string
    baseImage?: StringFilter<"BookTemplate"> | string
    warpPreset?: StringFilter<"BookTemplate"> | string
    bookType?: StringFilter<"BookTemplate"> | string
    showPages?: BoolFilter<"BookTemplate"> | boolean
    pageColor?: StringFilter<"BookTemplate"> | string
    showShadow?: BoolFilter<"BookTemplate"> | boolean
    createdAt?: DateTimeFilter<"BookTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"BookTemplate"> | Date | string
  }, "id" | "slug">

  export type BookTemplateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
    thumbnail?: SortOrder
    previewImage?: SortOrder
    baseImage?: SortOrder
    warpPreset?: SortOrder
    bookType?: SortOrder
    showPages?: SortOrder
    pageColor?: SortOrder
    showShadow?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BookTemplateCountOrderByAggregateInput
    _avg?: BookTemplateAvgOrderByAggregateInput
    _max?: BookTemplateMaxOrderByAggregateInput
    _min?: BookTemplateMinOrderByAggregateInput
    _sum?: BookTemplateSumOrderByAggregateInput
  }

  export type BookTemplateScalarWhereWithAggregatesInput = {
    AND?: BookTemplateScalarWhereWithAggregatesInput | BookTemplateScalarWhereWithAggregatesInput[]
    OR?: BookTemplateScalarWhereWithAggregatesInput[]
    NOT?: BookTemplateScalarWhereWithAggregatesInput | BookTemplateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BookTemplate"> | string
    name?: StringWithAggregatesFilter<"BookTemplate"> | string
    slug?: StringWithAggregatesFilter<"BookTemplate"> | string
    description?: StringNullableWithAggregatesFilter<"BookTemplate"> | string | null
    coverWidth?: FloatWithAggregatesFilter<"BookTemplate"> | number
    coverHeight?: FloatWithAggregatesFilter<"BookTemplate"> | number
    spineWidth?: FloatWithAggregatesFilter<"BookTemplate"> | number
    thumbnail?: StringWithAggregatesFilter<"BookTemplate"> | string
    previewImage?: StringWithAggregatesFilter<"BookTemplate"> | string
    baseImage?: StringWithAggregatesFilter<"BookTemplate"> | string
    warpPreset?: StringWithAggregatesFilter<"BookTemplate"> | string
    bookType?: StringWithAggregatesFilter<"BookTemplate"> | string
    showPages?: BoolWithAggregatesFilter<"BookTemplate"> | boolean
    pageColor?: StringWithAggregatesFilter<"BookTemplate"> | string
    showShadow?: BoolWithAggregatesFilter<"BookTemplate"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"BookTemplate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BookTemplate"> | Date | string
  }

  export type TemplateCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    category: string
    thumbnail: string
    baseImage: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverWidth?: number | null
    coverHeight?: number | null
    spineWidth?: number | null
    warpPreset?: string | null
    layers?: TemplateLayerCreateNestedManyWithoutTemplateInput
    colorOptions?: ColorOptionCreateNestedManyWithoutTemplateInput
    renders?: RenderCreateNestedManyWithoutTemplateInput
  }

  export type TemplateUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    category: string
    thumbnail: string
    baseImage: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverWidth?: number | null
    coverHeight?: number | null
    spineWidth?: number | null
    warpPreset?: string | null
    layers?: TemplateLayerUncheckedCreateNestedManyWithoutTemplateInput
    colorOptions?: ColorOptionUncheckedCreateNestedManyWithoutTemplateInput
    renders?: RenderUncheckedCreateNestedManyWithoutTemplateInput
  }

  export type TemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    thumbnail?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    coverHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    spineWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    warpPreset?: NullableStringFieldUpdateOperationsInput | string | null
    layers?: TemplateLayerUpdateManyWithoutTemplateNestedInput
    colorOptions?: ColorOptionUpdateManyWithoutTemplateNestedInput
    renders?: RenderUpdateManyWithoutTemplateNestedInput
  }

  export type TemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    thumbnail?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    coverHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    spineWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    warpPreset?: NullableStringFieldUpdateOperationsInput | string | null
    layers?: TemplateLayerUncheckedUpdateManyWithoutTemplateNestedInput
    colorOptions?: ColorOptionUncheckedUpdateManyWithoutTemplateNestedInput
    renders?: RenderUncheckedUpdateManyWithoutTemplateNestedInput
  }

  export type TemplateCreateManyInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    category: string
    thumbnail: string
    baseImage: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverWidth?: number | null
    coverHeight?: number | null
    spineWidth?: number | null
    warpPreset?: string | null
  }

  export type TemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    thumbnail?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    coverHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    spineWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    warpPreset?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    thumbnail?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    coverHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    spineWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    warpPreset?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TemplateLayerCreateInput = {
    id?: string
    name: string
    type: string
    zIndex: number
    transformX?: number | null
    transformY?: number | null
    transformScaleX?: number | null
    transformScaleY?: number | null
    transformRotation?: number | null
    boundsX?: number | null
    boundsY?: number | null
    boundsWidth?: number | null
    boundsHeight?: number | null
    warpData?: string | null
    perspectiveData?: string | null
    maskPath?: string | null
    blendMode?: string
    opacity?: number
    defaultColor?: string | null
    isColorable?: boolean
    layerPart?: string | null
    compositeUrl?: string | null
    createdAt?: Date | string
    template: TemplateCreateNestedOneWithoutLayersInput
  }

  export type TemplateLayerUncheckedCreateInput = {
    id?: string
    templateId: string
    name: string
    type: string
    zIndex: number
    transformX?: number | null
    transformY?: number | null
    transformScaleX?: number | null
    transformScaleY?: number | null
    transformRotation?: number | null
    boundsX?: number | null
    boundsY?: number | null
    boundsWidth?: number | null
    boundsHeight?: number | null
    warpData?: string | null
    perspectiveData?: string | null
    maskPath?: string | null
    blendMode?: string
    opacity?: number
    defaultColor?: string | null
    isColorable?: boolean
    layerPart?: string | null
    compositeUrl?: string | null
    createdAt?: Date | string
  }

  export type TemplateLayerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    zIndex?: IntFieldUpdateOperationsInput | number
    transformX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformRotation?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsX?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsY?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    warpData?: NullableStringFieldUpdateOperationsInput | string | null
    perspectiveData?: NullableStringFieldUpdateOperationsInput | string | null
    maskPath?: NullableStringFieldUpdateOperationsInput | string | null
    blendMode?: StringFieldUpdateOperationsInput | string
    opacity?: FloatFieldUpdateOperationsInput | number
    defaultColor?: NullableStringFieldUpdateOperationsInput | string | null
    isColorable?: BoolFieldUpdateOperationsInput | boolean
    layerPart?: NullableStringFieldUpdateOperationsInput | string | null
    compositeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    template?: TemplateUpdateOneRequiredWithoutLayersNestedInput
  }

  export type TemplateLayerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    zIndex?: IntFieldUpdateOperationsInput | number
    transformX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformRotation?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsX?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsY?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    warpData?: NullableStringFieldUpdateOperationsInput | string | null
    perspectiveData?: NullableStringFieldUpdateOperationsInput | string | null
    maskPath?: NullableStringFieldUpdateOperationsInput | string | null
    blendMode?: StringFieldUpdateOperationsInput | string
    opacity?: FloatFieldUpdateOperationsInput | number
    defaultColor?: NullableStringFieldUpdateOperationsInput | string | null
    isColorable?: BoolFieldUpdateOperationsInput | boolean
    layerPart?: NullableStringFieldUpdateOperationsInput | string | null
    compositeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TemplateLayerCreateManyInput = {
    id?: string
    templateId: string
    name: string
    type: string
    zIndex: number
    transformX?: number | null
    transformY?: number | null
    transformScaleX?: number | null
    transformScaleY?: number | null
    transformRotation?: number | null
    boundsX?: number | null
    boundsY?: number | null
    boundsWidth?: number | null
    boundsHeight?: number | null
    warpData?: string | null
    perspectiveData?: string | null
    maskPath?: string | null
    blendMode?: string
    opacity?: number
    defaultColor?: string | null
    isColorable?: boolean
    layerPart?: string | null
    compositeUrl?: string | null
    createdAt?: Date | string
  }

  export type TemplateLayerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    zIndex?: IntFieldUpdateOperationsInput | number
    transformX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformRotation?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsX?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsY?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    warpData?: NullableStringFieldUpdateOperationsInput | string | null
    perspectiveData?: NullableStringFieldUpdateOperationsInput | string | null
    maskPath?: NullableStringFieldUpdateOperationsInput | string | null
    blendMode?: StringFieldUpdateOperationsInput | string
    opacity?: FloatFieldUpdateOperationsInput | number
    defaultColor?: NullableStringFieldUpdateOperationsInput | string | null
    isColorable?: BoolFieldUpdateOperationsInput | boolean
    layerPart?: NullableStringFieldUpdateOperationsInput | string | null
    compositeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TemplateLayerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    zIndex?: IntFieldUpdateOperationsInput | number
    transformX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformRotation?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsX?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsY?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    warpData?: NullableStringFieldUpdateOperationsInput | string | null
    perspectiveData?: NullableStringFieldUpdateOperationsInput | string | null
    maskPath?: NullableStringFieldUpdateOperationsInput | string | null
    blendMode?: StringFieldUpdateOperationsInput | string
    opacity?: FloatFieldUpdateOperationsInput | number
    defaultColor?: NullableStringFieldUpdateOperationsInput | string | null
    isColorable?: BoolFieldUpdateOperationsInput | boolean
    layerPart?: NullableStringFieldUpdateOperationsInput | string | null
    compositeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColorOptionCreateInput = {
    id?: string
    name: string
    layerName: string
    colors: string
    createdAt?: Date | string
    template: TemplateCreateNestedOneWithoutColorOptionsInput
  }

  export type ColorOptionUncheckedCreateInput = {
    id?: string
    templateId: string
    name: string
    layerName: string
    colors: string
    createdAt?: Date | string
  }

  export type ColorOptionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    layerName?: StringFieldUpdateOperationsInput | string
    colors?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    template?: TemplateUpdateOneRequiredWithoutColorOptionsNestedInput
  }

  export type ColorOptionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    layerName?: StringFieldUpdateOperationsInput | string
    colors?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColorOptionCreateManyInput = {
    id?: string
    templateId: string
    name: string
    layerName: string
    colors: string
    createdAt?: Date | string
  }

  export type ColorOptionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    layerName?: StringFieldUpdateOperationsInput | string
    colors?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColorOptionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    layerName?: StringFieldUpdateOperationsInput | string
    colors?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RenderCreateInput = {
    id?: string
    userImage: string
    designX: number
    designY: number
    designScale: number
    designRotation: number
    colorSelections: string
    status?: string
    resultUrl?: string | null
    progress?: number
    createdAt?: Date | string
    completedAt?: Date | string | null
    template: TemplateCreateNestedOneWithoutRendersInput
  }

  export type RenderUncheckedCreateInput = {
    id?: string
    templateId: string
    userImage: string
    designX: number
    designY: number
    designScale: number
    designRotation: number
    colorSelections: string
    status?: string
    resultUrl?: string | null
    progress?: number
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type RenderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userImage?: StringFieldUpdateOperationsInput | string
    designX?: FloatFieldUpdateOperationsInput | number
    designY?: FloatFieldUpdateOperationsInput | number
    designScale?: FloatFieldUpdateOperationsInput | number
    designRotation?: FloatFieldUpdateOperationsInput | number
    colorSelections?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resultUrl?: NullableStringFieldUpdateOperationsInput | string | null
    progress?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    template?: TemplateUpdateOneRequiredWithoutRendersNestedInput
  }

  export type RenderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateId?: StringFieldUpdateOperationsInput | string
    userImage?: StringFieldUpdateOperationsInput | string
    designX?: FloatFieldUpdateOperationsInput | number
    designY?: FloatFieldUpdateOperationsInput | number
    designScale?: FloatFieldUpdateOperationsInput | number
    designRotation?: FloatFieldUpdateOperationsInput | number
    colorSelections?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resultUrl?: NullableStringFieldUpdateOperationsInput | string | null
    progress?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RenderCreateManyInput = {
    id?: string
    templateId: string
    userImage: string
    designX: number
    designY: number
    designScale: number
    designRotation: number
    colorSelections: string
    status?: string
    resultUrl?: string | null
    progress?: number
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type RenderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userImage?: StringFieldUpdateOperationsInput | string
    designX?: FloatFieldUpdateOperationsInput | number
    designY?: FloatFieldUpdateOperationsInput | number
    designScale?: FloatFieldUpdateOperationsInput | number
    designRotation?: FloatFieldUpdateOperationsInput | number
    colorSelections?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resultUrl?: NullableStringFieldUpdateOperationsInput | string | null
    progress?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RenderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateId?: StringFieldUpdateOperationsInput | string
    userImage?: StringFieldUpdateOperationsInput | string
    designX?: FloatFieldUpdateOperationsInput | number
    designY?: FloatFieldUpdateOperationsInput | number
    designScale?: FloatFieldUpdateOperationsInput | number
    designRotation?: FloatFieldUpdateOperationsInput | number
    colorSelections?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resultUrl?: NullableStringFieldUpdateOperationsInput | string | null
    progress?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserImageCreateInput = {
    id?: string
    filename: string
    originalUrl: string
    processedUrl?: string | null
    width?: number | null
    height?: number | null
    createdAt?: Date | string
  }

  export type UserImageUncheckedCreateInput = {
    id?: string
    filename: string
    originalUrl: string
    processedUrl?: string | null
    width?: number | null
    height?: number | null
    createdAt?: Date | string
  }

  export type UserImageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalUrl?: StringFieldUpdateOperationsInput | string
    processedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserImageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalUrl?: StringFieldUpdateOperationsInput | string
    processedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserImageCreateManyInput = {
    id?: string
    filename: string
    originalUrl: string
    processedUrl?: string | null
    width?: number | null
    height?: number | null
    createdAt?: Date | string
  }

  export type UserImageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalUrl?: StringFieldUpdateOperationsInput | string
    processedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserImageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalUrl?: StringFieldUpdateOperationsInput | string
    processedUrl?: NullableStringFieldUpdateOperationsInput | string | null
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PSDTemplateCreateInput = {
    id?: string
    name: string
    originalFile: string
    parsedData: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PSDTemplateUncheckedCreateInput = {
    id?: string
    name: string
    originalFile: string
    parsedData: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PSDTemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    originalFile?: StringFieldUpdateOperationsInput | string
    parsedData?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PSDTemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    originalFile?: StringFieldUpdateOperationsInput | string
    parsedData?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PSDTemplateCreateManyInput = {
    id?: string
    name: string
    originalFile: string
    parsedData: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PSDTemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    originalFile?: StringFieldUpdateOperationsInput | string
    parsedData?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PSDTemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    originalFile?: StringFieldUpdateOperationsInput | string
    parsedData?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookTemplateCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    coverWidth?: number
    coverHeight?: number
    spineWidth?: number
    thumbnail: string
    previewImage: string
    baseImage: string
    warpPreset: string
    bookType?: string
    showPages?: boolean
    pageColor?: string
    showShadow?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BookTemplateUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    coverWidth?: number
    coverHeight?: number
    spineWidth?: number
    thumbnail: string
    previewImage: string
    baseImage: string
    warpPreset: string
    bookType?: string
    showPages?: boolean
    pageColor?: string
    showShadow?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BookTemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverWidth?: FloatFieldUpdateOperationsInput | number
    coverHeight?: FloatFieldUpdateOperationsInput | number
    spineWidth?: FloatFieldUpdateOperationsInput | number
    thumbnail?: StringFieldUpdateOperationsInput | string
    previewImage?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    warpPreset?: StringFieldUpdateOperationsInput | string
    bookType?: StringFieldUpdateOperationsInput | string
    showPages?: BoolFieldUpdateOperationsInput | boolean
    pageColor?: StringFieldUpdateOperationsInput | string
    showShadow?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookTemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverWidth?: FloatFieldUpdateOperationsInput | number
    coverHeight?: FloatFieldUpdateOperationsInput | number
    spineWidth?: FloatFieldUpdateOperationsInput | number
    thumbnail?: StringFieldUpdateOperationsInput | string
    previewImage?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    warpPreset?: StringFieldUpdateOperationsInput | string
    bookType?: StringFieldUpdateOperationsInput | string
    showPages?: BoolFieldUpdateOperationsInput | boolean
    pageColor?: StringFieldUpdateOperationsInput | string
    showShadow?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookTemplateCreateManyInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    coverWidth?: number
    coverHeight?: number
    spineWidth?: number
    thumbnail: string
    previewImage: string
    baseImage: string
    warpPreset: string
    bookType?: string
    showPages?: boolean
    pageColor?: string
    showShadow?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BookTemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverWidth?: FloatFieldUpdateOperationsInput | number
    coverHeight?: FloatFieldUpdateOperationsInput | number
    spineWidth?: FloatFieldUpdateOperationsInput | number
    thumbnail?: StringFieldUpdateOperationsInput | string
    previewImage?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    warpPreset?: StringFieldUpdateOperationsInput | string
    bookType?: StringFieldUpdateOperationsInput | string
    showPages?: BoolFieldUpdateOperationsInput | boolean
    pageColor?: StringFieldUpdateOperationsInput | string
    showShadow?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookTemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverWidth?: FloatFieldUpdateOperationsInput | number
    coverHeight?: FloatFieldUpdateOperationsInput | number
    spineWidth?: FloatFieldUpdateOperationsInput | number
    thumbnail?: StringFieldUpdateOperationsInput | string
    previewImage?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    warpPreset?: StringFieldUpdateOperationsInput | string
    bookType?: StringFieldUpdateOperationsInput | string
    showPages?: BoolFieldUpdateOperationsInput | boolean
    pageColor?: StringFieldUpdateOperationsInput | string
    showShadow?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type TemplateLayerListRelationFilter = {
    every?: TemplateLayerWhereInput
    some?: TemplateLayerWhereInput
    none?: TemplateLayerWhereInput
  }

  export type ColorOptionListRelationFilter = {
    every?: ColorOptionWhereInput
    some?: ColorOptionWhereInput
    none?: ColorOptionWhereInput
  }

  export type RenderListRelationFilter = {
    every?: RenderWhereInput
    some?: RenderWhereInput
    none?: RenderWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type TemplateLayerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ColorOptionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RenderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TemplateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    category?: SortOrder
    thumbnail?: SortOrder
    baseImage?: SortOrder
    width?: SortOrder
    height?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
    warpPreset?: SortOrder
  }

  export type TemplateAvgOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
  }

  export type TemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    category?: SortOrder
    thumbnail?: SortOrder
    baseImage?: SortOrder
    width?: SortOrder
    height?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
    warpPreset?: SortOrder
  }

  export type TemplateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    category?: SortOrder
    thumbnail?: SortOrder
    baseImage?: SortOrder
    width?: SortOrder
    height?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
    warpPreset?: SortOrder
  }

  export type TemplateSumOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type TemplateScalarRelationFilter = {
    is?: TemplateWhereInput
    isNot?: TemplateWhereInput
  }

  export type TemplateLayerCountOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    zIndex?: SortOrder
    transformX?: SortOrder
    transformY?: SortOrder
    transformScaleX?: SortOrder
    transformScaleY?: SortOrder
    transformRotation?: SortOrder
    boundsX?: SortOrder
    boundsY?: SortOrder
    boundsWidth?: SortOrder
    boundsHeight?: SortOrder
    warpData?: SortOrder
    perspectiveData?: SortOrder
    maskPath?: SortOrder
    blendMode?: SortOrder
    opacity?: SortOrder
    defaultColor?: SortOrder
    isColorable?: SortOrder
    layerPart?: SortOrder
    compositeUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type TemplateLayerAvgOrderByAggregateInput = {
    zIndex?: SortOrder
    transformX?: SortOrder
    transformY?: SortOrder
    transformScaleX?: SortOrder
    transformScaleY?: SortOrder
    transformRotation?: SortOrder
    boundsX?: SortOrder
    boundsY?: SortOrder
    boundsWidth?: SortOrder
    boundsHeight?: SortOrder
    opacity?: SortOrder
  }

  export type TemplateLayerMaxOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    zIndex?: SortOrder
    transformX?: SortOrder
    transformY?: SortOrder
    transformScaleX?: SortOrder
    transformScaleY?: SortOrder
    transformRotation?: SortOrder
    boundsX?: SortOrder
    boundsY?: SortOrder
    boundsWidth?: SortOrder
    boundsHeight?: SortOrder
    warpData?: SortOrder
    perspectiveData?: SortOrder
    maskPath?: SortOrder
    blendMode?: SortOrder
    opacity?: SortOrder
    defaultColor?: SortOrder
    isColorable?: SortOrder
    layerPart?: SortOrder
    compositeUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type TemplateLayerMinOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    zIndex?: SortOrder
    transformX?: SortOrder
    transformY?: SortOrder
    transformScaleX?: SortOrder
    transformScaleY?: SortOrder
    transformRotation?: SortOrder
    boundsX?: SortOrder
    boundsY?: SortOrder
    boundsWidth?: SortOrder
    boundsHeight?: SortOrder
    warpData?: SortOrder
    perspectiveData?: SortOrder
    maskPath?: SortOrder
    blendMode?: SortOrder
    opacity?: SortOrder
    defaultColor?: SortOrder
    isColorable?: SortOrder
    layerPart?: SortOrder
    compositeUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type TemplateLayerSumOrderByAggregateInput = {
    zIndex?: SortOrder
    transformX?: SortOrder
    transformY?: SortOrder
    transformScaleX?: SortOrder
    transformScaleY?: SortOrder
    transformRotation?: SortOrder
    boundsX?: SortOrder
    boundsY?: SortOrder
    boundsWidth?: SortOrder
    boundsHeight?: SortOrder
    opacity?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type ColorOptionCountOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    layerName?: SortOrder
    colors?: SortOrder
    createdAt?: SortOrder
  }

  export type ColorOptionMaxOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    layerName?: SortOrder
    colors?: SortOrder
    createdAt?: SortOrder
  }

  export type ColorOptionMinOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    layerName?: SortOrder
    colors?: SortOrder
    createdAt?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type RenderCountOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    userImage?: SortOrder
    designX?: SortOrder
    designY?: SortOrder
    designScale?: SortOrder
    designRotation?: SortOrder
    colorSelections?: SortOrder
    status?: SortOrder
    resultUrl?: SortOrder
    progress?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
  }

  export type RenderAvgOrderByAggregateInput = {
    designX?: SortOrder
    designY?: SortOrder
    designScale?: SortOrder
    designRotation?: SortOrder
    progress?: SortOrder
  }

  export type RenderMaxOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    userImage?: SortOrder
    designX?: SortOrder
    designY?: SortOrder
    designScale?: SortOrder
    designRotation?: SortOrder
    colorSelections?: SortOrder
    status?: SortOrder
    resultUrl?: SortOrder
    progress?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
  }

  export type RenderMinOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    userImage?: SortOrder
    designX?: SortOrder
    designY?: SortOrder
    designScale?: SortOrder
    designRotation?: SortOrder
    colorSelections?: SortOrder
    status?: SortOrder
    resultUrl?: SortOrder
    progress?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
  }

  export type RenderSumOrderByAggregateInput = {
    designX?: SortOrder
    designY?: SortOrder
    designScale?: SortOrder
    designRotation?: SortOrder
    progress?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UserImageCountOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    originalUrl?: SortOrder
    processedUrl?: SortOrder
    width?: SortOrder
    height?: SortOrder
    createdAt?: SortOrder
  }

  export type UserImageAvgOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
  }

  export type UserImageMaxOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    originalUrl?: SortOrder
    processedUrl?: SortOrder
    width?: SortOrder
    height?: SortOrder
    createdAt?: SortOrder
  }

  export type UserImageMinOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    originalUrl?: SortOrder
    processedUrl?: SortOrder
    width?: SortOrder
    height?: SortOrder
    createdAt?: SortOrder
  }

  export type UserImageSumOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type PSDTemplateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    originalFile?: SortOrder
    parsedData?: SortOrder
    width?: SortOrder
    height?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PSDTemplateAvgOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
  }

  export type PSDTemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    originalFile?: SortOrder
    parsedData?: SortOrder
    width?: SortOrder
    height?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PSDTemplateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    originalFile?: SortOrder
    parsedData?: SortOrder
    width?: SortOrder
    height?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PSDTemplateSumOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
  }

  export type BookTemplateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
    thumbnail?: SortOrder
    previewImage?: SortOrder
    baseImage?: SortOrder
    warpPreset?: SortOrder
    bookType?: SortOrder
    showPages?: SortOrder
    pageColor?: SortOrder
    showShadow?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BookTemplateAvgOrderByAggregateInput = {
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
  }

  export type BookTemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
    thumbnail?: SortOrder
    previewImage?: SortOrder
    baseImage?: SortOrder
    warpPreset?: SortOrder
    bookType?: SortOrder
    showPages?: SortOrder
    pageColor?: SortOrder
    showShadow?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BookTemplateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
    thumbnail?: SortOrder
    previewImage?: SortOrder
    baseImage?: SortOrder
    warpPreset?: SortOrder
    bookType?: SortOrder
    showPages?: SortOrder
    pageColor?: SortOrder
    showShadow?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BookTemplateSumOrderByAggregateInput = {
    coverWidth?: SortOrder
    coverHeight?: SortOrder
    spineWidth?: SortOrder
  }

  export type TemplateLayerCreateNestedManyWithoutTemplateInput = {
    create?: XOR<TemplateLayerCreateWithoutTemplateInput, TemplateLayerUncheckedCreateWithoutTemplateInput> | TemplateLayerCreateWithoutTemplateInput[] | TemplateLayerUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: TemplateLayerCreateOrConnectWithoutTemplateInput | TemplateLayerCreateOrConnectWithoutTemplateInput[]
    createMany?: TemplateLayerCreateManyTemplateInputEnvelope
    connect?: TemplateLayerWhereUniqueInput | TemplateLayerWhereUniqueInput[]
  }

  export type ColorOptionCreateNestedManyWithoutTemplateInput = {
    create?: XOR<ColorOptionCreateWithoutTemplateInput, ColorOptionUncheckedCreateWithoutTemplateInput> | ColorOptionCreateWithoutTemplateInput[] | ColorOptionUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: ColorOptionCreateOrConnectWithoutTemplateInput | ColorOptionCreateOrConnectWithoutTemplateInput[]
    createMany?: ColorOptionCreateManyTemplateInputEnvelope
    connect?: ColorOptionWhereUniqueInput | ColorOptionWhereUniqueInput[]
  }

  export type RenderCreateNestedManyWithoutTemplateInput = {
    create?: XOR<RenderCreateWithoutTemplateInput, RenderUncheckedCreateWithoutTemplateInput> | RenderCreateWithoutTemplateInput[] | RenderUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: RenderCreateOrConnectWithoutTemplateInput | RenderCreateOrConnectWithoutTemplateInput[]
    createMany?: RenderCreateManyTemplateInputEnvelope
    connect?: RenderWhereUniqueInput | RenderWhereUniqueInput[]
  }

  export type TemplateLayerUncheckedCreateNestedManyWithoutTemplateInput = {
    create?: XOR<TemplateLayerCreateWithoutTemplateInput, TemplateLayerUncheckedCreateWithoutTemplateInput> | TemplateLayerCreateWithoutTemplateInput[] | TemplateLayerUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: TemplateLayerCreateOrConnectWithoutTemplateInput | TemplateLayerCreateOrConnectWithoutTemplateInput[]
    createMany?: TemplateLayerCreateManyTemplateInputEnvelope
    connect?: TemplateLayerWhereUniqueInput | TemplateLayerWhereUniqueInput[]
  }

  export type ColorOptionUncheckedCreateNestedManyWithoutTemplateInput = {
    create?: XOR<ColorOptionCreateWithoutTemplateInput, ColorOptionUncheckedCreateWithoutTemplateInput> | ColorOptionCreateWithoutTemplateInput[] | ColorOptionUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: ColorOptionCreateOrConnectWithoutTemplateInput | ColorOptionCreateOrConnectWithoutTemplateInput[]
    createMany?: ColorOptionCreateManyTemplateInputEnvelope
    connect?: ColorOptionWhereUniqueInput | ColorOptionWhereUniqueInput[]
  }

  export type RenderUncheckedCreateNestedManyWithoutTemplateInput = {
    create?: XOR<RenderCreateWithoutTemplateInput, RenderUncheckedCreateWithoutTemplateInput> | RenderCreateWithoutTemplateInput[] | RenderUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: RenderCreateOrConnectWithoutTemplateInput | RenderCreateOrConnectWithoutTemplateInput[]
    createMany?: RenderCreateManyTemplateInputEnvelope
    connect?: RenderWhereUniqueInput | RenderWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TemplateLayerUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<TemplateLayerCreateWithoutTemplateInput, TemplateLayerUncheckedCreateWithoutTemplateInput> | TemplateLayerCreateWithoutTemplateInput[] | TemplateLayerUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: TemplateLayerCreateOrConnectWithoutTemplateInput | TemplateLayerCreateOrConnectWithoutTemplateInput[]
    upsert?: TemplateLayerUpsertWithWhereUniqueWithoutTemplateInput | TemplateLayerUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: TemplateLayerCreateManyTemplateInputEnvelope
    set?: TemplateLayerWhereUniqueInput | TemplateLayerWhereUniqueInput[]
    disconnect?: TemplateLayerWhereUniqueInput | TemplateLayerWhereUniqueInput[]
    delete?: TemplateLayerWhereUniqueInput | TemplateLayerWhereUniqueInput[]
    connect?: TemplateLayerWhereUniqueInput | TemplateLayerWhereUniqueInput[]
    update?: TemplateLayerUpdateWithWhereUniqueWithoutTemplateInput | TemplateLayerUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: TemplateLayerUpdateManyWithWhereWithoutTemplateInput | TemplateLayerUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: TemplateLayerScalarWhereInput | TemplateLayerScalarWhereInput[]
  }

  export type ColorOptionUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<ColorOptionCreateWithoutTemplateInput, ColorOptionUncheckedCreateWithoutTemplateInput> | ColorOptionCreateWithoutTemplateInput[] | ColorOptionUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: ColorOptionCreateOrConnectWithoutTemplateInput | ColorOptionCreateOrConnectWithoutTemplateInput[]
    upsert?: ColorOptionUpsertWithWhereUniqueWithoutTemplateInput | ColorOptionUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: ColorOptionCreateManyTemplateInputEnvelope
    set?: ColorOptionWhereUniqueInput | ColorOptionWhereUniqueInput[]
    disconnect?: ColorOptionWhereUniqueInput | ColorOptionWhereUniqueInput[]
    delete?: ColorOptionWhereUniqueInput | ColorOptionWhereUniqueInput[]
    connect?: ColorOptionWhereUniqueInput | ColorOptionWhereUniqueInput[]
    update?: ColorOptionUpdateWithWhereUniqueWithoutTemplateInput | ColorOptionUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: ColorOptionUpdateManyWithWhereWithoutTemplateInput | ColorOptionUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: ColorOptionScalarWhereInput | ColorOptionScalarWhereInput[]
  }

  export type RenderUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<RenderCreateWithoutTemplateInput, RenderUncheckedCreateWithoutTemplateInput> | RenderCreateWithoutTemplateInput[] | RenderUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: RenderCreateOrConnectWithoutTemplateInput | RenderCreateOrConnectWithoutTemplateInput[]
    upsert?: RenderUpsertWithWhereUniqueWithoutTemplateInput | RenderUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: RenderCreateManyTemplateInputEnvelope
    set?: RenderWhereUniqueInput | RenderWhereUniqueInput[]
    disconnect?: RenderWhereUniqueInput | RenderWhereUniqueInput[]
    delete?: RenderWhereUniqueInput | RenderWhereUniqueInput[]
    connect?: RenderWhereUniqueInput | RenderWhereUniqueInput[]
    update?: RenderUpdateWithWhereUniqueWithoutTemplateInput | RenderUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: RenderUpdateManyWithWhereWithoutTemplateInput | RenderUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: RenderScalarWhereInput | RenderScalarWhereInput[]
  }

  export type TemplateLayerUncheckedUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<TemplateLayerCreateWithoutTemplateInput, TemplateLayerUncheckedCreateWithoutTemplateInput> | TemplateLayerCreateWithoutTemplateInput[] | TemplateLayerUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: TemplateLayerCreateOrConnectWithoutTemplateInput | TemplateLayerCreateOrConnectWithoutTemplateInput[]
    upsert?: TemplateLayerUpsertWithWhereUniqueWithoutTemplateInput | TemplateLayerUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: TemplateLayerCreateManyTemplateInputEnvelope
    set?: TemplateLayerWhereUniqueInput | TemplateLayerWhereUniqueInput[]
    disconnect?: TemplateLayerWhereUniqueInput | TemplateLayerWhereUniqueInput[]
    delete?: TemplateLayerWhereUniqueInput | TemplateLayerWhereUniqueInput[]
    connect?: TemplateLayerWhereUniqueInput | TemplateLayerWhereUniqueInput[]
    update?: TemplateLayerUpdateWithWhereUniqueWithoutTemplateInput | TemplateLayerUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: TemplateLayerUpdateManyWithWhereWithoutTemplateInput | TemplateLayerUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: TemplateLayerScalarWhereInput | TemplateLayerScalarWhereInput[]
  }

  export type ColorOptionUncheckedUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<ColorOptionCreateWithoutTemplateInput, ColorOptionUncheckedCreateWithoutTemplateInput> | ColorOptionCreateWithoutTemplateInput[] | ColorOptionUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: ColorOptionCreateOrConnectWithoutTemplateInput | ColorOptionCreateOrConnectWithoutTemplateInput[]
    upsert?: ColorOptionUpsertWithWhereUniqueWithoutTemplateInput | ColorOptionUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: ColorOptionCreateManyTemplateInputEnvelope
    set?: ColorOptionWhereUniqueInput | ColorOptionWhereUniqueInput[]
    disconnect?: ColorOptionWhereUniqueInput | ColorOptionWhereUniqueInput[]
    delete?: ColorOptionWhereUniqueInput | ColorOptionWhereUniqueInput[]
    connect?: ColorOptionWhereUniqueInput | ColorOptionWhereUniqueInput[]
    update?: ColorOptionUpdateWithWhereUniqueWithoutTemplateInput | ColorOptionUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: ColorOptionUpdateManyWithWhereWithoutTemplateInput | ColorOptionUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: ColorOptionScalarWhereInput | ColorOptionScalarWhereInput[]
  }

  export type RenderUncheckedUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<RenderCreateWithoutTemplateInput, RenderUncheckedCreateWithoutTemplateInput> | RenderCreateWithoutTemplateInput[] | RenderUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: RenderCreateOrConnectWithoutTemplateInput | RenderCreateOrConnectWithoutTemplateInput[]
    upsert?: RenderUpsertWithWhereUniqueWithoutTemplateInput | RenderUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: RenderCreateManyTemplateInputEnvelope
    set?: RenderWhereUniqueInput | RenderWhereUniqueInput[]
    disconnect?: RenderWhereUniqueInput | RenderWhereUniqueInput[]
    delete?: RenderWhereUniqueInput | RenderWhereUniqueInput[]
    connect?: RenderWhereUniqueInput | RenderWhereUniqueInput[]
    update?: RenderUpdateWithWhereUniqueWithoutTemplateInput | RenderUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: RenderUpdateManyWithWhereWithoutTemplateInput | RenderUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: RenderScalarWhereInput | RenderScalarWhereInput[]
  }

  export type TemplateCreateNestedOneWithoutLayersInput = {
    create?: XOR<TemplateCreateWithoutLayersInput, TemplateUncheckedCreateWithoutLayersInput>
    connectOrCreate?: TemplateCreateOrConnectWithoutLayersInput
    connect?: TemplateWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TemplateUpdateOneRequiredWithoutLayersNestedInput = {
    create?: XOR<TemplateCreateWithoutLayersInput, TemplateUncheckedCreateWithoutLayersInput>
    connectOrCreate?: TemplateCreateOrConnectWithoutLayersInput
    upsert?: TemplateUpsertWithoutLayersInput
    connect?: TemplateWhereUniqueInput
    update?: XOR<XOR<TemplateUpdateToOneWithWhereWithoutLayersInput, TemplateUpdateWithoutLayersInput>, TemplateUncheckedUpdateWithoutLayersInput>
  }

  export type TemplateCreateNestedOneWithoutColorOptionsInput = {
    create?: XOR<TemplateCreateWithoutColorOptionsInput, TemplateUncheckedCreateWithoutColorOptionsInput>
    connectOrCreate?: TemplateCreateOrConnectWithoutColorOptionsInput
    connect?: TemplateWhereUniqueInput
  }

  export type TemplateUpdateOneRequiredWithoutColorOptionsNestedInput = {
    create?: XOR<TemplateCreateWithoutColorOptionsInput, TemplateUncheckedCreateWithoutColorOptionsInput>
    connectOrCreate?: TemplateCreateOrConnectWithoutColorOptionsInput
    upsert?: TemplateUpsertWithoutColorOptionsInput
    connect?: TemplateWhereUniqueInput
    update?: XOR<XOR<TemplateUpdateToOneWithWhereWithoutColorOptionsInput, TemplateUpdateWithoutColorOptionsInput>, TemplateUncheckedUpdateWithoutColorOptionsInput>
  }

  export type TemplateCreateNestedOneWithoutRendersInput = {
    create?: XOR<TemplateCreateWithoutRendersInput, TemplateUncheckedCreateWithoutRendersInput>
    connectOrCreate?: TemplateCreateOrConnectWithoutRendersInput
    connect?: TemplateWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type TemplateUpdateOneRequiredWithoutRendersNestedInput = {
    create?: XOR<TemplateCreateWithoutRendersInput, TemplateUncheckedCreateWithoutRendersInput>
    connectOrCreate?: TemplateCreateOrConnectWithoutRendersInput
    upsert?: TemplateUpsertWithoutRendersInput
    connect?: TemplateWhereUniqueInput
    update?: XOR<XOR<TemplateUpdateToOneWithWhereWithoutRendersInput, TemplateUpdateWithoutRendersInput>, TemplateUncheckedUpdateWithoutRendersInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type TemplateLayerCreateWithoutTemplateInput = {
    id?: string
    name: string
    type: string
    zIndex: number
    transformX?: number | null
    transformY?: number | null
    transformScaleX?: number | null
    transformScaleY?: number | null
    transformRotation?: number | null
    boundsX?: number | null
    boundsY?: number | null
    boundsWidth?: number | null
    boundsHeight?: number | null
    warpData?: string | null
    perspectiveData?: string | null
    maskPath?: string | null
    blendMode?: string
    opacity?: number
    defaultColor?: string | null
    isColorable?: boolean
    layerPart?: string | null
    compositeUrl?: string | null
    createdAt?: Date | string
  }

  export type TemplateLayerUncheckedCreateWithoutTemplateInput = {
    id?: string
    name: string
    type: string
    zIndex: number
    transformX?: number | null
    transformY?: number | null
    transformScaleX?: number | null
    transformScaleY?: number | null
    transformRotation?: number | null
    boundsX?: number | null
    boundsY?: number | null
    boundsWidth?: number | null
    boundsHeight?: number | null
    warpData?: string | null
    perspectiveData?: string | null
    maskPath?: string | null
    blendMode?: string
    opacity?: number
    defaultColor?: string | null
    isColorable?: boolean
    layerPart?: string | null
    compositeUrl?: string | null
    createdAt?: Date | string
  }

  export type TemplateLayerCreateOrConnectWithoutTemplateInput = {
    where: TemplateLayerWhereUniqueInput
    create: XOR<TemplateLayerCreateWithoutTemplateInput, TemplateLayerUncheckedCreateWithoutTemplateInput>
  }

  export type TemplateLayerCreateManyTemplateInputEnvelope = {
    data: TemplateLayerCreateManyTemplateInput | TemplateLayerCreateManyTemplateInput[]
  }

  export type ColorOptionCreateWithoutTemplateInput = {
    id?: string
    name: string
    layerName: string
    colors: string
    createdAt?: Date | string
  }

  export type ColorOptionUncheckedCreateWithoutTemplateInput = {
    id?: string
    name: string
    layerName: string
    colors: string
    createdAt?: Date | string
  }

  export type ColorOptionCreateOrConnectWithoutTemplateInput = {
    where: ColorOptionWhereUniqueInput
    create: XOR<ColorOptionCreateWithoutTemplateInput, ColorOptionUncheckedCreateWithoutTemplateInput>
  }

  export type ColorOptionCreateManyTemplateInputEnvelope = {
    data: ColorOptionCreateManyTemplateInput | ColorOptionCreateManyTemplateInput[]
  }

  export type RenderCreateWithoutTemplateInput = {
    id?: string
    userImage: string
    designX: number
    designY: number
    designScale: number
    designRotation: number
    colorSelections: string
    status?: string
    resultUrl?: string | null
    progress?: number
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type RenderUncheckedCreateWithoutTemplateInput = {
    id?: string
    userImage: string
    designX: number
    designY: number
    designScale: number
    designRotation: number
    colorSelections: string
    status?: string
    resultUrl?: string | null
    progress?: number
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type RenderCreateOrConnectWithoutTemplateInput = {
    where: RenderWhereUniqueInput
    create: XOR<RenderCreateWithoutTemplateInput, RenderUncheckedCreateWithoutTemplateInput>
  }

  export type RenderCreateManyTemplateInputEnvelope = {
    data: RenderCreateManyTemplateInput | RenderCreateManyTemplateInput[]
  }

  export type TemplateLayerUpsertWithWhereUniqueWithoutTemplateInput = {
    where: TemplateLayerWhereUniqueInput
    update: XOR<TemplateLayerUpdateWithoutTemplateInput, TemplateLayerUncheckedUpdateWithoutTemplateInput>
    create: XOR<TemplateLayerCreateWithoutTemplateInput, TemplateLayerUncheckedCreateWithoutTemplateInput>
  }

  export type TemplateLayerUpdateWithWhereUniqueWithoutTemplateInput = {
    where: TemplateLayerWhereUniqueInput
    data: XOR<TemplateLayerUpdateWithoutTemplateInput, TemplateLayerUncheckedUpdateWithoutTemplateInput>
  }

  export type TemplateLayerUpdateManyWithWhereWithoutTemplateInput = {
    where: TemplateLayerScalarWhereInput
    data: XOR<TemplateLayerUpdateManyMutationInput, TemplateLayerUncheckedUpdateManyWithoutTemplateInput>
  }

  export type TemplateLayerScalarWhereInput = {
    AND?: TemplateLayerScalarWhereInput | TemplateLayerScalarWhereInput[]
    OR?: TemplateLayerScalarWhereInput[]
    NOT?: TemplateLayerScalarWhereInput | TemplateLayerScalarWhereInput[]
    id?: StringFilter<"TemplateLayer"> | string
    templateId?: StringFilter<"TemplateLayer"> | string
    name?: StringFilter<"TemplateLayer"> | string
    type?: StringFilter<"TemplateLayer"> | string
    zIndex?: IntFilter<"TemplateLayer"> | number
    transformX?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformY?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformScaleX?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformScaleY?: FloatNullableFilter<"TemplateLayer"> | number | null
    transformRotation?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsX?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsY?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsWidth?: FloatNullableFilter<"TemplateLayer"> | number | null
    boundsHeight?: FloatNullableFilter<"TemplateLayer"> | number | null
    warpData?: StringNullableFilter<"TemplateLayer"> | string | null
    perspectiveData?: StringNullableFilter<"TemplateLayer"> | string | null
    maskPath?: StringNullableFilter<"TemplateLayer"> | string | null
    blendMode?: StringFilter<"TemplateLayer"> | string
    opacity?: FloatFilter<"TemplateLayer"> | number
    defaultColor?: StringNullableFilter<"TemplateLayer"> | string | null
    isColorable?: BoolFilter<"TemplateLayer"> | boolean
    layerPart?: StringNullableFilter<"TemplateLayer"> | string | null
    compositeUrl?: StringNullableFilter<"TemplateLayer"> | string | null
    createdAt?: DateTimeFilter<"TemplateLayer"> | Date | string
  }

  export type ColorOptionUpsertWithWhereUniqueWithoutTemplateInput = {
    where: ColorOptionWhereUniqueInput
    update: XOR<ColorOptionUpdateWithoutTemplateInput, ColorOptionUncheckedUpdateWithoutTemplateInput>
    create: XOR<ColorOptionCreateWithoutTemplateInput, ColorOptionUncheckedCreateWithoutTemplateInput>
  }

  export type ColorOptionUpdateWithWhereUniqueWithoutTemplateInput = {
    where: ColorOptionWhereUniqueInput
    data: XOR<ColorOptionUpdateWithoutTemplateInput, ColorOptionUncheckedUpdateWithoutTemplateInput>
  }

  export type ColorOptionUpdateManyWithWhereWithoutTemplateInput = {
    where: ColorOptionScalarWhereInput
    data: XOR<ColorOptionUpdateManyMutationInput, ColorOptionUncheckedUpdateManyWithoutTemplateInput>
  }

  export type ColorOptionScalarWhereInput = {
    AND?: ColorOptionScalarWhereInput | ColorOptionScalarWhereInput[]
    OR?: ColorOptionScalarWhereInput[]
    NOT?: ColorOptionScalarWhereInput | ColorOptionScalarWhereInput[]
    id?: StringFilter<"ColorOption"> | string
    templateId?: StringFilter<"ColorOption"> | string
    name?: StringFilter<"ColorOption"> | string
    layerName?: StringFilter<"ColorOption"> | string
    colors?: StringFilter<"ColorOption"> | string
    createdAt?: DateTimeFilter<"ColorOption"> | Date | string
  }

  export type RenderUpsertWithWhereUniqueWithoutTemplateInput = {
    where: RenderWhereUniqueInput
    update: XOR<RenderUpdateWithoutTemplateInput, RenderUncheckedUpdateWithoutTemplateInput>
    create: XOR<RenderCreateWithoutTemplateInput, RenderUncheckedCreateWithoutTemplateInput>
  }

  export type RenderUpdateWithWhereUniqueWithoutTemplateInput = {
    where: RenderWhereUniqueInput
    data: XOR<RenderUpdateWithoutTemplateInput, RenderUncheckedUpdateWithoutTemplateInput>
  }

  export type RenderUpdateManyWithWhereWithoutTemplateInput = {
    where: RenderScalarWhereInput
    data: XOR<RenderUpdateManyMutationInput, RenderUncheckedUpdateManyWithoutTemplateInput>
  }

  export type RenderScalarWhereInput = {
    AND?: RenderScalarWhereInput | RenderScalarWhereInput[]
    OR?: RenderScalarWhereInput[]
    NOT?: RenderScalarWhereInput | RenderScalarWhereInput[]
    id?: StringFilter<"Render"> | string
    templateId?: StringFilter<"Render"> | string
    userImage?: StringFilter<"Render"> | string
    designX?: FloatFilter<"Render"> | number
    designY?: FloatFilter<"Render"> | number
    designScale?: FloatFilter<"Render"> | number
    designRotation?: FloatFilter<"Render"> | number
    colorSelections?: StringFilter<"Render"> | string
    status?: StringFilter<"Render"> | string
    resultUrl?: StringNullableFilter<"Render"> | string | null
    progress?: IntFilter<"Render"> | number
    createdAt?: DateTimeFilter<"Render"> | Date | string
    completedAt?: DateTimeNullableFilter<"Render"> | Date | string | null
  }

  export type TemplateCreateWithoutLayersInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    category: string
    thumbnail: string
    baseImage: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverWidth?: number | null
    coverHeight?: number | null
    spineWidth?: number | null
    warpPreset?: string | null
    colorOptions?: ColorOptionCreateNestedManyWithoutTemplateInput
    renders?: RenderCreateNestedManyWithoutTemplateInput
  }

  export type TemplateUncheckedCreateWithoutLayersInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    category: string
    thumbnail: string
    baseImage: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverWidth?: number | null
    coverHeight?: number | null
    spineWidth?: number | null
    warpPreset?: string | null
    colorOptions?: ColorOptionUncheckedCreateNestedManyWithoutTemplateInput
    renders?: RenderUncheckedCreateNestedManyWithoutTemplateInput
  }

  export type TemplateCreateOrConnectWithoutLayersInput = {
    where: TemplateWhereUniqueInput
    create: XOR<TemplateCreateWithoutLayersInput, TemplateUncheckedCreateWithoutLayersInput>
  }

  export type TemplateUpsertWithoutLayersInput = {
    update: XOR<TemplateUpdateWithoutLayersInput, TemplateUncheckedUpdateWithoutLayersInput>
    create: XOR<TemplateCreateWithoutLayersInput, TemplateUncheckedCreateWithoutLayersInput>
    where?: TemplateWhereInput
  }

  export type TemplateUpdateToOneWithWhereWithoutLayersInput = {
    where?: TemplateWhereInput
    data: XOR<TemplateUpdateWithoutLayersInput, TemplateUncheckedUpdateWithoutLayersInput>
  }

  export type TemplateUpdateWithoutLayersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    thumbnail?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    coverHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    spineWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    warpPreset?: NullableStringFieldUpdateOperationsInput | string | null
    colorOptions?: ColorOptionUpdateManyWithoutTemplateNestedInput
    renders?: RenderUpdateManyWithoutTemplateNestedInput
  }

  export type TemplateUncheckedUpdateWithoutLayersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    thumbnail?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    coverHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    spineWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    warpPreset?: NullableStringFieldUpdateOperationsInput | string | null
    colorOptions?: ColorOptionUncheckedUpdateManyWithoutTemplateNestedInput
    renders?: RenderUncheckedUpdateManyWithoutTemplateNestedInput
  }

  export type TemplateCreateWithoutColorOptionsInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    category: string
    thumbnail: string
    baseImage: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverWidth?: number | null
    coverHeight?: number | null
    spineWidth?: number | null
    warpPreset?: string | null
    layers?: TemplateLayerCreateNestedManyWithoutTemplateInput
    renders?: RenderCreateNestedManyWithoutTemplateInput
  }

  export type TemplateUncheckedCreateWithoutColorOptionsInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    category: string
    thumbnail: string
    baseImage: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverWidth?: number | null
    coverHeight?: number | null
    spineWidth?: number | null
    warpPreset?: string | null
    layers?: TemplateLayerUncheckedCreateNestedManyWithoutTemplateInput
    renders?: RenderUncheckedCreateNestedManyWithoutTemplateInput
  }

  export type TemplateCreateOrConnectWithoutColorOptionsInput = {
    where: TemplateWhereUniqueInput
    create: XOR<TemplateCreateWithoutColorOptionsInput, TemplateUncheckedCreateWithoutColorOptionsInput>
  }

  export type TemplateUpsertWithoutColorOptionsInput = {
    update: XOR<TemplateUpdateWithoutColorOptionsInput, TemplateUncheckedUpdateWithoutColorOptionsInput>
    create: XOR<TemplateCreateWithoutColorOptionsInput, TemplateUncheckedCreateWithoutColorOptionsInput>
    where?: TemplateWhereInput
  }

  export type TemplateUpdateToOneWithWhereWithoutColorOptionsInput = {
    where?: TemplateWhereInput
    data: XOR<TemplateUpdateWithoutColorOptionsInput, TemplateUncheckedUpdateWithoutColorOptionsInput>
  }

  export type TemplateUpdateWithoutColorOptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    thumbnail?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    coverHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    spineWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    warpPreset?: NullableStringFieldUpdateOperationsInput | string | null
    layers?: TemplateLayerUpdateManyWithoutTemplateNestedInput
    renders?: RenderUpdateManyWithoutTemplateNestedInput
  }

  export type TemplateUncheckedUpdateWithoutColorOptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    thumbnail?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    coverHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    spineWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    warpPreset?: NullableStringFieldUpdateOperationsInput | string | null
    layers?: TemplateLayerUncheckedUpdateManyWithoutTemplateNestedInput
    renders?: RenderUncheckedUpdateManyWithoutTemplateNestedInput
  }

  export type TemplateCreateWithoutRendersInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    category: string
    thumbnail: string
    baseImage: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverWidth?: number | null
    coverHeight?: number | null
    spineWidth?: number | null
    warpPreset?: string | null
    layers?: TemplateLayerCreateNestedManyWithoutTemplateInput
    colorOptions?: ColorOptionCreateNestedManyWithoutTemplateInput
  }

  export type TemplateUncheckedCreateWithoutRendersInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    category: string
    thumbnail: string
    baseImage: string
    width: number
    height: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverWidth?: number | null
    coverHeight?: number | null
    spineWidth?: number | null
    warpPreset?: string | null
    layers?: TemplateLayerUncheckedCreateNestedManyWithoutTemplateInput
    colorOptions?: ColorOptionUncheckedCreateNestedManyWithoutTemplateInput
  }

  export type TemplateCreateOrConnectWithoutRendersInput = {
    where: TemplateWhereUniqueInput
    create: XOR<TemplateCreateWithoutRendersInput, TemplateUncheckedCreateWithoutRendersInput>
  }

  export type TemplateUpsertWithoutRendersInput = {
    update: XOR<TemplateUpdateWithoutRendersInput, TemplateUncheckedUpdateWithoutRendersInput>
    create: XOR<TemplateCreateWithoutRendersInput, TemplateUncheckedCreateWithoutRendersInput>
    where?: TemplateWhereInput
  }

  export type TemplateUpdateToOneWithWhereWithoutRendersInput = {
    where?: TemplateWhereInput
    data: XOR<TemplateUpdateWithoutRendersInput, TemplateUncheckedUpdateWithoutRendersInput>
  }

  export type TemplateUpdateWithoutRendersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    thumbnail?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    coverHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    spineWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    warpPreset?: NullableStringFieldUpdateOperationsInput | string | null
    layers?: TemplateLayerUpdateManyWithoutTemplateNestedInput
    colorOptions?: ColorOptionUpdateManyWithoutTemplateNestedInput
  }

  export type TemplateUncheckedUpdateWithoutRendersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    thumbnail?: StringFieldUpdateOperationsInput | string
    baseImage?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    coverHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    spineWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    warpPreset?: NullableStringFieldUpdateOperationsInput | string | null
    layers?: TemplateLayerUncheckedUpdateManyWithoutTemplateNestedInput
    colorOptions?: ColorOptionUncheckedUpdateManyWithoutTemplateNestedInput
  }

  export type TemplateLayerCreateManyTemplateInput = {
    id?: string
    name: string
    type: string
    zIndex: number
    transformX?: number | null
    transformY?: number | null
    transformScaleX?: number | null
    transformScaleY?: number | null
    transformRotation?: number | null
    boundsX?: number | null
    boundsY?: number | null
    boundsWidth?: number | null
    boundsHeight?: number | null
    warpData?: string | null
    perspectiveData?: string | null
    maskPath?: string | null
    blendMode?: string
    opacity?: number
    defaultColor?: string | null
    isColorable?: boolean
    layerPart?: string | null
    compositeUrl?: string | null
    createdAt?: Date | string
  }

  export type ColorOptionCreateManyTemplateInput = {
    id?: string
    name: string
    layerName: string
    colors: string
    createdAt?: Date | string
  }

  export type RenderCreateManyTemplateInput = {
    id?: string
    userImage: string
    designX: number
    designY: number
    designScale: number
    designRotation: number
    colorSelections: string
    status?: string
    resultUrl?: string | null
    progress?: number
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type TemplateLayerUpdateWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    zIndex?: IntFieldUpdateOperationsInput | number
    transformX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformRotation?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsX?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsY?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    warpData?: NullableStringFieldUpdateOperationsInput | string | null
    perspectiveData?: NullableStringFieldUpdateOperationsInput | string | null
    maskPath?: NullableStringFieldUpdateOperationsInput | string | null
    blendMode?: StringFieldUpdateOperationsInput | string
    opacity?: FloatFieldUpdateOperationsInput | number
    defaultColor?: NullableStringFieldUpdateOperationsInput | string | null
    isColorable?: BoolFieldUpdateOperationsInput | boolean
    layerPart?: NullableStringFieldUpdateOperationsInput | string | null
    compositeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TemplateLayerUncheckedUpdateWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    zIndex?: IntFieldUpdateOperationsInput | number
    transformX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformRotation?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsX?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsY?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    warpData?: NullableStringFieldUpdateOperationsInput | string | null
    perspectiveData?: NullableStringFieldUpdateOperationsInput | string | null
    maskPath?: NullableStringFieldUpdateOperationsInput | string | null
    blendMode?: StringFieldUpdateOperationsInput | string
    opacity?: FloatFieldUpdateOperationsInput | number
    defaultColor?: NullableStringFieldUpdateOperationsInput | string | null
    isColorable?: BoolFieldUpdateOperationsInput | boolean
    layerPart?: NullableStringFieldUpdateOperationsInput | string | null
    compositeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TemplateLayerUncheckedUpdateManyWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    zIndex?: IntFieldUpdateOperationsInput | number
    transformX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleX?: NullableFloatFieldUpdateOperationsInput | number | null
    transformScaleY?: NullableFloatFieldUpdateOperationsInput | number | null
    transformRotation?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsX?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsY?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsWidth?: NullableFloatFieldUpdateOperationsInput | number | null
    boundsHeight?: NullableFloatFieldUpdateOperationsInput | number | null
    warpData?: NullableStringFieldUpdateOperationsInput | string | null
    perspectiveData?: NullableStringFieldUpdateOperationsInput | string | null
    maskPath?: NullableStringFieldUpdateOperationsInput | string | null
    blendMode?: StringFieldUpdateOperationsInput | string
    opacity?: FloatFieldUpdateOperationsInput | number
    defaultColor?: NullableStringFieldUpdateOperationsInput | string | null
    isColorable?: BoolFieldUpdateOperationsInput | boolean
    layerPart?: NullableStringFieldUpdateOperationsInput | string | null
    compositeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColorOptionUpdateWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    layerName?: StringFieldUpdateOperationsInput | string
    colors?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColorOptionUncheckedUpdateWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    layerName?: StringFieldUpdateOperationsInput | string
    colors?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColorOptionUncheckedUpdateManyWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    layerName?: StringFieldUpdateOperationsInput | string
    colors?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RenderUpdateWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userImage?: StringFieldUpdateOperationsInput | string
    designX?: FloatFieldUpdateOperationsInput | number
    designY?: FloatFieldUpdateOperationsInput | number
    designScale?: FloatFieldUpdateOperationsInput | number
    designRotation?: FloatFieldUpdateOperationsInput | number
    colorSelections?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resultUrl?: NullableStringFieldUpdateOperationsInput | string | null
    progress?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RenderUncheckedUpdateWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userImage?: StringFieldUpdateOperationsInput | string
    designX?: FloatFieldUpdateOperationsInput | number
    designY?: FloatFieldUpdateOperationsInput | number
    designScale?: FloatFieldUpdateOperationsInput | number
    designRotation?: FloatFieldUpdateOperationsInput | number
    colorSelections?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resultUrl?: NullableStringFieldUpdateOperationsInput | string | null
    progress?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RenderUncheckedUpdateManyWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userImage?: StringFieldUpdateOperationsInput | string
    designX?: FloatFieldUpdateOperationsInput | number
    designY?: FloatFieldUpdateOperationsInput | number
    designScale?: FloatFieldUpdateOperationsInput | number
    designRotation?: FloatFieldUpdateOperationsInput | number
    colorSelections?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resultUrl?: NullableStringFieldUpdateOperationsInput | string | null
    progress?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}