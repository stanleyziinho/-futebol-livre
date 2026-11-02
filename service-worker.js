const CACHE_NAME =
  "stanley-sports-v9";


const APP_SHELL = [

  "/-futebol-livre/",
  "/-futebol-livre/index.html",
  "/-futebol-livre/manifest.json",
  "/-futebol-livre/icon.svg"

];


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

    );

  }
);


self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
      .keys()
      .then(
        keys => {

          return(
            Promise.all(

              keys.map(
                key => {

                  if(
                    key
                    !==
                    CACHE_NAME
                  ){

                    return(
                      caches.delete(
                        key
                      )
                    );

                  }

                }
              )

            )
          );

        }
      )
      .then(
        () =>
          self.clients.claim()
      )

    );

  }
);


self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;


    if(
      request.method
      !==
      "GET"
    ){
      return;
    }


    const url =
      new URL(
        request.url
      );


    if(
      request.mode
      ===
      "navigate"
    ){

      event.respondWith(

        fetch(
          request,
          {
            cache:"no-store"
          }
        )

        .then(
          response => {

            const clone =
              response.clone();


            caches
            .open(
              CACHE_NAME
            )
            .then(
              cache => {

                cache.put(
                  request,
                  clone
                );

              }
            );


            return response;

          }
        )

        .catch(
          () => {

            return(
              caches.match(
                "/-futebol-livre/index.html"
              )
            );

          }
        )

      );


      return;

    }


    if(
      url.origin
      ===
      self.location.origin
    ){

      event.respondWith(

        fetch(
          request,
          {
            cache:"no-store"
          }
        )

        .then(
          response => {

            const clone =
              response.clone();


            caches
            .open(
              CACHE_NAME
            )
            .then(
              cache => {

                cache.put(
                  request,
                  clone
                );

              }
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


    event.respondWith(
      fetch(
        request
      )
    );

  }
);


self.addEventListener(
  "message",
  event => {

    if(
      event.data
      ===
      "SKIP_WAITING"
    ){

      self.skipWaiting();

    }

  }
);