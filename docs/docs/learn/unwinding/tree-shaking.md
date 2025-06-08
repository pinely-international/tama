# Tree Shaking

The minimal size of the library ~5kb if you use `WebInflator`, if you don't use anything it should be 0.
So the size adds up only if you import something specific and ideally there won't be any chained imports that will cost too much.

The size of each import is pretty low so even using everything will result in less than 30kb (currently this is a cap).
