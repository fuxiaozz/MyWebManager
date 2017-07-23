---
title: Java8实战读书笔记
date: 2017-02-21 17:10:17
tags: Java
categories: Java
description: <<Java 8实战>> 读书笔记
---

## Java8 实战学习笔记

### 第二章 通过行为参数化传递代码

`行为参数化` 帮助处理 *频繁变更需求* 的一种软件开发模式. 

`Predicate`: 断言, 陈述. 签名: boolean test()

### 第三章 Lambda表达式

`Lambda表达式`: 可以理解为一种匿名函数. 没有名称, 但是有参数列表, 函数主体, 返回类型. 可能还有一个可以抛出异常的异常列表.

`Lambda表达式`可以让你简洁的传递代码.

`Lambda表达式`三部分:

* 参数列表
* 箭头 ->
* lambda主体

|使用案例|Lambda示例|对应函数接口|
|:--|:--|:--|
|布尔表达式| (List<String list) \-\> list.isEmpty()| Predicate<List<String>> |
|创建对象 | (&nbsp;&nbsp;) \-\> new Apple(10) | Supplier<Apple> |
|消费一个对象 |  (Apple a) \-\> {<br>&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(a.getWeight()); <br>   }| Consumer<Apple> |
|从一个对象中选择/抽取|(String s) \-\> s.length()| Function<String, Integer> 或 ToIntFunction<String>
|结合两个值|(int a, int b) \-\> a * b| IntBinaryOparator
|比较两个对象|(Apple a1, Apple a2) \-\> a1.getWeight().compareTo(a2.getWeight()) | BiFunction<Apple, Apple, Integer> 或 ToIntBiFunction<Apple, Apple>


#### Lambda 使用场景

* 函数式接口

`函数式接口` : 仅仅声明一个抽象方法的接口. 

> 只有在接受函数式接口的地方才可以使用`Lambda`表达式.

> 注: Java8+ 接口可以拥有**默认方法**(即在类没有对方法进行实现是, 其主体为方法提供的默认实现的方法), 即使接口内定义了多个默认方法, 但抽象方法只有一个, 则接口仍是一个函数式接口.

`@FunctionalInterface` 注解用于标注函数式接口, 它不是必须的, 单对于函数式接口的设计, 使用它是最好的做法. 就像`@Override`

* 函数描述符

`函数式接口的抽象方法签名就是Lambda表达式的签名`, 我们将这种抽象方法叫**函数描述符**

`函数式描述符` : 指函数式接口的抽象方法签名

常用函数式接口:

|名称|签名|用途|
|:--|:--|:--|
| Predicate<T> | T \-\> boolean |  |
| Consumer<T> | T \-\> void | 消费对象 |
| Function<T, R> | T \-\> R | 提取新的对象/抽取对象某个属性 |
| Supplier<T> | () \-\> T | new 对象|
| UnaryOperator<T> | T \-\> T |  |
| BinaryOperator<T> | ( T, T ) \-\> T | |
| BiPredicate<L, R> | ( L, R ) \-\> boolean | |
| BiConsumer<T, U> | ( T, U ) -> void | |
| BiFunction<T, U, R> | ( T, U ) \-\> R | |

> 注为了避免装箱拆箱带来的性能损失, JDK对 `Predicate<T>` 和 `Function<T,R>`等通用函数式接口的原始类型特化: `IntPredicate`, `IntToLangFunction`等.
> 环绕执行模式( 即在方法所需的代码中间, 你需要执行点什么操作, 比如资源分配和清理)可以配合Lambda提高灵活性和重用性.
> Lambda表达式所需要代表的类型称之为`目标类型`
> Comparator, Predicate和Function等函数式接口都有几个可以用来结合Lambda表达式的默认方法.

* Lambda 的类型是从使用 Lambda 的上下文推断出来的. 

    > 注意: 如果 Lambda 表达式抛出一个异常, 那么抽象方法所声明的 throws 语句也必须与之匹配.
    
* lambda 使用局部变量的一些限制.

    lambda 函数中调用的局部变量必须声明为`final`或者事实上是`final`. 
    
    1. 实例变量存储在堆中, 而局部变量保存在栈上. Lambda是在一个线程中使用的, 而使用Lambda的线程, 可能会在分配该变量的线程将这个变量收回之后去访问. 
    2. 这一限制不鼓励你使用改变外部变量的典型命令式编程模式. 他会阻碍很容易做到的并行处理.

* 方法引用

    方法引用让你可以重复使用现有的方法定义, 并像 Lambda 一样传递它们. 它的基本思想是: 如果以个 Lambda 代表的只是 "直接调用这个方法", 那最好还是用名称调用它, 而不是去描述如何调用它.
    
    > 方法引用让你重复使用现有的方法并直接传递它们.
    
    你可以把方法引用看做针对仅仅涉及单一方法的Lambda的语法糖.
    
    方法引用主要有三类:
    
    1. 指向**静态方法**的方法引用, 如, `Integer` 的 `parseInt` 方法, 写作 `Integer::parseInt`.
    2. 指向**任意类型实例方法**的方法引用, 如 `String` 的 `length` 方法, 写作 `String::length`.
    3. 指向`现有对象的实例方法`的方法引用.

    > 请注意, 还有针对构造函数, 数组构造函数和父类调用(super-call)的一些特殊形式的方法引用.
    
* 构造函数引用

    对于一个现有的构造函数, 可使用: `ClassName :: new`, 如:
    
    无参构造函数:
    
    ```java
    Supplier<Apple> c1 = Apple::new;
    // 等价于
    Supplier<Apple> c1 = () -> new Apple();
    ```
    
    有一个参数的构造函数:

    ```java
    Function<Integer, Apple> c2 = Apple::new;
    // 等价于
    Function<Integer, Apple> c2 = (weight) -> new Apple(weight);
    ```
    
    有两个参数的构造函数:
    
    ```java
    BiFunction<String, Integer, Apple> c3 = Apple::new
    // 等价于
    BiFunction<String, Integer, Apple> c3 = (color, weight) -> new Apple(color, weight);
    ```
    
#### 函数式数据处理

流是Java API的新成员, 它允许你以声明性方式处理数据集合(通过查询语句来表示, 而不是临时编写一个实现). 此外, 流还可以透明地并行处理. 

`流`: **从支持数据处理操作的源生成的一系列元素**

* 元素序列: 流提供一个接口, 可以访问特定元素类型的一组有序值.
* 源: 流会使用一个提供数据的源. 如集合, 数组,输入/输出资源.
    
    > 有序集合生成流时会保留原有的顺序.
    
* 数据处理操作: 流的数据处理功能支持类似数据库的操作, 一级函数式编程语言中的常用操作, 如: filter, map, reduce, find, match, sort等. 流的操作可以顺序执行, 也可以并行执行.

流的特点:

* 流水线: 流水线的操作可以看做对数据源进行数据库式查询.
* 内部迭代: 迭代通过 `filter`, `map`, `sorted`等中间操作过滤掉了

集合和流的差异

* 什么时候进行计算. 集合是内存中的数据结构, 它包含数据结构中目前所有的值--集合中的每个元素都是先计算出来才能在添加到集合中的. 流则是概念上固定的数据结构(你不能添加或者删除元素), 其元素是**按需计算**的. 从另一个角度看, 流就像是一个延迟创建的集合; 只有在消费者需要的嘶吼才会计算值. 
  
* 只能遍历一次. 与迭代器类似, 流只能遍历一次. 遍历完毕, 我们就说这个流已经被消费掉了. 你可以从原始数据源哪里在获取一个新的流并重新遍历一遍. 否则抛出异常: 

  ```java
  java.lang.IllegalStateException: stream has already been operated upon or closed
  ```

* 集合与流的迭代方式不同. 集合使用的外部迭代, 而流使用的内部迭代. 

流的操作

* 中间操作

    中间操作不会执行任何处理. 中间操作一般可以合并起来, 在终端操作时一次性全部处理.
    
    * 短路
    * 循环合并
    
* 终端操作

    终端操作会从流的流水线生成结果. 
    
流的使用, 流的使用一般包含三件事:

* 一个数据源(如集合)来进行一个查询
* 一个中间操作链, 行程也难怪一条流的流水线
* 一个终端操作, 执行流水线, 并能生成结果

> 流中的元素是按需计算的.
> 流的迭代操作由外部迭代转向内部迭代.

* filter 过滤
* distinct 去重
* limit 截断 返回给定长度的流
* skip 跳过 跳过给定长度的元素 如果元素不足, 则返回void
* map 映射 将 T 转为 R 
* **flatMap** 将映射的流合并为一个流, 即扁平化一个流, 即, 将流中的每个值转为另一个流, 然后把所需要的流连接起来成为一个流.
* **anyMatch** 判断流中是否*存在一个元素*匹配给定的谓词, **终端操作**, 返回 *boolean*
* **allMatch** 判断流中是否*所有元素*匹配给定谓词, **终端操作**, 返回 *boolean*
* **noneMatch** 与`allMatch`相反, 确保流中每个元素与谓词都不匹配. **终端操作**, 返回 *boolean*

> `anyMatch`, `allMatch`, `noneMatch`三个操作都是用到我们所谓的**短路**, 就是Java中的`&&`和`||`运算符的短路在流中的版本.
> 短路:指不需要处理完所有表达式, 只需要找到一个表达式为false, 则整个表达式都将返回false.
> 短路对无限大小流非常有用, 可以将无限流变为有限流. 

* **findAny** 返回当前流中任意元素, 与其他流操作结合使用. **终端操作**, 返回*Optional<T>*

> `Optional<T>`类是Java8的容器类. 代表一个值存在或者不存在.
> `isPresent()`: 包含值时返回 true
> `isPresent(Consumer<T> block)`: 包含值时执行给定代码块.
> `T get()`: 值存在时返回值, 否则抛出异常`NoSuchElement`.
> `T orElse(T other)`: 值存在时返回值, 否则返回一个默认值(other).

* **findFirst()** 返回第一个元素. 与其他流操作结合使用. **终端操作**, 返回*Optional<T>*

> 何时使用`findFirst`和`findAny`? 并行时, `findFirst`在并行上限制更多, 如果不关心返回元素是那个, 使用`findAny`, 因为它在使用并行流时限制较少.


* **reduce** 归约操作. 此操作有两个版本, 包含初始值, 及不包含初始值的, 两个版本的返回值不同, 不包含初始值的返回值为`Optional`类型. 除了合并结果, 对结果就求最大, 最小值, 数元素个数等等.

> 流的操作分为*有状态*和*无状态*两种. 

数值流

对int等原始类型的, map方法生成的包转类型的流, 存在装箱拆箱成本.

* 原始类型特化流: `IntStream`, `DoubleStream`, `LongStream`. 避免了装箱拆箱成本. 且每个接口都带来了进行常用数值归约的新方法. 如: `max`, `sum`, `min`等, 必要时还可以将原始类型特化流转为对象流. 

    > 特化原因: 不在于流的复杂性, 而是装箱造成的复杂性, 即类似`int`和`Integer`之间的效率差异.
    
* 映射到数值流: `mapToInt`, `mapToDouble`, `mapToLong`
* 转回对象流: `boxed()`
* 默认值`OptionalInt`

数值范围

Java8引入了两个用于 `IntStream` 和 `LongStream` 的静态方法, 可用于生成数值范围: `range` 和 `rangeClosed`. 这两个方法都是: 第一个参数接收起始位置, 第二个参数接收结束位置. 区别在于:
`range`方法不包含*结束位置*, `rangeClosed`方法包含*结束位置*.

构建流

* 由值创建流
    
    * `Stream.of()` 显示创建流

* 由数组创建流

    * `Arrays.stream()`

* 由文件生成流

    Java 中用于处理文件等 I/O 操作的 NIO API 已更新, 以便利用 Stream API. `java.nio.file.Files`中很多静态方法都会返回一个流. 
    
* 由函数生成无限流

    Stream API提供两个静态方法来从函数生成无限流: `Stream.iterate` 和 `Stream.generate` 这连个操作可以创建所谓的**无限流**.
    
    无限流: 不像固定集合创建的流那样有固定大小的流. 由 iterate 和 generate 产生的流会用给定函数按需创建值, 因此可以无穷无尽的计算下去!!!, 
    
    > 注: 一般来说, 应该使用 `limit(N)` 来对这种流加以限制, 以避免打印无穷多个值.
    
    * `iterate` 方法接受一个初始值, 还有一个依次应用在每个产生的新值上的 Lambda函数. 

        > 一般来说: 在需要依次生成一系列值的时候应该使用`iterate`.
    
    * `generate` 方法不是依次对每个新生成的值应用函数, 它接收一个`Supplier<T>`类型的Lambda提供的新值.

    总结
    
    * 可使用 `filter`, `distinct`, `skip`, `limit`对流进行筛选或切片
    * 可使用 `map`, `flatMap`转换流.
    * 可使用 `findFirst` 和 `findAny`方法查找流中的元素.
    * 可使用 `anyMatch`, `noneMatch` 和 `allMatch` 方法让流匹配给定谓词.
    
    > 这些流都利用了短路: 找到结果立即停止计算; 没有必要处理真个流
    
    * 可使用 `reduce` 方法将流中的元素迭代合并成一个结果. 如求和, 最大值等
    * `filter` 和 `map`等操作是无状态的. 他们并不存储任何状态. 
    * `reduce`等操作要存储状态才能计算一个值. `sorted` 和 `distinct`等操作也要存储状态, 因为他们需要把流中的所有元素缓存起来才能返回一个新的流. 这种操作也叫做有状态操作. 
    * 流由三种基本原始类型特化: `IntStream`, `DoubleStream` 和 `LongStream`. 他们的操作也有相应的特化.
    * 流不仅可以从集合创建, 也可以从值, 数组, 文件以及`iterate`与`generate`等特定方法创建.
    * 无限流是没有固定大小的流.

用流收集数据

流支持两种操作: `中间操作` 和 `终端操作`. 中间操作可以链接起来, 将一个流转为另一个流. 这些操作不会消耗流, 其目的是建立一个流水线. 终端操作会消耗流, 以产生一个最终结果, 如返回一个集合, 一个最大元素.

收集器(Collector)

预定义收集器的三大功能:

* 将流元素归约和汇总为一个值
* 元素分组
* 元素分区

* `Collectors.counting()`
* `Collectors.summingInt()`
* `Collectors.averagingInt()`
* `Collectors.summarizingInt()`: 通过一次 `summarizing` 操作你可以得到: 总和, 平均值, 最大值, 最下值.

连接字符串

* `Collectors.joining()`

收集(collect)和归约(reduce)

* reduce()方法旨在: 把两个值结合起来生成一个新值, 它是一个不可变的归约. 
* collect()方法的设计就是要改变容器, 从而累积要输出的结果. 

分组

* `Collectors.groupingBy()`
* `Collectors.collectingAndThen`
* `Collectors.mapping()`
* `Collectors.toCollection()`

分区

分区是分组的特殊情况: 有一个谓词(返回一个布尔值的函数)作为分类函数, 它称之为分区函数. 分区函数返回一个布尔值, 这意味着得到的分组 Map 的键类型是 `Boolean`, 于是它最多分为两组, `true`是一组, `false`是一组. 

* `Collectors.partitioningBy`: 参数需要一个谓词(即: 返回一个布尔值的函数)

分区的优势

分区的好处在于: 保留了分区函数返回 `true` 或 `false` 的两套流元素列表. 


`Collectors` 类的静态工厂方法

| 工厂方法 | 返回类型 | 用途 |
| :-- | :-- | :-- |
`toList` | `List<T>` | 把流中的所有项目收集到一个List 
`toSet` | `Set<T>` | 把流中的所有项目收集到一个Set, 删除重复项
`toCollection` | `Collection<T>` | 把流中所有项目收集到给定的供应源创建的集合
`counting` | `Long` | 计算流中的元素个数
`summingInt` | `Integer` | 对流中项目的一个整数属性求和
`averagingInt` | `Double` | 对有种项目的一个整数数据求平均值
`summarizingInt` | `IntSummaryStatistics` | 收集关于流中项目`Integer`属性的统计值, 例如最大, 最小, 总和与平均值.
`joining` | `String` | 连接流中每个元素, 对每个元素调用 `toString` 方法所生成的字符串进行连接
`maxBy` | `Optional<T>` | 一个包裹了流中按照给定比较器选出最大元素的 `Optional`
`minBy` | `Optional<T>` | 同上求最小值
`reducing` | 归约操作产生的类型 | 从一个作为累加器的初始值开始, 利用`BinaryOperator`与流中的元素逐个结合, 从而将流归约为单个值.
`collectingAndThen` | 转换函数返回的类型 | 包含另一个收集器, 对其结果应用转换函数.
`groupingBy` | `Map<K, List<T>>` | 根据项目的一个属性的值对流中的项目作问组, 并将属性值最为结果Map的键
`partitioningBy` | `Map<Boolean, List<T>>` | 根据对流中每个项目应用谓词的结果来对项目进行分区

收集器接口

Collector接口:

```java
public interface Collector<T, A, R> {
    Supplier<A> supplier();
    BiConsumer<A, T> accumulator();
    Function<A, R> finisher();
    BinaryOperator<A> combiner();
    Set<Characteristics> characteristics();
}
```

* T 是流中要收集的项目泛型
* A 是累加器的类型, 累加器是在收集过程中用于累积部分结果的对象
* R 是收集操作得到的对象(通常但并不一定是集合)的类型.

前面四个方法都会返回一个会被 `collect` 方法调用的函数, 而第五个方法 `characteristics` 则提供了一系列特征, 也就是一个提示列表, 告诉 `collect` 方法在执行归约操作的时候可以应用那些优化(比如并行化).

* 建立新的结果容器: `supplier` 方法

    `supplier` 方法必须放回一个结果为空的 `Supplier`, 也就是一个无参的构造函数, 在调用时它会创建一个空的累加器实例, 提供数据收集过程使用. 
    
* 将元素添加到结果容器: `accumulator` 方法

    `accumulator` 方法会返回执行归约操作的函数. 当遍历到流中第 `n` 个元素时, 这个函数执行时会有两个参数: 保存归约结果的累加器(已收集了流中前 `n-1` 个元素), 还有第 `n` 个元素本身. 该函数将返回 `void`, 因为累加器是原位更新, 即*函数的执行改变了它的内部状态以体现遍历的元素的效果*. 
    
* 对结果容器应用最终转换: `finisher` 方法

    在遍历完流后, `finisher` 方法必须返回在累积过程的最后要调用的一个函数, 以便将累加器对象转换为整个集合操作的最终结果. 通常, 累加器对象(`accumulator` 方法返回)恰好符合预期的最终结果, 因此无需进行转换. 所以 `finisher` 方法只需返回 `Function` 接口的静态方法 `identity` 函数. 
    

以上三个方法已经足以对流进行顺序归约. 

![-w2280](https://image.fuxiao86.com/14876400532202.jpg)

* 合并两个结果容器: `combiner` 方法

    `combiner` 方法会返回一个供归约操作使用的函数, 它定义了对流的各个子部分进行并行处理时, 各个子部分归约所得的累加器要如何合并. 
    
    有了这第四个方法, 就可以对流进行并行归约了. 它会用到JAVA7中引入的*分支/合并框架*和*Spliterator*抽象. 
    
    ![-w1209](https://image.fuxiao86.com/14876413432867.jpg)

* `characteristics` 方法

    `characteristics` 会返回一个不可变的 `Characteristics` 集合, 它定义了收集器的行为 - 尤其是关于流是否可以并行归约, 以及可以使用那些优化的提示. 
    
    `Characteristics` 是一个包含三个项目的枚举.
    
    * `UNORDERED`: 归约结果不受流中项目的遍历和累积顺序的影响.
    * `CONCURRENT`: `accumulator`函数可以从多个线程同时调用, 且该收集器可以并行归约流. 如果收集器没有标记为 `UNORDERED`, 那它仅在用于无序数据源时才可以并行归约. 
    * `IDENTITY_FINISH`: 这表明完成器方法返回的函数是一个恒等函数, 可以跳过. 这种情况下累加器对象将会直接用作归约过程的最终结果. 这也意味着, 将累加器A不加检查地转换为结果R是安全的.

> `Collections.emptyList()` 获取一个空的 List

小结

* `collect` 是一个终端操作, 它接受的参数时将流中的元素累积到汇总结果的各种方式(称为收集器).
* 预定义收集器包括: 将流元素归约和汇总到一个值, 例如计算最小值, 最大值或平均值.
* 预定义收集器可以用`groupingBy` 对流中元素进行分组, 或用` partitioningBy`进行分区.
* 收集器可以高效地复合起来, 进行多级分组, 分区和归约.
* 可以自定义实现` Collector` 接口中定义的方法来开发自己的收集器.

并行数据处理及性能

* 并行流

    并行流: 是一个把内容分成多个数据块, 并且不同的线程分别处理每个数据块的流.
    
    可以通过对收集源调用` parallelStream` 方法来把集合转为并行流.
    
    * 对流调用 `parallel()` 方法可以转为并行流
    * 对并行流调用` sequential()` 方法可以转为顺序流

    并行流内部使用了默认的` ForkJoinPool`, 它默认的线程数量就是运行机器的处理器数量, 这个值是由` Runtime.getRuntime().availableProcessors()`得到. 但可以通过系统属性: `java.util.concurrent.ForkJoinPool.common.parallelism` 来改变线程池大小.
    
    ```java
    System.setProperty("java.util.concurrent.ForkJoinPool.common.parallelism", 12);
    ```
    
    这是一个全局设置, 因此它将影响代码中所有的并行流. 反过来目前还无法转为某个并行流指定这个值. 一般而言, 让` ForkJoinPool` 的大小等于处理器的数量是个不错的默认值.
    
    > iterate 很难分割成能够独立执行的小块, 因为每次应用这个函数都有依赖前一次应用的结果.

    > 共享可变状态会影响并行流以及并行计算. 所以**避免共享可变状态**
    
    高效的使用并行流
    
    * 如果对并行效率有疑问, 请测试运算时间.
    * 注意装箱拆箱操作. 自动装箱机拆箱会大大降低性能.
    * 有些操作本身在并行流上的性能就比顺序流差. 特别是 `limit` 和 `findFirst` 等依赖于元素顺序的操作. 他们在并行流上执行的代价非常大. `findAny` 会比 `findFirst` 性能好. 可以通过调用 `unordered` 方法来把有序流变成无序流. 对无序并行流调用 `limit` 可能会比单个有序流更高效.
    * 并行成本 = N*Q. N: 要处理的元素总数, Q: 一个元素通过流水线的大致处理成本. Q值越高, 意味着并行流性能好的可能性比较大.
    * 对于较小的数据量, 选择并行流几乎从来都不是一个好的决定. 并行处理少数几个元素的好处抵不上并行化造成的额外开销.
    * 需要考虑流背后的数据结构是否易于分解. 如: AarrayList 的拆分效率比 LinkedList 高的多, 因为前者用不着遍历就可以平均拆分, 而后者必须遍历. 
    * 流自身的特点, 以及流水线中的中间操作修改流的方式, 都可能改变分解过程的性能. 
    * 还需要考虑终端操作中合并步骤的代价高低. 如 `Collector` 中的 `combiner` 方法.

    分支/合并框架
    
    * RecursiveTask<R>/RecursiveAction

        R 是并行化产生的结果类型. 如果任务不返回结果, 则是用 `RecursiveAction`
        
    * Fork/Join 框架的工作窃取技术
    * Spliterator 接口.  可分迭代器. 用来遍历数据源中数据, 但它是为了并行执行而设计的. 

        ```java
        public interface Spliterator<T> {
            boolean tryAdvance(Consumer<? super T> action);
            Spliterator<T> trySplit();
            long estmateSize();
            int characteristics();
        }
        ```
        
        * T 是 Spliterator 遍历的元素的类型
        * tryAdvance 方法的行为类似于普通的 Iterator, 因为它会按顺序一个一个使用 Spliterator 中的元素, 并且如果还有其他元素要遍历就返回 true
        * trySplit 是装为 Spliterator 接口设计的, 因为它可以把一些元素划出去分给第二个 Spliterator( 由该方法返回), 让它们两个并行处理. 
        * Spliterator 通过 estimateSize 方法估计还剩多少元素要遍历
        * characteristics抽象方法, 返回一个 int, 代表Spliterator 本身特性集的编码. 使用 Spliterator 的客户可以使用这些特性来更好地控制和优化它.
        
        ![-w1422](https://image.fuxiao86.com/14876646717073.jpg)




