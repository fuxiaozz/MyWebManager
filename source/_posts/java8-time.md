---
title: Better Java (1)- JDK8中有关时间的操作
date: 2016-10-18 16:37:16
tags: Java
categories: Java
---

## Better Java (1)- JDK8中有关时间的操作

今天读了[Better Java](https://github.com/cxxr/better-java/blob/master/README.zh-cn.md)一文, 之前在项目中有关时间的操作基本上都是使用`Calendar`, 这次学习一下[JDK8有关时间的操作](http://www.oracle.com/technetwork/articles/java/jf14-date-time-2125367.html).

`LocalDate`操作日期, 如年月日, 不包含时分秒. `LocalTime`操作时分秒, 不包含年月日. `LocalDateTime`最为强大, 包含了年月日时分秒. 看内部实现, 其内部包含`LocalDate`和`LocalTime`两个对象, 三个类的用法都差不多.

```java
LocalDateTime timePoint = LocalDateTime.now(); // 当前日期和时间,
System.out.println(timePoint); // 输出: 2016-10-18T16:51:14.334

// 获取年月日时分秒毫秒
System.out.println(timePoint.getYear() + "年"
   + timePoint.getMonthValue() + "月"
   + timePoint.getDayOfMonth() + "日, 星期" + timePoint.getDayOfWeek().getValue() + ","
   + timePoint.getHour() + "时"
   + timePoint.getMinute() + "分"
   + timePoint.getSecond() + "秒"
   + timePoint.getNano() + "毫秒");
```

如何生成特定日期的? 可通过 `LocalDateTime.of()`类方法生成, 或者通过已`with`及`plus`开头的实例方法来生成. `with`开头的实例方法根据参数生成指定日期, `plus`开头的实例方法根据参数推断日期.

```java
// 生成一个指定日期: 2015年10月10日0点0分0秒
LocalDateTime timePoint = LocalDateTime.of(2016, 10, 10, 0, 0, 0);
System.out.println( "timePoint = " + timePoint); // 输出: timePoint = 2016-10-10T00:00

// 通过plus开头的实例方法, 推断日期, 天数减8, 小时加2, 周减1
LocalDateTime yetAnther = timePoint.plusDays(-8).plusHours(2).plus(-1, ChronoUnit.WEEKS);
System.out.println("yetAnther = " + yetAnther); // 输出: yetAnther = 2016-09-25T02:00

// 可以通过具体逻辑生成指定日期, plus也有如下方法
yetAnther = timePoint.with(temporal
   -> temporal.plus(-1, ChronoUnit.MONTHS).with(ChronoField.YEAR, 2015));
System.out.println(yetAnther); // 输出: yetAnther = 2015-09-10T00:00
```

> `LocalDateTime`, `LocalDate`, `LocalTime`都是不可变对象, 也就是说通过它们的API得到的时间都是不会改变自己的值, 都是用自身的时间点计算得到的结果. 如代码最后一个方法, 是根据`timePoint`对象生成的时间`2016-10-10 00:00:00`生成指定日期的.

有时我们需要不同精度的时间, 比如, 我只需要年月, 不需要日时分秒, 怎么办?

```java
// 转换到所需的时间精度
timePoint = LocalDateTime.of(2016, 9, 12, 23, 59, 59, 3);
System.out.println("时间 : " + timePoint);
LocalDateTime truncatedTime = timePoint.truncatedTo(ChronoUnit.DAYS);
System.out.println("时间精度到天: " + truncatedTime);
truncatedTime = timePoint.truncatedTo(ChronoUnit.HOURS);
System.out.println("时间精度到小时: " + truncatedTime);
truncatedTime = timePoint.truncatedTo(ChronoUnit.MINUTES);
System.out.println("时间精度到分钟: " + truncatedTime);
truncatedTime = timePoint.truncatedTo(ChronoUnit.SECONDS);
System.out.println("时间精度到秒: " + truncatedTime);
truncatedTime = timePoint.truncatedTo(ChronoUnit.NANOS);
System.out.println("时间精度到毫秒: " + truncatedTime);
```

> 时间精度最大到天, 不能在大于此精度. 否则会抛出异常: `UnsupportedTemporalTypeException: Unit is too large to be used for truncation`

有时我们会对时间做时区处理, 根据本地时间, 推算某个时区的时间, 怎么办? 这里主要用到两个对象: `OffsetDateTime`和`ZoneOffset`.

使用`OffsetDateTime`获取时区时间, 使用方法与`localDateTaime`类似. 使用`ZoneOffset`对象生成时区. 两个对象配合, 即可获取我们想要的时区时间. 下面有两个重要的方法`withOffsetSameInstant`和`withOffsetSameLocal`

```java
OffsetDateTime time = OffsetDateTime.now(); // 这个是系统当前时间
System.out.println("当前时区时间 = " + time);

time = OffsetDateTime.of(2016, 10, 10, 12, 59, 59, 0, ZoneOffset.of("+08:00"));
System.out.println("指定时区的指定时间 = " + time);

ZoneOffset offset = ZoneOffset.of("+09:00"); // 生成指定时区

// 用自身时间计算指定时区的时间.
OffsetDateTime offsetTime1 = time.withOffsetSameInstant(offset);

// offsetTime1 = 2016-10-10T13:59:59+09:00
System.out.println("offsetTime1 = " + offsetTime1);

// 将自身时间的时区更换为指定时区, 时间不变
OffsetDateTime offsetTime2 = time.withOffsetSameLocal(offset);

// offsetTime2 = 2016-10-10T12:59:59+09:00
System.out.println("offsetTime2 = " + offsetTime2);

// API与LocalDateTime对象类似
OffsetDateTime offsetTime3 = offsetTime2.withHour(3).plusSeconds(2);
System.out.println("offsetTime3 = " + offsetTime3);
```

JDK8还提供了两个非常方便的对象, 让我们来计算时间. `Period`和`Duration`. 根据这两个参数非常方便推算出我们想要的时间. `Period`用于推算年月日, 最低精度到天, `Duration`用于推算天时分秒, 最低精度到毫秒.

```java
Period period = Period.of(3, 2, 1); // 3年, 2月, 1天
LocalDateTime now = LocalDateTime.now();
LocalDateTime periodTime = now.plus(period);
System.out.println("now = " + now);
System.out.println("periodTime = " + periodTime);

// Durations
Duration duration = Duration.ofSeconds(3, 5);
LocalDateTime durationTime = now.plus(duration);
System.out.println("dutationTime = " + durationTime);
```






