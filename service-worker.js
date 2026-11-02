const CACHE_NAME = "futebol-livre-v1";

const APP_SHELL = [
  "/-futebol-livre/",
  "/-futebol-livre/index.html",
  "/-futebol-livre/manifest.json",
  "/-futebol-livre/icon.svg"
];


/* ===========================
   INSTALAÇÃO
=========================== */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(cache => {

          return cache.addAll(
            APP_SHELL
          );

        })

    );

    self.skipWaiting();

  }
);


/* ===========================
   ATIVAÇÃO
=========================== */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(keys => {

          return Promise.all(

            keys.map(key => {

              if(
                key !== CACHE_NAME
              ){

                return caches.delete(
                  key
                );

              }

            })

          );

        })

    );

    self.clients.claim();

  }
);


/* ===========================
   FETCH
=========================== */

self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;


    if(
      request.method !== "GET"
    ){
      return;
    }


    const url =
      new URL(
        request.url
      );


    /*
      APIs externas e sites externos:
      sempre buscar online.
    */

    if(
      url.origin !== self.location.origin
    ){

      event.respondWith(
        fetch(request)
      );

      return;

    }


    /*
      Navegação:
      tenta internet primeiro.
      Se estiver offline,
      usa o cache.
    */

    if(
      request.mode === "navigate"
    ){

      event.respondWith(

        fetch(request)

          .then(response => {

            const copy =
              response.clone();


            caches
              .open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  request,
                  copy
                );

              });


            return response;

          })

          .catch(async () => {

            const cached =
              await caches.match(
                request
              );


            if(
              cached
            ){
              return cached;
            }


            return caches.match(
              "/-futebol-livre/index.html"
            );

          })

      );

      return;

    }


    /*
      Demais arquivos locais:
      cache primeiro.
    */

    event.respondWith(

      caches
        .match(request)

        .then(cached => {

          if(
            cached
          ){
            return cached;
          }


          return fetch(request)

            .then(response => {

              if(
                !response
                ||
                response.status !== 200
              ){

                return response;

              }


              const copy =
                response.clone();


              caches
                .open(CACHE_NAME)
                .then(cache => {

                  cache.put(
                    request,
                    copy
                  );

                });


              return response;

            });

        })

    );

  }
);


/* ===========================
   ATUALIZAÇÃO MANUAL
=========================== */

self.addEventListener(
  "message",
  event => {

    if(
      event.data === "SKIP_WAITING"
    ){

      self.skipWaiting();

    }

  }
);
