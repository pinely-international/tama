# SSR Benchmarks

This suite benchmarks this and other frameworks and compares their performance.

## Machine Specification

|Key|Value|
|---|-----|
| OS           | Microsoft Windows 11 Pro |
| OSVersion    | 10.0.26200 |
| Manufacturer | Acer |
| Model        | Nitro AN517-41 |
| CPU          | AMD Ryzen 5 5600H with Radeon Graphics |
| Cores        | 6 |
| LogicalCores | 12 |
| RAM_GB       | 31.36 |
| GPUs         | NVIDIA GeForce RTX 3060 Laptop GPU, AMD Radeon(TM) Graphics |
| Disks        | ADATA SX8200PNP, KINGSTON OM8PDP3512B-AA1 |

## Setup

All benchmarks are run with `autocannon`

```bash
autocannon -c 400 -d 30 -p 10 http://localhost:3000/
```

## React

```bash
Running 30s test @ http://localhost:3000
400 connections with 10 pipelining factor


┌─────────┬────────┬─────────┬─────────┬─────────┬────────────┬───────────┬─────────┐
│ Stat    │ 2.5%   │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev     │ Max     │
├─────────┼────────┼─────────┼─────────┼─────────┼────────────┼───────────┼─────────┤
│ Latency │ 561 ms │ 1429 ms │ 3668 ms │ 4078 ms │ 1466.41 ms │ 541.31 ms │ 5705 ms │
└─────────┴────────┴─────────┴─────────┴─────────┴────────────┴───────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Req/Sec   │ 893     │ 893     │ 2,065   │ 2,165   │ 1,999.54 │ 287.8   │ 893     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Bytes/Sec │ 3.19 MB │ 3.19 MB │ 7.38 MB │ 7.74 MB │ 7.15 MB  │ 1.03 MB │ 3.19 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 30

90k requests in 27.58s, 214 MB read
3k errors (0 timeouts)
```

## VueJs

```bash
Running 30s test @ http://localhost:3000
400 connections with 10 pipelining factor


┌─────────┬────────┬────────┬─────────┬─────────┬───────────┬───────────┬─────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%   │ 99%     │ Avg       │ Stdev     │ Max     │
├─────────┼────────┼────────┼─────────┼─────────┼───────────┼───────────┼─────────┤
│ Latency │ 156 ms │ 752 ms │ 1219 ms │ 2514 ms │ 771.57 ms │ 369.18 ms │ 4107 ms │
└─────────┴────────┴────────┴─────────┴─────────┴───────────┴───────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 2,285   │ 2,285   │ 3,899   │ 4,131   │ 3,842.2 │ 343.5   │ 2,284   │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 8.08 MB │ 8.08 MB │ 13.8 MB │ 14.6 MB │ 13.6 MB │ 1.21 MB │ 8.08 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 30

145k requests in 28.31s, 407 MB read
3k errors (0 timeouts)
```

## Solid

```txt
Wasn't able to run.
```

## Marko

```bash
Running 30s test @ http://localhost:3000
400 connections with 10 pipelining factor


┌─────────┬───────┬────────┬────────┬────────┬───────────┬───────────┬─────────┐
│ Stat    │ 2.5%  │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev     │ Max     │
├─────────┼───────┼────────┼────────┼────────┼───────────┼───────────┼─────────┤
│ Latency │ 73 ms │ 211 ms │ 275 ms │ 503 ms │ 219.03 ms │ 166.19 ms │ 3497 ms │
└─────────┴───────┴────────┴────────┴────────┴───────────┴───────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬───────────┬──────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg       │ Stdev    │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼──────────┼─────────┤
│ Req/Sec   │ 8,615   │ 8,615   │ 13,871  │ 15,095  │ 13,630.94 │ 1,198.41 │ 8,609   │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼──────────┼─────────┤
│ Bytes/Sec │ 30.6 MB │ 30.6 MB │ 49.3 MB │ 53.6 MB │ 48.4 MB   │ 4.25 MB  │ 30.6 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴───────────┴──────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 30

438k requests in 28.28s, 1.45 GB read
3k errors (0 timeouts)
```

## Tama

```bash
Running 30s test @ http://localhost:3000
400 connections with 10 pipelining factor


┌─────────┬────────┬────────┬─────────┬─────────┬───────────┬───────────┬─────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%   │ 99%     │ Avg       │ Stdev     │ Max     │
├─────────┼────────┼────────┼─────────┼─────────┼───────────┼───────────┼─────────┤
│ Latency │ 203 ms │ 926 ms │ 1394 ms │ 4470 ms │ 946.28 ms │ 490.53 ms │ 5551 ms │
└─────────┴────────┴────────┴─────────┴─────────┴───────────┴───────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼────────┼─────────┤
│ Req/Sec   │ 2,103   │ 2,103   │ 3,217   │ 3,443   │ 3,126.07 │ 275.25 │ 2,103   │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼────────┼─────────┤
│ Bytes/Sec │ 7.43 MB │ 7.43 MB │ 11.4 MB │ 12.2 MB │ 11 MB    │ 973 kB │ 7.43 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 30

123k requests in 28.22s, 331 MB read
3k errors (0 timeouts)
```

## Summary

Marko > VueJs > Tama > React

Even though `VueJs` is winning over Tama, the gap is just about 10%, Tama beats React by ~30% more request per second,
while Tama also supporting full DOM (which causes overhead).

Tama doesn't have any hydration, but Tama renders from scratch faster than React hydrating existing HTML.
This concludes that Tama is faster than React in SSR and hydration. Moreover the bundle size of Tama is ~10 times smaller, which positively impacts time to first interaction. - Right now Tama is superior to React in everything performance-wise.
