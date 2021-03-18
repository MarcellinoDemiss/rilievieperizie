RILIEVI E PERIZIE PROJECT MARCELLINO DEMIS
==========================================
App Project, default user: user/user
------------------------------------
Appena si entra si trova una pagina di Login, una volta inserito l'Username possono avvenire due cose:
* L'utente effettua il primo accesso
  In questo caso viene reindirizzato su una pagina in cui
  deve reinserire la vecchia password generata dal server,
  ed una nuova password personale.
* L'utente ha già effettuato accessi
  In questo caso basterà inserire la password 
  precedentemente impostata

-> index page
Una volta loggati ci si trova una schermata in cui si può scattare una o più foto, cliccandoci sopra ci sono i relativi dati, e si possono uploadare sul server di Atlas. In alto a sinistra c'è un pulsante di Logout.

Web Project, default user: admin/admin
--------------------------------------
Appena si entra si trova una pagina di Login, una volta inserito l’Username ci si trova nella pagina di default, in alto a sinistra ci sono due pulsanti:
* uno per creare un nuovo utente
* uno per visualizzare la lista degli utenti attualmente registrati sul server

Al centro c'è un box con un Google Maps, si trovano i marker, cliccandoli si possono vedere le informazioni per ogni foto.
I pulsanti in alto servono per inserire eventualmente delle note e visualizzare il percorso con relativa distanza e durata.

Atlas link: mongodb+srv://MarcellinoDemis:p4ssW0rd@cluster0.j5izu.mongodb.net/test?authSource=admin&replicaSet=atlas-11xy39-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true

Heroku link: https://marcellino-demis-app.herokuapp.com/
