# SmashApp
 
I created this app for the purpose of having an easier time seeding local tournaments for Super Smash Bros. Ultimate. This serves as a good starting point for the seeding and should only require a little manual tweaking, rather than doing it all by hand.

## Different Technologies used

- Vue (Client)

- Vuetify (Client)

- Express (Web Server)

- Apollo Server/GraphQL (API)

- Mongoose/MongoDB (DB)

- Glicko 2 algorithm for ranking (Code by Me https://github.com/Googlrr/Glicko2-JS, Algorithm from http://www.glicko.net/glicko.html)


## Future plans for project

Right now it works, but it isn't pretty. The plan for this was never to make it publicly facing, rather it would only be used by a few of us locally. I'll likely re-start this as another project where I build it better from the ground up. Looking back there's a few things I don't like. Likely to change: 

- Nuxt.js instead of plain Vue. SSR would be helpful to keep things performant. 

- Scrap Vuetify, use Tailwind.js to style components instead. Vuetify ended up being a lot heavier than I expected and doesn't seem to run well on mobile. 

- PostgreSQL instead of MongoDB. The data here is VERY relational and structuring this with Mongo felt like a workaround rather than a solution.

