# Demos

Use `new` as the starter when creating another demo inside this repository.

```bash
cd demos
cp -R new my-demo
cd my-demo
bun install
bun dev
```

The starter uses the local Tama pack from this repository.
If you want to point a copied demo at the published stable package instead, replace `@denshya/tama` with `@denshya/proton` and update `jsxImportSource` to match.# Demos

## Creating new one

Simply call `cp -R new newDemoName` in this folder,
it will copy starter demo project into `newDemoName` folder,
where you can start describing your demo.