if(!self.define){let e,s={};const i=(i,t)=>(i=new URL(i+".js",t).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(t,a)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(s[c])return;let n={};const r=e=>i(e,c),o={module:{uri:c},exports:n,require:r};s[c]=Promise.all(t.map((e=>o[e]||r(e)))).then((e=>(a(...e),n)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"b5634ba937ed53540d228045a37cd43b"},{url:"/_next/static/8hMCg3lJsQ_XDHEtiIEr0/_buildManifest.js",revision:"8cf2031998a4ec12aaebcc3be1e59877"},{url:"/_next/static/8hMCg3lJsQ_XDHEtiIEr0/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/0e5ce63c-7c72980ad3be9759.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/1859-5286686a13369734.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/231-942f9895fe181c61.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/2456-b6e206acdec45102.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/2950-15a8ebe61a0dadc0.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/4543-a707505dd3016948.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/4646-c3fefeeccfdc027a.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/4bd1b696-12d2b3d80c583dbf.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/5073-3bc50926ff10b336.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/5137-9481d31c7adff1fe.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/6215-6f1f9d8be5e36c2d.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/6648-cb6d608958c8100f.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/7212-3a2f79faac134b02.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/8080-5fe505f69814ad3a.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/8426-d56c5a3a727eaa8e.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/914-3d9b561fbc97adcd.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/_not-found/page-45e6cb57a8d6b2c0.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/admin/topics/page-1232358de9ca8e43.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/auth/google/callback/route-6fde56e6f9cb4fb3.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/auth/google/route-3b4960b27c96ad3c.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/auth/login/route-6cd54036d72623b4.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/auth/logout/route-a172c62eed96fb36.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/auth/refresh/route-183c4c24d54fc906.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/auth/register/route-290371737655496b.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/baheth/speakers/route-eaff44e78426072f.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/highlights/route-fc0a73117cca3698.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/notes/%5BnoteId%5D/route-e81181c5f31cbda0.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/notes/route-53c6e1a2fef3eb04.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/notes/tags/route-48a38f70b4048ca3.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/profile/route-db28e50b05181110.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/reading-progress/route-8ce306f0822ddff1.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/api/test/route-f1d83b9a2e4152dd.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/auth/callback/page-b5f0f06c4a80239a.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/auth/register/page-459b476ba4463762.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/auth/signin/page-17864f2845f84c27.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/layout-8c0fa8fe2d18e7f0.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/page-282994bab5f07407.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/speakers/page-ffe70cac0df7463e.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/topics/%5BtopicId%5D/%5BlessonId%5D/exercise/page-dfcaa02ec19cc40d.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/topics/%5BtopicId%5D/%5BlessonId%5D/page-14fa0dc546ca9160.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/topics/%5BtopicId%5D/page-65216a585228583b.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/app/topics/page-2de8e9c11ef93d48.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/c16f53c3-7be413bd3f89f2cb.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/framework-94ed76a1ceea2ffe.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/main-735cdee1f6a9bcb5.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/main-app-5918fb4f0b0f59af.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/pages/_app-f870474a17b7f2fd.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-93c1e1f750cb9179.js",revision:"8hMCg3lJsQ_XDHEtiIEr0"},{url:"/_next/static/css/6d38bcbb09013bc0.css",revision:"6d38bcbb09013bc0"},{url:"/_next/static/css/acd0350a4c0912cc.css",revision:"acd0350a4c0912cc"},{url:"/_next/static/css/c175938d7ea487cc.css",revision:"c175938d7ea487cc"},{url:"/_next/static/media/0a61324d85234ed0-s.woff2",revision:"032f467b48f190dd24b58e3852e015bb"},{url:"/_next/static/media/0f9bfbb4dbb98158-s.p.woff2",revision:"043eb4ce138dad557ed233456cacd3d6"},{url:"/_next/static/media/149bd79232cbc8b2-s.woff2",revision:"44660417d3be08811180598d6c8679d3"},{url:"/_next/static/media/1d49010393853990-s.p.woff2",revision:"1e6dd67564000809954ef47899b329a3"},{url:"/_next/static/media/1ebb550cd0a67fc6-s.p.woff2",revision:"9dedb65bba3275c44f2c7687749291ce"},{url:"/_next/static/media/24b539371b989971-s.woff2",revision:"b8711551bc9afce188a0db180af95c34"},{url:"/_next/static/media/420b3da95f5fbf98-s.p.woff2",revision:"5823b2b830d826bb23afeed418a7f3ac"},{url:"/_next/static/media/50bd4b70cb1c49ea-s.woff2",revision:"9a200af00e8d01236114d2b43535f892"},{url:"/_next/static/media/63a79a6cf340c5d2-s.p.woff2",revision:"cd125f89bc159f5de2e48e3425aa35fa"},{url:"/_next/static/media/6d87047c78b383ca-s.p.woff2",revision:"0dffb2867335d294354956a19106780a"},{url:"/_next/static/media/6f5bdea6349d3541-s.woff2",revision:"f0478f62e1c6a43cac2f657088a6707a"},{url:"/_next/static/media/a7017400c9fd40b6-s.p.woff2",revision:"ed1b6576a1e1635d91864af669031c6a"},{url:"/_next/static/media/b291a8f6f2fe00f1-s.woff2",revision:"d4a98f951959bd25ecad83e049f05950"},{url:"/_next/static/media/b9817c66466e8cbc-s.woff2",revision:"5017bda8ca1227f73200ed3623b01e81"},{url:"/_next/static/media/ce401babc0566bc1-s.woff2",revision:"ae2ff29be66867a6d935af992ba8001b"},{url:"/_next/static/media/dd994fbf464986f0-s.p.woff2",revision:"69e22700847efcd4251ca0ca1f836515"},{url:"/_next/static/media/e97026df054cf2a3-s.woff2",revision:"fc002557f215681e64f2ba19c2fc08f3"},{url:"/_next/static/media/ea97c21fd1bb9826-s.woff2",revision:"19d62ac06227b5fb5102bf2184982ef9"},{url:"/_next/static/media/f15f45d13243c643-s.woff2",revision:"fc627dfefb6dcf952a535c2316b0e0fe"},{url:"/apple-touch-icon.png",revision:"f5af0de9a12d9aca6936cbf1233711e4"},{url:"/favicon-48x48.png",revision:"8a021c87ac9784f32661cf1ac03003e6"},{url:"/favicon.ico",revision:"5e385cb43446f7b8bd414456e97cd7ac"},{url:"/favicon.svg",revision:"368ca4cf00c174d9fe3c32633f818983"},{url:"/logo.webp",revision:"804e637f88be96ae8f5fecde1809d9c6"},{url:"/manifest.json",revision:"00ed6b362c1729a34d310a8ed61420d5"},{url:"/offline.html",revision:"a64f42722765ba2dea679343d4e0bf8e"},{url:"/web-app-manifest-192x192.png",revision:"ea253d94e565215e2ae56a1819d8a971"},{url:"/web-app-manifest-512x512.png",revision:"55066c79776b3a52149557b364e11df5"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:i,state:t})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
