if(!self.define){let e,s={};const i=(i,a)=>(i=new URL(i+".js",a).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(a,n)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let c={};const o=e=>i(e,t),r={module:{uri:t},exports:c,require:o};s[t]=Promise.all(a.map((e=>r[e]||o(e)))).then((e=>(n(...e),c)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"86ec97b28d11239cad7f2de8b7d03519"},{url:"/_next/static/VlkgVboTJiOK42_UBDngI/_buildManifest.js",revision:"bbc879e0f778e6addf62b95e2378ce77"},{url:"/_next/static/VlkgVboTJiOK42_UBDngI/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/0e5ce63c-882948622c79ca53.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/120-ff34c23b493be545.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/178-a22108cbad572e67.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/212-3921d5bbe168a998.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/215-20487c3441402e65.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/231-942f9895fe181c61.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/426-672cce4e3e890da7.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/4bd1b696-d1099a3105d2b1df.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/522-4a0c1491c154608a.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/646-4b385ecf93125bf3.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/648-7b9c5ee3ba3397cd.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/794-8ee889c342827e45.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/80-dbcc2f3dffe7a9af.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/859-73b94cea410aeb48.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/934-10e37f9a53aa7915.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/_not-found/page-f792fe5eaeca100c.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/admin/topics/page-4f2e08049952e93a.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/auth/google/callback/route-b5b35f994b5e1921.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/auth/google/route-c1b16d8ccb7f764d.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/auth/login/route-f7747b4345166034.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/auth/logout/route-dda43e182b2912c3.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/auth/refresh/route-07c32233e073a510.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/auth/register/route-bb6fd5b701485cd9.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/baheth/speakers/route-13e7f8cdee941efc.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/highlights/route-c0aa7c7627bd7bc0.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/notes/%5BnoteId%5D/route-a84e244f09eddb64.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/notes/route-cc790f718fcefed9.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/notes/tags/route-fe6a41b77cc118f0.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/profile/route-34b42cb0823fd5c8.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/reading-progress/route-639b6bd01e694df6.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/api/test/route-acf5f8c12b632650.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/auth/callback/page-36405b9e5707fdfc.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/auth/register/page-d26c9056d8b24450.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/auth/signin/page-a6dd55799e0ae7c9.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/layout-0effc0f298c10584.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/page-04f79085bdd95b47.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/playlists/%5BplaylistId%5D/lessons/%5BlessonId%5D/page-e1ceb7b3d9261042.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/playlists/%5BplaylistId%5D/page-cf0391289b270fba.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/playlists/page-ea53a2c6fe94b6d9.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/app/speakers/page-ca89ff6a9dd8252f.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/c16f53c3-40f4f73ef9406c9a.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/framework-843b5a3475939f8c.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/main-0c53bc2a8382036c.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/main-app-efa20e3dc5dc937a.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/pages/_app-037b5d058bd9a820.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/pages/_error-6ae619510b1539d6.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-fbf44f0de88af1d9.js",revision:"VlkgVboTJiOK42_UBDngI"},{url:"/_next/static/css/5affba41c9837ca3.css",revision:"5affba41c9837ca3"},{url:"/_next/static/css/6d38bcbb09013bc0.css",revision:"6d38bcbb09013bc0"},{url:"/_next/static/css/c175938d7ea487cc.css",revision:"c175938d7ea487cc"},{url:"/_next/static/media/0a61324d85234ed0-s.woff2",revision:"032f467b48f190dd24b58e3852e015bb"},{url:"/_next/static/media/0f9bfbb4dbb98158-s.p.woff2",revision:"043eb4ce138dad557ed233456cacd3d6"},{url:"/_next/static/media/149bd79232cbc8b2-s.woff2",revision:"44660417d3be08811180598d6c8679d3"},{url:"/_next/static/media/1d49010393853990-s.p.woff2",revision:"1e6dd67564000809954ef47899b329a3"},{url:"/_next/static/media/1ebb550cd0a67fc6-s.p.woff2",revision:"9dedb65bba3275c44f2c7687749291ce"},{url:"/_next/static/media/24b539371b989971-s.woff2",revision:"b8711551bc9afce188a0db180af95c34"},{url:"/_next/static/media/420b3da95f5fbf98-s.p.woff2",revision:"5823b2b830d826bb23afeed418a7f3ac"},{url:"/_next/static/media/50bd4b70cb1c49ea-s.woff2",revision:"9a200af00e8d01236114d2b43535f892"},{url:"/_next/static/media/63a79a6cf340c5d2-s.p.woff2",revision:"cd125f89bc159f5de2e48e3425aa35fa"},{url:"/_next/static/media/6d87047c78b383ca-s.p.woff2",revision:"0dffb2867335d294354956a19106780a"},{url:"/_next/static/media/6f5bdea6349d3541-s.woff2",revision:"f0478f62e1c6a43cac2f657088a6707a"},{url:"/_next/static/media/a7017400c9fd40b6-s.p.woff2",revision:"ed1b6576a1e1635d91864af669031c6a"},{url:"/_next/static/media/b291a8f6f2fe00f1-s.woff2",revision:"d4a98f951959bd25ecad83e049f05950"},{url:"/_next/static/media/b9817c66466e8cbc-s.woff2",revision:"5017bda8ca1227f73200ed3623b01e81"},{url:"/_next/static/media/ce401babc0566bc1-s.woff2",revision:"ae2ff29be66867a6d935af992ba8001b"},{url:"/_next/static/media/dd994fbf464986f0-s.p.woff2",revision:"69e22700847efcd4251ca0ca1f836515"},{url:"/_next/static/media/e97026df054cf2a3-s.woff2",revision:"fc002557f215681e64f2ba19c2fc08f3"},{url:"/_next/static/media/ea97c21fd1bb9826-s.woff2",revision:"19d62ac06227b5fb5102bf2184982ef9"},{url:"/_next/static/media/f15f45d13243c643-s.woff2",revision:"fc627dfefb6dcf952a535c2316b0e0fe"},{url:"/apple-touch-icon.png",revision:"f5af0de9a12d9aca6936cbf1233711e4"},{url:"/favicon-48x48.png",revision:"8a021c87ac9784f32661cf1ac03003e6"},{url:"/favicon.ico",revision:"5e385cb43446f7b8bd414456e97cd7ac"},{url:"/favicon.svg",revision:"7a0c5fbd75a2861a3295066e46625fa0"},{url:"/logo.webp",revision:"804e637f88be96ae8f5fecde1809d9c6"},{url:"/manifest.json",revision:"00ed6b362c1729a34d310a8ed61420d5"},{url:"/offline.html",revision:"a64f42722765ba2dea679343d4e0bf8e"},{url:"/web-app-manifest-192x192.png",revision:"ea253d94e565215e2ae56a1819d8a971"},{url:"/web-app-manifest-512x512.png",revision:"55066c79776b3a52149557b364e11df5"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:i,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
