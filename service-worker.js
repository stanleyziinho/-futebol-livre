/*
=========================================================
STANLEY SPORTS
SERVICE WORKER V54
=========================================================
*/

const CACHE_NAME =
  "stanley-sports-v568-20261106";


const APP_SHELL = [

  "/-futebol-livre/",

  "/-futebol-livre/index.html",

  "/-futebol-livre/manifest.json",

  "/-futebol-livre/stanley-sports-logo.png",

  "/-futebol-livre/stanley-sports-icon-192.png",

  "/-futebol-livre/stanley-sports-icon-512.png",

  "/-futebol-livre/stanley-sports-apple-180.png"

];


/* INSTALL */

self.addEventListener(
  "install",
  event => {

    self.skipWaiting();


    event.waitUntil(

      caches
        .open(
          CACHE_NAME
        )
        .then(
          cache =>
            cache.addAll(
              APP_SHELL
            )
        )
        .catch(
          error =>
            console.log(
              "Cache inicial:",
              error
            )
        )

    );
  }
);


/* ACTIVATE */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(
          keys =>

            Promise.all(

              keys.map(
                key => {

                  if(
                    key !==
                    CACHE_NAME
                  ){

                    return caches.delete(
                      key
                    );
                  }

                }
              )

            )

        )
        .then(
          () =>
            self.clients.claim()
        )

    );
  }
);


/* FETCH */

self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;


    if(
      request.method !==
      "GET"
    ){

      return;
    }


    const url =
      new URL(
        request.url
      );


    /*
    NÃO CACHEAR A API
    DO WORKER.
    */

    if(
      url.hostname.includes(
        "workers.dev"
      )
    ){

      event.respondWith(
        fetch(request)
      );

      return;
    }


    /*
    NÃO CACHEAR ESPN.
    */

    if(
      url.hostname.includes(
        "espn.com"
      )
      ||
      url.hostname.includes(
        "api.espn"
      )
    ){

      event.respondWith(
        fetch(request)
      );

      return;
    }


    /*
    NAVEGAÇÃO:
    SEMPRE TENTA A INTERNET
    PRIMEIRO.
    */

    if(
      request.mode ===
      "navigate"
    ){

      event.respondWith(

        fetch(request)

          .then(
            response => {

              const copy =
                response.clone();


              caches
                .open(
                  CACHE_NAME
                )
                .then(
                  cache =>
                    cache.put(
                      request,
                      copy
                    )
                );


              return response;
            }
          )

          .catch(
            async () => {

              return (
                await caches.match(
                  "/-futebol-livre/index.html"
                )
              )
              ||
              await caches.match(
                "/-futebol-livre/"
              );

            }
          )

      );


      return;
    }


    /*
    ARQUIVOS LOCAIS:
    NETWORK FIRST
    */

    if(
      url.origin ===
      self.location.origin
    ){

      event.respondWith(

        fetch(request)

          .then(
            response => {

              const copy =
                response.clone();


              caches
                .open(
                  CACHE_NAME
                )
                .then(
                  cache =>
                    cache.put(
                      request,
                      copy
                    )
                );


              return response;
            }
          )

          .catch(
            () =>
              caches.match(
                request
              )
          )

      );


      return;
    }


    /*
    RECURSOS EXTERNOS:
    DIRETO NA REDE.
    */

    event.respondWith(
      fetch(request)
    );

  }
);


/* FORÇAR ATUALIZAÇÃO */

self.addEventListener(
  "message",
  event => {

    if(
      event.data ===
      "SKIP_WAITING"
    ){

      self.skipWaiting();
    }
  }
);