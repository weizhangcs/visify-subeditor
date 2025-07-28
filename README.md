# Aimu

## Environment

```js
Node.js >= 18.0.0
```

## Install Dependencies

```base
npm install
```

If installing dependencies using `npm` fails, delete the `node_modules` folder and `package-lock.json`, and then install using `yarn`.

```base
yarn install
```

## About `.env` File

By default, `.env` uses the test `API`, please fill in your own `API`. If the user fills in the `API` option on the page, the user's option will be used first.

## Response Headers

In order to use FFmpeg on the homepage, the default homepage starts with the following response headers:

```js
'Cross-Origin-Opener-Policy': 'same-origin'
'Cross-Origin-Embedder-Policy': 'require-corp'
```

But the page will not work if it introduces a third-party `iframe` Or `non-same-origin` resources. Then you can delete the response headers of the two homepages in the `nuxt.config.ts`.

```js
nitro.routeRules['/'].headers;
```

## CDN Resources

Because web pages need to load some relatively large resources, which may cause excessive traffic on your server, it is recommended to put some larger files on other resource servers. Below are two directories with large file sizes:

```
public/static/ffmpeg
public/static/fonts
```

After placing the above three directories on the resource server, modify the configuration file:

```
config/PATH.js
```

As shown below, but please note the cross-domain issue

```js
export const PATH = {
  FONTS: 'https://cdn.aimu.app/static/fonts',
  FFMPEG: 'https://cdn.aimu.app/static/ffmpeg',
};
```
